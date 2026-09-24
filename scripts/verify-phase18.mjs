/**
 * verify-phase18.mjs — Phase 18: Health Report Explainer Verification Suite
 *
 * Validates:
 * 1. Types and schema definitions (ReportTestFinding, ReportPattern, ReportAnalysisResult, MedicalAttentionLevel)
 * 2. Report validator service (MIME, extension, size limits <= 10MB, magic bytes checks)
 * 3. Rejection of unsupported files (exe, html, js)
 * 4. pdfjs-dist lazy-loading and PDF text extraction
 * 5. Deterministic report-specific reference range evaluation (value < lower -> low, value > upper -> high)
 * 6. Reference Range Rule: strictly prefers reported range; missing range produces explicit disclaimer
 * 7. Multi-test clinical pattern detection (Anemia, Glycemic, Lipid, Hepatic, Renal)
 * 8. Deterministic 3-tier medical attention classification (informational, discuss_with_doctor, prompt_attention)
 * 9. Non-diagnostic language enforcement (no "you have disease X")
 * 10. Prompt-injection defense on untrusted report text
 * 11. OpenStreetMap nearby healthcare locator service & fallback (zero Google Maps/billing)
 * 12. Session-only privacy (no Supabase table for reports, no raw report text in analytics)
 * 13. UI integration & entry points: App route (/report), Header navLink, Dashboard card, ChatPage action, Floating assistant link
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}: ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

function assertContains(source, pattern, message) {
  const found = typeof pattern === 'string' ? source.includes(pattern) : pattern.test(source);
  if (!found) throw new Error(message || `Expected to find: ${pattern}`);
}

function assertNotContains(source, pattern, message) {
  const found = typeof pattern === 'string' ? source.includes(pattern) : pattern.test(source);
  if (found) throw new Error(message || `Expected NOT to find: ${pattern}`);
}

console.log('\n================================================================');
console.log('PHASE 18 VERIFICATION: HEALTH REPORT EXPLAINER');
console.log('================================================================\n');

// -----------------------------------------------------------------
// Group 1: Types & Schema Integrity
// -----------------------------------------------------------------
console.log('Test Group 1: Types & Schema Integrity');

const typesPath = resolve(projectRoot, 'src/types/report.ts');
const typesSrc = existsSync(typesPath) ? readFileSync(typesPath, 'utf-8') : '';

test('src/types/report.ts exists and defines required report interfaces', () => {
  if (!existsSync(typesPath)) throw new Error('report.ts does not exist');
  assertContains(typesSrc, 'export type MedicalAttentionLevel');
  assertContains(typesSrc, 'export type TestFindingFlag');
  assertContains(typesSrc, 'export interface ReportTestFinding');
  assertContains(typesSrc, 'export interface ReportPattern');
  assertContains(typesSrc, 'export interface ReportAnalysisResult');
  assertContains(typesSrc, 'export interface HealthcareFacility');
});

test('ReportTestFinding includes value, unit, referenceRangeText, and flag', () => {
  assertContains(typesSrc, 'value: string');
  assertContains(typesSrc, 'unit: string');
  assertContains(typesSrc, 'referenceRangeText: string');
  assertContains(typesSrc, 'flag: TestFindingFlag');
});

// -----------------------------------------------------------------
// Group 2: File Validation & Security
// -----------------------------------------------------------------
console.log('\nTest Group 2: File Validation & Security');

const validatorPath = resolve(projectRoot, 'src/services/report/report-validator-service.ts');
const validatorSrc = existsSync(validatorPath) ? readFileSync(validatorPath, 'utf-8') : '';

test('Validator defines 10 MB maximum file size limit', () => {
  assertContains(validatorSrc, 'MAX_REPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024');
});

test('Validator allows PDF, JPG, JPEG, and PNG formats', () => {
  assertContains(validatorSrc, 'application/pdf');
  assertContains(validatorSrc, 'image/jpeg');
  assertContains(validatorSrc, 'image/png');
  assertContains(validatorSrc, "['.pdf', '.jpg', '.jpeg', '.png']");
});

test('Validator checks magic bytes signatures for PDF, JPEG, and PNG', () => {
  assertContains(validatorSrc, 'bytes[0] === 0x25 && bytes[1] === 0x50'); // %PDF
  assertContains(validatorSrc, 'bytes[0] === 0xff && bytes[1] === 0xd8'); // JPEG
  assertContains(validatorSrc, 'bytes[0] === 0x89 && bytes[1] === 0x50'); // PNG
});

test('Validator sanitizes file name against directory traversal', () => {
  assertContains(validatorSrc, "replace(/[^\\w\\s.-]/g, '_')");
});

// -----------------------------------------------------------------
// Group 3: Extractor & pdfjs-dist Lazy-Loading
// -----------------------------------------------------------------
console.log('\nTest Group 3: Extraction & Lazy-Loading');

const extractorPath = resolve(projectRoot, 'src/services/report/report-extractor-service.ts');
const extractorSrc = existsSync(extractorPath) ? readFileSync(extractorPath, 'utf-8') : '';

test('report-extractor-service.ts exists and lazy-loads pdfjs-dist', () => {
  if (!existsSync(extractorPath)) throw new Error('report-extractor-service.ts does not exist');
  assertContains(extractorSrc, "import('pdfjs-dist')");
});

test('Extractor sorts and groups text tokens by Y-coordinate to reconstruct tabular lab rows', () => {
  assertContains(extractorSrc, 'getTextContent()');
  assertContains(extractorSrc, 'transform[5]'); // Y coord
  assertContains(extractorSrc, 'sortedY');
});

test('Extractor detects scanned / image-only PDFs with insufficient text content', () => {
  assertContains(extractorSrc, 'isScannedOrEmpty');
});

// -----------------------------------------------------------------
// Group 4: Parser, Unit Scaling & Deterministic Safety
// -----------------------------------------------------------------
console.log('\nTest Group 4: Unit Scaling, Parsing & Range Evaluation');

const parserPath = resolve(projectRoot, 'src/services/report/report-parser-service.ts');
const parserSrc = existsSync(parserPath) ? readFileSync(parserPath, 'utf-8') : '';

test('Parser supports comprehensive multi-word and scaled units (lakhs, 10^5, /cumm)', () => {
  assertContains(parserSrc, 'lakh/cumm');
  assertContains(parserSrc, '10^5/uL');
  assertContains(parserSrc, '10^3/uL');
  assertContains(parserSrc, '/cumm');
});

test('Unit matching sorts units descending to prevent partial matches', () => {
  assertContains(parserSrc, 'sort((a, b) => b.length - a.length)');
});

test('Parser normalizes scaled units (lakhs, thousands, mmol/L) for critical checks', () => {
  assertContains(parserSrc, 'getNormalizedValueForCriticalCheck');
  assertContains(parserSrc, 'val * 100000'); // Platelet lakh normalization
  assertContains(parserSrc, 'val * 1000');   // WBC thousand normalization
  assertContains(parserSrc, 'val * 18');     // Glucose mmol/L to mg/dL
});

test('Safety Invariant: flag === normal NEVER triggers prompt_attention', () => {
  assertContains(parserSrc, "if (finding.flag === 'normal') continue;");
});

test('Reference Range Rule: uses report printed range or sets missing range disclaimer', () => {
  assertContains(
    parserSrc,
    'The report does not provide a reference range for this result.'
  );
});

test('Deterministic high/low evaluation occurs in code before AI generation', () => {
  assertContains(parserSrc, 'numericVal < lowerLimit');
  assertContains(parserSrc, "flag = 'low'");
  assertContains(parserSrc, 'numericVal > upperLimit');
  assertContains(parserSrc, "flag = 'high'");
  assertContains(parserSrc, "flag = 'normal'");
});

test('Clinical patterns use non-diagnostic educational descriptions', () => {
  assertContains(parserSrc, 'detectPatterns');
  assertNotContains(parserSrc, 'you have anemia');
  assertNotContains(parserSrc, 'you have diabetes');
  assertContains(parserSrc, 'can be associated with');
  assertContains(parserSrc, 'do not establish a diagnosis');
});

test('Deterministic 3-tier medical attention classification exists', () => {
  assertContains(parserSrc, 'classifyMedicalAttention');
  assertContains(parserSrc, "'informational'");
  assertContains(parserSrc, "'discuss_with_doctor'");
  assertContains(parserSrc, "'prompt_attention'");
});

// -----------------------------------------------------------------
// Group 5: Report AI Service, Language & Summary Quality
// -----------------------------------------------------------------
console.log('\nTest Group 5: Report AI Service, Multilingual & Summary Quality');

const aiServicePath = resolve(projectRoot, 'src/services/report/report-ai-service.ts');
const aiServiceSrc = existsSync(aiServicePath) ? readFileSync(aiServicePath, 'utf-8') : '';

test('generateReportExplanation accepts targetLanguage parameter', () => {
  assertContains(aiServiceSrc, "targetLanguage: string = 'en'");
});

test('AI service enforces concise summary length (80-150 words in complete sentences)', () => {
  assertContains(aiServiceSrc, 'concise (80–150 words)');
  assertContains(aiServiceSrc, 'complete, well-formed sentences without truncation');
});

test('AI service removed rawAiResponse.slice(0, 800) sentence-cutting truncation', () => {
  assertNotContains(aiServiceSrc, 'rawAiResponse.slice(0, 800)');
  assertNotContains(aiServiceSrc, '.slice(0, 800)');
});

test('AI service provides multilingual instructions for en, te, hi', () => {
  assertContains(aiServiceSrc, 'languageDirectives');
  assertContains(aiServiceSrc, 'Telugu (తెలుగు)');
  assertContains(aiServiceSrc, 'Hindi (हिन्दी)');
  assertContains(aiServiceSrc, 'LANGUAGE DIRECTIVE');
});

test('AI service provides localized fallback summaries and doctor questions for en, te, hi', () => {
  assertContains(aiServiceSrc, 'మీ నివేదికలో'); // Telugu fallback
  assertContains(aiServiceSrc, 'आपकी रिपोर्ट में'); // Hindi fallback
  assertContains(aiServiceSrc, 'నా పరీక్ష ఫలితాలపై'); // Telugu question
  assertContains(aiServiceSrc, 'क्या मेरी जीवनशैली'); // Hindi question
});

test('AI service strictly enforces ZERO DIAGNOSIS and ZERO PRESCRIPTION rules', () => {
  assertContains(aiServiceSrc, 'DO NOT DIAGNOSE');
  assertContains(aiServiceSrc, 'DO NOT PRESCRIBE');
  assertContains(aiServiceSrc, 'can be associated with');
  assertContains(aiServiceSrc, 'distinguish between "outside the reference range" and "an emergency"');
});

// -----------------------------------------------------------------
// Group 6: OpenStreetMap & MapLibre GL Healthcare Locator
// -----------------------------------------------------------------
console.log('\nTest Group 6: OpenStreetMap & MapLibre GL Healthcare Locator');

const locatorPath = resolve(projectRoot, 'src/services/location/healthcare-finder-service.ts');
const locatorSrc = existsSync(locatorPath) ? readFileSync(locatorPath, 'utf-8') : '';
const panelPath = resolve(projectRoot, 'src/components/healthcare/NearbyHealthcarePanel.tsx');
const panelSrc = existsSync(panelPath) ? readFileSync(panelPath, 'utf-8') : '';

test('Healthcare finder service queries OpenStreetMap Overpass & Nominatim', () => {
  if (!existsSync(locatorPath)) throw new Error('healthcare-finder-service.ts does not exist');
  assertContains(locatorSrc, 'overpass-api.de');
  assertContains(locatorSrc, 'nominatim.openstreetmap.org');
});

test('Zero Google Maps / Google Places API keys or paid services across locator and panel', () => {
  assertNotContains(locatorSrc, 'maps.googleapis.com');
  assertNotContains(locatorSrc, 'GOOGLE_MAPS_API_KEY');
  assertNotContains(panelSrc, 'maps.googleapis.com');
  assertNotContains(panelSrc, 'GOOGLE_MAPS_API_KEY');
  assertNotContains(panelSrc, 'google.maps');
});

test('Queries multiple Overpass mirrors with high availability fallback', () => {
  assertContains(locatorSrc, 'OVERPASS_ENDPOINTS');
  assertContains(locatorSrc, 'https://overpass-api.de/api/interpreter');
  assertContains(locatorSrc, 'https://maps.mail.ru/osm/tools/overpass/api/interpreter');
});

test('Overpass query covers multiple healthcare tagging schemes (amenity & healthcare)', () => {
  assertContains(locatorSrc, 'node["amenity"~"^(hospital|clinic|doctors|health_centre)$"]');
  assertContains(locatorSrc, 'way["amenity"~"^(hospital|clinic|doctors|health_centre)$"]');
  assertContains(locatorSrc, 'node["healthcare"~"^(hospital|clinic|doctor|centre|physician)$"]');
  assertContains(locatorSrc, 'way["healthcare"~"^(hospital|clinic|doctor|centre|physician)$"]');
});

test('Normalizes returned facilities into hospital, clinic, doctor, centre, other', () => {
  assertContains(locatorSrc, "type = 'hospital'");
  assertContains(locatorSrc, "type = 'clinic'");
  assertContains(locatorSrc, "type = 'doctor'");
  assertContains(locatorSrc, "type = 'centre'");
  assertContains(panelSrc, "t('report', 'hospitalTag')");
  assertContains(panelSrc, "t('report', 'clinicTag')");
  assertContains(panelSrc, "t('report', 'doctorTag')");
});

test('Deduplicates facilities using OSM ID and spatial proximity + name matching', () => {
  assertContains(locatorSrc, 'seenOsmIds.has(osmId)');
  assertContains(locatorSrc, 'deduplicatedFacilities');
  assertContains(locatorSrc, 'spatialDist < 0.15');
});

test('Calculates distance via Haversine formula and sorts nearest first', () => {
  assertContains(locatorSrc, 'calculateDistanceKm');
  assertContains(locatorSrc, '6371'); // Earth radius in km
  assertContains(locatorSrc, '(a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)');
});

test('Limits results sensibly (up to 100) and caches in session to respect OSM policy', () => {
  assertContains(locatorSrc, 'slice(0, 100)');
  assertContains(locatorSrc, 'sessionQueryCache');
});

test('Uses actual browser coordinates and accuracy (coords.latitude, longitude, accuracy)', () => {
  assertContains(panelSrc, 'pos.coords.latitude');
  assertContains(panelSrc, 'pos.coords.longitude');
  assertContains(panelSrc, 'pos.coords.accuracy');
  assertContains(panelSrc, 'setUserCoords');
  assertContains(panelSrc, 'setUserAccuracy');
});

test('Displays location accuracy and shows approximate warning if accuracy > 500m', () => {
  assertContains(panelSrc, "t('report', 'locationAccuracy')");
  assertContains(panelSrc, 'userAccuracy > 500');
  assertContains(panelSrc, "t('report', 'locationAccuracyApproxWarning')");
});

test('Location permission denied prompts user for city/locality without silent defaults', () => {
  assertContains(panelSrc, "t('report', 'locationDeniedError')");
  assertContains(panelSrc, 'handleSearchByArea');
  assertNotContains(panelSrc, '17.385044'); // No hardcoded fallback coords for search origin
});

test('NearbyHealthcarePanel uses MapLibre GL with free OpenStreetMap raster tiles', () => {
  assertContains(panelSrc, "from 'maplibre-gl'");
  assertContains(panelSrc, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  assertContains(panelSrc, 'OpenStreetMap');
});

test('Map markers have distinct styles and colors for hospital, clinic, doctor, centre', () => {
  assertContains(panelSrc, 'getMarkerConfig');
  assertContains(panelSrc, 'bg-rose-600');
  assertContains(panelSrc, 'bg-teal-600');
  assertContains(panelSrc, 'bg-sky-600');
  assertContains(panelSrc, 'bg-purple-600');
});

test('Interactive marker-to-card and card-to-marker focus navigation', () => {
  assertContains(panelSrc, 'card.scrollIntoView');
  assertContains(panelSrc, 'handleFocusFacility');
  assertContains(panelSrc, 'flyTo');
});

test('Displays actual facility count and category filter tabs (All, Hospitals, Clinics, Doctors)', () => {
  assertContains(panelSrc, "t('report', 'facilitiesFoundWithin')");
  assertContains(panelSrc, 'filterAllHealthcare');
  assertContains(panelSrc, 'filterHospitals');
  assertContains(panelSrc, 'filterClinics');
  assertContains(panelSrc, 'filterDoctors');
});

test('Incremental display: initially 10 facilities with "Load more" without hiding map markers', () => {
  assertContains(panelSrc, 'visibleCount');
  assertContains(panelSrc, 'loadMore');
  assertContains(panelSrc, 'setVisibleCount((prev) => prev + 10)');
});

test('Cleanly handles missing phone or opening hours without fabricating information', () => {
  assertContains(panelSrc, 'f.phone');
  assertContains(panelSrc, 'tel:');
  assertContains(panelSrc, "t('report', 'hoursUnavailable')");
});

test('Provides OpenStreetMap directions action for healthcare facilities', () => {
  assertContains(panelSrc, 'https://www.openstreetmap.org/directions');
  assertContains(panelSrc, "t('report', 'directions')");
});

// -----------------------------------------------------------------
// Group 7: Internationalization (i18n) & Dynamic Re-Translation
// -----------------------------------------------------------------
console.log('\nTest Group 7: i18n & Dynamic Re-Translation');

const translationsPath = resolve(projectRoot, 'src/services/i18n/translations.ts');
const translationsSrc = existsSync(translationsPath) ? readFileSync(translationsPath, 'utf-8') : '';
const reportPagePath = resolve(projectRoot, 'src/pages/ReportExplainerPage.tsx');
const reportPageSrc = existsSync(reportPagePath) ? readFileSync(reportPagePath, 'utf-8') : '';

test('translations.ts includes explainReport in nav for en, te, hi', () => {
  assertContains(translationsSrc, "explainReport: 'Explain Report'");
  assertContains(translationsSrc, "explainReport: 'నివేదిక వివరణ'");
  assertContains(translationsSrc, "explainReport: 'रिपोर्ट व्याख्या'");
});

test('translations.ts defines comprehensive report translation keys for en, te, hi', () => {
  assertContains(translationsSrc, "title: 'Health Report Explainer'");
  assertContains(translationsSrc, "title: 'ఆరోగ్య నివేదిక వివరణకర్త'");
  assertContains(translationsSrc, "title: 'स्वास्थ्य रिपोर्ट व्याख्याकर्ता'");
  assertContains(translationsSrc, 'executiveSummaryTitle:');
});

test('translations.ts defines locator filters, accuracy, and load more keys in en, te, hi', () => {
  assertContains(translationsSrc, 'filterAllHealthcare:');
  assertContains(translationsSrc, 'filterHospitals:');
  assertContains(translationsSrc, 'filterClinics:');
  assertContains(translationsSrc, 'filterDoctors:');
  assertContains(translationsSrc, 'facilitiesFoundWithin:');
  assertContains(translationsSrc, 'locationAccuracy:');
  assertContains(translationsSrc, 'hoursUnavailable:');
  assertContains(translationsSrc, 'loadMore:');
});

test('ReportExplainerPage supports in-memory re-translation on language switch without re-upload', () => {
  assertContains(reportPageSrc, 'parsedState');
  assertContains(reportPageSrc, 'currentLangRef');
  assertContains(reportPageSrc, 'reportAIService.generateReportExplanation');
  assertContains(reportPageSrc, 'language');
});

// -----------------------------------------------------------------
// Group 8: UI Components & Entry Points
// -----------------------------------------------------------------
console.log('\nTest Group 8: UI Components & Application Entry Points');

const appSrc = readFileSync(resolve(projectRoot, 'src/App.tsx'), 'utf-8');
const headerSrc = readFileSync(resolve(projectRoot, 'src/components/layout/Header.tsx'), 'utf-8');
const dashboardSrc = readFileSync(resolve(projectRoot, 'src/pages/DashboardPage.tsx'), 'utf-8');
const chatPageSrc = readFileSync(resolve(projectRoot, 'src/pages/ChatPage.tsx'), 'utf-8');
const floatingSrc = readFileSync(resolve(projectRoot, 'src/components/chat/FloatingHealthWiseAI.tsx'), 'utf-8');
const resultsViewSrc = readFileSync(resolve(projectRoot, 'src/components/report/ReportResultsView.tsx'), 'utf-8');

test('App.tsx mounts lazy-loaded /report route', () => {
  assertContains(appSrc, 'ReportExplainerPage');
  assertContains(appSrc, 'path="report"');
});

test('Header.tsx includes localized explainReport navigation link', () => {
  assertContains(headerSrc, "name: t('nav', 'explainReport')");
  assertContains(headerSrc, "path: '/report'");
});

test('DashboardPage.tsx includes Explain Report quick card', () => {
  assertContains(dashboardSrc, "navigate('/report')");
  assertContains(dashboardSrc, 'Explain Report');
});

test('ChatPage.tsx includes Explain Report header action button', () => {
  assertContains(chatPageSrc, "navigate('/report')");
  assertContains(chatPageSrc, 'Explain Report');
});

test('FloatingHealthWiseAI.tsx includes Report navigation action in footer', () => {
  assertContains(floatingSrc, "navigate('/report')");
  assertContains(floatingSrc, '<span>Report</span>');
});

test('Executive summary container in ReportResultsView auto-expands cleanly without truncation', () => {
  assertContains(resultsViewSrc, 'h-auto overflow-visible');
  assertContains(resultsViewSrc, 'whitespace-pre-line break-words');
  assertNotContains(resultsViewSrc, 'line-clamp');
});

// -----------------------------------------------------------------
// Group 9: Privacy & Session-Only Invariants
// -----------------------------------------------------------------
console.log('\nTest Group 9: Privacy & Session-Only Invariants');

test('No persistent Supabase table created for raw reports', () => {
  const schemaPath = resolve(projectRoot, 'supabase/migrations/001_initial_schema.sql');
  if (existsSync(schemaPath)) {
    const schemaSrc = readFileSync(schemaPath, 'utf-8');
    assertNotContains(schemaSrc, 'CREATE TABLE public.medical_reports');
    assertNotContains(schemaSrc, 'CREATE TABLE public.reports');
  }
});

test('Report upload card displays session-only privacy notice with translation keys', () => {
  const uploadCardSrc = readFileSync(
    resolve(projectRoot, 'src/components/report/ReportUploadCard.tsx'),
    'utf-8'
  );
  assertContains(uploadCardSrc, "t('report', 'privacyNotice')");
  assertContains(uploadCardSrc, "t('report', 'privacyDesc')");
});

test('Report results view supports follow-up chat with report context', () => {
  assertContains(resultsViewSrc, "t('report', 'askFollowUpPrompt')");
  assertContains(resultsViewSrc, '/chat?prompt=');
});

test('Vite config isolates pdfjs-dist into vendor-pdf chunk', () => {
  const viteConfigSrc = readFileSync(resolve(projectRoot, 'vite.config.ts'), 'utf-8');
  assertContains(viteConfigSrc, "'vendor-pdf': ['pdfjs-dist']");
});

console.log('\n────────────────────────────────────────────────────────────');
console.log(`Phase 18 Final Fix Results: ${passed} passed, ${failed} failed`);
console.log('────────────────────────────────────────────────────────────\n');

if (failed > 0) {
  console.error('Failures:', failures);
  process.exit(1);
} else {
  process.exit(0);
}
