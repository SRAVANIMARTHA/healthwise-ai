-- ========================================================
-- Migration 002: Fix Profiles RLS Infinite Recursion
-- Resolves "infinite recursion detected in policy for relation profiles"
-- by using a SECURITY DEFINER helper function.
-- ========================================================

-- 1. Create SECURITY DEFINER function to check admin status without triggering RLS recursion
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

-- Grant execution to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role, anon;

-- 2. Drop recursive admin policy on profiles
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- 3. Re-create non-recursive profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 4. Update all other admin policies to use public.is_admin() for maximum safety and performance
DROP POLICY IF EXISTS "Admins have full access to knowledge_sources" ON public.knowledge_sources;
CREATE POLICY "Admins have full access to knowledge_sources"
  ON public.knowledge_sources FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to knowledge_documents" ON public.knowledge_documents;
CREATE POLICY "Admins have full access to knowledge_documents"
  ON public.knowledge_documents FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to knowledge_chunks" ON public.knowledge_chunks;
CREATE POLICY "Admins have full access to knowledge_chunks"
  ON public.knowledge_chunks FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to diseases" ON public.diseases;
CREATE POLICY "Admins have full access to diseases"
  ON public.diseases FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to health_topics" ON public.health_topics;
CREATE POLICY "Admins have full access to health_topics"
  ON public.health_topics FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
CREATE POLICY "Admins can view all feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;
CREATE POLICY "Admins can view all analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all safety logs" ON public.safety_events;
CREATE POLICY "Admins can view all safety logs"
  ON public.safety_events FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to content_reviews" ON public.content_reviews;
CREATE POLICY "Admins have full access to content_reviews"
  ON public.content_reviews FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to app_settings" ON public.app_settings;
CREATE POLICY "Admins have full access to app_settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.is_admin());
