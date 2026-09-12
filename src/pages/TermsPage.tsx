import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Use & Medical Disclaimer</h1>
        <p className="text-xs text-slate-500">Last updated: September 2025</p>
      </div>

      {/* Primary Medical Disclaimer Box */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <h2>MANDATORY MEDICAL DISCLAIMER</h2>
        </div>
        <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
          HealthWise AI is an educational, research, and public health awareness tool. It does NOT provide medical diagnosis, clinical prognosis, individualized treatment plans, or prescription medication recommendations. The content provided is derived from public health guidelines (such as the WHO and CDC) for general educational awareness only.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Not a Substitute for Professional Medical Advice</h2>
          <p>
            Always consult a qualified doctor, physician, or licensed healthcare provider for questions regarding personal symptoms, diagnoses, medical conditions, or drug therapies. Never disregard or delay seeking professional clinical medical advice because of something you have read on this application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Emergency Situations</h2>
          <p>
            If you think you may have a medical emergency, call your local emergency service (e.g. 112 / 911 / 108) or go to the nearest emergency department immediately. Do not rely on HealthWise AI for urgent medical care.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Limitation of Liability</h2>
          <p>
            The creators, developers, and institutions hosting HealthWise AI assume no legal liability or responsibility for any direct, indirect, or consequential damages resulting from the use or interpretation of information delivered by this application.
          </p>
        </section>
      </div>
    </div>
  );
};
