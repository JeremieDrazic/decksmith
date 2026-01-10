# ADR-0006: Testing Strategy with Vitest and Storybook

**Last Updated:** 2026-01-08 **Status:** Active **Context:** Decksmith

---

## Context

Testing is critical for maintaining code quality, especially in a monorepo with shared packages.
Different types of packages require different testing strategies:

- **Pure logic** (`packages/domain`) → unit tests, no mocks needed
- **Schema validation** (`packages/schema`) → validation contract tests
- **API clients** (`packages/api-client`) → HTTP mocking
- **React components** (`packages/web-ui`) → component tests + visual testing
- **APIs** (`apps/api`) → integration tests with database

Key decisions:

- Which test runner to use?
- Where should tests live (colocated vs separate)?
- How to test UI components (unit tests vs visual testing)?
- What testing patterns for each package type?
- How do we ensure tests run fast in CI?

## Current Decision

We will use **Vitest + Storybook** with the following strategy:

### Test Runners

- **Vitest** for all unit and integration tests (logic, schemas, API)
- **Storybook** with **play functions** for component testing (visual + interaction tests)
- **Playwright** (future) for E2E tests in `apps/web`

### Test Organization

- **Unit tests**: Colocated with source code (`foo.ts` → `foo.test.ts`)
- **Component tests**: Storybook stories with play functions (`Button.stories.tsx`)
- **Integration tests**: In `__tests__/` directories within packages/apps
- **E2E tests**: In `apps/web/e2e/` (future)

### Testing Strategy by Package Type

| Package/App           | Test Type          | Strategy                               |
| --------------------- | ------------------ | -------------------------------------- |
| `packages/schema`     | Contract tests     | Validate Zod schemas with Vitest       |
| `packages/domain`     | Unit tests         | Pure functions, no mocks, Vitest       |
| `packages/api-client` | Unit tests         | Mock HTTP with MSW + Vitest            |
| `packages/pdf`        | Snapshot tests     | Assert PDF output with Vitest          |
| `packages/web-ui`     | Component tests    | **Storybook stories + play functions** |
| `packages/native-ui`  | Component tests    | Storybook (React Native support)       |
| `apps/api`            | Integration tests  | Test database with Vitest              |
| `apps/worker`         | Integration tests  | Test PDF generation with Vitest        |
| `apps/web`            | E2E tests (future) | Playwright for user flows              |

### Shared Configuration

- **Vitest**: Shared config in `packages/config/vitest.config.ts` (future)
- **Storybook**: Shared config in `packages/config/.storybook/` (future)

## Rationale

### Why Vitest

1. **Fast**: Vite-powered, uses esbuild for transforms (10x faster than Jest)
2. **Vite-compatible**: Shares configuration with `apps/web` (using Vite)
3. **Jest-compatible API**: Familiar `describe`, `it`, `expect` syntax
4. **TypeScript-first**: Native TypeScript support, no extra setup
5. **Modern**: ESM-first, supports top-level await

**Comparison with Jest**:

- Jest is mature and stable, but slower (uses Babel, not esbuild)
- Jest requires extra config for ESM (`"type": "module"`)
- Vitest is faster and aligns with Vite (already chosen for `apps/web`)

**Verdict**: Vitest is the best fit for logic/API testing in a modern TypeScript + Vite stack.

### Why Storybook for Component Testing

**Storybook** serves dual purpose: **documentation + testing**

1. **Visual documentation**: Developers see component variants in isolation
2. **Play functions**: Test interactions (clicks, typing) directly in stories
3. **Visual regression testing**: Catch UI regressions via snapshots (future: Chromatic)
4. **No separate test files**: Stories serve as both examples and tests
5. **Better DX**: Hot reload, visual feedback, isolated component development

**Traditional component testing** (React Testing Library):

```tsx
// Button.test.tsx
describe('Button', () => {
  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

**Storybook with play functions**:

```tsx
// Button.stories.tsx
export const Primary: Story = {
  args: { children: 'Click me' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

**Benefits of Storybook approach**:

- **Single source of truth**: Story is both documentation and test
- **Visual context**: See component while testing
- **Reusable**: Same story used for docs, visual regression, interaction tests
- **Less duplication**: No separate `Button.test.tsx` and `Button.stories.tsx`

### Why Colocated Unit Tests (for Logic)

**`foo.ts` next to `foo.test.ts`** (not in separate `test/` directory)

**Benefits**:

- Tests are easy to find (next to the code they test)
- Easier to keep tests in sync with implementation
- Encourages testing (less friction to add tests)
- Import paths are simpler (`'./foo'` not `'../src/foo'`)

**Applies to**: `packages/schema`, `packages/domain`, `packages/api-client`, `apps/api`,
`apps/worker`

**Does NOT apply to**: `packages/web-ui`, `packages/native-ui` (use Storybook instead)

### Why Integration Tests in `__tests__/`

For tests that span multiple modules or require setup (database, HTTP server), a separate directory
is clearer:

```
apps/api/
├── src/
│   ├── routes/
│   │   ├── decks.ts
│   │   └── decks.test.ts (unit tests for route logic)
│   └── __tests__/
│       └── decks.integration.test.ts (full HTTP + DB tests)
```

**Benefits**:

- Clear distinction between unit tests (fast, isolated) and integration tests (slower, dependencies)
- Integration tests can share fixtures and setup code

### Testing Strategy for Key Packages

#### `packages/domain` (Pure Unit Tests with Vitest)

**Example**: Testing deck validation logic

```typescript
// packages/domain/src/deck-validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateDeck } from './deck-validator';

describe('validateDeck', () => {
  it('rejects decks with more than 100 cards', () => {
    const deck = { cards: Array(101).fill({ name: 'Island' }) };
    expect(validateDeck(deck).valid).toBe(false);
  });
});
```

**No mocks needed** — pure functions with deterministic outputs.

#### `packages/schema` (Contract Tests with Vitest)

**Example**: Testing Zod schema validation

```typescript
// packages/schema/src/deck.test.ts
import { describe, it, expect } from 'vitest';
import { DeckSchema } from './deck';

describe('DeckSchema', () => {
  it('accepts valid deck', () => {
    const result = DeckSchema.safeParse({ name: 'My Deck', cards: [] });
    expect(result.success).toBe(true);
  });

  it('rejects deck without name', () => {
    const result = DeckSchema.safeParse({ cards: [] });
    expect(result.success).toBe(false);
  });
});
```

**Validates contracts** — ensures DTOs accept/reject correct shapes.

#### `packages/api-client` (HTTP Mocking with MSW + Vitest)

**Example**: Testing API client without real HTTP

```typescript
// packages/api-client/src/decks.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getDecks } from './decks';

const server = setupServer(
  http.get('/api/decks', () => HttpResponse.json([{ id: 1, name: 'Test' }]))
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('getDecks', () => {
  it('fetches decks from API', async () => {
    const decks = await getDecks();
    expect(decks).toHaveLength(1);
  });
});
```

**MSW (Mock Service Worker)** intercepts HTTP requests, no real server needed.

#### `packages/web-ui` (Storybook with Play Functions)

**Example**: Testing Button component with interactions

```tsx
// packages/web-ui/src/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { within, userEvent, expect } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  args: { onClick: fn() }, // Mock function tracked by Storybook
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};

export const WithClickInteraction: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Simulate user interaction
    await userEvent.click(button);

    // Assert onClick was called
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled',
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Try to click disabled button
    await userEvent.click(button);

    // Assert onClick was NOT called
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
```

**Benefits**:

- **Visual documentation**: See all button variants
- **Interaction testing**: Play functions test clicks, hovers, keyboard input
- **Single file**: No separate test file needed
- **Runs in Storybook**: Test during development, not just in CI

**Storybook test runner** (future): Run play functions in CI via `test-storybook` command.

#### `apps/api` (Integration Tests with Database)

**Example**: Testing API routes with real database

```typescript
// apps/api/src/__tests__/decks.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer } from '../test-utils';

describe('POST /api/decks', () => {
  let server: Awaited<ReturnType<typeof createTestServer>>;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('creates a new deck', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/decks',
      payload: { name: 'Test Deck' },
    });
    expect(response.statusCode).toBe(201);
  });
});
```

**Note**: Requires test database setup (Supabase test instance or local Postgres). Implementation
deferred to future PR.

### Storybook Configuration Strategy

**Shared Storybook config** in `packages/config/.storybook/`:

- `main.ts`: Stories location, addons, framework config
- `preview.ts`: Global decorators, parameters

**Package-specific stories**:

```
packages/web-ui/
├── src/
│   ├── Button.tsx
│   ├── Button.stories.tsx (story + play functions)
│   └── Card.stories.tsx
```

**Storybook runs at**:

- **Development**: `pnpm storybook` (hot reload, visual testing)
- **CI** (future): `pnpm test-storybook` (run play functions as tests)

## Trade-offs

**Benefits:**

- **Fast feedback**: Vitest is 10x faster than Jest, tests run in milliseconds
- **Visual documentation**: Storybook shows component library
- **Interaction testing**: Play functions test user behavior directly in stories
- **Single source of truth**: Stories serve as docs, examples, and tests
- **Catches regressions**: Automated tests prevent breaking changes
- **Enforces contracts**: Tests validate that `packages/schema` DTOs work as expected
- **Confident refactoring**: Change code without fear of breaking things

**Costs:**

- **Maintenance burden**: Tests must be updated when code changes
- **Initial overhead**: Writing tests and stories takes time upfront
- **Learning curve**: Play functions require learning Storybook's testing API
- **Two testing tools**: Vitest (logic) + Storybook (components) adds complexity

**Risks:**

- **Over-testing**: Testing implementation details makes tests brittle
  - **Mitigation**: Test behavior, not implementation (play functions test user interactions)
- **Under-testing**: Skipping tests to move faster creates tech debt
  - **Mitigation**: Require tests for `packages/domain` and `packages/schema` (critical logic)
- **Slow CI**: Large test suite slows down CI
  - **Mitigation**: Turborepo caches test results, only retests changed packages
- **Storybook bloat**: Too many stories can slow Storybook startup
  - **Mitigation**: Use Storybook's code splitting, lazy load stories

## Evolution History

### 2026-01-08: Initial decision

- Chose Vitest as primary test runner for logic and API tests (fast, Vite-compatible)
- Chose Storybook with play functions for component testing (visual + interaction)
- Defined colocated unit tests (`foo.test.ts` next to `foo.ts`) for non-component code
- Defined Storybook stories (`Button.stories.tsx`) for UI components
- Defined integration tests in `__tests__/` directories
- Deferred E2E testing (Playwright) and visual regression (Chromatic) to future PRs

## References

- [Vitest Documentation](https://vitest.dev/)
- [Storybook Documentation](https://storybook.js.org/)
- [Storybook Play Functions](https://storybook.js.org/docs/writing-stories/play-function)
- [Storybook Test Runner](https://storybook.js.org/docs/writing-tests/test-runner)
- [Mock Service Worker (MSW)](https://mswjs.io/)
- [Playwright](https://playwright.dev/) (E2E testing, future)
- Related ADR: ADR-0004 (Code quality standards), ADR-0005 (Package boundaries influence testing
  strategy)
