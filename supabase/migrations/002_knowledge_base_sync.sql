-- HealthWise AI: Knowledge Base & Source Sync Enhancement
-- Target: Supabase PostgreSQL
-- Version: 002_knowledge_base_sync.sql

-- ========================================================
-- 1. ENHANCE KNOWLEDGE_SOURCES TABLE
-- ========================================================
ALTER TABLE public.knowledge_sources
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error')),
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS document_count INTEGER DEFAULT 0;

-- ========================================================
-- 2. ENHANCE KNOWLEDGE_DOCUMENTS TABLE
-- ========================================================
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS condition_name TEXT,
  ADD COLUMN IF NOT EXISTS last_modified_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_synchronized_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checksum TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'deprecated')),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Unique constraint for source + external identifier to prevent duplicates during synchronization
CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_docs_source_external 
  ON public.knowledge_documents(source_id, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_condition 
  ON public.knowledge_documents(condition_name);

-- ========================================================
-- 3. ENHANCE KNOWLEDGE_CHUNKS TABLE
-- ========================================================
ALTER TABLE public.knowledge_chunks
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_heading 
  ON public.knowledge_chunks(heading);

-- ========================================================
-- 4. SEED PRIMARY TRUSTED SOURCES
-- ========================================================
INSERT INTO public.knowledge_sources (
  id,
  name,
  short_name,
  organization_type,
  website_url,
  trust_tier,
  is_active,
  sync_status
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'World Health Organization',
    'WHO',
    'International Public Health Agency',
    'https://www.who.int',
    'tier_1',
    TRUE,
    'idle'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Centers for Disease Control and Prevention',
    'CDC',
    'National Public Health Agency',
    'https://www.cdc.gov',
    'tier_1',
    TRUE,
    'idle'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Ministry of Health and Family Welfare',
    'MoHFW',
    'National Ministry',
    'https://www.mohfw.gov.in',
    'tier_1',
    TRUE,
    'idle'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  website_url = EXCLUDED.website_url,
  trust_tier = EXCLUDED.trust_tier,
  is_active = EXCLUDED.is_active;
