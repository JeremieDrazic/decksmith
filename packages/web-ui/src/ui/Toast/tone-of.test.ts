import { describe, expect, it } from 'vitest';

import { toneOf } from './tone-of';

describe('toneOf', () => {
  it('returns the type as-is when it is a valid tone key', () => {
    expect(toneOf('success')).toBe('success');
    expect(toneOf('error')).toBe('error');
    expect(toneOf('warning')).toBe('warning');
    expect(toneOf('info')).toBe('info');
    expect(toneOf('loading')).toBe('loading');
    expect(toneOf('default')).toBe('default');
  });

  it('falls back to "default" for undefined', () => {
    expect(toneOf(undefined)).toBe('default');
  });

  it('falls back to "default" for unknown string values', () => {
    expect(toneOf('unknown')).toBe('default');
    expect(toneOf('')).toBe('default');
    expect(toneOf('SUCCESS')).toBe('default');
  });
});
