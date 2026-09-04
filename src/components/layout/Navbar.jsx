import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location  = useLocation();
  const mobileMenuRef = useRef(null);

  // ── Scroll state (shadow / frosted-glass on nav bar) ──────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close menu on route change ─────────────────────────────────────────────
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // ── Body scroll lock — preserves scroll position to prevent iOS jump ───────
  useEffect(() => {
    if (mobileMenuOpen) {
      // Save current scroll position and lock body without jumping
      const scrollY = window.scrollY;
      document.body.style.position   = 'fixed';
      document.body.style.top        = `-${scrollY}px`;
      document.body.style.width      = '100%';
      document.body.style.overflowY  = 'scroll'; // keep scrollbar width stable
    } else {
      // Restore scroll position on unlock
      const scrollY = parseInt(document.body.style.top || '0', 10) * -1;
      document.body.style.position  = '';
      document.body.style.top       = '';
      document.body.style.width     = '';
      document.body.style.overflowY = '';
      if (scrollY) window.scrollTo(0, scrollY);
    }
    return () => {
      // Safety cleanup — ensure body is never left locked
      const scrollY = parseInt(document.body.style.top || '0', 10) * -1;
      document.body.style.position  = '';
      document.body.style.top       = '';
      document.body.style.width     = '';
      document.body.style.overflowY = '';
      if (scrollY) window.scrollTo(0, scrollY);
    };
  }, [mobileMenuOpen]);

  // ── Keyboard: Escape closes menu ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [mobileMenuOpen]);

  // ── GSAP slide animation — scoped to the portalled menu node ──────────────
  useGSAP(() => {
    if (!mobileMenuRef.current) return;

    if (mobileMenuOpen) {
      // Slide in from right
      gsap.to(mobileMenuRef.current, {
        x: '0%',
        duration: 0.4,
        ease: 'power3.out',
      });
      // Stagger nav links
      gsap.fromTo(
        mobileMenuRef.current.querySelectorAll('.mobile-nav-link'),
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.15 }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
      });
    }
  }, { dependencies: [mobileMenuOpen] });

  const navLinks = [
    { name: 'Events',  path: '/events'  },
    { name: 'Members', path: '/members' },
    { name: 'About',   path: '/about'   },
    { name: 'Contact', path: '/contact' },
    { name: 'Join Us', path: '/join-us' },
  ];

  // ── Mobile menu — rendered via portal so it is NEVER a child of <nav> ─────
  // This escapes all ancestor stacking contexts (backdrop-filter, transform,
  // opacity, etc.) that would otherwise trap the menu behind page content.
  const mobileMenu = createPortal(
    <>
      {/* Backdrop — blocks pointer events to page, closes menu on tap */}
      {mobileMenuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'transparent' }}
        />
      )}

      {/* Menu panel */}
      <div
        ref={mobileMenuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        style={{
          // Intentional inline styles so this layer is never overridden by
          // Tailwind utility conflicts or ancestor stacking-context issues.
          position:        'fixed',
          inset:           0,
          zIndex:          9999,
          transform:       'translateX(100%)', // initial off-screen; GSAP takes over
          willChange:      'transform',
          // Solid background — no transparency, no backdrop-filter on the panel itself
          display:         'flex',
          flexDirection:   'column',
          overflowY:       'auto',
          overflowX:       'hidden',
          // Pointer events — only active when open (avoids invisible overlay bug)
          pointerEvents:   mobileMenuOpen ? 'auto' : 'none',
        }}
        className="bg-white dark:bg-slate-950"
      >
        {/* Menu header */}
        <div className="flex justify-between items-center h-16 px-6 max-w-[1440px] mx-auto w-full border-b border-slate-100 dark:border-slate-900 shrink-0">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <span className="font-heading font-bold text-lg text-slate-900 dark:text-white tracking-tight uppercase">
              Brainstorm
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="p-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-full"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile menu"
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 px-6 py-8 flex flex-col gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'mobile-nav-link text-2xl font-heading font-bold uppercase tracking-tight',
                location.pathname === link.path
                  ? 'text-brand-primary'
                  : 'text-slate-900 dark:text-white'
              )}
            >
              {link.name}
            </Link>
          ))}

          <div className="mt-8 mobile-nav-link">
            <Link
              to="/ideas"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full bg-slate-900 dark:bg-brand-primary text-white py-4 rounded-xl font-mono text-sm font-bold tracking-wider uppercase active:scale-[0.98] transition-transform"
            >
              Submit an Idea
            </Link>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <nav
        className={cn(
          'reveal-navbar fixed top-0 w-full transition-all duration-300',
          // z-50 on the bar itself is sufficient — menu is portalled out of this element
          'z-50',
          scrolled
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'
            : 'bg-transparent border-transparent'
        )}
      >
        <div className="flex justify-between items-center h-20 px-6 lg:px-8 max-w-[1440px] mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group h-full">
            <img
              src={theme === 'dark' ? '/favicon.jpg' : '/logo.png'}
              alt="Brainstorm Logo"
              className={cn(
                'object-contain origin-left transition-transform drop-shadow-sm',
                theme === 'dark'
                  ? 'h-10 md:h-12 w-auto group-hover:scale-105'
                  : 'h-20 md:h-28 w-auto group-hover:scale-[1.15] scale-110'
              )}
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 font-body text-sm tracking-tight uppercase">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'hover:text-slate-900 dark:hover:text-white transition-colors',
                  location.pathname === link.path
                    ? 'text-brand-primary font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="scale-95 active:scale-90 transition-transform p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link
              to="/ideas"
              className="hidden md:block bg-slate-900 dark:bg-brand-primary text-white px-6 py-2.5 rounded-full font-mono text-xs font-bold tracking-wider uppercase hover:bg-brand-primary dark:hover:bg-brand-primary/80 transition-colors scale-95 active:scale-90"
            >
              Submit an Idea
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Portal — appended directly to document.body, outside all stacking contexts */}
      {mobileMenu}
    </>
  );
}
