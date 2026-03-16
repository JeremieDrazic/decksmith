# ADR-0010: Link Sharing and Meta Tags

**Last Updated:** 2026-01-11 **Status:** Active **Context:** Decksmith

---

## Context

Users want to **share decks via social media and messaging apps** (WhatsApp, Discord, Twitter,
etc.). When a deck link is shared, the preview should show **useful information** (deck name, card
count, format) instead of a generic "Decksmith" preview.

**Example use cases:**

1. **Tournament sharing**: "Check out my Standard deck for FNM" → Friend clicks link → sees "Goblin
   Aggro (60 cards, Standard)"
2. **Deck feedback**: Player posts link in Discord → Preview shows deck name + format → Others can
   quickly identify deck
3. **Collection sharing**: "My collection is worth $5,000!" → Preview shows collection size + value

**Key constraints:**

1. **No community features** in Decksmith (no built-in social feed, comments, etc.)
2. **Users share via external apps** (WhatsApp, Discord, Twitter)
3. **No full SSR (Server-Side Rendering)**: Next.js is overkill, violates architecture (Vite SPA is
   simpler)
4. **Deep linking for future native app**: `decksmith.app/decks/:id` should open native app if
   installed, web if not

**Question:** How do we provide nice link previews without full SSR?

---

## Current Decision

We implement a **hybrid meta tag strategy**:

1. **Static meta tags** in SPA shell (generic fallbacks)
2. **Dynamic meta endpoint** (`/api/decks/:id/meta`) returns minimal HTML with Open Graph tags
3. **No full SSR** (Vite SPA remains unchanged, only add meta endpoint)

### Architecture

**Web app (Vite SPA):**

```html
<!-- apps/web/index.html (static fallback) -->
<!DOCTYPE html>
<html>
  <head>
    <!-- Static fallback (used if JS loads before meta endpoint) -->
    <meta property="og:title" content="Decksmith" />
    <meta
      property="og:description"
      content="Build, print, and share Magic: The Gathering proxy decks"
    />
    <meta property="og:image" content="https://decksmith.app/og-default.png" />

    <!-- Will be replaced by meta endpoint for shareable URLs -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**API meta endpoint:**

```typescript
// apps/api/src/routes/meta.ts
import { FastifyInstance } from 'fastify';
import { prisma } from '@decksmith/db';

export async function metaRoutes(fastify: FastifyInstance) {
  // Deck meta tags
  fastify.get('/api/decks/:id/meta', async (req, reply) => {
    const { id } = req.params;

    const deck = await prisma.deck.findUnique({
      where: { id },
      include: { cards: true },
    });

    if (!deck) {
      return reply.code(404).send(defaultMeta());
    }

    const cardCount = deck.cards.length;
    const format = deck.format || 'Casual';

    return reply.type('text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <!-- Open Graph (Facebook, Discord, etc.) -->
          <meta property="og:title" content="${deck.name}" />
          <meta property="og:description" content="${cardCount} cards • ${format} format" />
          <meta property="og:image" content="https://decksmith.app/og-deck.png" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://decksmith.app/decks/${id}" />

          <!-- Twitter Card -->
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="${deck.name}" />
          <meta name="twitter:description" content="${cardCount} cards • ${format} format" />
          <meta name="twitter:image" content="https://decksmith.app/og-deck.png" />

          <!-- WhatsApp (uses Open Graph) -->

          <!-- Redirect to SPA (for browsers) -->
          <meta http-equiv="refresh" content="0; url=/decks/${id}" />
        </head>
        <body>
          <p>Redirecting to <a href="/decks/${id}">${deck.name}</a>...</p>
        </body>
      </html>
    `);
  });

  // Collection meta tags
  fastify.get('/api/collections/:id/meta', async (req, reply) => {
    const { id } = req.params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: { cards: true },
    });

    if (!collection) {
      return reply.code(404).send(defaultMeta());
    }

    const cardCount = collection.cards.length;
    const totalValue = collection.cards.reduce((sum, card) => sum + (card.price || 0), 0);

    return reply.type('text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="${collection.name}'s Collection" />
          <meta property="og:description" content="${cardCount} cards • Value: $${totalValue.toFixed(2)}" />
          <meta property="og:image" content="https://decksmith.app/og-collection.png" />
          <meta property="og:url" content="https://decksmith.app/collections/${id}" />

          <meta http-equiv="refresh" content="0; url=/collections/${id}" />
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
      </html>
    `);
  });
}

function defaultMeta() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Decksmith" />
        <meta property="og:description" content="Build, print, and share MTG proxy decks" />
        <meta property="og:image" content="https://decksmith.app/og-default.png" />
        <meta http-equiv="refresh" content="0; url=/" />
      </head>
      <body><p>Redirecting...</p></body>
    </html>
  `;
}
```

### User Flow

**1. User shares deck link:**

```
User clicks "Share" button in app
  ↓
App copies link: https://decksmith.app/decks/abc123
  ↓
User pastes in WhatsApp
```

**2. WhatsApp/Discord fetches meta tags:**

```
WhatsApp bot fetches: https://decksmith.app/decks/abc123
  ↓
Fastify API intercepts (via middleware or proxy)
  ↓
Returns: /api/decks/abc123/meta (HTML with Open Graph tags)
  ↓
WhatsApp parses Open Graph tags
  ↓
Shows preview: "Goblin Aggro • 60 cards • Standard"
```

**3. User clicks link:**

```
Browser fetches: https://decksmith.app/decks/abc123
  ↓
Meta endpoint returns HTML with <meta http-equiv="refresh"> redirect
  ↓
Browser redirects to: /decks/abc123 (Vite SPA route)
  ↓
SPA loads and renders deck
```

### Implementation Details

**Fastify middleware to intercept shareable URLs:**

```typescript
// apps/api/src/plugins/meta-intercept.ts
import { FastifyInstance } from 'fastify';

export async function metaInterceptPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (req, reply) => {
    const url = req.url;

    // Only intercept bot user agents (WhatsApp, Discord, Twitter, Facebook)
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /WhatsApp|Discordbot|Twitterbot|facebookexternalhit/i.test(userAgent);

    if (!isBot) {
      return; // Let SPA handle it
    }

    // Intercept shareable URLs
    if (url.match(/^\/decks\/[a-z0-9-]+$/)) {
      const id = url.split('/')[2];
      return reply.redirect(`/api/decks/${id}/meta`);
    }

    if (url.match(/^\/collections\/[a-z0-9-]+$/)) {
      const id = url.split('/')[2];
      return reply.redirect(`/api/collections/${id}/meta`);
    }
  });
}
```

**Rationale:** Social media bots fetch URLs to generate previews. We detect bots via User-Agent,
redirect them to meta endpoint (with Open Graph tags). Regular browsers get the SPA (no redirect).

---

## Deep Linking for Native Mobile (Future)

When the React Native mobile app is released, **deep linking** allows `decksmith.app/decks/:id` to
open the native app (if installed) instead of the web browser.

**Implementation (future):**

```typescript
// apps/mobile/app.json (Expo config)
{
  "expo": {
    "scheme": "decksmith",
    "ios": {
      "associatedDomains": ["applinks:decksmith.app"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": { "scheme": "https", "host": "decksmith.app" }
        }
      ]
    }
  }
}
```

**User flow (with native app installed):**

```
User clicks link: https://decksmith.app/decks/abc123
  ↓
iOS/Android detects decksmith.app domain
  ↓
Opens native app (not browser)
  ↓
App navigates to: /decks/abc123 (Expo Router)
```

**User flow (without native app):**

```
User clicks link: https://decksmith.app/decks/abc123
  ↓
iOS/Android sees no app installed
  ↓
Opens browser (web app)
  ↓
SPA loads /decks/abc123
```

**Rationale:** Universal links (iOS) and App Links (Android) provide seamless transition between web
and native. Same URL works everywhere (align with **ADR-0008: Navigation & Routing**).

---

## Rationale

### Why Hybrid Meta Endpoint (Not Full SSR)

**Option 1: Full SSR with Next.js**

**Benefits:**

- Perfect SEO (Google indexes all content)
- Fast initial load (server renders HTML)
- Meta tags always correct (no fallback needed)

**Costs:**

- **Architecture violation:** Next.js is a framework, conflicts with Vite + TanStack Router
- **Complexity:** Requires rewriting entire web app (Vite SPA → Next.js)
- **Deployment:** Needs Node.js server (Vite can be static-hosted on CDN)
- **Learning curve:** Team must learn Next.js (significant overhead)

**Verdict:** ❌ Rejected. Too much complexity for link previews (align with **"Clarity over
cleverness"**).

---

**Option 2: Minimal meta endpoint (chosen)**

**Benefits:**

- **Simple:** Single Fastify endpoint (20 lines of code)
- **No SPA changes:** Vite app remains unchanged
- **Good-enough SEO:** Google can still index (via SPA client-side rendering)
- **Perfect for social previews:** Open Graph tags work for WhatsApp, Discord, Twitter

**Costs:**

- **Not perfect SEO:** Google must execute JS to index content (slower than SSR)
- **Extra request:** Bots fetch meta endpoint, then redirect to SPA (minimal overhead)

**Verdict:** ✅ Chosen. Balances simplicity and functionality (align with **"Minimal coupling"**).

---

**Option 3: No meta tags (generic fallback)**

**Benefits:**

- **Zero effort:** No code changes

**Costs:**

- **Poor UX:** Link previews show generic "Decksmith" (no deck name, card count)
- **Missed opportunity:** Social sharing is less compelling (no context)

**Verdict:** ❌ Rejected. Link previews are important for social sharing (align with **"Premium
UX"**).

---

### Why Detect Bots via User-Agent

**Alternative 1: Always serve meta endpoint (no bot detection)**

- **Pro:** Simpler (no User-Agent logic)
- **Con:** Regular users get redirected (slower, extra request)

**Verdict:** ❌ Rejected. Regular users should get SPA directly (no redirect).

**Alternative 2: Detect bots via User-Agent (chosen)**

- **Pro:** Bots get meta tags, regular users get SPA (optimal for both)
- **Con:** User-Agent detection is brittle (bots may change UA)

**Verdict:** ✅ Chosen. User-Agent detection is standard practice (align with **"Clarity over
cleverness"**).

---

## Trade-offs

**Benefits:**

- **Nice link previews:** WhatsApp, Discord, Twitter show deck name + card count (better UX)
- **No SPA changes:** Vite app remains unchanged (minimal refactoring)
- **Simple implementation:** Single Fastify endpoint (20 lines of code)
- **Future-proof:** Deep linking ready for native mobile app (universal links)
- **Good-enough SEO:** Google can still index (via SPA client-side rendering)

**Costs:**

- **Extra request for bots:** Social media bots fetch meta endpoint, then redirect (adds ~50ms
  latency)
- **User-Agent detection:** Brittle (bots may change UA, may need updates)
- **Not perfect SEO:** Google must execute JS to index content (slower than SSR)
- **Maintenance:** Must keep Open Graph images up-to-date (`og-deck.png`, `og-collection.png`)

**Risks:**

- **Bot detection fails:** If User-Agent detection breaks, bots may see SPA (no meta tags)
  - **Mitigation:** Test with WhatsApp, Discord, Twitter bots (use online tools like opengraph.xyz)
- **Meta endpoint downtime:** If API is down, link previews fail
  - **Mitigation:** API has same uptime as rest of app (no additional risk)
- **Stale meta tags:** If deck is updated, preview may show old data
  - **Mitigation:** Meta endpoint fetches fresh data from database (always up-to-date)

---

## Evolution History

### 2026-01-11: Initial decision

- Chose hybrid meta endpoint strategy (no full SSR)
- Defined Open Graph tags for decks and collections
- Implemented bot detection (User-Agent) to serve meta tags only to social media bots
- Planned deep linking for future native mobile app (universal links, App Links)
- Rejected Next.js (too complex), rejected no meta tags (poor UX)

---

## References

- [Open Graph Protocol](https://ogp.me/) - Meta tags for social media previews
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards) -
  Twitter-specific meta tags
- [WhatsApp Link Preview](https://faq.whatsapp.com/1434481323829682) - WhatsApp uses Open Graph
- [Universal Links (iOS)](https://developer.apple.com/ios/universal-links/) - Deep linking for iOS
- [App Links (Android)](https://developer.android.com/training/app-links) - Deep linking for Android
- [Expo Linking](https://docs.expo.dev/guides/linking/) - Deep linking in React Native
- Related ADRs:
  - ADR-0008 (Navigation & Routing: Same routes across web/mobile)
  - ADR-0005 (Package boundaries: API endpoints in `apps/api`)
- Related specs:
  - `deck-management.md` - Deck sharing feature
  - `collection-management.md` - Collection sharing feature
