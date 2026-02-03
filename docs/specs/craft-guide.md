# Craft Guide

Educational content teaching users how to create high-quality MTG proxies.

---

## Overview

The Craft Guide is a **static content library** providing:
- Equipment recommendations (printers, cardstock, cutters)
- Step-by-step tutorials (printing, cutting, sleeving)
- Print quality tips (color calibration, bleed handling)
- Community reviews (user-submitted equipment feedback)

**Goal:** Empower users to produce professional-grade proxies at home.

---

## Features

### Equipment Guide

**Recommended Printers:**
1. **Epson EcoTank ET-2800** ($250)
   - Pros: Cheap ink (tank system), high quality, borderless printing
   - Cons: Slower than laser, ink smudging if not careful
   - Ideal for: Budget-conscious home users

2. **Canon PIXMA iX6820** ($200)
   - Pros: Wide format (13×19"), excellent color accuracy
   - Cons: No duplex (double-sided), high ink cost
   - Ideal for: Large batches, color-critical work

3. **HP Color LaserJet Pro M454dw** ($400)
   - Pros: Fast, crisp text, waterproof prints
   - Cons: Expensive upfront, toner is pricey
   - Ideal for: High-volume printing, durability

**Cardstock Recommendations:**
- **330gsm Black Core** ($20/50 sheets, 11×17")
  - Industry standard, passes light test when sleeved
  - Thickness: ~0.3mm (matches real MTG cards)
  - Source: Print shops, specialty retailers

- **310gsm German Black Core** ($30/50 sheets)
  - Premium option, slightly thinner but better snap
  - Harder to source, higher quality feel

**Cutting Tools:**
- **Guillotine Paper Cutter** ($50-150)
  - Pros: Straight cuts, fast, handles stacks
  - Cons: Less precise for fine details
  - Recommended: Fiskars SureCut (12", $80)

- **Rotary Trimmer** ($30-100)
  - Pros: Very precise, clean edges, safe
  - Cons: Slower, one card at a time
  - Recommended: Dahle 508 (18", $90)

- **Corner Rounder Punch** ($15)
  - Rounds card corners (2mm radius)
  - Makes proxies feel more authentic

**Sleeves:**
- **Dragon Shield Matte** (100 ct, $10)
  - Standard for proxies, hides imperfections
  - Opaque backs, shuffle well

- **KMC Perfect Fit** (100 ct, $5)
  - Inner sleeves, protect from dust
  - Use with outer sleeve (double-sleeving)

---

### Step-by-Step Tutorials

#### Tutorial 1: "How to Print High-Quality Proxies"

**Steps:**
1. **Prepare PDF:**
   - Export from Decksmith (300 DPI, A4, 3×3 grid)
   - Ensure cut lines enabled, bleed area included

2. **Printer Settings:**
   - Paper: 330gsm cardstock (manual feed)
   - Quality: Best / Maximum DPI
   - Color Management: Disable (use PDF's embedded profile)
   - Borderless: OFF (use margins from PDF)

3. **Test Print:**
   - Print single page first
   - Check alignment, color accuracy
   - Adjust printer settings if needed

4. **Full Print:**
   - Load cardstock carefully (grain direction: long edge feed)
   - Print all pages
   - Let dry for 30 minutes (inkjet) or cool (laser)

5. **Inspect:**
   - Check for smudging, color errors, alignment
   - If issues: Re-calibrate printer, clean print heads

---

#### Tutorial 2: "Precision Cutting Techniques"

**Steps:**
1. **Mark Cut Lines:**
   - Use ruler + pencil to extend cut lines (if faint)
   - Align with cutting mat grid

2. **Guillotine Method:**
   - Cut rows first (horizontal cuts)
   - Then cut columns (vertical cuts)
   - Use cutting mat underneath to protect blade

3. **Rotary Trimmer Method:**
   - Cut one card at a time
   - Align card edge with ruler
   - Slow, steady cuts (avoid jagged edges)

4. **Corner Rounding:**
   - Use corner punch on all 4 corners
   - Match radius to real MTG cards (2mm)

5. **Final Check:**
   - Compare proxy to real card (size, corners)
   - Sand edges lightly if rough (220 grit sandpaper)

---

#### Tutorial 3: "Color Calibration for Accurate Prints"

**Issue:** Printed cards look too dark/light/saturated.

**Solution:**
1. **Printer Color Profiles:**
   - Download Scryfall's color profile (if available)
   - Install in OS: macOS (ColorSync), Windows (Color Management)

2. **Test Print:**
   - Print color chart (RGB swatches)
   - Compare to on-screen preview

3. **Adjust Settings:**
   - Increase brightness: +10-20% (if too dark)
   - Reduce saturation: -5-10% (if too vibrant)
   - Tweak individual colors (R/G/B sliders)

4. **Save Preset:**
   - Save custom color profile
   - Reuse for future prints

---

### FAQ (Common Issues)

**Q: My cards are curling after printing. How do I fix this?**
A: Ink absorbed unevenly. Solutions:
- Let cards dry fully (24h) under weight (heavy book)
- Use hairdryer on low heat to speed drying
- Store in humidity-controlled environment (50-60% RH)

**Q: Colors don't match Scryfall images. Why?**
A: Monitor ≠ printer color space. Solutions:
- Calibrate monitor (use colorimeter)
- Use printer color profiles
- Adjust printer settings (see Tutorial 3)

**Q: Cut lines are misaligned. What went wrong?**
A: Printer scaling or paper shift. Solutions:
- Disable "Fit to Page" in print dialog (use Actual Size)
- Check paper alignment in manual feed tray
- Re-run PDF generation with adjusted margins

**Q: Can I use regular printer paper?**
A: No. Regular paper (80gsm) is too thin, cards feel fake. Use:
- 330gsm cardstock (opaque, feels like real cards)
- Minimum 250gsm if cardstock unavailable

**Q: How do I make foil proxies?**
A: Advanced technique:
- Print on transparency film
- Apply holographic foil laminate
- Layer with cardstock backing
- (Not recommended for beginners)

---

## Content Structure

### Categories

| Category | Description | Example Articles |
|----------|-------------|------------------|
| **Equipment** | Printer/cardstock reviews | "Best Printers for MTG Proxies (2026)" |
| **Tutorials** | Step-by-step guides | "How to Print High-Quality Proxies" |
| **Tips & Tricks** | Quick fixes, hacks | "Fixing Color Mismatch Issues" |
| **Community Reviews** | User-submitted equipment feedback | "Review: Epson EcoTank ET-2800" |

---

### Article Schema

**Database:**
```sql
CREATE TABLE craft_guide_articles (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,  -- Markdown
  category TEXT NOT NULL,  -- enum: equipment, tutorial, tips, review
  thumbnail_url TEXT,
  published_at TIMESTAMP,  -- NULL = draft
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Example Article (Markdown)

```markdown
# Best Printers for MTG Proxies (2026)

Choosing the right printer is crucial for high-quality proxies. Here are our top picks.

## 1. Epson EcoTank ET-2800 ($250)

**Pros:**
- Cheap ink (tank system, not cartridges)
- High quality (4800×1200 DPI)
- Borderless printing (A4, Letter)

**Cons:**
- Slower than laser (6 pages/min color)
- Ink smudging if not careful

**Verdict:** Best for budget-conscious users. ⭐⭐⭐⭐

---

## 2. Canon PIXMA iX6820 ($200)

**Pros:**
- Wide format (13×19")
- Excellent color accuracy
- Affordable

**Cons:**
- No duplex (double-sided)
- High ink cost

**Verdict:** Great for large batches. ⭐⭐⭐⭐

---

## Comparison Table

| Printer | Price | DPI | Speed | Ink Cost |
|---------|-------|-----|-------|----------|
| Epson ET-2800 | $250 | 4800×1200 | 6 ppm | Low |
| Canon iX6820 | $200 | 4800×1200 | 10 ppm | High |
| HP M454dw | $400 | 600×600 | 28 ppm | Medium |

## Buying Guide

- **Budget:** Epson EcoTank ET-2800
- **Volume:** HP Color LaserJet Pro M454dw
- **Quality:** Canon PIXMA iX6820
```

---

## API Endpoints

### `GET /api/craft-guide/articles`

**Description:** List all published articles.

**Query Params:**
- `category`: Filter by category
- `search`: Keyword search (title + content)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "best-printers-2026",
      "title": "Best Printers for MTG Proxies (2026)",
      "category": "equipment",
      "thumbnail_url": "https://...",
      "excerpt": "Choosing the right printer is crucial...",
      "published_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/craft-guide/articles/:slug`

**Description:** Get article by slug.

**Response:**
```json
{
  "id": "uuid",
  "slug": "best-printers-2026",
  "title": "Best Printers for MTG Proxies (2026)",
  "content": "# Best Printers...",
  "category": "equipment",
  "thumbnail_url": "https://...",
  "published_at": "2024-01-15T10:00:00Z",
  "related_articles": [
    {
      "slug": "how-to-print-high-quality-proxies",
      "title": "How to Print High-Quality Proxies"
    }
  ]
}
```

---

## Business Rules

1. **Articles are public** (no auth required)
2. **Admin-only create/edit** (MVP) via admin panel
3. **Future:** User-submitted content with moderation
4. **Markdown rendering** with syntax highlighting (Prism.js)
5. **SEO-friendly slugs** (e.g., `/craft/best-printers-2026`)
6. **Images stored** in Supabase Storage

---

## UI Patterns

### Browse Page

```
┌──────────────────────────────────────────┐
│ Craft Guide                              │
│ ──────────────────────────────────────── │
│ [Equipment] [Tutorials] [Tips] [Reviews] │
│ ──────────────────────────────────────── │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ [Thumbnail]     │ │ [Thumbnail]     │ │
│ │ Best Printers   │ │ How to Print... │ │
│ │ Equipment       │ │ Tutorial        │ │
│ └─────────────────┘ └─────────────────┘ │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ [Thumbnail]     │ │ [Thumbnail]     │ │
│ │ Color Calib...  │ │ Epson Review    │ │
│ │ Tips & Tricks   │ │ Review          │ │
│ └─────────────────┘ └─────────────────┘ │
└──────────────────────────────────────────┘
```

---

### Article View

```
┌──────────────────────────────────────────┐
│ [< Back to Craft Guide]                  │
│                                          │
│ Best Printers for MTG Proxies (2026)    │
│ Equipment  •  Jan 15, 2024               │
│ ──────────────────────────────────────── │
│                                          │
│ [Markdown content rendered here]         │
│                                          │
│ ──────────────────────────────────────── │
│ Related Articles:                        │
│ • How to Print High-Quality Proxies      │
│ • Color Calibration Guide                │
└──────────────────────────────────────────┘
```

**Sidebar (Sticky TOC):**
- Auto-generated from `##` headers in markdown
- Jump to section on click

---

## Mobile Considerations

### Mobile Web (320-767px)

**Article Layout:**
- **Scrollable content**: Full-screen article (no sidebar TOC)
- **Collapsible TOC**: Tap "Table of Contents" button → Bottom sheet with sections
- **Jump to section**: Tap section in TOC → Scrolls to section, closes sheet
- **Sticky header**: Article title remains at top while scrolling

**Images:**
- **Full-width**: Article images expand to 320px
- **Tap to zoom**: Tap image → Full-screen lightbox with pinch-zoom
- **Lazy loading**: Images load as user scrolls

**Code Blocks:**
- **Horizontal scroll**: For wide code snippets (don't wrap)
- **Copy button**: 44px touch target

**Touch Interactions:**
- All buttons: 44px minimum
- Swipe down from top: Show TOC sheet
- Pull to refresh: Reload article (check for updates)

**Performance Targets:**
- Article load: < 500ms (markdown rendered client-side)
- Image loading: Progressive (thumbnails → full)
- TOC generation: < 100ms (parse markdown headings)

**Offline Behavior:**
- Requires internet (articles fetched from API)
- Error if offline: "No internet. Craft guides require connection."
- Future: Cache recently viewed articles (IndexedDB)

### Tablet (768-1023px)

**Sidebar TOC**: Sticky table of contents in left sidebar (like desktop)

### Future Native Mobile

**Platform Features:**
- **Offline articles**: Download guides for offline reading
- **Bookmarks**: Save favorite guides
- **Share via system sheet**: Share guide link

### Related ADRs

- [ADR-0008: Mobile-First Web Design Principles](../adr/0008-mobile-first-web-design-principles.md) — Touch targets, image loading
- [ADR-0009: Responsive Feature Strategy](../adr/0009-responsive-feature-strategy.md) — Collapsible TOC pattern

---

## Related Specs

- [Data Model](./data-model.md) — CraftGuideArticle schema
- [PDF Generation](./pdf-generation.md) — Print settings reference
