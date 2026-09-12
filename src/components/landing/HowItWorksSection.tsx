import React from 'react';
import { MessageSquare, Database, Cpu, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      step: '01',
      title: t('home', 'howStep1Title'),
      desc: t('home', 'howStep1Desc'),
      icon: MessageSquare,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      step: '02',
      title: t('home', 'howStep2Title'),
      desc: t('home', 'howStep2Desc'),
      icon: ShieldAlert,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      step: '03',
      title: t('home', 'howStep3Title'),
      desc: t('home', 'howStep3Desc'),
      icon: Database,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      step: '04',
      title: t('home', 'howStep4Title'),
      desc: t('home', 'howStep4Desc'),
      icon: Cpu,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      step: '05',
      title: t('home', 'howStep5Title'),
      desc: t('home', 'howStep5Desc'),
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {t('home', 'howBadge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('home', 'howTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t('home', 'howDesc')}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between hover:border-teal-300 hover:shadow-sm transition-all relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-teal-200 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-teal-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t('home', 'howVerifiedStep')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
