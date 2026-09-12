import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Activity,
  ArrowRight,
  ShieldCheck,
  Bookmark as BookmarkIcon,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { diseaseService } from '../services/diseases/disease-service';
import { Disease } from '../types/database';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTranslation } from '../hooks/useTranslation';

export const DiseasesPage: React.FC = () => {
  const { t } = useTranslation();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { isBookmarked, toggle } = useBookmarks();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [diseaseList, categoryList] = await Promise.all([
          diseaseService.getDiseases(),
          diseaseService.getCategories(),
        ]);
        setDiseases(diseaseList);
        setCategories(categoryList);
      } catch (err) {
        console.error('[DiseasesPage] Failed loading diseases:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = diseases.filter((d) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.overview.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.symptoms.some((s) => s.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === 'All' || d.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleBookmarkToggle = async (e: React.MouseEvent, d: Disease) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle({
      resource_type: 'disease',
      resource_id: d.slug,
      title: d.name,
      url: `/diseases/${d.slug}`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          {t('diseases', 'badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('diseases', 'title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          {t('diseases', 'subtitle')}
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('diseases', 'searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> {t('diseases', 'filterBy')}
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Diseases Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
            <span className="text-xs">Loading clinical disease directory...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const saved = isBookmarked('disease', item.slug);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <button
                      onClick={(e) => handleBookmarkToggle(e, item)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        saved
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={saved ? 'Remove Bookmark' : 'Save Bookmark'}
                      aria-label={saved ? 'Remove Bookmark' : 'Save Bookmark'}
                    >
                      <BookmarkIcon className={`w-4 h-4 ${saved ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {item.overview}
                  </p>

                  {/* Common Symptoms preview */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {t('diseases', 'keySigns')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.symptoms.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]"
                        >
                          {s}
                        </span>
                      ))}
                      {item.symptoms.length > 3 && (
                        <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200">
                          +{item.symptoms.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[170px]" title={item.source_name || 'WHO'}>
                      {item.source_name || 'World Health Organization (WHO)'}
                    </span>
                    <Badge variant="success" size="sm">{t('diseases', 'whoGrounded')}</Badge>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      to={`/diseases/${item.slug}`}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group/link"
                    >
                      <span>{t('diseases', 'readGuide')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to={`/chat?prompt=Tell me about ${encodeURIComponent(item.name)} symptoms, warning signs, and prevention`}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 transition-colors"
                      title="Ask HealthWise AI about this condition"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>{t('diseases', 'askAI')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">{t('diseases', 'noResults')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('diseases', 'noResultsDesc')}</p>
        </div>
      )}
    </div>
  );
};
