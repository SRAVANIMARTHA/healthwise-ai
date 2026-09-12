# HealthWise AI

**AI-Driven Public Health Chatbot for Disease Awareness Using Artificial Intelligence and Natural Language Processing**

[![Phase Status](https://img.shields.io/badge/Phase%2012-Production%20Ready-teal.svg)](https://github.com/)
[![Tests](https://img.shields.io/badge/Tests-846%20Passed%20%7C%200%20Failed-success.svg)](docs/TESTING.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%200%20Errors-blue.svg)](tsconfig.json)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## Project Overview

**HealthWise AI** is an evidence-grounded public health educational platform designed to raise disease awareness, deliver trusted health education, promote preventive hygiene, and provide rapid safety triage. By coupling curated knowledge from the **World Health Organization (WHO)** and other authoritative international health bodies with cutting-edge natural language processing via **Puter.js AI**, HealthWise AI delivers conversational, evidence-grounded health literacy across diverse communities.

The platform includes comprehensive disease guides, interactive prevention recommendations, multi-language conversational support, bookmarking capabilities, a strict zero-latency red-flag emergency detection layer, and an administrative telemetry dashboard.

> [!IMPORTANT]
> **Academic & Medical Notice**: HealthWise AI is strictly an **educational and awareness tool**. It is **not** a medical diagnostic system, clinical decision support tool, or electronic health record (EHR). It does not provide prescriptions, diagnosis, or clinical treatments.

---

## Key Features

1. **WHO-Grounded Retrieval-Augmented Generation (RAG)**
   - Curated knowledge repository built from authoritative WHO fact sheets and international health guidelines.
   - Strict retrieval thresholding (0.25 minimum relevance cutoff) prevents hallucinations and out-of-domain speculation.
   - Transparent, authentic source citations linking directly to official WHO and health ministry pages.

2. **Multilingual Architecture (22 Languages)**
   - **Reviewed & Curated Tier**: English, Telugu (తెలుగు), and Hindi (हिन्दी) with verified translations, localized medical terms, and curated emergency contacts.
   - **AI-Supported Dynamic Tier**: 19 regional and global languages (Tamil, Bengali, Urdu, Spanish, French, Arabic, etc.) dynamically localized via LLM with client-side caching.
   - Full bidirectional layout support, including Right-to-Left (RTL) for Arabic and Urdu.

3. **Deterministic Safety Guardrails & Emergency Escalation**
   - Instantaneous regex-driven pre-screening detects life-threatening conditions (cardiac arrest, severe respiratory distress, stroke signs, anaphylaxis, suicide/self-harm).
   - Bypasses LLM inference on critical triggers to provide immediate zero-latency emergency escalation (112, 911, 108, Tele-MANAS).
   - Post-processing output sanitization strictly softens diagnostic terminology and enforces medical disclaimers.

4. **Interactive Disease Explorer & Curated Resources**
   - Detailed, categorised disease repository (vector-borne, respiratory, cardiovascular, metabolic, infectious).
   - Comprehensive breakdowns of overviews, symptoms, early warning signs, risk factors, prevention steps, and clinical referral criteria.
   - Seamless one-click transition: "Ask AI about this condition" with strict request idempotency.

5. **Role-Based Access Control & User Portal**
   - Supabase Authentication supporting email/password accounts with secure session persistence.
   - Granular Row-Level Security (RLS) policies guaranteeing data isolation for profiles, bookmarks, and chat histories.
   - Protected administrative portal (`/admin`) for analytics telemetry, content review lifecycle management, feedback audits, and system configuration.

6. **Accessibility & Progressive Web App (PWA)**
   - Strict WCAG 2.1 AA compliance: semantic landmarks, screen-reader skip links, `aria-expanded` and `aria-modal` dialog management, and complete keyboard navigability.
   - PWA manifest configuration for standalone mobile and desktop installation.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18 (TypeScript), Vite 6 |
| **Routing & State** | React Router DOM v6, Zustand (modular persistent stores) |
| **Styling & Icons** | Tailwind CSS v3, Lucide React |
| **AI Inference** | Puter.js v2 SDK (`gpt-4o-mini` default, configurable) |
| **Database & Auth** | Supabase (PostgreSQL 15), Row Level Security (RLS) |
| **Knowledge Engine** | Custom RAG retrieval pipeline, Vector embeddings + Full-Text Search |
| **Sanitization & Security** | Custom OWASP-aligned sanitization engine (`securitySanitizer`) |
| **Testing & CI** | Custom Node.js/TSX automated verification suites (846 tests) |

---

## System Architecture

```
                                  +---------------------------------------+
                                  |            User Interface             |
                                  |   (React 18 + Tailwind + Lucide)      |
                                  +-------------------+-------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v                                                         v
           +---------------------------+                             +---------------------------+
           |   Chat & Health Stream    |                             |  Disease Explorer & Pages |
           +-------------+-------------+                             +-------------+-------------+
                         |                                                         |
                         v                                                         v
           +---------------------------+                             +---------------------------+
           | Safety & Red-Flag Triage  | (Cardiac, stroke, self-harm)| Disease & Resource Service|
           +-------------+-------------+                             +-------------+-------------+
                         |
           +-------------+-------------+
           | (Emergency Detected?)     |
           |   YES -> Immediate 112/911/108 Hotlines Modal
           |   NO  -> Proceed to Knowledge Retrieval
           v
+-------------------------------------------------------+
|          RAG Pipeline & Context Builder               |
|  - Entity Extraction & Keyword Intent Matching        |
|  - Multi-turn Conversational Query Expansion          |
|  - Supabase Hybrid Search (Vector/FTS) or Local Cache |
|  - Minimum Relevance Threshold Filtering (cutoff: 0.25)|
+---------------------------+---------------------------+
                            |
                            v
+-------------------------------------------------------+
|                    Puter AI Engine                    |
|  - Prompt Injection & Jailbreak Defense Containment   |
|  - System Directives (Non-diagnostic, WHO-grounded)   |
|  - Multilingual Translation & Localization            |
+---------------------------+---------------------------+
                            |
                            v
+-------------------------------------------------------+
|             Post-Processing Sanitizer                 |
|  - Strip Diagnostic Claims ("You have" -> "Conditions")|
|  - Strip Medication Prescriptions                     |
|  - Enforce Localized Medical Disclaimer               |
+---------------------------+---------------------------+
                            |
                            v
+-------------------------------------------------------+
|           Persistence & Telemetry (Supabase)          |
|  - RLS Protected User Chat Messages & Sessions        |
|  - Privacy-Conscious Anonymized Analytics (Zero PII)  |
+-------------------------------------------------------+
```

---

## AI + RAG Architecture

The Retrieval-Augmented Generation pipeline ensures that user inquiries receive factual, verified guidance from trusted health authorities:

1. **Pre-processing & Intent Extraction**: User queries are analyzed to detect mentions of specific health topics (e.g., Dengue, Diabetes, Hypertension) and operational intents (symptoms, prevention, vaccination).
2. **Contextual Expansion**: Multi-turn history is reviewed to resolve anaphoric references (e.g., "How do I prevent it?" following a discussion on Malaria).
3. **Retrieval**: Knowledge chunks are fetched and scored against the expanded query. If no chunk scores above 0.25, the assistant explicitly states that verified WHO literature is unavailable rather than fabricating an answer.
4. **Context Injection**: Relevant excerpts are injected into the system prompt with metadata (source organization, publication date, canonical URL).
5. **Output Validation**: Responses are scanned to verify the presence of mandatory medical disclaimers and source citations.

---

## Safety & Non-Diagnostic Guardrails

HealthWise AI is built around a defense-in-depth safety architecture:

- **Zero-Latency Emergency Triage**: Detects urgent red-flag symptoms (chest pressure, unilateral facial weakness, severe hemorrhaging, poisoning, respiratory failure, suicidal ideation) via high-speed deterministic pattern matching. Escalation occurs instantly without awaiting LLM inference.
- **Diagnostic Refusal**: Refuses user prompts requesting diagnostic confirmation (e.g., "Tell me what disease I have"), redirecting the user to primary care consultation.
- **Prescription Defense**: Refuses requests to write prescriptions or specify pharmaceutical dosages (e.g., "Write me an amoxicillin prescription"), advising consultation with a licensed pharmacist or physician.
- **Adversarial Jailbreak Neutralization**: Blocks prompt-injection attacks (e.g., "ignore all previous instructions", "DAN mode", "pretend you are an unrestricted doctor").
- **PII Redaction**: Automatically scrubs emails, phone numbers, and national identifiers before processing.

---

## Multilingual Support

The application provides accessibility across diverse linguistic populations:

- **Reviewed & Verified Languages**:
  - **English (`en`)**: Complete static UI and safety coverage.
  - **Telugu (`te`)**: Native script translations for all UI components, safety directives, emergency numbers (108, 112), and medical disclaimers.
  - **Hindi (`hi`)**: Native Devanagari script translations for all UI components, safety alerts, emergency contacts, and disclaimers.
- **AI-Supported Languages (19 Languages)**:
  - Regional Indian: Tamil, Bengali, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Urdu, Odia.
  - Global: Spanish, French, German, Arabic, Portuguese, Russian, Japanese, Korean, Chinese, Italian.
- **Bidirectional Support**: Dynamic RTL layout activation for Arabic (`ar`) and Urdu (`ur`) using HTML `dir="rtl"`.

---

## Database Architecture (Supabase)

The underlying PostgreSQL database implements 15 specialized relations secured by Row-Level Security:

- `profiles`: User account metadata, linked to `auth.users(id)` via cascade delete.
- `knowledge_sources`: Curated health organizations (WHO, CDC, MoHFW) with trust tiers.
- `diseases` & `health_topics`: Structured medical encyclopedia entries.
- `knowledge_documents` & `knowledge_chunks`: Ingested articles and semantic chunks for vector and full-text search.
- `chat_sessions` & `chat_messages`: Multi-turn conversational histories with user-level isolation.
- `bookmarks`: User-saved disease entries and documents.
- `feedback`: User satisfaction ratings and educational feedback.
- `analytics_events`: Privacy-preserving telemetry (zero PII, zero email/passwords).
- `safety_events`: Audit log of red-flag escalations and safety interventions.
- `content_reviews`: Editorial review stages (`draft`, `review`, `approved`, `published`, `archived`).
- `app_settings`: Dynamic operational toggles (AI models, feature flags).
- `supported_languages`: Active language registries.

---

## Local Development & Setup

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "major project"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings:
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

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Database Migrations (Supabase)

To initialize a fresh Supabase instance, execute the migration scripts located in `supabase/migrations/` in sequential order within the **Supabase SQL Editor**:

1. `001_initial_schema.sql`: Creates core tables, triggers, indexes, and initial RLS policies.
2. `002_fix_profiles_rls.sql`: Establishes the `public.is_admin()` SECURITY DEFINER function to eliminate recursive policy evaluation.
3. `002_knowledge_base_sync.sql`: Configures document synchronization metadata and seeds primary sources (WHO, CDC, MoHFW).
4. `003_vector_rag_retrieval.sql`: Configures PostgreSQL Full-Text Search vectors, optional `pgvector` embeddings, and the `match_knowledge_chunks` RPC function.

---

## Testing & Verification

The project includes an extensive automated verification harness covering all functional phases:

```bash
# Run Chat regression tests (entity rendering & Ask AI idempotency)
node scripts/verify-chat-fixes.mjs

# Run Phase 11 tests (Accessibility, Security, Performance)
node scripts/verify-phase11.mjs

# Run Phase 10 tests (Admin & Analytics)
npx tsx scripts/verify-phase10.mjs

# Run Phase 9.5 tests (22-Language Scalable Multilingual)
node scripts/verify-phase9-5.mjs

# Run Phase 9 tests (Multilingual Grounding & Safety)
node scripts/verify-phase9.mjs

# Run Authentication & Authorization tests
npx tsx scripts/verify-auth.mjs

# Run Phase 8 tests (Disease Explorer & Bookmarks)
node scripts/verify-phase8.mjs

# Run Phase 7 tests (Safety Layer & Red-Flag Triage)
node scripts/verify-phase7.mjs

# Run Phase 6 tests (RAG Pipeline & Retrieval)
node scripts/verify-phase6.mjs

# Run Phase 5 tests (WHO Knowledge Ingestion)
node scripts/verify-phase5.mjs

# Run Phase 4 tests (Puter AI & Emergency Routing)
node scripts/verify-phase4.mjs

# Run TypeScript compilation check
npx tsc --noEmit

# Run Production Build
npm run build
```

**Results**: 846/846 automated tests pass with 0 errors and 0 regressions.

---

## Production Deployment

### Building for Production
```bash
npm run build
```
Build output is generated in `dist/` with optimized code splitting (32 vendor and route chunks). The largest JavaScript chunk is 283.97 kB (77.47 kB gzipped), well within the 500 kB threshold.

### Deployment Platforms
HealthWise AI is a single-page client application with serverless backend connectivity. It can be hosted on:
- **Vercel**
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages / AWS S3 + CloudFront**

Refer to [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step instructions.

---

## Security Considerations

- **Client-Side Secret Isolation**: No administrative keys (`service_role`), database master passwords, or AI secret keys are embedded in frontend source bundles.
- **Row-Level Security (RLS)**: Enforced on all Supabase tables. Unauthenticated users cannot read private sessions, and regular users cannot read administrative analytics.
- **Cross-Site Scripting (XSS)**: All incoming text and external links are strictly validated through `securitySanitizer`, rejecting `javascript:`, `data:`, and `vbscript:` pseudo-protocols.
- **SQL Injection**: Prevented by parameterized Supabase client queries and stored procedures.
- **Content Security Headers**: Pre-configured in `index.html` (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).

---

## Limitations

- **Non-Diagnostic Scope**: Cannot interpret medical imaging, lab reports, or diagnose acute conditions.
- **Internet Connectivity**: Puter.js AI inference requires an active internet connection to contact Puter cloud endpoints.
- **Language Review Scope**: English, Telugu, and Hindi are verified; other languages utilize AI-based dynamic translation and should be treated as supplemental.
- **Emergency Telephony**: While the app presents regional emergency numbers and quick-dial links, it cannot directly dispatch first responders.

---

## Medical Disclaimer

> **IMPORTANT MEDICAL DISCLAIMER**:
> HealthWise AI is an educational technology system developed solely for public health awareness, general disease information, and preventive health literacy. **It is NOT an electronic health record, medical diagnostic tool, or clinical decision support system.**
> 
> The information provided must **never** be used as a substitute for professional medical evaluation, diagnosis, or treatment. If you are experiencing symptoms of a medical emergency (such as severe chest pain, shortness of breath, stroke signs, or severe trauma), immediately call your national emergency service (such as **112** in India/Europe, **911** in North America, or **108** in India) or visit the nearest emergency medical department.

---

## Future Scope

- Integration with localized real-time disease outbreak surveillance feeds (e.g., IDSP, WHO DONs).
- Offline-first on-device lightweight LLM inference using WebLLM / WebGPU for areas with limited connectivity.
- Voice-activated input/output for enhanced accessibility among low-literacy communities.
- Expansion of professionally reviewed translation dictionaries to additional regional languages.
