-- HealthWise AI: Vector & Full-Text Search Retrieval Pipeline
-- Target: Supabase PostgreSQL
-- Version: 003_vector_rag_retrieval.sql

-- ========================================================
-- 1. ENABLE PGVECTOR EXTENSION (If supported by PostgreSQL host)
-- ========================================================
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available on this host; falling back to full-text search';
END $$;

-- ========================================================
-- 2. ENHANCE KNOWLEDGE_CHUNKS WITH EMBEDDING & FTS
-- ========================================================
-- Add 384-dimensional vector embedding column (standard for all-MiniLM-L6-v2 / BGE-small)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    ALTER TABLE public.knowledge_chunks
      ADD COLUMN IF NOT EXISTS embedding vector(384);

    -- Create IVFFlat index for fast approximate nearest neighbor search
    -- Note: IVFFlat requires at least some rows to build properly; created with IF NOT EXISTS
    CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
      ON public.knowledge_chunks 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
  END IF;
END $$;

-- Add tsvector generated column for PostgreSQL Full-Text Search (FTS)
ALTER TABLE public.knowledge_chunks
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(heading, '') || ' ' || 
      coalesce(topic, '') || ' ' || 
      content
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_fts 
  ON public.knowledge_chunks 
  USING GIN (search_vector);

-- ========================================================
-- 3. STORED PROCEDURE FOR HYBRID / TEXT SIMILARITY RETRIEVAL
-- ========================================================
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_text TEXT,
  match_limit INT DEFAULT 5
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  chunk_index INT,
  content TEXT,
  heading TEXT,
  topic TEXT,
  doc_title TEXT,
  doc_source_url TEXT,
  doc_publication_date DATE,
  rank FLOAT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id AS chunk_id,
    c.document_id,
    c.chunk_index,
    c.content,
    c.heading,
    c.topic,
    d.title AS doc_title,
    d.source_url AS doc_source_url,
    d.publication_date AS doc_publication_date,
    ts_rank_cd(c.search_vector, plainto_tsquery('english', query_text))::FLOAT AS rank
  FROM public.knowledge_chunks c
  JOIN public.knowledge_documents d ON c.document_id = d.id
  WHERE c.search_vector @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT match_limit;
$$;
