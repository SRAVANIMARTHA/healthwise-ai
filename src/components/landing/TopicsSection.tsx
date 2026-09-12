import React from 'react';
import { Link } from 'react-router-dom';
import { Bug, Activity, Heart, Wind, Droplets, ShieldPlus, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useTranslation } from '../../hooks/useTranslation';

export const TopicsSection: React.FC = () => {
  const { t } = useTranslation();

  const topics = [
    {
      name: t('home', 'topicDengueName'),
      slug: 'dengue',
      category: t('home', 'topicDengueCategory'),
      desc: t('home', 'topicDengueDesc'),
      icon: Bug,
      badge: t('home', 'topicDengueBadge'),
      badgeVariant: 'warning' as const,
    },
    {
      name: t('home', 'topicDiabetesName'),
      slug: 'diabetes',
      category: t('home', 'topicDiabetesCategory'),
      desc: t('home', 'topicDiabetesDesc'),
      icon: Activity,
      badge: t('home', 'topicDiabetesBadge'),
      badgeVariant: 'primary' as const,
    },
    {
      name: t('home', 'topicHypertensionName'),
      slug: 'hypertension',
      category: t('home', 'topicHypertensionCategory'),
      desc: t('home', 'topicHypertensionDesc'),
      icon: Heart,
      badge: t('home', 'topicHypertensionBadge'),
      badgeVariant: 'danger' as const,
    },
    {
      name: t('home', 'topicInfluenzaName'),
      slug: 'influenza',
      category: t('home', 'topicInfluenzaCategory'),
      desc: t('home', 'topicInfluenzaDesc'),
      icon: Wind,
      badge: t('home', 'topicInfluenzaBadge'),
      badgeVariant: 'info' as const,
    },
    {
      name: t('home', 'topicHygieneName'),
      slug: 'hygiene',
      category: t('home', 'topicHygieneCategory'),
      desc: t('home', 'topicHygieneDesc'),
      icon: Droplets,
      badge: t('home', 'topicHygieneBadge'),
      badgeVariant: 'success' as const,
    },
    {
      name: t('home', 'topicVaccineName'),
      slug: 'vaccination',
      category: t('home', 'topicVaccineCategory'),
      desc: t('home', 'topicVaccineDesc'),
      icon: ShieldPlus,
      badge: t('home', 'topicVaccineBadge'),
      badgeVariant: 'neutral' as const,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {t('home', 'topicsBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              {t('home', 'topicsTitle')}
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mt-1">
              {t('home', 'topicsDesc')}
            </p>
          </div>
          <Link
            to="/diseases"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 group flex-shrink-0"
          >
            <span>{t('home', 'topicsViewAll')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200/80 hover:border-teal-300 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-700 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={item.badgeVariant} size="sm">{item.badge}</Badge>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{item.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <Link
                    to={`/diseases/${item.slug}`}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    {t('home', 'topicReadGuide')} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/chat?prompt=Tell me about ${encodeURIComponent(item.name)}`}
                    className="text-xs text-slate-500 hover:text-teal-600 font-medium"
                  >
                    {t('chat', 'askAI')} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
