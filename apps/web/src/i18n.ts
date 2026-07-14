import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  enAuth,
  enCommon,
  enErrors,
  frAuth,
  frCommon,
  frErrors,
  type I18nResources,
} from '@decksmith/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: I18nResources;
  }
}

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
  defaultNS: 'common',
  resources: {
    en: { auth: enAuth, common: enCommon, errors: enErrors },
    fr: { auth: frAuth, common: frCommon, errors: frErrors },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
