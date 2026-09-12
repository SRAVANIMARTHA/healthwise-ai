import React from 'react';
import { Heart, Apple, Moon, Brain, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';

export const HealthyHabitsPage: React.FC = () => {
  const pillars = [
    {
      title: 'Nutritional Balance & Metabolic Wellness',
      icon: Apple,
      badge: 'Dietary Guidelines',
      points: [
        'Prioritize whole grains, legumes, colorful vegetables, and dietary fiber (≥ 30g/day) to moderate blood glucose spikes.',
        'Adopt the DASH diet principles (Dietary Approaches to Stop Hypertension): lower sodium (< 2000mg/day) and elevate potassium.',
        'Limit ultra-processed foods rich in trans fats, refined sugars, and high-fructose corn syrup.',
        'Stay adequately hydrated: consume 2 to 3 liters of clean water daily.',
      ],
    },
    {
      title: 'Physical Activity & Cardiorespiratory Fitness',
      icon: Activity,
      badge: 'WHO Guidelines',
      points: [
        'Engage in at least 150–300 minutes of moderate-intensity aerobic physical activity per week (or 75–150 min vigorous).',
        'Incorporate muscle-strengthening activities involving major muscle groups on 2 or more days a week.',
        'Break up prolonged sedentary periods with brief 2-minute standing or walking breaks every 45 minutes.',
      ],
    },
    {
      title: 'Restorative Sleep Hygiene',
      icon: Moon,
      badge: 'Circadian Biology',
      points: [
        'Target 7 to 9 hours of uninterrupted sleep for adults; consistent bedtimes support immune function and cognitive repair.',
        'Limit blue light emissions from mobile screens, tablets, and laptops at least 60 minutes prior to sleep.',
        'Maintain a cool, quiet, and dark sleep environment to promote natural melatonin secretion.',
      ],
    },
    {
      title: 'Mental Health & Stress Regulation',
      icon: Brain,
      badge: 'Psychological Well-being',
      points: [
        'Recognize the physiological impacts of chronic cortisol: elevated blood pressure, impaired glucose regulation, and immunosuppression.',
        'Practice daily diaphragmatic breathing, mindfulness, or regular physical recreation to reduce sympathetic tone.',
        'Maintain social connectivity with supportive family, friends, or community networks.',
        'Seek professional psychological or psychiatric care when persistent anxiety, low mood, or exhaustion impairs function.',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Lifestyle Medicine
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Healthy Habits & Preventive Wellness
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Up to 80% of premature cardiovascular diseases and type 2 diabetes are preventable through evidence-based dietary, physical activity, and sleep interventions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <Card key={idx} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="primary">{p.badge}</Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3">{p.title}</h3>

                <div className="space-y-2.5">
                  {p.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0 mt-2"></span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Clinical Consensus</span>
                <Link
                  to={`/chat?prompt=Give me evidence-based tips on ${encodeURIComponent(p.title)}`}
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
