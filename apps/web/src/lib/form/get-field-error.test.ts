import { describe, expect, it, vi } from 'vitest';

import { getFieldError } from './get-field-error';

describe('getFieldError', () => {
  it('suppresses errors until the field is touched', () => {
    const result = getFieldError({ isTouched: false, errors: ['PASSWORD_TOO_SHORT'] });

    expect(result.hasError).toBe(false);
    expect(result.errors).toEqual([]);
  });

  it('reports no error when touched but the errors array is empty', () => {
    const result = getFieldError({ isTouched: true, errors: [] });

    expect(result.hasError).toBe(false);
    expect(result.errors).toEqual([]);
  });

  it('returns raw error messages when no translation function is passed', () => {
    const result = getFieldError({ isTouched: true, errors: ['PASSWORD_TOO_SHORT'] });

    expect(result.hasError).toBe(true);
    expect(result.errors).toEqual(['PASSWORD_TOO_SHORT']);
  });

  it('translates error codes when a translation function is passed', () => {
    const t = vi.fn(() => 'Password is too short');
    const result = getFieldError({ isTouched: true, errors: ['PASSWORD_TOO_SHORT'] }, t as never);

    expect(t).toHaveBeenCalledWith('PASSWORD_TOO_SHORT');
    expect(result.errors).toEqual(['Password is too short']);
  });

  it('extracts .message from error objects (Zod issue shape)', () => {
    const result = getFieldError({
      isTouched: true,
      errors: [{ message: 'USERNAME_INVALID_FORMAT' }],
    });

    expect(result.errors).toEqual(['USERNAME_INVALID_FORMAT']);
  });
});
