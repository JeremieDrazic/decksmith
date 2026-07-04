import { useTranslation } from 'react-i18next';
import { Field, FieldLabel, ThemeToggle, useTheme } from '@decksmith/web-ui';

/**
 * Theme toggle with a localized label that reflects the active theme.
 * Wraps the `ThemeToggle` primitive with app-level i18n.
 */
export function ThemeControl() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const label = theme === 'dark' ? t('common.theme.dark') : t('common.theme.light');

  return (
    <Field orientation="horizontal" className="items-center">
      <FieldLabel variant="body" htmlFor="theme-control" className="text-text-muted text-sm">
        {label}
      </FieldLabel>
      <ThemeToggle id="theme-control" aria-label={label} />
    </Field>
  );
}
