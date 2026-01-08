# ADR-0001: Use Fastify as Web Framework for apps/api

**Last Updated:** 2026-01-01
**Status:** Active
**Context:** Decksmith

---

## Context

At the beginning of the Decksmith project (January 2026), we needed to choose a web framework for `apps/api`. The API will evolve beyond simple CRUD operations and needs a structured, explicit, and scalable foundation.

Key requirements:
- Support for a product that will grow in complexity over time
- Clear separation between auth, decks, print jobs, and external integrations (Scryfall)
- Strong alignment with our architectural values: explicit contracts, separation of concerns, and deterministic behavior
- TypeScript support that guides development rather than just being compatible

The framework choice directly impacts:
- How easily the API can be extended and maintained
- How well contracts between frontend and backend are enforced
- How the AI assistant (Claude Code) can help maintain architectural discipline

## Current Decision

**We will use Fastify as the web framework for `apps/api`.**

All HTTP routes, request validation, response serialization, and API structure will be built on Fastify's plugin system and schema-based validation.

## Rationale

Fastify aligns exceptionally well with Decksmith's core values:

### 1. Explicit Contracts (Primary Reason)

Fastify is designed for schema-based validation at every route:
- Each route declares its input schema (body, params, query)
- Each route declares its output schema (response)
- Validation is automatic, not optional
- Invalid DTOs are rejected at the system boundary

This makes it nearly impossible to send invalid data to the frontend and creates a natural path for integrating Zod (our DTO validation library). With Express, this discipline would be optional and require custom implementation.

### 2. Separation of Concerns via Plugins

Fastify's plugin system with encapsulation enables clean domain boundaries:
- Each plugin can encapsulate routes, hooks, and decorators for a specific domain (auth, decks, print-jobs, scryfall)
- Hooks and middleware are scoped to specific route subtrees, preventing global side effects
- The API naturally organizes into "modules" that align with bounded contexts

This prevents the common Express problem where global middleware order becomes critical and effects leak across unrelated routes.

### 3. Deterministic Behavior

Fastify provides predictable behavior through:
- **Systematic validation**: Same invalid request always produces the same error at the same place (route boundary)
- **Encapsulated hooks**: Auth or rate limiting applies only to explicit route subtrees, not accidentally to everything
- **Controlled serialization**: Response schemas reduce accidental JSON variations that can break clients
- **Uniform error handling**: Consistent error pipeline produces stable, predictable responses

This is critical for a multi-client system (web + mobile) where unpredictable API behavior creates costly bugs.

### 4. Clarity Over Cleverness

Fastify is more explicit than Express:
- **Declared schemas** make contracts visible, not implicit
- **Scoped plugins** make it clear where rules apply
- **Structured logging** (via Pino) makes observability straightforward

While Fastify requires more initial boilerplate than Express's permissive `req, res` model, it avoids Express's implicit magic (middleware mutation of `req`, unpredictable global middleware order).

### 5. Architectural Guardrails for AI-Assisted Development

Fastify's opinionated structure acts as an implicit architectural guardrail:
- The AI is less free to make arbitrary choices
- Bad ideas "resist" earlier (missing schema, wrong plugin scope)
- The project stays coherent longer with less manual oversight

This is particularly valuable when working with AI assistants like Claude Code.

### Additional Benefits

- **Structured logging**: Built-in Pino integration provides request correlation and observability without custom implementation
- **TypeScript-first design**: Types are coherent across `request`, `reply`, `params`, `body`, reducing glue code and improving autocomplete
- **Performance**: Low overhead and fast serialization provide headroom for polling (PDF jobs) and multiple clients, though this was not the primary motivator

## Trade-offs

### Benefits
- Schema validation is built-in and natural, not bolted on
- Plugin encapsulation prevents leaky abstractions and global side effects
- Clear structure scales better as the API grows in complexity
- Aligned with DTO + Zod + domain-driven approach
- Better observability out of the box (structured logging, error handling)
- TypeScript support that structures thinking, not just provides types

### Costs
- **Steeper learning curve**: Fastify requires understanding schemas, plugins, encapsulation, and hooks upfront—more initial investment than Express's permissive model
- **More complex for simple cases**: A "hello world" route requires more boilerplate (plugin declaration, schema definition) than Express
- **Smaller ecosystem**: Fewer community plugins than Express, though core needs (auth, CORS, rate limiting, multipart, websockets) are well covered
- **Fewer beginner resources**: Less Stack Overflow content and copy-paste snippets, though official documentation is excellent and Claude Code handles Fastify well
- **Less flexible by design**: Fastify constrains certain patterns that are trivial in Express—this is intentional and aligns with our values, but represents a loss of "freedom"

### Risks
- **Over-engineering for a personal project**: Mitigated by incremental approach and conscious scope control
- **Framework maintenance**: Low risk—Fastify is stable, mature, used in production by major companies, with a solid core team
- **Lock-in if we change direction**: Low risk—Fastify is just the API layer; routes, DTOs, and domain logic are portable to other frameworks if needed
- **Framework loses popularity**: Very low risk—Fastify has consistent releases and strong adoption

**The costs are consciously accepted**: we pay complexity upfront to avoid maintenance debt later. The framework's constraints align with our architectural goals rather than fighting them.

## Evolution History

### 2026-01-01: Initial decision
- Chose Fastify over Express and Hono for `apps/api`
- Primary motivation: schema-based validation and plugin encapsulation
- Accepted trade-off: steeper learning curve in exchange for better long-term structure and explicit contracts
- Alternatives considered:
  - **Express**: Would work but requires custom discipline for validation, error handling, and structure—Fastify provides these by default
  - **Hono**: Excellent minimal framework, but more oriented toward edge/serverless and "assemble your own" approach—less suitable for a growing product API that needs built-in logging, scoping, and plugin ecosystem

## References

- [Fastify Documentation](https://fastify.dev/)
- [Fastify Schema Validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)
- [Fastify Plugins Guide](https://fastify.dev/docs/latest/Reference/Plugins/)
- Related: Future ADR on Zod integration with Fastify schemas
