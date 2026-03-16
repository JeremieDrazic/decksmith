# ADR-0013: Migrate to Oxlint and Oxfmt

**Last Updated:** 2026-03-15 **Status:** Active **Context:** Decksmith

---

## Context

ADR-0004 established ESLint + Prettier as the code quality toolchain. Both tools have been the
industry standard for years, but the Rust-based tooling ecosystem matured significantly in
2025–2026:

- **Oxfmt** (beta, February 2026): A Prettier-compatible formatter written in Rust. Claims 100%
  formatting parity with Prettier for JS/TS, runs ~30x faster. Official migration CLI provided.
  Already adopted by Turborepo, Vue.js core, and Sentry.
- **Oxlint** (1.0 stable, 2026): A Rust-based linter with 695+ rules. Natively supports the rule
  sets we use: `unicorn`, `import/no-cycle`, `react`, `jsx-a11y`. As of March 11, 2026, a **JS
  Plugins Alpha** enables running standard ESLint v9-compatible plugins without modification — any
  gap in native rule coverage can be filled with a JS plugin.
- **tsgolint (alpha)**: Type-aware linting via Oxlint's `--type-aware` flag. Covers 43–59 of
  `typescript-eslint`'s type-aware rules. JS plugins fill any remaining gap in coverage from
  `strictTypeChecked`.

The project is still pre-feature (Phase 0 infrastructure), making this the ideal moment to migrate
before the codebase grows.

## Current Decision

Replace Prettier with Oxfmt and ESLint with Oxlint across the entire monorepo.

Migration will use the official CLIs:

1. `pnpm oxfmt --migrate=prettier` to convert `.prettierrc.json` → `.oxfmtrc.jsonc`
2. `npx @oxlint/migrate --type-aware` to convert `eslint.config.js` files → `.oxlintrc.json`

The existing `packages/config/eslint/` directory is replaced with `packages/config/oxlint/`.

## Rationale

This decision aligns with Decksmith's core values:

**Deterministic behavior**: Oxfmt guarantees identical formatting output to Prettier on JS/TS, so no
reformatting churn during migration. The `--migrate=prettier` flag reads the existing config and
produces equivalent output.

**Maintainability**: Rust-based tools are significantly faster (30x formatter, ~10–20x linter). In a
Turborepo monorepo with many packages, this directly reduces developer feedback loop and CI time.

**Clarity over cleverness**: Both tools have explicit config files (`.oxfmtrc.jsonc`,
`.oxlintrc.json`) with a clear structure. The migration CLIs produce readable, auditable output.

**No Biome**: Biome was evaluated and rejected for the same reasons documented in ADR-0004 (smaller
ecosystem, fewer rules, migration risk). Oxlint and Oxfmt each specialize in one task, following
Unix philosophy — they are not attempting to be an all-in-one tool. This also means they can be
updated independently.

## Trade-offs

**Benefits:**

- ~30x faster formatting; significantly faster linting — reduces CI time and editor feedback latency
- Official migration CLIs handle the conversion automatically; minimal manual work
- `import/no-cycle`, `unicorn`, `react`, `jsx-a11y` all natively supported — no plugin gaps for our
  current rule set
- JS Plugins Alpha means any ESLint plugin can fill future gaps — not locked out of the ecosystem
- Type-aware rules via tsgolint cover the most critical subset of `strictTypeChecked`
- Smaller `node_modules` surface: removes `eslint`, `prettier`, `typescript-eslint`,
  `eslint-plugin-*`, `eslint-config-prettier`, `eslint-plugin-prettier`

**Costs:**

- tsgolint is alpha — not all `strictTypeChecked` rules are covered yet (43–59 of the full set)
- JS Plugins Alpha introduces a new dependency model (JS plugins in an otherwise Rust tool)
- Team must learn new config file formats (`.oxfmtrc.jsonc`, `.oxlintrc.json`)
- Oxfmt is still in beta; API may change before 1.0

**Risks:**

- **tsgolint rule gaps**: Some type-aware rules from `typescript-eslint/strictTypeChecked` may not
  be enforced. Mitigation: audit the migrated config against the original ESLint config; add JS
  plugins for critical missing rules; document any intentionally dropped rules in Evolution History.
- **Oxfmt beta instability**: If Oxfmt introduces a breaking config change before 1.0, we need to
  update `.oxfmtrc.jsonc`. Mitigation: pin the Oxfmt version in `pnpm-workspace.yaml` catalog; only
  update after reviewing the changelog.
- **Editor integration**: Oxlint and Oxfmt VSCode extensions exist but may be less mature than the
  ESLint and Prettier extensions. Mitigation: document setup in CLAUDE.md or a developer guide.

## Evolution History

### 2026-03-15: Initial decision

- Decided to migrate from ESLint + Prettier to Oxlint + Oxfmt
- Key driver: Oxfmt beta reached Prettier parity with official migration CLI; Oxlint 1.0 + JS
  Plugins Alpha covers all rule sets used in `packages/config/eslint/base.js`
- Timing: pre-feature phase makes this the lowest-friction migration window
- Biome reconsidered and rejected for the same reasons as ADR-0004 — single-task tools preferred
- tsgolint alpha coverage gap accepted as acceptable risk given JS plugin escape hatch
- Supersedes the tooling choice in ADR-0004 (Prettier + ESLint); ADR-0004 remains active for all
  other formatting standards (semi, quotes, printWidth, etc.)

## References

- [Oxfmt migration from Prettier](https://oxc.rs/docs/guide/usage/formatter/migrate-from-prettier.html)
- [Oxlint migration from ESLint](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint.html)
- [Oxlint 1.0 release](https://oxc.rs/blog/2024-09-29-announcing-oxlint.html)
- [Oxlint JS Plugins Alpha](https://oxc.rs/blog/2026-03-11-js-plugins-alpha.html)
- Related: ADR-0004 (Code Quality and Formatting Standards — superseded for tooling choice only)
- Related: ADR-0002 (Monorepo — shared config strategy applies to Oxlint configs too)
