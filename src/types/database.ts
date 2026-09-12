// TypeScript Database Schema Definitions matching Supabase tables

export type UserRole = 'user' | 'admin';
export type UrgencyLevel = 'normal' | 'moderate' | 'urgent' | 'critical';
export type ContentStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type TrustTier = 'tier_1' | 'tier_2' | 'tier_3';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export type VerificationStatus = 'verified' | 'pending' | 'deprecated';

export interface KnowledgeSource {
  id: string;
  name: string;
  short_name: string;
  organization_type: string;
  website_url: string;
  trust_tier: TrustTier;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: SyncStatus;
  error_message: string | null;
  document_count: number;
  created_at: string;
  updated_at: string;
}

export interface Disease {
  id: string;
  slug: string;
  name: string;
  category: string;
  overview: string;
  symptoms: string[];
  warning_signs: string[];
  risk_factors: string[];
  prevention: string[];
  when_to_seek_care: string;
  source_id: string | null;
  source_name: string | null;
  source_url: string | null;
  last_reviewed: string;
  created_at: string;
  updated_at: string;
}

export interface HealthTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  source_id: string;
  external_id?: string | null;
  condition_name?: string | null;
  title: string;
  topic: string;
  disease_category: string | null;
  summary: string;
  full_content: string;
  source_url: string;
  publication_date: string | null;
  last_modified_date?: string | null;
  last_verified_date: string;
  last_synchronized_date?: string | null;
  language: string;
  version: string;
  checksum?: string | null;
  status: ContentStatus;
  verification_status?: VerificationStatus;
  reviewer: string | null;
  tags: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  heading: string | null;
  topic: string;
  tags: string[];
  token_count: number | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// WHO Official Factsheets API Types
export interface WHORawFactsheet {
  Id: string;
  Title: string;
  UrlName: string;
  ItemDefaultUrl?: string;
  ConditionName?: string;
  Content?: string;
  Summary?: string;
  SymptomsBriefSummary?: string;
  SymptomsLongerSummary?: string;
  PreventionBriefSummary?: string;
  PreventionLongerSummary?: string;
  SelfCareBriefSummary?: string;
  SelfCareLongerSummary?: string;
  MedicalTreatmentBriefSummary?: string;
  MedicalTreatmentLongerSummary?: string;
  ConditionBriefOverview?: string;
  ConditionLongerOverview?: string;
  PublicationDate?: string;
  PublicationDateAndTime?: string;
  LastModified?: string;
  DateCreated?: string;
  SourceKey?: string;
  Provider?: string;
}

export interface WHOApiResponse {
  '@odata.context'?: string;
  '@odata.count'?: number;
  value: WHORawFactsheet[];
}

export interface NormalizedHealthDocument {
  externalId: string;
  title: string;
  conditionName: string;
  topic: string;
  summary: string;
  fullContent: string;
  sections: {
    keyFacts?: string;
    overview?: string;
    symptoms?: string;
    prevention?: string;
    treatment?: string;
  };
  sourceUrl: string;
  publicationDate: string | null;
  lastModifiedDate: string | null;
  checksum: string;
  language: string;
  version: string;
  tags: string[];
}

export interface SyncSummary {
  sourceId: string;
  sourceName: string;
  totalFetched: number;
  inserted: number;
  updated: number;
  skippedUnchanged: number;
  errors: string[];
  startedAt: string;
  completedAt: string;
}

export interface ChatSession {
  id: string;
  user_id: string | null;
  title: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageSource {
  name: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  intent: string | null;
  urgency_level: UrgencyLevel;
  sources: ChatMessageSource[];
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  resource_type: 'disease' | 'document' | 'external_resource';
  resource_id: string;
  title: string;
  url: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  message_id: string | null;
  query_text: string;
  rating: 'positive' | 'negative';
  feedback_text: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  topic: string | null;
  language: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SafetyEvent {
  id: string;
  session_id: string | null;
  trigger_pattern: string;
  severity: 'moderate' | 'urgent' | 'critical';
  safety_classification: string;
  action_taken: string;
  created_at: string;
}

export interface ContentReview {
  id: string;
  document_id: string;
  reviewer_id: string | null;
  reviewer_name: string;
  stage: ContentStatus;
  comments: string | null;
  reviewed_at: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  created_at: string;
}
