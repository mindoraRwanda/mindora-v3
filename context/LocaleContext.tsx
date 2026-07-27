import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Localization from 'expo-localization';

import { DEFAULT_LOCALE, LOCALES, Locale, TranslationKey, resources } from '@/constants/i18n';

const LOCALE_KEY = 'app_locale';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  isLoading: true,
});

export const useLocale = () => useContext(LocaleContext);

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') localStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
};

function detectDeviceLocale(): Locale {
  try {
    const tag = Localization.getLocales()[0]?.languageCode;
    if (tag && (LOCALES as string[]).includes(tag)) return tag as Locale;
  } catch {
    // Localization API unavailable (e.g. some web/SSR contexts) — fall through to default.
  }
  return DEFAULT_LOCALE;
}

function lookup(dict: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.getItem(LOCALE_KEY);
        if (stored && (LOCALES as string[]).includes(stored)) {
          setLocaleState(stored as Locale);
        } else {
          setLocaleState(detectDeviceLocale());
        }
      } catch {
        setLocaleState(DEFAULT_LOCALE);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    storage.setItem(LOCALE_KEY, next).catch(() => {});
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const value =
        lookup(resources[locale], key) ?? lookup(resources[DEFAULT_LOCALE], key) ?? key;
      return interpolate(value, vars);
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t, isLoading }), [locale, setLocale, t, isLoading]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
