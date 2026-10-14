import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { UserFeedback } from '../../types';
import { 
  MessageSquareWarning, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown 
} from 'lucide-react';

export const FeedbackReviewList: React.FC = () => {
  const [feedbackItems, setFeedbackItems] = useState<UserFeedback[]>(() => 
    storageService.getFeedback()
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleUpdateStatus = (id: string, newStatus: UserFeedback['status']) => {
    storageService.updateFeedbackStatus(id, newStatus);
    setFeedbackItems(storageService.getFeedback());
  };

  const getStatusBadge = (status: UserFeedback['status']) => {
    switch (status) {
      case 'resolved':
      case 'approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const filtered = feedbackItems.filter(f => 
    statusFilter === 'all' ? true : f.status === statusFilter
  );

  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-5 shadow-sm space-y-4">
      {/* Header & Status Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <MessageSquareWarning className="w-4 h-4 text-teal-600" />
            <span>Community Feedback &amp; Inaccuracy Queue</span>
          </h3>
          <p className="text-xs text-navy-500 mt-0.5">
            Reports submitted by patients, healthcare staff, and Deaf citizens for dictionary refinement.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {['all', 'pending', 'under_review', 'approved', 'resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-teal-600 text-white'
                  : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-xs">
            No feedback items found in this filter category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-navy-100 bg-navy-50/40 space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] uppercase font-mono ${getStatusBadge(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-navy-900">
                    {item.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  {item.phraseText && (
                    <span className="text-navy-600 italic">
                      — "{item.phraseText}"
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-navy-500">
                  <span>Reported by: <strong className="capitalize">{item.reportedByRole.replace(/_/g, ' ')}</strong></span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Description & Details */}
              <p className="text-navy-800 leading-relaxed font-medium">
                {item.description}
              </p>

              {(item.detectedSign || item.expectedSign) && (
                <div className="flex items-center gap-4 text-[11px] text-navy-600 bg-white p-2 rounded-lg border border-navy-100">
                  {item.detectedSign && <div>Detected: <strong>{item.detectedSign}</strong></div>}
                  {item.expectedSign && <div>Expected: <strong className="text-teal-700">{item.expectedSign}</strong></div>}
                </div>
              )}

              {item.adminNotes && (
                <div className="text-[11px] text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-100">
                  <strong>Moderator Note:</strong> {item.adminNotes}
                </div>
              )}

              {/* Status Update Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-navy-200/50">
                <span className="text-[10px] text-navy-500 mr-1">Update Status:</span>
                <button
                  onClick={() => handleUpdateStatus(item.id, 'under_review')}
                  className="px-2 py-0.5 rounded border border-navy-200 hover:bg-white text-navy-700 text-[10px] font-semibold"
                >
                  Under Review
                </button>
                <button
                  onClick={() => handleUpdateStatus(item.id, 'approved')}
                  className="px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] font-bold"
                >
                  Approve Sign
                </button>
                <button
                  onClick={() => handleUpdateStatus(item.id, 'resolved')}
                  className="px-2 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-800 text-[10px] font-bold"
                >
                  Resolved
                </button>
                <button
                  onClick={() => handleUpdateStatus(item.id, 'rejected')}
                  className="px-2 py-0.5 rounded border border-rose-300 bg-rose-50 text-rose-800 text-[10px] font-bold"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
