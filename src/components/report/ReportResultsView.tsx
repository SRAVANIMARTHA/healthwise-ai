import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { ReportAnalysisResult, ReportTestFinding, TestFindingFlag } from '../../types/report';
import { NearbyHealthcarePanel } from '../healthcare/NearbyHealthcarePanel';
import { useTranslation } from '../../hooks/useTranslation';

interface ReportResultsViewProps {
  result: ReportAnalysisResult;
  onUploadAnother: () => void;
}

export const ReportResultsView: React.FC<ReportResultsViewProps> = ({
  result,
  onUploadAnother,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'outside' | 'within'>('all');
  const [showHealthcare, setShowHealthcare] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});

  const toggleFinding = (id: string) => {
    setExpandedFindings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter findings
  const displayedFindings = result.findings.filter((f) => {
    if (filter === 'outside') return f.flag === 'low' || f.flag === 'high' || f.flag === 'abnormal';
    if (filter === 'within') return f.flag === 'normal';
    return true;
  });

  // Attention badge styles
  const getAttentionBadge = (level: string) => {
    switch (level) {
      case 'prompt_attention':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" />,
          label: t('report', 'attentionPrompt'),
        };
      case 'discuss_with_doctor':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          label: t('report', 'attentionDiscuss'),
        };
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: t('report', 'attentionInfo'),
        };
    }
  };

  const badgeConfig = getAttentionBadge(result.medicalAttentionLevel);

  // Status badge for individual tests (color-independent with text + icons)
  const getFindingFlagBadge = (flag: TestFindingFlag) => {
    switch (flag) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <ArrowDownRight className="w-3.5 h-3.5 text-amber-700" />
            {t('report', 'belowRangeBadge')}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-700" />
            {t('report', 'aboveRangeBadge')}
          </span>
        );
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            {t('report', 'withinRangeBadge')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            {t('report', 'reviewedBadge')}
          </span>
        );
    }
  };

  // Follow-up chat prompt
  const handleAskFollowUp = (testName?: string) => {
    const prompt = testName
      ? `I uploaded a medical report where my ${testName} is ${result.findings.find(f => f.testName === testName)?.value} ${result.findings.find(f => f.testName === testName)?.unit}. What does this mean and what questions should I ask my doctor?`
      : `I uploaded my lab report (${result.fileName}). What do my outside-range results mean and what should I discuss with my doctor?`;
    navigate(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {t('report', 'analysisComplete')}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {result.fileName}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(result.analyzedAt).toLocaleDateString()} • {t('report', 'sessionReview')}
            </p>
          </div>

          <button
            onClick={onUploadAnother}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors self-start sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('report', 'uploadAnother')}</span>
          </button>
        </div>

        {/* Attention Level Banner */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${badgeConfig.bg}`}>
          <div className="mt-0.5 flex-shrink-0">{badgeConfig.icon}</div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold">{badgeConfig.label}</h4>
            <p className="text-xs leading-relaxed opacity-90">
              {result.medicalAttentionRationale}
            </p>
          </div>
        </div>

        {/* Executive Summary - Fully auto-expanding, zero character clipping */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2.5 h-auto overflow-visible">
          <p className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
            <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
            {t('report', 'executiveSummaryTitle')}
          </p>
          <div className="text-slate-800 leading-relaxed whitespace-pre-line break-words text-xs sm:text-sm">
            {result.executiveSummary}
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-2xl font-black text-slate-800">{result.totalTestsReviewed}</span>
            <span className="text-[11px] font-medium text-slate-500 block mt-0.5">{t('report', 'testsReviewed')}</span>
          </div>
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-center">
            <span className="text-2xl font-black text-emerald-700">{result.withinRangeCount}</span>
            <span className="text-[11px] font-medium text-emerald-700 block mt-0.5">{t('report', 'withinRange')}</span>
          </div>
          <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100 text-center">
            <span className="text-2xl font-black text-rose-700">{result.outsideRangeCount}</span>
            <span className="text-[11px] font-medium text-rose-700 block mt-0.5">{t('report', 'outsideRange')}</span>
          </div>
          <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-100 text-center">
            <span className="text-2xl font-black text-teal-700">{result.patterns.length}</span>
            <span className="text-[11px] font-medium text-teal-700 block mt-0.5">{t('report', 'patternsNoted')}</span>
          </div>
        </div>
      </div>

      {/* Multi-Test Clinical Patterns (if detected) */}
      {result.patterns.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
              ★
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('report', 'patternsTitle')}</h3>
              <p className="text-xs text-slate-500">
                {t('report', 'patternsSubtitle')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {result.patterns.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-teal-900 text-sm">{p.name}</h4>
                  <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                    {p.matchedTests.length} {t('report', 'markersCount')}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{p.description}</p>
                <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-teal-100">
                  <strong className="text-teal-900">{t('report', 'significance')} </strong>
                  {p.clinicalSignificance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Test Findings Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('report', 'reviewedFindingsTitle')}</h3>
            <p className="text-xs text-slate-500">
              {t('report', 'reviewedFindingsSubtitle')}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('report', 'filterAll')} ({result.totalTestsReviewed})
            </button>
            <button
              onClick={() => setFilter('outside')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'outside'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              {t('report', 'filterOutside')} ({result.outsideRangeCount})
            </button>
            <button
              onClick={() => setFilter('within')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'within'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {t('report', 'filterWithin')} ({result.withinRangeCount})
            </button>
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-3">
          {displayedFindings.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">
              No tests match the selected filter.
            </p>
          ) : (
            displayedFindings.map((finding) => {
              const isExpanded = expandedFindings[finding.id];
              return (
                <div
                  key={finding.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    finding.flag === 'low' || finding.flag === 'high'
                      ? 'border-slate-200/90 bg-white hover:border-slate-300'
                      : 'border-slate-100 bg-slate-50/50'
                  }`}
                >
                  <div
                    onClick={() => toggleFinding(finding.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{finding.testName}</h4>
                        {finding.category && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {finding.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {t('report', 'reportReferenceRange')}:{' '}
                        <strong className="text-slate-700 font-semibold">
                          {finding.referenceRangeText}
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="text-base font-extrabold text-slate-900">
                          {finding.value}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">{finding.unit}</span>
                      </div>
                      {getFindingFlagBadge(finding.flag)}
                      <button className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded educational details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-slate-50/70 border-t border-slate-100 text-xs space-y-2.5">
                      {finding.whatItMeasures && (
                        <div>
                          <span className="font-bold text-slate-700 block mb-0.5">{t('report', 'whatItMeasures')}:</span>
                          <p className="text-slate-600 leading-relaxed">{finding.whatItMeasures}</p>
                        </div>
                      )}
                      {finding.explanation && (
                        <div>
                          <span className="font-bold text-slate-700 block mb-0.5">{t('report', 'clinicalContext')}:</span>
                          <p className="text-slate-600 leading-relaxed">{finding.explanation}</p>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAskFollowUp(finding.testName);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 pt-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{t('report', 'askDoctorQuestionBtn')}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Suggested Questions for Your Doctor */}
      {result.questionsForDoctor.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">{t('report', 'doctorQuestionsTitle')}</h3>
          </div>
          <p className="text-xs text-slate-500">
            {t('report', 'doctorQuestionsSubtitle')}
          </p>
          <div className="space-y-2 pt-1">
            {result.questionsForDoctor.map((q, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="pt-0.5 leading-relaxed font-medium">{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up & Healthcare Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleAskFollowUp()}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-semibold shadow-md transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('report', 'askFollowUpPrompt')}</span>
        </button>

        <button
          onClick={() => setShowHealthcare((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-sm font-semibold border border-slate-200 transition-all"
        >
          <MapPin className="w-4 h-4 text-teal-600" />
          <span>{showHealthcare ? t('report', 'hideNearbyBtn') : t('report', 'findNearbyBtn')}</span>
        </button>
      </div>

      {/* Nearby Healthcare Locator (OpenStreetMap) */}
      {showHealthcare && (
        <div className="animate-in fade-in">
          <NearbyHealthcarePanel />
        </div>
      )}

      {/* Medical Disclaimer Note */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
        <strong>Medical Educational Notice:</strong> {result.disclaimer}
      </div>
    </div>
  );
};
