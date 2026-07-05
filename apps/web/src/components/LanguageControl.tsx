import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectList,
  SelectTrigger,
} from '@decksmith/web-ui';

import { LANGUAGE_COOKIE } from '../i18n';

const LANGUAGES = [
  { value: 'en', flag: '🇬🇧', label: 'English', short: 'EN' },
  { value: 'fr', flag: '🇫🇷', label: 'Français', short: 'FR' },
] as const;

/**
 * Language switcher for unauthenticated pages.
 * Persists to a cookie so the SSR loader picks it up on next load — no FOUT.
 *
 * For authenticated users, language comes from UserPreferences (DB)
 * and is applied via i18n.changeLanguage() after useUserPreferences loads.
 */
export function LanguageControl() {
  const { i18n } = useTranslation();

  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  const current = LANGUAGES.find((l) => l.value === lang) ?? LANGUAGES[0];

  function switchLanguage(next: string | null) {
    if (!next || next === lang) return;
    void i18n.changeLanguage(next);
    document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return (
    <Select value={lang} onValueChange={switchLanguage}>
      <SelectTrigger showIcon={false} className="w-auto px-2 gap-1.5">
        <div className="flex flex-row items-center gap-1.5 text-sm">
          <span>{current.flag}</span>
          <span>{current.short}</span>
        </div>
        <SelectIcon />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectList>
          {LANGUAGES.map((l) => (
            <SelectItem key={l.value} value={l.value}>
              {l.flag} {l.label}
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}
