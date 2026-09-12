import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: t('home', 'faqQ1'),
      a: t('home', 'faqA1'),
    },
    {
      q: t('home', 'faqQ2'),
      a: t('home', 'faqA2'),
    },
    {
      q: t('home', 'faqQ3'),
      a: t('home', 'faqA3'),
    },
    {
      q: t('home', 'faqQ4'),
      a: t('home', 'faqA4'),
    },
    {
      q: t('home', 'faqQ5'),
      a: t('home', 'faqA5'),
    },
    {
      q: t('home', 'faqQ6'),
      a: t('home', 'faqA6'),
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {t('home', 'faqBadge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('home', 'faqTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            {t('home', 'faqDesc')}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
