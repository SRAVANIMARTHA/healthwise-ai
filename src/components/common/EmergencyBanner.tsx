import React from 'react';
import { AlertCircle, PhoneCall, Globe, X } from 'lucide-react';
import { EMERGENCY_HOTLINES } from '../../services/safety/safety-service';
import { useTranslation } from '../../hooks/useTranslation';

interface EmergencyBannerProps {
  onOpenHotlines?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  title?: string;
  message?: string;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  onOpenHotlines,
  onDismiss,
  dismissible = true,
  title = 'Immediate Medical Emergency Advisory',
  message = 'If you or someone near you is experiencing severe symptoms, please call local emergency services immediately.',
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 text-white rounded-2xl p-3.5 sm:p-4 shadow-lg border border-rose-500/50 mb-3 animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base tracking-tight text-white">{title}</h3>
              <span className="bg-white/25 text-white uppercase text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full">
                {t('common', 'zeroLatencyEscalation')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-rose-100 leading-relaxed max-w-2xl">
              {message}
            </p>

            {/* Direct Quick Dial Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 bg-white text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 112 (Universal / India / EU)</span>
              </a>
              <a
                href="tel:911"
                className="inline-flex items-center gap-1.5 bg-rose-900/60 hover:bg-rose-900 text-white px-3 py-1.5 rounded-xl font-bold text-xs border border-rose-400/40 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 911 (US / Canada)</span>
              </a>
              <a
                href="tel:988"
                className="inline-flex items-center gap-1.5 bg-rose-900/60 hover:bg-rose-900 text-white px-3 py-1.5 rounded-xl font-semibold text-xs border border-rose-400/40 transition-all"
              >
                <span>Crisis 988 / 14416</span>
              </a>

              {onOpenHotlines && (
                <button
                  type="button"
                  onClick={onOpenHotlines}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-100 hover:text-white underline underline-offset-2 ml-1 font-medium transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t('common', 'allHotlines')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-rose-200 hover:text-white p-1 rounded-lg transition-colors flex-shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
