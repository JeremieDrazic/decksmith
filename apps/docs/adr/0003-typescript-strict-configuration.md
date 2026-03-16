# ADR-0003: TypeScript Strict Mode Configuration

**Last Updated:** 2026-01-08 **Status:** Active **Context:** Decksmith

---

## Context

TypeScript is already chosen as the primary language for Decksmith. However, **how we configure
TypeScript** determines how effective it is at catching bugs.

The key questions:

- Should we enable strict mode?
- What compiler options should be standard across all packages?
- How do we structure `tsconfig.json` files in a monorepo?
- How strict should we be about type checking dependencies?

This decision affects the entire codebase and is difficult to change later (tightening strictness
requires fixing many errors).

## Current Decision

We will use **TypeScript strict mode** with the following configuration strategy:

1. **Base `tsconfig.json` at repository root** with strict mode enabled
2. **All packages extend the base config** with environment-specific overrides (DOM for web, Node
   for backend)
3. **Enable all strict flags** including `noUncheckedIndexedAccess`
4. **Use `moduleResolution: "bundler"`** for modern tooling (Vite, esbuild, Rollup)
5. **Set `skipLibCheck: true`** for flexibility with third-party dependencies
6. **Enable project references** for incremental builds and better IDE performance

**Key compiler options**:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  }
}
```

## Rationale

### Why Strict Mode

**"Clarity over cleverness"** — TypeScript strict mode makes implicit behavior explicit:

1. **`strict: true`**: Enables all strict type-checking options:
   - `noImplicitAny`: Forces explicit typing (no `any` by default)
   - `strictNullChecks`: `null` and `undefined` are not assignable to other types
   - `strictFunctionTypes`: Functions are contravariant in parameters
   - `strictBindCallApply`: Type-check `.bind()`, `.call()`, `.apply()`
   - `strictPropertyInitialization`: Class properties must be initialized
   - `noImplicitThis`: `this` must have explicit type
   - `alwaysStrict`: Emit `"use strict"` in JavaScript output

2. **`noUncheckedIndexedAccess: true`**: Array/object access returns `T | undefined`

   ```typescript
   const arr = [1, 2, 3];
   const x = arr[10]; // Type: number | undefined (not just number)
   ```

   This prevents the #1 source of runtime errors in TypeScript: assuming array indices are valid.

3. **`noImplicitOverride: true`**: Requires `override` keyword when overriding base class methods
   - Prevents accidental overrides when base class changes

4. **`noFallthroughCasesInSwitch: true`**: Catches missing `break` statements in switch cases

### Why `moduleResolution: "bundler"`

Modern bundlers (Vite, esbuild, Rollup) support:

- ESM and CJS imports interchangeably
- Extensionless imports (`import { foo } from './foo'` resolves to `foo.ts`)
- Package `exports` field resolution

`"bundler"` mode matches this behavior, while `"node16"` requires explicit extensions (`.js`), which
is verbose for TypeScript projects.

### Why `skipLibCheck: true`

**Pragmatic flexibility**: Many third-party libraries have minor type errors or depend on old
TypeScript versions. Checking library types can cause:

- Build failures from dependencies we don't control
- Slower type-checking
- Maintenance burden (waiting for library updates)

**Trade-off**: We won't catch type errors in dependencies, but we gain:

- Faster builds
- Fewer blockers from third-party type issues
- More flexibility to use the npm ecosystem

**Our code is still strictly checked** — `skipLibCheck` only affects `node_modules`, not our source
code.

### Why `verbatimModuleSyntax: true`

Forces explicit `import type` and `export type` for type-only imports:

```typescript
import type { User } from './types'; // Type-only import
import { getUser } from './api'; // Value import
```

Benefits:

- Better tree-shaking (bundlers can remove type-only imports)
- Clearer intent (explicit about types vs values)
- Prevents runtime imports of types

### Why Base Config + Extensions

**Monorepo structure**:

```
/tsconfig.json (base)
/apps/web/tsconfig.json (extends base, adds DOM)
/apps/api/tsconfig.json (extends base, adds Node types)
/packages/domain/tsconfig.json (extends base, minimal)
```

Benefits:

- **Consistency**: All packages have same strict settings
- **DRY**: No duplication of compiler options
- **Easy updates**: Change base config once, all packages inherit
- **Environment-specific**: Each package can add DOM or Node types as needed

## Trade-offs

**Benefits:**

- **Fewer runtime errors**: Strict mode catches entire classes of bugs at compile time
- **Better autocomplete**: Explicit types improve IDE suggestions
- **Easier refactoring**: TypeScript can track changes across the codebase
- **Consistent standards**: All packages use same strict settings
- **Self-documenting code**: Explicit types serve as inline documentation
- **Faster builds**: `skipLibCheck: true` reduces type-checking time

**Costs:**

- **More verbose code**: Must explicitly type parameters, return values, nullability
- **Longer compile times**: Strict checks take more time (mitigated by incremental builds and
  skipLibCheck)
- **Steeper learning curve**: New contributors must understand strict TypeScript
- **No dependency type checking**: Won't catch type errors in third-party libraries

**Risks:**

- **False sense of security**: TypeScript guarantees are only at compile time. Runtime validation
  (Zod) is still needed.
  - **Mitigation**: ADR-future will define validation strategy (Zod at boundaries)
- **Overly strict for prototyping**: Strict mode can slow down experimentation
  - **Mitigation**: For quick prototypes, use `@ts-expect-error` with a comment explaining why
- **Breaking changes when tightening**: If we start with loose config, tightening later requires
  fixing many errors
  - **Mitigation**: Start strict from day 1 (this ADR)

## Evolution History

### 2026-01-08: Initial decision

- Enabled all strict mode flags
- Chose `moduleResolution: "bundler"` for modern tooling
- Set `skipLibCheck: true` for pragmatic flexibility with dependencies
- Established base config + extensions pattern

## References

- [TypeScript Strict Mode Documentation](https://www.typescriptlang.org/tsconfig#strict)
- [TypeScript 5.0+ Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html#the-moduleresolution-compiler-option)
- [Why noUncheckedIndexedAccess matters](https://www.totaltypescript.com/books/total-typescript-essentials/essential-types-and-annotations#no-unchecked-indexed-access-could-have-caught-this)
- Related ADR: ADR-0002 (Monorepo structure explains base config inheritance)
