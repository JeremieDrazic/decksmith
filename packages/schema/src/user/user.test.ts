import { describe, expect, it } from 'vitest';

import { UpdateUserInputSchema, UsernameSchema } from './user.js';

// ---------------------------------------------------------------------------
// UsernameSchema
// ---------------------------------------------------------------------------

describe('UsernameSchema', () => {
  it('accepts a valid username', () => {
    expect(UsernameSchema.safeParse('testuser').success).toBe(true);
  });

  it('accepts usernames with numbers and underscores', () => {
    expect(UsernameSchema.safeParse('user_42').success).toBe(true);
  });

  it('rejects usernames shorter than 3 characters', () => {
    expect(UsernameSchema.safeParse('ab').success).toBe(false);
  });

  it('rejects usernames longer than 30 characters', () => {
    expect(UsernameSchema.safeParse('a'.repeat(31)).success).toBe(false);
  });

  it('rejects usernames that start with a number', () => {
    expect(UsernameSchema.safeParse('1user').success).toBe(false);
  });

  it('rejects usernames that start with an underscore', () => {
    expect(UsernameSchema.safeParse('_user').success).toBe(false);
  });

  it('rejects usernames with uppercase letters', () => {
    expect(UsernameSchema.safeParse('UserName').success).toBe(false);
  });

  it('rejects usernames with special characters', () => {
    expect(UsernameSchema.safeParse('user-name').success).toBe(false);
    expect(UsernameSchema.safeParse('user.name').success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// UpdateUserInputSchema
// ---------------------------------------------------------------------------

describe('UpdateUserInputSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(UpdateUserInputSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a partial update', () => {
    expect(UpdateUserInputSchema.safeParse({ displayName: 'New Name' }).success).toBe(true);
  });

  it('rejects an invalid avatar URL', () => {
    expect(UpdateUserInputSchema.safeParse({ avatarUrl: 'not-a-url' }).success).toBe(false);
  });

  it('accepts null avatar URL to remove avatar', () => {
    expect(UpdateUserInputSchema.safeParse({ avatarUrl: null }).success).toBe(true);
  });

  it('rejects a display name that is empty after trimming', () => {
    expect(UpdateUserInputSchema.safeParse({ displayName: '   ' }).success).toBe(false);
  });
});
