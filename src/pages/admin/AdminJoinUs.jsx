import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Loader2, Search, Filter, Download, Eye, Pencil, CheckCircle2,
  XCircle, Trash2, PhoneCall, RotateCcw, X, AlertCircle,
  ChevronLeft, ChevronRight, UserCheck, MoreVertical
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ProtectedImage from '../../components/common/ProtectedImage';

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_STATUSES = ['New', 'Pending', 'Contacted', 'Approved', 'Onboarded', 'Rejected'];

const STATUS_META = {
  New:       { cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  Pending:   { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  Contacted: { cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  Approved:  { cls: 'bg-teal-100 text-teal-700 border-teal-200' },
  Onboarded: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Rejected:  { cls: 'bg-red-100 text-red-700 border-red-200' },
};

const PAGE_LIMIT = 20;

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.New;
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border', meta.cls)}>
      {status}
    </span>
  );
}

// ─── ActionMenu (dropdown) ────────────────────────────────────────────────────
function ActionMenu({ req, onView, onEdit, onApprove, onStatus, onDelete, processing }) {
  const [open, setOpen]   = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  // Close on scroll (so the fixed menu doesn't float away)
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [open]);

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, right: Math.max(8, window.innerWidth - rect.right) });
    }
    setOpen(v => !v);
  };

  const handle = (fn) => { setOpen(false); fn(); };
  const isActive = !['Onboarded', 'Rejected'].includes(req.status);

  const menu = open ? createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: coords.top, right: coords.right, zIndex: 9999 }}
      className="w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden py-1"
    >
      <MenuItem icon={Eye}      label="View Details"     onClick={() => handle(onView)} />
      <MenuItem icon={Pencil}   label="Edit"             onClick={() => handle(onEdit)} />
      <div className="my-1 border-t border-slate-100" />
      {req.status === 'New' && (
        <MenuItem icon={PhoneCall}   label="Mark Contacted"  onClick={() => handle(() => onStatus('Contacted'))} />
      )}
      {(req.status === 'New' || req.status === 'Contacted' || req.status === 'Pending') && (
        <MenuItem icon={UserCheck}   label="Mark Onboarded"  onClick={() => handle(() => onStatus('Onboarded'))}  color="emerald" />
      )}
      {isActive && (
        <MenuItem icon={CheckCircle2} label="Approve"         onClick={() => handle(onApprove)}  color="teal" />
      )}
      {req.status !== 'Rejected' && (
        <MenuItem icon={XCircle}     label="Reject"           onClick={() => handle(() => onStatus('Rejected', true))} color="red" />
      )}
      {req.status === 'Rejected' && (
        <MenuItem icon={RotateCcw}   label="Restore to New"  onClick={() => handle(() => onStatus('New'))} />
      )}
      <div className="my-1 border-t border-slate-100" />
      <MenuItem icon={Trash2}   label="Delete"           onClick={() => handle(onDelete)} color="red" />
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="flex justify-end">
        <button
          ref={btnRef}
          onClick={toggleOpen}
          disabled={!!processing}
          aria-label="Actions"
          aria-expanded={open}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          {processing ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
        </button>
      </div>
      {menu}
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick, color }) {
  const colorCls = color === 'red'
    ? 'text-red-600 hover:bg-red-50'
    : color === 'emerald'
    ? 'text-emerald-700 hover:bg-emerald-50'
    : color === 'teal'
    ? 'text-teal-700 hover:bg-teal-50'
    : 'text-slate-700 hover:bg-slate-50';

  return (
    <button
      onClick={onClick}
      className={cn('w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors', colorCls)}
    >
      <Icon size={14} className="shrink-0" />
      {label}
    </button>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ req, onClose }) {
  if (!req) return null;
  return (
    <Modal title="Application Details" onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Photo */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            {req.photoId?.imageId ? (
              <ProtectedImage imageId={req.photoId.imageId} variant="member_card" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No photo</div>
            )}
          </div>
          <StatusBadge status={req.status} />
        </div>

        {/* Details grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Field label="Full Name"     value={req.fullName} />
          <Field label="Reg. Number"   value={req.registrationNumber} mono />
          <Field label="Course"        value={req.course} />
          <Field label="Section"       value={req.section} />
          <Field label="Domain"        value={req.domain || 'Technical'} />
          <Field label="Email"         value={req.email} />
          <Field label="Phone"         value={req.phone} />
          {req.whatsapp && <Field label="WhatsApp" value={req.whatsapp} />}
          <Field label="Submitted"     value={fmt(req.createdAt)} />
          {req.approvedAt && <Field label="Approved At" value={fmt(req.approvedAt)} />}
          {req.rejectionReason && (
            <div className="sm:col-span-2">
              <Field label="Rejection Reason" value={req.rejectionReason} />
            </div>
          )}
          {req.interests?.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 mb-1.5">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {req.interests.map((i, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{i}</span>
                ))}
              </div>
            </div>
          )}
          {req.whyJoin && (
            <div className="sm:col-span-2">
              <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 mb-1.5">Why Join</p>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{req.whyJoin}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 mb-0.5">{label}</p>
      <p className={cn('text-slate-800 break-words', mono && 'font-mono text-xs')}>{value || '—'}</p>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ req, onClose, onSaved }) {
  const [form, setForm] = useState({
    fullName: req.fullName || '',
    course:   req.course   || '',
    section:  req.section  || '',
    domain:   req.domain   || 'Technical',
    email:    req.email    || '',
    phone:    req.phone    || '',
    whatsapp: req.whatsapp || '',
    whyJoin:  req.whyJoin  || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const res  = await fetch(`/api/admin/join-us/${req._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Save failed');
      onSaved(json.data.request);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all';
  const lbl = 'block text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 mb-1';

  return (
    <Modal title={`Edit — ${req.registrationNumber}`} onClose={onClose} maxWidth="max-w-xl">
      {err && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> {err}
        </div>
      )}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className={lbl}>Full Name</label>
          <input className={inp} value={form.fullName} onChange={e => setForm(p=>({...p,fullName:e.target.value}))} required />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={lbl}>Domain</label>
            <select className={inp} value={form.domain} onChange={e => setForm(p=>({...p,domain:e.target.value}))}>
              <option value="Technical">Technical</option>
              <option value="Media">Media</option>
              <option value="Anchor">Anchor</option>
              <option value="Coordinator">Coordinator</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Course</label>
            <input className={inp} value={form.course} onChange={e => setForm(p=>({...p,course:e.target.value}))} required />
          </div>
          <div>
            <label className={lbl}>Section</label>
            <input className={inp} value={form.section} onChange={e => setForm(p=>({...p,section:e.target.value}))} required />
          </div>
        </div>
        <div>
          <label className={lbl}>Email</label>
          <input className={inp} type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Phone</label>
            <input className={inp} value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} required />
          </div>
          <div>
            <label className={lbl}>WhatsApp</label>
            <input className={inp} value={form.whatsapp} onChange={e => setForm(p=>({...p,whatsapp:e.target.value}))} />
          </div>
        </div>
        <div>
          <label className={lbl}>Why Join</label>
          <textarea className={inp + ' resize-y min-h-[80px]'} value={form.whyJoin} onChange={e => setForm(p=>({...p,whyJoin:e.target.value}))} />
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2 shadow-sm">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Approve Modal ────────────────────────────────────────────────────────────
function ApproveModal({ req, onClose, onConfirm, processing }) {
  const [domain, setDomain] = useState(req.domain || 'Technical');
  
  const DOMAIN_ROLES_DEFAULT = {
    Technical: 'Technical Team',
    Media: 'Media Team',
    Anchor: 'Anchor',
    Coordinator: 'Coordinator',
  };

  const [role, setRole] = useState(DOMAIN_ROLES_DEFAULT[req.domain || 'Technical'] || 'Technical Team');

  const handleDomainChange = (newDomain) => {
    setDomain(newDomain);
    setRole(DOMAIN_ROLES_DEFAULT[newDomain] || 'Technical Team');
  };

  const allAvailableRoles = [
    { group: 'Team Roles (Default)', roles: ['Technical Team', 'Media Team', 'Anchor', 'Coordinator'] },
    { group: 'Admin-Only Leadership Positions', roles: ['Head Coordinator', 'Technical Head', 'Social Media Head'] },
    { group: 'Executive Positions', roles: ['President', 'Vice President', 'Secretary'] },
  ];

  return (
    <Modal title="Approve Application & Create Live Member" onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-start gap-3 mb-5 p-3 bg-teal-50 border border-teal-200 rounded-lg">
        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} />
        </div>
        <div className="text-xs text-teal-900 leading-relaxed">
          <p className="font-semibold text-sm">Approve {req.fullName} ({req.registrationNumber})</p>
          <p className="mt-0.5 text-teal-700">
            This will create a live, approved profile in the database. The candidate will immediately appear on the public <span className="font-mono font-bold">/members</span> page and in <span className="font-mono font-bold">Admin → Members</span>.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
          <div>
            <span className="text-slate-400 block uppercase text-[9px]">Course / Section</span>
            <span className="font-bold text-slate-800">{req.course} • Sec {req.section}</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase text-[9px]">Contact Email</span>
            <span className="font-bold text-slate-800 truncate block">{req.email}</span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 mb-1.5">
            Approved Domain *
          </label>
          <select
            value={domain}
            onChange={e => handleDomainChange(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="Technical">Technical</option>
            <option value="Media">Media</option>
            <option value="Anchor">Anchor</option>
            <option value="Coordinator">Coordinator</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 mb-1.5">
            Assigned Role / Position *
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            {allAvailableRoles.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="text-[10px] font-mono text-slate-400 mt-1">
            Admin-only positions (Head Coordinator, Technical Head, Social Media Head) can only be assigned by administrators here.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={processing}
          onClick={() => onConfirm({ domain, role })}
          className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center gap-2 shadow-sm"
        >
          {processing && <Loader2 size={14} className="animate-spin" />}
          Approve & Make Live
        </button>
      </div>
    </Modal>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────
function RejectModal({ req, onClose, onConfirm, processing }) {
  const [reason, setReason] = useState('');
  return (
    <Modal title="Reject Application" onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <AlertCircle size={18} />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          This will mark <strong className="text-slate-900">{req.fullName}</strong>'s application as Rejected. The record will be preserved.
        </p>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-mono font-bold tracking-widest uppercase text-slate-500 mb-1.5">Rejection Reason (optional)</label>
        <textarea
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Duplicate registration, incomplete details…"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
        <button
          onClick={() => onConfirm(reason)}
          disabled={processing}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2 shadow-sm"
        >
          {processing && <Loader2 size={14} className="animate-spin" />}
          Confirm Rejection
        </button>
      </div>
    </Modal>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ req, onClose, onConfirm, processing }) {
  return (
    <Modal title="Delete Application" onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <Trash2 size={18} />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Permanently delete <strong className="text-slate-900">{req.fullName}</strong>'s ({req.registrationNumber}) application? This cannot be undone.
        </p>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={processing}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2 shadow-sm"
        >
          {processing && <Loader2 size={14} className="animate-spin" />}
          Delete Permanently
        </button>
      </div>
    </Modal>
  );
}

// ─── Generic Modal wrapper ────────────────────────────────────────────────────
function Modal({ title, children, onClose, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={cn('bg-white rounded-xl shadow-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200', maxWidth)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-base font-heading font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminJoinUs() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage]               = useState(1);

  // Modal state
  const [viewReq, setViewReq]       = useState(null);
  const [editReq, setEditReq]       = useState(null);
  const [approveReq, setApproveReq] = useState(null);
  const [rejectReq, setRejectReq]   = useState(null);
  const [deleteReq, setDeleteReq]   = useState(null);
  const [toast, setToast]           = useState(null);  // { msg, type }

  // Per-row processing tracker
  const [processing, setProcessing] = useState({}); // { [id]: true }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page, limit: PAGE_LIMIT });
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res  = await fetch(`/api/admin/join-us?${params}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load');
      setRequests(json.data.joinRequests || []);
      // Handle both old shape (no pagination) and new shape (with pagination)
      if (json.data.pagination) {
        setPagination(json.data.pagination);
      } else {
        // Old backend: array returned directly, no pagination object
        const total = (json.data.joinRequests || []).length;
        setPagination({ page: 1, pages: 1, total });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Status update ─────────────────────────────────────────────────────────
  const doStatusUpdate = async (id, status, extra = {}) => {
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      const payload = {
        status,
        ...(typeof extra === 'string' ? { rejectionReason: extra } : {}),
        ...(extra?.rejectionReason ? { rejectionReason: extra.rejectionReason } : {}),
        ...(extra?.domain ? { domain: extra.domain } : {}),
        ...(extra?.role ? { role: extra.role } : {}),
      };
      const res  = await fetch(`/api/admin/join-us/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Update failed');
      setRequests(prev => prev.map(r => r._id === id ? { ...r, ...json.data.request } : r));
      showToast(status === 'Approved' ? 'Application approved & live member created!' : `Status updated to ${status}`);
      setRejectReq(null);
      setApproveReq(null);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const doDelete = async (id) => {
    setProcessing(p => ({ ...p, [id]: true }));
    try {
      const res  = await fetch(`/api/admin/join-us/${id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Delete failed');
      setRequests(prev => prev.filter(r => r._id !== id));
      setPagination(p => ({ ...p, total: Math.max(0, p.total - 1) }));
      showToast('Application deleted');
      setDeleteReq(null);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  // ── Edit saved ────────────────────────────────────────────────────────────
  const handleEditSaved = (updated) => {
    setRequests(prev => prev.map(r => r._id === updated._id ? { ...r, ...updated } : r));
    setEditReq(null);
    showToast('Changes saved');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 duration-300',
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        )}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Join Us Submissions</h2>
          <p className="text-sm font-mono text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${pagination?.total ?? 0} total submission${(pagination?.total ?? 0) !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => fetchRequests()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Loader2 size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50">
          <div className="relative flex-1 max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Search name, reg no, email…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all bg-white appearance-none"
            >
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" /> {error}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-500 bg-white">
              <tr>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap">Student</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap">Contact</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap hidden lg:table-cell">Interests</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap">Status</th>
                <th className="px-6 py-3.5 font-medium whitespace-nowrap hidden md:table-cell">Date</th>
                <th className="px-6 py-3.5 font-medium text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <p className="font-mono text-xs font-bold tracking-widest uppercase mb-1">No submissions found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 leading-tight">{req.fullName}</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{req.registrationNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{req.course} · {req.section}</p>
                      <span className="inline-block mt-1 font-mono text-[9px] font-bold tracking-wider uppercase text-brand-primary bg-brand-primary/5 border border-brand-primary/20 px-1.5 py-0.5 rounded">
                        {req.domain || 'Technical'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800">{req.phone}</p>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-[160px] truncate">{req.email}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {req.interests?.slice(0, 2).map((int, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{int}</span>
                        ))}
                        {req.interests?.length > 2 && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                            +{req.interests.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 hidden md:table-cell">
                      {fmt(req.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ActionMenu
                        req={req}
                        processing={processing[req._id]}
                        onView={() => setViewReq(req)}
                        onEdit={() => setEditReq(req)}
                        onApprove={() => setApproveReq(req)}
                        onStatus={(status, needsReason) => {
                          if (needsReason) { setRejectReq(req); }
                          else { doStatusUpdate(req._id, status); }
                        }}
                        onDelete={() => setDeleteReq(req)}
                      />
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
                  <div className="h-5 bg-slate-200 rounded w-16" />
                </div>
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))
          ) : requests.length === 0 ? (
            <div className="py-12 px-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <p className="font-mono text-xs font-bold tracking-widest uppercase mb-1 text-slate-500">No submissions found</p>
              <p className="text-sm text-slate-400">Try adjusting your search or filter</p>
            </div>
          ) : (
            requests.map(req => {
              const isActive = !['Onboarded', 'Rejected'].includes(req.status);
              return (
                <div
                  key={req._id}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3"
                >
                  {/* Card Header: Student Name + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm leading-snug break-words">
                        {req.fullName}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        {req.registrationNumber}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  {/* Academic & Domain Info */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="font-medium text-slate-800">
                      {req.course} · Sec {req.section}
                    </span>
                    <span className="inline-block font-mono text-[9px] font-bold tracking-wider uppercase text-brand-primary bg-brand-primary/5 border border-brand-primary/20 px-1.5 py-0.5 rounded">
                      {req.domain || 'Technical'}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono ml-auto">
                      {fmt(req.createdAt)}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    {req.phone && (
                      <a href={`tel:${req.phone}`} className="flex items-center gap-1 text-slate-700 hover:text-brand-primary transition-colors font-mono">
                        <PhoneCall size={12} className="text-slate-400 shrink-0" /> {req.phone}
                      </a>
                    )}
                    {req.email && (
                      <a href={`mailto:${req.email}`} className="flex items-center gap-1 text-slate-500 hover:text-brand-primary transition-colors truncate max-w-full">
                        <span className="truncate">{req.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Interests tags */}
                  {req.interests && req.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {req.interests.map((int, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                          {int}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mobile Actions Footer */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewReq(req)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Eye size={13} /> View
                    </button>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <button
                          onClick={() => setApproveReq(req)}
                          disabled={!!processing[req._id]}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                        >
                          <CheckCircle2 size={13} /> Approve
                        </button>
                      )}
                      <ActionMenu
                        req={req}
                        processing={processing[req._id]}
                        onView={() => setViewReq(req)}
                        onEdit={() => setEditReq(req)}
                        onApprove={() => setApproveReq(req)}
                        onStatus={(status, needsReason) => {
                          if (needsReason) { setRejectReq(req); }
                          else { doStatusUpdate(req._id, status); }
                        }}
                        onDelete={() => setDeleteReq(req)}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {(pagination?.pages ?? 1) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500 font-mono">
              Page {pagination?.page ?? 1} of {pagination?.pages ?? 1} · {pagination?.total ?? 0} results
            </p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page >= (pagination?.pages ?? 1)} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewReq  && <ViewModal   req={viewReq}   onClose={() => setViewReq(null)} />}
      {editReq  && <EditModal   req={editReq}   onClose={() => setEditReq(null)} onSaved={handleEditSaved} />}
      {approveReq && (
        <ApproveModal
          req={approveReq}
          processing={!!processing[approveReq._id]}
          onClose={() => setApproveReq(null)}
          onConfirm={({ domain, role }) => doStatusUpdate(approveReq._id, 'Approved', { domain, role })}
        />
      )}
      {rejectReq && (
        <RejectModal
          req={rejectReq}
          processing={!!processing[rejectReq._id]}
          onClose={() => setRejectReq(null)}
          onConfirm={(reason) => doStatusUpdate(rejectReq._id, 'Rejected', reason)}
        />
      )}
      {deleteReq && (
        <DeleteModal
          req={deleteReq}
          processing={!!processing[deleteReq._id]}
          onClose={() => setDeleteReq(null)}
          onConfirm={() => doDelete(deleteReq._id)}
        />
      )}
    </div>
  );
}
