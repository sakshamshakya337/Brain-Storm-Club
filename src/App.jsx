import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { cn } from './lib/utils';
import { Loader2 } from 'lucide-react';

// Layout
import Navbar from './components/layout/Navbar';

// Eager load Preloader
import Preloader from './components/layout/Preloader';

// Public Pages (Lazy)
const Home = lazy(() => import('./pages/public/Home'));
const Events = lazy(() => import('./pages/public/Events'));
const EventDetail = lazy(() => import('./pages/public/EventDetail'));
const EventRegistration = lazy(() => import('./pages/public/EventRegistration'));
const About = lazy(() => import('./pages/public/About'));
const Feedback = lazy(() => import('./pages/public/Feedback'));
const Members = lazy(() => import('./pages/public/Members'));
const MemberDetail = lazy(() => import('./pages/public/MemberDetail'));
const Contact = lazy(() => import('./pages/public/Contact'));
const JoinUs = lazy(() => import('./pages/public/JoinUs'));
const JoinUsRules = lazy(() => import('./pages/public/JoinUsRules'));
const Ideas = lazy(() => import('./pages/public/Ideas'));
const MemberRegistration = lazy(() => import('./pages/public/MemberRegistration'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const SecurityPolicy = lazy(() => import('./pages/public/SecurityPolicy'));
const Terms = lazy(() => import('./pages/public/Terms'));
const Connect = lazy(() => import('./pages/public/Connect'));
const MaintenancePage = lazy(() => import('./pages/public/MaintenancePage'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

// Admin Pages (Lazy)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const EventEntries = lazy(() => import('./pages/admin/EventEntries'));
const EventScanner = lazy(() => import('./pages/admin/EventScanner'));
const EventFeedback = lazy(() => import('./pages/admin/EventFeedback'));
const AdminMembers = lazy(() => import('./pages/admin/AdminMembers'));
const PendingMembers = lazy(() => import('./pages/admin/PendingMembers'));
const AdminJoinUs = lazy(() => import('./pages/admin/AdminJoinUs'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));
const AdminIdeas = lazy(() => import('./pages/admin/AdminIdeas'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const AdminExports = lazy(() => import('./pages/admin/AdminExports'));
const AdminLinks = lazy(() => import('./pages/admin/AdminLinks'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminMemberRegistration = lazy(() => import('./pages/admin/AdminMemberRegistration'));
const AdminEventAdmins = lazy(() => import('./pages/admin/AdminEventAdmins'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
    <Loader2 className="w-8 h-8 text-[var(--ink)] animate-spin" />
  </div>
);

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
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:slug" element={<EventDetail />} />
              <Route path="/events/:slug/register" element={<EventRegistration />} />
              <Route path="/feedback/:slug" element={<Feedback />} />
              <Route path="/about" element={<About />} />
              <Route path="/members" element={<Members />} />
              <Route path="/members/register" element={<MemberRegistration />} />
              <Route path="/member/register" element={<MemberRegistration />} />
              <Route path="/members/:slug" element={<MemberDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/join-us" element={<JoinUs />} />
              <Route path="/join-us/rules" element={<JoinUsRules />} />
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
                <Route path="/control/events/:id/scanner" element={<EventScanner />} />
                <Route path="/control/events/:id/feedback" element={<EventFeedback />} />
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
                <Route path="/control/member-registration" element={<AdminMemberRegistration />} />
                <Route path="/control/event-admins" element={<AdminEventAdmins />} />
              </Route>

              {/* 404 Catch-All Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
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
