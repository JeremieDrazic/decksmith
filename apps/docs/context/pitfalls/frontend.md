# Frontend Pitfalls & Conventions

Mistakes to avoid and conventions to follow when writing React/TanStack code in `apps/web` and
`packages/web-ui`.

---

## File Structure — TanStack Router routes

**Component before Route export.** Define the component first, then register it in the route. The
`Route` export is the routing metadata — it should come last.

```tsx
// ✅ correct
function LoginPage() { ... }
export const Route = createFileRoute('/login')({ component: LoginPage })

// ❌ wrong — routing metadata before the component
export const Route = createFileRoute('/login')({ component: LoginPage })
function LoginPage() { ... }
```

**`<ScrollRestoration />` is deprecated — use the router option instead.** Pass
`scrollRestoration: true` to `createRouter` in `router.tsx`. The component variant is deprecated
since TanStack Router 1.170.

```ts
// ✅ correct
createRouter({ routeTree, scrollRestoration: true })

// ❌ deprecated
import { ScrollRestoration } from '@tanstack/react-router'
<ScrollRestoration />
```

---

**`createFileRoute` is required even for empty shells.** TanStack Router discovers routes by
scanning for a `Route` export with `createFileRoute`. Without it the file is invisible to the router
and never added to `routeTree.gen.ts`.

---

## Styling — Design Tokens

**Never use hardcoded hex values in components.** Use semantic token classes only.

```tsx
// ✅ correct
<div className="bg-surface text-text border-border" />

// ❌ wrong — hardcoded colours, breaks theming
<div style={{ background: '#1a1827', color: '#f0eef8' }} />
```

**Never use Tailwind's `dark:` variant.** Theme switching is handled by toggling `.dark` on `<html>`
at runtime. The `dark:` variant requires a build-time class and duplicates every colour utility —
our `@theme inline` approach already handles it via CSS vars.

```tsx
// ✅ correct — CSS var flips automatically when .dark is on <html>
<div className="bg-surface" />

// ❌ wrong — bypasses our token system
<div className="bg-white dark:bg-[#1a1827]" />
```

**Never use raw Tailwind type utilities (`text-xl`, `font-bold`) in feature JSX.** Typography is
encapsulated in `<Heading>`, `<Body>`, `<Label>` components from `packages/web-ui`. Raw utilities
are allowed only inside those components.

---

## Internationalisation

**Never hardcode user-visible strings.** Every string goes through `react-i18next` from day one —
even during scaffolding. Add the key to `src/locales/en.json` and use `useTranslation`.

```tsx
// ✅ correct
const { t } = useTranslation();
return <h1>{t('home.title')}</h1>;

// ❌ wrong
return <h1>Decksmith</h1>;
```

---

## QueryClient

**Create `QueryClient` once at module level in `__root.tsx`, not inside a component.** Creating it
inside a component means a new instance on every render — cache is lost, requests re-fire.

```tsx
// ✅ correct — module level, lives for the entire app lifetime
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });

function Root() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>;
}

// ❌ wrong — new instance on every render
function Root() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>;
}
```

---

## Import Order (within a file)

Suggested order to keep files scannable:

1. Framework imports (`react`, `@tanstack/react-router`, etc.)
2. Internal packages (`@decksmith/web-ui`, `@decksmith/tokens`, etc.)
3. Local modules (`../components/...`, `./utils/...`)
4. Styles (`../styles/globals.css`)
5. Side-effect-only imports (`../i18n`)

---

## Codegen prerequisites (bootstrap order)

`pnpm typecheck` requires two codegen steps to have run at least once beforehand. These are
analogous to Prisma's `db:generate` — TypeScript cannot check types it hasn't seen yet.

| Step | Command                                          | What it generates      |
| ---- | ------------------------------------------------ | ---------------------- |
| 1    | `pnpm --filter @decksmith/db db:generate`        | Prisma client types    |
| 2    | `pnpm --filter @decksmith/web dev` (then Ctrl-C) | `src/routeTree.gen.ts` |

After a fresh `pnpm install` on a clean clone, run both before running `pnpm typecheck`.

**Do not manually augment `@tanstack/react-router` with the router type.** TanStack Start's Vite
plugin generates the registration automatically in `routeTree.gen.ts` (under
`declare module '@tanstack/react-start'`). Adding a manual `declare module '@tanstack/react-router'`
in `router.tsx` duplicates this and can drift out of sync.

---

## Tailwind v4 + Vite — new files not scanned after Storybook start

**`@source` does not hot-watch new files added after the initial scan.** In dev mode,
`@tailwindcss/vite` builds a scanner once from `@source` paths at startup. Files written after that
point are not in `scanner.files`, so touching them does NOT trigger a CSS rebuild — the classes they
contain never appear.

**Symptom:** classes unique to a newly created component (`size-7`, `cursor-text`,
`group/input-group`) are absent from the generated CSS, while classes from older files in the same
directory ARE present.

**Fix:** save any change to the CSS entry point (`preview.css`) — this makes `requiresBuild()`
return `true`, forces a full compiler + scanner rebuild, and picks up all new files.

```css
/* preview.css — add or remove a comment to force a full Tailwind rebuild */
@source '../../../packages/web-ui/src/**/*.{ts,tsx}';
```

Use the explicit glob form (`**/*.{ts,tsx}`) rather than a bare directory path — it makes the intent
clear and avoids ambiguity about which file types are scanned.

---

## Tailwind v4 — `has-[...]` built-in variant generates no CSS

**`has-[...]` (built-in variant) produces no CSS rules in our Vite + Storybook setup.** The
arbitrary variant form `[&:has(...)]` DOES work and must be used instead.

```tsx
// ❌ generates no CSS — built-in has-[...] variant
'has-[[data-slot=foo]:focus-visible]:ring-2';
'has-disabled:opacity-50';
'has-[>textarea]:h-auto';

// ✅ generates CSS — arbitrary [&:has(...)] variant
'[&:has([data-slot=foo]:focus-visible)]:ring-2';
'[&:has(:disabled)]:opacity-50';
'[&:has(>textarea)]:h-auto';
```

Note: the `[&>[data-slot]:not(:has(~[data-slot]))]` form used in Button DOES work — nested brackets
inside arbitrary variants are fine. Only the top-level `has-[...]` built-in shorthand is broken.

---

## SVG sizing inside Button children

**SVGs passed as `children` to `Button` are not sized automatically.** `Button` only applies
`[&>svg]:size-[1em]` to the `startIcon` and `endIcon` wrapper spans — not to plain children.

If you build a component that passes icons as `children` to `Button` (e.g. `InputGroupButton`), add
SVG sizing to your wrapper's CVA base class using the **descendant combinator** (`_`), not the
direct child combinator (`>`):

```tsx
// ✅ correct — descendant combinator reaches svg inside Button's inner <span>
cva(['[&_svg:not([class*="size-"])]:size-[1em]'], { ... })

// ❌ wrong — direct child combinator doesn't reach svg (it's inside Button's <span>)
cva(['[&>svg:not([class*="size-"])]:size-[1em]'], { ... })
```

---

## Storybook — axe-core dark mode timing

**`withThemeByClassName` applies `.dark` via `useEffect` — axe-core scans before it fires.** The
a11y addon runs synchronously after the initial render, before React effects have committed. Result:
axe-core sees `:root` (light mode) CSS var values even when dark mode is selected.

Fix: add a `withSyncTheme` decorator that applies the class during the render phase, before axe-core
runs. Place it first in the `decorators` array (outermost wrapper).

```tsx
// apps/storybook/.storybook/preview.tsx
const withSyncTheme: Decorator = (Story, context) => {
  const isDark = (context.globals['theme'] ?? 'dark') === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  return <Story />;
};

decorators: [withSyncTheme, withThemeByClassName({ ... })]
```

Keep the `#storybook-root { background-color: literal }` rules in `preview.css` — axe-core reads the
`background-color` property by traversing ancestors, and literal values bypass the CSS var chain.

---

## Architecture boundary (ADR-0016)

**No backend code in `apps/web` — ever.** Route loaders must only call `apps/api` via HTTP
(`fetch`). Never import from `packages/db`, `packages/domain`, or `apps/api` directly.

```tsx
// ✅ correct
export const Route = createFileRoute('/dashboard/')({
  loader: () => fetch('/api/v1/users/me').then((r) => r.json()),
});

// ❌ wrong — imports backend package directly
import { getUser } from '@decksmith/domain';
```
