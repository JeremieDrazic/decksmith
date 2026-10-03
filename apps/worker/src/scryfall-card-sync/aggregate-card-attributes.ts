import { prisma } from '@decksmith/db';

/**
 * Recomputes the denormalized aggregate columns on `Card` from its prints.
 *
 * ADR-0032 denormalizes four print-derived attributes onto `Card` so search
 * stays single-table: `rarities`, `finishes`, `sets`, `firstReleasedAt`. They're
 * fully reconstructible from `card_prints`, so rather than maintain them during
 * the per-row upsert we recompute them in one set-based SQL pass after the load —
 * the "level 2" phase of the sync.
 *
 * `direct_aggregates` covers the scalar columns (`rarity`, `set_code`,
 * `released_at`); `finish_union` handles `finishes`, which is itself an array and
 * must be flattened with `unnest` before aggregating.
 *
 * @returns The number of `cards` rows updated.
 */
export async function aggregateCardAttributes(): Promise<number> {
  return prisma.$executeRaw`
    WITH direct_aggregates AS (
      SELECT
        oracle_id,
        array_agg(DISTINCT rarity) AS rarities,
        array_agg(DISTINCT set_code) AS sets,
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
    SET rarities          = direct_aggregates.rarities,
        sets              = direct_aggregates.sets,
        finishes          = COALESCE(finish_union.finishes, '{}'),
        first_released_at = direct_aggregates.first_released_at
    FROM direct_aggregates
    LEFT JOIN finish_union ON finish_union.oracle_id = direct_aggregates.oracle_id
    WHERE cards.oracle_id = direct_aggregates.oracle_id;
  `;
}
