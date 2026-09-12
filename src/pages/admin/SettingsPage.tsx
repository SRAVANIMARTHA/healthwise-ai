import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Database, Save, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { settingsService } from '../../services/admin/settings-service';

export const SettingsPage: React.FC = () => {
  const [model, setModel] = useState('gpt-4o-mini');
  const [mockAi, setMockAi] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const cfg = await settingsService.getSettings();
        setModel(cfg.model);
        setMockAi(cfg.mockAi);
      } catch (err) {
        console.warn('[SettingsPage] Failed loading settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.updateSettings({ model, mockAi });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.warn('[SettingsPage] Save failed:', err);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System & AI Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">Configure runtime models, fallback providers, and development test modes.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Cpu className="w-5 h-5 text-teal-600" />
            <h3>Puter.js AI Model Provider Layer</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure the default AI model passed to <code>puter.ai.chat()</code>. Because Puter supports 500+ models, the application avoids hardcoded strings and allows dynamic switching.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Active AI Model Name</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gpt-4o-mini, claude-3-5-sonnet, or default"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Default fallback model is dynamically resolved at runtime if unavailable.
            </span>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={mockAi}
                onChange={(e) => setMockAi(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Enable Mock AI Mode (Saves Puter quota during development and testing)</span>
            </label>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Database className="w-5 h-5 text-teal-600" />
            <h3>Database & Supabase Connection</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Client-side connection uses the anonymous public key and Postgres Row Level Security (RLS). Service-role keys must never be entered here or in the client bundle.
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono">
            VITE_SUPABASE_URL: Connected via environment variable<br />
            VITE_SUPABASE_ANON_KEY: Protected via environment variable
          </div>
        </Card>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> System settings updated
            </span>
          )}
          <Button type="submit" size="md" className="ml-auto" leftIcon={<Save className="w-4 h-4" />}>
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
