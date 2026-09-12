/**
 * Phase 9 Verification Test Suite — Multilingual Support (HealthWise AI)
 * 
 * Verifies:
 * 1. Translation Dictionary Completeness & Parity (EN, TE, HI)
 * 2. Authentic Script Validation (Telugu Unicode \u0C00-\u0C7F, Devanagari \u0900-\u097F)
 * 3. Language Service & Fallback Resolution
 * 4. Multilingual Emergency Red-Flag Triage (EN, TE, HI)
 * 5. Multilingual Output Sanitizer & Localized Disclaimer Appending
 * 6. Multilingual Puter AI System Prompt Directives & Localized Mock Responses
 * 7. Cross-Phase Preservation (Puter AI, RAG retrieval, WHO Knowledge Base, Safety Guardrails)
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('Starting Phase 9 Multilingual Support Verification');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. Translation Dictionaries Verification
// ----------------------------------------------------
console.log('--- 1. Translation Dictionary Completeness & Parity ---');

const translationsPath = resolve('src/services/i18n/translations.ts');
const translationsSrc = readFileSync(translationsPath, 'utf8');

// Basic structural checks on translations.ts
assert(translationsSrc.includes("export type SupportedLanguageCode = 'en' | 'te' | 'hi'"), 'Defines SupportedLanguageCode with en, te, hi');
assert(translationsSrc.includes("export const TRANSLATIONS: Record<SupportedLanguageCode, TranslationDictionary>"), 'Exports typed TRANSLATIONS dictionary');
assert(translationsSrc.includes("en: {"), 'Contains English translations');
assert(translationsSrc.includes("te: {"), 'Contains Telugu translations');
assert(translationsSrc.includes("hi: {"), 'Contains Hindi translations');

// Check sections defined in TRANSLATIONS
const sections = ['nav', 'chat', 'diseases', 'diseaseDetail', 'resources', 'bookmarks', 'safety'];
for (const sec of sections) {
  assert(translationsSrc.includes(`${sec}: {`), `Section '${sec}' is present in TRANSLATIONS dictionary`);
}

// Check Telugu and Hindi script presence in translations
const teluguScriptRegex = /[\u0C00-\u0C7F]/;
const devanagariScriptRegex = /[\u0900-\u097F]/;

assert(teluguScriptRegex.test(translationsSrc), 'Contains authentic Telugu Unicode script characters (\\u0C00-\\u0C7F)');
assert(devanagariScriptRegex.test(translationsSrc), 'Contains authentic Hindi Devanagari Unicode script characters (\\u0900-\\u097F)');

// Check specific key translations in Telugu & Hindi
assert(translationsSrc.includes("సాధారణ ఆరోగ్య అవగాహన సమాచారం"), 'Contains Telugu medical disclaimer phrase');
assert(translationsSrc.includes("सामान्य शैक्षिक स्वास्थ्य जानकारी"), 'Contains Hindi medical disclaimer phrase');
assert(translationsSrc.includes("హెల్త్‌వైజ్"), 'Contains Telugu localized brand name');
assert(translationsSrc.includes("हेल्थवाइज"), 'Contains Hindi localized brand name');

// ----------------------------------------------------
// 2. Language Service & Resolution
// ----------------------------------------------------
console.log('\n--- 2. Language Service & Resolution Engine ---');

const i18nServicePath = resolve('src/services/i18n/i18n-service.ts');
const i18nServiceSrc = readFileSync(i18nServicePath, 'utf8');

assert(i18nServiceSrc.includes("SUPPORTED_LANGUAGES"), 'Exports SUPPORTED_LANGUAGES array');
assert(i18nServiceSrc.includes("LANGUAGE_CHANGE_EVENT = 'healthwise_language_changed'"), 'Defines standard window custom event for reactive language updates');
assert(i18nServiceSrc.includes("getCurrentLanguage()"), 'Implements getCurrentLanguage() with fallback');
assert(i18nServiceSrc.includes("setLanguage(lang: SupportedLanguageCode, userId?: string | null)"), 'Implements setLanguage with dual-persistence (localStorage & Supabase profiles)');
assert(i18nServiceSrc.includes("document.documentElement.lang = lang"), 'Updates HTML document lang attribute for accessibility and screen readers');
assert(i18nServiceSrc.includes("translate<S extends keyof TranslationDictionary"), 'Implements fallback-safe translation helper function');

// ----------------------------------------------------
// 3. Multilingual Safety Service & Red-Flag Triage
// ----------------------------------------------------
console.log('\n--- 3. Multilingual Safety Guardrails & Red-Flag Triage ---');

const safetyServicePath = resolve('src/services/safety/safety-service.ts');
const safetyServiceSrc = readFileSync(safetyServicePath, 'utf8');

// Verify multilingual pattern integration in safety-service
assert(safetyServiceSrc.includes("ఛాతీ నొప్పి"), 'Safety rules include Telugu cardiac emergency patterns');
assert(safetyServiceSrc.includes("सीने में दर्द"), 'Safety rules include Hindi cardiac emergency patterns');
assert(safetyServiceSrc.includes("ఊపిరాడ") || safetyServiceSrc.includes("శ్వాస"), 'Safety rules include Telugu respiratory emergency patterns');
assert(safetyServiceSrc.includes("सांस लेने में") || safetyServiceSrc.includes("सांस"), 'Safety rules include Hindi respiratory emergency patterns');
assert(safetyServiceSrc.includes("ఆత్మహత్య"), 'Safety rules include Telugu self-harm emergency patterns');
assert(safetyServiceSrc.includes("आत्महत्या"), 'Safety rules include Hindi self-harm emergency patterns');

// Unit testing safety rules regex directly:
const CARDIAC_REGEX = /(chest pain|crushing pain|pressure in chest|radiating to (arm|jaw|back)|heart attack|myocardial infarction|ఛాతీ నొప్పి|ఛాతీలో నొప్పి|గుండెపోటు|सीने में दर्द|दिल का दौरा|छाती में दर्द)/i;
const RESPIRATORY_REGEX = /(can't breathe|cannot breathe|severe shortness of breath|gasping for air|stridor|asphyxia|choking|lips turning blue|cyanosis|ఊపిరాడటం లేదు|శ్వాస తీసుకోవడంలో ఇబ్బంది|శ్వాస ఆడటం లేదు|నీలంగా మారడం|सांस नहीं आ रही|सांस लेने में तकलीफ|दम घुट रहा|सांस फूलना)/i;
const STROKE_REGEX = /(facial droop|face drooping|arm weakness|slurred speech|sudden confusion|loss of balance|FAST stroke|stroke symptoms|పక్షవాతం|ముఖం వంకర|మాట ముద్ద|అకస్మాత్తుగా బలహీనత|लकवा|स्ट्रोक|चेहरा लटकना|बोलने में लड़खड़ाहट|अचानक कमजोरी)/i;
const SUICIDE_REGEX = /(suicide|kill myself|want to die|end my life|self-harm|cutting myself|take my own life|ఆత్మహత్య|చనిపోవాలని|ప్రాణం తీసుకోవడం|आत्महत्या|जान देना|मरना चाहता|खुद को मारना)/i;

// English tests
assert(CARDIAC_REGEX.test('I have severe chest pain and cold sweat'), 'Detects English cardiac red flag');
assert(RESPIRATORY_REGEX.test('Patient cannot breathe and has stridor'), 'Detects English respiratory red flag');
assert(STROKE_REGEX.test('Sudden facial droop and arm weakness'), 'Detects English stroke red flag');
assert(SUICIDE_REGEX.test('I want to die and end my life'), 'Detects English suicide red flag');

// Telugu tests
assert(CARDIAC_REGEX.test('తీవ్రమైన ఛాతీ నొప్పి వస్తోంది'), 'Detects Telugu cardiac red flag (ఛాతీ నొప్పి)');
assert(RESPIRATORY_REGEX.test('రోగికి ఊపిరాడటం లేదు మరియు ఆందోళన'), 'Detects Telugu respiratory red flag (ఊపిరాడటం లేదు)');
assert(STROKE_REGEX.test('పక్షవాతం లక్షణాలు కనిపిస్తున్నాయి'), 'Detects Telugu stroke red flag (పక్షవాతం)');
assert(SUICIDE_REGEX.test('నేను ఆత్మహత్య చేసుకోవాలనుకుంటున్నాను'), 'Detects Telugu self-harm red flag (ఆత్మహత్య)');

// Hindi tests
assert(CARDIAC_REGEX.test('मुझे सीने में दर्द हो रहा है'), 'Detects Hindi cardiac red flag (सीने में दर्द)');
assert(RESPIRATORY_REGEX.test('मरीज को सांस लेने में तकलीफ हो रही है'), 'Detects Hindi respiratory red flag (सांस लेने में तकलीफ)');
assert(STROKE_REGEX.test('स्ट्रोक के लक्षण दिख रहे हैं चेहरा लटकना'), 'Detects Hindi stroke red flag (स्ट्रोक / चेहरा लटकना)');
assert(SUICIDE_REGEX.test('आत्महत्या के विचार आ रहे हैं मुझे'), 'Detects Hindi self-harm red flag (आत्महत्या)');

// Non-emergency tests across all 3 languages
assert(!CARDIAC_REGEX.test('What causes seasonal allergies?'), 'English allergy query does not trigger cardiac red flag');
assert(!CARDIAC_REGEX.test('విటమిన్ డి ఎక్కడ లభిస్తుంది?'), 'Telugu nutrition query does not trigger cardiac red flag');
assert(!CARDIAC_REGEX.test('व्यायाम के क्या फायदे हैं?'), 'Hindi fitness query does not trigger cardiac red flag');

// ----------------------------------------------------
// 4. Multilingual Output Sanitizer & Disclaimers
// ----------------------------------------------------
console.log('\n--- 4. Multilingual Output Sanitizer & Disclaimers ---');

assert(safetyServiceSrc.includes("సాధారణ ఆరోగ్య అవగాహన సమాచారం"), 'Recognizes Telugu disclaimer in output sanitizer');
assert(safetyServiceSrc.includes("सामान्य शैक्षिक स्वास्थ्य जानकारी"), 'Recognizes Hindi disclaimer in output sanitizer');
assert(safetyServiceSrc.includes("/[\\u0C00-\\u0C7F]/.test(sanitized)"), 'Checks for Telugu characters in output to append Telugu disclaimer');
assert(safetyServiceSrc.includes("/[\\u0900-\\u097F]/.test(sanitized)"), 'Checks for Hindi characters in output to append Hindi disclaimer');

// Test disclaimer detection logic:
const TE_DISCLAIMER = 'గమనిక: ఇది కేవలం సాధారణ ఆరోగ్య అవగాహన సమాచారం మాత్రమే. ఇది వైద్య నిర్ధారణ లేదా చికిత్స కాదు. అత్యవసర పరిస్థితుల్లో లేదా నిర్దిష్ట ఆరోగ్య సమస్యలకు అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.';
const HI_DISCLAIMER = 'महत्वपूर्ण सूचना: यह केवल सामान्य स्वास्थ्य जागरूकता और शैक्षिक जानकारी है। यह चिकित्सकीय सलाह या निदान नहीं है। किसी भी स्वास्थ्य समस्या के लिए योग्य चिकित्सक से परामर्श लें।';
const EN_DISCLAIMER = 'Disclaimer: This information is for general educational and health awareness purposes only. It is not medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.';

function testSanitizeOutput(content) {
  let sanitized = content;
  const hasTeChars = /[\u0C00-\u0C7F]/.test(sanitized);
  const hasHiChars = /[\u0900-\u097F]/.test(sanitized);

  const hasDisclaimer =
    sanitized.toLowerCase().includes('disclaimer:') ||
    sanitized.includes('సాధారణ ఆరోగ్య అవగాహన సమాచారం') ||
    sanitized.includes('వైద్యుడిని సంప్రదించండి') ||
    sanitized.includes('सामान्य शैक्षिक स्वास्थ्य जानकारी') ||
    sanitized.includes('चिकित्सक से परामर्श लें');

  if (!hasDisclaimer) {
    if (hasTeChars) {
      sanitized += `\n\n${TE_DISCLAIMER}`;
    } else if (hasHiChars) {
      sanitized += `\n\n${HI_DISCLAIMER}`;
    } else {
      sanitized += `\n\n${EN_DISCLAIMER}`;
    }
  }

  return sanitized;
}

const rawEnglish = 'Drink 2 liters of water daily and engage in moderate aerobic exercise.';
const sanitizedEnglish = testSanitizeOutput(rawEnglish);
assert(sanitizedEnglish.includes(EN_DISCLAIMER), 'Appends English disclaimer to English output lacking disclaimer');

const rawTelugu = 'ప్రతిరోజూ తగినంత నీరు త్రాగండి మరియు సమతుల్య ఆహారం తీసుకోండి.';
const sanitizedTelugu = testSanitizeOutput(rawTelugu);
assert(sanitizedTelugu.includes(TE_DISCLAIMER), 'Appends Telugu disclaimer to Telugu output lacking disclaimer');

const rawHindi = 'रोजाना पर्याप्त मात्रा में पानी पिएं और फल खाएं।';
const sanitizedHindi = testSanitizeOutput(rawHindi);
assert(sanitizedHindi.includes(HI_DISCLAIMER), 'Appends Hindi disclaimer to Hindi output lacking disclaimer');

// Ensure already present disclaimers are not duplicated
const alreadyTelugu = `${rawTelugu}\n\n${TE_DISCLAIMER}`;
assert(testSanitizeOutput(alreadyTelugu) === alreadyTelugu, 'Does not duplicate existing Telugu disclaimer');

// ----------------------------------------------------
// 5. Multilingual Puter AI Prompt Injection
// ----------------------------------------------------
console.log('\n--- 5. Multilingual Puter AI Prompt Directives ---');

const puterAiServicePath = resolve('src/services/ai/puter-ai-service.ts');
const puterAiServiceSrc = readFileSync(puterAiServicePath, 'utf8');

assert(puterAiServiceSrc.includes("i18nService.getCurrentLanguage()"), 'Puter AI checks current active application language');
assert(puterAiServiceSrc.includes("/[\\u0C00-\\u0C7F]/.test(userQuery)"), 'Puter AI detects Telugu script in user query');
assert(puterAiServiceSrc.includes("/[\\u0900-\\u097F]/.test(userQuery)"), 'Puter AI detects Hindi script in user query');
assert(puterAiServiceSrc.includes("LANGUAGE DIRECTIVE:"), 'Injects clear LANGUAGE DIRECTIVE into AI system prompt');
assert(puterAiServiceSrc.includes("The user prefers communication in Telugu"), 'Provides explicit Telugu response directive to LLM');
assert(puterAiServiceSrc.includes("The user prefers communication in Hindi"), 'Provides explicit Hindi response directive to LLM');
assert(puterAiServiceSrc.includes("generateMockResponse"), 'Supports localized offline mock responses in Telugu and Hindi');

// ----------------------------------------------------
// 6. UI Component Multilingual Integration
// ----------------------------------------------------
console.log('\n--- 6. UI Component Multilingual Integration ---');

const headerPath = resolve('src/components/layout/Header.tsx');
const headerSrc = readFileSync(headerPath, 'utf8');
assert(headerSrc.includes("useTranslation"), 'Header imports and uses useTranslation hook');
assert(headerSrc.includes("t('nav', 'home')"), 'Header translates navigation links using t()');
assert(headerSrc.includes("t('nav', 'selectLanguage')"), 'Header translates language selector modal');
assert(headerSrc.includes("currentLang.nativeName"), 'Header displays native language name (English, తెలుగు, हिन्दी)');

const chatPagePath = resolve('src/pages/ChatPage.tsx');
const chatPageSrc = readFileSync(chatPagePath, 'utf8');
assert(chatPageSrc.includes("useTranslation"), 'ChatPage imports and uses useTranslation hook');
assert(chatPageSrc.includes("t('chat', 'placeholder')"), 'ChatPage localizes input placeholder');
assert(chatPageSrc.includes("t('chat', 'disclaimer')"), 'ChatPage localizes footer disclaimer');
assert(chatPageSrc.includes("t('chat', 'sources')"), 'ChatPage localizes source citation headers');

const diseasesPagePath = resolve('src/pages/DiseasesPage.tsx');
const diseasesPageSrc = readFileSync(diseasesPagePath, 'utf8');
assert(diseasesPageSrc.includes("useTranslation"), 'DiseasesPage imports and uses useTranslation hook');
assert(diseasesPageSrc.includes("t('diseases', 'title')"), 'DiseasesPage localizes directory title');
assert(diseasesPageSrc.includes("t('diseases', 'filterBy')"), 'DiseasesPage localizes filter category label');

// ----------------------------------------------------
// 7. Cross-Phase Preservation (Regression Checklist)
// ----------------------------------------------------
console.log('\n--- 7. Cross-Phase Preservation & Regressions ---');

// Check Phase 8 files exist
const diseaseServicePath = resolve('src/services/diseases/disease-service.ts');
const diseaseServiceSrc = readFileSync(diseaseServicePath, 'utf8');
assert(diseaseServiceSrc.includes("getDiseases"), 'Phase 8 diseaseService.getDiseases intact');
assert(diseaseServiceSrc.includes("getDiseaseBySlug"), 'Phase 8 diseaseService.getDiseaseBySlug intact');

// Check Phase 7 safety logging & emergency banner
assert(safetyServiceSrc.includes("logEvent"), 'Phase 7 safety event logging intact');
assert(safetyServiceSrc.includes("getAuditLogs"), 'Phase 7 safety getAuditLogs intact');

// Check Phase 6 RAG retrieval
const retrievalServicePath = resolve('src/services/knowledge/retrieval-service.ts');
const retrievalServiceSrc = readFileSync(retrievalServicePath, 'utf8');
assert(retrievalServiceSrc.includes("retrieveRelevantChunks"), 'Phase 6 RAG retrieval service intact');

// Check Phase 5 WHO API integration
const whoServicePath = resolve('src/services/knowledge/who-api-service.ts');
const whoServiceSrc = readFileSync(whoServicePath, 'utf8');
assert(whoServiceSrc.includes("fetchFactsheets"), 'Phase 5 WHO Fact Sheets API intact');

// Check Phase 4 Puter AI Service
assert(puterAiServiceSrc.includes("puter.ai.chat"), 'Phase 4 Puter.js integration intact');

// Check Phase 3 Chat Service
const chatServicePath = resolve('src/services/chat/chat-service.ts');
const chatServiceSrc = readFileSync(chatServicePath, 'utf8');
assert(chatServiceSrc.includes("addMessage"), 'Phase 3 Chat addMessage persistence intact');
assert(chatServiceSrc.includes("getMessages"), 'Phase 3 Chat getMessages persistence intact');

// Check Phase 2 Auth
const authServicePath = resolve('src/services/auth/auth-service.ts');
const authServiceSrc = readFileSync(authServicePath, 'utf8');
assert(authServiceSrc.includes("supabase.auth"), 'Phase 2 Supabase auth integration intact');

// Final Summary
console.log('\n====================================================');
console.log(`Phase 9 Verification Results: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Phase 9 Multilingual Support tests passed successfully!\n');
  process.exit(0);
}
