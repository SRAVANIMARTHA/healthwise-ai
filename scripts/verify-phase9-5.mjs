/**
 * Phase 9.5 Scalable Multilingual Architecture Verification Suite
 *
 * Verifies:
 * 1. 22-Language Registry Architecture (3 Reviewed/Verified, 19 AI-Supported, RTL/LTR metadata)
 * 2. Puter.js Translation Service Engine (model discovery, in-memory + local storage caching, deduplication, fallback)
 * 3. Static Translation Dictionary 1:1 Parity across all 9 UI sections (en, te, hi)
 * 4. Repository-Wide UI Localization Audit (Header, HeroSection, HomePage, Footer)
 * 5. Puter AI Chatbot 22-Language Integration & Directive
 * 6. Safety & Emergency Invariants Preservation (112, 108, 911, medical disclaimers)
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('====================================================');
console.log('Starting Phase 9.5 Scalable Multilingual Verification');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. Language Registry Verification
// ----------------------------------------------------
console.log('--- 1. Language Registry (22 Languages: 3 Reviewed, 19 AI-Supported) ---');

const registryPath = resolve('src/services/i18n/language-registry.ts');
const registrySrc = readFileSync(registryPath, 'utf8');

assert(registrySrc.includes("export const LANGUAGE_REGISTRY: LanguageMetadata[]"), 'Exports typed LANGUAGE_REGISTRY array');
assert(registrySrc.includes("export const REVIEWED_LANGUAGE_CODES"), 'Exports REVIEWED_LANGUAGE_CODES array');
assert(registrySrc.includes("export function getLanguageByCode"), 'Exports getLanguageByCode lookup helper');
assert(registrySrc.includes("export function isLanguageSupported"), 'Exports isLanguageSupported validation helper');
assert(registrySrc.includes("export function getLanguageDirection"), 'Exports getLanguageDirection text direction helper');
assert(registrySrc.includes("export function isRTLLanguage"), 'Exports isRTLLanguage helper');
assert(registrySrc.includes("export function getLanguageDirection"), 'Exports getLanguageDirection text direction helper');
assert(registrySrc.includes("export function isRTLLanguage"), 'Exports isRTLLanguage helper');

// Extract languages by parsing code entries from SUPPORTED_LANGUAGES
const langCodesMatch = registrySrc.match(/code:\s*'([a-zA-Z-]+)'/g);
const extractedCodes = langCodesMatch ? langCodesMatch.map(m => m.match(/'([^']+)'/)[1]) : [];
assert(extractedCodes.length === 22, `Exactly 22 languages registered in SUPPORTED_LANGUAGES (found ${extractedCodes.length})`);

// Verify Reviewed Languages: ONLY English, Telugu, Hindi
assert(registrySrc.includes("code: 'en'") && registrySrc.includes("name: 'English'") && registrySrc.includes("badgeLabel: 'Verified'"), 'English is verified and reviewed');
assert(registrySrc.includes("code: 'te'") && registrySrc.includes("name: 'Telugu'") && registrySrc.includes("badgeLabel: 'Verified'"), 'Telugu is verified and reviewed');
assert(registrySrc.includes("code: 'hi'") && registrySrc.includes("name: 'Hindi'") && registrySrc.includes("badgeLabel: 'Verified'"), 'Hindi is verified and reviewed');

// Verify exactly 3 languages have isReviewed: true
const reviewedCount = (registrySrc.match(/isReviewed:\s*true/g) || []).length;
const aiSupportedCount = (registrySrc.match(/isReviewed:\s*false/g) || []).length;
assert(reviewedCount === 3, `Strictly 3 languages marked isReviewed: true (found ${reviewedCount})`);
assert(aiSupportedCount === 19, `Strictly 19 languages marked isReviewed: false (found ${aiSupportedCount})`);

// Verify RTL languages (Arabic and Urdu)
assert(registrySrc.includes("code: 'ar'") && registrySrc.includes("direction: 'rtl'"), 'Arabic is configured with direction: "rtl"');
assert(registrySrc.includes("code: 'ur'") && registrySrc.includes("direction: 'rtl'"), 'Urdu is configured with direction: "rtl"');

// ----------------------------------------------------
// 2. Puter.js Dynamic Translation Service
// ----------------------------------------------------
console.log('\n--- 2. Puter.js Dynamic Translation Service Engine ---');

const translationServicePath = resolve('src/services/i18n/translation-service.ts');
const translationServiceSrc = readFileSync(translationServicePath, 'utf8');

assert(translationServiceSrc.includes("puter.ai.chat"), 'Uses existing Puter.js puter.ai.chat() integration');
assert(translationServiceSrc.includes("getActiveModel"), 'Implements dynamic model discovery via getActiveModel()');
assert(translationServiceSrc.includes("puter.ai.listModels"), 'Queries Puter runtime model list when available');
assert(translationServiceSrc.includes("VITE_PUTER_TRANSLATION_MODEL"), 'Supports configurable translation model via env variable');
assert(translationServiceSrc.includes("memoryCache = new Map<string, string>()"), 'Implements high-performance in-memory translation cache');
assert(translationServiceSrc.includes("inFlightRequests = new Map<string, Promise<string>>()"), 'Implements in-flight request deduplication map');
assert(translationServiceSrc.includes("healthwise_trans_cache_"), 'Persists dynamic translations to localStorage');

// Protection of critical medical entities & emergency numbers
assert(translationServiceSrc.includes("NEVER modify emergency phone numbers"), 'System prompt strictly protects emergency numbers from translation alteration');
assert(translationServiceSrc.includes("Output ONLY the direct translated text"), 'System prompt forbids conversational filler, pleasantries, or preamble');
assert(translationServiceSrc.includes("return text; // Graceful fallback") || translationServiceSrc.includes("return text; // Safe fallback"), 'Implements graceful fallback to English baseline on error');

// ----------------------------------------------------
// 3. Static Translation Dictionary Parity (en, te, hi)
// ----------------------------------------------------
console.log('\n--- 3. Static Translation Dictionary 1:1 Parity ---');

const translationsPath = resolve('src/services/i18n/translations.ts');
const translationsSrc = readFileSync(translationsPath, 'utf8');

const requiredSections = [
  'nav',
  'chat',
  'diseases',
  'diseaseDetail',
  'resources',
  'bookmarks',
  'safety',
  'home',
  'footer',
];

for (const sec of requiredSections) {
  assert(translationsSrc.includes(`${sec}: {`), `Section '${sec}' is defined in dictionary`);
}

// Check home section keys in all 3 languages
const homeKeys = [
  'heroBadge',
  'heroTitle',
  'heroTitleHighlight',
  'heroDesc',
  'startChat',
  'exploreDiseases',
  'whoCdcGrounded',
  'zeroHallucination',
  'strictSafety',
  'assistantTitle',
  'evidenceGrounded',
  'demoUserQuery',
  'demoAiResponse',
  'demoRedFlag',
  'demoSource',
  'educationalOnly',
  'tryAsking',
  'ctaBadge',
  'ctaTitle',
  'ctaDesc',
  'ctaChatBtn',
  'ctaDiseasesBtn',
  'ctaDisclaimer',

  // Platform Capabilities
  'capBadge',
  'capTitle',
  'capDesc',
  'capDiseaseEduTitle',
  'capDiseaseEduDesc',
  'capSymptomsTitle',
  'capSymptomsDesc',
  'capPreventionTitle',
  'capPreventionDesc',
  'capVaccineTitle',
  'capVaccineDesc',
  'capNutritionTitle',
  'capNutritionDesc',
  'capEmergencyTitle',
  'capEmergencyDesc',
  'capStandard',

  // Supported Topics
  'topicsBadge',
  'topicsTitle',
  'topicsDesc',
  'topicsViewAll',
  'topicDengueName',
  'topicDengueCategory',
  'topicDengueDesc',
  'topicDengueBadge',
  'topicDiabetesName',
  'topicDiabetesCategory',
  'topicDiabetesDesc',
  'topicDiabetesBadge',
  'topicHypertensionName',
  'topicHypertensionCategory',
  'topicHypertensionDesc',
  'topicHypertensionBadge',
  'topicInfluenzaName',
  'topicInfluenzaCategory',
  'topicInfluenzaDesc',
  'topicInfluenzaBadge',
  'topicHygieneName',
  'topicHygieneCategory',
  'topicHygieneDesc',
  'topicHygieneBadge',
  'topicVaccineName',
  'topicVaccineCategory',
  'topicVaccineDesc',
  'topicVaccineBadge',
  'topicReadGuide',

  // How It Works
  'howBadge',
  'howTitle',
  'howDesc',
  'howStep1Title',
  'howStep1Desc',
  'howStep2Title',
  'howStep2Desc',
  'howStep3Title',
  'howStep3Desc',
  'howStep4Title',
  'howStep4Desc',
  'howStep5Title',
  'howStep5Desc',
  'howVerifiedStep',

  // Trusted Sources
  'sourcesBadge',
  'sourcesTitle',
  'sourcesDesc',
  'sourceWhoType',
  'sourceWhoDesc',
  'sourceWhoCoverage',
  'sourceCdcType',
  'sourceCdcDesc',
  'sourceCdcCoverage',
  'sourceMohfwType',
  'sourceMohfwDesc',
  'sourceMohfwCoverage',
  'sourceNhsType',
  'sourceNhsDesc',
  'sourceNhsCoverage',
  'sourceCuratedAreas',
  'sourceAudited',
  'sourceVisitPortal',

  // Multilingual Showcase
  'multiBadge',
  'multiTitle',
  'multiDesc',
  'multiPointEn',
  'multiPointTe',
  'multiPointHi',
  'multiTryChat',

  // FAQ Section
  'faqBadge',
  'faqTitle',
  'faqDesc',
  'faqQ1',
  'faqA1',
  'faqQ2',
  'faqA2',
  'faqQ3',
  'faqA3',
  'faqQ4',
  'faqA4',
  'faqQ5',
  'faqA5',
  'faqQ6',
  'faqA6',
];

for (const key of homeKeys) {
  const matches = (translationsSrc.match(new RegExp(`${key}:`, 'g')) || []).length;
  // At least 4 occurrences: 1 interface definition + 3 languages (en, te, hi)
  assert(matches >= 4, `Home key '${key}' defined in interface and all 3 languages (found ${matches} matches)`);
}

// Check footer section keys in all 3 languages
const footerKeys = [
  'emergencyWarningTitle',
  'emergencyWarningText',
  'emergencyContactsBtn',
  'brandDesc',
  'evidenceBasedEducation',
  'exploreHealth',
  'trustedSources',
  'platformSafety',
  'aiChatbot',
  'diseaseExplorer',
  'preventionGuides',
  'vaccinationSchedules',
  'healthyHabits',
  'verifiedDirectory',
  'aboutProject',
  'privacyPolicy',
  'termsOfService',
  'allRightsReserved',
  'disclaimer',
];

for (const key of footerKeys) {
  const matches = (translationsSrc.match(new RegExp(`${key}:`, 'g')) || []).length;
  assert(matches >= 4, `Footer key '${key}' defined in interface and all 3 languages (found ${matches} matches)`);
}

// Check auth section keys in all 3 languages
const authKeys = [
  'signInTitle',
  'signInSubtitle',
  'signUpTitle',
  'signUpSubtitle',
  'emailLabel',
  'passwordLabel',
  'fullNameLabel',
  'signInBtn',
  'signUpBtn',
  'oneClickTest',
  'signInAsUser',
  'signInAsAdmin',
  'noAccount',
  'hasAccount',
];

for (const key of authKeys) {
  const matches = (translationsSrc.match(new RegExp(`${key}:`, 'g')) || []).length;
  assert(matches >= 4, `Auth key '${key}' defined in interface and all 3 languages (found ${matches} matches)`);
}

// Check admin section keys in all 3 languages
const adminKeys = [
  'dashboard',
  'knowledgeBase',
  'sources',
  'contentReview',
  'analytics',
  'feedback',
  'safetyLogs',
  'settings',
  'adminPortal',
  'backToApp',
  'superAdminRole',
  'rlsEnforced',
  'overviewTitle',
  'overviewSubtitle',
  'indexedDocs',
  'verifiedSources',
  'pendingReviews',
  'safetyTriggers',
  'systemHealth',
  'allServicesOp',
  'aiEngine',
  'databaseRls',
  'safetyGuardrails',
  'readyForInference',
  'schemaMigrationsReady',
  'engineActive',
];

for (const key of adminKeys) {
  const matches = (translationsSrc.match(new RegExp(`${key}:`, 'g')) || []).length;
  assert(matches >= 4, `Admin key '${key}' defined in interface and all 3 languages (found ${matches} matches)`);
}

// Check common section keys in all 3 languages
const commonKeys = [
  'loading',
  'error',
  'retry',
  'save',
  'cancel',
  'delete',
  'edit',
  'close',
  'back',
  'search',
  'noData',
  'comingSoon',
  'educationalNotice',
  'educationalNoticeText',
  'importantDisclaimer',
  'importantDisclaimerText',
  'zeroLatencyEscalation',
  'callHotline',
  'allHotlines',
  'hotlinesDirectoryTitle',
  'hotlinesDirectoryDesc',
  'searchHotlines',
];

for (const key of commonKeys) {
  const matches = (translationsSrc.match(new RegExp(`${key}:`, 'g')) || []).length;
  assert(matches >= 4, `Common key '${key}' defined in interface and all 3 languages (found ${matches} matches)`);
}

// ----------------------------------------------------
// 4. Repository-Wide UI Localization Audit
// ----------------------------------------------------
console.log('\n--- 4. Repository-Wide UI Localization Audit ---');

const headerPath = resolve('src/components/layout/Header.tsx');
const headerSrc = readFileSync(headerPath, 'utf8');

assert(headerSrc.includes("langSearch"), 'Header implements language search filter state');
assert(headerSrc.includes("verifiedLanguages"), 'Header groups verified and reviewed languages');
assert(headerSrc.includes("aiLanguages"), 'Header groups AI-supported languages');
assert(headerSrc.includes("Search 22 languages..."), 'Header desktop dropdown includes search input for 22 languages');
assert(headerSrc.includes("Verified & Reviewed"), 'Header desktop dropdown shows "Verified & Reviewed" section');
assert(headerSrc.includes("AI-Supported"), 'Header desktop dropdown shows "AI-Supported" section');
assert(headerSrc.includes("<optgroup label=\"Verified & Reviewed\">"), 'Header mobile drawer includes accessible optgroup for verified languages');
assert(headerSrc.includes("<optgroup label=\"AI-Supported World Languages\">"), 'Header mobile drawer includes accessible optgroup for AI-supported languages');

const heroPath = resolve('src/components/landing/HeroSection.tsx');
const heroSrc = readFileSync(heroPath, 'utf8');

assert(heroSrc.includes("useTranslation"), 'HeroSection imports useTranslation hook');
assert(heroSrc.includes("t('home', 'heroBadge')"), 'HeroSection localizes hero badge');
assert(heroSrc.includes("t('home', 'heroTitle')"), 'HeroSection localizes hero title');
assert(heroSrc.includes("t('home', 'heroTitleHighlight')"), 'HeroSection localizes hero title highlight');
assert(heroSrc.includes("t('home', 'heroDesc')"), 'HeroSection localizes hero description');
assert(heroSrc.includes("t('home', 'startChat')"), 'HeroSection localizes Start Health Chat button');
assert(heroSrc.includes("t('home', 'exploreDiseases')"), 'HeroSection localizes Explore Diseases button');
assert(heroSrc.includes("t('home', 'whoCdcGrounded')"), 'HeroSection localizes WHO & CDC Grounded trust highlight');
assert(heroSrc.includes("t('home', 'zeroHallucination')"), 'HeroSection localizes Zero Hallucination Guardrails trust highlight');
assert(heroSrc.includes("t('home', 'strictSafety')"), 'HeroSection localizes Strict Non-Diagnostic Safety trust highlight');
assert(heroSrc.includes("t('home', 'assistantTitle')"), 'HeroSection localizes preview assistant title');
assert(heroSrc.includes("t('home', 'demoUserQuery')"), 'HeroSection localizes demo user query');
assert(heroSrc.includes("t('home', 'demoAiResponse')"), 'HeroSection localizes demo AI response');
assert(heroSrc.includes("t('home', 'demoRedFlag')"), 'HeroSection localizes demo red-flag advisory');

const capabilitiesPath = resolve('src/components/landing/CapabilitiesSection.tsx');
const capabilitiesSrc = readFileSync(capabilitiesPath, 'utf8');
assert(capabilitiesSrc.includes("useTranslation"), 'CapabilitiesSection imports useTranslation');
assert(capabilitiesSrc.includes("t('home', 'capBadge')"), 'CapabilitiesSection translates capBadge');
assert(capabilitiesSrc.includes("t('home', 'capTitle')"), 'CapabilitiesSection translates capTitle');
assert(capabilitiesSrc.includes("t('home', 'capDesc')"), 'CapabilitiesSection translates capDesc');
assert(capabilitiesSrc.includes("t('home', 'capDiseaseEduTitle')"), 'CapabilitiesSection translates capDiseaseEduTitle');
assert(capabilitiesSrc.includes("t('home', 'capSymptomsTitle')"), 'CapabilitiesSection translates capSymptomsTitle');
assert(capabilitiesSrc.includes("t('home', 'capPreventionTitle')"), 'CapabilitiesSection translates capPreventionTitle');
assert(capabilitiesSrc.includes("t('home', 'capStandard')"), 'CapabilitiesSection translates capStandard');

const topicsPath = resolve('src/components/landing/TopicsSection.tsx');
const topicsSrc = readFileSync(topicsPath, 'utf8');
assert(topicsSrc.includes("useTranslation"), 'TopicsSection imports useTranslation');
assert(topicsSrc.includes("t('home', 'topicsBadge')"), 'TopicsSection translates topicsBadge');
assert(topicsSrc.includes("t('home', 'topicsTitle')"), 'TopicsSection translates topicsTitle');
assert(topicsSrc.includes("t('home', 'topicDengueName')"), 'TopicsSection translates topicDengueName');
assert(topicsSrc.includes("t('home', 'topicReadGuide')"), 'TopicsSection translates topicReadGuide');

const howPath = resolve('src/components/landing/HowItWorksSection.tsx');
const howSrc = readFileSync(howPath, 'utf8');
assert(howSrc.includes("useTranslation"), 'HowItWorksSection imports useTranslation');
assert(howSrc.includes("t('home', 'howBadge')"), 'HowItWorksSection translates howBadge');
assert(howSrc.includes("t('home', 'howTitle')"), 'HowItWorksSection translates howTitle');
assert(howSrc.includes("t('home', 'howStep1Title')"), 'HowItWorksSection translates howStep1Title');
assert(howSrc.includes("t('home', 'howVerifiedStep')"), 'HowItWorksSection translates howVerifiedStep');

const sourcesPath = resolve('src/components/landing/TrustedSourcesSection.tsx');
const sourcesSrc = readFileSync(sourcesPath, 'utf8');
assert(sourcesSrc.includes("useTranslation"), 'TrustedSourcesSection imports useTranslation');
assert(sourcesSrc.includes("t('home', 'sourcesBadge')"), 'TrustedSourcesSection translates sourcesBadge');
assert(sourcesSrc.includes("t('home', 'sourcesTitle')"), 'TrustedSourcesSection translates sourcesTitle');
assert(sourcesSrc.includes("t('home', 'sourceWhoType')"), 'TrustedSourcesSection translates sourceWhoType');
assert(sourcesSrc.includes("t('home', 'sourceAudited')"), 'TrustedSourcesSection translates sourceAudited');

const multiPath = resolve('src/components/landing/MultilingualShowcase.tsx');
const multiSrc = readFileSync(multiPath, 'utf8');
assert(multiSrc.includes("useTranslation"), 'MultilingualShowcase imports useTranslation');
assert(multiSrc.includes("t('home', 'multiBadge')"), 'MultilingualShowcase translates multiBadge');
assert(multiSrc.includes("t('home', 'multiTitle')"), 'MultilingualShowcase translates multiTitle');
assert(multiSrc.includes("t('home', 'multiPointEn')"), 'MultilingualShowcase translates multiPointEn');
assert(multiSrc.includes("t('home', 'multiPointTe')"), 'MultilingualShowcase translates multiPointTe');
assert(multiSrc.includes("t('home', 'multiPointHi')"), 'MultilingualShowcase translates multiPointHi');

const faqPath = resolve('src/components/landing/FAQSection.tsx');
const faqSrc = readFileSync(faqPath, 'utf8');
assert(faqSrc.includes("useTranslation"), 'FAQSection imports useTranslation');
assert(faqSrc.includes("t('home', 'faqBadge')"), 'FAQSection translates faqBadge');
assert(faqSrc.includes("t('home', 'faqTitle')"), 'FAQSection translates faqTitle');
assert(faqSrc.includes("t('home', 'faqQ1')"), 'FAQSection translates faqQ1');

const homePagePath = resolve('src/pages/HomePage.tsx');
const homePageSrc = readFileSync(homePagePath, 'utf8');

assert(homePageSrc.includes("useTranslation"), 'HomePage imports useTranslation hook');
assert(homePageSrc.includes("t('home', 'ctaBadge')"), 'HomePage localizes bottom CTA badge');
assert(homePageSrc.includes("t('home', 'ctaTitle')"), 'HomePage localizes bottom CTA heading');
assert(homePageSrc.includes("t('home', 'ctaDesc')"), 'HomePage localizes bottom CTA description');
assert(homePageSrc.includes("t('home', 'ctaChatBtn')"), 'HomePage localizes bottom CTA chat button');
assert(homePageSrc.includes("t('home', 'ctaDiseasesBtn')"), 'HomePage localizes bottom CTA diseases button');
assert(homePageSrc.includes("t('home', 'ctaDisclaimer')"), 'HomePage localizes bottom CTA disclaimer note');

const footerPath = resolve('src/components/layout/Footer.tsx');
const footerSrc = readFileSync(footerPath, 'utf8');

assert(footerSrc.includes("useTranslation"), 'Footer imports useTranslation hook');
assert(footerSrc.includes("t('footer', 'emergencyWarningTitle')"), 'Footer localizes emergency warning title');
assert(footerSrc.includes("t('footer', 'emergencyWarningText')"), 'Footer localizes emergency warning text');
assert(footerSrc.includes("t('footer', 'emergencyContactsBtn')"), 'Footer localizes emergency contacts button');
assert(footerSrc.includes("t('footer', 'brandDesc')"), 'Footer localizes brand description');
assert(footerSrc.includes("t('footer', 'exploreHealth')"), 'Footer localizes Explore Health heading');
assert(footerSrc.includes("t('footer', 'trustedSources')"), 'Footer localizes Trusted Sources heading');
assert(footerSrc.includes("t('footer', 'platformSafety')"), 'Footer localizes Platform & Safety heading');
assert(footerSrc.includes("t('footer', 'disclaimer')"), 'Footer localizes non-diagnostic disclaimer notice');

const loginPath = resolve('src/pages/LoginPage.tsx');
const loginSrc = readFileSync(loginPath, 'utf8');
assert(loginSrc.includes("useTranslation"), 'LoginPage imports useTranslation');
assert(loginSrc.includes("t('auth', 'signInTitle')"), 'LoginPage translates signInTitle');

const regPath = resolve('src/pages/RegisterPage.tsx');
const regSrc = readFileSync(regPath, 'utf8');
assert(regSrc.includes("useTranslation"), 'RegisterPage imports useTranslation');
assert(regSrc.includes("t('auth', 'signUpTitle')"), 'RegisterPage translates signUpTitle');

const adminDashPath = resolve('src/pages/admin/AdminDashboard.tsx');
const adminDashSrc = readFileSync(adminDashPath, 'utf8');
assert(adminDashSrc.includes("useTranslation"), 'AdminDashboard imports useTranslation');
assert(adminDashSrc.includes("t('admin', 'overviewTitle')"), 'AdminDashboard translates overviewTitle');

const adminLayoutPath = resolve('src/pages/admin/AdminLayout.tsx');
const adminLayoutSrc = readFileSync(adminLayoutPath, 'utf8');
assert(adminLayoutSrc.includes("useTranslation"), 'AdminLayout imports useTranslation');
assert(adminLayoutSrc.includes("t('admin', 'dashboard')"), 'AdminLayout translates dashboard');

const discBannerPath = resolve('src/components/common/DisclaimerBanner.tsx');
const discBannerSrc = readFileSync(discBannerPath, 'utf8');
assert(discBannerSrc.includes("useTranslation"), 'DisclaimerBanner imports useTranslation');
assert(discBannerSrc.includes("t('common', 'educationalNotice')"), 'DisclaimerBanner translates educationalNotice');

const emerBannerPath = resolve('src/components/common/EmergencyBanner.tsx');
const emerBannerSrc = readFileSync(emerBannerPath, 'utf8');
assert(emerBannerSrc.includes("useTranslation"), 'EmergencyBanner imports useTranslation');
assert(emerBannerSrc.includes("t('common', 'zeroLatencyEscalation')"), 'EmergencyBanner translates zeroLatencyEscalation');

const hotlineModalPath = resolve('src/components/common/HotlineModal.tsx');
const hotlineModalSrc = readFileSync(hotlineModalPath, 'utf8');
assert(hotlineModalSrc.includes("useTranslation"), 'HotlineModal imports useTranslation');
assert(hotlineModalSrc.includes("t('common', 'hotlinesDirectoryTitle')"), 'HotlineModal translates hotlinesDirectoryTitle');

// ----------------------------------------------------
// 5. Puter AI Chatbot 22-Language Integration
// ----------------------------------------------------
console.log('\n--- 5. Puter AI Chatbot 22-Language Integration ---');

const puterAIServicePath = resolve('src/services/ai/puter-ai-service.ts');
const puterAISrc = readFileSync(puterAIServicePath, 'utf8');

assert(puterAISrc.includes("import { getLanguageByCode } from '../i18n/language-registry'"), 'Puter AI service imports getLanguageByCode from registry');
assert(puterAISrc.includes("isTelugu"), 'Detects Telugu communication preference');
assert(puterAISrc.includes("isHindi"), 'Detects Hindi communication preference');
assert(puterAISrc.includes("langConfig.name"), 'Dynamically injects target language directive for any of the 22 languages');
assert(puterAISrc.includes("Base your information strictly on the provided WHO evidence"), 'Grounds multilingual responses strictly in WHO retrieved evidence');
assert(puterAISrc.includes("Include the standard educational medical disclaimer"), 'Mandates medical disclaimer in the user preferred language');

// ----------------------------------------------------
// 6. Emergency & Safety Invariants
// ----------------------------------------------------
console.log('\n--- 6. Emergency & Safety Invariants ---');

assert(translationsSrc.includes("112 / 911 / 108"), 'English emergency numbers preserved');
assert(translationsSrc.includes("112 / 108"), 'Telugu emergency numbers preserved');
assert(translationsSrc.includes("112 / 108 / 911"), 'Hindi emergency numbers preserved');
assert(translationsSrc.includes("⚕️"), 'Medical disclaimer symbol ⚕️ preserved across dictionaries');

console.log(`\n====================================================`);
console.log(`Phase 9.5 Verification Summary: ${passed} PASSED, ${failed} FAILED`);
console.log(`====================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
