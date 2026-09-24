import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Bookmark, History, Settings, Globe, ShieldCheck, ArrowRight, Activity, Plus, User, FileText } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isConfigured } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="success">Authenticated Session</Badge>
            {isAdmin && <Badge variant="primary">Administrator</Badge>}
            <Badge variant="neutral">
              {isConfigured ? 'Supabase Cloud' : 'Local Sandbox Mode'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || user?.email?.split('@')[0] || 'Health Seeker'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
            Signed in as <strong>{user?.email}</strong>. Access your educational inquiries, saved health guides, and privacy controls.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => navigate('/chat')}
          className="bg-white text-teal-900 hover:bg-teal-50 shadow-md flex-shrink-0"
          leftIcon={<Plus className="w-5 h-5 text-teal-700" />}
        >
          New Health Query
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">0</span>
            <span className="text-xs text-slate-500 block">Saved Conversations</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">0</span>
            <span className="text-xs text-slate-500 block">Bookmarked Guides</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 uppercase">
              {user?.preferredLanguage || 'English'}
            </span>
            <span className="text-xs text-slate-500 block">Language Preference</span>
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hoverable onClick={() => navigate('/report')} className="border-teal-200 bg-teal-50/20">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-6 h-6 text-teal-700" />
            <ArrowRight className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Explain Report</h3>
          <p className="text-xs text-slate-600">Upload laboratory PDF or image for plain-language findings analysis.</p>
        </Card>

        <Card hoverable onClick={() => navigate('/chat-history')}>
          <div className="flex items-center justify-between mb-3">
            <History className="w-6 h-6 text-teal-600" />
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Chat History</h3>
          <p className="text-xs text-slate-600">Review past conversational health explanations and source links.</p>
        </Card>

        <Card hoverable onClick={() => navigate('/bookmarks')}>
          <div className="flex items-center justify-between mb-3">
            <Bookmark className="w-6 h-6 text-amber-600" />
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Saved Topics & Bookmarks</h3>
          <p className="text-xs text-slate-600">Quickly revisit saved disease sheets and prevention protocols.</p>
        </Card>

        <Card hoverable onClick={() => navigate('/profile')}>
          <div className="flex items-center justify-between mb-3">
            <Settings className="w-6 h-6 text-slate-600" />
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Preferences & Privacy</h3>
          <p className="text-xs text-slate-600">Manage communication language, accessibility, and account data deletion.</p>
        </Card>
      </div>
    </div>
  );
};
