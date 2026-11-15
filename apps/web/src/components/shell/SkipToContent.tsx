import { useTranslation } from 'react-i18next';

/** The id of the content region the skip link jumps to — set on the shell's content wrapper. */
export const CONTENT_ID = 'main-content';

/**
 * Keyboard affordance: a visually-hidden link, revealed on focus, that jumps
 * past the navigation straight to the content. The shell's first focusable
 * element, so a keyboard or screen-reader user never has to tab through the whole
 * rail to reach the page.
 */
export function SkipToContent() {
  const { t } = useTranslation('common');

  return (
    <a
      href={`#${CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-tooltip focus:rounded-interactive focus:bg-surface focus:px-4 focus:py-2 focus:text-accent-text focus:shadow-popover"
    >
      {t('nav.skipToContent')}
    </a>
  );
}
