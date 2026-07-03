import { describe, expect, it } from 'vitest';

import { ApiError } from '@decksmith/api-client/errors';

import { getErrorCode } from './get-error-code.js';

describe('getErrorCode', () => {
  it('returns the error code when the error is an ApiError', () => {
    const error = new ApiError({
      statusCode: 401,
      error: 'Unauthorized',
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    });

    expect(getErrorCode(error)).toBe('INVALID_CREDENTIALS');
  });

  it('returns undefined for a generic JS Error', () => {
    expect(getErrorCode(new Error('Network failure'))).toBeUndefined();
  });

  it('returns undefined when error is null', () => {
    expect(getErrorCode(null)).toBeUndefined();
  });
});
