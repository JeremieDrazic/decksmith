import { describe, expect, it } from 'vitest';

import { PasswordSchema, RegisterInputSchema } from './index.js';

// ---------------------------------------------------------------------------
// PasswordSchema
// ---------------------------------------------------------------------------

describe('PasswordSchema', () => {
  it('accepts a valid password', () => {
    expect(PasswordSchema.safeParse('Password1').success).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = PasswordSchema.safeParse('Abc123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('8 characters');
    }
  });

  it('rejects passwords without an uppercase letter', () => {
    const result = PasswordSchema.safeParse('password1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('uppercase');
    }
  });

  it('rejects passwords without a lowercase letter', () => {
    const result = PasswordSchema.safeParse('PASSWORD1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('lowercase');
    }
  });

  it('rejects passwords without a number', () => {
    const result = PasswordSchema.safeParse('Password');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('number');
    }
  });
});

// ---------------------------------------------------------------------------
// RegisterInputSchema
// ---------------------------------------------------------------------------

describe('RegisterInputSchema', () => {
  it('accepts valid registration data', () => {
    expect(
      RegisterInputSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
      }).success
    ).toBe(true);
  });

  it('accepts optional username when provided', () => {
    expect(
      RegisterInputSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
        username: 'testuser',
      }).success
    ).toBe(true);
  });

  it('rejects an invalid email address', () => {
    expect(
      RegisterInputSchema.safeParse({
        email: 'not-an-email',
        password: 'Password1',
      }).success
    ).toBe(false);
  });

  it('rejects a password that fails the strength rules', () => {
    expect(
      RegisterInputSchema.safeParse({
        email: 'user@example.com',
        password: 'weak',
      }).success
    ).toBe(false);
  });

  it('rejects an invalid username when provided', () => {
    expect(
      RegisterInputSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
        username: '1startswithnumber',
      }).success
    ).toBe(false);
  });
});
