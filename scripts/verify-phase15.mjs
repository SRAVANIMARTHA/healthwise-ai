/**
 * verify-phase15.mjs — Phase 15: AI Identity & Greeting States
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
  try { fn(); console.log(`  ✅ ${name}`); passed++; }
  catch (err) { console.error(`  ❌ ${name}: ${err.message}`); failures.push({ name, error: err.message }); failed++; }
}

function assertContains(source, pattern, message) {
  const found = typeof pattern === 'string' ? source.includes(pattern) : pattern.test(source);
  if (!found) throw new Error(message || `Expected to find: ${pattern}`);
}

const chatStoreSrc = readFileSync(resolve(projectRoot, 'src/stores/chat-store.ts'), 'utf-8');
const useChatSrc = readFileSync(resolve(projectRoot, 'src/hooks/useChat.ts'), 'utf-8');
const chatPageSrc = readFileSync(resolve(projectRoot, 'src/pages/ChatPage.tsx'), 'utf-8');
const aiAvatarSrc = readFileSync(resolve(projectRoot, 'src/components/chat/AIAvatar.tsx'), 'utf-8');

console.log('\n📋 Phase 15 — AI Identity & Greeting States\n');

// ── Group 1: AIAvatar component ─────────────────────────────────────────────────
console.log('▶ Group 1: AIAvatar component');

test('AIAvatar.tsx exists with React FC export', () => {
  assertContains(aiAvatarSrc, 'export const AIAvatar', 'AIAvatar not exported');
});
test('AIAvatar accepts isThinking prop', () => {
  assertContains(aiAvatarSrc, 'isThinking', 'isThinking prop not found');
});
test('AIAvatar accepts size prop', () => {
  assertContains(aiAvatarSrc, 'size', 'size prop not found');
});
test('AIAvatar uses animate-ping for thinking state', () => {
  assertContains(aiAvatarSrc, 'animate-ping', 'animate-ping not found for thinking state');
});
test('AIAvatar uses Bot icon', () => {
  assertContains(aiAvatarSrc, 'Bot', 'Bot icon not used in AIAvatar');
});
test('AIAvatar pulsing ring is aria-hidden', () => {
  assertContains(aiAvatarSrc, 'aria-hidden="true"', 'aria-hidden not set on decorative pulse ring');
});

// ── Group 2: isSearching in chat store ─────────────────────────────────────────
console.log('\n▶ Group 2: isSearching in chat store');

test('isSearching field in ChatStoreState interface', () => {
  assertContains(chatStoreSrc, 'isSearching: boolean', 'isSearching not in ChatStoreState interface');
});
test('isSearching initialised to false', () => {
  assertContains(chatStoreSrc, 'isSearching: false', 'isSearching not initialised to false');
});
test('isSearching set to true before RAG phase', () => {
  assertContains(chatStoreSrc, 'isSearching: true', 'isSearching not set to true before RAG');
});
test('isSearching set to false before AI call phase', () => {
  // Pattern: set({ isSearching: false, isTyping: true })
  assertContains(chatStoreSrc, 'isSearching: false, isTyping: true', 'isSearching not cleared before AI call');
});
test('isSearching cleared on completion', () => {
  // At least 2 occurrences: on success and on error
  const count = (chatStoreSrc.match(/isSearching: false/g) || []).length;
  if (count < 2) throw new Error(`Expected isSearching:false at least twice, found ${count}`);
});

// ── Group 3: isSearching in useChat hook ───────────────────────────────────────
console.log('\n▶ Group 3: isSearching exposed from useChat');

test('useChat destructures isSearching from store', () => {
  assertContains(useChatSrc, 'isSearching,', 'isSearching not destructured in useChat');
});
test('useChat returns isSearching in return object', () => {
  const returnSection = useChatSrc.slice(useChatSrc.lastIndexOf('return {'));
  assertContains(returnSection, 'isSearching', 'isSearching not in useChat return');
});

// ── Group 4: ChatPage AIAvatar usage ──────────────────────────────────────────
console.log('\n▶ Group 4: ChatPage uses AIAvatar');

test('ChatPage imports AIAvatar', () => {
  assertContains(chatPageSrc, "import { AIAvatar }", 'AIAvatar not imported in ChatPage');
});
test('ChatPage destructures isSearching from useChat', () => {
  assertContains(chatPageSrc, 'isSearching,', 'isSearching not destructured in ChatPage');
});
test('ChatPage uses AIAvatar in greeting card (size="lg")', () => {
  assertContains(chatPageSrc, 'AIAvatar size="lg"', 'AIAvatar not used in greeting card with size="lg"');
});
test('ChatPage uses AIAvatar in message bubble', () => {
  assertContains(chatPageSrc, 'AIAvatar isThinking=', 'AIAvatar not used in message bubble');
});

// ── Group 5: Greeting card content ────────────────────────────────────────────
console.log('\n▶ Group 5: Greeting card content');

test('Greeting card has AI introduction text', () => {
  assertContains(chatPageSrc, "Hi! I'm", "Greeting card missing 'Hi! I'm' text");
});
test('Greeting card identifies HealthWise AI', () => {
  assertContains(chatPageSrc, 'HealthWise AI', 'HealthWise AI name missing from greeting card');
});

// ── Group 6: Two-phase loading indicator ─────────────────────────────────────
console.log('\n▶ Group 6: Two-phase loading indicator');

test('Loading indicator shows when isSearching OR isTyping', () => {
  assertContains(chatPageSrc, '(isSearching || isTyping)', 'Loading indicator not shown for both phases');
});
test('Loading indicator shows "Searching health knowledge base" label', () => {
  assertContains(chatPageSrc, 'Searching health knowledge base', 'Searching label not found');
});
test('Loading indicator falls back to analyzing translation key', () => {
  assertContains(chatPageSrc, "t('chat', 'analyzing')", 'analyzing translation key missing from indicator');
});
test('Loading indicator has role="status" and aria-live="polite"', () => {
  assertContains(chatPageSrc, 'role="status"', 'role="status" not on loading indicator');
  assertContains(chatPageSrc, 'aria-live="polite"', 'aria-live="polite" not on loading indicator');
});

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
console.log(`Phase 15 Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  • ${f.name}: ${f.error}`));
}
console.log('─'.repeat(60) + '\n');
process.exit(failed > 0 ? 1 : 0);
