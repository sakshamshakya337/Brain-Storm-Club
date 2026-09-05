import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, MessageSquare, CalendarDays, 
  ArrowUpRight, ArrowDownRight, Clock, Activity, Loader2,
  CheckCircle2, XCircle, ArrowRight, Download, FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState({
    stats: {
      totalMembers: 0,
      pendingRequests: 0,
      contactQueries: 0,
      totalEvents: 0,
      upcomingEvents: 0,
      completedEvents: 0,
    },
    recentJoinRequests: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        throw new Error('Failed to load dashboard data');
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend }) => (
    <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-sm flex flex-col h-[160px] relative overflow-hidden group">
      <div className="flex justify-between items-start mb-auto z-10">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">{title}</h3>
        <div className={cn("p-2 rounded-lg transition-colors", colorClass)}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4 z-10">
        <div className="text-4xl font-heading font-bold text-slate-900 tracking-tight">
          {loading ? '-' : value}
        </div>
        {subValue && (
          <div className="flex items-center gap-1.5 mt-2 text-sm font-medium">
            {trend === 'up' && <ArrowUpRight size={14} className="text-emerald-500" />}
            {trend === 'down' && <ArrowDownRight size={14} className="text-red-500" />}
            <span className={cn(
              "text-slate-500",
              trend === 'up' && "text-emerald-600",
              trend === 'down' && "text-red-600"
            )}>
              {loading ? '...' : subValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const StatCardSkeleton = () => (
    <div className="bg-white rounded-[14px] border border-slate-200 p-5 shadow-sm flex flex-col h-[160px] animate-pulse">
      <div className="flex justify-between items-start mb-auto">
        <div className="w-24 h-3 bg-slate-100 rounded"></div>
        <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
      </div>
      <div className="mt-4">
        <div className="w-16 h-10 bg-slate-100 rounded mb-2"></div>
        <div className="w-32 h-4 bg-slate-50 rounded"></div>
      </div>
    </div>
  );

  const QuickAction = ({ title, desc, to, icon: Icon }) => (
    <Link to={to} className="group flex items-center gap-4 bg-white px-5 py-4 rounded-[14px] border border-slate-200 shadow-sm hover:border-brand-primary/30 hover:shadow-md transition-all">
      <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
        <Icon size={18} />
      </div>
      <div className="flex-1 flex flex-col">
        <span className="font-heading font-semibold text-sm text-slate-900">{title}</span>
        <span className="text-xs text-slate-500">{desc}</span>
      </div>
      <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center max-w-md mx-auto mt-12">
          <XCircle size={32} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-red-800 font-heading font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="px-6 py-2.5 bg-white border border-red-200 text-red-700 font-heading font-semibold text-sm rounded-md hover:bg-red-50 transition-colors shadow-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      
      {/* Page Header */}
      <div>
        <p className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[0.2em] mb-2">Dashboard</p>
        <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Welcome back, Administrator.</h2>
        <p className="text-sm font-body text-slate-500 mt-2">Here's an overview of what's happening across Brainstorm.</p>
      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-4">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard 
                title="Total Members" 
                value={data.stats.totalMembers}
                icon={Users}
                colorClass="bg-blue-50 text-blue-600 group-hover:bg-blue-100"
              />
              <StatCard 
                title="Pending Requests" 
                value={data.stats.pendingRequests}
                subValue={data.stats.pendingRequests > 0 ? "Requires action" : "All caught up"}
                icon={UserPlus}
                colorClass="bg-amber-50 text-amber-600 group-hover:bg-amber-100"
                trend={data.stats.pendingRequests > 0 ? "up" : null}
              />
              <StatCard 
                title="Contact Queries" 
                value={data.stats.contactQueries}
                subValue={data.stats.contactQueries > 0 ? "Unread messages" : "Inbox zero"}
                icon={MessageSquare}
                colorClass="bg-purple-50 text-purple-600 group-hover:bg-purple-100"
              />
              <StatCard 
                title="Total Events" 
                value={data.stats.totalEvents}
                subValue={`${data.stats.upcomingEvents} upcoming`}
                icon={CalendarDays}
                colorClass="bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
              />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <QuickAction title="Review Requests" desc="Approve new members" to="/control/join-us" icon={UserPlus} />
          <QuickAction title="Add Event" desc="Schedule a new session" to="/control/events" icon={CalendarDays} />
          <QuickAction title="View Queries" desc="Read contact messages" to="/control/contact" icon={MessageSquare} />
          <QuickAction title="Export Data" desc="Download CSV reports" to="/control/exports" icon={Download} />
        </div>
      </div>

      {/* Complex Data Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Recent Join Requests - 65% width */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">Recent Join Requests</h3>
            <Link to="/control/join-us" className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Course</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                        <td className="px-5 py-4"><div className="h-5 bg-slate-100 rounded-full w-16"></div></td>
                        <td className="px-5 py-4 text-right"><div className="h-4 bg-slate-100 rounded w-8 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : data.recentJoinRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FileText size={32} className="mb-3 opacity-20" />
                          <p className="text-sm font-medium text-slate-600 mb-1">No pending requests</p>
                          <p className="text-xs">New membership applications will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.recentJoinRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-4 font-medium text-slate-900">{req.fullName}</td>
                        <td className="px-5 py-4 text-slate-500">{req.course}</td>
                        <td className="px-5 py-4 text-slate-500">{req.preferredRole || 'Member'}</td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full font-mono text-[10px] font-bold tracking-wider uppercase border",
                            req.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            req.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link to="/control/join-us" className="text-xs font-heading font-semibold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                            Review <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-4 space-y-2 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-slate-100 rounded w-28"></div>
                      <div className="h-4 bg-slate-100 rounded w-16"></div>
                    </div>
                    <div className="h-3 bg-slate-50 rounded w-20"></div>
                  </div>
                ))
              ) : data.recentJoinRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <FileText size={28} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium text-slate-600 mb-0.5">No pending requests</p>
                  <p className="text-xs">New membership applications will appear here.</p>
                </div>
              ) : (
                data.recentJoinRequests.map((req) => (
                  <div key={req._id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{req.fullName}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase border",
                          req.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          req.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.course} · {req.preferredRole || 'Member'}
                      </p>
                    </div>
                    <Link
                      to="/control/join-us"
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors"
                    >
                      Review <ArrowRight size={12} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity - 35% width */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">Recent Activity</h3>
          </div>
          
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-sm flex-1 p-6 overflow-hidden">
            <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {loading ? (
                <div className="space-y-6">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex gap-4 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0"></div>
                      <div className="flex-1 space-y-2 mt-1">
                        <div className="h-3 bg-slate-100 rounded w-full"></div>
                        <div className="h-2 bg-slate-50 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : data.recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-400">
                  <Activity size={32} className="mb-3 opacity-20" />
                  <p className="text-sm font-medium text-slate-600 mb-1">No recent activity</p>
                  <p className="text-xs text-center">Administrative actions will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.recentActivity.map((activity, idx) => (
                    <div key={activity._id} className="flex gap-4">
                      <div className="mt-0.5 relative shrink-0">
                        <div className={cn(
                          "w-8 h-8 rounded-full border flex items-center justify-center",
                          activity.action === 'APPROVE' ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                          activity.action === 'REJECT' ? "bg-red-50 border-red-100 text-red-500" :
                          "bg-blue-50 border-blue-100 text-blue-500"
                        )}>
                          {activity.action === 'APPROVE' ? <CheckCircle2 size={14} /> :
                           activity.action === 'REJECT' ? <XCircle size={14} /> :
                           <Clock size={14} />}
                        </div>
                        {idx !== data.recentActivity.length - 1 && (
                          <div className="absolute top-8 bottom-[-24px] left-1/2 -translate-x-1/2 w-px bg-slate-100"></div>
                        )}
                      </div>
                      <div className="flex flex-col pb-2">
                        <p className="text-sm text-slate-800 font-medium leading-snug">{activity.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono tracking-wider">
                          {new Date(activity.createdAt).toLocaleDateString()} · {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
