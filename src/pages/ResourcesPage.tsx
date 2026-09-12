import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Phone,
  BookOpen,
  Search,
  Filter,
  Bookmark as BookmarkIcon,
  PhoneCall,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { resourceService, HealthResource } from '../services/resources/resource-service';
import { useBookmarks } from '../hooks/useBookmarks';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<HealthResource[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { isBookmarked, toggle } = useBookmarks();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [resList, catList] = await Promise.all([
          resourceService.getResources(),
          resourceService.getCategories(),
        ]);
        setResources(resList);
        setCategories(catList);
      } catch (err) {
        console.error('[ResourcesPage] Failed loading resources:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const emergencyContacts = [
    { country: 'India', service: 'National Unified Emergency', number: '112', desc: 'Unified national emergency response (Police, Fire, Medical)', dial: '112' },
    { country: 'India', service: 'Ambulance & Medical Emergency', number: '108 / 102', desc: 'Emergency medical technician and ambulance dispatch', dial: '108' },
    { country: 'India', service: 'Tele-MANAS (Mental Health)', number: '14416', desc: '24/7 free toll-free tele-mental health helpline (Govt of India)', dial: '14416' },
    { country: 'United States & Canada', service: 'Emergency Dispatch', number: '911', desc: 'Immediate emergency medical and rescue dispatch', dial: '911' },
    { country: 'United States & Canada', service: '988 Suicide & Crisis Lifeline', number: '988', desc: '24/7 confidential mental health and crisis support', dial: '988' },
    { country: 'United Kingdom', service: 'NHS Urgent Medical Guidance', number: '111', desc: 'Urgent medical advice for non-immediate life threat', dial: '111' },
  ];

  const filtered = resources.filter((r) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.org.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);

    const matchesCategory = filter === 'All' || r.category === filter;
    return matchesSearch && matchesCategory;
  });

  const handleBookmarkToggle = async (e: React.MouseEvent, res: HealthResource) => {
    e.preventDefault();
    await toggle({
      resource_type: 'external_resource',
      resource_id: res.id,
      title: res.title,
      url: res.link,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Curated Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Trusted Healthcare Resources & Helplines
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Direct links to peer-reviewed public health repositories, official government health guidelines, and emergency medical hotlines.
        </p>
      </div>

      {/* Emergency Helplines Section */}
      <div id="emergency" className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 text-rose-900 font-bold text-lg">
          <div className="w-9 h-9 rounded-xl bg-rose-200/70 flex items-center justify-center text-rose-700">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2>Emergency Medical Hotlines & Helplines</h2>
            <p className="text-xs text-rose-700 font-normal mt-0.5">
              In any life-threatening emergency, call local emergency services immediately. Do not rely on chatbots.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {emergencyContacts.map((c, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-sm space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">{c.country}</span>
                  <a
                    href={`tel:${c.dial}`}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call {c.dial}</span>
                  </a>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{c.service}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Resource Links Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Official Health Portals & Documents</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical databases, surveillance guidelines, and institutional fact sheets
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all flex-shrink-0 ${
                filter === cat
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resource Cards */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
              <span className="text-xs">Loading curated repositories...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((res) => {
              const saved = isBookmarked('external_resource', res.id);

              return (
                <Card key={res.id} className="flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant="neutral" size="sm">{res.category}</Badge>
                      <div className="flex items-center gap-1.5">
                        {res.verified && (
                          <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                            Verified
                          </Badge>
                        )}
                        <button
                          onClick={(e) => handleBookmarkToggle(e, res)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            saved
                              ? 'bg-amber-50 border-amber-300 text-amber-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={saved ? 'Remove Bookmark' : 'Save Bookmark'}
                          aria-label={saved ? 'Remove Bookmark' : 'Save Bookmark'}
                        >
                          <BookmarkIcon className={`w-3.5 h-3.5 ${saved ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1 hover:text-teal-700 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 mb-2">{res.org}</p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{res.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href={res.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <span>Visit Official Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">No health resources found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your keyword search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
