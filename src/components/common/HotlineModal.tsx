import React, { useState, useEffect } from 'react';
import { X, Phone, HeartPulse, ShieldAlert, LifeBuoy, Search, ExternalLink } from 'lucide-react';
import { EMERGENCY_HOTLINES, EmergencyContact } from '../../services/safety/safety-service';
import { useTranslation } from '../../hooks/useTranslation';

interface HotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotlineModal: React.FC<HotlineModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredHotlines = EMERGENCY_HOTLINES.filter((h) =>
    h.region.toLowerCase().includes(search.toLowerCase()) ||
    h.countryCode.toLowerCase().includes(search.toLowerCase()) ||
    h.helplineName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hotline-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="hotline-modal-title" className="font-bold text-base sm:text-lg">
                {t('common', 'hotlinesDirectoryTitle')}
              </h2>
              <p className="text-xs text-rose-100">
                {t('common', 'hotlinesDirectoryDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Notice Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common', 'searchHotlines')}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-rose-50/70 border border-rose-200/60 rounded-xl p-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Critical Notice:</strong> If you are experiencing life-threatening symptoms, chest pain, difficulty breathing, or suicidal thoughts, disconnect from this chatbot immediately and dial your local emergency provider.
            </p>
          </div>
        </div>

        {/* Hotline List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100">
          {filteredHotlines.map((contact) => (
            <div key={contact.countryCode} className="pt-3.5 first:pt-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {contact.region}
                  </span>
                  <span className="bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold px-2 py-0.5 rounded">
                    {contact.countryCode}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Emergency Services */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    Police & Emergency
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-base">{contact.emergency}</span>
                    <a
                      href={`tel:${contact.emergency}`}
                      className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{t('common', 'callHotline')}</span>
                    </a>
                  </div>
                </div>

                {/* Ambulance */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    Ambulance / Medical
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-base">{contact.ambulance}</span>
                    <a
                      href={`tel:${contact.ambulance}`}
                      className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{t('common', 'callHotline')}</span>
                    </a>
                  </div>
                </div>

                {/* Mental Health / Crisis */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider truncate" title={contact.helplineName}>
                    Crisis / Mental Health
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs truncate max-w-[110px]" title={contact.crisisHelpline}>
                      {contact.crisisHelpline}
                    </span>
                    <a
                      href={`tel:${contact.crisisHelpline.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm transition-colors"
                    >
                      <LifeBuoy className="w-3 h-3" />
                      <span>Helpline</span>
                    </a>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 italic">
                {contact.helplineName}
              </p>
            </div>
          ))}

          {filteredHotlines.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No hotline found matching "{search}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center flex items-center justify-between text-xs text-slate-500">
          <span>Global standard emergency GSM number: <strong>112</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
