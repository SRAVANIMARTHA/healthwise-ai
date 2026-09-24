/**
 * HealthWise AI — ReportUploadCard Component (Phase 18)
 *
 * Accessible drag-and-drop upload zone for medical and laboratory reports.
 * Displays supported formats (PDF, JPG, PNG), 10 MB limit notice, and session-only privacy statement.
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { reportValidatorService, MAX_REPORT_FILE_SIZE_BYTES } from '../../services/report/report-validator-service';
import { useTranslation } from '../../hooks/useTranslation';

interface ReportUploadCardProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  processingStage?: string;
}

export const ReportUploadCard: React.FC<ReportUploadCardProps> = ({
  onFileSelected,
  isProcessing,
  processingStage,
}) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeStage = processingStage || t('report', 'readingReport');

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    const valResult = await reportValidatorService.validateFile(file);
    if (!valResult.isValid) {
      setErrorMsg(valResult.error || 'Invalid file.');
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isProcessing) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Upload Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
          isProcessing
            ? 'border-teal-300 bg-teal-50/40 cursor-wait'
            : isDragOver
            ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/70 shadow-sm'
        }`}
        role="region"
        aria-label={t('report', 'uploadTitle')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={handleInputChange}
          disabled={isProcessing}
          className="hidden"
          aria-label="Choose medical report file"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-teal-100 flex items-center justify-center text-teal-700 animate-pulse">
                <FileText className="w-8 h-8" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{activeStage}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('report', 'comparingNotice')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {t('report', 'uploadTitle')}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {t('report', 'uploadSubtitle')}{' '}
                <span className="text-teal-600 font-semibold underline underline-offset-2">
                  {t('report', 'browseFiles')}
                </span>
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                {t('report', 'pdfBadge')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                {t('report', 'imgBadge')}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200/60">
                {t('report', 'maxSizeBadge')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3">
        <Lock className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">{t('report', 'privacyNotice')}</p>
          <p className="leading-relaxed text-slate-500">
            {t('report', 'privacyDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};
