import { useState, useEffect, useCallback } from 'react';
import {
  Lightbulb, Search, Filter, ChevronLeft, ChevronRight,
  X, FileText, ExternalLink, CheckCircle, Clock, Star,
  Zap, XCircle, ChevronDown, RefreshCw, Eye, AlertCircle,
  Download, Calendar, User, BookOpen, Phone
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

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: PAGE_LIMIT });
      if (activeStatus !== 'All') params.set('status', activeStatus);
      if (search)                 params.set('search', search);

      const res  = await fetch(`/api/admin/ideas?${params}`, { credentials: 'include' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || 'Failed to load ideas');
      setIdeas(json.data.ideas);
      setPagination(json.data.pagination);

      // Build status counts from the full dataset (separate count query)
      if (page === 1 && !search && activeStatus === 'All') {
        const counts = {};
        // Quick stats call — reuse same endpoint with each status
        await Promise.all(
          ['New', 'Reviewed', 'Shortlisted', 'Implemented', 'Rejected'].map(async (s) => {
            const r = await fetch(`/api/admin/ideas?status=${s}&limit=1`, { credentials: 'include' });
            const d = await r.json();
            counts[s] = d.data?.pagination?.total ?? 0;
          })
        );
        setStats(counts);
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
      const res  = await fetch(`/api/admin/ideas/${idea._id}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setSelected(json.data.idea);
      setPendingStatus(json.data.idea.status);
      setStatusNote(json.data.idea.adminNotes || '');
    } catch (e) {
      setDetailError(e.message || 'Could not load idea details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => { setSelected(null); setDetailError(''); };

  // ── Update status ──────────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!selected) return;
    setUpdatingStatus(true);
    try {
      const res  = await fetch(`/api/admin/ideas/${selected._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus, adminNotes: statusNote }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      // Update in list
      setIdeas(prev => prev.map(i => i._id === selected._id ? { ...i, status: pendingStatus, adminNotes: statusNote } : i));
      setSelected(prev => ({ ...prev, status: pendingStatus, adminNotes: statusNote }));
    } catch (e) {
      setDetailError(e.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Title', 'Submitted By', 'Course', 'Category', 'PDF', 'Status', 'Date', ''].map(h => (
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
                        <span className="inline-flex items-center gap-1 text-brand-primary font-mono text-[10px] font-bold">
                          <FileText size={12} /> PDF
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={idea.status} small />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{fmtDate(idea.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={e => { e.stopPropagation(); openDetail(idea); }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors"
                        aria-label="View idea"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              <button
                onClick={closeDetail}
                className="shrink-0 p-2 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
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
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
                      <div className="w-9 h-9 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{selected.pdfOriginalName || 'document.pdf'}</p>
                        {selected.pdfSizeBytes && (
                          <p className="text-xs text-slate-500 font-mono">{fmtSize(selected.pdfSizeBytes)}</p>
                        )}
                      </div>
                      {selected.pdfSignedUrl ? (
                        <a
                          href={selected.pdfSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase bg-brand-primary text-white rounded-sm hover:bg-brand-primary/80 transition-colors"
                        >
                          <Download size={12} /> View PDF
                        </a>
                      ) : (
                        <span className="shrink-0 text-xs text-slate-400 font-mono">Link expired</span>
                      )}
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
                </div>

              </div>
            )}
          </aside>
        </>
      )}
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
