import { useState, useEffect, useCallback } from 'react';
import {
  i18nService,
  LANGUAGE_CHANGE_EVENT,
} from '../services/i18n/i18n-service';
import {
  LANGUAGE_REGISTRY,
  LanguageMetadata,
  getLanguageByCode,
} from '../services/i18n/language-registry';
import { TranslationDictionary, TRANSLATIONS } from '../services/i18n/translations';
import { useAuth } from './useAuth';

export const useTranslation = () => {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [language, setLangState] = useState<string>(() => i18nService.getCurrentLanguage());
  const [dict, setDict] = useState<TranslationDictionary>(() => i18nService.getTranslations(language));

  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ language: string }>;
      const newLang = customEvent.detail?.language || i18nService.getCurrentLanguage();
      setLangState(newLang);
      setDict(i18nService.getTranslations(newLang));
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    };
  }, []);

  const changeLanguage = useCallback(
    async (code: string) => {
      await i18nService.setLanguage(code, userId);
      setLangState(code);
      setDict(i18nService.getTranslations(code));
    },
    [userId]
  );

  const t = useCallback(
    <S extends keyof TranslationDictionary, K extends keyof TranslationDictionary[S]>(
      section: S,
      key: K
    ): string => {
      const sec = dict[section];
      if (sec && (sec as any)[key]) {
        return (sec as any)[key];
      }
      return (TRANSLATIONS.en[section] as any)[key] || String(key);
    },
    [dict]
  );

  const metadata: LanguageMetadata = getLanguageByCode(language);
  const isRTL = metadata.direction === 'rtl';

  return {
    language,
    dict,
    t,
    setLanguage: changeLanguage,
    languages: LANGUAGE_REGISTRY,
    metadata,
    direction: metadata.direction,
    isRTL,
    isReviewed: metadata.isReviewed,
  };
};
