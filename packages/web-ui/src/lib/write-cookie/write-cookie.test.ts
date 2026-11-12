import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { writeCookie } from './write-cookie';

// jsdom's document.cookie getter only returns `name=value`, stripping attributes.
// To assert path / SameSite / max-age we intercept the setter and keep the raw string.
let written: string[];

beforeEach(() => {
  written = [];
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    set: (value: string) => written.push(value),
    get: () => written.join('; '),
  });
});

afterEach(() => {
  Reflect.deleteProperty(document, 'cookie');
});

describe('writeCookie', () => {
  it('writes name=value scoped to the whole site with SameSite=Lax (happy path)', () => {
    writeCookie('theme', 'dark');
    expect(written[0]).toContain('theme=dark');
    expect(written[0]).toContain('path=/');
    expect(written[0]).toContain('SameSite=Lax');
  });

  it('omits max-age by default — a session cookie', () => {
    writeCookie('theme', 'dark');
    expect(written[0]).not.toContain('max-age');
  });

  it('adds max-age when a lifetime is given', () => {
    writeCookie('theme', 'dark', { maxAgeSeconds: 3600 });
    expect(written[0]).toContain('max-age=3600');
  });

  it('honours a non-default SameSite', () => {
    writeCookie('token', 'abc', { sameSite: 'Strict' });
    expect(written[0]).toContain('SameSite=Strict');
    expect(written[0]).not.toContain('SameSite=Lax');
  });
});
