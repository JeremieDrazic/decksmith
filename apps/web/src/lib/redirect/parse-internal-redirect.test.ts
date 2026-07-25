import { describe, expect, it } from 'vitest';

import { parseInternalRedirect } from './parse-internal-redirect';

describe('parseInternalRedirect', () => {
  it('accepts a normal internal path', () => {
    expect(parseInternalRedirect('/dashboard')).toBe('/dashboard');
    expect(parseInternalRedirect('/decks/123?tab=stats')).toBe('/decks/123?tab=stats');
    expect(parseInternalRedirect('/')).toBe('/');
  });

  it('rejects protocol-relative URLs (//evil.com)', () => {
    expect(parseInternalRedirect('//evil.com')).toBeUndefined();
    expect(parseInternalRedirect('//evil.com/path')).toBeUndefined();
  });

  it(String.raw`rejects backslash tricks (/\evil.com)`, () => {
    expect(parseInternalRedirect(String.raw`/\evil.com`)).toBeUndefined();
  });

  it('rejects absolute URLs and non-internal values', () => {
    expect(parseInternalRedirect('https://evil.com')).toBeUndefined();
    expect(parseInternalRedirect('dashboard')).toBeUndefined();
    expect(parseInternalRedirect('')).toBeUndefined();
  });

  it('rejects non-string values', () => {
    expect(parseInternalRedirect(undefined)).toBeUndefined();
    expect(parseInternalRedirect(42)).toBeUndefined();
    expect(parseInternalRedirect(['/dashboard'])).toBeUndefined();
  });
});
