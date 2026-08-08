import { describe, expect, it } from 'vitest';

import type { ScryfallCard } from '../schemas/scryfall-card.js';
import { normalizeCard } from './index.js';

// Single-face — image at the card level, no card_faces.
const lightningBolt: ScryfallCard = {
  oracle_id: '4457ed35-7c10-48c8-9776-456485fdf070',
  name: 'Lightning Bolt',
  mana_cost: '{R}',
  type_line: 'Instant',
  oracle_text: 'Lightning Bolt deals 3 damage to any target.',
  colors: ['R'],
  color_identity: ['R'],
  cmc: 1,
  layout: 'normal',
  legalities: { commander: 'legal', standard: 'not_legal' },
  scryfall_uri: 'https://scryfall.com/card/lea/161',
  id: 'e3285e6b-3e79-4d7c-bf96-d920f973b122',
  set: 'lea',
  collector_number: '161',
  rarity: 'common',
  finishes: ['nonfoil'],
  image_uris: {
    small: 'https://img/small.jpg',
    normal: 'https://img/normal.jpg',
    large: 'https://img/large.jpg',
    png: 'https://img/png.png',
    art_crop: 'https://img/art.jpg',
    border_crop: 'https://img/border.jpg',
  },
  prices: { usd: '1.50', usd_foil: null },
  lang: 'en',
  games: ['paper', 'mtgo'],
  set_type: 'core',
};

// Transform — two faces, each with its own image → back present; top-level mana_cost is "".
const delver: ScryfallCard = {
  oracle_id: 'b7c19924-b4bf-56fc-aa73-f586e940bd42',
  name: 'Delver of Secrets // Insectile Aberration',
  mana_cost: '',
  color_identity: ['U'],
  cmc: 1,
  layout: 'transform',
  legalities: { commander: 'legal' },
  scryfall_uri: 'https://scryfall.com/card/isd/51',
  id: '11bf83bb-c95b-4b4f-9a56-ce7a1816307a',
  set: 'isd',
  collector_number: '51',
  rarity: 'common',
  finishes: ['nonfoil', 'foil'],
  keywords: ['Flying'],
  prices: { usd: '0.25' },
  lang: 'en',
  games: ['paper'],
  set_type: 'expansion',
  card_faces: [
    {
      name: 'Delver of Secrets',
      mana_cost: '{U}',
      type_line: 'Creature — Human Wizard',
      oracle_text: 'At the beginning of your upkeep, look at the top card…',
      colors: ['U'],
      power: '1',
      toughness: '1',
      image_uris: { small: 'https://f0/small.jpg', normal: 'https://f0/normal.jpg' },
    },
    {
      name: 'Insectile Aberration',
      mana_cost: '',
      type_line: 'Creature — Human Insect',
      oracle_text: 'Flying',
      colors: ['U'],
      power: '3',
      toughness: '2',
      image_uris: { small: 'https://f1/small.jpg', normal: 'https://f1/normal.jpg' },
    },
  ],
};

// Split — two faces but a single top-level image (no per-face images) → back absent.
const fireIce: ScryfallCard = {
  oracle_id: '86bf43b1-8d4e-4759-bb2d-0b2e03ba7012',
  name: 'Fire // Ice',
  color_identity: ['R', 'U'],
  cmc: 4,
  layout: 'split',
  legalities: { commander: 'legal' },
  scryfall_uri: 'https://scryfall.com/card/apc/128',
  id: 'cf68e9b0-9a2e-4b7a-9c3e-0c1f0d2a3b4c',
  set: 'apc',
  collector_number: '128',
  rarity: 'uncommon',
  finishes: ['nonfoil', 'foil'],
  image_uris: { small: 'https://split/small.jpg', normal: 'https://split/normal.jpg' },
  prices: {},
  lang: 'en',
  games: ['paper'],
  set_type: 'expansion',
  card_faces: [
    { name: 'Fire', mana_cost: '{1}{R}', type_line: 'Instant', oracle_text: '…', colors: ['R'] },
    { name: 'Ice', mana_cost: '{1}{U}', type_line: 'Instant', oracle_text: '…', colors: ['U'] },
  ],
};

describe('normalizeCard', () => {
  describe('single-face card', () => {
    it('maps oracle fields and the top-level image, with no faces', () => {
      const { card, print, faces } = normalizeCard(lightningBolt);

      expect(card.manaCost).toBe('{R}');
      expect(card.colors).toEqual(['R']);
      expect(card.colorIdentity).toEqual(['R']);
      expect(card.power).toBeUndefined();
      expect(card.keywords).toEqual([]);
      expect(card.producedMana).toEqual([]);

      expect(print.imageUris?.front.normal).toBe('https://img/normal.jpg');
      expect(print.imageUris?.back).toBeUndefined();
      expect(print.finishes).toEqual(['nonfoil']);

      expect(faces).toEqual([]);
    });
  });

  describe('transform card (per-face images)', () => {
    it('collapses empty mana_cost to undefined and fills absent top-level colors', () => {
      const { card } = normalizeCard(delver);

      expect(card.manaCost).toBeUndefined();
      expect(card.colors).toEqual([]);
      expect(card.keywords).toEqual(['Flying']);
    });

    it('reads front and back from each face image set', () => {
      const { print } = normalizeCard(delver);

      expect(print.imageUris?.front.normal).toBe('https://f0/normal.jpg');
      expect(print.imageUris?.back?.normal).toBe('https://f1/normal.jpg');
      expect(print.finishes).toEqual(['nonfoil', 'foil']);
    });

    it('emits one CardFace per face, indexed and sharing the oracle id', () => {
      const { faces } = normalizeCard(delver);

      expect(faces).toHaveLength(2);
      expect(faces[0]).toMatchObject({
        faceIndex: 0,
        name: 'Delver of Secrets',
        oracleId: delver.oracle_id,
        power: '1',
        toughness: '1',
      });
      expect(faces[1]?.manaCost).toBeUndefined();
      expect(faces[1]?.power).toBe('3');
    });
  });

  describe('split card (single shared image)', () => {
    it('uses the top-level image and emits no back despite two faces', () => {
      const { print } = normalizeCard(fireIce);

      expect(print.imageUris?.front.normal).toBe('https://split/normal.jpg');
      expect(print.imageUris?.back).toBeUndefined();
    });

    it('keeps each face colours and sorts the card colour identity WUBRG', () => {
      const { card, faces } = normalizeCard(fireIce);

      expect(faces).toHaveLength(2);
      expect(faces[0]?.colors).toEqual(['R']);
      expect(faces[1]?.colors).toEqual(['U']);
      expect(card.colorIdentity).toEqual(['U', 'R']);
    });
  });
});
