/**
 * Options for {@link streamNormalizedCards}.
 *
 * The stream itself only yields valid, collectible cards. Rows that fail schema
 * validation are skipped — but since this is a pure library (no logger of its
 * own), it hands each failure back to the caller through `onInvalidRow` so the
 * worker can log and count them with its own logger.
 */
export type StreamNormalizedCardsOptions = {
  /**
   * Called once per row that fails `ScryfallCardSchema` validation.
   *
   * @param error - The validation error (a `ZodError`), typed as `unknown` to
   *   keep callers uncoupled from Zod
   * @param index - The row's zero-based position in the dump, for diagnostics
   */
  onInvalidRow?: (error: unknown, index: number) => void;
};
