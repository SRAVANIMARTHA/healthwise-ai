import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare,
  Bookmark as BookmarkIcon,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { diseaseService } from '../services/diseases/disease-service';
import { Disease } from '../types/database';
import { useBookmarks } from '../hooks/useBookmarks';

export const DiseaseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [disease, setDisease] = useState<Disease | null>(null);
  const [relatedDiseases, setRelatedDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { isBookmarked, toggle } = useBookmarks();

  useEffect(() => {
    async function loadDisease() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const found = await diseaseService.getDiseaseBySlug(slug);
        setDisease(found);

        if (found) {
          const all = await diseaseService.getDiseases();
          const related = all
            .filter((d) => d.category === found.category && d.slug !== found.slug)
            .slice(0, 3);
          setRelatedDiseases(related);
        }
      } catch (err) {
        console.error('[DiseaseDetailPage] Error loading disease:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDisease();
  }, [slug]);

  const saved = disease ? isBookmarked('disease', disease.slug) : false;

  const handleBookmarkToggle = async () => {
    if (!disease) return;
    await toggle({
      resource_type: 'disease',
      resource_id: disease.slug,
      title: disease.name,
      url: `/diseases/${disease.slug}`,
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
          <span className="text-xs text-slate-500">Loading clinical health guide...</span>
        </div>
      </div>
    );
  }

  if (!disease) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Disease Guide Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested health guide could not be located in the clinical directory.
        </p>
        <Button size="sm" onClick={() => navigate('/diseases')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Disease Explorer
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Back button and quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/diseases')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Disease Explorer
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={saved ? 'primary' : 'outline'}
            onClick={handleBookmarkToggle}
            leftIcon={<BookmarkIcon className={`w-3.5 h-3.5 ${saved ? 'fill-white' : ''}`} />}
          >
            {saved ? 'Bookmarked' : 'Bookmark Guide'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          >
            {copied ? 'Link Copied' : 'Share'}
          </Button>

          <Link
            to={`/chat?prompt=Tell me about ${encodeURIComponent(disease.name)} symptoms, warning signs, and prevention`}
          >
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-600" />}
            >
              Ask AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200">
            {disease.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Reviewed: {disease.last_reviewed}</span>
          </div>
          <Badge variant="success" size="sm" className="hidden sm:inline-flex">
            WHO Grounded
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {disease.name}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
          {disease.overview}
        </p>

        {/* Source link badge */}
        {disease.source_url && (
          <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Official Clinical Authority:</span>
            <a
              href={disease.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-semibold hover:underline"
            >
              <span>{disease.source_name || 'World Health Organization (WHO)'}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        )}
      </div>

      {/* Main Clinical Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symptoms Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Recognized Clinical Symptoms</h2>
              <p className="text-[11px] text-slate-500">Typical indicators documented in health criteria</p>
            </div>
          </div>
          <ul className="space-y-2.5 pt-1">
            {disease.symptoms.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-normal">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Warning Signs (Red-Flags) */}
        <div className="bg-gradient-to-br from-rose-50/60 to-red-50/40 rounded-2xl p-6 border border-rose-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-200/60">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-rose-950 text-base">Emergency Warning Signs (Red-Flags)</h2>
              <p className="text-[11px] text-rose-700">Critical indicators demanding urgent hospital care</p>
            </div>
          </div>
          <ul className="space-y-2.5 pt-1">
            {disease.warning_signs.map((ws, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-900 leading-normal font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{ws}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Factors */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Risk Factors & Vulnerability</h2>
              <p className="text-[11px] text-slate-500">Conditions elevating transmission or severity</p>
            </div>
          </div>
          <ul className="space-y-2.5 pt-1">
            {disease.risk_factors.map((rf, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2"></span>
                <span>{rf}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prevention & Protection */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Evidence-Based Prevention</h2>
              <p className="text-[11px] text-slate-500">WHO-recommended preventive protocols</p>
            </div>
          </div>
          <ul className="space-y-2.5 pt-1">
            {disease.prevention.map((prev, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0 mt-2"></span>
                <span>{prev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* When to Seek Care Alert Box */}
      <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-6 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-bold text-amber-950 text-sm sm:text-base">
            When to Seek Immediate Medical Evaluation
          </h3>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            {disease.when_to_seek_care}
          </p>
        </div>
      </div>

      {/* AI Assistance CTA Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
            Interactive AI Health Consultation
          </span>
          <h3 className="text-lg sm:text-xl font-bold">
            Have questions about {disease.name}?
          </h3>
          <p className="text-xs sm:text-sm text-teal-100 max-w-lg">
            Ask our WHO-grounded AI assistant about symptoms, risk reduction, or when to schedule a clinical visit.
          </p>
        </div>
        <Link
          to={`/chat?prompt=I would like to learn more about ${encodeURIComponent(disease.name)}. What are the most important things to know?`}
          className="flex-shrink-0"
        >
          <Button
            size="lg"
            variant="primary"
            className="bg-white text-teal-900 hover:bg-teal-50 shadow-md font-bold text-sm"
            rightIcon={<Sparkles className="w-4 h-4 text-teal-700" />}
          >
            Start Conversation
          </Button>
        </Link>
      </div>

      {/* Related Diseases in Category */}
      {relatedDiseases.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-slate-900">
            Related {disease.category} Conditions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedDiseases.map((rel) => (
              <Link
                key={rel.slug}
                to={`/diseases/${rel.slug}`}
                className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-teal-300 hover:shadow-sm transition-all group block"
              >
                <span className="text-[10px] font-semibold text-teal-600 block mb-1">
                  {rel.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                  {rel.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {rel.overview}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
