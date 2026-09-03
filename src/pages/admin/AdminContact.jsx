import React, { useState, useEffect } from 'react';
import { Loader2, Search, Filter, Mail, CheckCircle2, MoreVertical, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
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
    setViewModalOpen(true);
    if (query.status === 'Unread') {
      updateStatus(query._id, 'Read');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Unread': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Read': return 'bg-amber-100 text-amber-700 border-amber-200';
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedQuery.subject}</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Received: {new Date(selectedQuery.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border", getStatusColor(selectedQuery.status))}>
                {selectedQuery.status}
              </span>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex gap-4 items-start mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl uppercase shrink-0">
                  {selectedQuery.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{selectedQuery.name}</div>
                  <a href={`mailto:${selectedQuery.email}`} className="text-brand-primary hover:underline text-sm flex items-center gap-1 mt-0.5">
                    {selectedQuery.email}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              
              <div className="prose prose-sm prose-slate max-w-none">
                <p className="whitespace-pre-wrap">{selectedQuery.message}</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              {selectedQuery.status !== 'Resolved' && (
                <button 
                  onClick={() => {
                    updateStatus(selectedQuery._id, 'Resolved');
                    setViewModalOpen(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
