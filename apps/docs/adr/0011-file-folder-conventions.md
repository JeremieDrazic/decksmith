# ADR-0011: File and Folder Conventions

**Last Updated:** 2026-02-03 **Status:** Active **Context:** Decksmith

---

## Context

A monorepo with 13+ packages and 4 applications needs consistent conventions for:

- File naming (kebab-case vs PascalCase vs camelCase)
- Folder organization within packages
- Import patterns and module exports

Without clear conventions, the codebase becomes inconsistent, harder to navigate, and prone to
issues like circular dependencies and poor tree-shaking.

Key questions:

- How should files and folders be named?
- How should code be organized within packages?
- Should packages use barrel files (`index.ts`) or direct imports?

## Current Decision

### 1. File Naming Conventions

| Type                | Convention             | Example                  |
| ------------------- | ---------------------- | ------------------------ |
| Directories         | kebab-case             | `src/deck-builder/`      |
| React components    | PascalCase             | `DeckCard.tsx`           |
| Utilities/logic     | kebab-case             | `deck-validator.ts`      |
| Unit tests          | `*.test.ts` suffix     | `deck-validator.test.ts` |
| Storybook stories   | `*.stories.tsx` suffix | `DeckCard.stories.tsx`   |
| Type definitions    | kebab-case             | `deck-types.ts`          |
| Configuration files | kebab-case             | `vitest.config.ts`       |

**Enforced by**: ESLint `unicorn/filename-case` rule in `packages/config/eslint/base.js`

```javascript
'unicorn/filename-case': [
  'error',
  {
    cases: {
      kebabCase: true,
      pascalCase: true,
    },
  },
]
```

### 2. Folder Organization: Feature Folders

Code within packages is organized by **feature/domain**, not by type/layer.

**Example structure** (`packages/domain`):

```
packages/domain/src/
├── deck/
│   ├── validator.ts
│   ├── validator.test.ts
│   ├── builder.ts
│   ├── builder.test.ts
│   └── types.ts
├── card/
│   ├── parser.ts
│   ├── parser.test.ts
│   ├── normalizer.ts
│   └── types.ts
└── price/
    ├── calculator.ts
    ├── calculator.test.ts
    └── types.ts
```

**NOT this** (layer-based organization):

```
packages/domain/src/
├── validators/
│   ├── deck-validator.ts
│   └── card-validator.ts
├── types/
│   ├── deck.ts
│   └── card.ts
└── __tests__/
    └── ...
```

### 3. Import Strategy: No Barrels, Direct Imports

**NO `index.ts` barrel files** in packages.

```typescript
// ✅ YES - Direct imports
import { validateDeck } from '@decksmith/domain/deck/validator';
import { parseCard } from '@decksmith/domain/card/parser';
import { DeckSchema } from '@decksmith/schema/deck/schema';

// ❌ NO - Barrel imports
import { validateDeck, parseCard } from '@decksmith/domain';
import { DeckSchema } from '@decksmith/schema';
```

### 4. Package Exports Configuration

Each package's `package.json` uses **subpath exports** to expose modules:

```json
{
  "name": "@decksmith/domain",
  "exports": {
    "./deck/validator": "./src/deck/validator.ts",
    "./deck/builder": "./src/deck/builder.ts",
    "./deck/types": "./src/deck/types.ts",
    "./card/parser": "./src/card/parser.ts",
    "./card/types": "./src/card/types.ts",
    "./price/calculator": "./src/price/calculator.ts"
  }
}
```

**Benefits of explicit exports**:

- Only public API is exposed, internal modules stay private
- Clear contract of what each package provides
- TypeScript understands the module structure

## Rationale

### Why Feature Folders

1. **Cohesion**: Related code stays together (validator, types, tests for "deck" all in `deck/`)
2. **Scalability**: Adding a new feature = adding a new folder, not touching multiple folders
3. **Discoverability**: "Where is deck logic?" → `packages/domain/src/deck/`
4. **Colocated tests**: Tests live next to the code they test (per ADR-0006)
5. **Aligns with package separation**: Monorepo already separates by concern (schema, domain,
   api-client); feature folders continue this pattern within packages

**Comparison with layer-based**:

- Layer-based (validators/, types/, services/) scatters related code across folders
- To understand "deck validation", you'd look in 3+ different places
- Feature folders keep everything together

### Why No Barrel Files

Barrel files (`index.ts` that re-exports everything) cause problems:

1. **Circular dependencies**: Easy to create accidental cycles when everything re-exports everything
2. **Poor tree-shaking**: Bundlers may include unused exports from barrels
3. **Slower builds**: TypeScript must process entire barrel to resolve one import
4. **Hidden dependencies**: `import { X } from 'package'` hides where X actually comes from

**Direct imports solve these**:

- Explicit dependency graph, no hidden connections
- Better tree-shaking (only import what you use)
- Faster TypeScript resolution
- Clear origin of every import

### Why kebab-case + PascalCase

- **kebab-case for directories and utilities**: Consistent with npm, filesystem conventions, URLs
- **PascalCase for components**: React convention, matches component name to file name
- **No camelCase files**: Avoids case-sensitivity issues across operating systems

## Trade-offs

**Benefits:**

- **Explicit dependencies**: Every import shows exactly where code comes from
- **Better tree-shaking**: Bundlers only include what's actually imported
- **No circular deps**: Direct imports make dependency graph explicit and auditable
- **Fast builds**: TypeScript resolves imports faster without barrels
- **Clear structure**: Feature folders make codebase navigable

**Costs:**

- **Verbose imports**: `@decksmith/domain/deck/validator` is longer than `@decksmith/domain`
- **Manual exports**: Must update `package.json` exports when adding new modules
- **More directories**: Feature folders create more nesting than flat structure

**Risks:**

- **Inconsistent adoption**: Developers might create barrels out of habit
  - **Mitigation**: ESLint rule to disallow `index.ts` files (future)
- **Export maintenance burden**: Forgetting to add exports makes modules inaccessible
  - **Mitigation**: CI check that all `.ts` files in `src/` have corresponding exports (future)

## Evolution History

### 2026-02-03: Initial decision

- Established kebab-case for directories/utilities, PascalCase for components
- Chose feature folders over layer-based organization
- Decided against barrel files in favor of direct imports with subpath exports
- Documented package.json exports pattern

## References

- [Node.js Subpath Exports](https://nodejs.org/api/packages.html#subpath-exports)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Problems with Barrel Files](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/)
- Related: ADR-0004 (Code quality standards), ADR-0005 (Package boundaries)
