import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, ShieldCheck, Sparkles, BookOpen, HeartPulse, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTranslation } from '../../hooks/useTranslation';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const quickQuestions = [
    t('home', 'demoUserQuery'),
    "How can I prevent diabetes through diet?",
    "What vaccines are recommended for adults?",
    "When should someone with high blood pressure seek care?",
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-teal-200/20 via-emerald-100/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headings & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 text-teal-800 text-xs font-semibold tracking-wide border border-teal-200/60">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('home', 'heroBadge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {t('home', 'heroTitle')} <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                {t('home', 'heroTitleHighlight')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('home', 'heroDesc')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/chat')}
                leftIcon={<MessageSquare className="w-5 h-5" />}
                className="w-full sm:w-auto shadow-md shadow-teal-600/20"
              >
                {t('home', 'startChat')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/diseases')}
                leftIcon={<BookOpen className="w-5 h-5 text-teal-600" />}
                rightIcon={<ArrowRight className="w-4 h-4 text-slate-400" />}
                className="w-full sm:w-auto"
              >
                {t('home', 'exploreDiseases')}
              </Button>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>{t('home', 'whoCdcGrounded')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>{t('home', 'zeroHallucination')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>{t('home', 'strictSafety')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Chat Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-5 sm:p-6 space-y-4 relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-800">{t('home', 'assistantTitle')}</span>
                </div>
                <Badge variant="success" size="sm">{t('home', 'evidenceGrounded')}</Badge>
              </div>

              {/* Sample Dialog */}
              <div className="space-y-3 text-xs sm:text-sm">
                {/* User Bubble */}
                <div className="flex justify-end">
                  <div className="bg-teal-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] leading-relaxed shadow-sm">
                    {t('home', 'demoUserQuery')}
                  </div>
                </div>

                {/* AI Bubble */}
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 p-3.5 rounded-2xl rounded-tl-sm max-w-[95%] space-y-2 leading-relaxed border border-slate-200/60">
                    <p className="font-medium text-teal-900">
                      {t('home', 'demoAiResponse')}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 text-xs">
                      <li>Sudden onset high fever (40°C / 104°F)</li>
                      <li>Severe headache and pain behind the eyes</li>
                      <li>Muscle and joint pains</li>
                      <li>Nausea, vomiting, and fatigue</li>
                    </ul>
                    <div className="bg-amber-50 border-l-2 border-amber-500 p-2 text-[11px] text-amber-900 rounded">
                      ⚠️ {t('home', 'demoRedFlag')}
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                      <span>{t('home', 'demoSource')}</span>
                      <span className="text-teal-600 font-semibold">{t('home', 'educationalOnly')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('home', 'tryAsking')}</p>
                <div className="flex flex-col gap-1.5">
                  {quickQuestions.slice(0, 2).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(`/chat?prompt=${encodeURIComponent(q)}`)}
                      className="text-left text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-700 p-2 rounded-xl border border-slate-200/70 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
