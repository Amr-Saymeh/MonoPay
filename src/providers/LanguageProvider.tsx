import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import { getIsRtl, SupportedLanguage, translations } from '@/src/i18n/translations';

type LanguageContextValue = {
  language: SupportedLanguage;
  isRtl: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof (typeof translations)['en']) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'monopay.language';

function getDefaultLanguage(): SupportedLanguage {
  const locale = Localization.getLocales()?.[0];
  const code = (locale?.languageCode ?? 'en').toLowerCase();
  return code === 'ar' ? 'ar' : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(getDefaultLanguage());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'en' || stored === 'ar') setLanguageState(stored);
      } finally {
        setHydrated(true);
      }
    };

    void run();
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    void AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: keyof (typeof translations)['en']) => {
      return translations[language][key] ?? translations.en[key] ?? String(key);
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isRtl: getIsRtl(language),
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  if (!hydrated) return null;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
