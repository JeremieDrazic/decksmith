type FieldMeta = { isTouched: boolean; errors: unknown[] };

function toMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (
    e != null &&
    typeof e === 'object' &&
    'message' in e &&
    typeof (e as { message: unknown }).message === 'string'
  ) {
    return (e as { message: string }).message;
  }
  return String(e);
}

/**
 * Derives the error state for a TanStack Form field.
 *
 * Errors are only considered active after the user has interacted with the
 * field (`isTouched`), avoiding premature validation feedback on first render.
 *
 * TanStack Form v1 + Zod Standard Schema returns raw Zod issue objects
 * (not strings) — `toMessage` extracts `.message`, the only field needed
 * for display. Error codes and paths live in the schema, not here.
 *
 * @param meta - `field.state.meta` from a TanStack Form field render prop.
 */
export function getFieldError(meta: FieldMeta): { hasError: boolean; errors: string[] } {
  const hasError = meta.isTouched && meta.errors.length > 0;
  return {
    hasError,
    errors: hasError ? meta.errors.map(toMessage) : [],
  };
}
