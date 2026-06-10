# Design Decisions Log

_Decisions about visual identity, UX patterns, and design system architecture._ _For
technical/architectural decisions, see `apps/docs/context/decisions-log.md`._

---

## 2026-06-10

### Violet as light mode interactive accent — amber demoted to `brand` (decorative)

**Decision:** In light mode, the interactive accent (`accent`, `border-focus`, button background)
switches from amber to violet (`#5b4fcf`). Amber becomes a `brand` token — decorative only (logo,
ornaments, dividers, section separators).

**Why:** Amber (`#c49a1a`) on parchment (`#faf9f4`) = 3.75:1 — fails WCAG AA for interactive
elements. There's also low visual differentiation between two warm tones on a warm background.
Violet is from the same purple family as existing muted text (`#524d80`) but more saturated.
Contrast: `#5b4fcf` on `#faf9f4` = 5.2:1 (AA ✓); white on `#5b4fcf` = 5.4:1 (AA ✓).

**Impact on the "amber as brand" decision above:** Amber remains the brand identity color — it
appears in the logo, ornamental dividers (`─────◈─────`), and decorative highlights. It is no longer
the interactive accent in light mode. Dark mode is unchanged (amber accent stays).

**`on-accent` split:** Was a single value (`#0f0e17`). Is now mode-specific: `#ffffff` (white on
violet) in light, `#0f0e17` (dark on amber) in dark.

**`brand` contrast warning:** `brand` (`#c49a1a`) on `#faf9f4` ≈ 2.9:1 — fails AA. Like
`text-faint`, it is decorative-only in light mode. In dark mode (`#e8b84b` on `#0f0e17`) it passes
AAA (9.8:1), so the constraint is light mode only.

**Primitive naming:** Same session, all primitives renamed to pure color descriptors (no mode
prefix): `ink*` scale for dark purple backgrounds/text, `cream*` scale for light backgrounds,
`amber*` / `violet*` for accent families.

---

## 2026-03-30

### No Figma — Design-in-code workflow

**Decision:** Figma is not used as source of truth. ASCII mocks in spec files define screen
structure. `packages/tokens` defines the visual language. Storybook replaces Figma for visual
iteration.

**Why:** Figma requires a separate tool, creates sync drift between designs and code, and adds
maintenance overhead for a solo/small-team project. ASCII mocks are version-controlled, co-located
with specs, and sufficient for planning component boundaries.

**Alternatives rejected:**

- Figma — sync drift, separate tool, overkill at this stage
- Sketch — same issues, Mac-only

---

### Amber as brand accent (`#f59e0b`)

**Decision:** Amber/gold is the primary accent colour for buttons, active states, highlights, and
the brand logo mark.

**Why:** No major MTG tool uses amber (Moxfield = blue, Archidekt = purple/blue, TCGplayer = blue).
Amber evokes physical craft, candlelight, metal, and card borders — all directly relevant to the MTG
hobby. Works well on dark backgrounds without feeling corporate.

**Alternatives rejected:**

- Blue (`#3b82f6`) — too generic, used by every SaaS and MTG competitor
- Purple (`#a855f7`) — already used for Black mana identity token, creates confusion
- Teal (`#0ea5e9`) — cleaner but still SaaS-coded

---

### Warm purple-black background (`#0f0e17`)

**Decision:** The dark mode background has a subtle warm purple tint rather than pure black or cool
grey.

**Why:** Pure black (`#000000`) or neutral dark grey feels sterile. The warm tint evokes the feeling
of playing Magic at night — ambient, atmospheric. Differentiates immediately from Linear, GitHub,
and other dark-mode tools.

**Light mode counterpart:** `#faf9f4` — warm off-white, like aged paper/parchment.

---

### Outfit as primary typeface

**Decision:** Outfit (Google Fonts) for both display and body text.

**Why:** Geometric but human, slightly futuristic without being cold. Not overused like Inter. Works
at all sizes from 12px badge labels to 48px hero titles. Free, variable font, good language support.

**Alternatives rejected:**

- Inter — ubiquitous, no personality at this point
- Cinzel — too decorative/fantasy, bad for UI body text
- Geist — good but strongly associated with Vercel branding

**Monospace:** JetBrains Mono for stats, prices, card counts, mana cost text.

---

### MTG colour tokens separate from semantic tokens

**Decision:** WUBRG colour tokens (`mtg-white`, `mtg-blue`, `mtg-black`, `mtg-red`, `mtg-green`,
`mtg-colorless`, `mtg-multi`) are defined as a distinct token group, not merged into the semantic
palette.

**Why:** MTG colours are domain-specific — they represent Magic's colour identity system, not UI
states. Mixing them with `success`/`error`/`warning` would create semantic confusion (e.g. MTG red ≠
error red, even though they share a similar hue).

---

### Icônes Keyrune SVG pour les symboles de mana (pas de cercles colorés)

**Decision:** Les couleurs d'un deck et les coûts de mana sont représentés avec les icônes SVG
officielles MTG via la librairie **Keyrune** — pas des cercles ou pastilles colorés génériques.

**Why:** Les icônes Keyrune sont les symboles canoniques du jeu (W, U, B, R, G, C, X, etc.). Tout
joueur MTG les reconnaît instantanément. Des cercles colorés sont une abstraction qui perd la
sémantique exacte (un joueur distingue {W} d'une pastille blanche au premier coup d'œil). Ça ancre
visuellement l'app dans l'univers MTG de façon immédiate.

**Source :** `mana.andrewgioia.com` — sprites SVG + CSS font (Keyrune).

**Alternatives rejetées :**

- Cercles colorés WUBRG — trop générique, perd la sémantique iconique du jeu
- Texte brut "W U B R G" — encore moins expressif

**Convention dans les mocks ASCII :** les icônes sont notées `{W}` `{U}` `{B}` `{R}` `{G}` `{C}`
(notation officielle MTG). Dans le code, chaque `{X}` sera rendu en icône Keyrune SVG.

---

### Patterns de recherche selon le contexte

**Decision:** Trois patterns distincts selon le contexte :

| Contexte                               | Pattern                      | Comportement                                                        |
| -------------------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| Barre globale du header                | Popover/spotlight            | Résultats groupés (cartes + decks + collection), lien "Voir tous →" |
| Icône `🔍` dans la sidebar             | Page dédiée `/search`        | Recherche avancée avec filtres complets                             |
| Ajout d'une carte dans le deck builder | Slide-over (panneau latéral) | Reste dans le contexte du deck                                      |

**Why:** La recherche n'a pas le même objectif selon d'où elle est déclenchée. Le popover header
sert à retrouver rapidement quelque chose (type Spotlight macOS / command palette VSCode). La page
`/search` sert à explorer avec des filtres. Le slide-over du deck builder garde le contexte du deck
visible pendant qu'on ajoute des cartes.

---

### Recherche globale (cartes + decks + collection)

**Decision:** La barre de recherche dans le header est une **recherche globale** — elle couvre les
cartes MTG, les decks de l'utilisateur, et les entrées de collection. Les résultats sont groupés par
type dans le dropdown d'autocomplete.

**Why:** Un utilisateur qui tape "Lightning Bolt" veut peut-être retrouver la carte, ou un deck qui
la contient, ou ses copies en collection. Une barre unique évite de savoir où chercher.

**Spec mise à jour :** `apps/docs/specs/card-search.md` — section "Search Bar (Header)".

**Recherche locale :** Chaque page (deck list, collection) garde son propre champ de filtre pour
filtrer les éléments affichés — distinct de la recherche globale.

---

### Desktop sidebar + mobile bottom nav

**Decision:** Navigation is a collapsed icon sidebar on desktop (expandable), and a bottom
navigation bar on mobile.

**Why:** Bottom nav on mobile is the dominant pattern for app-like tools (iOS, MTG Arena mobile,
most collection apps). Sidebar on desktop provides vertical expansion room for future nav items
without cluttering the top bar. Consistent icon set between both layouts.

---

### CSS custom properties for theming (not Tailwind dark: variant)

**Decision:** Dark/light theme is implemented via CSS custom properties on `:root` and `.dark`, not
via Tailwind's `dark:` class variant.

**Why:** CSS vars allow theme switching at runtime without a page reload or class proliferation in
JSX. Components use semantic tokens (`bg-surface`, `text-muted`) — the value changes via the CSS
var, not the class. Tailwind consumes the var references, not hardcoded values.

**Trade-off:** Slightly less obvious in JSX than `dark:bg-gray-900`, but much cleaner as the token
system grows. The semantic layer (`surface`, `muted`) is more meaningful than raw colour names
anyway.
