/**
 * Merge a partial update into an existing JSON field value.
 *
 * If `partial` is `undefined` (field not included in the update),
 * the existing value is returned unchanged. Otherwise, the partial
 * fields are shallow-merged into the existing object.
 *
 * @param existing - Current JSON value stored in the database
 * @param partial - Partial update to apply, or undefined to skip
 * @returns Merged JSON value
 */
export function mergeJsonField(
  existing: unknown,
  partial: Record<string, unknown> | undefined
): unknown {
  if (partial === undefined) return existing;
  return { ...(existing as Record<string, unknown>), ...partial };
}
