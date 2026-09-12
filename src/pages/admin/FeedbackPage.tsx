import React, { useState, useEffect } from 'react';
import { MessageSquareHeart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { feedbackService } from '../../services/admin/feedback-service';
import { Feedback } from '../../types/database';

export const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    async function loadFeedback() {
      try {
        const list = await feedbackService.getFeedbackList();
        setFeedbacks(list);
      } catch (err) {
        console.warn('[FeedbackPage] Failed loading feedback:', err);
      }
    }
    loadFeedback();
  }, []);

  const formatDate = (iso: string) => {
    try {
      return iso.split('T')[0];
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Feedback & Quality Audits</h1>
        <p className="text-xs text-slate-500 mt-1">Review user ratings on educational clarity and source usefulness.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Topic / Query</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">User Feedback</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feedbacks.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{f.query_text}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={f.rating === 'positive' ? 'success' : 'danger'} size="sm">
                      {f.rating === 'positive' ? 'Helpful' : 'Needs Review'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{f.feedback_text || '—'}</td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(f.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
