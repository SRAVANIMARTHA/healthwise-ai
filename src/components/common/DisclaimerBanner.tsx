import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface DisclaimerBannerProps {
  variant?: 'banner' | 'card' | 'inline';
  dismissible?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  variant = 'banner',
  dismissible = false,
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  if (variant === 'inline') {
    return (
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-slate-700">{t('common', 'educationalNotice')}</strong> {t('common', 'educationalNoticeText')}
        </p>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 leading-relaxed">
          <h4 className="font-semibold text-amber-950 mb-1">{t('common', 'importantDisclaimer')}</h4>
          <p className="text-amber-800/90 text-xs sm:text-sm">
            {t('common', 'importantDisclaimerText')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-teal-50 px-4 py-2 text-xs sm:text-sm shadow-inner relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
          <ShieldCheck className="w-4 h-4 text-teal-300 flex-shrink-0" />
          <p className="text-center sm:text-left text-teal-100 font-normal">
            <span className="font-semibold text-white">{t('common', 'educationalNotice')}</span> {t('common', 'educationalNoticeText')}
          </p>
        </div>
        {dismissible && (
          <button
            onClick={() => setVisible(false)}
            className="text-teal-300 hover:text-white transition-colors p-1"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
