import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { cn } from './lib/utils';

// Layout
import Navbar from './components/layout/Navbar';

// Public Pages
import Home from './pages/public/Home';
import Events from './pages/public/Events';
import EventDetail from './pages/public/EventDetail';
import EventRegistration from './pages/public/EventRegistration';
import About from './pages/public/About';
import Members from './pages/public/Members';
import MemberDetail from './pages/public/MemberDetail';
import Contact from './pages/public/Contact';
import JoinUs from './pages/public/JoinUs';
import Ideas from './pages/public/Ideas';
import MemberRegistration from './pages/public/MemberRegistration';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import SecurityPolicy from './pages/public/SecurityPolicy';
import Terms from './pages/public/Terms';
import Connect from './pages/public/Connect';
import MaintenancePage from './pages/public/MaintenancePage';
import NotFound from './pages/public/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminEvents from './pages/admin/AdminEvents';
import EventEntries from './pages/admin/EventEntries';
import AdminMembers from './pages/admin/AdminMembers';
import PendingMembers from './pages/admin/PendingMembers';
import AdminJoinUs from './pages/admin/AdminJoinUs';
import AdminContact from './pages/admin/AdminContact';
import AdminIdeas from './pages/admin/AdminIdeas';
import Analytics from './pages/admin/Analytics';
import AdminExports from './pages/admin/AdminExports';
import AdminLinks from './pages/admin/AdminLinks';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminLayout from './components/admin/AdminLayout';

import Preloader from './components/layout/Preloader';

import { useLocation } from 'react-router-dom';
import ForgotPassword from './pages/admin/ForgotPassword';
import ResetPassword from './pages/admin/ResetPassword';

let maintenanceFetchPromise = null;
const fetchSiteStatus = async () => {
  if (maintenanceFetchPromise) return maintenanceFetchPromise;
  maintenanceFetchPromise = (async () => {
    try {
      const res = await fetch('/api/site/status', { cache: 'no-store' });
      const json = await res.json();
      return json?.data?.maintenanceMode ?? false;
    } catch {
      return false;
    } finally {
      maintenanceFetchPromise = null;
    }
  })();
  return maintenanceFetchPromise;
};

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/control');
  const isConnectRoute = location.pathname === '/connect';

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceChecked, setMaintenanceChecked] = useState(isAdminRoute);

  useEffect(() => {
    if (isAdminRoute) {
      setMaintenanceChecked(true);
      return;
    }
    setMaintenanceChecked(false);
    let active = true;
    fetchSiteStatus().then((val) => {
      if (active) {
        setMaintenanceMode(!!val);
        setMaintenanceChecked(true);
      }
    });
    return () => { active = false; };
  }, [location.pathname, isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) {
      document.documentElement.classList.remove('dark');
    } else {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme, isAdminRoute]);

  const toggleTheme = () => {
    if (!isAdminRoute) {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  if (!isAdminRoute && maintenanceMode && maintenanceChecked) {
    return <MaintenancePage onCheckAgain={(val) => setMaintenanceMode(val)} />;
  }

  return (
    <>
      {!preloaderComplete && !isAdminRoute && <Preloader onComplete={() => setPreloaderComplete(true)} />}

      <div className={cn(
        "min-h-screen bg-bg-primary text-text-primary transition-colors duration-300 font-body",
        !preloaderComplete && !isAdminRoute && "opacity-0 invisible h-screen overflow-hidden",
        isAdminRoute && "bg-slate-50 text-slate-900"
      )}>

        {!isAdminRoute && !isConnectRoute && <Navbar theme={theme} toggleTheme={toggleTheme} />}

        <main className={cn("w-full", !isAdminRoute && !isConnectRoute && "pt-16")}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/events/:slug/register" element={<EventRegistration />} />
            <Route path="/about" element={<About />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/register" element={<MemberRegistration />} />
            <Route path="/member/register" element={<MemberRegistration />} />
            <Route path="/members/:slug" element={<MemberDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/submit-idea" element={<Ideas />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/security" element={<SecurityPolicy />} />
            <Route path="/security-policy" element={<SecurityPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/terms-of-service" element={<Terms />} />
            <Route path="/terms-and-conditions" element={<Terms />} />
            <Route path="/connect" element={<Connect />} />

            {/* Admin Auth Routes */}
            <Route path="/control" element={<AdminLogin />} />
            <Route path="/control/forgot-password" element={<ForgotPassword />} />
            <Route path="/control/reset-password/:token" element={<ResetPassword />} />

            {/* Admin Dashboard Routes - Wrapped in AdminLayout */}
            <Route element={<AdminLayout />}>
              <Route path="/control/dashboard" element={<Dashboard />} />
              <Route path="/control/events" element={<AdminEvents />} />
              <Route path="/control/events/:id/entries" element={<EventEntries />} />
              <Route path="/control/members" element={<AdminMembers />} />
              <Route path="/control/members/pending" element={<PendingMembers />} />
              <Route path="/control/join-us" element={<AdminJoinUs />} />
              <Route path="/control/contact" element={<AdminContact />} />
              <Route path="/control/ideas" element={<AdminIdeas />} />
              <Route path="/control/exports" element={<AdminExports />} />
              <Route path="/control/links" element={<AdminLinks />} />
              <Route path="/control/analytics" element={<Analytics />} />
              <Route path="/control/settings" element={<AdminSettings />} />
              <Route path="/control/notifications" element={<AdminNotifications />} />
            </Route>

            {/* 404 Catch-All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
