import React, { useState, useEffect } from 'react';
import { 
  Loader2, Search, Filter, Mail, CheckCircle2, MoreVertical, ExternalLink, 
  ChevronLeft, ChevronRight, Send, Reply, Clock, User, AlertCircle, Calendar, Check 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminContact() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  
  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccessMsg, setReplySuccessMsg] = useState('');

  useEffect(() => {
    fetchQueries();
  }, [page, statusFilter, searchTerm]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit,
        status: statusFilter,
        search: searchTerm
      });
      const res = await fetch(`/api/admin/contact?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch contact queries');
      const json = await res.json();
      if (json.success) {
        setQueries(json.data.queries);
        setTotalPages(json.data.pagination.pages || 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      // Optimistic update
      setQueries(qs => qs.map(q => q._id === id ? { ...q, status: newStatus } : q));
      if (selectedQuery && selectedQuery._id === id) {
        setSelectedQuery({ ...selectedQuery, status: newStatus });
      }
      
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
    } catch (err) {
      alert(err.message);
      fetchQueries();
    }
  };

  const openQuery = (query) => {
    setSelectedQuery(query);
    setReplyText('');
    setReplyError('');
    setReplySuccessMsg('');
    setViewModalOpen(true);
    if (query.status === 'Unread') {
      updateStatus(query._id, 'Read');
    }
  };

  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!selectedQuery) return;

    const trimmed = replyText.trim();
    if (!trimmed) {
      setReplyError('Reply message cannot be empty.');
      return;
    }

    if (trimmed.length < 5) {
      setReplyError('Reply message must be at least 5 characters long.');
      return;
    }

    if (trimmed.length > 5000) {
      setReplyError('Reply message exceeds maximum length of 5000 characters.');
      return;
    }

    try {
      setSendingReply(true);
      setReplyError('');
      setReplySuccessMsg('');

      const res = await fetch(`/api/admin/contact/${selectedQuery._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Reply could not be sent.');
      }

      // Successful delivery: update selected query with new replies array and status
      const updated = json.data.query;
      setSelectedQuery(updated);
      setQueries(qs => qs.map(q => q._id === updated._id ? updated : q));
      setReplyText('');
      setReplySuccessMsg(`Reply successfully delivered to ${updated.email}!`);
    } catch (err) {
      setReplyError(err.message || 'Reply could not be sent. Please check SMTP configuration.');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Unread': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Read': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Replied': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Contact Queries</h2>
          <p className="text-sm font-mono text-slate-500">Manage messages from the public contact form.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search name, email, or subject..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset page on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset page on filter change
              }}
              className="w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
              <option value="Replied">Replied</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* List View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Sender</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-500">Loading queries...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No queries found matching your filters.
                  </td>
                </tr>
              ) : (
                queries.map((query) => (
                  <tr 
                    key={query._id} 
                    className={cn(
                      "hover:bg-slate-50 transition-colors group cursor-pointer",
                      query.status === 'Unread' ? 'bg-blue-50/50 font-medium' : ''
                    )}
                    onClick={() => openQuery(query)}
                  >
                    <td className="px-6 py-4">
                      <div className={cn("text-slate-900", query.status === 'Unread' ? 'font-bold' : 'font-semibold')}>{query.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Mail size={10}/> {query.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[250px] truncate text-slate-800" title={query.subject}>
                        {query.subject}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[250px]">
                        {query.message}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border", getStatusColor(query.status))}>
                        {query.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {query.status !== 'Resolved' && (
                          <button 
                            onClick={() => updateStatus(query._id, 'Resolved')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors" 
                            title="Mark Resolved"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && queries.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-mono text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900 truncate" title={selectedQuery.subject}>
                  {selectedQuery.subject}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400" />
                    Received: {new Date(selectedQuery.createdAt).toLocaleString()}
                  </span>
                  {selectedQuery.replies?.length > 0 && (
                    <span className="text-purple-600 font-semibold flex items-center gap-1">
                      <Reply size={12} />
                      {selectedQuery.replies.length} {selectedQuery.replies.length === 1 ? 'reply sent' : 'replies sent'}
                    </span>
                  )}
                </div>
              </div>
              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shrink-0 shadow-xs", getStatusColor(selectedQuery.status))}>
                {selectedQuery.status}
              </span>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {/* Sender Details */}
              <div className="flex gap-4 items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-11 h-11 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg uppercase shrink-0 border border-brand-primary/20">
                  {selectedQuery.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-sm">{selectedQuery.name}</div>
                  <a 
                    href={`mailto:${selectedQuery.email}`} 
                    className="text-brand-primary hover:underline text-xs flex items-center gap-1 mt-0.5 truncate"
                    title={selectedQuery.email}
                  >
                    <Mail size={12} />
                    {selectedQuery.email}
                    <ExternalLink size={11} className="opacity-60" />
                  </a>
                </div>
              </div>
              
              {/* Original Query Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" /> Original Inquiry
                  </span>
                  <span className="text-[11px]">{new Date(selectedQuery.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-body">
                    {selectedQuery.message}
                  </p>
                </div>
              </div>

              {/* Chronological Reply History */}
              {Array.isArray(selectedQuery.replies) && selectedQuery.replies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-slate-600 flex items-center gap-1.5">
                    <Clock size={13} className="text-purple-600" />
                    Conversation History ({selectedQuery.replies.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedQuery.replies.map((rep, idx) => (
                      <div key={idx} className="bg-purple-50/40 border border-purple-200/80 rounded-lg p-4 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-purple-900 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1">
                              <User size={12} className="text-purple-600" />
                              {rep.adminName || 'Brainstorm Admin'}
                            </span>
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-mono px-2 py-0.5 rounded font-medium border border-purple-200/60 flex items-center gap-1">
                              <Check size={10} /> Sent via Email
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px] font-mono">
                            {new Date(rep.sentAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="pl-3 border-l-2 border-purple-300">
                          <p className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-body">
                            {rep.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compose Email Reply Section */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                      <Reply size={13} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">Send Official Email Reply</h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Delivered to: <strong className="text-slate-700 font-semibold">{selectedQuery.email}</strong>
                  </span>
                </div>

                {replySuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    <span className="flex-1 font-medium">{replySuccessMsg}</span>
                  </div>
                )}

                {replyError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
                    <AlertCircle size={16} className="shrink-0 text-red-600" />
                    <span className="flex-1 font-medium">{replyError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => { setReplyText(e.target.value); setReplyError(''); }}
                    disabled={sendingReply}
                    rows={4}
                    placeholder={`Write your reply to ${selectedQuery.name} here...\n(Line breaks will be preserved in the delivered email)`}
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60 disabled:bg-slate-50 resize-y"
                  />
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 px-1">
                    <span>Min 5 characters</span>
                    <span className={cn(replyText.length > 5000 ? "text-red-500 font-bold" : "")}>
                      {replyText.length} / 5000
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setReplyText(''); setReplyError(''); }}
                    disabled={!replyText || sendingReply}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium disabled:opacity-40 disabled:hover:text-slate-500 transition-colors"
                  >
                    Clear Draft
                  </button>

                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim() || replyText.trim().length < 5 || replyText.trim().length > 5000}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingReply ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Sending via SMTP...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Send Email Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                {selectedQuery.status !== 'Resolved' ? (
                  <button 
                    onClick={() => {
                      updateStatus(selectedQuery._id, 'Resolved');
                      setViewModalOpen(false);
                    }}
                    className="px-3 py-2 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    Mark as Resolved
                  </button>
                ) : (
                  <span className="text-xs font-mono font-medium text-emerald-700 flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                    <CheckCircle2 size={14} /> Query is Resolved
                  </span>
                )}
              </div>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
