import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  MessageSquare, 
  CalendarDays, 
  Download, 
  Settings,
  LogOut,
  X,
  Link as LinkIcon,
  Bell
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/control/dashboard', icon: LayoutDashboard },
        { name: 'Notifications', path: '/control/notifications', icon: Bell },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Join Requests', path: '/control/join-us', icon: UserPlus },
        { name: 'Members', path: '/control/members', icon: Users },
        { name: 'Events', path: '/control/events', icon: CalendarDays },
        { name: 'Contact Queries', path: '/control/contact', icon: MessageSquare },
        { name: 'Links', path: '/control/links', icon: LinkIcon },
      ]
    },
    {
      title: 'DATA',
      items: [
        { name: 'Exports', path: '/control/exports', icon: Download },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Settings', path: '/control/settings', icon: Settings },
      ]
    }
  ];

  useEffect(() => {
    const data = localStorage.getItem('admin_data');
    if (data) {
      try {
        setAdmin(JSON.parse(data));
      } catch (e) {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_data');
    navigate('/control');
  };

  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg text-slate-900 tracking-tight leading-tight uppercase">Brainstorm</span>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Admin Portal</span>
          </div>
          <button 
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-1">
              <h4 className="px-3 mb-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                {group.title}
              </h4>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 relative overflow-hidden",
                    isActive 
                      ? "bg-brand-primary/10 text-brand-primary font-semibold" 
                      : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-r-md"></div>
                      )}
                      <item.icon size={18} className={cn("shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-brand-primary" : "text-slate-400 group-hover:text-slate-600")} />
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Admin Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white border border-slate-200 shadow-sm mb-3 hover:border-slate-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-heading font-bold shrink-0">
              {admin?.email ? admin.email.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {admin?.email || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-medium uppercase tracking-wider">
                {admin?.role || 'Admin'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-heading font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
