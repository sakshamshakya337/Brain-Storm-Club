import React, { useState, useEffect } from 'react';
import { Loader2, Search, Filter, Download, MoreVertical, Check, PhoneCall, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminJoinUs() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Ensure backend route for GET /api/admin/join-us exists. We'll create it next.
      const res = await fetch('/api/admin/join-us');
      if (!res.ok) throw new Error('Failed to fetch join requests');
      const json = await res.json();
      if (json.success) {
        setRequests(json.data.joinRequests);
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
      setRequests(reqs => reqs.map(r => r._id === id ? { ...r, status: newStatus } : r));
      
      const res = await fetch(`/api/admin/join-us/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      alert(err.message);
      // Revert on error
      fetchRequests();
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Onboarded': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Join Us Submissions</h2>
          <p className="text-sm font-mono text-slate-500">Manage student expressions of interest.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search name, reg no, course..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Onboarded">Onboarded</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Student Details</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Interests</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-500">Loading submissions...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No submissions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{req.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{req.registrationNumber}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{req.course} - {req.section}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{req.phone} {req.whatsapp && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1 font-bold">WA</span>}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{req.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate text-slate-600" title={req.whyJoin}>
                        {req.whyJoin}
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {req.interests?.slice(0, 2).map((int, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                            {int}
                          </span>
                        ))}
                        {req.interests?.length > 2 && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                            +{req.interests.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border", getStatusColor(req.status))}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {req.status === 'New' && (
                          <button onClick={() => updateStatus(req._id, 'Contacted')} className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md transition-colors" title="Mark Contacted">
                            <PhoneCall size={16} />
                          </button>
                        )}
                        {(req.status === 'New' || req.status === 'Contacted') && (
                          <button onClick={() => updateStatus(req._id, 'Onboarded')} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors" title="Mark Onboarded">
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                          <MoreVertical size={16} />
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
    </div>
  );
}
