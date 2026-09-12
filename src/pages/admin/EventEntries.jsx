import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Search, Filter, Calendar, MapPin, Clock, Download, ArrowLeft, XCircle, FileText, CheckCircle, Users, Trash2, ExternalLink, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import ProtectedImage from '../../components/common/ProtectedImage';

export default function EventEntries() {
  const { id } = useParams();
  
  const [event, setEvent] = useState(null);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchEntries();
  }, [id, pagination.page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        fetchEntries();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/events/${id}/entries?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || 'Failed to fetch entries');
        } catch {
          throw new Error(`HTTP Error ${res.status}`);
        }
      }
      
      const json = await res.json();
      if (json.status === 'success') {
        setEvent(json.data.event);
        setEntries(json.data.registrations);
        setStats(json.data.stats);
        setPagination(json.data.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    window.location.href = `/api/admin/exports?resource=event-registrations&eventId=${id}&format=${format}`;
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this registration? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/events/${id}/entries/${entryId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete');
      }
      
      if (selectedEntry && selectedEntry._id === entryId) {
        setDetailsModalOpen(false);
      }
      
      fetchEntries(); // Refresh
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (entryId, field, value) => {
    try {
      const body = { [field]: value };
      const res = await fetch(`/api/admin/events/${id}/entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      
      // Update local state
      setEntries(entries.map(e => e._id === entryId ? data.data.entry : e));
      if (selectedEntry && selectedEntry._id === entryId) {
        setSelectedEntry(data.data.entry);
      }
      
      // Update stats manually for speed
      setStats(prev => {
        const ns = { ...prev };
        if (field === 'status') {
          // crude re-fetch would be better but this is simpler
          fetchEntries(); 
        }
        if (field === 'paymentStatus') fetchEntries();
        return ns;
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleRowExpand = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Registered': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Participated': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Certificate Issued': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'No-show': return 'bg-red-50 text-red-700 border-red-200';
      case 'verified': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getName = (entry) => entry.leader?.fullName || entry.fullName || 'Unknown';
  const getRegNo = (entry) => entry.leader?.registrationNumber || entry.registrationNumber || '-';
  const getEmail = (entry) => entry.leader?.email || entry.email || '-';
  const getPhone = (entry) => entry.leader?.phone || entry.phone || '-';
  const getCourse = (entry) => entry.leader?.course || entry.course || '-';
  const getSection = (entry) => entry.leader?.section || entry.section || '-';
  const isTeam = (entry) => entry.registrationType === 'team';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER SECTION WITH EVENT DETAILS */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex gap-6 z-10 w-full md:w-auto">
          {event ? (
            <>
              <div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                 <ProtectedImage 
                    imageId={event.posterId?.imageId || event.posterId} 
                    variant="event_card" 
                    alt={event.title} 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
              </div>
              <div className="flex flex-col justify-center">
                <Link to="/control/events" className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 hover:text-brand-primary flex items-center gap-1 mb-2 transition-colors">
                  <ArrowLeft size={12} /> BACK TO EVENTS
                </Link>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-heading font-bold text-slate-900 uppercase tracking-tight">{event.title}</h1>
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-sm">
                    {event.category}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-xs text-slate-600 font-mono tracking-wide">
                  <div className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {new Date(event.date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> {event.venue}</div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", event.registrationOpen ? "bg-emerald-500" : "bg-slate-400")}></div>
                    {event.registrationOpen ? "REG OPEN" : "REG CLOSED"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-32 flex items-center gap-4">
              <div className="w-24 h-32 bg-slate-100 animate-pulse rounded-lg"></div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div>
                <div className="h-8 w-48 bg-slate-100 animate-pulse rounded"></div>
                <div className="h-4 w-32 bg-slate-100 animate-pulse rounded mt-2"></div>
              </div>
            </div>
          )}
        </div>
        <div className="z-10 w-full md:w-auto flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
          <button onClick={() => fetchEntries()} className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 px-3 py-1 rounded-md hover:bg-slate-50">
            Refresh Data
          </button>
          {event && (
            <Link to={`/events/${event.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              View Public Event <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
            <Users size={14} className="text-brand-primary" /> Total Reg
          </div>
          <div className="text-3xl font-heading font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-500" /> Confirmed
          </div>
          <div className="text-3xl font-heading font-bold text-slate-900">{stats.confirmed}</div>
        </div>
        {event?.paymentRequired ? (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <Clock size={14} className="text-yellow-500" /> Pmt Pending
            </div>
            <div className="text-3xl font-heading font-bold text-slate-900">{stats.pending}</div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <XCircle size={14} className="text-red-500" /> Cancelled
            </div>
            <div className="text-3xl font-heading font-bold text-slate-900">{stats.cancelled}</div>
          </div>
        )}
        <div className="bg-brand-primary/5 p-5 rounded-xl border border-brand-primary/20 shadow-sm flex flex-col justify-center items-center group cursor-pointer hover:bg-brand-primary/10 transition-colors" onClick={() => handleExport('csv')}>
          <Download size={24} className="text-brand-primary mb-2 group-hover:-translate-y-1 transition-transform" />
          <div className="text-brand-primary text-xs font-mono font-bold tracking-widest uppercase text-center">Export CSV</div>
        </div>
      </div>

      {/* MAIN DATA TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, reg number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg">
              {['All', 'Registered', 'Participated', 'No-show'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn("px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all", statusFilter === status ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200")}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Loading registrations...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <XCircle className="mb-4" size={32} />
              <p>{error}</p>
              <button onClick={fetchEntries} className="mt-4 text-brand-primary underline text-sm">Try Again</button>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <FileText className="mb-4 opacity-20" size={48} />
              <p className="text-lg font-medium text-slate-700">No Registrations Found</p>
              <p className="text-sm mt-1">There are no entries matching your current filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-mono font-bold tracking-widest uppercase text-slate-500">
                  <th className="p-4 w-10"></th>
                  <th className="p-4 whitespace-nowrap">Participant</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Type</th>
                  {event?.paymentRequired && <th className="p-4">Payment</th>}
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <React.Fragment key={entry._id}>
                    <tr className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4">
                        {isTeam(entry) && entry.members?.length > 0 && (
                          <button onClick={() => toggleRowExpand(entry._id)} className="text-slate-400 hover:text-brand-primary">
                            {expandedRows.has(entry._id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 whitespace-nowrap">{getName(entry)}</div>
                        <div className="font-mono text-xs font-bold text-slate-500 whitespace-nowrap">{getRegNo(entry)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-900">{getEmail(entry)}</div>
                        <div className="text-xs text-slate-500 font-mono">{getPhone(entry)}</div>
                      </td>
                      <td className="p-4">
                        <span className={cn("px-2.5 py-1 text-xs font-medium rounded-md border", isTeam(entry) ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-700 border-slate-200")}>
                          {isTeam(entry) ? 'Team' : 'Individual'}
                        </span>
                      </td>
                      {event?.paymentRequired && (
                        <td className="p-4">
                          <select 
                            value={entry.paymentStatus || 'pending'}
                            onChange={(e) => handleUpdateStatus(entry._id, 'paymentStatus', e.target.value)}
                            className={cn("px-2 py-1.5 text-xs font-medium rounded-md border outline-none cursor-pointer", getStatusColor(entry.paymentStatus || 'pending'))}
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      )}
                      <td className="p-4 whitespace-nowrap">
                        <select 
                          value={entry.status}
                          onChange={(e) => handleUpdateStatus(entry._id, 'status', e.target.value)}
                          className={cn("px-2 py-1.5 text-xs font-medium rounded-md border outline-none cursor-pointer", getStatusColor(entry.status))}
                        >
                          <option value="Registered">Registered</option>
                          <option value="Participated">Participated</option>
                          <option value="No-show">No-show</option>
                        </select>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => { setSelectedEntry(entry); setDetailsModalOpen(true); }}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(entry._id) && isTeam(entry) && entry.members && (
                      <tr className="bg-slate-50/50">
                        <td></td>
                        <td colSpan={event?.paymentRequired ? 6 : 5} className="p-4 pt-0">
                          <div className="pl-4 border-l-2 border-indigo-200 space-y-2 mt-2">
                            <div className="text-xs font-mono font-bold text-slate-400 tracking-widest uppercase mb-2">Team Members</div>
                            {entry.members.map((m, idx) => (
                              <div key={idx} className="flex items-center gap-6 text-sm">
                                <div className="w-1/3">
                                  <div className="font-medium text-slate-700">{m.fullName}</div>
                                  <div className="font-mono text-xs text-slate-500">{m.registrationNumber}</div>
                                </div>
                                <div>
                                  <div className="text-slate-600 font-mono text-xs">{m.phone}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile View Omitted for Brevity in Code Editor, falls back to minimal view */}
        <div className="md:hidden p-4 text-center text-sm text-slate-500">
          Please use a larger screen to view and manage event registrations.
        </div>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-slate-900">{pagination.total}</span> entries
            </div>
            <div className="flex items-center gap-1">
              <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1.5 border border-slate-200 rounded-md text-sm disabled:opacity-50 hover:bg-white bg-slate-100 transition-colors">Prev</button>
              <div className="px-4 text-sm font-medium text-slate-700">{pagination.page} / {pagination.pages}</div>
              <button disabled={pagination.page === pagination.pages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1.5 border border-slate-200 rounded-md text-sm disabled:opacity-50 hover:bg-white bg-slate-100 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* REGISTRATION DETAILS MODAL */}
      {detailsModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 font-heading uppercase tracking-tight">Registration Details</h3>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Header Profile */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-1">{getName(selectedEntry)}</h4>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-sm tracking-widest text-brand-primary">{getRegNo(selectedEntry)}</div>
                    <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-sm border uppercase", isTeam(selectedEntry) ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-700 border-slate-200")}>
                      {isTeam(selectedEntry) ? 'Team' : 'Individual'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn("px-3 py-1 text-xs font-bold rounded-md border", getStatusColor(selectedEntry.status))}>
                    {selectedEntry.status}
                  </span>
                </div>
              </div>

              {/* Leader Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div>
                  <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">Email Address</div>
                  <div className="text-sm text-slate-900 font-medium">{getEmail(selectedEntry)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">Phone Number</div>
                  <div className="text-sm text-slate-900 font-mono">{getPhone(selectedEntry)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">Academic Details</div>
                  <div className="text-sm text-slate-900">{getCourse(selectedEntry)} - Section {getSection(selectedEntry)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">Registration Timestamp</div>
                  <div className="text-sm text-slate-900 font-mono">{new Date(selectedEntry.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Team Members */}
              {isTeam(selectedEntry) && selectedEntry.members?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Team Members</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedEntry.members.map((m, idx) => (
                      <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                        <div className="font-bold text-slate-900 text-sm">{m.fullName}</div>
                        <div className="font-mono text-xs text-slate-500 my-1">{m.registrationNumber}</div>
                        <div className="font-mono text-xs text-slate-600">{m.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Proof */}
              {event?.paymentRequired && (
                <div>
                  <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span>Payment Information</span>
                    <span className={cn("px-2 py-0.5 rounded-sm border", getStatusColor(selectedEntry.paymentStatus || 'pending'))}>
                      {selectedEntry.paymentStatus || 'Pending'}
                    </span>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-1/3">
                      <div className="text-xs text-slate-500 mb-1">Transaction ID</div>
                      <div className="font-mono text-sm text-slate-900 font-bold bg-slate-100 p-2 rounded break-all">
                        {selectedEntry.transactionId || 'Not provided'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">Payment Screenshot</div>
                      {selectedEntry.paymentScreenshot ? (
                        <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-50 group h-32 w-32 flex items-center justify-center">
                          <ProtectedImage 
                            imageId={selectedEntry.paymentScreenshot._id || selectedEntry.paymentScreenshot} 
                            variant="admin_preview" 
                            alt="Payment Proof" 
                            className="w-full h-full object-cover"
                          />
                          <a href={`/api/admin/images/${selectedEntry.paymentScreenshot._id || selectedEntry.paymentScreenshot}/view`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={24} className="text-white" />
                          </a>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 italic flex items-center gap-2">
                          <ImageIcon size={16} /> No screenshot attached
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button onClick={() => handleDelete(selectedEntry._id)} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                <Trash2 size={16} /> Delete
              </button>
              <button onClick={() => setDetailsModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
