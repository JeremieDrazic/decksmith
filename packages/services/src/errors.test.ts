import { describe, expect, it } from 'vitest';

import { ServiceError, isServiceError } from './errors.js';

describe('ServiceError', () => {
  it('sets code and message independently', () => {
    const error = new ServiceError('USER_NOT_FOUND', 'User not found');

    expect(error.code).toBe('USER_NOT_FOUND');
    expect(error.message).toBe('User not found');
  });

  it('uses code as message when message is omitted', () => {
    const error = new ServiceError('UNAUTHORIZED');

    expect(error.message).toBe('UNAUTHORIZED');
  });

  it('sets name to ServiceError', () => {
    const error = new ServiceError('SOME_CODE');

    expect(error.name).toBe('ServiceError');
  });

  it('is an instance of Error', () => {
    const error = new ServiceError('SOME_CODE');

    expect(error).toBeInstanceOf(Error);
  });
});

describe('isServiceError', () => {
  it('returns true for a ServiceError', () => {
    expect(isServiceError(new ServiceError('CODE'))).toBe(true);
  });

  it('returns false for a plain Error', () => {
    expect(isServiceError(new Error('oops'))).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isServiceError(null)).toBe(false);
    expect(isServiceError('string')).toBe(false);
    expect(isServiceError({ code: 'CODE' })).toBe(false);
  });
});
