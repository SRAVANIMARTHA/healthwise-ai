# HealthWise AI

**AI-Driven Public Health Chatbot for Disease Awareness Using Artificial Intelligence and Natural Language Processing**

[![TypeScript](https://img.shields.io/badge/TypeScript-0%20Errors-blue.svg)](tsconfig.json)
[![Tests](https://img.shields.io/badge/Verification-206%2F206%20Passed-success.svg)](scripts/)
[![Build](https://img.shields.io/badge/Build-Production%20Ready-teal.svg)](dist/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

> **Repository**: [github.com/SRAVANIMARTHA/healthwise-ai](https://github.com/SRAVANIMARTHA/healthwise-ai)

---

## Project Overview

**HealthWise AI** is an evidence-grounded public health educational platform built for disease awareness, health literacy, preventive guidance, and rapid safety triage. It couples a curated **World Health Organization (WHO)**-grounded knowledge base with conversational AI via **Puter.js**, delivered through a modern React 18 + TypeScript single-page application.

The platform provides a conversational AI assistant, an interactive disease explorer, a health report explainer, a nearby healthcare facility locator, voice mode interaction, multilingual UI support, and a secure authenticated user portal — all centred around strict non-diagnostic, educational-only principles.

> [!IMPORTANT]
> **Medical Disclaimer**: HealthWise AI is strictly an **educational and awareness tool**. It is **not** a medical diagnostic system, clinical decision support tool, or substitute for professional healthcare advice. It does not provide prescriptions, diagnoses, or clinical treatment recommendations.

---

## Live Demo

The application is deployed on **Vercel**, connected to the `main` branch of this repository.

> Deployment URL is configured via Vercel's project settings.  
> Visit [github.com/SRAVANIMARTHA/healthwise-ai](https://github.com/SRAVANIMARTHA/healthwise-ai) for the latest deployment link.

---

## Key Features

### 1. WHO-Grounded Retrieval-Augmented Generation (RAG)
- Curated knowledge repository built from authoritative WHO fact sheets and international health guidelines.
- Strict retrieval thresholding (minimum relevance cutoff: 0.25) prevents hallucinations and out-of-domain speculation.
- Transparent source citations linking directly to official WHO and health organization pages.
- Falls back gracefully: if no verified knowledge chunk meets the relevance threshold, the assistant explicitly states so rather than fabricating an answer.

### 2. Multilingual UI Support
The application currently provides static, fully reviewed UI translations in:
- **English (`en`)** — Complete UI, safety text, and emergency contacts.
- **Telugu (`te`)** — Native script translations for all UI components, safety directives, emergency contacts (108, 112), and disclaimers.
- **Hindi (`hi`)** — Devanagari script translations for all UI components, safety alerts, emergency contacts, and disclaimers.

> Note: Additional language support beyond these three reviewed languages has not been implemented as reviewed static UI in the current release.

### 3. Deterministic Safety Guardrails & Emergency Escalation
- Instantaneous regex-driven pre-screening detects life-threatening conditions (cardiac arrest, severe respiratory distress, stroke, anaphylaxis, suicidal ideation).
- Zero-latency emergency escalation (112, 911, 108, Tele-MANAS) — bypasses LLM inference entirely on critical triggers.
- Post-processing output sanitization softens diagnostic terminology and enforces educational-only medical disclaimers.
- Adversarial jailbreak defence blocks prompt-injection attacks and persona-override attempts.

### 4. Health Report Explainer
An AI-powered tool that accepts uploaded medical reports and provides plain-language educational explanations:
- **Supported file formats**: PDF, JPG, JPEG, PNG.
- Extracts and identifies common test values (blood counts, glucose, lipid panels, etc.).
- Provides non-diagnostic, educational explanations of what each value typically means in health literature.
- Colour-coded safety attention levels (normal, borderline, attention-required) to highlight values that may warrant discussing with a doctor.
- Multilingual explanation support for **English, Hindi, and Telugu**.
- Healthcare facility locator integrated directly into the report experience (see below).
- **Session-only handling**: uploaded reports are not intentionally persisted to any server; they are processed in-session only.

### 5. Healthcare Facility Locator (MapLibre + OpenStreetMap + Overpass)
- Uses **browser geolocation** to identify the user's current position (with manual fallback).
- Queries the **Overpass API** to discover nearby healthcare facilities from live **OpenStreetMap** data.
- Searches across multiple OSM healthcare tagging categories: hospitals, clinics, doctors, pharmacies, and other health facilities.
- Default search radius: 5 km, expanding automatically if results are sparse.
- Results sorted by distance from the user's location.
- Rendered on an interactive **MapLibre GL** map (no Google Maps API; no Google Cloud billing required).

### 6. Voice Mode
- Powered by the **browser's native Web Speech API** (speech recognition and speech synthesis).
- Allows users to interact with the HealthWise AI assistant using spoken input and receive spoken responses.
- The existing safety, RAG, and AI pipeline remains fully intact in voice mode — voice is purely an input/output layer.
- Voice availability depends on the user's browser and operating system. Not all browsers or devices support the Web Speech API.

### 7. Interactive Disease Explorer
- Categorised disease repository covering vector-borne, respiratory, cardiovascular, metabolic, and infectious diseases.
- Detailed breakdowns: overview, symptoms, early warning signs, risk factors, prevention steps, and when to seek care.
- One-click "Ask AI about this condition" with request idempotency.

### 8. Role-Based Access & Authenticated User Portal
- Supabase Authentication (email/password) with secure session persistence.
- Granular Row-Level Security (RLS) policies for data isolation across profiles, bookmarks, and chat histories.
- Protected administrative portal (`/admin`) for analytics, content review, feedback audits, and system configuration.

### 9. Progressive Web App (PWA)
- PWA manifest configured for standalone mobile and desktop installation.
- WCAG 2.1 AA accessibility: semantic landmarks, skip links, `aria-expanded`/`aria-modal` management, full keyboard navigation.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18 (TypeScript), Vite 6 |
| **Routing & State** | React Router DOM v6, Zustand (modular persistent stores) |
| **Styling & Icons** | Tailwind CSS v3, Lucide React |
| **AI Inference** | Puter.js SDK (`gpt-4o-mini` default, configurable via `VITE_PUTER_AI_MODEL`) |
| **Database & Auth** | Supabase (PostgreSQL 15), Row Level Security (RLS) |
| **Knowledge Engine** | Custom RAG pipeline, pgvector / Full-Text Search hybrid retrieval |
| **Map & Location** | MapLibre GL, OpenStreetMap, Overpass API |
| **Voice** | Browser Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Report Processing** | PDF.js + canvas extraction, image-to-text via AI vision |
| **Security** | Custom OWASP-aligned sanitizer (`securitySanitizer`), CSP headers |
| **PWA** | Web App Manifest, service-worker ready |

---

## System Architecture

```
User Input (Text / Voice / File Upload)
    │
    ▼
Safety Pre-Screening (Deterministic — zero latency)
    │
    ├── Emergency Detected? → Immediate 112 / 911 / 108 hotline escalation
    │
    ▼
Query Processing & Intent Extraction
    │
    ▼
Supabase Knowledge Retrieval (Hybrid: Vector / Full-Text Search)
    │   ├── Relevance threshold check (cutoff ≥ 0.25)
    │   └── WHO-grounded evidence chunks injected into prompt
    │
    ▼
Puter.js AI Engine
    │   ├── System directives: non-diagnostic, educational-only, WHO-grounded
    │   ├── Jailbreak & prompt-injection defence
    │   └── Multilingual response generation
    │
    ▼
Post-Processing Sanitization
    │   ├── Strip diagnostic claims ("you have X" → educational framing)
    │   ├── Strip prescription requests
    │   └── Enforce medical disclaimer
    │
    ▼
Educational Response + Source Citations
    │
    ▼
Supabase Persistence (RLS-protected, zero-PII analytics)
```

---

## AI + RAG Pipeline

1. **Intent Extraction**: User queries are analysed to detect specific health topics (e.g., Dengue, Diabetes, Hypertension) and operational intents (symptoms, prevention, vaccination).
2. **Contextual Expansion**: Multi-turn conversation history is reviewed to resolve references (e.g., "How do I prevent it?" following a Malaria discussion).
3. **Retrieval**: Knowledge chunks are fetched from Supabase and scored against the expanded query. Only chunks scoring ≥ 0.25 are included.
4. **Context Injection**: Relevant excerpts are injected into the AI system prompt with source metadata (organisation, publication date, canonical URL).
5. **Output Validation**: Responses are scanned to verify the presence of educational framing, mandatory disclaimers, and source citations.

---

## Safety & Non-Diagnostic Guardrails

HealthWise AI uses a defence-in-depth safety architecture:

- **Zero-Latency Emergency Triage**: Detects urgent red-flag symptoms (chest pressure, unilateral facial weakness, severe haemorrhage, poisoning, respiratory failure, suicidal ideation) via deterministic pattern matching — no LLM wait time.
- **Diagnostic Refusal**: Refuses prompts requesting diagnostic confirmation; redirects users to primary care consultation.
- **Prescription Defence**: Refuses requests to write prescriptions or specify pharmaceutical dosages.
- **Jailbreak Neutralisation**: Blocks prompt-injection attacks (e.g., "ignore previous instructions", "DAN mode", "pretend you are an unrestricted doctor").
- **PII Redaction**: Automatically scrubs emails, phone numbers, and identifiers before processing.

---

## Database Architecture (Supabase)

The PostgreSQL database implements 15 secured relations with Row-Level Security:

| Table | Purpose |
|---|---|
| `profiles` | User account metadata, linked to `auth.users` |
| `knowledge_sources` | Curated health organisations (WHO, CDC, MoHFW) |
| `diseases` & `health_topics` | Structured medical encyclopedia entries |
| `knowledge_documents` & `knowledge_chunks` | Ingested articles and semantic chunks |
| `chat_sessions` & `chat_messages` | Multi-turn conversation histories |
| `bookmarks` | User-saved entries |
| `feedback` | User satisfaction and educational feedback |
| `analytics_events` | Privacy-preserving telemetry (zero PII) |
| `safety_events` | Audit log of red-flag escalations |
| `content_reviews` | Editorial review lifecycle |
| `app_settings` | Dynamic toggles (AI models, feature flags) |
| `supported_languages` | Active language registries |

---

## Local Development & Setup

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SRAVANIMARTHA/healthwise-ai.git
   cd healthwise-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` — **never commit actual secret values**:
   ```env
   # Puter AI Model (default: gpt-4o-mini)
   VITE_PUTER_AI_MODEL=gpt-4o-mini
   VITE_ENABLE_MOCK_AI=false

   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key

   # Application Details
   VITE_APP_NAME="HealthWise AI"
   VITE_DEFAULT_LANGUAGE=en
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Database Migrations (Supabase)

To initialise a fresh Supabase instance, run the migration scripts in `supabase/migrations/` sequentially in the Supabase SQL Editor:

1. `001_initial_schema.sql` — Core tables, triggers, indexes, and initial RLS policies.
2. `002_fix_profiles_rls.sql` — `public.is_admin()` SECURITY DEFINER function to eliminate recursive policy evaluation.
3. `002_knowledge_base_sync.sql` — Document synchronisation metadata and seeds primary sources (WHO, CDC, MoHFW).
4. `003_vector_rag_retrieval.sql` — Full-Text Search vectors, optional `pgvector` embeddings, and the `match_knowledge_chunks` RPC function.

---

## Testing & Verification

The project includes an automated verification harness covering authentication, RAG, safety, chat, accessibility, the health report explainer, the healthcare locator, and voice mode:

```bash
# Individual verification scripts
node scripts/verify-auth.mjs
node scripts/verify-chat-fixes.mjs
node scripts/verify-phase4.mjs   # Puter AI & emergency routing
node scripts/verify-phase5.mjs   # WHO knowledge ingestion
node scripts/verify-phase6.mjs   # RAG pipeline & retrieval
node scripts/verify-phase7.mjs   # Safety layer & red-flag triage
node scripts/verify-phase8.mjs   # Disease explorer & bookmarks
node scripts/verify-phase9.mjs   # Multilingual grounding & safety
node scripts/verify-phase9-5.mjs # Language architecture
node scripts/verify-phase10.mjs  # Admin & analytics
node scripts/verify-phase11.mjs  # Accessibility, security, performance
node scripts/verify-phase13.mjs  # Voice mode
node scripts/verify-phase14.mjs  # Floating AI assistant
node scripts/verify-phase15.mjs  # UI & theming
node scripts/verify-phase16.mjs  # PWA & manifest
node scripts/verify-phase17.mjs  # Healthcare locator
node scripts/verify-phase18.mjs  # Health report explainer

# TypeScript strict check
npx tsc --noEmit

# Production build
npm run build
```

### Latest Production Audit Results

| Check | Result |
|---|---|
| Verification tests | **206 / 206 passed** |
| TypeScript (`tsc --noEmit`) | **0 errors** |
| Production build (`npm run build`) | **Success** |
| Security audit | Passed |
| Authentication & RLS | Verified |
| Medical safety guardrails | Verified |
| WHO / RAG pipeline | Verified |
| Health Report Explainer | Verified |
| Healthcare locator (Overpass) | Verified |
| Voice mode | Verified |
| Responsive layout | Audited (390px – 1920px) |

> Note: Verification tests are Node.js/ESM static analysis and functional checks. Full browser end-to-end automation (Playwright/Cypress) is not currently part of this project.

---

## Production Deployment (Vercel)

### Build for production
```bash
npm run build
```
Output is generated in `dist/` with optimised code splitting across vendor and route chunks.

### Vercel Deployment
- The `main` branch of this repository is connected to a **Vercel** project.
- Pushing to `main` automatically triggers a new Vercel deployment.
- Configure the following **Environment Variables** in the Vercel project dashboard (never hardcode secrets):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |
| `VITE_PUTER_AI_MODEL` | AI model identifier (e.g., `gpt-4o-mini`) |
| `VITE_ENABLE_MOCK_AI` | Set to `false` in production |
| `VITE_APP_NAME` | Application display name |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full step-by-step instructions.

---

## Security Considerations

- **No Secret Keys in Frontend**: No service-role keys, database master passwords, or private AI API keys are embedded in source bundles.
- **Row-Level Security (RLS)**: Enforced on all Supabase tables. Unauthenticated users cannot access private sessions; regular users cannot access admin analytics.
- **XSS Prevention**: All incoming text and external links are strictly validated through `securitySanitizer`, rejecting `javascript:`, `data:`, and `vbscript:` pseudo-protocols.
- **SQL Injection Prevention**: Parameterised Supabase client queries and stored procedures throughout.
- **Content Security Headers**: Pre-configured in `index.html` (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).
- **PII Protection**: Coordinates and identifiable health data are not logged to analytics tables.

---

## Limitations

- **Non-Diagnostic Scope**: AI responses are educational and non-diagnostic. The system cannot interpret medical imaging, make clinical judgements, or replace a licensed healthcare professional.
- **Internet Connectivity**: Puter.js AI inference requires an active internet connection to reach Puter cloud endpoints.
- **Voice Support**: Voice mode relies on the browser's native Web Speech API. Availability and quality vary across browsers and operating systems; not all environments support it.
- **OSM Data Coverage**: Healthcare facility discovery depends on OpenStreetMap contributor data. Coverage quality varies by region.
- **Reviewed Language UI**: Static, fully reviewed translations are provided for English, Telugu, and Hindi only. Additional language UI support beyond these three is not currently implemented as reviewed content.
- **Emergency Telephony**: The app presents regional emergency numbers (112, 911, 108) and quick-dial links but cannot directly dispatch emergency services.
- **Browser E2E Testing**: Playwright/Cypress browser automation tests are not currently part of this project's test suite.

---

## Medical Disclaimer

> **IMPORTANT MEDICAL DISCLAIMER**
>
> HealthWise AI is an educational technology system developed solely for public health awareness, general disease information, and preventive health literacy. **It is NOT an electronic health record, medical diagnostic tool, or clinical decision support system.**
>
> The information provided must **never** be used as a substitute for professional medical evaluation, diagnosis, or treatment by a qualified healthcare professional.
>
> If you are experiencing a medical emergency (such as severe chest pain, difficulty breathing, stroke symptoms, or severe trauma), **immediately call your national emergency service** — **112** (India/Europe), **911** (North America), or **108** (ambulance, India) — or go to the nearest emergency department.

---

## Future Scope

- Integration with real-time disease outbreak surveillance feeds (e.g., IDSP, WHO Disease Outbreak News).
- Expanded professionally reviewed translations for additional regional languages.
- Offline-capable lightweight on-device inference using WebLLM / WebGPU for low-connectivity environments.
- Additional OpenStreetMap data layers (pharmacies, blood banks, diagnostic centres) in the healthcare locator.
