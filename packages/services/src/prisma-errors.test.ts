import { describe, expect, it, vi } from 'vitest';

const { MockPrismaError } = vi.hoisted(() => {
  class MockPrismaError extends Error {
    constructor(
      public readonly code: string,
      _options?: unknown
    ) {
      super(code);
    }
  }
  return { MockPrismaError };
});

vi.mock('@decksmith/db', () => ({
  Prisma: { PrismaClientKnownRequestError: MockPrismaError },
}));

import { isUniqueConstraintError } from './prisma-errors.js';

describe('isUniqueConstraintError', () => {
  it('returns true for a P2002 PrismaClientKnownRequestError', () => {
    const error = new MockPrismaError('P2002');

    expect(isUniqueConstraintError(error)).toBe(true);
  });

  it('returns false for a different Prisma error code', () => {
    const error = new MockPrismaError('P2003');

    expect(isUniqueConstraintError(error)).toBe(false);
  });

  it('returns false for a plain Error', () => {
    expect(isUniqueConstraintError(new Error('oops'))).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isUniqueConstraintError(null)).toBe(false);
    expect(isUniqueConstraintError({ code: 'P2002' })).toBe(false);
  });
});
