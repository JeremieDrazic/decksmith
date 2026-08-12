import { Prisma } from '@decksmith/db';
import type { NormalizedCard } from '@decksmith/scryfall';

/** One parameterized VALUES tuple for a card row (order matches the INSERT column list). */
function cardRow(card: NormalizedCard): Prisma.Sql {
  return Prisma.sql`(
    ${card.oracleId}, ${card.name}, ${card.manaCost ?? null}, ${card.typeLine ?? null},
    ${card.oracleText ?? null}, ${card.power ?? null}, ${card.toughness ?? null},
    ${card.loyalty ?? null}, ${card.defense ?? null},
    ${card.colors}, ${card.colorIdentity}, ${card.keywords}, ${card.producedMana},
    ${card.cmc}, ${card.layout}, ${JSON.stringify(card.legalities)}::jsonb,
    ${card.scryfallUri}, now()
  )`;
}

/**
 * Bulk-upserts a chunk of cards in a single `INSERT … ON CONFLICT` statement —
 * one round-trip for the whole chunk instead of one Prisma op per row.
 *
 * Deliberately omits `rarities` / `finishes` / `first_released_at`: those are the
 * level-2 aggregate columns, owned by `aggregateCardAttributes` (recomputed from
 * the prints after the load). Touching them here would reset them on every sync
 * and clobber the aggregation. New rows get their Postgres defaults (`{}` / NULL),
 * which level-2 then fills.
 *
 * `updated_at` is set explicitly (`now()`) because raw SQL bypasses Prisma's
 * `@updatedAt`. Runs on the transaction client so the chunk stays atomic.
 *
 * @param db - The active transaction client (from `upsertChunk`'s `$transaction`)
 * @param cards - Deduplicated card rows for this chunk (may be empty)
 */
export async function bulkUpsertCards(
  db: Prisma.TransactionClient,
  cards: NormalizedCard[]
): Promise<void> {
  if (cards.length === 0) {
    return;
  }

  await db.$executeRaw`
    INSERT INTO cards (
      oracle_id, name, mana_cost, type_line, oracle_text,
      power, toughness, loyalty, defense,
      colors, color_identity, keywords, produced_mana,
      cmc, layout, legalities, scryfall_uri, updated_at
    )
    VALUES ${Prisma.join(cards.map((card) => cardRow(card)))}
    ON CONFLICT (oracle_id) DO UPDATE SET
      name = EXCLUDED.name, mana_cost = EXCLUDED.mana_cost, type_line = EXCLUDED.type_line,
      oracle_text = EXCLUDED.oracle_text, power = EXCLUDED.power, toughness = EXCLUDED.toughness,
      loyalty = EXCLUDED.loyalty, defense = EXCLUDED.defense, colors = EXCLUDED.colors,
      color_identity = EXCLUDED.color_identity, keywords = EXCLUDED.keywords,
      produced_mana = EXCLUDED.produced_mana, cmc = EXCLUDED.cmc, layout = EXCLUDED.layout,
      legalities = EXCLUDED.legalities, scryfall_uri = EXCLUDED.scryfall_uri, updated_at = now()
  `;
}
