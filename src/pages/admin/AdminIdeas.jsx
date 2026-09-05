import { useState, useEffect, useCallback } from 'react';
import {
  Lightbulb, Search, Filter, ChevronLeft, ChevronRight,
  X, FileText, ExternalLink, CheckCircle, Clock, Star,
  Zap, XCircle, ChevronDown, RefreshCw, Eye, AlertCircle,
  Download, Calendar, User, BookOpen, Phone, Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUSES = ['All', 'New', 'Reviewed', 'Shortlisted', 'Implemented', 'Rejected'];

const STATUS_META = {
  New:         { color: 'bg-blue-100 text-blue-700 border-blue-200',         icon: Clock,         dot: 'bg-blue-500' },
  Reviewed:    { color: 'bg-yellow-100 text-yellow-700 border-yellow-200',   icon: Eye,           dot: 'bg-yellow-500' },
  Shortlisted: { color: 'bg-purple-100 text-purple-700 border-purple-200',   icon: Star,          dot: 'bg-purple-500' },
  Implemented: { color: 'bg-green-100 text-green-700 border-green-200',      icon: CheckCircle,   dot: 'bg-green-500' },
  Rejected:    { color: 'bg-red-100 text-red-700 border-red-200',            icon: XCircle,       dot: 'bg-red-500' },
};

const PAGE_LIMIT = 15;

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtSize(bytes) {
  if (!bytes) return null;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, small = false }) {
  const meta = STATUS_META[status] || STATUS_META.New;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-mono font-bold tracking-widest uppercase border rounded-sm',
      small ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1',
      meta.color
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', meta.dot)} />
      {status}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminIdeas() {
  // List state
  const [ideas, setIdeas]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [stats, setStats]           = useState({});

  // Filter / search state
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [page, setPage]             = useState(1);

  // Detail panel state
  const [selected, setSelected]     = useState(null);   // idea object
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError]     = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote]         = useState('');
  const [pendingStatus, setPendingStatus]   = useState('');
  const [pdfViewerOpen, setPdfViewerOpen]   = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget]     = useState(null); // idea to delete
  const [deleting, setDeleting]             = useState(false);
  const [deleteError, setDeleteError]       = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deleteTarget) {
          if (!deleting) {
            setDeleteTarget(null);
            setDeleteError('');
          }
        } else if (pdfViewerOpen) {
          setPdfViewerOpen(false);
        } else if (selected) {
          closeDetail();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteTarget, deleting, pdfViewerOpen, selected]);

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: PAGE_LIMIT });
      if (activeStatus !== 'All') params.set('status', activeStatus);
      if (search)                 params.set('search', search);

      const res = await fetch(`/api/admin/ideas?${params}`, { credentials: 'include' });
      const contentType = res.headers.get('content-type') || '';
      let json = null;
      if (contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      if (!res.ok) throw new Error(json?.message || 'Failed to load ideas');
      setIdeas(json.data.ideas || []);
      setPagination(json.data.pagination || { page: 1, pages: 1, total: 0 });

      if (json.data.statusCounts) {
        setStats(json.data.statusCounts);
      }
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [page, activeStatus, search]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Fetch detail ───────────────────────────────────────────────────────────
  const openDetail = async (idea) => {
    setSelected(idea);
    setPendingStatus(idea.status);
    setStatusNote(idea.adminNotes || '');
    setDetailError('');

    // Fetch fresh copy (includes signed PDF URL)
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/ideas/${idea._id}`, { credentials: 'include' });
      const contentType = res.headers.get('content-type') || '';
      let json = null;
      if (contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      if (!res.ok) throw new Error(json?.message || 'Could not load idea details');
      setSelected(json.data.idea);
      setPendingStatus(json.data.idea.status);
      setStatusNote(json.data.idea.adminNotes || '');
    } catch (e) {
      setDetailError(e.message || 'Could not load idea details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setDetailError('');
    setPdfViewerOpen(false);
  };

  // ── Update status ──────────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!selected) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/ideas/${selected._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus, adminNotes: statusNote }),
      });
      const contentType = res.headers.get('content-type') || '';
      let json = null;
      if (contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      if (!res.ok) throw new Error(json?.message || 'Failed to update status');

      // Update in list
      setIdeas(prev => prev.map(i => i._id === selected._id ? { ...i, status: pendingStatus, adminNotes: statusNote } : i));
      setSelected(prev => ({ ...prev, status: pendingStatus, adminNotes: statusNote }));
    } catch (e) {
      setDetailError(e.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Delete idea ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/ideas/${deleteTarget._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const contentType = res.headers.get('content-type') || '';
      let json = null;
      if (contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      if (!res.ok) throw new Error(json?.message || 'Failed to delete idea');

      // If the deleted idea is currently open in detail panel, close it
      if (selected && selected._id === deleteTarget._id) {
        closeDetail();
      }

      // Remove from list
      setIdeas(prev => prev.filter(i => i._id !== deleteTarget._id));

      // Update pagination count
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));

      // Decrement status count in stats
      if (deleteTarget.status && stats[deleteTarget.status] !== undefined) {
        setStats(prev => ({
          ...prev,
          [deleteTarget.status]: Math.max(0, (prev[deleteTarget.status] || 1) - 1)
        }));
      }

      setDeleteTarget(null);
    } catch (e) {
      setDeleteError(e.message || 'Failed to delete idea');
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const totalAll = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 min-h-full bg-slate-50">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Lightbulb size={16} />
            </div>
            <h1 className="font-heading font-bold text-xl text-slate-900 tracking-tight">Submit Ideas</h1>
          </div>
          <p className="text-sm text-slate-500 font-body ml-11">
            {loading ? 'Loading…' : `${pagination.total} total submission${pagination.total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => { setPage(1); fetchIdeas(); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 bg-white rounded-md hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      {Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STATUSES.filter(s => s !== 'All').map(s => {
            const meta = STATUS_META[s];
            const Icon = meta.icon;
            return (
              <button
                key={s}
                onClick={() => { setActiveStatus(s); setPage(1); }}
                className={cn(
                  'flex flex-col items-start p-4 bg-white rounded-md border shadow-sm transition-all hover:shadow-md text-left',
                  activeStatus === s ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-slate-200'
                )}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <Icon size={14} className="text-slate-400" />
                  <span className={cn('w-2 h-2 rounded-full', meta.dot)} />
                </div>
                <div className="font-heading font-bold text-2xl text-slate-900">{stats[s] ?? 0}</div>
                <div className="font-mono text-[9px] font-bold tracking-widest uppercase text-slate-500 mt-0.5">{s}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title, name, description…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-slate-900 placeholder-slate-400"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <Filter size={14} className="text-slate-400 hidden sm:block" />
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setActiveStatus(s); setPage(1); }}
              className={cn(
                'px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase rounded-sm border transition-colors',
                activeStatus === s
                  ? 'bg-brand-primary border-brand-primary text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Title', 'Submitted By', 'Course', 'Category', 'PDF', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : ideas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Lightbulb size={32} />
                      <p className="font-mono text-xs font-bold tracking-widest uppercase">No ideas found</p>
                      <p className="text-sm">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ideas.map(idea => (
                  <tr
                    key={idea._id}
                    onClick={() => openDetail(idea)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-sm font-semibold text-slate-900 truncate">{idea.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{idea.description}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-slate-800 font-medium">{idea.name}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{idea.course} / {idea.section}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {idea.category ? (
                        <span className="inline-block font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-sm border border-slate-200">
                          {idea.category}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {idea.pdfPublicId ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1.5 text-brand-primary font-mono text-[10px] font-bold">
                            <FileText size={12} />
                            <span className="max-w-[130px] truncate" title={idea.pdfOriginalName?.toLowerCase().endsWith('.pdf') ? idea.pdfOriginalName : `${idea.pdfOriginalName || 'document'}.pdf`}>
                              {idea.pdfOriginalName?.toLowerCase().endsWith('.pdf') ? idea.pdfOriginalName : `${idea.pdfOriginalName || 'document'}.pdf`}
                            </span>
                          </span>
                          {idea.pdfSizeBytes && (
                            <span className="text-[9px] text-slate-400 font-mono ml-4">
                              {fmtSize(idea.pdfSizeBytes)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={idea.status} small />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{fmtDate(idea.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); openDetail(idea); }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                          aria-label="View idea details"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setDeleteError('');
                            setDeleteTarget(idea);
                          }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Delete idea"
                          title="Delete Idea"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Grid View */}
        <div className="md:hidden p-3.5 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-5 bg-slate-200 rounded w-1/2" />
                  <div className="h-5 bg-slate-200 rounded w-20" />
                </div>
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          ) : ideas.length === 0 ? (
            <div className="py-12 px-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <Lightbulb className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="font-mono text-xs font-bold tracking-widest uppercase text-slate-600">No ideas found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            ideas.map(idea => (
              <div
                key={idea._id}
                onClick={() => openDetail(idea)}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3 cursor-pointer hover:border-slate-300 transition-all"
              >
                {/* Header: Title + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm leading-snug break-words">
                      {idea.title}
                    </h4>
                    {idea.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {idea.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <StatusBadge status={idea.status} small />
                  </div>
                </div>

                {/* Submitter & Academics */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div>
                    <span className="font-medium text-slate-800">{idea.name}</span>
                    <span className="text-slate-400 font-mono text-[11px] ml-2">({idea.course} / {idea.section})</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {fmtDate(idea.createdAt)}
                  </span>
                </div>

                {/* Category & PDF */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {idea.category && (
                    <span className="inline-block font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-sm border border-slate-200">
                      {idea.category}
                    </span>
                  )}
                  {idea.pdfPublicId && (
                    <span className="inline-flex items-center gap-1 text-brand-primary font-mono text-[10px] font-bold bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/20">
                      <FileText size={12} />
                      <span className="max-w-[140px] truncate">
                        {idea.pdfOriginalName?.toLowerCase().endsWith('.pdf') ? idea.pdfOriginalName : `${idea.pdfOriginalName || 'document'}.pdf`}
                      </span>
                      {idea.pdfSizeBytes && (
                        <span className="text-[9px] text-slate-400 font-normal ml-0.5">
                          ({fmtSize(idea.pdfSizeBytes)})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); openDetail(idea); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors"
                  >
                    <Eye size={13} /> View Details
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setDeleteError('');
                      setDeleteTarget(idea);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500 font-mono">
              Page {pagination.page} of {pagination.pages} &nbsp;·&nbsp; {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, pagination.pages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-7 h-7 rounded-md text-xs font-mono font-bold border transition-colors',
                      p === page
                        ? 'bg-brand-primary border-brand-primary text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Panel (slide-over) ──────────────────────────────────────── */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
            onClick={closeDetail}
          />

          {/* Panel */}
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0 gap-4">
              <div className="min-w-0">
                <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-primary mb-1">
                  IDEA DETAIL
                </div>
                <h2 className="font-heading font-bold text-lg text-slate-900 truncate">{selected.title}</h2>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError('');
                    setDeleteTarget(selected);
                  }}
                  className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  aria-label="Delete idea"
                  title="Delete Idea"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="p-2 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <RefreshCw size={24} className="animate-spin text-slate-300" />
              </div>
            ) : detailError ? (
              <div className="flex-1 flex items-center justify-center px-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertCircle size={32} className="text-red-400" />
                  <p className="text-sm text-red-600">{detailError}</p>
                  <button onClick={() => openDetail(selected)} className="text-xs text-brand-primary underline">Retry</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">

                {/* Status Badge */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <StatusBadge status={selected.status} />
                  <span className="text-xs text-slate-500 font-mono">{fmtDate(selected.createdAt)}</span>
                </div>

                {/* Meta grid */}
                <div className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-slate-100">
                  <MetaField icon={User}     label="Submitted By" value={selected.name} />
                  <MetaField icon={Phone}    label="Contact"      value={selected.contact} />
                  <MetaField icon={BookOpen} label="Course"       value={`${selected.course} / ${selected.section}`} />
                  <MetaField icon={Calendar} label="Date"         value={fmtDate(selected.createdAt)} />
                  {selected.category && (
                    <MetaField icon={Filter} label="Category" value={selected.category} className="col-span-2" />
                  )}
                </div>

                {/* Description */}
                <div className="px-6 py-5 border-b border-slate-100">
                  <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">DESCRIPTION</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-body">{selected.description}</p>
                </div>

                {/* Expected Outcome */}
                <div className="px-6 py-5 border-b border-slate-100">
                  <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">EXPECTED OUTCOME</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-body">{selected.outcome}</p>
                </div>

                {/* PDF Attachment */}
                {selected.pdfPublicId && (
                  <div className="px-6 py-5 border-b border-slate-100">
                    <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">ATTACHMENT</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {selected.pdfOriginalName?.toLowerCase().endsWith('.pdf') ? selected.pdfOriginalName : `${selected.pdfOriginalName || 'document'}.pdf`}
                          </p>
                          {selected.pdfSizeBytes && (
                            <p className="text-xs text-slate-500 font-mono">{fmtSize(selected.pdfSizeBytes)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setPdfViewerOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase bg-brand-primary text-white rounded-sm hover:bg-brand-primary/80 transition-colors cursor-pointer shadow-sm"
                        >
                          <Eye size={12} /> View PDF
                        </button>
                        <a
                          href={`/api/admin/ideas/${selected._id}/pdf?download=1`}
                          download={selected.pdfOriginalName?.toLowerCase().endsWith('.pdf') ? selected.pdfOriginalName : `${selected.pdfOriginalName || 'document'}.pdf`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-sm transition-colors cursor-pointer shadow-sm"
                        >
                          <Download size={12} /> Download PDF
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Status Update ─────────────────────────────────────── */}
                <div className="px-6 py-5">
                  <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-4">UPDATE STATUS</p>

                  {detailError && (
                    <div className="mb-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                      <AlertCircle size={14} className="shrink-0" />
                      {detailError}
                    </div>
                  )}

                  {/* Status selector */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {STATUSES.filter(s => s !== 'All').map(s => {
                      const meta = STATUS_META[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setPendingStatus(s)}
                          className={cn(
                            'px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase rounded-sm border transition-all',
                            pendingStatus === s
                              ? `${meta.color} ring-2 ring-offset-1 ring-brand-primary`
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>

                  {/* Admin notes */}
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400">
                      ADMIN NOTES (optional)
                    </label>
                    <textarea
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="Add internal notes about this idea…"
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-slate-900 placeholder-slate-400 resize-y min-h-[72px] font-body"
                    />
                  </div>

                  <button
                    onClick={handleStatusUpdate}
                    disabled={updatingStatus || (pendingStatus === selected.status && statusNote === (selected.adminNotes || ''))}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white text-sm font-heading font-semibold tracking-wider uppercase rounded-sm hover:bg-brand-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-primary/20"
                  >
                    {updatingStatus ? (
                      <><RefreshCw size={14} className="animate-spin" /> Saving…</>
                    ) : (
                      <>Save Changes</>
                    )}
                  </button>

                  {/* Danger Zone */}
                  <div className="mt-8 pt-5 border-t border-slate-200">
                    <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-red-500 mb-2">
                      DANGER ZONE
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError('');
                        setDeleteTarget(selected);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-bold tracking-wider uppercase text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200 rounded-sm transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} /> Delete Idea Submission
                    </button>
                  </div>
                </div>

              </div>
            )}
          </aside>
        </>
      )}

      {/* ── IN-PAGE PDF VIEWER MODAL ────────────────────────────────────────── */}
      {pdfViewerOpen && selected && (selected.pdfSignedUrl || selected.pdfPublicId) && (
        <PdfViewerModal idea={selected} onClose={() => setPdfViewerOpen(false)} />
      )}

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          idea={deleteTarget}
          deleting={deleting}
          error={deleteError}
          onClose={() => {
            if (!deleting) {
              setDeleteTarget(null);
              setDeleteError('');
            }
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

// ─── Delete Modal Component ──────────────────────────────────────────────────
function DeleteModal({ idea, deleting, error, onClose, onConfirm }) {
  const displayName = idea.pdfOriginalName?.toLowerCase().endsWith('.pdf')
    ? idea.pdfOriginalName
    : (idea.pdfOriginalName ? `${idea.pdfOriginalName}.pdf` : null);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm Delete Idea"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Trash2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-base text-slate-900 mb-1">
                Delete Idea Submission
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-body">
                Are you sure you want to permanently delete <strong className="text-slate-900 font-semibold">{idea.title}</strong> submitted by <strong className="text-slate-900 font-semibold">{idea.name}</strong>?
              </p>

              {idea.pdfPublicId && (
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  <FileText size={14} className="shrink-0 text-amber-600" />
                  <span className="truncate">The attached PDF ({displayName || 'document'}) will also be permanently deleted from storage.</span>
                </div>
              )}

              {error && (
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={deleting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase text-slate-700 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={onConfirm}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase text-white bg-red-600 rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {deleting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper component ─────────────────────────────────────────────────────────
function MetaField({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-1.5">
        <Icon size={11} className="text-slate-400" />
        <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-slate-400">{label}</span>
      </div>
      <p className="text-sm text-slate-800 font-medium leading-snug">{value || '—'}</p>
    </div>
  );
}

// ─── PDF Viewer Modal Component ─────────────────────────────────────────────
function PdfViewerModal({ idea, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blobUrl, setBlobUrl] = useState(null);

  const displayName = idea.pdfOriginalName?.toLowerCase().endsWith('.pdf')
    ? idea.pdfOriginalName
    : `${idea.pdfOriginalName || 'document'}.pdf`;

  const fallbackUrl = idea.pdfSignedUrl || `/api/admin/ideas/${idea._id}/pdf`;

  const fetchPdf = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/ideas/${idea._id}/pdf`, {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired or unauthorized. Please log in.');
        if (res.status === 404) throw new Error('PDF file not found in storage.');
        throw new Error(`Failed to load PDF (HTTP ${res.status}).`);
      }

      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setBlobUrl(url);
    } catch (err) {
      console.error('[PdfViewerModal fetch error]', err);
      setError(err.message || 'Unable to load this PDF.');
    } finally {
      setLoading(false);
    }
  }, [idea._id]);

  useEffect(() => {
    fetchPdf();
  }, [fetchPdf]);

  // Clean up object URL on unmount or URL change
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="PDF Document Viewer"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-5xl h-[92vh] max-h-[900px] bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col overflow-hidden">

        {/* Viewer Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded bg-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-sm text-white truncate">
                {displayName}
              </h3>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                {idea.pdfSizeBytes && <span>{fmtSize(idea.pdfSizeBytes)}</span>}
                {idea.pdfSizeBytes && <span>•</span>}
                <span className="text-brand-primary uppercase truncate max-w-[200px]">{idea.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download Button */}
            {blobUrl ? (
              <a
                href={blobUrl}
                download={displayName}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                title={`Download ${displayName}`}
              >
                <Download size={13} />
                <span className="hidden sm:inline">Download</span>
              </a>
            ) : (
              <a
                href={`/api/admin/ideas/${idea._id}/pdf?download=1`}
                download={displayName}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                title={`Download ${displayName}`}
              >
                <Download size={13} />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            {/* Open in New Tab */}
            <a
              href={blobUrl || fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
              aria-label="Close PDF viewer (Esc)"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 w-full bg-slate-100 relative overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-50 p-8">
              <RefreshCw size={32} className="animate-spin text-brand-primary" />
              <p className="font-heading font-semibold text-slate-800 text-base">Loading PDF...</p>
              <p className="text-xs text-slate-500 font-mono">Fetching document securely</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-slate-900 text-base mb-1">Unable to load this PDF</h4>
                <p className="text-xs text-slate-600 font-body">{error}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={fetchPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold tracking-wider uppercase bg-brand-primary text-white rounded hover:bg-brand-primary/90 transition-colors cursor-pointer shadow-sm"
                >
                  <RefreshCw size={13} /> Retry
                </button>
                <a
                  href={`/api/admin/ideas/${idea._id}/pdf?download=1`}
                  download={displayName}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold tracking-wider uppercase bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer shadow-sm"
                >
                  <Download size={13} /> Download PDF
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-mono font-bold tracking-wider uppercase bg-slate-200 text-slate-700 hover:bg-slate-300 rounded transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : blobUrl ? (
            <object
              data={`${blobUrl}#toolbar=1&navpanes=1`}
              type="application/pdf"
              className="w-full h-full"
            >
              <embed
                src={`${blobUrl}#toolbar=1&navpanes=1`}
                type="application/pdf"
                className="w-full h-full"
              />
              <iframe
                src={`${blobUrl}#toolbar=1&navpanes=1`}
                className="w-full h-full border-0"
                title={displayName}
              >
                <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
                  <p className="text-sm text-slate-700 mb-3 font-body">Your browser does not support inline PDF viewing.</p>
                  <a
                    href={blobUrl}
                    download={displayName}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded uppercase tracking-wider shadow-sm"
                  >
                    <Download size={14} /> Download PDF
                  </a>
                </div>
              </iframe>
            </object>
          ) : null}
        </div>
      </div>
    </div>
  );
}
