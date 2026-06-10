import { describe, expect, it } from 'vitest';

import { ApiError, isApiError } from './errors.js';

describe('ApiError', () => {
  it('assigns all properties from the response', () => {
    const error = new ApiError({
      statusCode: 401,
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
      message: 'No active session found.',
    });

    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.error).toBe('Unauthorized');
    expect(error.message).toBe('No active session found.');
    expect(error.name).toBe('ApiError');
  });

  it('is an instance of Error', () => {
    const error = new ApiError({
      statusCode: 500,
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong.',
    });

    expect(error).toBeInstanceOf(Error);
  });
});

describe('isApiError', () => {
  it('returns true for an ApiError instance', () => {
    const error = new ApiError({
      statusCode: 400,
      error: 'Bad Request',
      code: 'VALIDATION_ERROR',
      message: 'Invalid input.',
    });

    expect(isApiError(error)).toBe(true);
  });

  it('returns false for a plain Error', () => {
    expect(isApiError(new Error('something'))).toBe(false);
  });

  it('returns false for non-error values', () => {
    expect(isApiError(null)).toBe(false);
    expect(isApiError('string')).toBe(false);
    expect(isApiError({ code: 'UNAUTHORIZED' })).toBe(false);
  });
});
