import React from 'react';
import { Shield, Lock, EyeOff, UserX, Database } from 'lucide-react';
import { Card } from '../components/common/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: September 2025 • HealthWise AI Educational Platform</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Our Commitment to Health Data Privacy</h2>
          <p>
            HealthWise AI treats health-related queries with the highest standard of confidentiality. As an educational public health service, our architectural objective is data minimization: we do not construct medical records, do not track clinical identities, and do not sell data to advertisers or insurers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>Account Metadata:</strong> If you register, we store your email address and preferred display name via Supabase Auth.</li>
            <li><strong>Conversational History:</strong> Saved chat logs are stored strictly under your authenticated user ID protected by Supabase Row Level Security (RLS). Anonymous users have ephemeral, session-only in-memory storage.</li>
            <li><strong>Aggregated Telemetry:</strong> Anonymized counts of health topics queried (e.g. number of inquiries about dengue prevention) to assess educational effectiveness. No personally identifiable medical traits are attached.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Artificial Intelligence Engine (Puter.js)</h2>
          <p>
            Conversational completions are processed through Puter.js in accordance with Puter's privacy and user-pays model. User queries are not used to train proprietary third-party commercial medical models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Your Right to Delete</h2>
          <p>
            You can delete your conversation history at any time through your Profile preferences. Upon request, all associated session records are permanently deleted from the database.
          </p>
        </section>
      </div>
    </div>
  );
};
