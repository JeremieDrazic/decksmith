import { Prisma } from '@decksmith/db';
import type { NormalizedFace } from '@decksmith/scryfall';

/** One parameterized VALUES tuple for a card-face row (order matches the INSERT column list). */
function faceRow(face: NormalizedFace): Prisma.Sql {
  return Prisma.sql`(
    gen_random_uuid(), ${face.oracleId}, ${face.faceIndex}, ${face.name}, ${face.manaCost ?? null},
    ${face.typeLine ?? null}, ${face.oracleText ?? null}, ${face.colors},
    ${face.power ?? null}, ${face.toughness ?? null}, ${face.loyalty ?? null}, ${face.defense ?? null}
  )`;
}

/**
 * Bulk-upserts a chunk of card faces in a single `INSERT … ON CONFLICT` statement.
 *
 * Keyed on the natural key `(oracle_id, face_index)`. `id` has no Postgres default
 * (Prisma's `@default(uuid())` is client-side), so we generate it inline with
 * `gen_random_uuid()` and never touch it on conflict. `CardFace` has no
 * `created_at`/`updated_at`, so there's no timestamp to set. Only multi-face cards
 * produce faces, so this list is often empty (handled by the early return).
 *
 * @param db - The active transaction client (from `upsertChunk`'s `$transaction`)
 * @param faces - Deduplicated face rows for this chunk (may be empty)
 */
export async function bulkUpsertFaces(
  db: Prisma.TransactionClient,
  faces: NormalizedFace[]
): Promise<void> {
  if (faces.length === 0) {
    return;
  }

  await db.$executeRaw`
    INSERT INTO card_faces (
      id, oracle_id, face_index, name, mana_cost, type_line, oracle_text,
      colors, power, toughness, loyalty, defense
    )
    VALUES ${Prisma.join(faces.map((face) => faceRow(face)))}
    ON CONFLICT (oracle_id, face_index) DO UPDATE SET
      name = EXCLUDED.name, mana_cost = EXCLUDED.mana_cost, type_line = EXCLUDED.type_line,
      oracle_text = EXCLUDED.oracle_text, colors = EXCLUDED.colors, power = EXCLUDED.power,
      toughness = EXCLUDED.toughness, loyalty = EXCLUDED.loyalty, defense = EXCLUDED.defense
  `;
}
