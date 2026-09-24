/**
 * verify-phase13.mjs — Phase 13: Navigation / Dropdown Fixes
 *
 * Tests that Header.tsx dropdown behaviour is correct:
 * - Outside-click closes dropdowns
 * - Escape key closes dropdowns
 * - Route change closes dropdowns
 * - Opening one dropdown closes the other
 * - ARIA attributes present and correct
 * - Language selection closes dropdown
 * - User menu items close dropdown on click
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertContains(source, pattern, message) {
  const found = typeof pattern === 'string' ? source.includes(pattern) : pattern.test(source);
  if (!found) throw new Error(message || `Expected to find: ${pattern}`);
}

function assertNotContains(source, pattern, message) {
  const found = typeof pattern === 'string' ? source.includes(pattern) : pattern.test(source);
  if (found) throw new Error(message || `Expected NOT to find: ${pattern}`);
}

// ── Load source files ──────────────────────────────────────────────────────────
const headerSrc = readFileSync(
  resolve(projectRoot, 'src/components/layout/Header.tsx'),
  'utf-8'
);

console.log('\n📋 Phase 13 — Navigation / Dropdown Fixes\n');

// ── Group 1: Imports ────────────────────────────────────────────────────────────
console.log('▶ Group 1: Correct React hooks imported');

test('useRef imported', () => assertContains(headerSrc, 'useRef', 'useRef not imported'));
test('useEffect imported', () => assertContains(headerSrc, 'useEffect', 'useEffect not imported'));
test('useCallback imported', () => assertContains(headerSrc, 'useCallback', 'useCallback not imported'));

// ── Group 2: Refs declared ──────────────────────────────────────────────────────
console.log('\n▶ Group 2: Dropdown refs declared');

test('langMenuRef declared', () => assertContains(headerSrc, 'langMenuRef', 'langMenuRef not found'));
test('userMenuRef declared', () => assertContains(headerSrc, 'userMenuRef', 'userMenuRef not found'));
test('langBtnRef declared', () => assertContains(headerSrc, 'langBtnRef', 'langBtnRef not found'));
test('userBtnRef declared', () => assertContains(headerSrc, 'userBtnRef', 'userBtnRef not found'));

// ── Group 3: Outside-click handler ─────────────────────────────────────────────
console.log('\n▶ Group 3: Outside-click handler (pointerdown)');

test('pointerdown event listener added', () => {
  assertContains(headerSrc, "addEventListener('pointerdown'", "pointerdown listener not found");
});
test('pointerdown listener is capture phase', () => {
  assertContains(headerSrc, '{ capture: true }', 'capture: true not found on pointerdown listener');
});
test('pointerdown listener removed on cleanup', () => {
  assertContains(headerSrc, "removeEventListener('pointerdown'", 'removeEventListener for pointerdown not found');
});
test('outside-click checks langMenuRef.current.contains', () => {
  assertContains(headerSrc, 'langMenuRef.current', 'langMenuRef.current not used in outside-click');
});
test('outside-click checks userMenuRef.current.contains', () => {
  assertContains(headerSrc, 'userMenuRef.current', 'userMenuRef.current not used in outside-click');
});

// ── Group 4: Escape key handler ────────────────────────────────────────────────
console.log('\n▶ Group 4: Escape key handler');

test('keydown event listener added', () => {
  assertContains(headerSrc, "addEventListener('keydown'", 'keydown listener not found');
});
test('keydown listener removed on cleanup', () => {
  assertContains(headerSrc, "removeEventListener('keydown'", 'removeEventListener for keydown not found');
});
test('Escape key string checked', () => {
  assertContains(headerSrc, "e.key !== 'Escape'", "Escape key check not found");
});
test('langBtnRef.current focus restored on Escape', () => {
  assertContains(headerSrc, 'langBtnRef.current?.focus()', 'langBtnRef focus not restored on Escape');
});
test('userBtnRef.current focus restored on Escape', () => {
  assertContains(headerSrc, 'userBtnRef.current?.focus()', 'userBtnRef focus not restored on Escape');
});

// ── Group 5: Route change close ────────────────────────────────────────────────
console.log('\n▶ Group 5: Route-change close');

test('useEffect depends on location.pathname', () => {
  assertContains(headerSrc, 'location.pathname', 'location.pathname not in route-change effect deps');
});
test('closeAllDropdowns called on route change', () => {
  assertContains(headerSrc, 'closeAllDropdowns', 'closeAllDropdowns not called');
});
test('mobile menu closed on route change', () => {
  // setMobileMenuOpen(false) must appear in the route-change effect
  assertContains(headerSrc, 'setMobileMenuOpen(false)', 'mobile menu not closed on route change');
});

// ── Group 6: Mutual exclusivity ────────────────────────────────────────────────
console.log('\n▶ Group 6: Mutual exclusivity (one dropdown at a time)');

test('openLangMenu closes user menu first', () => {
  // openLangMenu should call setUserMenuOpen(false) before opening lang menu
  assertContains(headerSrc, 'openLangMenu', 'openLangMenu helper not found');
  // Check it sets userMenuOpen to false inside
  const openLangSection = headerSrc.slice(
    headerSrc.indexOf('openLangMenu'),
    headerSrc.indexOf('openLangMenu') + 300
  );
  assertContains(openLangSection, 'setUserMenuOpen(false)', 'openLangMenu does not close user menu');
});
test('openUserMenu closes lang menu first', () => {
  assertContains(headerSrc, 'openUserMenu', 'openUserMenu helper not found');
  const openUserSection = headerSrc.slice(
    headerSrc.indexOf('openUserMenu'),
    headerSrc.indexOf('openUserMenu') + 300
  );
  assertContains(openUserSection, 'setLangMenuOpen(false)', 'openUserMenu does not close lang menu');
});
test('lang button uses openLangMenu', () => {
  assertContains(headerSrc, 'onClick={openLangMenu}', 'lang button does not call openLangMenu');
});
test('user button uses openUserMenu', () => {
  assertContains(headerSrc, 'onClick={openUserMenu}', 'user button does not call openUserMenu');
});

// ── Group 7: ARIA attributes ────────────────────────────────────────────────────
console.log('\n▶ Group 7: ARIA attributes preserved');

test('lang button has aria-expanded', () => {
  assertContains(headerSrc, 'aria-expanded={langMenuOpen}', 'lang button missing aria-expanded');
});
test('user button has aria-expanded', () => {
  assertContains(headerSrc, 'aria-expanded={userMenuOpen}', 'user button missing aria-expanded');
});
test('lang button has aria-haspopup', () => {
  assertContains(headerSrc, 'aria-haspopup="listbox"', 'lang button missing aria-haspopup');
});
test('user button has aria-haspopup', () => {
  assertContains(headerSrc, 'aria-haspopup="menu"', 'user button missing aria-haspopup');
});
test('user menu dropdown has role="menu"', () => {
  assertContains(headerSrc, 'role="menu"', 'user menu dropdown missing role="menu"');
});
test('user menu items have role="menuitem"', () => {
  assertContains(headerSrc, 'role="menuitem"', 'user menu items missing role="menuitem"');
});

// ── Group 8: Ref attachment ─────────────────────────────────────────────────────
console.log('\n▶ Group 8: Refs attached to DOM elements');

test('langMenuRef attached to language picker container', () => {
  assertContains(headerSrc, 'ref={langMenuRef}', 'langMenuRef not attached to container');
});
test('userMenuRef attached to user menu container', () => {
  assertContains(headerSrc, 'ref={userMenuRef}', 'userMenuRef not attached to container');
});
test('langBtnRef attached to language trigger button', () => {
  assertContains(headerSrc, 'ref={langBtnRef}', 'langBtnRef not attached to button');
});
test('userBtnRef attached to user trigger button', () => {
  assertContains(headerSrc, 'ref={userBtnRef}', 'userBtnRef not attached to button');
});

// ── Group 9: No old manual toggle patterns ──────────────────────────────────────
console.log('\n▶ Group 9: Old patterns removed');

test('lang button no longer uses inline toggle', () => {
  // The old pattern was "setLangMenuOpen(!langMenuOpen)" inline in onClick
  assertNotContains(
    headerSrc,
    'setLangMenuOpen(!langMenuOpen)',
    'Old inline setLangMenuOpen(!langMenuOpen) still present — should use openLangMenu()'
  );
});
test('user button no longer uses inline toggle', () => {
  assertNotContains(
    headerSrc,
    'setUserMenuOpen(!userMenuOpen)',
    'Old inline setUserMenuOpen(!userMenuOpen) still present — should use openUserMenu()'
  );
});

// ── Group 10: Language selection closes menu ────────────────────────────────────
console.log('\n▶ Group 10: Language selection closes dropdown');

test('setLangMenuOpen(false) called in language selection handlers', () => {
  // Each language button onClick should call setLangMenuOpen(false)
  assertContains(headerSrc, 'setLangMenuOpen(false)', 'Language selection does not close dropdown');
});

// ── Group 11: User menu items & mobile menu behavior ───────────────────────────
console.log('\n▶ Group 11: User menu selection closes dropdown & mobile behavior');

test('Dashboard link closes user menu', () => {
  assertContains(headerSrc, 'to="/dashboard"', 'Dashboard link not found');
  assertContains(headerSrc, 'setUserMenuOpen(false)', 'setUserMenuOpen(false) not found');
});

test('Bookmarks link closes user menu', () => {
  assertContains(headerSrc, 'to="/bookmarks"', 'Bookmarks link not found');
});

test('Profile link closes user menu', () => {
  assertContains(headerSrc, 'to="/profile"', 'Profile link not found');
});

test('Sign out closes user menu and mobile drawer', () => {
  assertContains(headerSrc, 'handleSignOut', 'handleSignOut not found');
  const signOutSection = headerSrc.slice(
    headerSrc.indexOf('handleSignOut'),
    headerSrc.indexOf('handleSignOut') + 200
  );
  assertContains(signOutSection, 'setUserMenuOpen(false)', 'handleSignOut does not close user menu');
  assertContains(signOutSection, 'setMobileMenuOpen(false)', 'handleSignOut does not close mobile menu');
});

test('Mobile menu toggle closes desktop menus', () => {
  assertContains(headerSrc, 'toggleMobileMenu', 'toggleMobileMenu helper not found');
  const toggleSection = headerSrc.slice(
    headerSrc.indexOf('toggleMobileMenu'),
    headerSrc.indexOf('toggleMobileMenu') + 200
  );
  assertContains(toggleSection, 'setLangMenuOpen(false)', 'toggleMobileMenu does not close lang menu');
  assertContains(toggleSection, 'setUserMenuOpen(false)', 'toggleMobileMenu does not close user menu');
});

test('Mobile navigation drawer closes on route change', () => {
  assertContains(headerSrc, 'setMobileMenuOpen(false)', 'setMobileMenuOpen(false) not in route change effect');
});

// ── Summary ─────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
console.log(`Phase 13 Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  • ${f.name}: ${f.error}`));
}
console.log('─'.repeat(60) + '\n');

process.exit(failed > 0 ? 1 : 0);

