import { prisma } from '@decksmith/db';

/**
 * Recomputes the denormalized aggregate columns on `Card` from its prints.
 *
 * ADR-0032 denormalizes three print-derived attributes onto `Card` so search
 * stays single-table: `rarities`, `finishes`, `firstReleasedAt`. They're fully
 * reconstructible from `card_prints`, so rather than maintain them during the
 * per-row upsert we recompute them in one set-based SQL pass after the load —
 * the "level 2" phase of the sync.
 *
 * @returns The number of `cards` rows updated.
 */
export async function aggregateCardAttributes(): Promise<number> {
  return prisma.$executeRaw`
    WITH rarity_date AS (
      SELECT
        oracle_id,
        array_agg(DISTINCT rarity) AS rarities,
        min(released_at) AS first_released_at
      FROM card_prints
      GROUP BY oracle_id
    ),
    finish_union AS (
      SELECT
        oracle_id,
        array_agg(DISTINCT finish_flat_array.finish) AS finishes
      FROM card_prints
      CROSS JOIN LATERAL unnest(finishes) AS finish_flat_array(finish)
      GROUP BY oracle_id
    )
    UPDATE cards
    SET rarities          = rarity_date.rarities,
        finishes          = COALESCE(finish_union.finishes, '{}'),
        first_released_at = rarity_date.first_released_at
    FROM rarity_date
    LEFT JOIN finish_union ON finish_union.oracle_id = rarity_date.oracle_id
    WHERE cards.oracle_id = rarity_date.oracle_id;
  `;
}
