# Module Scaffold

Scaffold a new API module following the established patterns in `apps/api`.

---

## Process

### Step 1: Get the module name

Ask: "What is the module name? (e.g., `collection`, `deck`, `card`)"

The name must be:

- lowercase, kebab-case if multi-word (e.g., `craft-guide`)
- a domain noun, not a verb

### Step 2: Read the reference pattern

Read the entire `apps/api/src/modules/user/` directory:

- `user-routes.ts`
- `user-mapper.ts`

Also read `apps/api/src/plugins/v1-routes.ts` to understand route registration.

### Step 3: Identify the Zod schemas

Read `packages/schema/src/` to find the relevant domain folder.

Identify:

- The response DTO (e.g., `CollectionEntryDto`)
- The request DTOs (create, update)
- The error codes if any

If no schemas exist yet for this module, note it — schemas must be added to `packages/schema` before
routes can be implemented.

### Step 4: Read the spec

Read `docs/specs/<module-name>.md` if it exists.

Extract:

- The endpoints that need to be implemented
- The data shape expected
- Any business rules mentioned

### Step 5: Generate the routes file

Create `apps/api/src/modules/<name>/<name>-routes.ts`.

Follow the user module pattern:

- Named export of a Fastify plugin function
- JSDoc on the plugin function describing the module
- One handler per route, typed with Zod schemas from `packages/schema`
- No business logic in handlers — only orchestration
- Error handling via `fastify.httpErrors` from `@fastify/sensible`
- All responses use DTOs via the mapper (never raw Prisma objects)

### Step 6: Generate the mapper file

Create `apps/api/src/modules/<name>/<name>-mapper.ts`.

Follow the user mapper pattern:

- One exported function per Prisma model → DTO transformation
- JSDoc on each function
- Input: Prisma model type
- Output: DTO from `packages/schema`
- No database calls — pure data transformation

### Step 7: Register the routes

Read `apps/api/src/plugins/v1-routes.ts`.

Add the new module's plugin registration, following the existing pattern.

### Step 8: Summary

Output:

```
Created:
- apps/api/src/modules/<name>/<name>-routes.ts
- apps/api/src/modules/<name>/<name>-mapper.ts

Updated:
- apps/api/src/plugins/v1-routes.ts

Schemas used: [list]
Spec read: [yes/no — link if yes]

Missing: [anything that still needs to be created]
```

Then trigger `api-reviewer` to validate the generated files.

---

## Example Interaction

User: `/module.scaffold`

You: "What is the module name?"

User: "collection"

You: [reads user module, reads schema, reads spec, generates files, updates v1-routes]

> Created:
>
> - apps/api/src/modules/collection/collection-routes.ts
> - apps/api/src/modules/collection/collection-mapper.ts
>
> Updated:
>
> - apps/api/src/plugins/v1-routes.ts
>
> Schemas used: CollectionEntryDto, CreateCollectionEntryDto Spec read: docs/specs/collection.md ✅
>
> Running api-reviewer...

---

## Special Cases

### No spec exists

If `docs/specs/<name>.md` does not exist, warn:

> "No spec found for `<name>`. I'll scaffold based on the schema DTOs, but consider writing a spec
> first to define the expected behavior."

### No schemas exist

If `packages/schema/src/<name>/` does not exist:

> "No Zod schemas found for `<name>`. Please add schemas to `packages/schema` before scaffolding.
> This ensures the routes have typed contracts from the start."

Do NOT scaffold without DTOs — raw Prisma types in responses violate the architecture rules.

### Domain logic needed

If the spec describes business rules (validation, transformations, calculations):

> "The spec mentions [rule]. This belongs in `packages/domain/<name>.ts`, not in the route handler.
> Create the domain function first, then call it from the route."

---

## After Command

1. `api-reviewer` runs automatically
2. If domain logic is needed: implement in `packages/domain`, then run `domain-reviewer`
3. Run `test-writer` to generate tests for the new routes and any domain functions
4. Run `/roadmap.update` to mark the module scaffold step complete
