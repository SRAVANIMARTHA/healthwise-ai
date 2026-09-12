import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Layers,
  Calendar,
  Eye,
  X,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { knowledgeService } from '../../services/knowledge/knowledge-service';
import { KnowledgeDocument, KnowledgeChunk } from '../../types/database';

export const KnowledgeBasePage: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [selectedDocChunks, setSelectedDocChunks] = useState<KnowledgeChunk[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await knowledgeService.getDocuments();
      setDocuments(docs);
    } catch (err: any) {
      console.error('Failed loading documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await knowledgeService.syncWHOSource();
      await loadDocuments();
    } catch (err: any) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewDoc = async (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setIsLoadingChunks(true);
    try {
      const chunks = await knowledgeService.getDocumentChunks(doc.id);
      setSelectedDocChunks(chunks);
    } catch (err: any) {
      console.error('Error fetching chunks:', err);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.condition_name && d.condition_name.toLowerCase().includes(search.toLowerCase())) ||
    d.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Base Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified health documents and chunks synchronized from official public health authorities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSync}
            isLoading={isSyncing}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
          >
            {isSyncing ? 'Syncing WHO...' : 'Sync WHO Fact Sheets'}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents by condition, topic, or keyword..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400/50"
        />
      </div>

      {/* Content Table / Empty State */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading indexed health documents...</div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <Database className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Knowledge Base Empty</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No official health documents have been synchronized yet. Click the button below to fetch and index official WHO Fact Sheets.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleSync}
            isLoading={isSyncing}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Synchronize WHO Fact Sheets
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Title & Condition</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Published</th>
                  <th className="py-3 px-4">Provenance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{doc.title}</p>
                      {doc.condition_name && doc.condition_name !== doc.title && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{doc.condition_name}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">WHO Fact Sheet</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success" size="sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {doc.publication_date ? new Date(doc.publication_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={doc.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
                      >
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewDoc(doc)}
                        className="text-teal-600 hover:text-teal-800 font-semibold inline-flex items-center gap-1 p-1 hover:bg-teal-50 rounded"
                        title="View Chunks & Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedDoc.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Source: WHO Fact Sheets | Checksum: <code className="font-mono text-teal-600">{selectedDoc.checksum || 'N/A'}</code>
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700">
              {/* Summary */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">
                  Executive Summary
                </h4>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                  {selectedDoc.summary || 'No summary available.'}
                </p>
              </div>

              {/* Chunks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    Indexed Chunks for RAG ({selectedDocChunks.length})
                  </h4>
                </div>

                {isLoadingChunks ? (
                  <div className="p-4 text-center text-slate-400">Loading chunks...</div>
                ) : (
                  <div className="space-y-2">
                    {selectedDocChunks.map((chunk) => (
                      <div
                        key={chunk.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-teal-700">
                            #{chunk.chunk_index} — {chunk.heading || 'General'}
                          </span>
                          <span className="text-slate-400 font-mono">~{chunk.token_count || 0} tokens</span>
                        </div>
                        <p className="text-slate-600 line-clamp-3 leading-relaxed">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
              <a
                href={selectedDoc.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
              >
                Open Official WHO Fact Sheet <ExternalLink className="w-3 h-3" />
              </a>
              <Button size="sm" variant="outline" onClick={() => setSelectedDoc(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
