import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@decksmith/db', () => import('../../__mocks__/db.js'));

import { prisma } from '@decksmith/db';

import { getCardPrints, getCardWithPrints } from './card-service.js';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function buildPrismaCard(overrides?: Record<string, unknown>) {
  return {
    oracleId: 'oracle-123',
    name: 'Lightning Bolt',
    manaCost: '{R}',
    typeLine: 'Instant',
    oracleText: 'Lightning Bolt deals 3 damage to any target.',
    cmc: 1,
    colors: ['R'],
    colorIdentity: ['R'],
    layout: 'normal',
    legalities: {},
    rarities: ['common'],
    finishes: ['nonfoil'],
    sets: ['lea'],
    prints: [],
    faces: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// getCardWithPrints
// ---------------------------------------------------------------------------

describe('getCardWithPrints', () => {
  it('returns the card with its prints and faces when found', async () => {
    const card = buildPrismaCard({ prints: [{ id: 'p1' }], faces: [{ faceIndex: 0 }] });
    vi.mocked(prisma.card.findUnique).mockResolvedValue(card as never);

    const result = await getCardWithPrints('oracle-123');

    expect(result.oracleId).toBe('oracle-123');
    expect(result.prints).toHaveLength(1);
    expect(result.faces).toHaveLength(1);
  });

  it('throws CARD_NOT_FOUND when no card has the oracle ID', async () => {
    vi.mocked(prisma.card.findUnique).mockResolvedValue(null);

    await expect(getCardWithPrints('missing')).rejects.toMatchObject({ code: 'CARD_NOT_FOUND' });
  });

  it('requests prints newest-first and faces in reading order', async () => {
    vi.mocked(prisma.card.findUnique).mockResolvedValue(buildPrismaCard() as never);

    await getCardWithPrints('oracle-123');

    expect(prisma.card.findUnique).toHaveBeenCalledWith({
      where: { oracleId: 'oracle-123' },
      include: {
        prints: { orderBy: { releasedAt: { sort: 'desc', nulls: 'last' } } },
        faces: { orderBy: { faceIndex: 'asc' } },
      },
    });
  });
});

// ---------------------------------------------------------------------------
// getCardPrints
// ---------------------------------------------------------------------------

describe('getCardPrints', () => {
  it('returns the prints when the card has any', async () => {
    vi.mocked(prisma.cardPrint.findMany).mockResolvedValue([{ id: 'p1' }, { id: 'p2' }] as never);

    const result = await getCardPrints('oracle-123', 'date');

    expect(result).toHaveLength(2);
  });

  it('throws CARD_NOT_FOUND when the card has no prints (i.e. does not exist)', async () => {
    vi.mocked(prisma.cardPrint.findMany).mockResolvedValue([] as never);

    await expect(getCardPrints('missing', 'date')).rejects.toMatchObject({
      code: 'CARD_NOT_FOUND',
    });
  });

  it('orders by release date (newest first) for sort=date', async () => {
    vi.mocked(prisma.cardPrint.findMany).mockResolvedValue([{ id: 'p1' }] as never);

    await getCardPrints('oracle-123', 'date');

    expect(prisma.cardPrint.findMany).toHaveBeenCalledWith({
      where: { oracleId: 'oracle-123' },
      orderBy: { releasedAt: { sort: 'desc', nulls: 'last' } },
    });
  });

  it('orders by set name for sort=name', async () => {
    vi.mocked(prisma.cardPrint.findMany).mockResolvedValue([{ id: 'p1' }] as never);

    await getCardPrints('oracle-123', 'name');

    expect(prisma.cardPrint.findMany).toHaveBeenCalledWith({
      where: { oracleId: 'oracle-123' },
      orderBy: { setName: { sort: 'asc', nulls: 'last' } },
    });
  });
});
