import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Alert Box in Footer */}
        <div className="bg-rose-950/60 border border-rose-800/60 rounded-2xl p-4 sm:p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-white font-semibold text-sm">{t('footer', 'emergencyWarningTitle')}</h5>
              <p className="text-rose-200/90 text-xs sm:text-sm mt-0.5">
                {t('footer', 'emergencyWarningText')}
              </p>
            </div>
          </div>
          <Link
            to="/resources#emergency"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-900/50 hover:bg-rose-900 px-3.5 py-2 rounded-xl transition-colors border border-rose-700/50 flex-shrink-0"
          >
            {t('footer', 'emergencyContactsBtn')}
          </Link>
        </div>

        {/* 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">HealthWise AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footer', 'brandDesc')}
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('footer', 'evidenceBasedEducation')}</span>
            </div>
          </div>

          {/* Col 2: Education & Tools */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">{t('footer', 'exploreHealth')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/chat" className="hover:text-teal-400 transition-colors">{t('footer', 'aiChatbot')}</Link>
              </li>
              <li>
                <Link to="/diseases" className="hover:text-teal-400 transition-colors">{t('footer', 'diseaseExplorer')}</Link>
              </li>
              <li>
                <Link to="/prevention" className="hover:text-teal-400 transition-colors">{t('footer', 'preventionGuides')}</Link>
              </li>
              <li>
                <Link to="/vaccination" className="hover:text-teal-400 transition-colors">{t('footer', 'vaccinationSchedules')}</Link>
              </li>
              <li>
                <Link to="/healthy-habits" className="hover:text-teal-400 transition-colors">{t('footer', 'healthyHabits')}</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Trusted Sources */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">{t('footer', 'trustedSources')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.who.int" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                  World Health Organization (WHO) <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://www.cdc.gov" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                  CDC (Centers for Disease Control) <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://www.mohfw.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors flex items-center gap-1">
                  MoHFW (Govt. of India) <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <Link to="/resources" className="hover:text-teal-400 transition-colors">{t('footer', 'verifiedDirectory')}</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Compliance */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">{t('footer', 'platformSafety')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors">{t('footer', 'aboutProject')}</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-teal-400 transition-colors">{t('footer', 'privacyPolicy')}</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-teal-400 transition-colors">{t('footer', 'termsOfService')}</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-teal-400 transition-colors text-slate-500">{t('nav', 'admin')}</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer banner inside footer */}
        <div className="border-t border-slate-800 pt-6 text-[11px] text-slate-500 text-center sm:text-left space-y-2">
          <p className="leading-relaxed">
            <strong className="text-slate-400">Strict Non-Diagnostic Notice:</strong> {t('footer', 'disclaimer')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
            <p>© {new Date().getFullYear()} HealthWise AI. {t('footer', 'allRightsReserved')}</p>
            <p className="text-[11px] text-slate-500">Powered by Puter.js AI & Supabase</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
