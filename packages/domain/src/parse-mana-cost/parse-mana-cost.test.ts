import { describe, expect, it } from 'vitest';
import { parseManaCost } from './parse-mana-cost';

describe('parseManaCost', () => {
  it('parses a standard colored cost', () => {
    expect(parseManaCost('{2}{W}{U}')).toEqual(['2', 'w', 'u']);
  });

  it('parses a hybrid two-color symbol', () => {
    expect(parseManaCost('{U/B}')).toEqual(['ub']);
  });

  it('parses a 2-generic hybrid symbol', () => {
    expect(parseManaCost('{2/W}')).toEqual(['2w']);
  });

  it('parses a Phyrexian symbol', () => {
    expect(parseManaCost('{W/P}')).toEqual(['wp']);
  });

  it('parses a variable cost', () => {
    expect(parseManaCost('{X}{G}{G}')).toEqual(['x', 'g', 'g']);
  });

  it('parses snow mana', () => {
    expect(parseManaCost('{S}')).toEqual(['s']);
  });

  it('handles repeated symbols', () => {
    expect(parseManaCost('{W}{W}')).toEqual(['w', 'w']);
  });

  it('parses a complex cost', () => {
    expect(parseManaCost('{4}{W}{U}{B}')).toEqual(['4', 'w', 'u', 'b']);
  });

  it('returns [] for empty string', () => {
    expect(parseManaCost('')).toEqual([]);
  });

  it('returns [] when no braces are present', () => {
    expect(parseManaCost('2WU')).toEqual([]);
  });

  it('returns [] for unclosed brace', () => {
    expect(parseManaCost('{W')).toEqual([]);
  });

  it('returns [] for null passed as any', () => {
    expect(parseManaCost(null as unknown as string)).toEqual([]);
  });

  it('returns [] for undefined passed as any', () => {
    expect(parseManaCost(undefined as unknown as string)).toEqual([]);
  });

  it('passes unknown symbols through — renderer handles fallback', () => {
    expect(parseManaCost('{NOTACOLOR}')).toEqual(['notacolor']);
  });
});
