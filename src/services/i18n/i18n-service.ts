/**
 * HealthWise AI — Internationalization (i18n) Service
 *
 * Coordinates multi-language support:
 * 1. Verified & Reviewed Languages: English (en), Telugu (te), Hindi (hi)
 * 2. AI-Supported World & Regional Languages: Spanish, Arabic (RTL), Urdu (RTL),
 *    Tamil, Bengali, French, German, Japanese, etc. via Puter.js translation
 *
 * Features:
 * - Dual-mode persistence: localStorage + Supabase profiles.preferred_language
 * - Dynamic document text direction (dir="rtl" for Arabic and Urdu)
 * - Accessibility: updates document.documentElement.lang
 * - 3-tier fallback: Reviewed Translation -> Puter Dynamic Cache -> English Baseline
 * - Reactive global re-rendering via custom window events
 */

import { supabase, isSupabaseConfigured } from '../database/supabase-client';
import {
  LANGUAGE_REGISTRY,
  getLanguageByCode,
  isLanguageReviewed,
  LanguageMetadata,
} from './language-registry';
import { TRANSLATIONS, SupportedLanguageCode, TranslationDictionary } from './translations';
import { translationService } from './translation-service';

const LOCAL_LANG_KEY = 'healthwise_app_language';
export const LANGUAGE_CHANGE_EVENT = 'healthwise_language_changed';

export interface AppLanguage {
  code: string;
  name: string;
  native_name: string;
  nativeName: string;
  is_active: boolean;
  created_at: string;
}

// Retain SUPPORTED_LANGUAGES export for full backward compatibility
export const SUPPORTED_LANGUAGES: AppLanguage[] = LANGUAGE_REGISTRY.map(l => ({
  code: l.code,
  name: l.name,
  native_name: l.nativeName,
  nativeName: l.nativeName,
  is_active: true,
  created_at: new Date().toISOString(),
}));

// In-memory dynamic dictionary cache for non-reviewed languages
const dynamicDictionaryCache = new Map<string, TranslationDictionary>();

export const i18nService = {
  /**
   * Get the active language code
   */
  getCurrentLanguage(): string {
    try {
      const stored = localStorage.getItem(LOCAL_LANG_KEY);
      if (stored && LANGUAGE_REGISTRY.some(l => l.code === stored)) {
        return stored;
      }

      // Auto-detect browser language
      const browserLang = navigator.language?.toLowerCase() || '';
      const match = LANGUAGE_REGISTRY.find(l =>
        browserLang === l.code.toLowerCase() || browserLang.startsWith(l.code.toLowerCase())
      );
      if (match) return match.code;

      return 'en';
    } catch {
      return 'en';
    }
  },

  /**
   * Get metadata for active or specific language
   */
  getLanguageMetadata(code?: string): LanguageMetadata {
    const lang = code || this.getCurrentLanguage();
    return getLanguageByCode(lang);
  },

  /**
   * Get all registered languages
   */
  getAllLanguages(): LanguageMetadata[] {
    return LANGUAGE_REGISTRY;
  },

  /**
   * Backward compatible list of supported languages
   */
  getSupportedLanguages(): AppLanguage[] {
    return SUPPORTED_LANGUAGES;
  },

  /**
   * Set and persist active language: setLanguage(lang: SupportedLanguageCode, userId?: string | null)
   */
  async setLanguage(lang: SupportedLanguageCode | string, userId?: string | null): Promise<void> {
    const langMeta = getLanguageByCode(lang);
    const validCode = langMeta.code;

    try {
      localStorage.setItem(LOCAL_LANG_KEY, validCode);

      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
        document.documentElement.dir = langMeta.direction; // 'rtl' for Arabic/Urdu, 'ltr' for others
      }

      // If switching to an AI-supported language, start background hydration of UI keys
      if (!langMeta.isReviewed) {
        this.hydrateDynamicLanguage(validCode).catch(err => {
          console.warn('[i18n] Background hydration notice:', err);
        });
      }

      // Notify reactive listeners across the application
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language: validCode } })
        );
      }
    } catch (err) {
      console.warn('[i18n] Failed saving language locally:', err);
    }

    // Persist to Supabase profile if user is signed in
    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        await supabase
          .from('profiles')
          .update({ preferred_language: validCode, updated_at: new Date().toISOString() })
          .eq('id', userId);
      } catch (dbErr) {
        console.warn('[i18n] Supabase profile language update failed:', dbErr);
      }
    }
  },

  /**
   * Get full dictionary for the given or active language
   * Fallback priority: Reviewed static -> In-memory dynamic -> Cached local -> English baseline
   */
  getTranslations(lang?: string): TranslationDictionary {
    const active = lang || this.getCurrentLanguage();

    // 1. If reviewed language, return verified static dictionary
    if (isLanguageReviewed(active)) {
      return TRANSLATIONS[active as SupportedLanguageCode] || TRANSLATIONS.en;
    }

    // 2. If already built in dynamic memory cache, return it
    if (dynamicDictionaryCache.has(active)) {
      return dynamicDictionaryCache.get(active)!;
    }

    // 3. Build dynamic overlay on top of English baseline using local cache
    const builtDict = this.buildDynamicDictionary(active);
    dynamicDictionaryCache.set(active, builtDict);
    return builtDict;
  },

  /**
   * Build dynamic dictionary from local storage cache overlaid on English baseline
   */
  buildDynamicDictionary(targetLang: string): TranslationDictionary {
    // Deep clone English baseline to guarantee no missing keys
    const cloned: TranslationDictionary = JSON.parse(JSON.stringify(TRANSLATIONS.en));

    if (typeof localStorage === 'undefined') return cloned;

    try {
      const raw = localStorage.getItem(`healthwise_trans_cache_${targetLang}`);
      if (!raw) return cloned;

      const cache: Record<string, string> = JSON.parse(raw);

      // Overlay cached translations across all sections
      for (const sectionKey of Object.keys(cloned) as Array<keyof TranslationDictionary>) {
        const section = cloned[sectionKey];
        if (typeof section === 'object' && section !== null) {
          for (const itemKey of Object.keys(section)) {
            const englishText = (TRANSLATIONS.en[sectionKey] as any)[itemKey];
            if (englishText && cache[englishText.trim()]) {
              (section as any)[itemKey] = cache[englishText.trim()];
            }
          }
        }
      }
    } catch {
      // Fall back safely to English baseline
    }

    return cloned;
  },

  /**
   * Asynchronously hydrate dynamic language using Puter.js translation
   */
  async hydrateDynamicLanguage(targetLang: string): Promise<void> {
    if (isLanguageReviewed(targetLang)) return;
    if (!translationService.isPuterAvailable()) return;

    try {
      // Collect critical UI keys to translate (nav, buttons, badges)
      const textsToTranslate = [
        TRANSLATIONS.en.nav.home,
        TRANSLATIONS.en.nav.chat,
        TRANSLATIONS.en.nav.diseases,
        TRANSLATIONS.en.nav.prevention,
        TRANSLATIONS.en.nav.vaccination,
        TRANSLATIONS.en.nav.resources,
        TRANSLATIONS.en.nav.bookmarks,
        TRANSLATIONS.en.nav.about,
        TRANSLATIONS.en.home.heroTitle,
        TRANSLATIONS.en.home.heroTitleHighlight,
        TRANSLATIONS.en.home.startChat,
        TRANSLATIONS.en.home.exploreDiseases,
        TRANSLATIONS.en.chat.placeholder,
        TRANSLATIONS.en.chat.send,
        TRANSLATIONS.en.diseases.badge,
        TRANSLATIONS.en.diseases.searchPlaceholder,
      ];

      await translationService.translateBatch(textsToTranslate, targetLang);

      // Rebuild dynamic dictionary with the newly cached translations
      const updatedDict = this.buildDynamicDictionary(targetLang);
      dynamicDictionaryCache.set(targetLang, updatedDict);

      // Dispatch event to refresh active UI components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language: targetLang } })
        );
      }
    } catch (err) {
      console.warn(`[i18n] Failed hydrating dynamic language ${targetLang}:`, err);
    }
  },

  /**
   * Helper to translate a section and key with 3-tier fallback
   */
  translate<S extends keyof TranslationDictionary, K extends keyof TranslationDictionary[S]>(
    section: S,
    key: K,
    lang?: string
  ): string {
    const dict = this.getTranslations(lang);
    const sec = dict[section];
    if (sec && (sec as any)[key]) {
      return (sec as any)[key];
    }
    // Fallback to English
    return (TRANSLATIONS.en[section] as any)[key] || String(key);
  },
};
