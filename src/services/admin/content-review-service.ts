import { supabase, isSupabaseConfigured } from '../database/supabase-client';
import { ContentReview, ContentStatus } from '../../types/database';

const LOCAL_REVIEWS_KEY = 'healthwise_content_reviews';

export interface ReviewItem {
  id: string;
  document_id: string;
  title: string;
  reviewer: string;
  stage: ContentStatus;
  date: string;
  comments: string | null;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    document_id: 'doc-wash-001',
    title: 'Water, Sanitation and Hygiene (WASH) Standards Update',
    reviewer: 'Awaiting Medical Reviewer',
    stage: 'review',
    date: '2025-09-10',
    comments: 'Pending review of clean water chlorination ratios.',
  },
  {
    id: 'rev-2',
    document_id: 'doc-je-002',
    title: 'Pediatric Japanese Encephalitis Vaccination Advisory',
    reviewer: 'Dr. R. Sharma (Public Health)',
    stage: 'approved',
    date: '2025-09-08',
    comments: 'Clinical accuracy verified against WHO guidelines.',
  },
  {
    id: 'rev-3',
    document_id: 'doc-rsv-003',
    title: 'Seasonal Respiratory Syncytial Virus (RSV) Awareness',
    reviewer: 'Clinical Audit Team',
    stage: 'draft',
    date: '2025-09-05',
    comments: 'Initial draft in progress.',
  },
];

export const contentReviewService = {
  /**
   * Get all content reviews
   */
  async getReviews(): Promise<ReviewItem[]> {
    if (!isSupabaseConfigured) {
      try {
        const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
        return raw ? JSON.parse(raw) : DEFAULT_REVIEWS;
      } catch {
        return DEFAULT_REVIEWS;
      }
    }

    try {
      const { data, error } = await supabase
        .from('content_reviews')
        .select('*')
        .order('reviewed_at', { ascending: false });

      if (error || !data || data.length === 0) {
        const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
        return raw ? JSON.parse(raw) : DEFAULT_REVIEWS;
      }

      return data.map((item: any) => ({
        id: item.id,
        document_id: item.document_id,
        title: item.title || 'Knowledge Document Review',
        reviewer: item.reviewer_name || 'Medical Reviewer',
        stage: item.stage as ContentStatus,
        date: item.reviewed_at ? item.reviewed_at.split('T')[0] : new Date().toISOString().split('T')[0],
        comments: item.comments || null,
      }));
    } catch {
      const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_REVIEWS;
    }
  },

  /**
   * Update review stage (draft -> review -> approved -> published -> archived)
   */
  async updateStage(reviewId: string, stage: ContentStatus, reviewerName?: string, comments?: string): Promise<boolean> {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    const reviews: ReviewItem[] = raw ? JSON.parse(raw) : [...DEFAULT_REVIEWS];
    const index = reviews.findIndex((r) => r.id === reviewId);

    if (index !== -1) {
      reviews[index].stage = stage;
      if (reviewerName) reviews[index].reviewer = reviewerName;
      if (comments !== undefined) reviews[index].comments = comments;
      localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('content_reviews')
          .update({
            stage,
            reviewer_name: reviewerName || undefined,
            comments: comments || undefined,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', reviewId);
      } catch (err) {
        console.warn('[ContentReview] Supabase update notice:', err);
      }
    }

    return true;
  },

  /**
   * Create a new content review entry
   */
  async createReview(title: string, documentId: string, reviewerName: string, stage: ContentStatus = 'review', comments?: string): Promise<ReviewItem> {
    const newItem: ReviewItem = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      document_id: documentId,
      title,
      reviewer: reviewerName,
      stage,
      date: new Date().toISOString().split('T')[0],
      comments: comments || null,
    };

    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    const reviews: ReviewItem[] = raw ? JSON.parse(raw) : [...DEFAULT_REVIEWS];
    reviews.unshift(newItem);
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('content_reviews').insert({
          document_id: documentId,
          reviewer_name: reviewerName,
          stage,
          comments,
        });
      } catch (err) {
        console.warn('[ContentReview] Supabase insert notice:', err);
      }
    }

    return newItem;
  },

  /**
   * Summary counts across stages
   */
  async getReviewStats(): Promise<{ pending: number; approved: number; draft: number; total: number }> {
    const list = await this.getReviews();
    return {
      pending: list.filter((r) => r.stage === 'review').length,
      approved: list.filter((r) => r.stage === 'approved' || r.stage === 'published').length,
      draft: list.filter((r) => r.stage === 'draft').length,
      total: list.length,
    };
  },
};
