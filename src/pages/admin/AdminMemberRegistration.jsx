import React, { useState, useEffect } from 'react';
import {
  UserPlus, ToggleLeft, ToggleRight, Loader2, CheckCircle2,
  AlertTriangle, Shield, ExternalLink, Info, X, Lock, Unlock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

/* ─── Confirm Dialog ─────────────────────────────────────────── */
function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, onConfirm, onCancel, tone }) {
  if (!open) return null;
  const isDanger = tone === 'danger';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={cn('p-5 border-b', isDanger ? 'border-red-100' : 'border-slate-200')}>
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl shrink-0 flex items-center justify-center',
              isDanger ? 'bg-red-50' : 'bg-spark/10'
            )}>
              <AlertTriangle size={20} className={isDanger ? 'text-red-500' : 'text-spark'} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-lg text-slate-900 leading-snug">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
        <div className="px-5 pb-5 pt-1 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold font-mono tracking-widest uppercase hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2.5 rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-colors focus:outline-none',
              isDanger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-brand-primary hover:bg-brand-secondary text-ink'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function AdminMemberRegistration() {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [isOpen,  setIsOpen]  = useState(false);
  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');
  const [confirm, setConfirm] = useState({ open: false, next: false });

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success && json.data.settings) {
        setIsOpen(json.data.settings.memberRegistrationOpen ?? false);
      }
    } catch {
      setError('Failed to load registration status.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntent = (next) => setConfirm({ open: true, next });

  const handleConfirm = async () => {
    const next = confirm.next;
    setConfirm(prev => ({ ...prev, open: false }));
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res  = await fetch('/api/admin/settings', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ memberRegistrationOpen: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update setting.');
      setIsOpen(json.data.settings.memberRegistrationOpen ?? next);
      setMessage(next
        ? 'Member registration is now OPEN. Students can apply.'
        : 'Member registration is now CLOSED. Students will see a closed notice.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-slate-400" size={32} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ConfirmDialog
        open={confirm.open}
        tone={confirm.next ? 'default' : 'danger'}
        title={confirm.next ? 'Open Member Registration?' : 'Close Member Registration?'}
        description={
          confirm.next
            ? 'Students will be able to access /members/register and submit their membership application.'
            : 'The /members/register page will show a Registration Closed message. Students will not be able to submit new applications.'
        }
        confirmLabel={confirm.next ? 'Yes, Open Registration' : 'Yes, Close Registration'}
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
      />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Member Registration Gate</h2>
          <p className="text-sm font-mono text-slate-500 mt-1">
            Control access to the public member registration page.
          </p>
        </div>
        <Link
          to="/members/register"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold tracking-widest uppercase text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
        >
          <ExternalLink size={14} />
          Preview Page
        </Link>
      </div>

      {/* ── Feedback banner ── */}
      {(message || error) && (
        <div className={cn(
          'p-4 rounded-lg flex items-center gap-3 border',
          message ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        )}>
          {message
            ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            : <Shield       size={18} className="text-red-500 shrink-0" />
          }
          <span className="text-sm font-medium">{message || error}</span>
        </div>
      )}

      {/* ── Main gate card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Status stripe */}
        <div className={cn(
          'px-6 py-3 flex items-center gap-2 border-b text-xs font-mono font-bold tracking-widest uppercase transition-colors',
          isOpen
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-red-50 border-red-100 text-red-600'
        )}>
          {isOpen
            ? <><Unlock size={13} className="shrink-0" /> Registration is OPEN — students can apply</>
            : <><Lock   size={13} className="shrink-0" /> Registration is CLOSED — students see a closed notice</>}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Info */}
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-14 h-14 rounded-xl shrink-0 flex items-center justify-center shadow-sm',
                isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
              )}>
                <UserPlus size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">/members/register</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md">
                  {isOpen
                    ? 'The registration page is publicly accessible. New students can submit a membership application.'
                    : 'The registration page is gated. Visitors will see a friendly closed notice instead of the form.'}
                </p>
              </div>
            </div>

            {/* Toggle button */}
            <button
              onClick={() => handleToggleIntent(!isOpen)}
              disabled={saving}
              className={cn(
                'flex items-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold text-sm tracking-wide uppercase shadow-sm transition-all shrink-0 disabled:opacity-60 disabled:cursor-not-allowed',
                isOpen
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-brand-primary hover:bg-brand-secondary text-ink'
              )}
            >
              {saving
                ? <Loader2 size={18} className="animate-spin" />
                : isOpen
                  ? <><ToggleLeft  size={18} /> Close Registration</>
                  : <><ToggleRight size={18} /> Open Registration</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Unlock size={14} className="text-emerald-600" />
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-900">When OPEN</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
              Students see the full membership application form
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
              New registrations are accepted and stored
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
              Admin receives notifications for new registrations
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
              <Lock size={14} className="text-red-500" />
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-900">When CLOSED</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
              Students see a "Registration Closed" notice instead of the form
            </li>
            <li className="flex items-start gap-2">
              <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
              A message directs them to contact the Brainstorm team
            </li>
            <li className="flex items-start gap-2">
              <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
              The page URL still works — it just shows the closed state
            </li>
          </ul>
        </div>
      </div>

      {/* ── Path note ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 leading-relaxed">
          <span className="font-bold text-slate-700">Affected routes:</span>{' '}
          <code className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">/members/register</code>{' '}
          and{' '}
          <code className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">/member/register</code>
          {' '}— both aliases are controlled by this single toggle.
        </div>
      </div>
    </div>
  );
}
