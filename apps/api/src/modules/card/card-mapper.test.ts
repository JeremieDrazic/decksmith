import type { PrismaCardFace, PrismaCardPrint } from '@decksmith/db';
import type { AutocompleteRow, CardSearchRow, CardWithPrintsRecord } from '@decksmith/services';
import { describe, expect, it } from 'vitest';

import {
  toAutocompleteResult,
  toCardPrint,
  toCardSearchResult,
  toCardWithPrints,
} from './card-mapper.js';

const ORACLE_ID = '0000aaaa-0000-0000-0000-000000000000';

const searchRow: CardSearchRow = {
  oracle_id: ORACLE_ID,
  name: 'Lightning Bolt',
  mana_cost: '{R}',
  type_line: 'Instant',
  colors: ['R'],
  cmc: 1,
  image_url: 'https://cards.example/bolt.png',
};

const autocompleteRow: AutocompleteRow = {
  oracle_id: ORACLE_ID,
  name: 'Lightning Bolt',
  mana_cost: '{R}',
  type_line: 'Instant',
  colors: ['R'],
  cmc: 1,
};

const print: PrismaCardPrint = {
  id: '1111bbbb-0000-0000-0000-000000000000',
  scryfallId: '2222cccc-0000-0000-0000-000000000000',
  oracleId: ORACLE_ID,
  setCode: 'lea',
  setName: 'Limited Edition Alpha',
  collectorNumber: '162',
  illustrationId: '3333dddd-0000-0000-0000-000000000000',
  imageUris: { front: { normal: 'https://cards.example/bolt.png' } },
  rarity: 'common',
  finishes: ['nonfoil'],
  prices: { usd: '1200.00' },
  pricesUpdatedAt: new Date('2026-01-02T03:04:05.000Z'),
  language: 'en',
  localizedName: null,
  localizedType: null,
  localizedText: null,
  releasedAt: new Date('1993-08-05T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const face: PrismaCardFace = {
  id: '4444eeee-0000-0000-0000-000000000000',
  oracleId: ORACLE_ID,
  faceIndex: 0,
  name: 'Delver of Secrets',
  manaCost: '{U}',
  typeLine: 'Creature — Human Wizard',
  oracleText: 'At the beginning of your upkeep…',
  colors: ['U'],
  power: '1',
  toughness: '1',
  loyalty: null,
  defense: null,
};

const cardRecord: CardWithPrintsRecord = {
  oracleId: ORACLE_ID,
  name: 'Lightning Bolt',
  manaCost: '{R}',
  typeLine: 'Instant',
  oracleText: 'Lightning Bolt deals 3 damage to any target.',
  power: null,
  toughness: null,
  loyalty: null,
  defense: null,
  colors: ['R'],
  colorIdentity: ['R'],
  keywords: [],
  producedMana: [],
  cmc: 1,
  layout: 'normal',
  legalities: { commander: 'legal', vintage: 'restricted' },
  rarities: ['common', 'uncommon'],
  finishes: ['nonfoil', 'foil'],
  sets: ['lea', 'm11'],
  scryfallUri: 'https://scryfall.com/card/lea/162',
  firstReleasedAt: new Date('1993-08-05T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  prints: [print],
  faces: [],
};

describe('toCardSearchResult', () => {
  it('maps a full row from snake_case to the DTO', () => {
    expect(toCardSearchResult(searchRow)).toEqual({
      oracleId: ORACLE_ID,
      name: 'Lightning Bolt',
      manaCost: '{R}',
      typeLine: 'Instant',
      colors: ['R'],
      cmc: 1,
      imageUrl: 'https://cards.example/bolt.png',
    });
  });

  it('passes through null mana cost, type line and image', () => {
    const result = toCardSearchResult({
      ...searchRow,
      mana_cost: null,
      type_line: null,
      image_url: null,
    });
    expect(result.manaCost).toBeNull();
    expect(result.typeLine).toBeNull();
    expect(result.imageUrl).toBeNull();
  });
});

describe('toAutocompleteResult', () => {
  it('maps the row and always sets imageUrl to null', () => {
    expect(toAutocompleteResult(autocompleteRow)).toEqual({
      oracleId: ORACLE_ID,
      name: 'Lightning Bolt',
      manaCost: '{R}',
      typeLine: 'Instant',
      colors: ['R'],
      cmc: 1,
      imageUrl: null,
    });
  });
});

describe('toCardPrint', () => {
  it('converts dates to ISO strings', () => {
    const dto = toCardPrint(print);
    expect(dto.releasedAt).toBe('1993-08-05T00:00:00.000Z');
    expect(dto.pricesUpdatedAt).toBe('2026-01-02T03:04:05.000Z');
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('maps null optional dates to null (not undefined)', () => {
    const dto = toCardPrint({ ...print, releasedAt: null, pricesUpdatedAt: null });
    expect(dto.releasedAt).toBeNull();
    expect(dto.pricesUpdatedAt).toBeNull();
  });

  it('passes the JSON image and price fields through unchanged', () => {
    const dto = toCardPrint(print);
    expect(dto.imageUris).toEqual({ front: { normal: 'https://cards.example/bolt.png' } });
    expect(dto.prices).toEqual({ usd: '1200.00' });
  });
});

describe('toCardWithPrints', () => {
  it('maps the card, converts dates, and nests the prints', () => {
    const dto = toCardWithPrints(cardRecord);
    expect(dto.oracleId).toBe(ORACLE_ID);
    expect(dto.firstReleasedAt).toBe('1993-08-05T00:00:00.000Z');
    expect(dto.prints).toHaveLength(1);
    expect(dto.prints[0]?.setCode).toBe('lea');
  });

  it('drops the search-support `sets` aggregate (not part of the DTO)', () => {
    const dto = toCardWithPrints(cardRecord);
    expect('sets' in dto).toBe(false);
  });

  it('maps a null firstReleasedAt to null', () => {
    const dto = toCardWithPrints({ ...cardRecord, firstReleasedAt: null });
    expect(dto.firstReleasedAt).toBeNull();
  });

  it('maps multi-face cards face-by-face (dropping DB-only ids)', () => {
    const dto = toCardWithPrints({ ...cardRecord, faces: [face] });
    expect(dto.faces).toEqual([
      {
        faceIndex: 0,
        name: 'Delver of Secrets',
        manaCost: '{U}',
        typeLine: 'Creature — Human Wizard',
        oracleText: 'At the beginning of your upkeep…',
        colors: ['U'],
        power: '1',
        toughness: '1',
        loyalty: null,
        defense: null,
      },
    ]);
  });

  it('returns an empty faces array for single-face cards', () => {
    expect(toCardWithPrints(cardRecord).faces).toEqual([]);
  });
});
