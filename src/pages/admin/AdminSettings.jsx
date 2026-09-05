import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, Bell, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, onConfirm, onCancel, tone = 'default' }) {
  if (!open) return null;
  const toneClasses = tone === 'danger'
    ? {
        accent: 'bg-red-500',
        accentText: 'text-red-600',
        accentBg: 'bg-red-50',
        border: 'border-red-100',
        confirm: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      }
    : {
        accent: 'bg-brand-primary',
        accentText: 'text-brand-primary',
        accentBg: 'bg-brand-primary/5',
        border: 'border-slate-200',
        confirm: 'bg-brand-primary hover:bg-brand-secondary focus:ring-brand-primary'
      };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className={cn('p-5 border-b', toneClasses.border)}>
          <div className="flex items-start gap-3">
            <div className={cn('w-10 h-10 rounded-xl shrink-0 flex items-center justify-center', toneClasses.accentBg)}>
              <AlertTriangle size={20} className={toneClasses.accentText} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-lg text-slate-900 leading-snug">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
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
              'px-4 py-2.5 rounded-lg text-white text-xs font-bold font-mono tracking-widest uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
              toneClasses.confirm
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    publicSiteActive: true,
    registrationOpen: true,
    notificationsEnabled: {
      memberRegistration: true,
      joinUs: true,
      contactQuery: true,
      eventRegistration: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [confirmState, setConfirmState] = useState({
    open: false,
    target: null,
    tone: 'default',
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const json = await res.json();
      if (json.success && json.data.settings) {
        setSettings(json.data.settings);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (field, value, isNested = false, nestedKey = null) => {
    if (isNested) {
      setSettings(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedKey]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleMaintenanceToggle = (e) => {
    const next = e.target.checked;
    e.preventDefault();
    e.target.checked = settings.maintenanceMode;

    if (next === settings.maintenanceMode) return;

    if (next) {
      setConfirmState({
        open: true,
        target: 'maintenance-on',
        tone: 'danger',
        title: 'Enable Maintenance Mode?',
        description: 'Public visitors will temporarily see the maintenance page. Administrators will still be able to access the admin portal.',
        confirmLabel: 'Enable Maintenance',
        cancelLabel: 'Cancel'
      });
    } else {
      setConfirmState({
        open: true,
        target: 'maintenance-off',
        tone: 'default',
        title: 'Disable Maintenance Mode?',
        description: 'The public website will become available again to all visitors.',
        confirmLabel: 'Disable Maintenance',
        cancelLabel: 'Cancel'
      });
    }
  };

  const applyMaintenanceToggle = (target) => {
    const next = target === 'maintenance-on';
    setSettings(prev => ({ ...prev, maintenanceMode: next }));
  };

  const handleConfirm = () => {
    const { target } = confirmState;
    if (target === 'maintenance-on' || target === 'maintenance-off') {
      applyMaintenanceToggle(target);
    }
    setConfirmState(prev => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    setConfirmState(prev => ({ ...prev, open: false }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save settings');
      
      setSettings(json.data.settings);
      setMessage('Settings saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });
      
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Change password endpoint not implemented yet.');
      }
      
      setMessage('Password updated successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ConfirmDialog
        open={confirmState.open}
        tone={confirmState.tone}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div>
        <h2 className="text-2xl font-heading font-bold text-slate-900">System Settings</h2>
        <p className="text-sm font-mono text-slate-500">Manage your administrative preferences and security.</p>
      </div>

      {(message || error) && (
        <div className={cn("p-4 rounded-lg flex items-center gap-3 border", message ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800")}>
          {message ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Shield size={18} className="text-red-500" />}
          <span className="text-sm font-medium">{message || error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-1.5 shrink-0 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('account')}
            className={cn("text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-bold tracking-widest font-mono uppercase transition-colors whitespace-nowrap shrink-0", activeTab === 'account' ? "bg-white border border-slate-200 shadow-sm text-brand-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
          >
            Account Details
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={cn("text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-bold tracking-widest font-mono uppercase transition-colors whitespace-nowrap shrink-0", activeTab === 'security' ? "bg-white border border-slate-200 shadow-sm text-brand-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
          >
            Security
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={cn("text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-bold tracking-widest font-mono uppercase transition-colors whitespace-nowrap shrink-0", activeTab === 'notifications' ? "bg-white border border-slate-200 shadow-sm text-brand-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
          >
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={cn("text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-bold tracking-widest font-mono uppercase transition-colors whitespace-nowrap shrink-0", activeTab === 'system' ? "bg-white border border-slate-200 shadow-sm text-brand-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
          >
            System
          </button>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {activeTab === 'account' && (
            <div className="p-4 sm:p-8 space-y-6">
              <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-4">Account Information</h3>
              <div className="grid gap-6">
                <div>
                  <label className="block text-xs font-mono tracking-widest font-bold uppercase text-slate-500 mb-2">Admin Email</label>
                  <input type="email" value="admin@brainstorm.com" disabled className="w-full p-3 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm cursor-not-allowed" />
                  <p className="text-xs text-slate-400 mt-2">Email address is bound to the core admin system and cannot be changed here.</p>
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-widest font-bold uppercase text-slate-500 mb-2">Role</label>
                  <input type="text" value="ADMINISTRATOR" disabled className="w-full p-3 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm cursor-not-allowed font-mono tracking-widest" />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-widest font-bold uppercase text-slate-500 mb-2">Account Status</label>
                  <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono tracking-widest uppercase">ACTIVE</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-4 sm:p-8 space-y-6">
              <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-4">Update Password</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-mono tracking-widest font-bold uppercase text-slate-700 mb-2">Current Password</label>
                  <input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-widest font-bold uppercase text-slate-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-widest font-bold uppercase text-slate-700 mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-primary" 
                    required 
                  />
                </div>
                <button type="submit" disabled={saving} className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-slate-800 transition-colors flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} Update Password
                </button>
              </form>

              <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-4 mt-12">Login Security</h3>
              <div>
                <label className="block text-xs font-mono tracking-widest font-bold uppercase text-slate-500 mb-2">OTP Verification</label>
                <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono tracking-widest uppercase">ENABLED (MANDATORY)</span>
                <p className="text-xs text-slate-500 mt-2">OTP validation is enforced for all admin logins to ensure system security.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-4 sm:p-8 space-y-6">
              <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-4">Notification Preferences</h3>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Member Registrations</div>
                    <div className="text-xs text-slate-500">Receive alerts when new members apply.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.notificationsEnabled?.memberRegistration} onChange={(e) => handleSettingsChange('notificationsEnabled', e.target.checked, true, 'memberRegistration')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Join Us Requests</div>
                    <div className="text-xs text-slate-500">Receive alerts for Join Us form submissions.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.notificationsEnabled?.joinUs} onChange={(e) => handleSettingsChange('notificationsEnabled', e.target.checked, true, 'joinUs')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Contact Queries</div>
                    <div className="text-xs text-slate-500">Receive alerts for messages sent via the contact form.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.notificationsEnabled?.contactQuery} onChange={(e) => handleSettingsChange('notificationsEnabled', e.target.checked, true, 'contactQuery')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Event Registrations</div>
                    <div className="text-xs text-slate-500">Receive alerts when students register for events.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.notificationsEnabled?.eventRegistration} onChange={(e) => handleSettingsChange('notificationsEnabled', e.target.checked, true, 'eventRegistration')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={saving} className="px-6 py-3 bg-brand-primary text-white rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-brand-secondary transition-colors flex items-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="p-4 sm:p-8 space-y-6">
              <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-4">System Settings</h3>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-slate-900 text-sm">Public Site Active</div>
                      <span className={cn(
                        "inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase",
                        settings.publicSiteActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      )}>
                        {settings.publicSiteActive ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 max-w-sm">If disabled, the public website will show a maintenance message. Admin dashboard remains accessible.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" checked={settings.publicSiteActive} onChange={(e) => handleSettingsChange('publicSiteActive', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-slate-900 text-sm">Global Event Registration</div>
                      <span className={cn(
                        "inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase",
                        settings.registrationOpen
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      )}>
                        {settings.registrationOpen ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 max-w-sm">When disabled, no new event registrations will be accepted, regardless of individual event settings.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" checked={settings.registrationOpen} onChange={(e) => handleSettingsChange('registrationOpen', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>
                
                <div className={cn(
                  "flex items-center justify-between p-4 border rounded-lg transition-colors",
                  settings.maintenanceMode
                    ? "bg-red-50 border-red-200 ring-1 ring-red-200/60"
                    : "bg-red-50/60 border-red-100"
                )}>
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={cn(
                        "font-bold text-sm",
                        settings.maintenanceMode ? "text-red-800" : "text-red-700"
                      )}>
                        Maintenance Mode
                      </div>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase",
                        settings.maintenanceMode
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-700"
                      )}>
                        {settings.maintenanceMode && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        )}
                        {settings.maintenanceMode ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className={cn(
                      "text-xs max-w-sm",
                      settings.maintenanceMode ? "text-red-700" : "text-red-600"
                    )}>
                      Warning: Enabling this will put the entire system into maintenance state.
                    </div>
                    {settings.maintenanceMode && (
                      <div className="mt-3 p-3 rounded-lg bg-white/80 border border-red-100">
                        <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-red-500 font-bold mb-1">Active Status</div>
                        <div className="text-xs text-red-700 leading-relaxed">
                          Public pages display the maintenance overlay. Admin portal remains operational.
                        </div>
                      </div>
                    )}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={handleMaintenanceToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 shadow-inner"></div>
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={saving} className="px-6 py-3 bg-brand-primary text-white rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-brand-secondary transition-colors flex items-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save System Settings
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
