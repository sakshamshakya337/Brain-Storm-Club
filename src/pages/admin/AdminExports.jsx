import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileDown,
  Loader2,
  CheckCircle2,
  Users,
  UserPlus,
  MessageSquare,
  CalendarDays,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Resource definitions ───────────────────────────────────────────────────
const RESOURCES = [
  {
    id: 'members',
    label: 'Members',
    description: 'Live & pending member profiles',
    icon: Users,
  },
  {
    id: 'join-requests',
    label: 'Join Requests',
    description: 'Join Us form submissions',
    icon: UserPlus,
  },
  {
    id: 'contact-queries',
    label: 'Contact Queries',
    description: 'Public contact messages',
    icon: MessageSquare,
  },
  {
    id: 'event-registrations',
    label: 'Event Registrations',
    description: 'Event attendee records',
    icon: CalendarDays,
  },
];

const STATUS_OPTIONS = {
  members: ['All', 'Live', 'Approved', 'Pending', 'Rejected'],
  'join-requests': ['All', 'New', 'Contacted', 'Onboarded', 'Rejected'],
  'contact-queries': ['All', 'Unread', 'Read', 'Resolved'],
  'event-registrations': ['All', 'Registered', 'Participated', 'Completed', 'No-show', 'Certificate Issued'],
};

const FORMATS = [
  {
    id: 'excel',
    label: 'Excel',
    ext: '.xlsx',
    icon: FileSpreadsheet,
    activeClass: 'bg-emerald-50 border-emerald-500 text-emerald-800',
    iconClass: 'text-emerald-600',
  },
  {
    id: 'csv',
    label: 'CSV',
    ext: '.csv',
    icon: FileText,
    activeClass: 'bg-amber-50 border-amber-500 text-amber-800',
    iconClass: 'text-amber-600',
  },
  {
    id: 'pdf',
    label: 'PDF',
    ext: '.pdf',
    icon: FileDown,
    activeClass: 'bg-red-50 border-red-500 text-red-800',
    iconClass: 'text-red-600',
  },
];

// ─── Toast notification ──────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border animate-in slide-in-from-bottom-4 duration-300',
        type === 'success'
          ? 'bg-white border-emerald-200 text-emerald-800'
          : 'bg-white border-red-200 text-red-800'
      )}
    >
      {type === 'success' ? (
        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-red-500 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// ─── Step label ──────────────────────────────────────────────────────────────
function StepLabel({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white font-mono text-xs font-bold shrink-0">
        {number}
      </span>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-mono">
        {label}
      </h3>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminExports() {
  const [resource, setResource] = useState('members');
  const [format, setFormat] = useState('excel');
  const [status, setStatus] = useState('All');
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');

  // Reset status when resource changes
  useEffect(() => {
    setStatus('All');
  }, [resource]);

  // Fetch events for Event Registrations selector
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const res = await fetch('/api/admin/events');
        if (res.ok) {
          const json = await res.json();
          const evList = json.data?.events || [];
          setEvents(evList);
          if (evList.length > 0) setSelectedEventId(evList[0]._id);
        }
      } catch (_) {
        // Events list is optional; graceful fail
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleExport = async (e) => {
    e.preventDefault();
    setExporting(true);
    setToast(null);
    try {
      const queryParams = new URLSearchParams({
        resource,
        format,
        ...(status !== 'All' && { status }),
        ...(resource === 'event-registrations' && selectedEventId && { eventId: selectedEventId }),
      });

      const res = await fetch(`/api/admin/exports?${queryParams.toString()}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Export failed. Please try again.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'excel' ? 'xlsx' : format;
      a.download = `${resource}_export_${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToast({ message: 'Export generated successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Unable to generate the export. Please try again.', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const statusOptions = STATUS_OPTIONS[resource] || ['All'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── Page Header (matches other admin pages) ── */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-900">Data Exports</h2>
        <p className="text-sm font-mono text-slate-500">Download club data in Excel, CSV, or PDF format.</p>
      </div>

      {/* ── Main Card — full available width, no max-w-2xl ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleExport}>

          {/* ── Section 1: Resource ── */}
          <div className="p-6 md:p-8 border-b border-slate-100">
            <StepLabel number="1" label="Select Resource" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {RESOURCES.map(({ id, label, description, icon: Icon }) => {
                const isSelected = resource === id;
                return (
                  <label
                    key={id}
                    className={cn(
                      'flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-150 select-none',
                      isSelected
                        ? 'bg-brand-primary/5 border-brand-primary shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="resource"
                      value={id}
                      checked={isSelected}
                      onChange={() => setResource(id)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                        isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <span
                        className={cn(
                          'block text-sm font-semibold leading-snug',
                          isSelected ? 'text-brand-primary' : 'text-slate-800'
                        )}
                      >
                        {label}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5 leading-snug">{description}</span>
                    </div>
                    {/* Keyboard-accessible selected indicator */}
                    {isSelected && (
                      <CheckCircle2 size={16} className="text-brand-primary ml-auto shrink-0 mt-0.5" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Section 1.5: Event Selector (conditional) ── */}
          {resource === 'event-registrations' && (
            <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <StepLabel number="1.5" label="Select Event" />
              <div className="max-w-md relative">
                <label className="block text-xs text-slate-500 font-medium mb-1.5">
                  Target Event
                </label>
                {eventsLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading events…</span>
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-sm text-slate-400 font-mono py-2">No events found.</p>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      required
                      className="w-full appearance-none p-3 pr-10 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none bg-white transition-all"
                    >
                      {events.map((ev) => (
                        <option key={ev._id} value={ev._id}>
                          {ev.title} — {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Section 2: Filters ── */}
          <div className="px-6 md:px-8 py-6 border-b border-slate-100">
            <StepLabel number="2" label="Apply Filters" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1.5">Status</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none p-3 pr-10 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none bg-white transition-all"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt === 'All' ? 'All Statuses' : opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400 font-mono">
              Leave filters at "All" to export every record for the selected resource.
            </p>
          </div>

          {/* ── Section 3: Format ── */}
          <div className="px-6 md:px-8 py-6 border-b border-slate-100">
            <StepLabel number="3" label="Select Format" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FORMATS.map(({ id, label, ext, icon: Icon, activeClass, iconClass }) => {
                const isSelected = format === id;
                return (
                  <label
                    key={id}
                    className={cn(
                      'flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-150 select-none',
                      isSelected ? activeClass : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                    )}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={id}
                      checked={isSelected}
                      onChange={() => setFormat(id)}
                      className="sr-only"
                    />
                    <Icon size={22} className={isSelected ? iconClass : 'text-slate-400'} />
                    <div>
                      <span className="block text-sm font-semibold">{label}</span>
                      <span className="text-xs opacity-70">{ext}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} className={cn('ml-auto shrink-0', iconClass)} />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Generate Button ── */}
          <div className="px-6 md:px-8 py-5 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-mono max-w-sm">
              The export will be downloaded directly to your device.
            </p>
            <button
              type="submit"
              disabled={exporting || (resource === 'event-registrations' && !selectedEventId && events.length > 0)}
              className="flex items-center gap-2.5 px-7 py-3 bg-brand-primary text-white rounded-lg text-sm font-bold font-mono tracking-widest uppercase hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {exporting ? (
                <>
                  <Loader2 className="animate-spin" size={17} />
                  Generating…
                </>
              ) : (
                <>
                  <Download size={17} />
                  Generate Export
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
