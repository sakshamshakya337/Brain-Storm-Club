import { useState, useEffect } from 'react';
import { Plus, Search, Shield, Calendar, Mail, Key, Clock, Settings, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminEventAdmins() {
  const [admins, setAdmins] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [credentialsModal, setCredentialsModal] = useState({ show: false, password: '', email: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventId: '',
    expiresAt: ''
  });

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/event-admins');
      const data = await res.json();
      if (res.ok) {
        setAdmins(data);
      } else {
        alert(data.message || 'Failed to fetch event admins');
      }
    } catch (err) {
      alert('Error fetching event admins');
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (res.ok) {
        setEvents(data.data?.events || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    Promise.all([fetchAdmins(), fetchEvents()]).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/event-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        alert('Event Admin created successfully');
        setShowCreateModal(false);
        setCredentialsModal({
          show: true,
          email: formData.email,
          password: data.tempPassword
        });
        setFormData({ name: '', email: '', eventId: '', expiresAt: '' });
        fetchAdmins();
      } else {
        alert(data.message || 'Failed to create event admin');
      }
    } catch (err) {
      alert('Error creating event admin');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/event-admins/${id}/disable`, {
        method: 'PATCH',
      });
      if (res.ok) {
        alert(`Admin ${currentStatus ? 'disabled' : 'enabled'} successfully`);
        fetchAdmins();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleResetPassword = async (id, email) => {
    if (!window.confirm(`Are you sure you want to reset the password for ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/event-admins/${id}/reset-password`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok) {
        alert('Password reset successfully');
        setCredentialsModal({
          show: true,
          email,
          password: data.tempPassword
        });
      } else {
        alert('Failed to reset password');
      }
    } catch (err) {
      alert('Error resetting password');
    }
  };

  const handleExtendExpiration = async (id, currentExpires) => {
    const defaultDate = new Date(currentExpires).toISOString().slice(0,16);
    const newExpires = window.prompt("Enter new expiration date (YYYY-MM-DDTHH:mm):", defaultDate);
    if (!newExpires) return;

    try {
      const res = await fetch(`/api/admin/event-admins/${id}/extend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresAt: new Date(newExpires).toISOString() })
      });
      if (res.ok) {
        alert('Expiration extended successfully');
        fetchAdmins();
      } else {
        alert('Failed to extend expiration');
      }
    } catch (err) {
      alert('Error extending expiration');
    }
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Email: ${credentialsModal.email}\nPassword: ${credentialsModal.password}`);
    alert('Credentials copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">Event Admins</h1>
          <p className="text-sm text-slate-500 mt-1">Manage temporary event-day operational accounts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={18} />
          Create Event Admin
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
              <tr>
                <th className="px-6 py-4">Name / Email</th>
                <th className="px-6 py-4">Assigned Event</th>
                <th className="px-6 py-4">Expiration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Shield className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No Event Admins</p>
                    <p className="text-sm">Create an event admin to delegate scanning access.</p>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isExpired = new Date(admin.expiresAt) < new Date();
                  return (
                    <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold shrink-0">
                            {admin.name ? admin.name.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{admin.name || 'Unnamed Admin'}</div>
                            <div className="text-slate-500 text-xs">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar size={14} className="text-brand-primary" />
                          <span className="font-medium truncate max-w-[200px]" title={admin.assignedEventId?.title}>
                            {admin.assignedEventId?.title || 'Unknown Event'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit",
                          isExpired ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          <Clock size={12} />
                          {new Date(admin.expiresAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          admin.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", admin.isActive ? "bg-emerald-500" : "bg-red-500")}></span>
                          {admin.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResetPassword(admin._id, admin.email)}
                            className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors"
                            title="Reset Password"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            onClick={() => handleExtendExpiration(admin._id, admin.expiresAt)}
                            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                            title="Extend Expiration"
                          >
                            <Clock size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                            className={cn(
                              "p-1.5 rounded-md transition-colors",
                              admin.isActive 
                                ? "text-slate-400 hover:text-red-500 hover:bg-red-50" 
                                : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
                            )}
                            title={admin.isActive ? "Disable Admin" : "Enable Admin"}
                          >
                            {admin.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl mt-10 mb-10 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]">
            <div className="p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-heading font-bold text-slate-900">Create Event Admin</h2>
              <p className="text-sm text-slate-500 mt-1">This account will be restricted to a single event.</p>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="create-event-admin-form" onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                    placeholder="e.g. John Scanner"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                    placeholder="admin@event.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Event</label>
                  <select
                    required
                    value={formData.eventId}
                    onChange={(e) => setFormData({...formData, eventId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm bg-white"
                  >
                    <option value="">Select an event...</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiration Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">The account will be automatically disabled after this time.</p>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-event-admin-form"
                className="px-6 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {credentialsModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden text-center p-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key size={32} />
            </div>
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">Credentials Generated</h2>
            <p className="text-sm text-slate-500 mb-6">
              Please copy these credentials now. <strong className="text-red-500">The password will not be shown again.</strong>
            </p>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6 text-left space-y-3">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</div>
                <div className="font-mono text-slate-900 bg-white px-3 py-2 rounded border border-slate-200 select-all">
                  {credentialsModal.email}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Temporary Password</div>
                <div className="font-mono text-slate-900 bg-white px-3 py-2 rounded border border-slate-200 select-all">
                  {credentialsModal.password}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={copyCredentials}
                className="w-full px-6 py-3 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setCredentialsModal({ show: false, password: '', email: '' })}
                className="w-full px-6 py-3 bg-white text-slate-600 font-medium rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                I have saved these credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
