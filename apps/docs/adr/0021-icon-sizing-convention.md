# ADR-0021: Icon Sizing Convention in `packages/web-ui`

**Last Updated:** 2026-06-27 **Status:** Active **Context:** Decksmith

---

## Context

As `packages/web-ui` grew, six distinct strategies for sizing icons accumulated across the component
family — no single decision was made, it was pure drift:

| Component                | Strategy                                               | Problem                                                  |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| `Button`                 | `[&>svg]:size-[1em]` (em-relative)                     | Icon = font-size (14px at md), off-grid, no escape hatch |
| `IconButton`             | Private `iconSizeMap` (`size-3…6`)                     | OK but map duplicated locally, no escape hatch           |
| `IconToggle`             | None — inherits flat `size-4` from `toggleBaseClasses` | **Bug: `lg` = 16px icon in 44px square**                 |
| `Toggle` / `ToggleGroup` | `[&_svg:not(...)]:size-4` (flat)                       | Never scales with size variant                           |
| `Badge` / `Tag`          | None                                                   | Fully caller-controlled                                  |
| `Select`                 | `className="size-4"` hard-coded on Lucide component    | 4th distinct mechanism                                   |

`ICON_SIZE` in `lib/sizing/icon-size.ts` was documented as the canonical scale but was unused by
these components — `IconButton` had silently copied a near-duplicate private constant.

---

## Decision

**The parent component owns the icon size, derived from its `size` variant, via a central table.**
Callers pass bare icons (`<Plus />`) — no need to set a size class. An escape hatch allows overrides
for exceptional cases.

### Three-table system (one table per context)

There are three distinct icon-sizing contexts, each with its own table:

| Table             | File                            | Context                                     | Used by                                               |
| ----------------- | ------------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| `ICON_IN_CONTROL` | `lib/sizing/icon-in-control.ts` | Icon fills a square tap target (~50%)       | `IconButton`, `IconToggle`                            |
| `ICON_INLINE`     | `lib/sizing/icon-inline.ts`     | Icon beside a text label                    | `Button`, `Toggle`, `ToggleGroup`, `InputGroupButton` |
| `ICON_SIZE`       | `lib/sizing/icon-size.ts`       | Self-rendered icon with its own `size` prop | `Spinner`, `RarityBadge`, `ManaSymbol`                |

All tables use the same `xs | sm | md | lg` key scale. `ICON_SIZE` is applied directly as a class on
the icon element (unchanged). `ICON_IN_CONTROL` and `ICON_INLINE` use a **descendant selector with
an escape hatch**:

```
[&_svg:not([class*="size-"])]:size-X
```

The `:not([class*="size-"])` guard means a caller can pass `<Plus className="size-7" />` and the
component's default is silently ignored.

### Scale values

**`ICON_IN_CONTROL`** — fills ~50% of the square:

| Key | Icon size       | Square (CONTROL_SQUARE) | Fill |
| --- | --------------- | ----------------------- | ---- |
| xs  | `size-3` / 12px | 24px                    | 50%  |
| sm  | `size-4` / 16px | 32px                    | 50%  |
| md  | `size-5` / 20px | 36px                    | 55%  |
| lg  | `size-6` / 24px | 44px                    | 54%  |

**`ICON_INLINE`** — aligns visually with the label's cap height:

| Key | Icon size         | Control height | Label font       |
| --- | ----------------- | -------------- | ---------------- |
| xs  | `size-3.5` / 14px | h-6 / 24px     | text-xs / 12px   |
| sm  | `size-4` / 16px   | h-8 / 32px     | text-xs / 12px   |
| md  | `size-4` / 16px   | h-9 / 36px     | text-sm / 14px   |
| lg  | `size-5` / 20px   | h-11 / 44px    | text-base / 16px |

### Application per component

- **`IconButton`** — `ICON_IN_CONTROL[size]` on the icon wrapper span.
- **`IconToggle`** — `ICON_IN_CONTROL[size]` in each `size` variant of `iconToggleVariants`. Fixes
  the bug where a `lg` toggle showed a 16px icon in a 44px square.
- **`Toggle`** — flat `size-4` removed from `toggleBaseClasses`; `ICON_INLINE[size]` in each `size`
  variant of `toggleVariants`. `ToggleGroup` inherits automatically.
- **`Button`** — `ICON_INLINE[size]` on each `startIcon`/`endIcon` wrapper span (replacing
  `[&>svg]:size-[1em]`). Applied per-slot, not on the outer content span, to avoid interfering with
  composed components that pass icons as children (see InputGroupButton below).
- **`InputGroupButton`** — exception: uses a distinct size namespace (`sm|icon-sm|xs|icon-xs`).
  Manages icon sizing within `inputGroupButtonVariants`, one explicit class per size variant. No
  conflict with Button because Button's ICON_INLINE is scoped to `startIcon`/`endIcon` spans.
- **`Badge`** / **`Tag`** — `[&_svg:not([class*="size-"])]:size-3` (sm) and `:size-3.5` (md) added
  to `size` variants.
- **`InputGroupAddon`** — selector upgraded from direct-child `[&>svg]` to descendant `[&_svg]` for
  robustness; size remains `size-4`.

### Tailwind v4 layer-order constraint (why base classes cannot hold a default size)

In Tailwind v4, utility classes generated from the same `@layer utilities` block are ordered by
**first appearance in the scanned source**, not by position in `cn()`. This means two conflicting
`size-*` utilities (e.g. `size-4` from a base class and `size-5` from a size variant) have
unpredictable resolution — the `cn()` merge order does not help.

**The correct pattern**: never put an icon size in the base class. Put it only in the per-size
variant. This is why `toggleBaseClasses` no longer contains `size-4` — removing it was necessary to
make the per-size variant reliable.

---

## Consequences

### Positive

- Icon size is **deterministic and centrally defined** — no drift between components.
- Callers pass bare icons — no need to guess what size to set.
- **`IconToggle` bug fixed**: icon now scales with the control at all four sizes.
- `IconButton` rendering is identical to before but the map is now shared and overridable.
- `Toggle` and `ToggleGroup` icons now scale with the size variant.
- The escape hatch `[&_svg:not([class*="size-"])]:size-X` allows exceptional overrides without
  fighting specificity.

### Trade-offs

- `Button` at `md` size: icons change from 14px (1em of text-sm) to 16px (fixed). Visual change is
  subtle but intentional — 16px is on-grid and consistent with the rest of the system.
- `InputGroupButton` remains a local exception (distinct size namespace). Its sizing is explicit
  per-variant in its own CVA — documented here so future maintainers don't expect `ICON_INLINE`.

---

## Related

- ADR-0017 (`packages/tokens` architecture) — established that dimensions go in cva maps, not CSS
  tokens. This ADR extends that principle to icon sizes specifically.
- `lib/sizing/control-height.ts`, `control-square.ts`, `icon-size.ts`, `icon-in-control.ts`,
  `icon-inline.ts` — the five sizing tables.

---

## Evolution History

| Date       | Change                                                       |
| ---------- | ------------------------------------------------------------ |
| 2026-06-27 | Initial decision — three-table icon sizing system introduced |
