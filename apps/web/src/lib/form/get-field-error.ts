import type { I18nResources } from '@decksmith/i18n';

type FieldMeta = { isTouched: boolean; errors: unknown[] };
type ErrorKey = keyof I18nResources['errors'];

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
 * Pass `t` (from `useTranslation('errors')`) to translate Zod error codes
 * into localised strings before display.
 *
 * @param meta - `field.state.meta` from a TanStack Form field render prop.
 * @param t - Optional translation function for error code → localised string.
 */
export function getFieldError(
  meta: FieldMeta,
  t?: (key: ErrorKey) => string
): { hasError: boolean; errors: string[] } {
  const hasError = meta.isTouched && meta.errors.length > 0;
  const errors = hasError ? meta.errors.map(toMessage) : [];
  return { hasError, errors: t ? errors.map((code) => t(code as ErrorKey)) : errors };
}
