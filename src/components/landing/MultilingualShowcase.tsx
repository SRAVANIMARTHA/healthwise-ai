import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const MultilingualShowcase: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'en' | 'te' | 'hi'>('en');

  const samples = {
    en: {
      lang: 'English',
      native: 'English',
      question: 'How do I protect my family from dengue mosquito bites?',
      answer: 'Use DEET-based mosquito repellent, install window screens, eliminate standing water in flowerpots or containers where Aedes mosquitoes breed, and wear long-sleeved light-colored clothing.',
      disclaimer: 'This is educational health information. For symptoms, seek professional medical care.',
    },
    te: {
      lang: 'Telugu',
      native: 'తెలుగు',
      question: 'డెంగ్యూ దోమల కాటు నుండి నా కుటుంబాన్ని ఎలా కాపాడుకోవాలి?',
      answer: 'దోమల నివారణ మందులు (DEET) వాడండి, కిటికీలకు నెట్లు అమర్చండి, పూలకుండీలు మరియు నీటి తొట్లలో నీరు నిల్వ ఉండకుండా చూడండి (ఇక్కడ ఏడిస్ దోమలు గుడ్లు పెడతాయి), మరియు శరీరం పూర్తిగా కప్పి ఉంచే లేత రంగు దుస్తులు ధరించండి.',
      disclaimer: 'ఇది కేవలం విద్యాపరమైన ఆరోగ్య సమాచారం. లక్షణాలు ఉంటే వెంటనే వైద్యుడిని సంప్రదించండి.',
    },
    hi: {
      lang: 'Hindi',
      native: 'हिन्दी',
      question: 'डेंगू मच्छरों के काटने से अपने परिवार को कैसे बचाएं?',
      answer: 'मच्छर भगाने वाले उपाय (DEET) का प्रयोग करें, खिड़कियों पर जाली लगाएं, गमलों या बर्तनों में जमा पानी को तुरंत हटाएं जहां एडीज मच्छर पनपते हैं, और पूरे शरीर को ढंकने वाले हल्के रंग के कपड़े पहनें।',
      disclaimer: 'यह केवल शैक्षिक स्वास्थ्य जानकारी है। लक्षण होने पर योग्य चिकित्सक से परामर्श लें।',
    },
  };

  const current = samples[activeTab];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {t('home', 'multiBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('home', 'multiTitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {t('home', 'multiDesc')}
            </p>

            <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>English:</strong> {t('home', 'multiPointEn')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>తెలుగు (Telugu):</strong> {t('home', 'multiPointTe')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>हिन्दी (Hindi):</strong> {t('home', 'multiPointHi')}</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Language Preview */}
          <div className="lg:col-span-6">
            <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
              {/* Language Tabs */}
              <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
                {(['en', 'te', 'hi'] as const).map((code) => (
                  <button
                    key={code}
                    onClick={() => setActiveTab(code)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      activeTab === code
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{samples[code].native}</span>
                    <span className="opacity-70 text-[10px]">({samples[code].lang})</span>
                  </button>
                ))}
              </div>

              {/* Chat Demo Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-inner space-y-4">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="bg-teal-600 text-white text-xs sm:text-sm p-3 rounded-2xl rounded-tr-sm max-w-[90%] shadow-sm">
                    {current.question}
                  </div>
                </div>

                {/* AI Grounded Output */}
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-200/80 text-slate-800 text-xs sm:text-sm p-4 rounded-2xl rounded-tl-sm max-w-[95%] space-y-2">
                    <p className="leading-relaxed font-normal">{current.answer}</p>
                    <div className="bg-teal-50/70 border border-teal-200/70 rounded-lg p-2 text-[11px] text-teal-800 font-medium">
                      🛡️ {current.disclaimer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
