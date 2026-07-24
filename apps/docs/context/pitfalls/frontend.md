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

**SVGs passed as `children` to `Button` are not sized automatically.** `Button` applies
`ICON_INLINE[size]` only to the `startIcon` and `endIcon` wrapper spans — not to plain children.

If you build a component that passes icons as `children` to `Button` (e.g. `InputGroupButton`), add
per-size SVG sizing in your own CVA using the **descendant combinator** (`_`):

```tsx
// ✅ correct — descendant combinator reaches svg inside Button's inner <span>
cva(['...'], {
  variants: {
    size: {
      sm: '[&_svg:not([class*="size-"])]:size-3.5',
      xs: '[&_svg:not([class*="size-"])]:size-3',
    },
  },
})

// ❌ wrong — direct child combinator doesn't reach svg (it's inside Button's <span>)
cva(['[&>svg:not([class*="size-"])]:size-4'], { ... })
```

The `:not([class*="size-"])` guard is the escape hatch — passing `<Icon className="size-7" />` is
respected automatically.

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

## Tailwind v4 — new utility class not generated until a rebuild

**A Tailwind utility used for the first time in a modified file may not appear in the generated CSS
until a full rebuild is forced.** This is distinct from the new-file bug (above) — the file is
known, but the new class isn't picked up by the incremental scanner.

**Symptom:** `getComputedStyle(el).color` returns the inherited text color instead of the expected
accent color. Inspecting `sheet.cssRules` shows no rule for the class (e.g. `.text-accent`).

**Fix:** Use an inline `style` prop for colors that come from CSS vars — this bypasses the Tailwind
scanner entirely and is always correct:

```tsx
// ✅ inline style — always resolves the CSS var correctly
<svg style={{ color: 'var(--accent)' }} />

// ❌ Tailwind class — may not be generated if this is the first use in the codebase
<svg className="text-accent" />
```

For colors driven by design tokens in lab/story files, inline styles are more reliable than Tailwind
classes. Tailwind classes are better for production components where the scanner is guaranteed to
have run.

If you need the Tailwind class to exist for other reasons, force a full rebuild by touching the CSS
entry point (`preview.css` in Storybook, `globals.css` in apps/web).

---

## SVG filters — CSS custom property naming in Tailwind v4

**Use `--accent`, not `--color-accent`, in SVG filter inline styles.**

Tailwind v4 strips the namespace prefix when generating CSS custom properties on `:root`. A
`@theme { --color-accent: #e8b84b; }` declaration generates `--accent` (not `--color-accent`) as the
actual DOM variable. The Tailwind utility class `.text-accent` references `var(--accent)`.

If you write `style={{ floodColor: 'var(--color-accent)' }}` on an SVG `<feFlood>`, the variable
resolves to an empty string → falls back to `black` → invisible glow on a dark background.

```tsx
// ✅ correct — matches the variable Tailwind actually generates
<feFlood style={{ floodColor: 'var(--accent)' }} />

// ❌ wrong — --color-accent is empty in the DOM
<feFlood style={{ floodColor: 'var(--color-accent)' }} />
```

To find the correct variable name for any token: open DevTools →
`getComputedStyle(document.documentElement).getPropertyValue('--color-brand')` will be empty, but
`getPropertyValue('--brand')` returns the value.

Also applies to any SVG element attribute driven by a CSS var: `stroke`, `fill` via `style`,
`flood-color`, `lighting-color`, etc.

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

---

## axe-core — `text-text-faint` fails contrast when rendered as a DOM element

**`text-text-faint` (2.5:1) is decorative-only and must never appear on visible DOM text nodes.**
axe-core's `color-contrast` rule ignores CSS `::placeholder` pseudo-elements (e.g.
`<input placeholder="…">`) but flags real DOM elements. Base UI components that render text as a
`<span>` (e.g. `SelectValue` placeholder, `FieldSeparator` label) must use `text-text-muted` (≥5:1)
minimum.

```tsx
// ✅ correct — text-text-muted passes WCAG AA on both bg-surface and bg-bg
<SelectPrimitive.Value className="data-[placeholder]:text-text-muted" />

// ❌ wrong — text-text-faint on a real <span> → axe color-contrast violation
<SelectPrimitive.Value className="data-[placeholder]:text-text-faint" />
```

The exemption only covers: `input::placeholder`, `textarea::placeholder`, and other CSS
pseudo-elements. Any visible text content rendered as a real DOM node must pass WCAG AA.

**This also applies to Storybook story JSX.** Story render functions are scanned by `axe-playwright`
in CI — any `text-text-faint` in a `<p>`, `<span>`, or similar inside a story will fail the
`color-contrast` rule. Use `text-text-muted` for explanatory/secondary text in stories.

```tsx
// ✅ correct — secondary text in a story
<p className="font-mono text-xs text-text-muted">Drag left/right to scrub</p>

// ❌ wrong — fails axe CI even in story-only JSX
<p className="font-mono text-xs text-text-faint">Drag left/right to scrub</p>
```

---

## Tailwind v4 — no `--size-*` namespace; dimensions go in a cva map

**`--size-*` is not a Tailwind v4 theme namespace.** Only `--spacing-*` (a `--spacing: 0.25rem`
multiplier) feeds `h-*`, `w-*`, and `size-*`. Defining `--size-control-md: 2.25rem` in `@theme`
generates **no classes** — neither `h-control-md` nor `size-control-md`.

Furthermore, placing dimensions under `--spacing-control-*` would cause semantic leakage:
`p-control-md`, `gap-icon-sm` would become valid classes.

**The correct fix:** express control heights and icon sizes in a **shared cva map** built on
Tailwind's spacing scale (same approach as shadcn/ui):

```ts
// packages/web-ui/src/lib/sizing/control-height.ts
export const CONTROL_HEIGHT = { xs: 'h-6', sm: 'h-8', md: 'h-9', lg: 'h-11' } as const;
```

The literal values (`'h-6'`) are visible to the Tailwind scanner in the constant's file. cva
variants reference the map via template literal: `` xs: `${CONTROL_HEIGHT.xs} px-2 text-xs` ``

Never invent a custom `--size-*` namespace — it does not exist in Tailwind v4.

---

## Tailwind v4 — `translate-y-*` uses CSS `translate`, not `transform`

**In Tailwind v4, `translate-y-*` utilities set the CSS `translate` individual property, NOT
`transform`.** Using `transition-property: transform` will NOT animate a `translate-y-*` change —
the lift snaps instantly with no transition.

```tsx
// ✅ correct — matches the CSS property Tailwind v4 actually generates
'transition-[translate,box-shadow,border-color] duration-normal ease-out';

// ❌ wrong — transform ≠ translate in Tailwind v4; lift will snap with no animation
'transition-[transform,box-shadow,border-color] duration-normal ease-out';
```

Tailwind v4 generates: `translate: var(--tw-translate-x) var(--tw-translate-y)` for `translate-y-*`
utilities. The `transform` CSS shorthand is a separate property — `transition-property: transform`
does not pick up `translate` changes.

Note: the Tailwind built-in `transition` utility already includes `translate` in its property list
alongside `transform` — so `transition duration-normal ease-out` also works correctly.

---

## Tailwind v4 — utility layer order, not `cn()` order, decides conflicts

**When two `size-*` utilities apply to the same element, `cn()` merge order does NOT decide which
wins — Tailwind's layer order does.** In `@layer utilities`, classes are ordered by first appearance
in the scanned source. Two conflicting `size-4` / `size-5` utilities have identical specificity and
are in the same layer, so the one that appears _later in the generated CSS_ wins — unpredictably.

**Practical consequence for icon sizing:** never put a default icon size in a base class and try to
override it per size-variant. Both classes will be present, but only one will win, and not
necessarily the per-variant one.

```tsx
// ❌ wrong — base class conflicts with variant class; result is unpredictable
cva(
  ['[&_svg:not([class*="size-"])]:size-4'], // base: size-4
  {
    variants: {
      size: {
        lg: '[&_svg:not([class*="size-"])]:size-6', // variant: size-6 — may or may not win
      },
    },
  }
);

// ✅ correct — no default in base; each size variant is the sole authority
cva(
  ['[&_svg]:pointer-events-none'], // base: only non-size classes
  {
    variants: {
      size: {
        sm: `${CONTROL_HEIGHT.sm} ${ICON_INLINE.sm}`, // sole icon size for sm
        lg: `${CONTROL_HEIGHT.lg} ${ICON_INLINE.lg}`, // sole icon size for lg
      },
    },
  }
);
```

This is why `toggleBaseClasses` no longer contains a default `size-4` — it was removed to make
`ICON_INLINE` per-size-variant reliable.

**Escape hatch still works correctly** because `:not([class*="size-"])` removes the component's
selector from the equation entirely when the caller adds an explicit `className="size-X"`.

---

## Base UI NumberField — `id` must go on the Root, not on the Input

Base UI's `NumberField` maintains a shared ID in context (via `useLabelableId` in the Root). The
Decrement and Increment stepper buttons read this context ID and render
`aria-controls="<context-id>"` to reference the input they control.

**The problem:** if you pass `id` to `<NumberFieldInput>`, it overrides the context ID on the
`<input>` element via prop merging — but the stepper buttons still use the original context ID. The
result is `aria-controls` pointing to an element that no longer has that ID → axe rule
`aria-valid-attr-value` fails (Critical).

**Symptom:** Storybook axe CI fails with "1 accessibility violation" on every NumberField story (1
violation = 2 nodes: Decrement + Increment both have an invalid `aria-controls` value like
`aria-controls="base-ui-_r_c_"`).

```tsx
// ❌ wrong — id on Input overrides context id on the <input> but not on stepper buttons
<NumberField>
  <NumberFieldGroup>
    <NumberFieldDecrement />          {/* aria-controls="base-ui-_r_c_" — broken! */}
    <NumberFieldInput id="qty" />     {/* id="qty" — but buttons point to something else */}
    <NumberFieldIncrement />          {/* aria-controls="base-ui-_r_c_" — broken! */}
  </NumberFieldGroup>
</NumberField>

// ✅ correct — id on Root flows through context to all children consistently
<FieldLabel id="qty-label" htmlFor="qty">Quantity</FieldLabel>
<NumberField id="qty">
  <NumberFieldGroup>
    <NumberFieldDecrement />                          {/* aria-controls="qty" ✓ */}
    <NumberFieldInput aria-labelledby="qty-label" /> {/* id="qty" from context ✓ */}
    <NumberFieldIncrement />                          {/* aria-controls="qty" ✓ */}
  </NumberFieldGroup>
</NumberField>

// ✅ also correct — standalone (no FieldLabel), aria-label on Input is fine
<NumberField>
  <NumberFieldInput aria-label="Quantity" />
</NumberField>
```

`htmlFor` on `FieldLabel` still needs to match the Root `id` for click-to-focus. The explicit
`aria-labelledby` on `NumberFieldInput` satisfies screen readers regardless of `htmlFor`.

See ADR-0021 for the full icon sizing convention.

---

## TanStack Router — `Route.useSearch()` inside a component causes `no-use-before-define`

**`Route` is declared after the component** (per convention), so calling `Route.useSearch()` inside
the component is a textual forward reference — the linter flags it even though function declarations
are hoisted and it works at runtime.

**Fix:** use `useSearch({ from })` from `@tanstack/react-router` instead of `Route.useSearch()`. The
`from` option narrows the type to the route's validated search schema — same type safety, no forward
reference.

```tsx
// ❌ triggers no-use-before-define — Route is declared below this component
function LoginPage() {
  const { redirectTo } = Route.useSearch();
}
export const Route = createFileRoute('/_auth/login')({ ... });

// ✅ no forward reference — from narrows the type correctly
import { useSearch } from '@tanstack/react-router';

function LoginPage() {
  const { redirectTo } = useSearch({ from: '/_auth/login' });
}
export const Route = createFileRoute('/_auth/login')({ ... });
```

Same fix applies to `Route.useLoaderData()` → `useLoaderData({ from })`, and
`Route.useRouteContext()` → `useRouteContext({ from })`.

---

## `'use client'` is a no-op in TanStack Start / Vite

**Symptom:** Components in `packages/web-ui` accumulate `'use client';` directives at the top of the
file.

**Why it happens:** The directive is a React Server Components convention (Next.js). It has no
effect in Vite-based projects, including TanStack Start. Editors and snippet libraries may auto-add
it, and it slips in undetected because the build doesn't warn.

**Fix:** Never add `'use client'` to files in `packages/web-ui`. If you find one, delete the line
and the blank line below it. The `@decksmith/web-ui` package has no RSC boundary — all components
run in the client bundle by definition.

---

## TanStack Form v1 + Zod Standard Schema — errors are objects, not strings

**`field.state.meta.errors` contains Zod issue objects, not plain strings.** When using the Standard
Schema integration (`validators={{ onChange: ZodSchema }}`), TanStack Form v1 passes raw Zod v4
issue objects into the errors array. Each object has shape
`{ origin, code, format, pattern, path, message }`. Rendering them directly crashes React with
"Objects are not valid as a React child".

**Fix:** always extract `.message` before rendering. Use a `toMessage` helper that is also safe for
plain strings (fallback for future integrations):

```ts
function toMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (
    e != null &&
    typeof e === 'object' &&
    'message' in e &&
    typeof (e as { message: unknown }).message === 'string'
  ) {
    return (e as { message: string }).message;
  }
  return String(e);
}
```

Only `message` is needed for display. The other fields (`code`, `path`, `format`…) are Zod internals
— custom messages belong in the schema definition (`.min(8, 'At least 8 characters')`), not in the
component.

---

## Tailwind v4 — `@source` path is relative to the CSS file, not the project root

**`@source` paths are resolved relative to the CSS file that contains the directive**, not the
project root or `vite.config.ts`. Count levels carefully.

From `apps/web/src/styles/globals.css` (4 levels deep from monorepo root), reaching
`packages/web-ui/src/` requires **four** `../`:

```css
/* ✅ correct — 4 levels up from apps/web/src/styles/ to monorepo root */
@source '../../../../packages/web-ui/src/**/*.{ts,tsx}';

/* ❌ wrong — only 3 levels up, resolves to apps/packages/… (does not exist) */
@source '../../../packages/web-ui/src/**/*.{ts,tsx}';
```

**Symptom of wrong path:** component structure renders (CSS vars from `tokens.css` work because they
are in a separate `@import`), but `Input`, `Button`, and other components from `web-ui` have no
visible styling — their Tailwind classes are never generated.

Compare to `apps/storybook/.storybook/preview.css` which is also 4 levels deep and uses the same
`../../../../` prefix.

---

## SSR — `useState` initializer reading `localStorage` causes hydration mismatch

Never read `localStorage` (or any browser-only API) synchronously in a `useState` initializer. The
server renders without that value → client hydrates with a different value → React hydration
mismatch.

```tsx
// ❌ wrong — server sees null, client sees 'dark' → mismatch
const [stored] = useLocalStorage<Theme>('decksmith-theme', null);

// ✅ correct — pass the value from the SSR loader via a prop
const [theme] = useState<Theme>(initialTheme ?? DEFAULT_THEME);
```

**Pattern:** store the preference in a cookie → root loader reads it server-side (`getCookie`) and
client-side (`document.cookie` parse) → passes it as a prop → `useState` initializer is identical on
both sides → no mismatch.

This is the same pattern as language persistence (`LANGUAGE_COOKIE` / `$getServerLanguage`). Any
user preference that affects SSR output should follow this model.

---

## Cookie parsing — `getCookie` vs `parseFromCookieString`

`getCookie(key)` from `@tanstack/react-start/server` returns the cookie **value** directly
(`'dark'`). `parseThemeFromCookieString` / `parseLangFromCookieString` expect a **full cookie
string** (`'decksmith-theme=dark; lang=en'`). Passing a raw value to a parser returns the default
silently.

```ts
// ❌ wrong — getCookie returns 'dark', not 'decksmith-theme=dark; ...'
parseThemeFromCookieString(getCookie(THEME_COOKIE) ?? ''); // → DEFAULT_THEME always

// ✅ correct — validate the raw value directly
const stored = getCookie(THEME_COOKIE);
return VALID_THEMES.includes(stored) ? stored : DEFAULT_THEME;

// ✅ correct — pass document.cookie (the full string) on the client
parseThemeFromCookieString(document.cookie);
```

## Turbo strict env — `VITE_*` build vars must be declared in `turbo.json`

Turborepo (v2, strict env mode by default) only passes environment variables to a task if they are
declared in `turbo.json`. When the build runs through `turbo` (as the Docker image does:
`pnpm turbo build --filter=...@decksmith/web`), an undeclared `VITE_API_URL` never reaches Vite, so
`import.meta.env.VITE_API_URL` is baked as `undefined` and the client falls back — e.g. to
`http://localhost:3000`, which then fails in production (`ERR_CONNECTION_REFUSED`).

Symptom is invisible in a local `vite build` (that bypasses turbo) and in an SSR-only smoke test
(the home route makes no API call) — it only surfaces when the browser bundle issues an API request.

```jsonc
// turbo.json — declare the var on the build task so turbo forwards it AND keys the cache on it
"build": {
  "dependsOn": ["^build"],
  "outputs": ["dist/**", "build/**", "storybook-static/**", ".vitepress/dist/**"],
  "env": ["VITE_API_URL"]
}
```

Verify the baked value in the client bundle: `import.meta.env` should contain `VITE_API_URL:""`
(empty → same-origin relative `/api`), not `VITE_API_URL:void 0`.
