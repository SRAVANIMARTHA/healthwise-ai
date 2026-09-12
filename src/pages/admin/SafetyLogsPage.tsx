import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  PhoneCall,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { safetyService } from '../../services/safety/safety-service';
import { SafetyEvent } from '../../types/database';
import { HotlineModal } from '../../components/common/HotlineModal';

export const SafetyLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<SafetyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'urgent' | 'moderate'>('all');
  const [isHotlinesOpen, setIsHotlinesOpen] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await safetyService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('[SafetyLogsPage] Failed loading logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.trigger_pattern.toLowerCase().includes(search.toLowerCase()) ||
      log.safety_classification.toLowerCase().includes(search.toLowerCase()) ||
      log.action_taken.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const totalEvents = logs.length;
  const criticalEvents = logs.filter((l) => l.severity === 'critical').length;
  const urgentEvents = logs.filter((l) => l.severity === 'urgent').length;
  const moderateEvents = logs.filter((l) => l.severity === 'moderate').length;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Safety & Clinical Guardrail Logs</h1>
            <Badge variant="danger" size="sm">Audit Trail Active</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time audit record of intercepted red-flag symptoms, jailbreaks, prescription defenses, and clinical sanitization events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsHotlinesOpen(true)}
            leftIcon={<PhoneCall className="w-3.5 h-3.5 text-rose-600" />}
          >
            Emergency Hotlines
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={loadLogs}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Incidents</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalEvents}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Critical Red-Flags</span>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">{criticalEvents}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Urgent Violations</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{urgentEvents}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Defenses & Sanitize</span>
            <div className="text-2xl font-extrabold text-teal-700 mt-1">{moderateEvents}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by trigger pattern, safety category, or action taken..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Severity Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(['all', 'critical', 'urgent', 'moderate'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  severityFilter === sev
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Trigger Pattern</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Action Enforced</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
                      <span>Loading safety audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No safety log entries match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.severity === 'critical' ? (
                        <Badge variant="danger" size="sm">Critical</Badge>
                      ) : log.severity === 'urgent' ? (
                        <Badge variant="warning" size="sm">Urgent</Badge>
                      ) : (
                        <Badge variant="info" size="sm">Moderate</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-900 max-w-xs sm:max-w-md truncate" title={log.trigger_pattern}>
                      {log.trigger_pattern}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {log.safety_classification}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {log.action_taken}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Hotlines Directory Modal */}
      <HotlineModal
        isOpen={isHotlinesOpen}
        onClose={() => setIsHotlinesOpen(false)}
      />
    </div>
  );
};
