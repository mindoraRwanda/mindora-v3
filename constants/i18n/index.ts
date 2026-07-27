import en from './en';
import fr from './fr';
import rw from './rw';
import type { TranslationDictionary } from './en';

export type Locale = 'en' | 'fr' | 'rw';

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALES: Locale[] = ['en', 'fr', 'rw'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  rw: 'Kinyarwanda',
};

export const resources: Record<Locale, TranslationDictionary> = { en, fr, rw };

// A recursive dotted-path type over the dictionary shape, e.g. "auth.login.title".
type DotPaths<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: DotPaths<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>;
    }[keyof T & string];

export type TranslationKey = DotPaths<TranslationDictionary>;

export type { TranslationDictionary };
