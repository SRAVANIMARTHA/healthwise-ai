/**
 * HealthWise AI — Language Registry
 *
 * Defines all supported languages across two distinct tiers:
 * 1. REVIEWED & VERIFIED LANGUAGES: English, Telugu, Hindi.
 *    - Curated by medical and linguistic reviewers.
 *    - Zero hallucination risk on static UI and safety disclaimers.
 * 2. AI-SUPPORTED DYNAMIC LANGUAGES: Additional world and regional languages.
 *    - Dynamically translated via Puter.js AI with persistent client-side caching.
 *    - Explicitly labeled as "AI-Supported" to maintain medical trust and regulatory compliance.
 */

export interface LanguageMetadata {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  isReviewed: boolean;
  hasSafetyReviewed: boolean;
  category: 'reviewed' | 'regional' | 'global';
  badgeLabel: string;
}

export const LANGUAGE_REGISTRY: LanguageMetadata[] = [
  // ---------- TIER 1: VERIFIED & REVIEWED LANGUAGES ----------
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    isReviewed: true,
    hasSafetyReviewed: true,
    category: 'reviewed',
    badgeLabel: 'Verified',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    direction: 'ltr',
    isReviewed: true,
    hasSafetyReviewed: true,
    category: 'reviewed',
    badgeLabel: 'Verified',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    isReviewed: true,
    hasSafetyReviewed: true,
    category: 'reviewed',
    badgeLabel: 'Verified',
  },

  // ---------- TIER 2: AI-SUPPORTED REGIONAL LANGUAGES ----------
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'regional',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'regional',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'regional',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'regional',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'regional',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'regional',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'regional',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'regional',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'regional',
    badgeLabel: 'AI-Supported',
  },

  // ---------- TIER 2: AI-SUPPORTED GLOBAL LANGUAGES ----------
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
  {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    direction: 'ltr',
    isReviewed: false,
    hasSafetyReviewed: false,
    category: 'global',
    badgeLabel: 'AI-Supported',
  },
];

export const REVIEWED_LANGUAGE_CODES = ['en', 'te', 'hi'] as const;
export type ReviewedLanguageCode = typeof REVIEWED_LANGUAGE_CODES[number];

export function getLanguageByCode(code: string): LanguageMetadata {
  const found = LANGUAGE_REGISTRY.find(l => l.code === code || l.code.toLowerCase() === code.toLowerCase());
  return found || LANGUAGE_REGISTRY[0]; // fallback to English
}

export function isLanguageReviewed(code: string): boolean {
  return REVIEWED_LANGUAGE_CODES.includes(code as ReviewedLanguageCode);
}

export function isRTLLanguage(code: string): boolean {
  return getLanguageByCode(code).direction === 'rtl';
}

export function getLanguageDirection(code: string): 'ltr' | 'rtl' {
  return getLanguageByCode(code).direction;
}

export function isLanguageSupported(code: string): boolean {
  return LANGUAGE_REGISTRY.some(l => l.code.toLowerCase() === code.toLowerCase());
}
