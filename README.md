<div align="center">

<img src="public/favicon.svg" alt="HealthWise AI Logo" width="120" />

# HealthWise AI

**AI-powered public health chatbot grounded in WHO evidence**

An educational health information system that retrieves trusted WHO factsheets, synthesises answers with AI, and refuses to diagnose or prescribe.

🌐 [**Live Demo →** healthwise-ai-chatbot.vercel.app](https://healthwise-ai-chatbot.vercel.app)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Puter.js](https://img.shields.io/badge/AI-Puter.js-000?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIwIiBmaWxsPSIjMGVhNThlIi8+PC9zdmc+&logoColor=white)](#)

</div>

---

## What It Does

| Feature | Description |
|---------|-------------|
| **AI Health Q&A** | Conversational assistant backed by a RAG pipeline over indexed WHO factsheets |
| **Medical Safety** | Emergency detection, prompt-injection blocking, diagnostic-claim rewriting, mandatory disclaimers |
| **Disease Explorer** | Searchable directory of 10 major diseases with symptoms, prevention & warning signs |
| **Report Explainer** | Upload a lab PDF/image → parsed findings, reference-range flags, plain-language AI summary |
| **Healthcare Locator** | Nearby hospitals & clinics via OpenStreetMap / Overpass on a MapLibre map |
| **Voice Mode** | Speak → Web Speech API → AI answer → read aloud (EN, HI, TE) |
| **Multilingual UI** | Reviewed translations for English, Hindi & Telugu; AI-assisted translation for 18 more |
| **Admin Portal** | Knowledge base, sources, content review, analytics, safety logs, feedback |

> **Disclaimer:** HealthWise AI is for education only. It does not diagnose, prescribe, or replace healthcare professionals.

---

## How the AI Works

```
User query
  │
  ▼
Safety screening ──── emergency keywords / prompt injection → block or escalate
  │
  ▼
Entity + intent extraction (dengue? prevention? symptoms?)
  │
  ▼
Retrieve top-K WHO chunks (topic + intent + lexical scoring, cached)
  │
  ▼
Context builder ──── evidence block with citation rules
  │
  ▼
Puter.js LLM ──── strict system prompt: synthesise from evidence only
  │
  ▼
Output sanitisation ──── rewrite diagnostic claims, append disclaimer
  │
  ▼
Response + source links
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript 5.6 · Vite 6 · Tailwind CSS 3.4 |
| State | Zustand 5 · React Router 6 |
| AI | Puter.js (CDN, no API key required) |
| Database & Auth | Supabase (PostgreSQL, RLS, Row-Level Security on all 15 tables) |
| Maps | MapLibre GL · Overpass API (OpenStreetMap) |
| PDF | pdfjs-dist 3 |
| Voice | Web Speech API (browser-native) |
| Icons | Lucide React |

---

## Quick Start

```bash
git clone https://github.com/yourusername/healthwise-ai.git
cd healthwise-ai
npm install
cp .env.example .env      # edit if you have Supabase credentials (optional)
npm run dev                # → http://localhost:5173
```

Supabase is optional — the app runs in **sandbox mode** (localStorage + mock auth) without it.

### Production build

```bash
npm run build              # tsc + vite → dist/
npm run preview            # serve locally
```

### Environment variables

| Variable | Required | Default |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | No | sandbox mode |
| `VITE_SUPABASE_ANON_KEY` | No | sandbox mode |
| `VITE_PUTER_AI_MODEL` | No | `gpt-4o-mini` |
| `VITE_ENABLE_MOCK_AI` | No | `false` |

---

## Project Layout

```
src/
├── components/        UI (chat, layout, report, healthcare map, landing)
├── pages/             28 route pages + admin portal (7 modules)
├── services/
│   ├── ai/            Puter.js RAG orchestration
│   ├── knowledge/     WHO sync, chunking, retrieval, context builder
│   ├── safety/        Emergency detection + output sanitisation
│   ├── report/        PDF extraction, lab-test parsing, AI explanation
│   ├── location/      Overpass + Nominatim healthcare finder
│   └── voice/         Web Speech API wrapper
├── hooks/             useChat, useVoiceMode, useAuth, useTranslation, useBookmarks
├── stores/            Zustand (auth, chat)
└── types/             TypeScript interfaces (chat, rag, report, database, auth)
supabase/migrations/   4 SQL files — schema, RLS, pgvector, FTS
docs/                  ARCHITECTURE · DATABASE · DEPLOYMENT · TESTING
```

---

## Documentation

| Document | Contents |
|----------|----------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, RAG pipeline, safety layer detail |
| [`docs/DATABASE.md`](docs/DATABASE.md) | All 15 tables, RLS policies, admin functions |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Vercel / Netlify setup, environment config |
| [`docs/TESTING.md`](docs/TESTING.md) | Verification procedures and results |

---

## Medical Disclaimer

HealthWise AI provides general health information sourced from WHO and trusted organisations for **educational purposes only**. It does not diagnose, prescribe, or replace qualified medical advice. In an emergency, contact your local emergency services immediately.

---

<div align="center">
<sub>Built with Puter.js AI · Supabase · React · WHO Health Data</sub>
</div>
