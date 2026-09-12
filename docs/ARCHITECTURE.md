# HealthWise AI — Architecture & Technical Design

## 1. System Architecture Overview

HealthWise AI is built as a single-page, modern, client-side rendered web application powered by **React 18** and **TypeScript**, integrated with a serverless **Supabase PostgreSQL** backend, and utilizing **Puter.js** for client-side AI inference without requiring server-hosted API keys.

The core design principle is **Evidence Grounding with Deterministic Safety Pre-Screening**: Every user question passes through a deterministic rule-based safety layer before reaching the AI model or RAG pipeline.

```
+-----------------------------------------------------------------------------+
|                             Presentation Tier                               |
|   React 18 (SPA) | Tailwind CSS | Lucide React | HTML5 Semantics & ARIA     |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                         Safety & Pre-Screen Tier                            |
|   - Deterministic Red-Flag Detection (Regex pattern matching)               |
|   - Zero-Latency Emergency Escalation (Cardiac, stroke, self-harm)          |
|   - Adversarial Jailbreak & Prompt Injection Defense                        |
|   - Prescription & Diagnostic Demands Refusal                               |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     Knowledge Retrieval & RAG Pipeline                      |
|   - Medical entity & topic recognition (Dengue, Diabetes, Malaria, etc.)     |
|   - Conversational multi-turn history expansion                             |
|   - Hybrid vector & PostgreSQL full-text search (Supabase RPC)              |
|   - Minimum relevance threshold filtering (cutoff: 0.25)                    |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                          AI Inference Tier (Puter.js)                       |
|   - Direct browser-to-Puter AI cloud communication                          |
|   - Injected WHO context + Non-diagnostic system directives                 |
|   - Configurable model (default: gpt-4o-mini)                               |
|   - Multilingual response generation (22 supported languages)               |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     Post-Processing & Sanitization Tier                     |
|   - Diagnostic claim softening ("You have" -> "Possible signs")             |
|   - Medical disclaimer enforcement (localized by language)                  |
|   - Output entity safety and XSS URL sanitization                           |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                         Persistence & Telemetry Tier                        |
|   - Supabase Auth & PostgreSQL Database with Row-Level Security (RLS)       |
|   - Anonymized, privacy-conscious telemetry (zero PII)                      |
|   - LocalStorage offline session fallback                                   |
+-----------------------------------------------------------------------------+
```

---

## 2. Frontend Layer

- **Framework**: React 18 with Vite 6.
- **Routing**: `react-router-dom` v6 with code splitting and lazy loading via `React.lazy` and `Suspense`.
  - Public routes: `/`, `/chat`, `/diseases`, `/diseases/:slug`, `/prevention`, `/vaccination`, `/healthy-habits`, `/resources`, `/about`, `/login`, `/register`, `/privacy`, `/terms`.
  - Protected user routes: `/dashboard`, `/chat-history`, `/bookmarks`, `/profile`.
  - Protected admin routes: `/admin`, `/admin/knowledge`, `/admin/sources`, `/admin/reviews`, `/admin/analytics`, `/admin/feedback`, `/admin/safety-logs`, `/admin/settings`.
- **State Management**: Zustand lightweight stores with persistence:
  - `auth-store.ts`: Session tokens, user profile, role-based authorization.
  - `chat-store.ts`: Active session ID, message history, streaming indicators, query telemetry.
- **Styling**: Tailwind CSS with custom medical theme colors (teal, slate, emerald, amber, rose).
- **Accessibility**: Semantic elements (`main`, `nav`, `header`, `footer`), `SkipLink`, screen reader labels (`sr-only`), dynamic ARIA tags (`aria-expanded`, `aria-modal`, `aria-haspopup`).

---

## 3. Safety Architecture (Defense-in-Depth)

The safety architecture consists of three interlocking stages:

1. **Deterministic Pre-Screen (`safetyService.checkSafety`)**:
   - Executes with zero latency in memory before any external API or RAG call.
   - Categorizes triggers into `critical`, `urgent`, or `moderate`.
   - Critical triggers (e.g., chest pain, respiratory distress, unilateral numbness, severe hemorrhage, poisoning, suicide) bypass the AI model immediately, populating the `HotlineModal` with regional emergency numbers (112, 108, 911).
   - Urgent triggers (prompt injection, jailbreak attempts) return immediate refusal responses.
   - Moderate triggers (diagnostic/prescription requests) return structured educational boundaries.
2. **System Prompt Directives**:
   - Instructs the LLM to refuse diagnostic declarations, refrain from drug dosage advice, and ground all statements in provided WHO literature.
3. **Output Sanitizer (`safetyService.sanitizeOutput`)**:
   - Regex-based post-processor that softens any inadvertent diagnostic statements (e.g., transforming "You have diabetes" into "The symptoms you mentioned are associated with diabetes; please consult a healthcare professional").
   - Guarantees the attachment of the official medical disclaimer in the user's active language.

---

## 4. Knowledge Ingestion & RAG Pipeline

1. **Source Ingestion (`whoApiService.ts`)**:
   - Scrapes official WHO Fact Sheets via the public REST API.
   - Cleans HTML entities, strips unwanted DOM elements, and computes an MD5 checksum to detect updates.
2. **Chunking Engine (`chunkingService.ts`)**:
   - Breaks documents into logical chunks: Executive Summary, Symptoms, Causes, Prevention, Treatment, and Advice.
   - Annotates each chunk with source metadata, canonical URL, and estimated token length.
3. **Retrieval Engine (`retrievalService.ts`)**:
   - Pre-processes query and extracts medical entities using dictionary lookups.
   - Expands conversational context across multiple conversation turns.
   - Queries Supabase hybrid full-text/vector index (`match_knowledge_chunks`) or uses the in-memory verified fallback index.
   - Enforces a minimum relevance threshold of `0.25`. Chunks below this threshold are discarded.
4. **Context Builder (`contextBuilder.ts`)**:
   - Formats retrieved chunks into markdown citations: `[Source: WHO - Disease Name (canonical URL)]`.

---

## 5. Puter.js AI Integration

- **SDK**: Loaded via official CDN script `https://js.puter.com/v2/` in `index.html`.
- **Method**: Calls `window.puter.ai.chat(messages, { model: 'gpt-4o-mini', temperature: 0.3 })`.
- **Key Advantage**: Zero client-side API key exposure. Puter manages authentication and inference directly in the user browser environment.
- **Fail-safe**: If Puter.js encounters connectivity issues or browser extension blocks, `puterAIService` falls back to verified offline educational guidance templates.

---

## 6. Multilingual Architecture

HealthWise AI implements a dual-tier multilingual model:

- **Tier 1: Reviewed & Verified Languages**:
  - **English (`en`)**, **Telugu (`te`)**, **Hindi (`hi`)**.
  - Static 1:1 translation dictionaries covering all navigation, hero, disease catalog, emergency alerts, and disclaimers.
  - Curated by human medical/linguistic reviewers.
- **Tier 2: AI-Supported Languages (19 Languages)**:
  - Regional: Tamil, Bengali, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Urdu, Odia.
  - Global: Spanish, French, German, Arabic, Portuguese, Russian, Japanese, Korean, Chinese, Italian.
  - Dynamically translated via Puter AI and cached in `MemoryCache` and `localStorage` to eliminate redundant translation calls.
  - Distinctly marked with "AI-Supported" badges in the UI.
- **Bidirectional Text (RTL)**:
  - Arabic (`ar`) and Urdu (`ur`) automatically set `dir="rtl"` on the document root, ensuring correct text flow and icon placement.

---

## 7. Administrative & Telemetry Subsystem

- **Privacy-First Design**: The telemetry logger (`analyticsService.ts`) explicitly excludes personal user identifiers (no user IDs, emails, IP addresses, or sensitive health histories).
- **Recorded Metrics**:
  - Inquired health topics (e.g., Dengue, Hypertension).
  - Language distribution.
  - Evidence grounding rates (percentage of queries backed by WHO literature).
  - Safety escalation frequency.
- **Content Review Lifecycle**:
  - Manages knowledge document curation through stages: `draft` -> `review` -> `approved` -> `published` -> `archived`.
- **User Feedback**:
  - Thumbs up/down ratings on assistant responses stored in the `feedback` table for quality evaluation.
