import { describe, expect, it } from 'vitest';

import { makePageHead } from './make-page-head';

describe('makePageHead', () => {
  it('builds a "<page> · Decksmith" title', () => {
    expect(makePageHead('Sign in')).toEqual({
      meta: [{ title: 'Sign in · Decksmith' }],
    });
  });

  it('handles an empty title', () => {
    expect(makePageHead('')).toEqual({
      meta: [{ title: ' · Decksmith' }],
    });
  });
});
