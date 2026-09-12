import React from 'react';
import { ShieldCheck, Droplets, Bug, Wind, Utensils, Heart, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';

export const PreventionPage: React.FC = () => {
  const preventionModules = [
    {
      title: 'Vector-Borne Disease Control',
      target: 'Dengue, Malaria, Chikungunya',
      icon: Bug,
      badge: 'Vector Protocol',
      actions: [
        'Inspect household water containers weekly; invert or discard tyres, discarded tins, and pots.',
        'Use larvicides (such as Temephos or BTI) in domestic coolers and overhead tanks where water cannot be drained.',
        'Install insect screens on all exterior windows and doors (mesh size < 1.2 mm).',
        'Use EPA-approved insect repellents containing DEET (20-30%), Picaridin, or Oil of Lemon Eucalyptus.',
      ],
    },
    {
      title: 'Hand Hygiene & Infection Control',
      target: 'Gastroenteritis, Respiratory Viruses, Nosocomial Pathogens',
      icon: Droplets,
      badge: 'WHO WASH Standard',
      actions: [
        'Wash hands with soap and running water for at least 20 seconds at critical junctures (before food prep, after restroom).',
        'When soap is inaccessible, use alcohol-based hand rub with at least 60-70% ethanol/isopropanol.',
        'Cover coughs and sneezes into flexed elbow rather than bare palms.',
        'Sanitize frequently touched surfaces (door handles, mobile devices) during domestic infection outbreaks.',
      ],
    },
    {
      title: 'Airborne & Droplet Transmission Prevention',
      target: 'Influenza, COVID-19, RSV, Tuberculosis',
      icon: Wind,
      badge: 'Respiratory Hygiene',
      actions: [
        'Enhance indoor ventilation through cross-ventilation, opening windows, or utilizing HEPA air purifiers.',
        'Wear well-fitted surgical masks or N95 respirators in crowded or poorly ventilated public transport.',
        'Isolate symptomatic individuals in separate, well-ventilated rooms to prevent secondary household spread.',
      ],
    },
    {
      title: 'Food Safety & Water Sanitization',
      target: 'Typhoid, Cholera, Hepatitis A & E, Food Poisoning',
      icon: Utensils,
      badge: 'Food Safety Standard',
      actions: [
        'Boil drinking water vigorously for at least 1 minute or use certified reverse-osmosis UV filters.',
        'Separate raw meat, poultry, and seafood from ready-to-eat foods to avert cross-contamination.',
        'Cook foods thoroughly, especially meat, poultry, eggs, and seafood (internal temp ≥ 70°C).',
        'Keep food at safe temperatures: refrigerate perishable food promptly below 5°C.',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Public Health Guidance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Evidence-Based Disease Prevention
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Proactive prevention is the cornerstone of public health. Explore verified barrier methods, sanitation standards, and environmental hygiene protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {preventionModules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="primary">{m.badge}</Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{m.title}</h3>
                <p className="text-xs text-teal-700 font-semibold mb-4">Target: {m.target}</p>

                <div className="space-y-2.5">
                  {m.actions.map((act, aIdx) => (
                    <div key={aIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0 mt-2"></span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">WHO & CDC Consensus</span>
                <Link
                  to={`/chat?prompt=Tell me more prevention tips for ${encodeURIComponent(m.target)}`}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  Ask Chatbot <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
