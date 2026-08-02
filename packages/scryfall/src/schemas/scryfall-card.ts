import { z } from 'zod';
import { ScryfallCardFaceSchema } from './scryfall-card-face.js';
import { ScryfallImageUrisSchema } from './scryfall-image-uris.js';

/**
 * A single row of Scryfall's `default_cards` bulk dump (one printing of a card).
 *
 * This is the ingestion boundary: it validates Scryfall's raw snake_case payload
 * and produces a typed value for normalization to consume. Only the fields we
 * actually read are declared — Zod strips the rest, so the schema stays small and
 * survives Scryfall adding fields. Scalars are permissive (`z.string()`, not
 * enums) so one exotic card never breaks a 90k-row batch; normalization tightens
 * toward our domain types.
 *
 * Fields feed four consumers: our `Card` (oracle level), `CardPrint` (printing),
 * `CardFace` (`card_faces[]`), and `isCollectibleCard` (the filter).
 */
export const ScryfallCardSchema = z.object({
  // → Card (oracle level)
  oracle_id: z.string(),
  name: z.string(),
  cmc: z.number(),
  color_identity: z.array(z.string()),
  layout: z.string(),
  legalities: z.record(z.string(), z.string()),
  scryfall_uri: z.string(),
  mana_cost: z.string().optional(),
  type_line: z.string().optional(),
  oracle_text: z.string().optional(),
  colors: z.array(z.string()).optional(),

  // → CardPrint (printing level)
  id: z.string(),
  set: z.string(),
  collector_number: z.string(),
  rarity: z.string(),
  foil: z.boolean(),
  nonfoil: z.boolean(),
  image_uris: ScryfallImageUrisSchema.optional(),
  illustration_id: z.string().optional(),
  prices: z.record(z.string(), z.string().nullable()).optional(),
  lang: z.string().optional(),
  printed_name: z.string().optional(),
  printed_type_line: z.string().optional(),
  printed_text: z.string().optional(),

  // → CardFace (multi-faced cards only)
  card_faces: z.array(ScryfallCardFaceSchema).optional(),

  // → isCollectibleCard (the filter)
  games: z.array(z.string()),
  set_type: z.string(),
  oversized: z.boolean().optional(),
});

export type ScryfallCard = z.infer<typeof ScryfallCardSchema>;
