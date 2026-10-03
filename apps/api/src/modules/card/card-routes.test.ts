import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@decksmith/db', () => import('@/test-utils/mocks/db.js'));
vi.mock('@/config.js', () => import('@/test-utils/mocks/config.js'));

import { prisma } from '@decksmith/db';
import { asGuest } from '@/test-utils/inject.js';
import { createTestServer } from '@/test-utils/server.js';

// ---------------------------------------------------------------------------
// Fixtures — fully-valid DTO shapes, since the response serializer re-validates.
// ---------------------------------------------------------------------------

const CARD_ID = '11111111-1111-4111-8111-111111111111';
const PRINT_ID = '22222222-2222-4222-8222-222222222222';
const SCRYFALL_ID = '33333333-3333-4333-8333-333333333333';
const ILLUSTRATION_ID = '44444444-4444-4444-8444-444444444444';

const fullImages = {
  front: {
    small: 'https://cards.example/bolt-small.jpg',
    normal: 'https://cards.example/bolt-normal.jpg',
    large: 'https://cards.example/bolt-large.jpg',
    png: 'https://cards.example/bolt.png',
    artCrop: 'https://cards.example/bolt-art.jpg',
    borderCrop: 'https://cards.example/bolt-border.jpg',
  },
};

const fullPrices = { usd: '1.50', usdFoil: '3.00', eur: '1.20', eurFoil: '2.40' };

const prismaPrint = {
  id: PRINT_ID,
  scryfallId: SCRYFALL_ID,
  oracleId: CARD_ID,
  setCode: 'm11',
  setName: 'Magic 2011',
  collectorNumber: '146',
  illustrationId: ILLUSTRATION_ID,
  imageUris: fullImages,
  rarity: 'common',
  finishes: ['nonfoil', 'foil'],
  prices: fullPrices,
  pricesUpdatedAt: new Date('2026-01-02T03:04:05.000Z'),
  language: 'en',
  localizedName: null,
  localizedType: null,
  localizedText: null,
  releasedAt: new Date('2010-07-16T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const prismaCard = {
  oracleId: CARD_ID,
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
  rarities: ['common'],
  finishes: ['nonfoil', 'foil'],
  sets: ['m11'],
  scryfallUri: 'https://scryfall.com/card/m11/146',
  firstReleasedAt: new Date('1993-08-05T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  prints: [prismaPrint],
  faces: [],
};

const searchRow = {
  oracle_id: CARD_ID,
  name: 'Lightning Bolt',
  mana_cost: '{R}',
  type_line: 'Instant',
  colors: ['R'],
  cmc: 1,
  image_url: 'https://cards.example/bolt-normal.jpg',
};

const getApp = createTestServer();

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// GET /cards/search
// ---------------------------------------------------------------------------

describe('GET /api/v1/cards/search', () => {
  it('returns 200 without authentication (public endpoint)', async () => {
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([searchRow] as never)
      .mockResolvedValueOnce([{ count: 1n }] as never);

    const res = await asGuest(getApp(), 'GET', '/api/v1/cards/search?query=bolt');

    expect(res.statusCode).toBe(200);
    expect(
      res.json<{ total: number; page: number; limit: number; data: unknown[] }>()
    ).toMatchObject({
      total: 1,
      page: 1,
      limit: 20,
    });
  });

  it('maps the rows to search-result DTOs inside the pagination envelope', async () => {
    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([searchRow] as never)
      .mockResolvedValueOnce([{ count: 1n }] as never);

    const res = await asGuest(getApp(), 'GET', '/api/v1/cards/search?query=bolt');
    const body = res.json<{ data: { oracleId: string; imageUrl: string }[] }>();

    expect(body.data[0]).toMatchObject({
      oracleId: CARD_ID,
      name: 'Lightning Bolt',
      imageUrl: 'https://cards.example/bolt-normal.jpg',
    });
  });

  it('returns 400 when cmcMin exceeds cmcMax', async () => {
    const res = await asGuest(getApp(), 'GET', '/api/v1/cards/search?cmcMin=5&cmcMax=2');
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 on an unknown rarity value', async () => {
    const res = await asGuest(getApp(), 'GET', '/api/v1/cards/search?rarities=legendary');
    expect(res.statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /cards/autocomplete
// ---------------------------------------------------------------------------

describe('GET /api/v1/cards/autocomplete', () => {
  it('returns 200 with a flat array (no pagination envelope)', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      {
        oracle_id: CARD_ID,
        name: 'Lightning Bolt',
        mana_cost: '{R}',
        type_line: 'Instant',
        colors: ['R'],
        cmc: 1,
      },
    ] as never);

    const res = await asGuest(getApp(), 'GET', '/api/v1/cards/autocomplete?query=bol');
    const body = res.json<{ oracleId: string; imageUrl: string | null }[]>();

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toMatchObject({ oracleId: CARD_ID, imageUrl: null });
  });

  it('returns 400 when the query is shorter than 3 characters', async () => {
    const res = await asGuest(getApp(), 'GET', '/api/v1/cards/autocomplete?query=bo');
    expect(res.statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /cards/:oracleId
// ---------------------------------------------------------------------------

describe('GET /api/v1/cards/:oracleId', () => {
  it('returns 200 with the card and its prints', async () => {
    vi.mocked(prisma.card.findUnique).mockResolvedValue(prismaCard as never);

    const res = await asGuest(getApp(), 'GET', `/api/v1/cards/${CARD_ID}`);
    const body = res.json<{ oracleId: string; prints: { setCode: string }[] }>();

    expect(res.statusCode).toBe(200);
    expect(body.oracleId).toBe(CARD_ID);
    expect(body.prints[0]?.setCode).toBe('m11');
  });

  it('returns 404 CARD_NOT_FOUND when the card does not exist', async () => {
    vi.mocked(prisma.card.findUnique).mockResolvedValue(null as never);

    const res = await asGuest(getApp(), 'GET', `/api/v1/cards/${CARD_ID}`);

    expect(res.statusCode).toBe(404);
    expect(res.json<{ code: string }>().code).toBe('CARD_NOT_FOUND');
  });

  it('returns 400 when the oracle id is not a UUID', async () => {
    const res = await asGuest(getApp(), 'GET', '/api/v1/cards/not-a-uuid');
    expect(res.statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /cards/:oracleId/prints
// ---------------------------------------------------------------------------

describe('GET /api/v1/cards/:oracleId/prints', () => {
  it('returns 200 with the list of prints', async () => {
    vi.mocked(prisma.cardPrint.findMany).mockResolvedValue([prismaPrint] as never);

    const res = await asGuest(getApp(), 'GET', `/api/v1/cards/${CARD_ID}/prints`);
    const body = res.json<{ setCode: string }[]>();

    expect(res.statusCode).toBe(200);
    expect(body[0]?.setCode).toBe('m11');
  });

  it('returns 404 CARD_NOT_FOUND when the card has no prints', async () => {
    vi.mocked(prisma.cardPrint.findMany).mockResolvedValue([] as never);

    const res = await asGuest(getApp(), 'GET', `/api/v1/cards/${CARD_ID}/prints`);

    expect(res.statusCode).toBe(404);
    expect(res.json<{ code: string }>().code).toBe('CARD_NOT_FOUND');
  });
});
