import React, { useState, useEffect } from 'react';
import { Loader2, Search, CheckCircle2, XCircle, Eye, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function PendingMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectMemberId, setRejectMemberId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingMembers();
  }, []);

  const fetchPendingMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/members?status=Pending');
      if (!res.ok) throw new Error('Failed to fetch pending members');
      const json = await res.json();
      if (json.status === 'success') {
        setMembers(json.data.members);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/admin/members/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to approve member');
      
      // Remove from list
      setMembers(members.filter(m => m._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectMemberId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectMemberId) return;
    try {
      setProcessingId(rejectMemberId);
      setRejectModalOpen(false);
      
      const res = await fetch(`/api/admin/members/${rejectMemberId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reject member');
      
      // Remove from list
      setMembers(members.filter(m => m._id !== rejectMemberId));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
      setRejectMemberId(null);
    }
  };

  const filteredMembers = members.filter(m => {
    return m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           m.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Pending Approvals</h2>
          <p className="text-sm font-mono text-slate-500">Review student self-registrations.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or registration number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {/* List View */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
              <p className="text-slate-500">Loading pending members...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              Error: {error}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">All Caught Up!</h3>
              <p className="text-slate-500 text-sm max-w-sm">There are no pending member registrations awaiting approval.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50">
              {filteredMembers.map((member) => (
                <div key={member._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="p-5 flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {member.photoId ? (
                        <img 
                          src={`/api/images/${member.photoId?.imageId || member.photoId}?variant=member_card`} 
                          alt={member.fullName} 
                          className="w-full h-full object-cover"
                          crossOrigin="use-credentials"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                          <Eye size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate" title={member.fullName}>{member.fullName}</h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{member.registrationNumber}</p>
                      <p className="text-xs text-brand-primary font-medium mt-1 truncate">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">Course</span>
                      <span className="font-medium text-slate-700 truncate block">{member.course}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">Section</span>
                      <span className="font-medium text-slate-700 truncate block">{member.section}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">Contact</span>
                      <span className="font-medium text-slate-700">{member.phone} {member.whatsapp && '(WA)'}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 mt-auto flex gap-3">
                    <button 
                      onClick={() => openRejectModal(member._id)}
                      disabled={processingId === member._id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(member._id)}
                      disabled={processingId === member._id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {processingId === member._id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Reject Member Registration</h3>
                <p className="text-sm text-slate-500 mt-1">This will deny the student's membership request. You can optionally provide a reason.</p>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Rejection Reason (Optional)</label>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Invalid photo, incomplete details..."
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
              ></textarea>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
