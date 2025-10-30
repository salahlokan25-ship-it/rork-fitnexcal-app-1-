import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nDict, defaultLanguage, dictionaries, LanguageCode } from '@/constants/i18n';

const STORAGE_KEY = 'i18n_language_v1';

export type I18nState = {
  language: LanguageCode;
  t: (key: keyof I18nDict['en'], vars?: Record<string, string | number>) => string;
  setLanguage: (code: LanguageCode) => Promise<void>;
  available: { code: LanguageCode; name: string }[];
  hydrated: boolean;
};

export const [I18nProvider, useI18n] = createContextHook<I18nState>(() => {
  const [language, setLang] = useState<LanguageCode>(defaultLanguage);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const code = (stored as LanguageCode | null) ?? defaultLanguage;
        setLang(code);
      } catch (e) {
        console.log('[I18n] load error', e);
      } finally {
        setHydrated(true);
      }
    };
    void load();
  }, []);

  const setLanguage = useCallback(async (code: LanguageCode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
      setLang(code);
    } catch (e) {
      console.log('[I18n] save error', e);
    }
  }, []);

  const t = useCallback(
    (key: keyof I18nDict['en'], vars?: Record<string, string | number>) => {
      const dict = dictionaries[language] ?? dictionaries[defaultLanguage];
      let str = (dict[key] as string | undefined) ?? (dictionaries[defaultLanguage][key] as string);
      if (vars) {
        Object.keys(vars).forEach((k) => {
          const v = String(vars[k]!);
          str = str.replace(new RegExp(`{${k}}`, 'g'), v);
        });
      }
      return str;
    },
    [language],
  );

  const available = useMemo(
    () => [
      { code: 'en' as const, name: 'English' },
      { code: 'fr' as const, name: 'Français' },
      { code: 'es' as const, name: 'Español' },
      { code: 'ar' as const, name: 'العربية' },
    ],
    [],
  );

  return useMemo(
    () => ({ language, t, setLanguage, available, hydrated }),
    [language, t, setLanguage, available, hydrated],
  );
});