import React, { useState, useEffect } from 'react';
import { Loader2, Search, Filter, MoreVertical, Edit, Trash2, Eye, Mail, Phone, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Fetching only approved members for the main management view
      // We use the admin endpoint so we get sensitive fields like email and phone
      const res = await fetch('/api/admin/members?status=Approved');
      if (!res.ok) throw new Error('Failed to fetch members');
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

  const openEditModal = (member) => {
    setEditingMember({ ...member });
    setEditModalOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/members/${editingMember._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editingMember.fullName,
          course: editingMember.course,
          section: editingMember.section,
          role: editingMember.role,
          phone: editingMember.phone,
          email: editingMember.email,
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update member');
      
      // Update local state
      setMembers(members.map(m => m._id === editingMember._id ? data.data.member : m));
      setEditModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this member? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete member');
      
      // Remove from local state
      setMembers(members.filter(m => m._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Unique roles for filter dropdown
  const uniqueRoles = [...new Set(members.map(m => m.role))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Live Members</h2>
          <p className="text-sm font-mono text-slate-500">Manage all approved club members.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/control/members/pending" className="px-4 py-2 bg-white border border-brand-primary text-brand-primary rounded-md text-sm font-medium hover:bg-brand-primary/5 transition-colors shadow-sm">
            Pending Approvals
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
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
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none bg-white"
            >
              <option value="All">All Roles</option>
              {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Members Grid / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium w-16">Photo</th>
                <th className="px-6 py-4 font-medium">Member Details</th>
                <th className="px-6 py-4 font-medium">Academics</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-500">Loading members...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No approved live members found. Check "Pending Approvals" for new registrations.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        {member.photoId ? (
                          <img 
                            src={`/api/images/${member.photoId?.imageId || member.photoId}?variant=member_card`} 
                            alt={member.fullName} 
                            className="w-full h-full object-cover"
                            crossOrigin="use-credentials"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Eye size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{member.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{member.registrationNumber}</div>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Mail size={12}/> {member.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12}/> {member.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{member.course}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Section: {member.section}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold tracking-wide">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(member)}
                          className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors" 
                          title="Edit Member"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(member._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                          title="Delete Member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Edit Member</h3>
              <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-700">{editingMember.registrationNumber}</span>
            </div>
            
            <form onSubmit={handleEditSave}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editingMember.fullName}
                    onChange={(e) => setEditingMember({...editingMember, fullName: e.target.value})}
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Course</label>
                    <input 
                      type="text" 
                      value={editingMember.course}
                      onChange={(e) => setEditingMember({...editingMember, course: e.target.value})}
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Section</label>
                    <input 
                      type="text" 
                      value={editingMember.section}
                      onChange={(e) => setEditingMember({...editingMember, section: e.target.value})}
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Role (Admin Only)</label>
                  <select 
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-white"
                  >
                    <option value="Technical Team">Technical Team</option>
                    <option value="Media Team">Media Team</option>
                    <option value="Anchor">Anchor</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Head Coordinator">Head Coordinator</option>
                    <option value="Technical Head">Technical Head</option>
                    <option value="Social Media Head">Social Media Head</option>
                    <option value="Vice President">Vice President</option>
                    <option value="President">President</option>
                    <option value="Faculty">Faculty</option>
                    <option value="HOS">HOS</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={editingMember.email}
                      onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={editingMember.phone}
                      onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-secondary transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
