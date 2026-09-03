import { Menu, Bell, User, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminHeader({ setIsOpen }) {
  const [admin, setAdmin] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem('admin_data');
    if (data) {
      try {
        setAdmin(JSON.parse(data));
      } catch (e) {}
    }

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/admin/notifications?filter=Unread');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setUnreadCount(json.data.unreadCount);
      }
    } catch (e) {}
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shrink-0 shadow-sm shadow-slate-100/50">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 lg:hidden rounded-md hover:bg-slate-50 transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-heading font-bold text-slate-900 hidden sm:block tracking-tight">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-6">
        <Link to="/control/notifications" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        
        <div className="hidden sm:flex items-center gap-3 pl-4 lg:pl-6 border-l border-slate-200 cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">
              {admin?.email || 'Administrator'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono font-medium uppercase tracking-wider">
              {admin?.role || 'Admin'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-heading font-bold ring-2 ring-transparent group-hover:ring-brand-primary/20 transition-all">
            {admin?.email ? admin.email.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
