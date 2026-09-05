import React, { useState, useEffect } from 'react';
import { Loader2, Bell, CheckCircle2, MessageSquare, UserPlus, FileSignature, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All'); // All, Unread, Read

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/notifications?filter=${filter}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(ns => ns.map(n => n._id === id ? { ...n, isRead: true } : n));
      const res = await fetch(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to mark as read');
      // Trigger header re-fetch implicitly or via some global state/event if we had one
      // For now, next refresh will pick it up, or if the header polls, it'll update.
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
      const res = await fetch('/api/admin/notifications/read-all', { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to mark all as read');
    } catch (err) {
      console.error(err);
      fetchNotifications();
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'MEMBER_REGISTRATION': return <UserPlus size={18} className="text-brand-primary" />;
      case 'JOIN_US': return <FileSignature size={18} className="text-amber-500" />;
      case 'CONTACT_QUERY': return <MessageSquare size={18} className="text-emerald-500" />;
      case 'EVENT_REGISTRATION': return <Bell size={18} className="text-blue-500" />;
      case 'SYSTEM': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Bell size={18} className="text-slate-500" />;
    }
  };

  const getLink = (notification) => {
    switch(notification.type) {
      case 'MEMBER_REGISTRATION': return '/control/members/pending';
      case 'JOIN_US': return '/control/join-us';
      case 'CONTACT_QUERY': return '/control/contact';
      case 'EVENT_REGISTRATION': return '/control/events';
      default: return '#';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Notifications</h2>
          <p className="text-sm font-mono text-slate-500">System alerts and activities.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold tracking-widest font-mono uppercase hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <CheckCircle2 size={16} /> Mark All as Read
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Filters */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
          {['All', 'Unread', 'Read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("px-4 py-2 rounded-md text-xs font-bold font-mono tracking-widest uppercase transition-colors", filter === f ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
               <Loader2 className="animate-spin mb-2" size={24} />
               <span className="text-sm font-medium">Loading notifications...</span>
             </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-sm font-medium">Error: {error}</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <Bell size={24} className="text-slate-400" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 mb-1">No Notifications</h3>
               <p className="text-sm">You're all caught up!</p>
             </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={cn("p-4 sm:p-6 transition-colors flex gap-4 sm:gap-6", !notification.isRead ? "bg-blue-50/30" : "hover:bg-slate-50")}
                >
                  <div className="mt-1 shrink-0">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", !notification.isRead ? "bg-white shadow-sm" : "bg-slate-100")}>
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                      <h4 className={cn("text-sm", !notification.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
                        {notification.title}
                      </h4>
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase shrink-0">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={cn("text-sm mb-3", !notification.isRead ? "text-slate-700" : "text-slate-500")}>
                      {notification.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                      <Link 
                        to={getLink(notification)}
                        onClick={() => { if (!notification.isRead) markAsRead(notification._id); }}
                        className="inline-flex items-center gap-1 text-xs font-bold font-mono tracking-widest text-brand-primary hover:text-brand-secondary uppercase transition-colors"
                      >
                        View Details →
                      </Link>
                      
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification._id)}
                          className="text-xs font-bold font-mono tracking-widest text-slate-500 hover:text-slate-900 uppercase transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
