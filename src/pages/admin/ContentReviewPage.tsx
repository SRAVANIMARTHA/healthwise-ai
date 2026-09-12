import React, { useState, useEffect } from 'react';
import { FileCheck, Check, X, Eye } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { contentReviewService, ReviewItem } from '../../services/admin/content-review-service';

export const ContentReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [inspectItem, setInspectItem] = useState<ReviewItem | null>(null);

  const loadReviews = async () => {
    try {
      const data = await contentReviewService.getReviews();
      setReviews(data);
    } catch (err) {
      console.warn('[ContentReviewPage] Failed loading reviews:', err);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprove = async (id: string) => {
    await contentReviewService.updateStage(id, 'approved', 'Dr. Verified Reviewer');
    await loadReviews();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Content Review Lifecycle</h1>
        <p className="text-xs text-slate-500 mt-1">Lifecycle pipeline: Draft → Review → Approved → Published → Archived.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Content Title</th>
                <th className="py-3 px-4">Reviewer Assignment</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Lifecycle Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{r.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.reviewer}</td>
                  <td className="py-3.5 px-4 text-slate-500">{r.date}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={r.stage === 'approved' || r.stage === 'published' ? 'success' : r.stage === 'review' ? 'warning' : 'neutral'} size="sm">
                      {r.stage.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setInspectItem(inspectItem?.id === r.id ? null : r)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 mr-2"
                    >
                      {inspectItem?.id === r.id ? 'Close' : 'Inspect'}
                    </button>
                    {r.stage !== 'approved' && r.stage !== 'published' && (
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {inspectItem && (
          <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900">{inspectItem.title}</div>
            <div className="text-slate-600">{inspectItem.comments || 'No specific reviewer notes attached to this item.'}</div>
            <div className="text-[11px] text-slate-400">Document ID: {inspectItem.document_id} | Reviewer: {inspectItem.reviewer}</div>
          </div>
        )}
      </div>
    </div>
  );
};
