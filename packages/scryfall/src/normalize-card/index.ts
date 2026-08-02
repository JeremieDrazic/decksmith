import { sortColorIdentity, type ColorIdentity } from '@decksmith/domain';
import type { ScryfallCard } from '../schemas/scryfall-card';
import type {
  NormalizedCard,
  NormalizedCardBundle,
  NormalizedFace,
  NormalizedImageUris,
  NormalizedPrint,
} from './normalized-card';
import type { ScryfallImageUris } from '../schemas/scryfall-image-uris';

/** Maps Scryfall's snake_case image sizes to our camelCase shape. */
function toImageUris(uris: ScryfallImageUris): NormalizedImageUris {
  return {
    small: uris.small,
    normal: uris.normal,
    large: uris.large,
    png: uris.png,
    artCrop: uris.art_crop,
    borderCrop: uris.border_crop,
  };
}

/**
 * Normalizes one raw Scryfall row into our domain shape: a `Card` (oracle),
 * its `CardPrint` (this printing), and any `CardFace[]` (multi-faced cards).
 *
 * @param raw - A validated Scryfall bulk row (see {@link ScryfallCardSchema})
 * @returns The oracle/print/faces bundle, ready for the worker to persist
 */
export function normalizeCard(raw: ScryfallCard): NormalizedCardBundle {
  const card: NormalizedCard = {
    oracleId: raw.oracle_id,
    oracleText: raw.oracle_text,
    name: raw.name,
    typeLine: raw.type_line,
    cmc: raw.cmc,
    layout: raw.layout,
    manaCost: raw.mana_cost && raw.mana_cost.length > 0 ? raw.mana_cost : undefined,
    legalities: raw.legalities,
    scryfallUri: raw.scryfall_uri,
    colors: raw.colors || [],
    colorIdentity: sortColorIdentity(raw.color_identity as ColorIdentity),
  };

  // Where the images physically live decides front/back — not the face count.
  // Only transform/mdfc/reversible carry per-face images; split/adventure share one.
  const faceImages = raw.card_faces?.[0]?.image_uris;
  const front = faceImages ?? raw.image_uris;
  const back = faceImages ? raw.card_faces?.[1]?.image_uris : undefined;
  const imageUris = front
    ? { front: toImageUris(front), back: back ? toImageUris(back) : undefined }
    : undefined;

  const print: NormalizedPrint = {
    scryfallId: raw.id,
    oracleId: raw.oracle_id,
    imageUris,
    setCode: raw.set,
    collectorNumber: raw.collector_number,
    rarity: raw.rarity,
    foil: raw.foil,
    nonfoil: raw.nonfoil,
    prices: raw.prices,
    language: raw.lang ?? 'en',
    localizedName: raw.printed_name,
    localizedText: raw.printed_text,
    localizedType: raw.printed_type_line,
  };

  const faces: NormalizedFace[] = (raw.card_faces || []).map((face, faceIndex) => ({
    oracleId: raw.oracle_id,
    faceIndex,
    name: face.name,
    manaCost: face.mana_cost && face.mana_cost.length > 0 ? face.mana_cost : undefined,
    typeLine: face.type_line,
    oracleText: face.oracle_text,
    colors: face?.colors || [],
  }));

  return { card, print, faces };
}
