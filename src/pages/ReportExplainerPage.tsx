/**
 * HealthWise AI — ReportExplainerPage (Phase 18)
 *
 * Dedicated page coordinating:
 * 1. Secure file upload & validation (PDF, JPG, PNG up to 10 MB)
 * 2. In-memory text/line extraction (lazy-loaded pdfjs-dist)
 * 3. Deterministic parsing and report-specific reference range comparison
 * 4. Pattern detection and medical-attention level assignment
 * 5. Grounded educational summary via Puter AI / RAG
 * 6. Interactive results view with doctor questions, follow-up chat, and OpenStreetMap nearby healthcare
 * 7. Strictly SESSION-ONLY: Discarded upon page leave or reset.
 */

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Shield, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReportUploadCard } from '../components/report/ReportUploadCard';
import { ReportResultsView } from '../components/report/ReportResultsView';
import { reportExtractorService } from '../services/report/report-extractor-service';
import { reportParserService } from '../services/report/report-parser-service';
import { reportAIService } from '../services/report/report-ai-service';
import { ReportAnalysisResult, ReportTestFinding, ReportPattern, MedicalAttentionLevel } from '../types/report';
import { useTranslation } from '../hooks/useTranslation';

interface InMemParsedState {
  findings: ReportTestFinding[];
  patterns: ReportPattern[];
  medicalAttentionLevel: MedicalAttentionLevel;
  medicalAttentionRationale: string;
  withinRangeCount: number;
  outsideRangeCount: number;
  indeterminateCount: number;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
}

export const ReportExplainerPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>(t('report', 'readingReport'));
  const [analysisResult, setAnalysisResult] = useState<ReportAnalysisResult | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [parsedState, setParsedState] = useState<InMemParsedState | null>(null);

  const currentLangRef = useRef(language);

  // Re-translate in-memory when user switches language without re-uploading
  useEffect(() => {
    if (!parsedState) {
      currentLangRef.current = language;
      return;
    }

    if (currentLangRef.current === language) return;
    currentLangRef.current = language;

    let isCancelled = false;
    const retranslateInMemory = async () => {
      setIsProcessing(true);
      setProcessingStage(t('report', 'generatingExplanation'));

      try {
        const aiSynthesis = await reportAIService.generateReportExplanation(
          parsedState.findings,
          parsedState.patterns,
          parsedState.medicalAttentionLevel,
          parsedState.fileName,
          language
        );

        if (isCancelled) return;

        const enrichedFindings = parsedState.findings.map((f) => ({
          ...f,
          explanation: aiSynthesis.findingsExplanations[f.id] || f.explanation,
        }));

        setAnalysisResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            executiveSummary: aiSynthesis.executiveSummary,
            findings: enrichedFindings,
            questionsForDoctor: aiSynthesis.doctorQuestions,
          };
        });
      } catch (err) {
        console.warn('[ReportExplainerPage] In-memory re-translation error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    retranslateInMemory();

    return () => {
      isCancelled = true;
    };
  }, [language, parsedState, t]);

  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);
    setGlobalError(null);
    setProcessingStage(t('report', 'readingReport'));

    try {
      // 1. Extraction (PDF / Image)
      const extraction = await reportExtractorService.extractReportText(file);
      if (!extraction.success) {
        throw new Error(extraction.errorMessage || t('report', 'errorTitle'));
      }

      setProcessingStage(t('report', 'analyzingFindings'));

      // 2. Parse text, compare with report reference ranges, detect patterns
      const parsed = reportParserService.parseReportText(extraction.rawText);

      // If no recognized tests could be parsed
      if (parsed.findings.length === 0) {
        if (extraction.isScannedOrEmpty) {
          throw new Error(t('report', 'scannedError'));
        } else {
          throw new Error(t('report', 'noTestsError'));
        }
      }

      // Save parsed report state in session memory for instant language switching
      const inMemState: InMemParsedState = {
        findings: parsed.findings,
        patterns: parsed.patterns,
        medicalAttentionLevel: parsed.medicalAttentionLevel,
        medicalAttentionRationale: parsed.medicalAttentionRationale,
        withinRangeCount: parsed.withinRangeCount,
        outsideRangeCount: parsed.outsideRangeCount,
        indeterminateCount: parsed.indeterminateCount,
        fileName: file.name,
        fileType: extraction.fileType,
        fileSizeBytes: file.size,
      };
      setParsedState(inMemState);

      setProcessingStage(t('report', 'generatingExplanation'));

      // 3. Grounded AI synthesis in current selected language
      const aiSynthesis = await reportAIService.generateReportExplanation(
        parsed.findings,
        parsed.patterns,
        parsed.medicalAttentionLevel,
        file.name,
        language
      );

      // Attach individual explanations
      const enrichedFindings = parsed.findings.map((f) => ({
        ...f,
        explanation: aiSynthesis.findingsExplanations[f.id] || f.explanation,
      }));

      // 4. Construct session analysis result
      const result: ReportAnalysisResult = {
        reportId: `report-${Date.now()}`,
        fileName: file.name,
        fileType: extraction.fileType,
        fileSizeBytes: file.size,
        analyzedAt: new Date().toISOString(),
        executiveSummary: aiSynthesis.executiveSummary,
        medicalAttentionLevel: parsed.medicalAttentionLevel,
        medicalAttentionRationale: parsed.medicalAttentionRationale,
        totalTestsReviewed: parsed.findings.length,
        withinRangeCount: parsed.withinRangeCount,
        outsideRangeCount: parsed.outsideRangeCount,
        indeterminateCount: parsed.indeterminateCount,
        findings: enrichedFindings,
        patterns: parsed.patterns,
        questionsForDoctor: aiSynthesis.doctorQuestions,
        disclaimer: t('report', 'disclaimerText'),
      };

      setAnalysisResult(result);
    } catch (err: any) {
      console.error('[ReportExplainerPage] Analysis error:', err);
      setGlobalError(err.message || t('report', 'errorTitle'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setParsedState(null);
    setGlobalError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-slate-200/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('report', 'back')}</span>
          </button>

          <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-full">
            {t('report', 'badge')}
          </span>
        </div>

        {/* Page Title Header (when on upload screen) */}
        {!analysisResult && (
          <div className="text-center space-y-2 py-4">
            <div className="w-14 h-14 rounded-3xl bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <FileText className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('report', 'title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              {t('report', 'subtitle')}
            </p>
          </div>
        )}

        {/* Global Error Banner */}
        {globalError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 text-xs sm:text-sm flex items-start gap-3 max-w-2xl mx-auto animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold">{t('report', 'errorTitle')}</p>
              <p className="leading-relaxed opacity-95">{globalError}</p>
              <button
                onClick={handleReset}
                className="mt-2 text-xs font-semibold text-rose-700 hover:underline"
              >
                {t('report', 'tryAnother')}
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {analysisResult ? (
          <ReportResultsView
            result={analysisResult}
            onUploadAnother={handleReset}
          />
        ) : (
          <ReportUploadCard
            onFileSelected={handleFileSelected}
            isProcessing={isProcessing}
            processingStage={processingStage}
          />
        )}
      </div>
    </div>
  );
};
