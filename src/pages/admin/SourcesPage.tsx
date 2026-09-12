import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { knowledgeService } from '../../services/knowledge/knowledge-service';
import { KnowledgeSource, SyncSummary } from '../../types/database';

export const SourcesPage: React.FC = () => {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncSummary, setLastSyncSummary] = useState<SyncSummary | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadSources = useCallback(async () => {
    try {
      const data = await knowledgeService.getSources();
      setSources(data);
    } catch (err: any) {
      console.error('Error loading sources:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const handleSyncWHO = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const summary = await knowledgeService.syncWHOSource();
      setLastSyncSummary(summary);
      if (summary.errors.length > 0 && summary.inserted === 0 && summary.updated === 0) {
        setSyncError(summary.errors[0]);
      }
      await loadSources();
    } catch (err: any) {
      setSyncError(err.message || 'Synchronization failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDateTime = (iso: string | null | undefined) => {
    if (!iso) return 'Never synchronized';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: KnowledgeSource['sync_status']) => {
    switch (status) {
      case 'syncing':
        return <Badge variant="warning" size="sm">Syncing...</Badge>;
      case 'success':
        return <Badge variant="success" size="sm">Synchronized</Badge>;
      case 'error':
        return <Badge variant="danger" size="sm">Sync Error</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Idle</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trusted Health Sources</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official public health data providers verified for chatbot knowledge grounding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSyncWHO}
            isLoading={isSyncing}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
          >
            {isSyncing ? 'Syncing WHO...' : 'Sync WHO Fact Sheets'}
          </Button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {lastSyncSummary && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">WHO Fact Sheets Synchronized Successfully</p>
            <p className="text-emerald-700">
              Fetched: {lastSyncSummary.totalFetched} documents | Ingested: {lastSyncSummary.inserted} new | Updated: {lastSyncSummary.updated} | Unchanged: {lastSyncSummary.skippedUnchanged}
            </p>
          </div>
        </div>
      )}

      {syncError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Synchronization Warning</p>
            <p className="text-rose-700">{syncError}</p>
          </div>
        </div>
      )}

      {/* Sources Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading verified health sources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((source) => (
            <div
              key={source.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3.5 shadow-sm hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{source.name}</h3>
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {source.short_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{source.organization_type}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="success" size="sm">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Tier 1 Trusted
                  </Badge>
                  {getStatusBadge(source.sync_status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>Docs: <strong>{source.document_count || 0}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{formatDateTime(source.last_sync_at)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={source.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  Official Portal <ExternalLink className="w-3 h-3" />
                </a>

                {source.short_name === 'WHO' && (
                  <button
                    onClick={handleSyncWHO}
                    disabled={isSyncing}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-800 disabled:opacity-50"
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
