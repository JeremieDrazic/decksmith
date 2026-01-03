# Create Architecture Decision Record

Create a new ADR (Architecture Decision Record) for Decksmith.

ADRs are living documents that document architectural decisions.
They can be amended over time as the project evolves.

---

## Context: Decksmith Architecture

Project: Decksmith - Magic: The Gathering deck management tool

Architecture:
- Monorepo (pnpm + Turborepo)
- packages/schema: Zod schemas and DTOs
- packages/domain: Pure business logic (no HTTP, DB, or UI)
- packages/db: Prisma schema and database access (server-only)
- apps/api: Fastify REST API
- apps/worker: Background jobs (PDF generation, caching)
- apps/web: React SPA (Vite, TanStack Router/Query)

Core Values:
- Separation of concerns
- Explicit data contracts
- Deterministic behavior
- Maintainability
- Clarity over cleverness

Non-negotiable Rules:
- Prisma models NEVER exposed outside apps/api
- All API boundaries use DTOs from packages/schema
- Domain logic lives ONLY in packages/domain
- TypeScript strict mode everywhere
- No circular dependencies between packages

---

## File Locations

ADR Template: docs/adr/template.md
ADR Directory: docs/adr/
ADR Index: docs/adr/README.md

ADR Naming Convention: XXXX-short-kebab-case-title.md
Examples:
- 0001-use-fastify.md
- 0002-prisma-boundaries.md
- 0003-async-pdf-generation.md

---

## Process

### Step 1: Find next ADR number

1. Read the directory docs/adr/
2. Look for existing ADR files (format: XXXX-*.md)
3. Find the highest number
4. Use next sequential number (e.g., if 0002 exists, use 0003)
5. Tell the user: "This will be ADR-XXXX"

### Step 2: Read the template

Read docs/adr/template.md to understand the required structure.

The template has these sections:
- Title (# ADR-XXXX: Title)
- Metadata (Last Updated, Status, Context)
- Context (the problem/question)
- Current Decision (what was decided)
- Rationale (why it makes sense)
- Trade-offs (Benefits, Costs, Risks)
- Evolution History (chronological changes)
- References (links to related docs)

### Step 3: Discover context

Ask the user:

1. What architectural decision needs to be documented?
   - Be specific about what is being decided
   - Examples: "Choice of web framework", "Async PDF generation strategy", "DTO validation approach"

2. What is the context or problem that requires this decision?
   - What forces are at play?
   - What constraints exist?
   - Why is this decision necessary now?

### Step 4: Explore alternatives

Ask the user:

3. What alternatives were considered (if any)?
   - For each alternative, understand:
     * How would it work?
     * What are the pros?
     * What are the cons?
     * Why was it rejected (or not)?

If the user hasn't considered alternatives, help them think through at least 2-3 options.

### Step 5: Understand trade-offs

Ask the user:

4. What are the trade-offs of the chosen decision?
   - Benefits: What do we gain?
   - Costs: What do we lose or accept?
   - Risks: What could go wrong?

### Step 6: Align with values

Ask the user:

5. How does this decision align with Decksmith's core values?
   - Separation of concerns
   - Explicit data contracts
   - Deterministic behavior
   - Maintainability
   - Clarity over cleverness

Help the user articulate the alignment explicitly.

### Step 7: Generate the ADR

1. Use today's date for "Last Updated" and "Evolution History"

2. Create filename: docs/adr/XXXX-short-kebab-case-title.md
   - XXXX = the number you found in Step 1
   - short-kebab-case-title = descriptive title in kebab-case
   - Example: docs/adr/0003-async-pdf-generation.md

3. Follow the structure from docs/adr/template.md EXACTLY

4. Fill in all sections based on the answers from Steps 3-6:
   - Context: Use answer from Step 3, question 2
   - Current Decision: Clear statement of what was decided
   - Rationale: Use answer from Step 6 (alignment with values)
   - Trade-offs: Use answers from Step 5
     * Benefits subsection
     * Costs subsection
     * Risks subsection
   - Evolution History: Add initial entry with today's date
   - References: Include any related specs, ADRs, or external links

5. Status should be "Draft" by default (ask user if it should be "Active")

### Step 8: Update the index

1. Read docs/adr/README.md

2. Add a new row to the "Active ADRs" table with:
   - ADR number (with link to the file)
   - Title
   - Last Updated date
   - Status

3. Keep the table sorted by ADR number (ascending)

Example table row:
| [0003](0003-async-pdf-generation.md) | Async PDF generation with worker | 2025-01-04 | Draft |

### Step 9: Validate

Before finalizing, check:
- ADR number is sequential (no gaps in numbering)
- Filename matches pattern: XXXX-kebab-case.md
- Title in file matches filename
- All required sections are present (Context, Current Decision, Rationale, Trade-offs, Evolution History, References)
- No placeholder text left (like [TODO] or [Fill this in])
- Decision is stated clearly and unambiguously
- Trade-offs section has all three subsections (Benefits, Costs, Risks)
- Evolution History has at least one entry with today's date
- docs/adr/README.md has been updated

### Step 10: Show and confirm

Show the user:
1. The generated ADR file path
2. A brief summary of the decision
3. Ask: "Does this ADR accurately capture the decision?"
4. Ask: "Should I make any adjustments?"
5. Ask: "Is the status 'Draft' or 'Active'?"

---

## Example Complete ADR

When you generate the ADR, it should look like this (following docs/adr/template.md):

File: docs/adr/0001-use-fastify.md

    # ADR-0001: Use Fastify for API Server
    
    **Last Updated:** 2025-01-04
    **Status:** Active
    **Context:** Decksmith
    
    ---
    
    ## Context
    
    The API server (apps/api) requires a web framework. The choice impacts TypeScript developer experience, performance characteristics, plugin ecosystem, and long-term maintainability. We need explicit schema validation and first-class TypeScript support.
    
    ## Current Decision
    
    We will use Fastify as the web framework for apps/api instead of Express or other alternatives.
    
    ## Rationale
    
    Fastify aligns with Decksmith's core values:
    
    - Explicit data contracts: Built-in JSON schema validation that integrates well with our Zod schemas
    - TypeScript-first: Excellent type inference without @types packages
    - Clarity over cleverness: Explicit route registration and clear plugin boundaries
    - Maintainability: Active community, stable API, good documentation
    
    The framework's schema-first approach matches our architecture where all API boundaries use DTOs from packages/schema.
    
    ## Trade-offs
    
    **Benefits:**
    - Native TypeScript support with excellent type inference
    - Schema validation out of the box
    - Clear plugin system without middleware magic
    - Fast startup time and good performance
    
    **Costs:**
    - Slightly smaller ecosystem compared to Express
    - Fewer Stack Overflow answers and tutorials
    - Team needs to learn Fastify-specific patterns
    
    **Risks:**
    - Plugin ecosystem, while sufficient, is smaller than Express
    - Less familiar to developers coming from Express background
    
    ## Evolution History
    
    ### 2025-01-04: Initial decision
    - Chose Fastify over Express and Hono
    - Primary drivers: TypeScript DX and explicit validation
    - Aligns with project values of clarity and explicit contracts
    
    ## References
    
    - Fastify documentation: https://fastify.dev/
    - Related to future API endpoint implementations

---

## Example Interaction

User: "I want to create an ADR about using Fastify instead of Express"

You respond:
> I'll help you create an ADR for this decision. Let me first check what ADR number we should use.
> 
> [Check docs/adr/ directory]
> 
> This will be ADR-0001.
> 
> Now, let me ask some questions to create a comprehensive ADR.
> 
> 1. Context: What problem does the choice of web framework solve? 
>    What were the key factors in making this decision?

User: "We needed a framework with good TypeScript support and built-in validation"

You respond:
> 2. Alternatives: What other frameworks did you consider besides Express?
>    For each, what were the pros and cons?

User: "Express is more popular but has poor TypeScript support. Hono was considered but seemed too new."

You respond:
> 3. Trade-offs:
>    - Benefits: What specific benefits do we gain from choosing Fastify?
>    - Costs: What are we accepting (e.g., smaller ecosystem, learning curve)?
>    - Risks: Any concerns about long-term maintenance or compatibility?

User: [provides detailed answer]

You respond:
> 4. Alignment: How does choosing Fastify support Decksmith's values?
>    - Does it support "explicit contracts" (via schema validation)?
>    - Does it support "clarity over cleverness" (via plugin system vs middleware)?
>    - How about maintainability?

User: [provides answer]

You respond:
> Perfect! I'll now:
> 1. Create docs/adr/0001-use-fastify.md
> 2. Update docs/adr/README.md
> 
> [Generate files]
> 
> Created ADR-0001: Use Fastify for API Server
> 
> Does this accurately capture the decision? Should I adjust anything?
> Should the status be 'Draft' or 'Active'?

---

## Special Cases

### If docs/adr/template.md doesn't exist

Tell the user: "I need to read docs/adr/template.md but it doesn't exist yet. Should I create the ADR structure first?"

### If user is unsure about alternatives

Proactively suggest common alternatives based on the decision type:
- Web frameworks: Express, Hono, Koa, Nest.js
- Validation: Zod, Yup, io-ts, class-validator
- ORMs: Prisma, Drizzle, TypeORM, Kysely

Ask: "Would you like me to research the pros/cons of these alternatives?"

### If decision impacts multiple packages

Ask: "Which packages are affected by this decision?" 

Make sure to mention them explicitly in the Context section.

### If related specs exist

Ask: "Are there any specs (in docs/specs/) that relate to this decision?"

Link them in the References section.

### If decision needs immediate implementation

Offer: "Should I also create an implementation plan or update a spec to reflect this decision?"

---

## After ADR Creation

Ask the user:
1. "Should I commit this ADR now, or do you want to review it first?"
2. "Are there any code changes needed to align with this decision?"
3. "Should I create a task or spec to implement this decision?"

---

## Important Notes

- ADRs are LIVING DOCUMENTS - they can be amended later via the update-adr command
- Each amendment adds a new entry to Evolution History
- ADRs describe HOW (architecture), not WHAT (features - those go in specs)
- If a decision becomes obsolete, update Status to "Deprecated" and reference the superseding ADR
- Always read docs/adr/template.md to ensure you're following the current format
- Always update docs/adr/README.md when creating a new ADR
- ADR numbers must be sequential with no gaps (0001, 0002, 0003, not 0001, 0003, 0005)

---

## Tips for Good ADRs

DO:
- Be specific and concrete
- Acknowledge trade-offs honestly (both good and bad)
- Explain the "why", not just the "what"
- Link to relevant context (specs, docs, discussions)
- Keep it scannable (use sections, lists)
- Use today's date

DON'T:
- Be vague or ambiguous
- Hide costs or risks
- Skip alternatives (even if obvious)
- Use jargon without explanation
- Make it too long (if more than 2 pages, consider splitting)
- Leave placeholder text
- Skip updating the README