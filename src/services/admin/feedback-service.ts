import { supabase, isSupabaseConfigured } from '../database/supabase-client';
import { Feedback } from '../../types/database';

const LOCAL_FEEDBACK_KEY = 'healthwise_user_feedback';

export interface FeedbackSubmission {
  query_text: string;
  rating: 'positive' | 'negative';
  feedback_text?: string | null;
  message_id?: string | null;
  user_id?: string | null;
}

const DEFAULT_FEEDBACK: Feedback[] = [
  {
    id: 'fb-1',
    user_id: null,
    message_id: null,
    query_text: 'What are early symptoms of dengue?',
    rating: 'positive',
    feedback_text: 'Clear breakdown and emphasized hydration.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'fb-2',
    user_id: null,
    message_id: null,
    query_text: 'Can I stop my diabetes medicine if sugar is normal?',
    rating: 'positive',
    feedback_text: 'Safely redirected user to consult doctor without prescribing.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const feedbackService = {
  /**
   * Submit feedback on educational response (e.g. from Chat thumbs-up / thumbs-down)
   */
  async submitFeedback(payload: FeedbackSubmission): Promise<Feedback> {
    const newFeedback: Feedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: payload.user_id || null,
      message_id: payload.message_id || null,
      query_text: payload.query_text,
      rating: payload.rating,
      feedback_text: payload.feedback_text || (payload.rating === 'positive' ? 'Helpful educational response' : 'Needs review'),
      created_at: new Date().toISOString(),
    };

    // 1. Local storage persistence
    try {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      const items: Feedback[] = raw ? JSON.parse(raw) : [...DEFAULT_FEEDBACK];
      items.unshift(newFeedback);
      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(items.slice(0, 100)));
    } catch (err) {
      console.warn('[Feedback] Failed saving local feedback:', err);
    }

    // 2. Supabase persistence if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('feedback').insert({
          user_id: payload.user_id || undefined,
          message_id: payload.message_id || undefined,
          query_text: payload.query_text,
          rating: payload.rating,
          feedback_text: newFeedback.feedback_text,
        });
      } catch (err) {
        console.warn('[Feedback] Supabase feedback insert notice:', err);
      }
    }

    return newFeedback;
  },

  /**
   * Get feedback list for Admin Feedback page
   */
  async getFeedbackList(limit: number = 50): Promise<Feedback[]> {
    if (!isSupabaseConfigured) {
      try {
        const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
        return raw ? JSON.parse(raw) : DEFAULT_FEEDBACK;
      } catch {
        return DEFAULT_FEEDBACK;
      }
    }

    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) {
        const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
        return raw ? JSON.parse(raw) : DEFAULT_FEEDBACK;
      }
      return data as Feedback[];
    } catch {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_FEEDBACK;
    }
  },

  /**
   * Get feedback metrics summary
   */
  async getFeedbackStats(): Promise<{ total: number; positive: number; negative: number; positivePercentage: number }> {
    const list = await this.getFeedbackList(100);
    const total = list.length;
    const positive = list.filter((f) => f.rating === 'positive').length;
    const negative = total - positive;
    const positivePercentage = total > 0 ? Math.round((positive / total) * 100) : 100;

    return {
      total,
      positive,
      negative,
      positivePercentage,
    };
  },
};
