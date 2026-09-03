import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Loader2, Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function MaintenancePage({ onCheckAgain }) {
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const containerRef = useRef(null);

  const handleCheckAgain = async () => {
    if (checking) return;
    setChecking(true);
    setCheckError('');
    try {
      const res = await fetch('/api/site/status', { cache: 'no-store' });
      const json = await res.json();
      const isMaintenance = json?.data?.maintenanceMode;
      if (isMaintenance === false) {
        if (typeof onCheckAgain === 'function') onCheckAgain(false);
        window.location.reload();
      } else {
        setCheckError('Maintenance is still active. Please try again later.');
        setTimeout(() => setCheckError(''), 3000);
      }
    } catch (err) {
      setCheckError('Unable to check site status right now.');
      setTimeout(() => setCheckError(''), 3000);
    } finally {
      setChecking(false);
    }
  };

  const toggleTheme = () => {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set('.gsap-logo', { opacity: 1, y: 0, scale: 1 });
      gsap.set('.gsap-status', { opacity: 1, y: 0 });
      gsap.set('.gsap-heading', { opacity: 1, y: 0 });
      gsap.set('.gsap-subheading', { opacity: 1, y: 0 });
      gsap.set('.gsap-message', { opacity: 1, y: 0 });
      gsap.set('.gsap-status-panel', { opacity: 1, y: 0 });
      gsap.set('.gsap-footer', { opacity: 1, y: 0 });
      gsap.set('.gsap-check', { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline();

    tl.fromTo('.gsap-logo',
      { opacity: 0, y: 12, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    );

    tl.fromTo('.gsap-status',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      '-=0.3'
    );

    tl.fromTo('.gsap-heading',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.2'
    );

    tl.fromTo('.gsap-subheading',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
      '-=0.35'
    );

    tl.fromTo('.gsap-message',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );

    tl.fromTo('.gsap-status-panel',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.1)' },
      '-=0.25'
    );

    tl.fromTo('.gsap-check',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );

    tl.fromTo('.gsap-footer',
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.15'
    );
  }, { scope: containerRef });

  useEffect(() => {
    document.title = 'Brainstorm Club — Maintenance';
    const meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      const newMeta = document.createElement('meta');
      newMeta.name = 'robots';
      newMeta.content = 'noindex, nofollow';
      document.head.appendChild(newMeta);
    } else {
      const original = meta.getAttribute('content') || '';
      meta.setAttribute('content', 'noindex, nofollow');
      return () => meta.setAttribute('content', original);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-bg-primary flex justify-center relative overflow-x-hidden overflow-y-auto"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 text-brand-primary"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02] dark:opacity-[0.035]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="w-full max-w-2xl px-6 sm:px-8 py-12 sm:py-16 md:py-20 flex flex-col items-center z-10 min-h-screen">
        <div className="gsap-logo opacity-0 flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-4 sm:mb-6 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Brainstorm Project Club"
              className="w-full h-auto object-contain"
              style={{ maxHeight: '160px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.nextSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              className="hidden w-full h-full items-center justify-center rounded-2xl bg-brand-primary/10 border border-slate-100 dark:border-slate-800"
              style={{ width: '160px', height: '160px' }}
            >
              <span className="text-brand-primary font-heading font-bold text-5xl">B</span>
            </div>
          </div>
        </div>

        <div className="gsap-status opacity-0 mb-5 sm:mb-7 flex flex-col items-center gap-2">
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-text-muted">
            System Status
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 border-brand-primary/40 bg-brand-primary/5 dark:bg-brand-primary/10">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-brand-primary"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.18em] uppercase text-brand-primary">
              Maintenance Active
            </span>
          </div>
        </div>

        <div className="gsap-heading opacity-0 mb-2 sm:mb-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-text-primary tracking-tight leading-[1.15]">
            System Maintenance
          </h1>
        </div>

        <div className="gsap-subheading opacity-0 mb-5 sm:mb-7 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-semibold text-brand-primary tracking-tight">
            We'll be back shortly.
          </h2>
        </div>

        <div className="gsap-message opacity-0 mb-8 sm:mb-10 max-w-md text-center">
          <p className="text-sm sm:text-base font-body text-text-secondary leading-relaxed">
            We're currently making improvements to the Brainstorm Project Club website. Please check back soon.
          </p>
        </div>

        <div className="gsap-status-panel opacity-0 w-full max-w-xs mb-8 sm:mb-10 p-4 sm:p-5 rounded-2xl border border-border bg-bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-text-muted">
              System
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-state-danger/10 text-state-danger text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-state-danger animate-pulse"></span>
              Degraded
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-t border-border/60">
              <span className="text-text-muted">Public Routes</span>
              <span className="text-state-danger font-medium">SUSPENDED</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-border/60">
              <span className="text-text-muted">API (Public Writes)</span>
              <span className="text-state-danger font-medium">503 REJECT</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-border/60">
              <span className="text-text-muted">Admin Portal</span>
              <span className="text-state-success font-medium">OPERATIONAL</span>
            </div>
          </div>
        </div>

        <div className="gsap-check opacity-0 mb-14 sm:mb-16 flex flex-col items-center gap-3 w-full max-w-xs">
          <button
            onClick={handleCheckAgain}
            disabled={checking}
            className={cn(
              'w-full px-5 py-3 sm:py-3.5 rounded-xl',
              'border border-brand-primary/30 bg-brand-primary/5 dark:bg-brand-primary/10',
              'text-brand-primary hover:bg-brand-primary/15 dark:hover:bg-brand-primary/20',
              'text-xs sm:text-sm font-bold font-mono tracking-[0.18em] uppercase',
              'transition-all duration-200 flex items-center justify-center gap-2',
              'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0'
            )}
          >
            {checking ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Checking Status
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Check Again
              </>
            )}
          </button>
          {checkError && (
            <p className="text-xs font-mono text-state-warning text-center px-2">
              {checkError}
            </p>
          )}
        </div>

        <div className="gsap-footer opacity-0 mt-auto pt-6 pb-4 border-t border-border/60 w-full max-w-[260px] flex flex-col items-center gap-1">
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-text-muted">
            Brainstorm Project Club
          </span>
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted/80">
            LPU • Student Innovation Community
          </span>
        </div>
      </div>

      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
          title="Toggle Theme"
        >
          <Sun size={18} className="dark:hidden" />
          <Moon size={18} className="hidden dark:block" />
        </button>
      </div>
    </div>
  );
}
