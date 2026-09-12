import React from 'react';
import { ShieldCheck, Stethoscope, Heart, Syringe, Apple, AlertTriangle, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';
import { useTranslation } from '../../hooks/useTranslation';

export const CapabilitiesSection: React.FC = () => {
  const { t } = useTranslation();

  const capabilities = [
    {
      title: t('home', 'capDiseaseEduTitle'),
      desc: t('home', 'capDiseaseEduDesc'),
      icon: Stethoscope,
      accent: 'text-teal-600 bg-teal-50',
    },
    {
      title: t('home', 'capSymptomsTitle'),
      desc: t('home', 'capSymptomsDesc'),
      icon: ShieldCheck,
      accent: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: t('home', 'capPreventionTitle'),
      desc: t('home', 'capPreventionDesc'),
      icon: Heart,
      accent: 'text-rose-600 bg-rose-50',
    },
    {
      title: t('home', 'capVaccineTitle'),
      desc: t('home', 'capVaccineDesc'),
      icon: Syringe,
      accent: 'text-sky-600 bg-sky-50',
    },
    {
      title: t('home', 'capNutritionTitle'),
      desc: t('home', 'capNutritionDesc'),
      icon: Apple,
      accent: 'text-amber-600 bg-amber-50',
    },
    {
      title: t('home', 'capEmergencyTitle'),
      desc: t('home', 'capEmergencyDesc'),
      icon: AlertTriangle,
      accent: 'text-red-600 bg-red-50',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {t('home', 'capBadge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('home', 'capTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t('home', 'capDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <Card key={idx} hoverable className="flex flex-col justify-between">
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${cap.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{cap.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{cap.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('home', 'capStandard')}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
