import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';

export const LANGUAGE_COOKIE = 'decksmith-language';
export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;

export function parseLangFromCookieString(cookieStr: string): string {
  const match = cookieStr.match(new RegExp(`(?:^|;\\s*)${LANGUAGE_COOKIE}=([^;]+)`));
  const stored = match?.[1];
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) return stored;
  return 'en';
}

function getInitialLanguage(): string {
  if (typeof document === 'undefined') return 'en';
  return parseLangFromCookieString(document.cookie);
}

i18n.use(initReactI18next).init({
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
