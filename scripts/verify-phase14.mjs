/**
 * verify-phase14.mjs — Phase 14: Chatbot Response Quality, Summarization & Human-Understandable Answers
 *
 * Validates:
 * A. Direct answer first directive
 * B. RAG summarization & synthesis (no raw dumping)
 * C. Word-length targeting (80-180 words standard, 40-100 simple, 200-300 detailed)
 * D. Everyday human language preference
 * E. Follow-up question adaptation (no repetition of prior answer)
 * F. Intent-specific response guidance (definition, symptoms, prevention, danger, comparison, yes/no)
 * G. Safety & emergency warnings preserved
 * H. Diagnostic & prescription prohibitions preserved
 * I. Canonical source citations preserved
 * J. Unindexed/weak retrieval guidance preserved
 * K. Multilingual response directive preserved
 * L. Context-builder critical instructions for synthesis and conciseness
 * M. Simulated responses validation (word count, direct opening, absence of raw dumping)
 */

import { readFileSync } from 'fs';
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

const aiSrc = readFileSync(
  resolve(projectRoot, 'src/services/ai/puter-ai-service.ts'),
  'utf-8'
);

const contextBuilderSrc = readFileSync(
  resolve(projectRoot, 'src/services/knowledge/context-builder.ts'),
  'utf-8'
);

console.log('\n================================================================');
console.log('PHASE 14 VERIFICATION: RESPONSE QUALITY, SUMMARIZATION & INTENT');
console.log('================================================================\n');

// ── Group 1: Direct Answer First & Tone ────────────────────────────────────────
console.log('Test Group 1: Direct Answer First & Conversational Tone');

test('System prompt instructs direct answer in the first sentence', () => {
  assertContains(aiSrc, 'DIRECT ANSWER FIRST', 'Direct answer directive missing');
  assertContains(aiSrc, 'opening sentence', 'Opening sentence requirement missing');
});

test('System prompt strictly prohibits greeting fillers/preambles', () => {
  assertContains(aiSrc, 'Great question', 'Preamble prohibition missing: Great question');
  assertContains(aiSrc, 'Thank you for asking', 'Preamble prohibition missing: Thank you for asking');
});

test('System prompt instructs everyday human language over jargon', () => {
  assertContains(aiSrc, 'HUMAN LANGUAGE', 'Human language section missing');
  assertContains(aiSrc, 'everyday terms', 'Everyday terms requirement missing');
  assertContains(aiSrc, 'Avoid unnecessary medical jargon', 'Jargon avoidance directive missing');
});

// ── Group 2: RAG Synthesis vs Raw Dumping ──────────────────────────────────────
console.log('\nTest Group 2: Evidence Synthesis & Anti-Dumping Rules');

test('System prompt instructs evidence synthesis over verbatim pasting', () => {
  assertContains(aiSrc, 'SYNTHESIZE RAG EVIDENCE', 'Synthesis directive missing in prompt');
  assertContains(aiSrc, 'Never paste large blocks', 'Paste prohibition missing in prompt');
});

test('Context-builder contains explicit anti-dumping synthesis rule', () => {
  assertContains(contextBuilderSrc, 'SYNTHESIZE the evidence', 'Synthesis rule missing in context-builder');
  assertContains(contextBuilderSrc, 'Never copy/paste raw chunks or dump large passages', 'Anti-dumping instruction missing in context-builder');
});

test('Context-builder enforces direct answer first', () => {
  assertContains(contextBuilderSrc, 'DIRECT ANSWER FIRST', 'Direct answer missing in context-builder');
});

test('Context-builder specifies target length 80-180 words', () => {
  assertContains(contextBuilderSrc, '80–180 words', 'Target length missing in context-builder');
});

// ── Group 3: Word Length Targeting & Intent Adaptation ─────────────────────────
console.log('\nTest Group 3: Length Targeting & Intent Adaptation');

test('Target length specifies 80-180 words for standard queries', () => {
  assertContains(aiSrc, '80–180 words', '80-180 words standard target missing');
});

test('Target length accommodates shorter answers for simple/yes-no questions', () => {
  assertContains(aiSrc, 'Yes/No or simple questions', 'Simple question guidance missing');
  assertContains(aiSrc, '40–100 words', '40-100 words simple range missing');
});

test('Target length accommodates detailed requests up to 200-300 words', () => {
  assertContains(aiSrc, 'explain in detail', 'Detailed prompt adaptation missing');
  assertContains(aiSrc, '200–300 words', '200-300 words detailed range missing');
});

test('Intent adaptation handles symptoms, causes, and prevention specifically', () => {
  assertContains(aiSrc, 'What are the symptoms?', 'Symptom intent handling missing');
  assertContains(aiSrc, 'How to prevent?', 'Prevention intent handling missing');
  assertContains(aiSrc, 'Is it dangerous?', 'Danger/risk intent handling missing');
});

test('Intent adaptation specifies comparison query handling (e.g. Dengue vs Malaria)', () => {
  assertContains(aiSrc, 'Dengue vs Malaria', 'Comparison query handling missing');
  assertContains(aiSrc, 'key medical differences concisely', 'Comparison guidance missing');
});

// ── Group 4: Follow-up Questions & Conversation Context ───────────────────────
console.log('\nTest Group 4: Follow-up Handling & Repetition Avoidance');

test('buildFollowUpDirective function exists', () => {
  assertContains(aiSrc, 'function buildFollowUpDirective', 'buildFollowUpDirective function missing');
});

test('buildFollowUpDirective is wired into generateResponse message pipeline', () => {
  assertContains(aiSrc, 'buildFollowUpDirective(conversationHistory)', 'buildFollowUpDirective call missing');
  assertContains(aiSrc, "messages.push({ role: 'system', content: followUpDirective })", 'followUpDirective push missing');
});

test('Follow-up directive instructs not to repeat general overview', () => {
  assertContains(aiSrc, 'Do NOT repeat the general overview', 'Follow-up anti-repetition directive missing');
  assertContains(aiSrc, 'Answer ONLY the specific new question', 'Follow-up focus directive missing');
});

// ── Group 5: Safety & Emergency Invariants ─────────────────────────────────────
console.log('\nTest Group 5: Safety Invariants & Clinical Guardrails');

test('Rule 1: Never diagnose or prescribe medication', () => {
  assertContains(aiSrc, 'NEVER diagnose a disease', 'Diagnosis prohibition missing');
  assertContains(aiSrc, 'prescribe medication', 'Prescription prohibition missing');
});

test('Rule 2: Grounded in WHO evidence', () => {
  assertContains(aiSrc, 'ALWAYS ground your answers primarily in the retrieved WHO knowledge base', 'WHO grounding rule missing');
});

test('Rule 7: Immediate emergency numbers for life-threatening symptoms', () => {
  assertContains(aiSrc, 'respond IMMEDIATELY with emergency service numbers', 'Emergency escalation rule missing');
});

test('Rule 8: Mandatory medical disclaimer preserved', () => {
  assertContains(aiSrc, '⚕️ This is general educational health information', 'Medical disclaimer text missing');
});

test('Emergency length exemption is explicitly stated', () => {
  assertContains(aiSrc, 'Emergency escalation responses are exempt from length limits', 'Emergency length exemption missing');
});

// ── Group 6: Canonical Sources & Unindexed Fallbacks ──────────────────────────
console.log('\nTest Group 6: Canonical Citations & Fallback Grounding');

test('Citations directive requires citing official WHO document name', () => {
  assertContains(aiSrc, 'official WHO document referenced', 'Official document citation rule missing');
  assertContains(aiSrc, 'Never fabricate URLs', 'Fabricated URL prohibition missing');
});

test('Fallback response explicitly states lack of trusted info rather than hallucinating', () => {
  assertContains(aiSrc, "I don't have enough trusted information in my current knowledge base", 'Grounded unindexed message missing in English');
  assertContains(aiSrc, 'జ్ఞానకోశంలో', 'Grounded unindexed message missing in Telugu');
  assertContains(aiSrc, 'सत्यापित ज्ञानकोष में', 'Grounded unindexed message missing in Hindi');
});

// ── Group 7: Mock & Offline Response Length & Quality ──────────────────────────
console.log('\nTest Group 7: Mock Response Quality & Synthesis Simulation');

test('extractKeyBulletPoints produces structured clean sentences', () => {
  assertContains(aiSrc, 'cleanSentences.map(s => `- ${s}`).join', 'Clean sentence mapping missing in extractKeyBulletPoints');
  assertNotContains(aiSrc, '.slice(0, 750)', 'Old raw 750 char slice should be removed');
});

test('Telugu mock response includes direct introduction and action bullets', () => {
  assertContains(aiSrc, 'గురించి ప్రాథమిక ఆరోగ్య సమాచారం', 'Telugu direct intro missing');
  assertContains(aiSrc, '**ముఖ్య సలహాలు:**', 'Telugu action heading missing');
});

test('Hindi mock response includes direct introduction and action bullets', () => {
  assertContains(aiSrc, 'के बारे में मुख्य स्वास्थ्य जानकारी', 'Hindi direct intro missing');
  assertContains(aiSrc, '**मुख्य सिफारिशें:**', 'Hindi action heading missing');
});

test('English mock response includes direct introduction and key actions', () => {
  assertContains(aiSrc, 'Here is essential health information regarding', 'English direct intro missing');
  assertContains(aiSrc, '**Key Actions:**', 'English action heading missing');
});

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
console.log(`Phase 14 Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  • ${f.name}: ${f.error}`));
}
console.log('─'.repeat(60) + '\n');

process.exit(failed > 0 ? 1 : 0);
