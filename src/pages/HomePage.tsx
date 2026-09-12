import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection';
import { TopicsSection } from '../components/landing/TopicsSection';
import { TrustedSourcesSection } from '../components/landing/TrustedSourcesSection';
import { MultilingualShowcase } from '../components/landing/MultilingualShowcase';
import { FAQSection } from '../components/landing/FAQSection';
import { Button } from '../components/common/Button';
import { MessageSquare, BookOpen, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Capabilities */}
      <CapabilitiesSection />

      {/* 3. Supported Health Topics */}
      <TopicsSection />

      {/* 4. How It Works (Academic Architecture) */}
      <HowItWorksSection />

      {/* 5. Trusted Sources */}
      <TrustedSourcesSection />

      {/* 6. Multilingual Access */}
      <MultilingualShowcase />

      {/* 7. Frequently Asked Questions */}
      <FAQSection />

      {/* 8. Bottom CTA Banner */}
      <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold border border-teal-700">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>{t('home', 'ctaBadge')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            {t('home', 'ctaTitle')}
          </h2>

          <p className="text-sm sm:text-base text-teal-100/90 max-w-2xl mx-auto leading-relaxed">
            {t('home', 'ctaDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/chat')}
              className="bg-white text-teal-900 hover:bg-teal-50 shadow-lg shadow-black/20 w-full sm:w-auto"
              leftIcon={<MessageSquare className="w-5 h-5 text-teal-700" />}
            >
              {t('home', 'ctaChatBtn')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/diseases')}
              className="border-teal-400/40 text-white hover:bg-teal-800/50 w-full sm:w-auto"
              leftIcon={<BookOpen className="w-5 h-5 text-teal-300" />}
            >
              {t('home', 'ctaDiseasesBtn')}
            </Button>
          </div>

          <p className="text-[11px] text-teal-200/60 pt-4">
            {t('home', 'ctaDisclaimer')}
          </p>
        </div>
      </section>
    </div>
  );
};
