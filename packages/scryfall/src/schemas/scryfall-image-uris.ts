import { z } from 'zod';

/**
 * Scryfall's `image_uris` object — one URL per rendering size.
 *
 * Present at the card level for single-faced cards, and per-face inside
 * `card_faces[]` for multi-faced cards. Every size is optional: Scryfall may
 * omit a size, and normalization only reads one (typically `normal`).
 *
 * Keys mirror Scryfall's raw snake_case wire format exactly — the snake→camel
 * conversion is normalization's job, not the boundary's.
 */
export const ScryfallImageUrisSchema = z.object({
  small: z.string().optional(),
  normal: z.string().optional(),
  large: z.string().optional(),
  png: z.string().optional(),
  art_crop: z.string().optional(),
  border_crop: z.string().optional(),
});

export type ScryfallImageUris = z.infer<typeof ScryfallImageUrisSchema>;
