-- HealthWise AI: Production Database Schema with Row Level Security (RLS)
-- Target: Supabase PostgreSQL
-- Version: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. PROFILES TABLE (Linked to auth.users)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index on role for fast RBAC checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ========================================================
-- 2. KNOWLEDGE SOURCES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  website_url TEXT NOT NULL,
  trust_tier TEXT DEFAULT 'tier_1' CHECK (trust_tier IN ('tier_1', 'tier_2', 'tier_3')),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================================
-- 3. DISEASES DIRECTORY TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  overview TEXT NOT NULL,
  symptoms JSONB DEFAULT '[]'::jsonb NOT NULL,
  warning_signs JSONB DEFAULT '[]'::jsonb NOT NULL,
  risk_factors JSONB DEFAULT '[]'::jsonb NOT NULL,
  prevention JSONB DEFAULT '[]'::jsonb NOT NULL,
  when_to_seek_care TEXT NOT NULL,
  source_id UUID REFERENCES public.knowledge_sources(id) ON DELETE SET NULL,
  source_name TEXT,
  source_url TEXT,
  last_reviewed DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_diseases_category ON public.diseases(category);
CREATE INDEX IF NOT EXISTS idx_diseases_slug ON public.diseases(slug);

-- ========================================================
-- 4. HEALTH TOPICS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.health_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_health_topics_category ON public.health_topics(category);

-- ========================================================
-- 5. KNOWLEDGE DOCUMENTS (RAG Parent Documents)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  disease_category TEXT,
  summary TEXT NOT NULL,
  full_content TEXT NOT NULL,
  source_url TEXT NOT NULL,
  publication_date DATE,
  last_verified_date DATE DEFAULT CURRENT_DATE NOT NULL,
  language TEXT DEFAULT 'en' NOT NULL,
  version TEXT DEFAULT '1.0' NOT NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')) NOT NULL,
  reviewer TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON public.knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_topic ON public.knowledge_documents(topic);

-- ========================================================
-- 6. KNOWLEDGE CHUNKS (For Semantic/Text Retrieval)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  heading TEXT,
  topic TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  token_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc ON public.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_topic ON public.knowledge_chunks(topic);

-- ========================================================
-- 7. CHAT SESSIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation' NOT NULL,
  language TEXT DEFAULT 'en' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);

-- ========================================================
-- 8. CHAT MESSAGES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  intent TEXT,
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('normal', 'moderate', 'urgent', 'critical')),
  sources JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);

-- ========================================================
-- 9. USER BOOKMARKS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('disease', 'document', 'external_resource')),
  resource_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- ========================================================
-- 10. USER FEEDBACK TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('positive', 'negative')),
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================================
-- 11. PRIVACY-CONSCIOUS ANALYTICS EVENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  topic TEXT,
  language TEXT DEFAULT 'en',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);

-- ========================================================
-- 12. SAFETY & RED-FLAG EVENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  trigger_pattern TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('moderate', 'urgent', 'critical')),
  safety_classification TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================================
-- 13. CONTENT REVIEWS TABLE (Lifecycle Audit)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('draft', 'review', 'approved', 'published', 'archived')),
  comments TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================================
-- 14. APP SETTINGS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================================
-- 15. SUPPORTED LANGUAGES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.supported_languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert Default Supported Languages
INSERT INTO public.supported_languages (code, name, native_name, is_active)
VALUES 
  ('en', 'English', 'English', true),
  ('te', 'Telugu', 'తెలుగు', true),
  ('hi', 'Hindi', 'हिन्दी', true)
ON CONFLICT (code) DO NOTHING;

-- ========================================================
-- AUTOMATIC USER PROFILE CREATION ON SIGNUP
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_languages ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. CHAT SESSIONS POLICIES
CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON public.chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 3. CHAT MESSAGES POLICIES
CREATE POLICY "Users can view messages of their sessions"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert messages into their sessions"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
    )
  );

-- 4. BOOKMARKS POLICIES
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- 5. FEEDBACK POLICIES
CREATE POLICY "Users can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

-- 6. PUBLIC READ FOR CURATED KNOWLEDGE (Diseases, Topics, Sources, Documents, Languages)
CREATE POLICY "Public read for diseases"
  ON public.diseases FOR SELECT
  USING (true);

CREATE POLICY "Public read for health_topics"
  ON public.health_topics FOR SELECT
  USING (true);

CREATE POLICY "Public read for knowledge_sources"
  ON public.knowledge_sources FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read for published documents"
  ON public.knowledge_documents FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public read for knowledge_chunks of published documents"
  ON public.knowledge_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_documents
      WHERE knowledge_documents.id = knowledge_chunks.document_id
      AND knowledge_documents.status = 'published'
    )
  );

CREATE POLICY "Public read for supported_languages"
  ON public.supported_languages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read for general app_settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- 7. ANALYTICS & SAFETY LOGS POLICIES
CREATE POLICY "Allow public insert of analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert of safety triage events"
  ON public.safety_events FOR INSERT
  WITH CHECK (true);

-- 8. ADMIN-ONLY PRIVILEGES
-- Create a SECURITY DEFINER function to bypass RLS recursion when checking admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role, anon;

-- Admins can view and manage all tables without infinite recursion
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins have full access to knowledge_sources"
  ON public.knowledge_sources FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins have full access to knowledge_documents"
  ON public.knowledge_documents FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins have full access to knowledge_chunks"
  ON public.knowledge_chunks FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins have full access to diseases"
  ON public.diseases FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins have full access to health_topics"
  ON public.health_topics FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all safety logs"
  ON public.safety_events FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins have full access to content_reviews"
  ON public.content_reviews FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins have full access to app_settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.is_admin());
