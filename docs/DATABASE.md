# HealthWise AI — Database Schema & RLS Architecture

## 1. Overview

HealthWise AI uses **Supabase (PostgreSQL 15)** as its persistence layer. The database enforces:
- Strict **Row-Level Security (RLS)** on all tables.
- Non-recursive role-based access control (RBAC) via a `SECURITY DEFINER` helper function (`public.is_admin()`).
- Data isolation between individual user accounts.
- Public read-only access for vetted medical knowledge, disease entries, and health resources.

---

## 2. Table Schemas

### 1. `public.profiles`
Links directly to Supabase's managed `auth.users` relation.
- `id` (UUID, PK): References `auth.users(id) ON DELETE CASCADE`.
- `email` (TEXT, NOT NULL): User email address.
- `full_name` (TEXT): Display name.
- `role` (TEXT): `'user'` or `'admin'` (default: `'user'`).
- `preferred_language` (TEXT): Default `'en'`.
- `created_at` / `updated_at` (TIMESTAMPTZ).

### 2. `public.knowledge_sources`
Health organizations whose fact sheets and guidelines are ingested.
- `id` (UUID, PK): Unique source identifier.
- `name` (TEXT, NOT NULL): Full name (e.g., "World Health Organization").
- `short_name` (TEXT, NOT NULL): e.g., "WHO", "CDC", "MoHFW".
- `organization_type` (TEXT): Agency type.
- `website_url` (TEXT): Canonical website URL.
- `trust_tier` (TEXT): `'tier_1'`, `'tier_2'`, `'tier_3'`.
- `is_active` (BOOLEAN): Status flag.
- `last_sync_at` (TIMESTAMPTZ): Timestamp of last successful synchronization.
- `sync_status` (TEXT): `'idle'`, `'syncing'`, `'success'`, `'error'`.
- `document_count` (INTEGER): Total indexed documents.

### 3. `public.diseases`
Curated directory of major conditions and diseases.
- `id` (UUID, PK).
- `slug` (TEXT, UNIQUE): URL slug (e.g., `'dengue'`).
- `name` (TEXT): Full condition name.
- `category` (TEXT): e.g., `'vector-borne'`, `'respiratory'`, `'cardiovascular'`.
- `overview` (TEXT): Clinical description written in lay terms.
- `symptoms` (JSONB): Array of common symptoms.
- `warning_signs` (JSONB): Red-flag warning signs requiring urgent attention.
- `risk_factors` (JSONB): Environmental and lifestyle risk factors.
- `prevention` (JSONB): Preventive measures and hygiene guidelines.
- `when_to_seek_care` (TEXT): Explicit criteria for seeking immediate medical attention.
- `source_id` (UUID): Foreign key to `knowledge_sources(id)`.
- `source_url` (TEXT): Official fact sheet link.

### 4. `public.health_topics`
General educational topics (vaccination, nutrition, hygiene, maternal health).
- `id` (UUID, PK).
- `slug` (TEXT, UNIQUE).
- `title` (TEXT).
- `category` (TEXT).
- `summary` (TEXT).
- `content` (TEXT).
- `tags` (TEXT[]).

### 5. `public.knowledge_documents`
Master ingested documents from health authorities.
- `id` (UUID, PK).
- `source_id` (UUID): Foreign key to `knowledge_sources(id)`.
- `external_id` (TEXT): External agency ID or URL slug.
- `title` (TEXT).
- `topic` (TEXT).
- `summary` (TEXT).
- `full_content` (TEXT).
- `source_url` (TEXT).
- `checksum` (TEXT): MD5 hash for automated update detection.
- `status` (TEXT): `'draft'`, `'review'`, `'approved'`, `'published'`, `'archived'`.
- `language` (TEXT): ISO code (default `'en'`).

### 6. `public.knowledge_chunks`
Semantic chunks extracted from master documents for RAG retrieval.
- `id` (UUID, PK).
- `document_id` (UUID): Foreign key to `knowledge_documents(id) ON DELETE CASCADE`.
- `chunk_index` (INTEGER): Sequential order within parent document.
- `heading` (TEXT): Section heading (e.g., "Prevention", "Symptoms").
- `topic` (TEXT).
- `content` (TEXT): Chunk text content.
- `embedding` (vector(384)): Vector embeddings (optional, if `pgvector` enabled).
- `search_vector` (tsvector): Generated tsvector column for Full-Text Search.

### 7. `public.chat_sessions`
Conversational chat threads.
- `id` (UUID, PK).
- `user_id` (UUID): Foreign key to `auth.users(id) ON DELETE CASCADE`.
- `title` (TEXT): Conversation title.
- `language` (TEXT): Conversation language.
- `created_at` / `updated_at` (TIMESTAMPTZ).

### 8. `public.chat_messages`
Individual turns within a session.
- `id` (UUID, PK).
- `session_id` (UUID): Foreign key to `chat_sessions(id) ON DELETE CASCADE`.
- `sender` (TEXT): `'user'`, `'assistant'`, `'system'`.
- `content` (TEXT): Message text.
- `urgency_level` (TEXT): `'normal'`, `'moderate'`, `'urgent'`, `'critical'`.
- `sources` (JSONB): Array of citations attached to this response.

### 9. `public.bookmarks`
User-saved entries.
- `id` (UUID, PK).
- `user_id` (UUID): Foreign key to `auth.users(id) ON DELETE CASCADE`.
- `resource_type` (TEXT): `'disease'`, `'document'`, `'external_resource'`.
- `resource_id` (TEXT).
- `title` (TEXT).
- `url` (TEXT).
- `UNIQUE(user_id, resource_type, resource_id)`.

### 10. `public.feedback`
User ratings and comments on chat responses.
- `id` (UUID, PK).
- `user_id` (UUID): Optional foreign key to `auth.users(id)`.
- `message_id` (UUID): Optional foreign key to `chat_messages(id)`.
- `query_text` (TEXT).
- `rating` (TEXT): `'positive'` or `'negative'`.
- `feedback_text` (TEXT).

### 11. `public.analytics_events`
Privacy-preserving platform telemetry.
- `id` (UUID, PK).
- `event_type` (TEXT): e.g., `'query_answered'`, `'disease_viewed'`.
- `topic` (TEXT): Medical topic name (no user data).
- `language` (TEXT): Language code.
- `metadata` (JSONB): Technical metadata (sources count, grounding rate).

### 12. `public.safety_events`
Audit trail of safety triggers.
- `id` (UUID, PK).
- `session_id` (UUID): Optional foreign key to `chat_sessions(id)`.
- `trigger_pattern` (TEXT): Rule identifier (e.g., `'cardiac_emergency'`).
- `severity` (TEXT): `'moderate'`, `'urgent'`, `'critical'`.
- `action_taken` (TEXT): e.g., `'emergency_escalate'`, `'refuse_adversarial'`.

### 13. `public.content_reviews`
Editorial review log for knowledge documents.
- `id` (UUID, PK).
- `document_id` (UUID): Foreign key to `knowledge_documents(id)`.
- `reviewer_name` (TEXT).
- `stage` (TEXT): `'draft'`, `'review'`, `'approved'`, `'published'`, `'archived'`.
- `comments` (TEXT).

### 14. `public.app_settings`
Dynamic system-wide settings.
- `key` (TEXT, PK): Setting key (e.g., `'ai_model'`, `'maintenance_mode'`).
- `value` (JSONB): Setting payload.

### 15. `public.supported_languages`
Catalog of active languages.
- `code` (TEXT, PK): ISO language code.
- `name` (TEXT): English name.
- `native_name` (TEXT): Native name.
- `is_active` (BOOLEAN).

---

## 3. Row-Level Security (RLS) Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Own profile or Admin | Trigger (`handle_new_user`) | Own profile or Admin | Admin |
| `chat_sessions` | Own sessions | Own sessions | Own sessions | Own sessions |
| `chat_messages` | Own session messages | Own session messages | None | None |
| `bookmarks` | Own bookmarks | Own bookmarks | None | Own bookmarks |
| `feedback` | Own feedback or Admin | Any authenticated/anon | None | None |
| `diseases` | Public (true) | Admin only | Admin only | Admin only |
| `health_topics` | Public (true) | Admin only | Admin only | Admin only |
| `knowledge_sources` | Public (`is_active=true`) | Admin only | Admin only | Admin only |
| `knowledge_documents` | Public (`status='published'`) | Admin only | Admin only | Admin only |
| `knowledge_chunks` | Public (published parents) | Admin only | Admin only | Admin only |
| `analytics_events` | Admin only | Public (telemetry) | None | None |
| `safety_events` | Admin only | Public (safety triage) | None | None |
| `content_reviews` | Admin only | Admin only | Admin only | Admin only |
| `app_settings` | Public (true) | Admin only | Admin only | Admin only |

---

## 4. Administrative Security Definer Pattern

To prevent PostgreSQL infinite recursion when evaluating whether a user is an administrator (`role = 'admin'` in `profiles`), all admin policies leverage the `public.is_admin()` helper function:

```sql
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
```

---

## 5. Migration Sequence

Execute migrations in this order:

1. `001_initial_schema.sql`: Core tables, auto-profile trigger on signup, indexes, and initial RLS policies.
2. `002_fix_profiles_rls.sql`: Applies the `public.is_admin()` SECURITY DEFINER pattern to prevent RLS recursion.
3. `002_knowledge_base_sync.sql`: Ingestion metadata columns and initial seed records for WHO, CDC, and MoHFW.
4. `003_vector_rag_retrieval.sql`: Full-Text Search tsvector columns, GIN index, and `match_knowledge_chunks` search RPC function.
