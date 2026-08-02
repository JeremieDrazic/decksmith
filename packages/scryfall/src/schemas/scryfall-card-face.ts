import { z } from 'zod';
import { ScryfallImageUrisSchema } from './scryfall-image-uris.js';

/**
 * One entry of Scryfall's `card_faces[]` — a single face of a multi-faced card
 * (transform, modal DFC, split, adventure, …).
 *
 * Feeds our `CardFace` table (the oracle part of each face) plus the per-face
 * image used to build `CardPrint.imageUris` `{ front, back }`. Only `name` is
 * guaranteed; every other field is omitted on some layouts, so normalization
 * supplies defaults rather than the boundary rejecting the card.
 *
 * Keys mirror Scryfall's raw snake_case wire format exactly.
 */
export const ScryfallCardFaceSchema = z.object({
  name: z.string(),
  mana_cost: z.string().optional(),
  type_line: z.string().optional(),
  oracle_text: z.string().optional(),
  colors: z.array(z.string()).optional(),
  image_uris: ScryfallImageUrisSchema.optional(),
});

export type ScryfallCardFace = z.infer<typeof ScryfallCardFaceSchema>;
