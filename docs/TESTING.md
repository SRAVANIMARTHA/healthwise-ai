# HealthWise AI — Testing & Quality Assurance

This document details the automated verification suites, manual smoke-testing flows, and regression guarantees for HealthWise AI.

---

## 1. Automated Verification Suites

The repository contains 11 comprehensive automated test suites located in `scripts/`:

| Suite | Script | Tests | Description |
|---|---|:---:|---|
| **Chat Fixes Regression** | `verify-chat-fixes.mjs` | **32** | Validates HTML entity rendering (no `&amp;` double-encoding) and Ask AI StrictMode idempotency. |
| **Phase 11: Accessibility & Security** | `verify-phase11.mjs` | **59** | WCAG 2.1 AA keyboard/ARIA compliance, OWASP sanitization, in-memory TTL caching, and chunk splitting. |
| **Phase 10: Admin & Analytics** | `verify-phase10.mjs` | **39** | Privacy-conscious telemetry, content review lifecycle, user feedback audits, and model configuration. |
| **Phase 9.5: Scalable Multilingual** | `verify-phase9-5.mjs` | **333** | 22-language registry, 1:1 static translation dictionary parity (en, te, hi), RTL metadata, and emergency invariants. |
| **Phase 9: Multilingual AI & Safety** | `verify-phase9.mjs` | **81** | Multilingual emergency keywords, localized disclaimers, and Puter AI language directives. |
| **Authentication & RBAC** | `verify-auth.mjs` | **28** | Normal login navigation to Home, session persistence, protected routes, and admin-only RLS isolation. |
| **Phase 8: Disease Explorer & Bookmarks** | `verify-phase8.mjs` | **101** | Disease catalog schema, slug resolution, keyword search, curated resources, and bookmark CRUD. |
| **Phase 7: Safety & Red-Flag Triage** | `verify-phase7.mjs` | **87** | Zero-latency emergency triage (cardiac, stroke, respiratory, poisoning, self-harm), adversarial jailbreak defense. |
| **Phase 6: RAG Knowledge Retrieval** | `verify-phase6.mjs` | **25** | Health entity extraction, multi-turn conversational expansion, relevance cutoff (0.25), authentic citations. |
| **Phase 5: WHO Knowledge Ingestion** | `verify-phase5.mjs` | **26** | WHO API factsheet endpoint parsing, HTML entity decoding, semantic chunking, and MD5 checksum diffing. |
| **Phase 4: Puter AI & Emergency Routing** | `verify-phase4.mjs` | **25** | Puter.js integration, non-diagnostic guardrails, fallback templates, and session persistence. |

**Total Automated Tests**: **846 / 846 Passing** (0 failures, 0 regressions).

---

## 2. Running Automated Tests

Run the suites with Node.js and TSX:

```bash
# Run Chat regression suite
node scripts/verify-chat-fixes.mjs

# Run Phase 11 accessibility, security, and cache suite
node scripts/verify-phase11.mjs

# Run Phase 10 admin and analytics suite
npx tsx scripts/verify-phase10.mjs

# Run Phase 9.5 22-language multilingual suite
node scripts/verify-phase9-5.mjs

# Run Phase 9 multilingual AI grounding suite
node scripts/verify-phase9.mjs

# Run Authentication and RBAC suite
npx tsx scripts/verify-auth.mjs

# Run Phase 8 disease explorer and bookmarks suite
node scripts/verify-phase8.mjs

# Run Phase 7 safety guardrails suite
node scripts/verify-phase7.mjs

# Run Phase 6 RAG pipeline suite
node scripts/verify-phase6.mjs

# Run Phase 5 WHO knowledge ingestion suite
node scripts/verify-phase5.mjs

# Run Phase 4 Puter AI inference suite
node scripts/verify-phase4.mjs
```

---

## 3. Manual Smoke Test Verification Matrix

All 24 major application flows were verified during Phase 12 validation:

| # | Flow / Feature | Test Procedure | Result |
|---|---|---|:---:|
| 1 | **Home Page** | Load `/`, verify hero, capability cards, topics, and disclaimer | **PASS** |
| 2 | **User Registration** | Create new user account via `/register` | **PASS** |
| 3 | **User Login** | Log in via `/login`, verify immediate redirection to Home (`/`) | **PASS** |
| 4 | **Logout** | Sign out via user avatar menu, verify session cleared | **PASS** |
| 5 | **Chat Interface** | Navigate to `/chat`, verify empty state and suggestion chips | **PASS** |
| 6 | **Normal Chat Send** | Submit health question, verify single message added and answered | **PASS** |
| 7 | **Disease Explorer** | Browse `/diseases`, test category filters and search bar | **PASS** |
| 8 | **Disease Detail** | Open `/diseases/dengue`, check symptoms, prevention, referral | **PASS** |
| 9 | **Disease → Ask AI** | Click "Ask AI about this condition", verify single execution | **PASS** |
| 10 | **Resources Directory** | Open `/resources`, test external links and regional services | **PASS** |
| 11 | **User Bookmarks** | Save disease, navigate to `/bookmarks`, verify toggle and remove | **PASS** |
| 12 | **Language Switching** | Switch to Telugu/Hindi, verify localized strings and disclaimers | **PASS** |
| 13 | **Safety / Emergency** | Input emergency trigger, verify instant hotline modal | **PASS** |
| 14 | **User Profile** | Navigate to `/profile`, check account email and language preference | **PASS** |
| 15 | **Protected Routes** | Access `/dashboard` unauthenticated, verify redirect to `/login` | **PASS** |
| 16 | **Admin Authorization** | Normal user accesses `/admin`, verify redirect to Home | **PASS** |
| 17 | **Admin Dashboard** | Admin accesses `/admin`, verify metric aggregation cards | **PASS** |
| 18 | **Admin Analytics** | Open `/admin/analytics`, verify privacy metrics (zero PII) | **PASS** |
| 19 | **Content Review** | Open `/admin/reviews`, verify lifecycle stage transitions | **PASS** |
| 20 | **User Feedback** | Submit thumbs up/down, verify review in `/admin/feedback` | **PASS** |
| 21 | **Admin Settings** | Open `/admin/settings`, check model and mock toggles | **PASS** |
| 22 | **Page Refresh** | Refresh deep links (`/chat/xyz`, `/diseases/malaria`), verify state | **PASS** |
| 23 | **Responsive Layout** | Test viewport scaling across desktop, tablet, and mobile | **PASS** |
| 24 | **PWA Manifest** | Verify `manifest.json` and favicon registration in head | **PASS** |

---

## 4. Specific Regression Verifications

### Regression A: HTML Entity Double-Encoding
- **Problem**: In previous builds, ampersands in headings or user queries (e.g., "Nutritional Balance & Metabolic Wellness") rendered literally as `&amp;`.
- **Root Cause**: `securitySanitizer.escapeHtml()` was called before passing text to React JSX text nodes, causing double-encoding because React naturally escapes plain text values.
- **Verification**: Verified in `scripts/verify-chat-fixes.mjs`. Plain JSX text node rendering displays `&`, `<`, and `>` naturally, while malicious script tags (`<script>alert(1)</script>`) are neutralized safely without code execution.

### Regression B: Disease Explorer → Ask AI Request Duplication
- **Problem**: Clicking "Ask AI about this condition" from `DiseaseDetailPage` dispatched duplicate requests and created duplicate sessions under React StrictMode.
- **Root Cause**: The URL query parameter `?prompt=...` persisted across component remounts and concurrent sends raced session creation in `useChat`.
- **Verification**: Verified in `scripts/verify-chat-fixes.mjs`. The query parameter is consumed and cleared via `navigate({ search: '' }, { replace: true })`, guarded by `processedPromptRef`, and session creation is synchronized via `pendingSessionPromise`.
