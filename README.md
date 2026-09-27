<div align="center">

# HealthWise AI

### AI-powered public health education with trusted WHO-grounded information, safety guardrails, and conversational assistance.

[Live Demo] · [GitHub]

[badges]

</div>

---

## Overview

HealthWise AI is a web-based public health education assistant designed to help users understand diseases, symptoms, health information, and medical reports in simple language.

It combines conversational AI with trusted health information, RAG, safety guardrails, and multilingual support. It is designed to educate and guide users—not diagnose, prescribe, or replace healthcare professionals.

## Features

| | |
|---|---|
| 🤖 **AI Health Assistant** | Conversational health education powered by Puter.js |
| 🌍 **WHO-Grounded Information** | Answers grounded in curated WHO health content |
| 🦠 **Disease Explorer** | Browse structured public-health information |
| 📄 **Health Report Explainer** | Understand uploaded health reports in simpler language |
| 📍 **Healthcare Locator** | Discover nearby healthcare facilities using OpenStreetMap |
| 🎙️ **Voice Mode** | Voice-based interaction |
| 🌐 **Multilingual Support** | English, Hindi, and Telugu UI support |
| 🔐 **Secure Authentication** | Supabase authentication and protected data |
| 📱 **Responsive / PWA** | Mobile-friendly and installable |

## How It Works

User
↓
HealthWise UI
↓
Safety Layer
↓
RAG Retrieval
↓
WHO / Knowledge Base
↓
Puter AI
↓
Safety Validation
↓
Response

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| AI | Puter.js |
| Backend | Supabase |
| Database | PostgreSQL, pgvector, Full-Text Search |
| Health Data | WHO Fact Sheets / Knowledge Base |
| Maps | MapLibre GL, OpenStreetMap, Overpass |
| Voice | Web Speech API |
| State & Routing | Zustand, React Router |
| Deployment | Vercel |

## Quick Start

```bash
git clone https://github.com/SRAVANIMARTHA/healthwise-ai.git
cd healthwise-ai
npm install
