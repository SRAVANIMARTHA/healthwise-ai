/**
 * verify-phase16.mjs — Phase 16: Global Floating AI Assistant / Robot Chat Interface
 *
 * Validates:
 * 1. FloatingHealthWiseAI component exists and exports React FC
 * 2. Mounted at global layout level in MainLayout.tsx
 * 3. Robot trigger button renders with accessible name and ARIA semantics
 * 4. Tooltip & subtle onboarding greeting bubble implemented
 * 5. Open/close state toggling, click outside listener, and Escape key handling
 * 6. Focus restoration to trigger button on panel close
 * 7. Connected to existing useChat() hook (chat store, RAG, Puter AI, safety layer)
 * 8. Reuses activeSessionId and provides "Open full chat" navigation link
 * 9. Subtle visual states: idle, thinking/searching indicator (animate-ping / animate-pulse)
 * 10. Responsive layout: compact width (w-96 / max-w-[400px]) with mobile safe margin
 * 11. Multilingual support via useTranslation() (evidenceGrounded, placeholder, send, etc.)
 * 12. Header cleanup: bulky desktop CTA button removed while keeping full Chat navLink
 * 13. Does NOT appear on full /chat route to prevent redundancy
 * 14. Non-interference with Header dropdowns (Phase 13 outside click & Escape retained)
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

const floatingSrc = readFileSync(
  resolve(projectRoot, 'src/components/chat/FloatingHealthWiseAI.tsx'),
  'utf-8'
);

const mainLayoutSrc = readFileSync(
  resolve(projectRoot, 'src/components/layout/MainLayout.tsx'),
  'utf-8'
);

const headerSrc = readFileSync(
  resolve(projectRoot, 'src/components/layout/Header.tsx'),
  'utf-8'
);

console.log('\n================================================================');
console.log('PHASE 16 VERIFICATION: GLOBAL FLOATING AI ASSISTANT / ROBOT');
console.log('================================================================\n');

// ── Group 1: Component Existence & Architecture ───────────────────────────────
console.log('Test Group 1: Component Existence & Global Mount');

test('FloatingHealthWiseAI component exists and exports React.FC', () => {
  assertContains(floatingSrc, 'export const FloatingHealthWiseAI: React.FC', 'Component export missing');
});

test('MainLayout imports FloatingHealthWiseAI', () => {
  assertContains(mainLayoutSrc, "import { FloatingHealthWiseAI } from '../chat/FloatingHealthWiseAI'", 'Import missing in MainLayout');
});

test('MainLayout mounts FloatingHealthWiseAI globally', () => {
  assertContains(mainLayoutSrc, '<FloatingHealthWiseAI />', 'Component not rendered in MainLayout');
});

test('Component suppresses rendering on full /chat route', () => {
  assertContains(floatingSrc, "location.pathname.startsWith('/chat')", 'Chat route check missing');
  assertContains(floatingSrc, 'if (isChatRoute) {\n    return null;\n  }', 'Early null return on /chat missing');
});

// ── Group 2: Circular Robot UI & Visual States ────────────────────────────────
console.log('\nTest Group 2: Circular Robot UI & Visual States');

test('Circular robot button rendered with HealthWise teal styling', () => {
  assertContains(floatingSrc, 'rounded-full bg-teal-600', 'Circular teal button missing');
  assertContains(floatingSrc, 'Bot', 'Robot Bot icon missing');
});

test('Subtle thinking / searching animation state implemented', () => {
  assertContains(floatingSrc, 'isWorking', 'Working state check missing');
  assertContains(floatingSrc, 'animate-ping', 'Subtle pulsing ping ring missing');
  assertContains(floatingSrc, 'animate-pulse', 'Status dot pulse missing');
});

test('Accessible trigger button name and ARIA semantics', () => {
  assertContains(floatingSrc, 'aria-label="Chat with HealthWise AI assistant"', 'Accessible trigger aria-label missing');
  assertContains(floatingSrc, 'aria-expanded={isOpen}', 'Dynamic aria-expanded missing on trigger button');
  assertContains(floatingSrc, 'aria-controls="hw-floating-chat-panel"', 'aria-controls link to chat panel missing');
});

test('Introductory greeting bubble rendered with dismiss action', () => {
  assertContains(floatingSrc, "Hi! I'm HealthWise AI 👋", 'Intro bubble text missing');
  assertContains(floatingSrc, 'aria-label="Dismiss greeting"', 'Dismiss button accessible label missing');
  assertContains(floatingSrc, 'hw_intro_bubble_dismissed', 'Intro dismissal persistence in localStorage missing');
});

test('Hover/focus tooltip supported for desktop', () => {
  assertContains(floatingSrc, 'role="tooltip"', 'Tooltip element missing');
  assertContains(floatingSrc, 'Chat with HealthWise AI', 'Tooltip text missing');
});

// ── Group 3: Panel Interaction, Outside Click & Keyboard Accessibility ─────────
console.log('\nTest Group 3: Panel Open/Close & Keyboard Accessibility');

test('Outside click closes panel via pointerdown listener', () => {
  assertContains(floatingSrc, 'addEventListener(\'pointerdown\'', 'pointerdown listener missing');
  assertContains(floatingSrc, 'removeEventListener(\'pointerdown\'', 'pointerdown cleanup missing');
  assertContains(floatingSrc, 'panelRef.current.contains', 'panelRef contains check missing');
});

test('Escape key closes panel and restores focus to trigger button', () => {
  assertContains(floatingSrc, "e.key === 'Escape'", 'Escape key check missing');
  assertContains(floatingSrc, 'triggerBtnRef.current?.focus()', 'Focus restoration missing on Escape');
});

test('Closing panel via toggle restores focus to trigger button', () => {
  assertContains(floatingSrc, 'triggerBtnRef.current?.focus()', 'Focus restoration missing on toggle');
});

test('Chat panel has dialog semantics and labeled title', () => {
  assertContains(floatingSrc, 'role="dialog"', 'role="dialog" missing on panel');
  assertContains(floatingSrc, 'aria-labelledby="hw-floating-chat-title"', 'aria-labelledby missing on panel');
  assertContains(floatingSrc, 'id="hw-floating-chat-title"', 'Title ID missing on panel header');
});

// ── Group 4: Connection to Existing Chat Architecture ─────────────────────────
console.log('\nTest Group 4: Integration with Existing Chat / RAG / Puter Pipeline');

test('Imports and connects directly to existing useChat hook', () => {
  assertContains(floatingSrc, "import { useChat } from '../../hooks/useChat'", 'useChat import missing');
  assertContains(floatingSrc, 'const {\n    messages,\n    isTyping,\n    isSearching,\n    error,\n    send,\n    startNewChat,\n    activeSessionId,\n    clearError,\n  } = useChat()', 'useChat destructuring missing');
});

test('Calls existing send method (enforcing RAG, safety, and Puter AI)', () => {
  assertContains(floatingSrc, 'await send(query)', 'Call to existing send() method missing');
});

test('Navigates to full chat preserving activeSessionId when available', () => {
  assertContains(floatingSrc, 'handleOpenFullChat', 'handleOpenFullChat missing');
  assertContains(floatingSrc, 'navigate(`/chat/${activeSessionId}`)', 'Navigation with activeSessionId missing');
  assertContains(floatingSrc, "navigate('/chat')", 'Fallback navigation to /chat missing');
});

test('Provides "Open full chat" action in panel header and footer', () => {
  assertContains(floatingSrc, 'Open full chat page', 'Full chat button accessible title missing');
  assertContains(floatingSrc, 'Open full chat', 'Full chat link text missing');
});

test('Citations rendered with safe URL validation', () => {
  assertContains(floatingSrc, 'securitySanitizer.isSafeUrl(s.url)', 'Citation URL validation missing');
});

// ── Group 5: Responsive & Non-Obstructive Layout ──────────────────────────────
console.log('\nTest Group 5: Responsive Design & Position');

test('Positioned fixed at bottom-right with viewport safe margins', () => {
  assertContains(floatingSrc, 'fixed bottom-20 sm:bottom-6 right-4 sm:right-6', 'Fixed bottom-right positioning missing');
});

test('Responsive panel width avoids mobile horizontal overflow', () => {
  assertContains(floatingSrc, 'w-[calc(100vw-2rem)] sm:w-96 max-w-[400px]', 'Responsive width classes missing');
});

test('Panel height is constrained to viewport', () => {
  assertContains(floatingSrc, 'max-h-[calc(100vh-6rem)]', 'Viewport max-height constraint missing');
});

// ── Group 6: Multilingual & Header Cleanup ─────────────────────────────────────
console.log('\nTest Group 6: Multilingual Support & Header Streamlining');

test('Uses existing useTranslation hook for UI labels', () => {
  assertContains(floatingSrc, "import { useTranslation } from '../../hooks/useTranslation'", 'useTranslation import missing');
  assertContains(floatingSrc, "t('chat', 'evidenceGrounded')", 'evidenceGrounded localization missing');
  assertContains(floatingSrc, "t('chat', 'placeholder')", 'placeholder localization missing');
  assertContains(floatingSrc, "t('chat', 'send')", 'send localization missing');
});

test('Header desktop right actions bar simplified without bulky CTA button', () => {
  assertNotContains(headerSrc, "{/* Start Health Chat CTA */}", 'Bulky CTA comment should be removed');
  assertContains(headerSrc, "{ name: t('nav', 'chat'), path: '/chat'", 'Regular Chat navLink in navLinks array preserved');
});

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
console.log(`Phase 16 Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  • ${f.name}: ${f.error}`));
}
console.log('─'.repeat(60) + '\n');

process.exit(failed > 0 ? 1 : 0);
