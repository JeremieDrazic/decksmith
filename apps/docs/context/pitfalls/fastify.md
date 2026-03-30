# Pitfalls — Fastify

---

## `FastifyPluginAsyncZod` vs `FastifyPluginCallbackZod`

**Mistake:** Using `FastifyPluginAsyncZod` even when the plugin has no top-level `await`
(e.g. a route file that only registers handlers synchronously).

**Why it's wrong:** An `async` function without `await` triggers a `require-await` warning.
The plugin doesn't need to be async if it only registers routes.

**Fix:** Use `FastifyPluginCallbackZod` + call `done()` at the end:

```typescript
const myRoutes: FastifyPluginCallbackZod = (app, _opts, done) => {
  app.get('/...', { schema: { ... } }, async (req, reply) => { ... });
  done();
};
```

Use `FastifyPluginAsyncZod` only when the plugin itself performs async operations at the root
level (e.g. DB connection, config loading).

---

## `eslint-disable` comments have no effect with Oxlint

**Mistake:** `// eslint-disable-next-line @typescript-eslint/require-await`

**Why it's wrong:** The project uses Oxlint, not ESLint. `eslint-disable` comments are silently
ignored — they suppress nothing.

**Fix:** Use `// oxlint-disable-next-line <rule>` for Oxlint, or better — fix the root cause
(see pitfall above).
