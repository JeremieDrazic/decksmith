# ADR-0004: Code Quality and Formatting Standards

**Last Updated:** 2026-01-08 **Status:** Active **Context:** Decksmith

---

## Context

A monorepo with multiple applications and packages requires consistent code style and quality
standards. Without enforcement, code style drifts across packages, making the codebase harder to
read and maintain.

Key questions:

- How do we enforce consistent formatting?
- How do we catch logical errors that TypeScript can't?
- Should formatting and linting be automatic or manual?
- How do we share configuration across packages?

## Current Decision

We will use:

- **Prettier** for code formatting (automatic, zero-config)
- **ESLint** for linting (catch logical errors, enforce best practices)
- **Shared configuration** in `packages/config` (future) for reuse across all packages
- **Enforcement via CI** (future) and editor integration (immediate)

**Prettier configuration**:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**ESLint configuration** (to be implemented in packages/config):

- Extend `@typescript-eslint/recommended`
- Enable `eslint-plugin-react` for `apps/web` and `packages/web-ui`
- Enable `eslint-plugin-import` for import ordering
- Disable rules that conflict with Prettier (via `eslint-config-prettier`)

## Rationale

### Why Prettier

**"Clarity over cleverness"** — Prettier eliminates formatting debates entirely.

1. **Opinionated, zero-config**: No bikeshedding over brace style, indentation, or line length
2. **Automatic consistency**: Format on save, format in CI, never think about it again
3. **Diff clarity**: Consistent formatting makes git diffs focus on logic, not whitespace
4. **Editor support**: Works in VSCode, Vim, IntelliJ out of the box

**Configuration choices**:

- **`semi: false`**: Cleaner syntax, common in modern JS/TS (React, Vue, Svelte)
- **`singleQuote: true`**: Consistent with most modern codebases
- **`printWidth: 100`**: Balance between readability and horizontal space
- **`trailingComma: "es5"`**: Safer git diffs (adding a line doesn't modify previous line)
- **`arrowParens: "always"`**: Explicit syntax, easier to add types later
- **`endOfLine: "lf"`**: Unix line endings (macOS/Linux standard, Git normalization)

### Why ESLint

TypeScript catches type errors, but **not logical errors**:

- Unused variables (`@typescript-eslint/no-unused-vars`)
- Missing `await` on promises (`@typescript-eslint/no-floating-promises`)
- Accidental `==` instead of `===` (TypeScript allows both)
- React-specific issues (missing `key` props, hooks rules)

**ESLint complements TypeScript** by catching patterns TypeScript can't.

**Plugin strategy**:

- **`@typescript-eslint/eslint-plugin`**: TypeScript-specific rules
- **`eslint-plugin-react`**: React best practices (for web/mobile packages)
- **`eslint-plugin-import`**: Import ordering, no circular dependencies
- **`eslint-config-prettier`**: Disables ESLint formatting rules that conflict with Prettier

### Why Shared Config Package

Without shared config:

- Every package duplicates `.prettierrc`, `.eslintrc`
- Updates require changing 15+ files
- Packages drift out of sync over time

**With `packages/config`**:

```typescript
// apps/web/.eslintrc.js
module.exports = {
  extends: ['@decksmith/config/eslint-react'],
};
```

**Benefits**:

- Single source of truth
- Update once, applies everywhere
- Packages can extend with package-specific rules

**Note**: `packages/config` implementation is deferred to a future PR. This ADR documents the
strategy.

### Why Not Alternatives

**Biome**: New tool, combines Prettier + ESLint. Very fast, but:

- Smaller ecosystem (fewer plugins)
- Less mature (fewer rules implemented)
- Risk: If Biome development stalls, we're locked in

**Verdict**: Stick with Prettier + ESLint (industry standard, stable, large ecosystem).

**StandardJS**: Opinionated linter with built-in formatting. But:

- Can't customize rules (not suitable for enterprise)
- Less flexible than ESLint

## Trade-offs

**Benefits:**

- **Consistent code style**: No debates, no manual formatting
- **Fewer PR comments**: No more "add a space here" comments
- **Catches common mistakes**: ESLint catches logic errors TypeScript can't
- **Better diffs**: Automatic formatting makes diffs focus on logic
- **Faster onboarding**: New contributors don't need to learn style guide

**Costs:**

- **Build complexity**: Adds tools to the stack (Prettier, ESLint, plugins)
- **Learning curve**: Contributors must understand ESLint rules
- **Slower feedback**: Running linters adds time to CI (mitigated by Turborepo caching)
- **Rule fatigue**: Too many ESLint rules can slow development

**Risks:**

- **False positives**: ESLint may flag valid code (e.g., `any` types during prototyping)
  - **Mitigation**: Use `eslint-disable-next-line` with comments explaining why
- **Configuration drift**: Without discipline, packages may override shared config inconsistently
  - **Mitigation**: ADR-0002 (Monorepo) enforces shared configs via `packages/config`
- **Prettier reformatting noise**: Initial Prettier run touches many files
  - **Mitigation**: Run once in initial infrastructure PR (this PR)

## Evolution History

### 2026-01-08: Initial decision

- Chose Prettier for formatting (no semicolons, single quotes, 100 char width)
- Chose ESLint for linting (TypeScript + React plugins)
- Defined strategy for shared config in `packages/config` (implementation deferred)

## References

- [Prettier Documentation](https://prettier.io/)
- [ESLint Documentation](https://eslint.org/)
- [typescript-eslint](https://typescript-eslint.io/)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- Related ADR: ADR-0002 (Monorepo structure explains shared config strategy)
