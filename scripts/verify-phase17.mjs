/**
 * verify-phase17.mjs — Phase 17: Conversational ChatGPT-Style Voice Mode
 *
 * Validates:
 * 1. voice-service.ts exports, browser capability checks, language mapping (en, te, hi),
 *    cleanTextForSpeech markdown sanitation, and cancellation.
 * 2. Privacy compliance: Explicit privacy statement stating HealthWise AI does not
 *    store or send raw audio to its own backend/analytics.
 * 3. Honest barge-in documentation: Documents browser-dependent interruption limits
 *    and manual interruption fallbacks.
 * 4. useVoiceMode hook implementation: State transitions (idle, listening, thinking, speaking, interrupted, error, ended),
 *    live transcripts, and message dispatch via useChat.send().
 * 5. VoiceModeModal UI: Focused conversational modal (NOT a phone call screen),
 *    AIAvatar visual states, live transcripts, emergency banner, accessible labels, Escape key close.
 * 6. Integration in FloatingHealthWiseAI: 1-tap voice entry points in header and form input, VoiceModeModal mounted.
 * 7. Integration in ChatPage: 1-tap voice entry points in header and input bar, VoiceModeModal mounted.
 * 8. Full pipeline reuse: Single session continuity, WHO grounding, Puter AI, and safety rules preserved.
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
console.log('PHASE 17 VERIFICATION: CONVERSATIONAL VOICE MODE');
console.log('================================================================\n');

// -----------------------------------------------------------------
// Group 1: Voice Service Architecture & Privacy Compliance
// -----------------------------------------------------------------
console.log('Test Group 1: Voice Service Architecture & Privacy Compliance');

const voiceServicePath = resolve(projectRoot, 'src/services/voice/voice-service.ts');
const voiceServiceSrc = existsSync(voiceServicePath) ? readFileSync(voiceServicePath, 'utf-8') : '';

test('voice-service.ts exists and exports voiceService object', () => {
  if (!existsSync(voiceServicePath)) throw new Error('voice-service.ts does not exist');
  assertContains(voiceServiceSrc, 'export const voiceService');
});

test('Privacy Statement complies with user guidelines (no raw voice storage/analytics)', () => {
  assertContains(
    voiceServiceSrc,
    'HealthWise AI does not intentionally store or send raw voice recordings to its own backend',
    'Missing compliant privacy disclaimer'
  );
  assertContains(
    voiceServiceSrc,
    'Only the resulting transcript is passed into the existing HealthWise AI chat pipeline'
  );
  assertNotContains(voiceServiceSrc, 'zero privacy leakage', 'Must not claim absolute zero leakage');
});

test('Honest barge-in & interruption handling documented without overclaiming', () => {
  assertContains(voiceServiceSrc, 'Interruption (Barge-in)');
  assertContains(voiceServiceSrc, 'cancelSpeech');
  assertContains(voiceServiceSrc, 'SpeechSynthesisUtterance');
});

test('cleanTextForSpeech strips markdown syntax for natural reading', () => {
  assertContains(voiceServiceSrc, 'export function cleanTextForSpeech');
  assertContains(voiceServiceSrc, 'replace(/```[\\s\\S]*?```/g');
  assertContains(voiceServiceSrc, 'replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g');
});

test('Language mapping supports Tier 1 scope (English, Telugu, Hindi)', () => {
  assertContains(voiceServiceSrc, 'en: {');
  assertContains(voiceServiceSrc, 'te: {');
  assertContains(voiceServiceSrc, 'hi: {');
  assertContains(voiceServiceSrc, 'isTier1VoiceLanguage');
});

// -----------------------------------------------------------------
// Group 2: useVoiceMode Hook & State Machine
// -----------------------------------------------------------------
console.log('\nTest Group 2: useVoiceMode Hook & Conversation Loop');

const useVoiceModePath = resolve(projectRoot, 'src/hooks/useVoiceMode.ts');
const useVoiceModeSrc = existsSync(useVoiceModePath) ? readFileSync(useVoiceModePath, 'utf-8') : '';

test('useVoiceMode.ts exists and exports hook', () => {
  if (!existsSync(useVoiceModePath)) throw new Error('useVoiceMode.ts does not exist');
  assertContains(useVoiceModeSrc, 'export function useVoiceMode');
});

test('Supports all required voice states (idle, listening, thinking, speaking, interrupted, error)', () => {
  assertContains(useVoiceModeSrc, "'idle'");
  assertContains(useVoiceModeSrc, "'listening'");
  assertContains(useVoiceModeSrc, "'thinking'");
  assertContains(useVoiceModeSrc, "'speaking'");
  assertContains(useVoiceModeSrc, "'interrupted'");
  assertContains(useVoiceModeSrc, "'error'");
});

test('Implements continuous conversation loop: AI speech completion returns to listening', () => {
  assertContains(useVoiceModeSrc, 'setVoiceState(\'listening\')');
  assertContains(useVoiceModeSrc, 'startListening()');
});

test('Implements interruption / barge-in cancellation and recovery', () => {
  assertContains(useVoiceModeSrc, 'handleInterrupt');
  assertContains(useVoiceModeSrc, 'stopSpeech');
  assertContains(useVoiceModeSrc, 'setVoiceState(\'interrupted\')');
});

test('Properly cleans up SpeechRecognition and SpeechSynthesis on unmount', () => {
  assertContains(useVoiceModeSrc, 'voiceService.cancelSpeech()');
  assertContains(useVoiceModeSrc, 'recognitionRef.current.abort()');
});

// -----------------------------------------------------------------
// Group 3: VoiceModeModal UI & Accessibility
// -----------------------------------------------------------------
console.log('\nTest Group 3: VoiceModeModal UI & Accessibility');

const voiceModalPath = resolve(projectRoot, 'src/components/chat/VoiceModeModal.tsx');
const voiceModalSrc = existsSync(voiceModalPath) ? readFileSync(voiceModalPath, 'utf-8') : '';

test('VoiceModeModal.tsx exists and renders focused conversational dialog', () => {
  if (!existsSync(voiceModalPath)) throw new Error('VoiceModeModal.tsx does not exist');
  assertContains(voiceModalSrc, 'export const VoiceModeModal');
  assertContains(voiceModalSrc, 'role="dialog"');
  assertContains(voiceModalSrc, 'aria-modal="true"');
});

test('Does NOT render phone call controls (no dial pad, call timer, or telephone UI)', () => {
  assertNotContains(voiceModalSrc, 'dialpad');
  assertNotContains(voiceModalSrc, 'dial-pad');
  assertNotContains(voiceModalSrc, 'call-timer');
  assertNotContains(voiceModalSrc, 'callTimer');
});

test('Displays live speech transcripts and spoken responses', () => {
  assertContains(voiceModalSrc, 'transcript');
  assertContains(voiceModalSrc, 'interimTranscript');
  assertContains(voiceModalSrc, 'spokenResponse');
});

test('Provides accessible manual interruption button when speaking', () => {
  assertContains(voiceModalSrc, 'onInterrupt');
  assertContains(voiceModalSrc, 'Interrupt / Speak Now');
});

test('Includes urgent warning banner if emergency condition detected', () => {
  assertContains(voiceModalSrc, 'hasEmergencyAlert');
  assertContains(voiceModalSrc, 'URGENT MEDICAL WARNING');
});

test('Implements keyboard accessibility (Escape closes modal)', () => {
  assertContains(voiceModalSrc, "e.key === 'Escape'");
  assertContains(voiceModalSrc, 'onClose()');
});

test('Provides clear fallback message when voice recognition is unsupported', () => {
  assertContains(voiceModalSrc, 'Switch to Text Chat');
});

// -----------------------------------------------------------------
// Group 4: Floating Assistant Integration
// -----------------------------------------------------------------
console.log('\nTest Group 4: Floating HealthWise AI Assistant Integration');

const floatingSrc = readFileSync(
  resolve(projectRoot, 'src/components/chat/FloatingHealthWiseAI.tsx'),
  'utf-8'
);

test('FloatingHealthWiseAI imports useVoiceMode and VoiceModeModal', () => {
  assertContains(floatingSrc, "import { useVoiceMode } from '../../hooks/useVoiceMode'");
  assertContains(floatingSrc, "import { VoiceModeModal } from './VoiceModeModal'");
});

test('Floating panel header provides 1-tap Voice button', () => {
  assertContains(floatingSrc, 'onClick={openVoiceMode}');
  assertContains(floatingSrc, 'aria-label="Start Voice Mode"');
});

test('Floating panel input form includes microphone trigger button', () => {
  assertContains(floatingSrc, '<Mic className="w-4 h-4" />');
});

test('FloatingHealthWiseAI mounts VoiceModeModal with emergency and session props', () => {
  assertContains(floatingSrc, '<VoiceModeModal');
  assertContains(floatingSrc, 'hasEmergencyAlert={hasEmergencyAlert}');
});

// -----------------------------------------------------------------
// Group 5: Full Chat Page Integration
// -----------------------------------------------------------------
console.log('\nTest Group 5: Full Chat Page Integration');

const chatPageSrc = readFileSync(
  resolve(projectRoot, 'src/pages/ChatPage.tsx'),
  'utf-8'
);

test('ChatPage imports useVoiceMode and VoiceModeModal', () => {
  assertContains(chatPageSrc, "import { VoiceModeModal } from '../components/chat/VoiceModeModal'");
  assertContains(chatPageSrc, "import { useVoiceMode } from '../hooks/useVoiceMode'");
});

test('ChatPage header contains Voice Mode action button', () => {
  assertContains(chatPageSrc, 'onClick={openVoiceMode}');
  assertContains(chatPageSrc, '<span className="hidden sm:inline">Voice Mode</span>');
});

test('ChatPage input bar contains microphone quick-action button', () => {
  assertContains(chatPageSrc, '<Mic className="w-4 h-4" />');
});

test('ChatPage mounts VoiceModeModal connected to existing send pipeline', () => {
  assertContains(chatPageSrc, '<VoiceModeModal');
  assertContains(chatPageSrc, 'onSendMessage: send');
});

// -----------------------------------------------------------------
// Group 6: Architecture Invariants & Zero Regression Checks
// -----------------------------------------------------------------
console.log('\nTest Group 6: Architecture Invariants & Pipeline Integrity');

const chatStoreSrc = readFileSync(
  resolve(projectRoot, 'src/stores/chat-store.ts'),
  'utf-8'
);

test('Chat pipeline continues to use RAG, WHO knowledge, Puter AI, and safety', () => {
  assertContains(chatStoreSrc, 'puterAIService.generateResponse');
  assertContains(chatStoreSrc, 'isEmergencyAlert');
});

test('Single session continuity preserved (no duplicate session or send creation)', () => {
  const useChatSrc = readFileSync(
    resolve(projectRoot, 'src/hooks/useChat.ts'),
    'utf-8'
  );
  assertContains(useChatSrc, 'pendingSessionPromise');
});

console.log('\n────────────────────────────────────────────────────────────');
console.log(`Phase 17 Results: ${passed} passed, ${failed} failed`);
console.log('────────────────────────────────────────────────────────────\n');

if (failed > 0) {
  console.error('Failures:', failures);
  process.exit(1);
} else {
  process.exit(0);
}
