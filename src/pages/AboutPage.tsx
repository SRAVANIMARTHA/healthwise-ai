import React from 'react';
import { Activity, ShieldCheck, Cpu, Database, Award, BookOpen } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Academic Capstone / Major Project
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
          AI-Driven Public Health Chatbot for Disease Awareness Using Artificial Intelligence and Natural Language Processing
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
          A production-quality conversational platform engineered to bridge public health literacy gaps through evidence-grounded AI, verifiable source citations, and strict ethical safety boundaries.
        </p>
      </div>

      {/* Problem Statement & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <Badge variant="warning">The Problem</Badge>
          <h3 className="text-lg font-bold text-slate-900">Health Misinformation & Clinical Access Barriers</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Unregulated online health searches and generalized AI models frequently produce medical hallucinations, alarmist non-clinical self-diagnoses, or promote unverified remedies. Concurrently, millions lack rapid access to plain-language, evidence-based preventive information.
          </p>
        </Card>

        <Card className="space-y-3">
          <Badge variant="success">The Solution</Badge>
          <h3 className="text-lg font-bold text-slate-900">Retrieval-Grounded Public Health Literacy</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            HealthWise AI anchors conversational NLP to curated, version-controlled guidelines from WHO, CDC, and national health ministries. It enforces a strict non-diagnostic boundary, triages emergencies to local helplines, and provides multilingual support in English, Telugu, and Hindi.
          </p>
        </Card>
      </div>

      {/* Methodology Pipeline Flow */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <Badge variant="primary">Methodology</Badge>
          <h3 className="text-xl font-bold text-slate-900">System Architecture & RAG Pipeline</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            The core algorithmic flow guarantees that AI generation is strictly constrained by retrieved medical evidence.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 space-y-2 leading-relaxed overflow-x-auto">
          <div className="text-teal-700 font-bold">User Query Ingestion</div>
          <div className="text-slate-400 pl-4">↓ [Intent Detection & Entity Extraction]</div>
          <div className="text-indigo-700 font-bold">Rule-Based Red-Flag & Emergency Triage</div>
          <div className="text-slate-400 pl-4">↓ (If non-emergency, continue)</div>
          <div className="text-sky-700 font-bold">Semantic Knowledge Retrieval (RAG from WHO/CDC documents)</div>
          <div className="text-slate-400 pl-4">↓ [Context Assembly + Guardrail Injections]</div>
          <div className="text-purple-700 font-bold">Inference via Puter.js AI Engine</div>
          <div className="text-slate-400 pl-4">↓ [Non-Diagnostic Safety Validator]</div>
          <div className="text-emerald-700 font-bold">Final Grounded Output + Official Citations + Disclaimer</div>
        </div>
      </div>

      {/* Tech Stack Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Architectural Technology Stack</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Frontend</span>
            <span className="font-bold text-slate-800 text-sm">React 18 & TS</span>
            <p className="text-slate-500 text-[11px] mt-0.5">Vite + Tailwind CSS</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">AI Engine</span>
            <span className="font-bold text-slate-800 text-sm">Puter.js AI</span>
            <p className="text-slate-500 text-[11px] mt-0.5">Serverless Inference</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Database</span>
            <span className="font-bold text-slate-800 text-sm">Supabase</span>
            <p className="text-slate-500 text-[11px] mt-0.5">PostgreSQL with RLS</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Guardrails</span>
            <span className="font-bold text-slate-800 text-sm">Custom RAG</span>
            <p className="text-slate-500 text-[11px] mt-0.5">Zero-Hallucination rules</p>
          </div>
        </div>
      </div>
    </div>
  );
};
