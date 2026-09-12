import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bookmark as BookmarkIcon,
  BookOpen,
  Trash2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAuth } from '../hooks/useAuth';

export const BookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { bookmarks, isLoading, remove } = useBookmarks();

  const [activeTab, setActiveTab] = useState<'all' | 'disease' | 'document' | 'external_resource'>('all');
  const [search, setSearch] = useState('');

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesTab = activeTab === 'all' || b.resource_type === activeTab;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || b.title.toLowerCase().includes(q) || (b.url && b.url.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  const totalCount = bookmarks.length;
  const diseaseCount = bookmarks.filter((b) => b.resource_type === 'disease').length;
  const docCount = bookmarks.filter((b) => b.resource_type === 'document').length;
  const resCount = bookmarks.filter((b) => b.resource_type === 'external_resource').length;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'disease':
        return 'Disease Guide';
      case 'document':
        return 'Knowledge Document';
      case 'external_resource':
        return 'External Resource';
      default:
        return 'Resource';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Saved Health Resources</h1>
            <Badge variant="primary" size="sm">
              {totalCount} {totalCount === 1 ? 'Saved Item' : 'Saved Items'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quick personal access to bookmarked disease fact sheets, clinical prevention guides, and official health links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/diseases')}
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
          >
            Explore Diseases
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/resources')}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Resources
          </Button>
        </div>
      </div>

      {/* Toolbar: Search and Category Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter saved bookmarks by title..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('disease')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'disease'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diseases ({diseaseCount})
            </button>
            <button
              onClick={() => setActiveTab('external_resource')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'external_resource'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              External Resources ({resCount})
            </button>
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
            <span className="text-xs">Loading saved bookmarks...</span>
          </div>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
            <BookmarkIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">No Bookmarks Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || activeTab !== 'all'
                ? 'No saved bookmarks match your current search or tab filter.'
                : 'You have not bookmarked any disease guides or health resources yet. Browse the directory and click the bookmark icon to save topics.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/diseases')}
              leftIcon={<BookOpen className="w-3.5 h-3.5" />}
            >
              Browse Disease Explorer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/resources')}
            >
              View Trusted Resources
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookmarks.map((bm) => {
            const isDisease = bm.resource_type === 'disease';
            const targetUrl = isDisease ? `/diseases/${bm.resource_id}` : (bm.url || '#');
            const isExternal = !isDisease && !!bm.url && bm.url.startsWith('http');

            return (
              <div
                key={bm.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-md border border-teal-200/60">
                      {getResourceTypeLabel(bm.resource_type)}
                    </span>
                    <button
                      onClick={() => remove(bm.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove from bookmarks"
                      aria-label="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1 hover:text-teal-700 transition-colors">
                    {bm.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Saved on {formatDate(bm.created_at)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  {isExternal ? (
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <span>Visit Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      to={targetUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors group"
                    >
                      <span>Read Clinical Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}

                  {isDisease && (
                    <Link
                      to={`/chat?prompt=Tell me about ${encodeURIComponent(bm.title)} symptoms, warning signs, and prevention`}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 transition-colors"
                      title="Consult AI about this saved condition"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>Ask AI</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="text-center text-[11px] text-slate-400 pt-2">
          <span>You are currently in guest mode. Your bookmarks are preserved in your local browser session. </span>
          <Link to="/login" className="text-teal-600 font-semibold underline underline-offset-2 hover:text-teal-700">
            Sign in to sync across devices
          </Link>
        </div>
      )}
    </div>
  );
};
