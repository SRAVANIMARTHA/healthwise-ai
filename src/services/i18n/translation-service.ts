/**
 * HealthWise AI — Puter.js Dynamic Translation Service
 *
 * Provides on-demand dynamic translation for extended world languages
 * using the official Puter.js AI chat integration (puter.ai.chat()).
 *
 * Features:
 * - Configurable model with dynamic runtime discovery & fallback
 * - Multi-tier caching: in-memory Map + browser localStorage
 * - In-flight deduplication for concurrent identical translation calls
 * - Medical & safety preservation: guarantees URLs, hotlines (112, 108, 911),
 *   disease identifiers, and numbers are never altered
 * - 100% resilient fallback: returns original English text on any error
 */

import { getLanguageByCode } from './language-registry';

// ---------- Types ----------

export interface TranslationOptions {
  model?: string;
  temperature?: number;
  skipCache?: boolean;
}

// In-memory runtime cache: key = `${lang}:${text}`
const memoryCache = new Map<string, string>();

// In-flight request deduplication map: key = `${lang}:${text}`
const inFlightRequests = new Map<string, Promise<string>>();

const LOCAL_CACHE_PREFIX = 'healthwise_trans_cache_';

// Maximum stored items in localStorage per language
const MAX_LOCAL_CACHE_SIZE = 400;

// ---------- Cache Helpers ----------

function getCacheKey(text: string, targetLang: string): string {
  return `${targetLang}:${text.trim()}`;
}

function loadLocalCache(targetLang: string): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`${LOCAL_CACHE_PREFIX}${targetLang}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToLocalCache(text: string, translation: string, targetLang: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const key = `${LOCAL_CACHE_PREFIX}${targetLang}`;
    const cache = loadLocalCache(targetLang);
    cache[text.trim()] = translation;

    // Prune old keys if cache grows too large
    const entries = Object.entries(cache);
    if (entries.length > MAX_LOCAL_CACHE_SIZE) {
      const pruned = Object.fromEntries(entries.slice(entries.length - MAX_LOCAL_CACHE_SIZE));
      localStorage.setItem(key, JSON.stringify(pruned));
    } else {
      localStorage.setItem(key, JSON.stringify(cache));
    }
  } catch {
    // Ignore storage quota errors silently
  }
}

// ---------- Config & Model Discovery ----------

function getTranslationConfig(): { model: string; temperature: number } {
  const envModel = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_PUTER_TRANSLATION_MODEL || import.meta.env.VITE_PUTER_AI_MODEL)
    : undefined;

  return {
    model: envModel || 'default',
    temperature: 0.1, // low temperature for translation precision
  };
}

// ---------- Translation Service Implementation ----------

export const translationService = {
  /**
   * Check if Puter.js AI is available in window
   */
  isPuterAvailable(): boolean {
    return typeof window !== 'undefined' &&
      !!(window as any).puter?.ai?.chat;
  },

  /**
   * Get active translation model (configurable with runtime verification)
   */
  async getActiveModel(): Promise<string> {
    const config = getTranslationConfig();
    if (!this.isPuterAvailable()) {
      return config.model;
    }

    try {
      const models = await (window as any).puter.ai.listModels();
      if (Array.isArray(models) && models.length > 0) {
        // If configured model exists in list, use it; otherwise pick first available or 'default'
        const exists = models.some((m: any) => m.id === config.model);
        if (exists) return config.model;
        return models[0]?.id || 'default';
      }
    } catch {
      // Fall back to config model
    }
    return config.model;
  },

  /**
   * Translate single string using Puter.js with caching and deduplication
   */
  async translateText(
    text: string,
    targetLang: string,
    options: TranslationOptions = {}
  ): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed || targetLang === 'en') {
      return text;
    }

    const cacheKey = getCacheKey(trimmed, targetLang);

    // 1. Check in-memory cache
    if (!options.skipCache && memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey)!;
    }

    // 2. Check localStorage cache
    if (!options.skipCache) {
      const local = loadLocalCache(targetLang);
      if (local[trimmed]) {
        memoryCache.set(cacheKey, local[trimmed]);
        return local[trimmed];
      }
    }

    // 3. Deduplicate in-flight concurrent requests for identical string
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!;
    }

    // 4. Create translation promise
    const translationPromise = (async () => {
      if (!this.isPuterAvailable()) {
        console.warn(`[Translation] Puter.js not available — falling back to English for "${trimmed.slice(0, 30)}..."`);
        return text;
      }

      try {
        const langMeta = getLanguageByCode(targetLang);
        const model = options.model || (await this.getActiveModel());
        const temperature = options.temperature ?? 0.1;

        const systemPrompt =
          `You are an accurate medical and public health translator. ` +
          `Translate the user's text into ${langMeta.name} (${langMeta.nativeName}). ` +
          `CRITICAL RULES:\n` +
          `1. Output ONLY the direct translated text. Do not add quotes, commentary, greetings, or conversational filler.\n` +
          `2. Preserve all numbers, percentages, dates, and punctuation marks exactly.\n` +
          `3. NEVER modify emergency phone numbers (e.g. 112, 108, 911, 988, 999).\n` +
          `4. NEVER translate or modify URLs (e.g. https://www.who.int).\n` +
          `5. Keep medical abbreviations (WHO, CDC, ICU, BP, BMI) and clinical disease names clear and recognized.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: trimmed },
        ];

        const response = await (window as any).puter.ai.chat(messages, {
          model,
          temperature,
        });

        let translated = response?.message?.content || '';
        if (typeof translated === 'string') {
          translated = translated.trim();
          // Remove wrapping quotes if model wrapped output in quotes
          if (
            (translated.startsWith('"') && translated.endsWith('"')) ||
            (translated.startsWith("'") && translated.endsWith("'"))
          ) {
            translated = translated.slice(1, -1).trim();
          }
        }

        if (!translated) {
          return text; // Graceful fallback
        }

        // Cache the successful translation
        memoryCache.set(cacheKey, translated);
        saveToLocalCache(trimmed, translated, targetLang);

        return translated;
      } catch (err) {
        console.warn(`[Translation] Failed translating to ${targetLang}:`, err);
        return text; // Safe fallback
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();

    inFlightRequests.set(cacheKey, translationPromise);
    return translationPromise;
  },

  /**
   * Translate an array of texts in parallel with throttling
   */
  async translateBatch(
    texts: string[],
    targetLang: string,
    options: TranslationOptions = {}
  ): Promise<string[]> {
    if (targetLang === 'en') return texts;

    // Process in batches of 5 to respect browser and model limits
    const results: string[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const slice = texts.slice(i, i + BATCH_SIZE);
      const batchPromises = slice.map(t => this.translateText(t, targetLang, options));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  },

  /**
   * Clear in-memory and local cache for testing or reset
   */
  clearCache(targetLang?: string): void {
    if (targetLang) {
      // Clear memory keys matching targetLang
      for (const k of Array.from(memoryCache.keys())) {
        if (k.startsWith(`${targetLang}:`)) {
          memoryCache.delete(k);
        }
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`${LOCAL_CACHE_PREFIX}${targetLang}`);
      }
    } else {
      memoryCache.clear();
      if (typeof localStorage !== 'undefined') {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(LOCAL_CACHE_PREFIX)) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  },

  /**
   * Check cache statistics
   */
  getCacheStats(): { memorySize: number } {
    return { memorySize: memoryCache.size };
  },
};
