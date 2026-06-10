# Decksmith Web — UI kit

An interactive, click-through recreation of the Decksmith web app, composing the design system's own
components. Open `index.html`.

## Flow

1. **Login** — centered card, amber ◈ mark, email/password, "Log in" → enters the app.
2. **Dashboard** — welcome, quick stats (mono), 3 recent deck cards, activity feed.
3. **Decks** — grid/list toggle, local filter + format/color selects, deck-card grid. "New deck".
4. **Deck builder** — section list with quantities + missing-card tags, an **Add cards slide-over**
   (keeps deck context), and a stats panel: mana curve, color distribution, coverage.
5. **Collection** — filter sidebar (color/rarity/format) + table↔grid toggle, priced rows.
6. **Card search** — WUBRG color toggles, mana-value slider, rarity/type filters + card grid.

Plus: **⌘K global search spotlight** (grouped Cards / Decks / Collection), a **dark/light theme
toggle** in the top bar, and a collapsible icon sidebar.

## Files

| File             | Role                                                        |
| ---------------- | ----------------------------------------------------------- |
| `index.html`     | Loads React, the DS bundle, data, and the JSX modules below |
| `data.js`        | Sample decks, cards, builder data, activity                 |
| `icons.jsx`      | Lucide-style stroke icons + the Decksmith logo              |
| `shell.jsx`      | Sidebar, TopBar, GlobalSearch spotlight, Login              |
| `dashboard.jsx`  | Dashboard screen                                            |
| `decks.jsx`      | DeckList + DeckBuilder                                      |
| `collection.jsx` | Collection + CardSearch                                     |
| `app.jsx`        | Routing, theme, auth wiring                                 |

All screens read components from `window.DecksmithDesignSystem_0a9b95`; styling comes from
`../../styles.css`. No real Scryfall art — color-identity gradients stand in.
