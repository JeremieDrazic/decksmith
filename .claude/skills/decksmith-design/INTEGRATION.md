# Integration guide

Two ways to consume Decksmith — pick by what you're building.

---

## Mode A — Mocks / prototypes (no build step)

Link the global stylesheet + the compiled bundle, read components off the namespace. This is exactly
what the cards in `components/**/*.card.html` and `ui_kits/` do.

```html
<html class="dark">
  <link rel="stylesheet" href="styles.css" />
  <script src="_ds_bundle.js"></script>
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" …></script>
  <script type="text/babel">
    const { Button, DeckCard, ManaCost } = window.DecksmithDesignSystem_0a9b95;
    // …render
  </script>
</html>
```

`_ds_bundle.js` ships in this folder. Dark mode = `class="dark"` on `<html>`; remove it for light.

---

## Mode B — Production React app (Vite / Next / etc.)

Don't use the bundle. Import the component **sources** and the stylesheet directly — they're plain
`export function` modules that only depend on React + CSS custom properties.

```bash
npm i react react-dom
npm i @fontsource/outfit @fontsource/jetbrains-mono mana-font keyrune   # fonts, see assets/fonts/README.md
```

```tsx
// app entry
import './styles.css'; // tokens + base (point fonts at fonts-local.css)
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/jetbrains-mono/500.css';
import 'mana-font'; // .ms-w … glyph classes
import 'keyrune'; // set symbols

import { Button } from './components/core/Button.jsx';
import { DeckCard } from './components/mtg/DeckCard.jsx';

export default function App() {
  return <DeckCard name="The Ur-Dragon" colors="wubrg" count={100} coverage={87} price="142 €" />;
}
```

`.d.ts` files give you full TypeScript types. Toggle the theme by adding/removing `dark` on
`document.documentElement`. Never hardcode hex — read the CSS custom properties.

### Tailwind v4 (utilities like `bg-surface`, `text-accent`, `text-mtg-blue`)

Use the standalone `tokens/tailwind.css` (CSS-first `@theme`, ported from the original repo). In
your app stylesheet:

```css
@import 'tailwindcss';
@import './tokens/tailwind.css'; /* do NOT also import styles.css — this declares :root/.dark */
```

You then get `bg-bg`, `bg-surface`, `text-text`, `text-text-muted`, `text-accent`, `border-border`,
`text-mtg-blue`, `rounded-[var(--radius-surface)]`, `duration-normal`, `ease-spring`, etc. — all
dark-mode-safe (toggle `.dark` on `<html>`). The MTG identity colors are baked static; everything
theme-aware resolves at runtime via `@theme inline`.

---

## Using it inside Claude Code (as a Skill)

This whole folder is a Claude Code **Agent Skill** (`SKILL.md` is the manifest).

1. **Install** — copy the folder so `SKILL.md` sits at its root:
   - per-project: `.claude/skills/decksmith-design/`
   - global: `~/.claude/skills/decksmith-design/`
2. **Confirm** — in Claude Code run `/doctor` (or list skills); `decksmith-design` should appear.
3. **Invoke** — it's `user-invocable`, so just ask:
   - _"Use the decksmith-design skill to build a settings page."_
   - _"With decksmith-design, mock a mobile deck list screen as static HTML."_
   - _"Following decksmith-design, add a `<RarityFilter>` component matching the system."_

When invoked, the agent reads `readme.md` first (tokens, rules, voice), then pulls the specific
component or screen files it needs. For throwaway visuals it copies assets out and emits static
HTML; for production it wires the real component sources from `components/`.

**Keep it in sync:** if you change tokens/components here, re-copy the folder (including the
regenerated `_ds_bundle.js`) into `.claude/skills/`. A symlink works too:
`ln -s /path/to/this/project ~/.claude/skills/decksmith-design`.
