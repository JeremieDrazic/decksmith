import { Prisma } from '@decksmith/db';
import type { NormalizedPrint } from '@decksmith/scryfall';

/** One parameterized VALUES tuple for a card-print row (order matches the INSERT column list). */
function printRow(print: NormalizedPrint): Prisma.Sql {
  return Prisma.sql`(
    gen_random_uuid(), ${print.scryfallId}, ${print.oracleId}, ${print.setCode}, ${print.collectorNumber},
    ${print.illustrationId ?? null},
    ${print.imageUris ? JSON.stringify(print.imageUris) : null}::jsonb,
    ${print.rarity}, ${print.finishes},
    ${JSON.stringify(print.prices ?? {})}::jsonb,
    ${print.language}, ${print.localizedName ?? null}, ${print.localizedType ?? null},
    ${print.localizedText ?? null}, ${print.setName ?? null}, ${print.releasedAt ?? null}, now()
  )`;
}

/**
 * Bulk-upserts a chunk of card prints in a single `INSERT … ON CONFLICT` statement.
 *
 * Keyed on `scryfall_id` (Scryfall's stable per-print id), matching the previous
 * per-row upsert. `id` has no Postgres default (Prisma's `@default(uuid())` is
 * client-side), so it's generated inline with `gen_random_uuid()`. `prices` is a
 * NOT NULL json column so it defaults to `{}` when Scryfall omits prices.
 * `image_uris` is nullable json. `updated_at` is set explicitly (`now()`) since raw
 * SQL bypasses `@updatedAt`.
 *
 * @param db - The active transaction client (from `upsertChunk`'s `$transaction`)
 * @param prints - Print rows for this chunk (unique by `scryfallId`; may be empty)
 */
export async function bulkUpsertPrints(
  db: Prisma.TransactionClient,
  prints: NormalizedPrint[]
): Promise<void> {
  if (prints.length === 0) {
    return;
  }

  await db.$executeRaw`
    INSERT INTO card_prints (
      id, scryfall_id, oracle_id, set_code, collector_number, illustration_id,
      image_uris, rarity, finishes, prices, language,
      localized_name, localized_type, localized_text, set_name, released_at, updated_at
    )
    VALUES ${Prisma.join(prints.map((print) => printRow(print)))}
    ON CONFLICT (scryfall_id) DO UPDATE SET
      oracle_id = EXCLUDED.oracle_id, set_code = EXCLUDED.set_code,
      collector_number = EXCLUDED.collector_number, illustration_id = EXCLUDED.illustration_id,
      image_uris = EXCLUDED.image_uris, rarity = EXCLUDED.rarity, finishes = EXCLUDED.finishes,
      prices = EXCLUDED.prices, language = EXCLUDED.language,
      localized_name = EXCLUDED.localized_name, localized_type = EXCLUDED.localized_type,
      localized_text = EXCLUDED.localized_text, set_name = EXCLUDED.set_name,
      released_at = EXCLUDED.released_at, updated_at = now()
  `;
}
