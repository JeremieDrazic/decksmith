import { TONE_STYLES } from './tone-styles';

export type ToneKey = keyof typeof TONE_STYLES;

/**
 * Resolves a Base UI toast `type` string to a valid `ToneKey`.
 * Unknown types fall back to `'default'`.
 *
 * @param type - The `type` field from a `ToastObject` (may be undefined).
 * @returns A key present in `TONE_STYLES`.
 */
export function toneOf(type: string | undefined): ToneKey {
  if (type !== undefined && type in TONE_STYLES) return type as ToneKey;
  return 'default';
}
