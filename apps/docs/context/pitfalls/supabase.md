# Pitfalls — Supabase

---

## Check `error.code`, not `error.message`

**Mistake:** `if (error.message.toLowerCase().includes('already registered')) { ... }`

**Why it's wrong:** Error messages from external SDKs can change between versions. This check can
break silently.

**Fix:** Always use `error.code` when available:

```typescript
if (error.code === 'user_already_exists') { ... }
```

Check the Supabase JS SDK docs for stable error codes.

---

## Keep Supabase error codes out of `packages/schema/errors/codes.ts`

**Mistake:** Adding Supabase-internal error codes (e.g. `user_already_exists`) to
`packages/schema/src/errors/codes.ts`.

**Why it's wrong:** `codes.ts` contains our **public API error codes** — the contract returned to
clients, used as i18n keys. Supabase error codes are infrastructure implementation details. Mixing
them breaks the separation of concerns.

**Fix:**

- Supabase error codes → `packages/db/src/supabase-error-codes.ts`
- Public API error codes → `packages/schema/src/errors/codes.ts`
