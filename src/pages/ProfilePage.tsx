import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Globe, Shield, Trash2, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, signOut, isLoading, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [lang, setLang] = useState(user?.preferredLanguage || 'en');
  const [saved, setSaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setLang(user.preferredLanguage || 'en');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      fullName,
      preferredLanguage: lang,
    });
    if (success) {
      setSaved(true);
      setStatusMsg('Profile and preferences updated successfully.');
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Profile & Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your identity, language preference, and privacy controls.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="text-rose-600 border-rose-200 hover:bg-rose-50"
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
        >
          Sign Out
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account Identity */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <User className="w-5 h-5 text-teal-600" />
            <h3>Account Identity</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'user@example.com'}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Primary identifier handled by Supabase Auth.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div className="text-xs text-slate-500">
              Role: <strong className="uppercase text-slate-700">{user?.role || 'user'}</strong>
            </div>
          </div>
        </Card>

        {/* Language Preferences */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Globe className="w-5 h-5 text-teal-600" />
            <h3>Preferred Communication Language</h3>
          </div>
          <p className="text-xs text-slate-500">
            Choose your default language for health queries and disease guides.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { code: 'en', label: 'English' },
              { code: 'te', label: 'తెలుగు (Telugu)' },
              { code: 'hi', label: 'हिन्दी (Hindi)' },
            ].map((l) => (
              <label
                key={l.code}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs font-semibold transition-all ${
                  lang === l.code
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="lang"
                  value={l.code}
                  checked={lang === l.code}
                  onChange={() => setLang(l.code)}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span>{l.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Privacy & Health Data Notice */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Shield className="w-5 h-5 text-teal-600" />
            <h3>Privacy & Data Sovereignty</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All records are governed by Supabase Row Level Security (RLS). Only your authenticated session can access your chat threads and saved bookmarks.
          </p>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear Conversation History
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {statusMsg}
            </span>
          )}
          <Button
            type="submit"
            size="md"
            className="ml-auto"
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
