/**
 * HealthWise AI — Knowledge Base & Synchronization Service
 *
 * Coordinates external health sources (WHO), normalization, deduplication,
 * document storage, and section chunking.
 *
 * Operates in dual-mode:
 * - Live Supabase Mode (when configured)
 * - Local Demo Mode (localStorage fallback when Supabase is not configured)
 */

import { supabase, isSupabaseConfigured } from '../database/supabase-client';
import {
  KnowledgeSource,
  KnowledgeDocument,
  KnowledgeChunk,
  SyncSummary,
  NormalizedHealthDocument,
} from '../../types/database';
import { whoApiService, WHO_API_CONFIG } from './who-api-service';
import { chunkDocument } from './chunking-service';
import { SEEDED_WHO_DOCUMENTS, SEEDED_WHO_CHUNKS } from './seeded-knowledge';

const LOCAL_SOURCES_KEY = 'healthwise_knowledge_sources';
const LOCAL_DOCS_KEY = 'healthwise_knowledge_documents';
const LOCAL_CHUNKS_KEY = 'healthwise_knowledge_chunks';

// Initial default trusted sources
const DEFAULT_SOURCES: KnowledgeSource[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'World Health Organization',
    short_name: 'WHO',
    organization_type: 'International Public Health Agency',
    website_url: 'https://www.who.int',
    trust_tier: 'tier_1',
    is_active: true,
    last_sync_at: '2026-01-12T18:11:32Z',
    sync_status: 'success',
    error_message: null,
    document_count: SEEDED_WHO_DOCUMENTS.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Centers for Disease Control and Prevention',
    short_name: 'CDC',
    organization_type: 'National Public Health Agency',
    website_url: 'https://www.cdc.gov',
    trust_tier: 'tier_1',
    is_active: true,
    last_sync_at: null,
    sync_status: 'idle',
    error_message: null,
    document_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Ministry of Health and Family Welfare',
    short_name: 'MoHFW',
    organization_type: 'National Ministry',
    website_url: 'https://www.mohfw.gov.in',
    trust_tier: 'tier_1',
    is_active: true,
    last_sync_at: null,
    sync_status: 'idle',
    error_message: null,
    document_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ---------- Local Storage Storage Helpers ----------

function getLocalSources(): KnowledgeSource[] {
  try {
    const raw = localStorage.getItem(LOCAL_SOURCES_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SOURCES;
  } catch {
    return DEFAULT_SOURCES;
  }
}

function saveLocalSources(sources: KnowledgeSource[]) {
  localStorage.setItem(LOCAL_SOURCES_KEY, JSON.stringify(sources));
}

function getLocalDocs(): KnowledgeDocument[] {
  try {
    const raw = localStorage.getItem(LOCAL_DOCS_KEY);
    return raw ? JSON.parse(raw) : SEEDED_WHO_DOCUMENTS;
  } catch {
    return SEEDED_WHO_DOCUMENTS;
  }
}

function saveLocalDocs(docs: KnowledgeDocument[]) {
  localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(docs));
}

function getLocalChunks(): KnowledgeChunk[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHUNKS_KEY);
    return raw ? JSON.parse(raw) : SEEDED_WHO_CHUNKS;
  } catch {
    return SEEDED_WHO_CHUNKS;
  }
}

function saveLocalChunks(chunks: KnowledgeChunk[]) {
  localStorage.setItem(LOCAL_CHUNKS_KEY, JSON.stringify(chunks));
}

// ---------- Knowledge Service ----------

export const knowledgeService = {
  // ============ SOURCES ============

  /**
   * List all trusted health knowledge sources
   */
  async getSources(): Promise<KnowledgeSource[]> {
    if (!isSupabaseConfigured) {
      return getLocalSources();
    }

    const { data, error } = await supabase
      .from('knowledge_sources')
      .select('*')
      .order('trust_tier', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.warn('[Knowledge] Failed fetching sources from Supabase, using local fallback:', error.message);
      return getLocalSources();
    }

    if (!data || data.length === 0) {
      return getLocalSources();
    }

    return data as KnowledgeSource[];
  },

  /**
   * Find a source by its short name (e.g., 'WHO')
   */
  async getSourceByShortName(shortName: string): Promise<KnowledgeSource | null> {
    const sources = await this.getSources();
    return sources.find(s => s.short_name.toLowerCase() === shortName.toLowerCase()) || null;
  },

  // ============ DOCUMENTS ============

  /**
   * List knowledge documents with optional filtering
   */
  async getDocuments(filter?: {
    sourceId?: string;
    topic?: string;
    limit?: number;
  }): Promise<KnowledgeDocument[]> {
    if (!isSupabaseConfigured) {
      let docs = getLocalDocs();
      if (filter?.sourceId) {
        docs = docs.filter(d => d.source_id === filter.sourceId);
      }
      if (filter?.topic) {
        const t = filter.topic.toLowerCase();
        docs = docs.filter(d => d.topic.toLowerCase().includes(t) || d.title.toLowerCase().includes(t));
      }
      if (filter?.limit) {
        docs = docs.slice(0, filter.limit);
      }
      return docs;
    }

    let query = supabase
      .from('knowledge_documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filter?.sourceId) query = query.eq('source_id', filter.sourceId);
    if (filter?.limit) query = query.limit(filter.limit);

    const { data, error } = await query;
    if (error) {
      console.warn('[Knowledge] Supabase getDocuments error, using local:', error.message);
      return getLocalDocs();
    }
    return (data || []) as KnowledgeDocument[];
  },

  /**
   * Get chunks belonging to a document
   */
  async getDocumentChunks(documentId: string): Promise<KnowledgeChunk[]> {
    if (!isSupabaseConfigured) {
      return getLocalChunks().filter(c => c.document_id === documentId);
    }

    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('*')
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true });

    if (error) {
      console.error('[Knowledge] Error fetching document chunks:', error.message);
      return [];
    }
    return (data || []) as KnowledgeChunk[];
  },

  /**
   * Get all knowledge chunks across all documents (used for retrieval and semantic ranking)
   */
  async getAllChunks(): Promise<KnowledgeChunk[]> {
    if (!isSupabaseConfigured) {
      return getLocalChunks();
    }

    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('*')
      .order('chunk_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return getLocalChunks();
    }
    return data as KnowledgeChunk[];
  },

  // ============ SYNCHRONIZATION ENGINE ============

  /**
   * Synchronize WHO Fact Sheets into the Knowledge Base
   * Fetches official WHO documents, detects new vs changed via checksum,
   * stores documents, and splits them into semantic chunks.
   */
  async syncWHOSource(): Promise<SyncSummary> {
    const startedAt = new Date().toISOString();
    const whoSource = (await this.getSourceByShortName('WHO')) || DEFAULT_SOURCES[0];
    const sourceId = whoSource.id;

    // 1. Mark source as 'syncing'
    await this.updateSourceSyncState(sourceId, 'syncing', null);

    const summary: SyncSummary = {
      sourceId,
      sourceName: WHO_API_CONFIG.SOURCE_NAME,
      totalFetched: 0,
      inserted: 0,
      updated: 0,
      skippedUnchanged: 0,
      errors: [],
      startedAt,
      completedAt: '',
    };

    try {
      // 2. Fetch priority factsheets from WHO API
      console.info('[Knowledge] Fetching priority public health topics from official WHO API...');
      const normalizedDocs = await whoApiService.fetchPriorityFactsheets();
      summary.totalFetched = normalizedDocs.length;

      if (normalizedDocs.length === 0) {
        throw new Error('WHO API returned 0 documents during sync');
      }

      // 3. Process each document: check for existing version
      for (const normDoc of normalizedDocs) {
        try {
          const result = await this.saveOrUpdateDocument(sourceId, normDoc);
          if (result === 'inserted') summary.inserted++;
          else if (result === 'updated') summary.updated++;
          else summary.skippedUnchanged++;
        } catch (itemErr: any) {
          summary.errors.push(`Failed ingesting "${normDoc.title}": ${itemErr.message}`);
        }
      }

      // 4. Update source state to 'success'
      const totalDocsCount = (await this.getDocuments({ sourceId })).length;
      await this.updateSourceSyncState(sourceId, 'success', null, totalDocsCount);

      summary.completedAt = new Date().toISOString();
      console.info(
        `[Knowledge] WHO Sync Complete: ${summary.inserted} inserted, ${summary.updated} updated, ${summary.skippedUnchanged} unchanged.`
      );
      return summary;
    } catch (err: any) {
      console.error('[Knowledge] WHO Sync Failed:', err.message || err);
      summary.errors.push(err.message || 'Unknown sync failure');
      summary.completedAt = new Date().toISOString();
      await this.updateSourceSyncState(sourceId, 'error', err.message);
      return summary;
    }
  },

  /**
   * Save or update a normalized document, along with its chunks
   */
  async saveOrUpdateDocument(
    sourceId: string,
    doc: NormalizedHealthDocument
  ): Promise<'inserted' | 'updated' | 'skipped'> {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured) {
      // Local demo mode
      const localDocs = getLocalDocs();
      const existingIdx = localDocs.findIndex(
        d => d.source_id === sourceId && d.external_id === doc.externalId
      );

      if (existingIdx >= 0) {
        const existing = localDocs[existingIdx];
        if (existing.checksum === doc.checksum) {
          return 'skipped'; // No changes detected
        }

        // Update document
        localDocs[existingIdx] = {
          ...existing,
          title: doc.title,
          condition_name: doc.conditionName,
          topic: doc.topic,
          summary: doc.summary,
          full_content: doc.fullContent,
          source_url: doc.sourceUrl,
          publication_date: doc.publicationDate,
          last_modified_date: doc.lastModifiedDate,
          last_synchronized_date: now,
          checksum: doc.checksum,
          updated_at: now,
        };
        saveLocalDocs(localDocs);

        // Re-generate chunks
        const chunks = chunkDocument(doc).map(c => ({
          ...c,
          id: `chunk-${Date.now()}-${c.chunk_index}-${Math.random().toString(36).slice(2, 6)}`,
          document_id: existing.id,
          created_at: now,
        }));
        const allChunks = getLocalChunks().filter(c => c.document_id !== existing.id);
        allChunks.push(...chunks);
        saveLocalChunks(allChunks);

        return 'updated';
      }

      // Insert new document
      const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newDoc: KnowledgeDocument = {
        id: docId,
        source_id: sourceId,
        external_id: doc.externalId,
        condition_name: doc.conditionName,
        title: doc.title,
        topic: doc.topic,
        disease_category: 'infectious_or_chronic',
        summary: doc.summary,
        full_content: doc.fullContent,
        source_url: doc.sourceUrl,
        publication_date: doc.publicationDate,
        last_modified_date: doc.lastModifiedDate,
        last_verified_date: now.split('T')[0],
        last_synchronized_date: now,
        language: doc.language,
        version: doc.version,
        checksum: doc.checksum,
        status: 'published',
        verification_status: 'verified',
        reviewer: 'WHO Fact Sheets API',
        tags: doc.tags,
        created_at: now,
        updated_at: now,
      };

      localDocs.push(newDoc);
      saveLocalDocs(localDocs);

      // Generate and save chunks
      const chunks = chunkDocument(doc).map(c => ({
        ...c,
        id: `chunk-${Date.now()}-${c.chunk_index}-${Math.random().toString(36).slice(2, 6)}`,
        document_id: docId,
        created_at: now,
      }));
      const allChunks = getLocalChunks();
      allChunks.push(...chunks);
      saveLocalChunks(allChunks);

      return 'inserted';
    }

    // Supabase Live Mode
    // 1. Check if document exists
    const { data: existing } = await supabase
      .from('knowledge_documents')
      .select('id, checksum')
      .eq('source_id', sourceId)
      .eq('external_id', doc.externalId)
      .maybeSingle();

    if (existing) {
      if (existing.checksum === doc.checksum) {
        return 'skipped';
      }

      // Update existing
      await supabase
        .from('knowledge_documents')
        .update({
          title: doc.title,
          condition_name: doc.conditionName,
          topic: doc.topic,
          summary: doc.summary,
          full_content: doc.fullContent,
          source_url: doc.sourceUrl,
          publication_date: doc.publicationDate ? doc.publicationDate.split('T')[0] : null,
          last_modified_date: doc.lastModifiedDate,
          last_synchronized_date: now,
          checksum: doc.checksum,
          updated_at: now,
        })
        .eq('id', existing.id);

      // Refresh chunks
      await supabase.from('knowledge_chunks').delete().eq('document_id', existing.id);
      const chunkDrafts = chunkDocument(doc);
      if (chunkDrafts.length > 0) {
        await supabase.from('knowledge_chunks').insert(
          chunkDrafts.map(c => ({
            document_id: existing.id,
            chunk_index: c.chunk_index,
            content: c.content,
            heading: c.heading,
            topic: c.topic,
            tags: c.tags,
            token_count: c.token_count,
            metadata: c.metadata,
          }))
        );
      }
      return 'updated';
    }

    // Insert new
    const { data: newDoc, error: insertErr } = await supabase
      .from('knowledge_documents')
      .insert({
        source_id: sourceId,
        external_id: doc.externalId,
        condition_name: doc.conditionName,
        title: doc.title,
        topic: doc.topic,
        disease_category: 'general',
        summary: doc.summary,
        full_content: doc.fullContent,
        source_url: doc.sourceUrl,
        publication_date: doc.publicationDate ? doc.publicationDate.split('T')[0] : null,
        last_modified_date: doc.lastModifiedDate,
        last_verified_date: now.split('T')[0],
        last_synchronized_date: now,
        language: doc.language,
        version: doc.version,
        checksum: doc.checksum,
        status: 'published',
        verification_status: 'verified',
        reviewer: 'WHO Fact Sheets API',
        tags: doc.tags,
      })
      .select('id')
      .single();

    if (insertErr || !newDoc) {
      throw new Error(`Insert failed: ${insertErr?.message || 'No record returned'}`);
    }

    const chunkDrafts = chunkDocument(doc);
    if (chunkDrafts.length > 0) {
      await supabase.from('knowledge_chunks').insert(
        chunkDrafts.map(c => ({
          document_id: newDoc.id,
          chunk_index: c.chunk_index,
          content: c.content,
          heading: c.heading,
          topic: c.topic,
          tags: c.tags,
          token_count: c.token_count,
          metadata: c.metadata,
        }))
      );
    }

    return 'inserted';
  },

  /**
   * Update source sync status in state / database
   */
  async updateSourceSyncState(
    sourceId: string,
    status: 'idle' | 'syncing' | 'success' | 'error',
    errorMessage: string | null,
    docCount?: number
  ) {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured) {
      const sources = getLocalSources();
      const idx = sources.findIndex(s => s.id === sourceId);
      if (idx >= 0) {
        sources[idx].sync_status = status;
        sources[idx].error_message = errorMessage;
        if (status === 'success') {
          sources[idx].last_sync_at = now;
        }
        if (typeof docCount === 'number') {
          sources[idx].document_count = docCount;
        }
        sources[idx].updated_at = now;
        saveLocalSources(sources);
      }
      return;
    }

    const updates: Record<string, unknown> = {
      sync_status: status,
      error_message: errorMessage,
      updated_at: now,
    };
    if (status === 'success') updates.last_sync_at = now;
    if (typeof docCount === 'number') updates.document_count = docCount;

    await supabase.from('knowledge_sources').update(updates).eq('id', sourceId);
  },
};
