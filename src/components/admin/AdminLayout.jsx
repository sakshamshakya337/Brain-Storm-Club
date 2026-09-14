import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        const json = await res.json();
        
        if (json.success && isMounted) {
          const userData = json.data.admin;
          setAdmin(userData);
          localStorage.setItem('admin_data', JSON.stringify(userData));
          
          if (userData.role === 'event_admin') {
            if (!userData.assignedEventId) {
              // Account misconfigured
              return;
            }
            const path = location.pathname;
            const allowedPaths = [
              '/control/dashboard',
              `/control/events/${userData.assignedEventId}/entries`,
              `/control/events/${userData.assignedEventId}/scanner`
            ];
            
            if (!allowedPaths.includes(path) && !path.startsWith(`/control/events/${userData.assignedEventId}/`)) {
              navigate('/control/dashboard', { replace: true });
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          localStorage.removeItem('admin_data');
          localStorage.removeItem('admin_auth');
          navigate('/control');
        }
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };
    initAuth();
    return () => { isMounted = false; };
  }, [location.pathname, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If we are event_admin but have no event, show account error
  if (admin && admin.role === 'event_admin' && !admin.assignedEventId) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4 font-body">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h2 className="text-xl font-heading font-bold text-slate-900 mb-2">EVENT ADMIN ACCOUNT CONFIGURATION ERROR</h2>
          <p className="text-slate-600 mb-6">Your account is not currently assigned to an event. Please contact the administrator.</p>
          <button onClick={() => {
            fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem('admin_auth');
            localStorage.removeItem('admin_data');
            navigate('/control');
          }} className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 font-body flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] transition-all duration-300">
        <AdminHeader setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-[1440px] mx-auto p-4 lg:p-8 xl:px-12 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
