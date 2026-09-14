import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MessageSquare, Trash2, CalendarDays, Loader2, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function EventFeedback() {
  const { id } = useParams();
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, averageRating: 0 });
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/admin/events/${id}/feedback`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // fallback if cookie auth fails
        }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to load feedback');
      
      setFeedbacks(data.data.feedbacks);
      setStats(data.data.stats);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const handleDelete = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      const res = await fetch(`/api/admin/events/${id}/feedback/${feedbackId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete feedback');
      
      // Update locally
      setFeedbacks(feedbacks.filter(f => f._id !== feedbackId));
      setStats(prev => ({
        total: prev.total - 1,
        averageRating: prev.total > 1 ? ((prev.averageRating * prev.total - feedbacks.find(f => f._id === feedbackId).rating) / (prev.total - 1)).toFixed(1) : 0
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={16} 
            className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
          />
        ))}
      </div>
    );
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error && feedbacks.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Error Loading Feedback</h3>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={fetchFeedback} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link to={`/control/events/${id}/entries`} className="hover:text-brand-primary transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Event Entries
            </Link>
          </div>
          <h2 className="text-3xl font-heading font-bold text-slate-900">Event Feedback</h2>
          <p className="text-sm text-slate-500 mt-1">
            View attendee feedback and analytics.
          </p>
        </div>
        
        <button 
          onClick={fetchFeedback}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto text-sm font-medium"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Star size={32} className="fill-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Average Rating</p>
            <p className="text-4xl font-heading font-bold text-slate-900">{stats.averageRating} <span className="text-lg text-slate-400 font-medium">/ 5</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <MessageSquare size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Reviews</p>
            <p className="text-4xl font-heading font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-heading font-semibold text-slate-800">Recent Feedback</h3>
        </div>
        
        {feedbacks.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-700 mb-1">No feedback yet</h4>
            <p className="text-slate-500 text-sm">When attendees submit feedback, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbacks.map((f) => (
              <div key={f._id} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-slate-900">{f.name}</h4>
                    <span className="text-xs text-slate-500 font-mono">{new Date(f.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {renderStars(f.rating)}
                    <button 
                      onClick={() => handleDelete(f._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Feedback"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {f.comment && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg mt-2">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{f.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
