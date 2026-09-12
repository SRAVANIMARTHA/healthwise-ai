import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  MessageSquare,
  Trash2,
  ArrowRight,
  Search,
  Calendar,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useChat } from '../hooks/useChat';

export const ChatHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    sessions,
    isLoadingSessions,
    removeSession,
    clearAllHistory,
    setActiveSession,
  } = useChat();

  const [search, setSearch] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      if (hours < 48) return 'Yesterday';
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    } catch { return ''; }
  };

  const handleOpenSession = async (sessionId: string) => {
    await setActiveSession(sessionId);
    navigate(`/chat/${sessionId}`);
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await removeSession(sessionId);
  };

  const handleClearAll = async () => {
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      return;
    }
    await clearAllHistory();
    setConfirmClearAll(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conversation History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {sessions.length > 0
              ? `${sessions.length} conversation${sessions.length > 1 ? 's' : ''} saved`
              : 'Review your past health queries and educational sessions.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <Button
              size="sm"
              variant={confirmClearAll ? 'danger' : 'outline'}
              onClick={handleClearAll}
              leftIcon={confirmClearAll ? <AlertTriangle className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
            >
              {confirmClearAll ? 'Confirm Delete All?' : 'Clear All'}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => navigate('/chat')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {sessions.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400"
          />
        </div>
      )}

      {/* Content */}
      {isLoadingSessions ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-3">Loading conversations...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-sm">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">
            {search ? 'No matching conversations' : 'No Conversations Saved Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'Try a different search term.'
              : 'When you start asking health and disease prevention questions, your session threads will appear here for easy reference.'}
          </p>
          {!search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/chat')}
              className="mt-2"
            >
              Ask a Health Question
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleOpenSession(session.id)}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-teal-300 rounded-2xl p-4 text-left transition-all group shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 border border-teal-100 group-hover:bg-teal-100">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-700">
                    {session.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(session.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="p-1.5 text-slate-400 group-hover:text-teal-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Cancel confirm */}
      {confirmClearAll && (
        <div className="text-center">
          <button
            onClick={() => setConfirmClearAll(false)}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
