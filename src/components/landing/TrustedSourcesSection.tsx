import React from 'react';
import { ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const TrustedSourcesSection: React.FC = () => {
  const { t } = useTranslation();

  const sources = [
    {
      name: 'World Health Organization (WHO)',
      short: 'WHO',
      type: t('home', 'sourceWhoType'),
      description: t('home', 'sourceWhoDesc'),
      url: 'https://www.who.int',
      coverage: t('home', 'sourceWhoCoverage'),
    },
    {
      name: 'Centers for Disease Control and Prevention (CDC)',
      short: 'CDC',
      type: t('home', 'sourceCdcType'),
      description: t('home', 'sourceCdcDesc'),
      url: 'https://www.cdc.gov',
      coverage: t('home', 'sourceCdcCoverage'),
    },
    {
      name: 'Ministry of Health and Family Welfare (MoHFW)',
      short: 'MoHFW India',
      type: t('home', 'sourceMohfwType'),
      description: t('home', 'sourceMohfwDesc'),
      url: 'https://www.mohfw.gov.in',
      coverage: t('home', 'sourceMohfwCoverage'),
    },
    {
      name: 'National Health Service (NHS)',
      short: 'NHS UK',
      type: t('home', 'sourceNhsType'),
      description: t('home', 'sourceNhsDesc'),
      url: 'https://www.nhs.uk/conditions/',
      coverage: t('home', 'sourceNhsCoverage'),
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {t('home', 'sourcesBadge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('home', 'sourcesTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t('home', 'sourcesDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {sources.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {s.type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-2">{s.name}</h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {s.description}
                </p>

                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 space-y-1 mb-4">
                  <span className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider block">
                    {t('home', 'sourceCuratedAreas')}
                  </span>
                  <p className="text-slate-600 text-xs">{s.coverage}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('home', 'sourceAudited')}</span>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {t('home', 'sourceVisitPortal')} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
