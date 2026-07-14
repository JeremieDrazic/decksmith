import type enAuth from '../locales/en/auth.json';
import type enCommon from '../locales/en/common.json';
import type enErrors from '../locales/en/errors.json';

export type I18nResources = {
  auth: typeof enAuth;
  common: typeof enCommon;
  errors: typeof enErrors;
};
