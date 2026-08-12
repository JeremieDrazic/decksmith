import type { NormalizedCardBundle, NormalizedFace } from '@decksmith/scryfall';
import { describe, expect, it } from 'vitest';

import { groupChunk } from './group-chunk.js';

// Minimal factories — only the fields groupChunk cares about carry meaning; the
// rest are filler to satisfy the normalized shapes.
function makeFace(oracleId: string, faceIndex: number): NormalizedFace {
  return { oracleId, faceIndex, name: `face-${faceIndex}`, colors: [] };
}

function makeBundle(
  oracleId: string,
  scryfallId: string,
  faces: NormalizedFace[] = []
): NormalizedCardBundle {
  return {
    card: {
      oracleId,
      name: `card-${oracleId}`,
      colors: [],
      colorIdentity: [],
      keywords: [],
      producedMana: [],
      cmc: 0,
      layout: 'normal',
      legalities: {},
      scryfallUri: `https://scryfall.com/${oracleId}`,
    },
    print: {
      scryfallId,
      oracleId,
      setCode: 'tst',
      setName: 'Test Set',
      collectorNumber: '1',
      rarity: 'common',
      finishes: ['nonfoil'],
      language: 'en',
    },
    faces,
  };
}

describe('groupChunk', () => {
  it('keeps one card and one print per distinct single-face bundle', () => {
    const seen = new Set<string>();
    const result = groupChunk([makeBundle('o1', 's1'), makeBundle('o2', 's2')], seen);

    expect(result.cards.map((c) => c.oracleId)).toEqual(['o1', 'o2']);
    expect(result.prints.map((p) => p.scryfallId)).toEqual(['s1', 's2']);
    expect(result.faces).toEqual([]);
    expect(seen).toEqual(new Set(['o1', 'o2']));
  });

  it('deduplicates a card seen twice within the same chunk, but keeps both prints', () => {
    const seen = new Set<string>();
    // Same oracle card, two different printings, in one chunk.
    const result = groupChunk([makeBundle('o1', 's1'), makeBundle('o1', 's2')], seen);

    expect(result.cards.map((c) => c.oracleId)).toEqual(['o1']);
    expect(result.prints.map((p) => p.scryfallId)).toEqual(['s1', 's2']);
    expect(seen).toEqual(new Set(['o1']));
  });

  it('does not re-emit a card seen in an earlier chunk, but still emits its print', () => {
    const seen = new Set<string>();
    groupChunk([makeBundle('o1', 's1')], seen); // chunk 1 emits the card
    const second = groupChunk([makeBundle('o1', 's2')], seen); // chunk 2: card already seen

    expect(second.cards).toEqual([]);
    expect(second.faces).toEqual([]);
    expect(second.prints.map((p) => p.scryfallId)).toEqual(['s2']);
  });

  it('flattens a multi-face card once, and never again on later printings', () => {
    const seen = new Set<string>();
    const faces = [makeFace('o1', 0), makeFace('o1', 1)];
    const result = groupChunk([makeBundle('o1', 's1', faces), makeBundle('o1', 's2', faces)], seen);

    expect(result.cards).toHaveLength(1);
    expect(result.faces.map((f) => f.faceIndex)).toEqual([0, 1]);
    expect(result.prints).toHaveLength(2);
  });

  it('returns empty lists and leaves the seen set untouched for an empty chunk', () => {
    const seen = new Set<string>(['o1']);
    const result = groupChunk([], seen);

    expect(result).toEqual({ cards: [], faces: [], prints: [] });
    expect(seen).toEqual(new Set(['o1']));
  });
});
