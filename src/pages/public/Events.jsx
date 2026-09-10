import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ArrowUpRight, Calendar, MapPin, Clock, Filter } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';
import EventStatus from '../../components/events/EventStatus';
import ProtectedImage from '../../components/common/ProtectedImage';

gsap.registerPlugin(ScrollTrigger);

const FILTERS = ['ALL', 'UPCOMING', 'ONGOING', 'HACKATHON', 'WORKSHOP', 'SEMINAR', 'CONTEST'];

function EventGridCard({ event, index }) {
  const cover = event.coverImage || (event.images && event.images.find(i => i.isCover)) || (event.images && event.images[0]);
  const imageId = cover?.imageId?.imageId || cover?.imageId || event.posterId?.imageId || (typeof event.posterId === 'string' ? event.posterId : null);
  const src = cover?.source === 'external' ? cover.url : null;
  const isLive = ['Live', 'Ongoing', 'Upcoming'].includes(event.status);
  const padded = String(index + 1).padStart(2, '0');

  return (
    <Link to={`/events/${event.slug}`} className="group flex flex-col bg-[var(--paper)] border border-[var(--border)] hover:border-[var(--circuit)] transition-colors overflow-hidden">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-[var(--paper-dim)] overflow-hidden border-b border-[var(--border)]">
        {/* Ambient blurred backdrop */}
        <ProtectedImage
          imageId={imageId}
          src={src}
          variant="event_card"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-40 pointer-events-none"
        />
        {/* Crisp foreground poster */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center group-hover:scale-[1.06] transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
          <ProtectedImage
            imageId={imageId}
            src={src}
            variant="event_card"
            className="relative z-10 max-w-[88%] max-h-[88%] w-auto h-auto object-contain drop-shadow-sm"
            alt={event.title}
          />
        </div>
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/15 via-transparent to-slate-900/8 z-20 pointer-events-none" />
        {/* Status pill */}
        <div className="absolute top-3 left-3 z-30">
          <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 backdrop-blur-sm ${isLive ? 'bg-[var(--circuit)]/90 text-white' : 'bg-[var(--paper)]/90 text-[var(--ink-soft)] border border-[var(--border)]'}`}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {event.status}
          </span>
        </div>
        {/* Index */}
        <div className="absolute bottom-3 right-3 z-30 font-mono text-[10px] font-bold tracking-[0.2em] text-white mix-blend-difference opacity-60">{padded}</div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6">
        <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-3">{event.category || 'EVENT'}</span>
        <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-[var(--ink)] group-hover:text-[var(--circuit)] transition-colors mb-4 line-clamp-2 leading-tight">{event.title}</h3>
        <div className="mt-auto space-y-1.5 mb-5">
          {event.date && (
            <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--ink-soft)] flex items-center gap-2">
              <Calendar size={11} className="text-[var(--circuit)] flex-shrink-0" />
              {event.date}
            </div>
          )}
          {event.venue && (
            <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--ink-soft)] flex items-center gap-2">
              <MapPin size={11} className="text-[var(--circuit)] flex-shrink-0" />
              {event.venue}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink)]">VIEW EVENT</span>
          <div className="w-7 h-7 flex items-center justify-center border border-[var(--border)] text-[var(--ink-soft)] group-hover:bg-spark group-hover:border-spark group-hover:text-ink transition-all">
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function EventHeroCard({ event }) {
  const cover = event.coverImage || (event.images && event.images.find(i => i.isCover)) || (event.images && event.images[0]);
  const imageId = cover?.imageId?.imageId || cover?.imageId || event.posterId?.imageId || (typeof event.posterId === 'string' ? event.posterId : null);
  const src = cover?.source === 'external' ? cover.url : null;
  const isLive = ['Live', 'Ongoing', 'Upcoming'].includes(event.status);

  return (
    <Link to={`/events/${event.slug}`} className="group col-span-full flex flex-col md:flex-row bg-[var(--paper)] border border-[var(--border)] hover:border-[var(--circuit)] transition-colors overflow-hidden">
      <div className="relative w-full md:w-[420px] aspect-[16/10] md:aspect-auto md:min-h-[300px] flex-shrink-0 overflow-hidden bg-[var(--paper-dim)]">
        {/* Ambient blurred backdrop */}
        <ProtectedImage
          imageId={imageId}
          src={src}
          variant="event_card"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-40 pointer-events-none"
        />
        {/* Crisp foreground poster */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center group-hover:scale-[1.05] transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
          <ProtectedImage
            imageId={imageId}
            src={src}
            variant="event_card"
            className="relative z-10 max-w-[85%] max-h-[85%] w-auto h-auto object-contain drop-shadow-sm"
            alt={event.title}
          />
        </div>
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 via-transparent to-transparent z-20 pointer-events-none" />
        {isLive && (
          <div className="absolute top-4 left-4 z-30 inline-flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 bg-[var(--circuit)]/90 text-white backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {event.status}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center p-8 lg:p-12 flex-1">
        <div className="flex items-center gap-3 mb-4">
          {!isLive && <EventStatus status={event.status} />}
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--circuit)] border border-[var(--circuit)]/30 px-2 py-1">{event.category}</span>
        </div>
        <h3 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-[var(--ink)] group-hover:text-[var(--circuit)] transition-colors mb-4 leading-tight">{event.title}</h3>
        <p className="font-body text-[var(--ink-soft)] mb-8 line-clamp-2">{event.desc || event.description || event.overview}</p>
        <div className="flex flex-wrap items-center gap-6 font-mono text-[10px] tracking-widest uppercase text-[var(--ink-soft)]">
          {event.date && <span className="flex items-center gap-1.5"><Calendar size={11} className="text-[var(--circuit)]" />{event.date}</span>}
          {event.time && <span className="flex items-center gap-1.5"><Clock size={11} className="text-[var(--circuit)]" />{event.time}</span>}
          {event.venue && <span className="flex items-center gap-1.5"><MapPin size={11} className="text-[var(--circuit)]" />{event.venue}</span>}
          <span className="ml-auto flex items-center gap-1.5 font-bold text-[var(--ink)] group-hover:text-[var(--circuit)] transition-colors">
            VIEW DETAILS <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Events() {
  const heroRef = useRef(null);
  const backgroundRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useGSAP(() => {
    if (!heroRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
    const ctx = gsap.context(() => {
      const intro = !reduced ? gsap.timeline()
        .from(backgroundRef.current, { opacity: 0, scale: 1.025, duration: .7, clearProps: 'all' }, .1)
        .from('[data-events-hero-line]', { opacity: 0, y: 30, duration: .65, stagger: .12, clearProps: 'all' }, .35)
        .from('[data-events-hero-copy]', { opacity: 0, y: 12, duration: .45, stagger: .08, clearProps: 'all' }, .8) : null;
      const electric = !reduced ? gsap.timeline({ repeat: -1 })
        .to('.electric-trace', { strokeDashoffset: -192, duration: 2.8, ease: 'none', stagger: .45 }, 0)
        .to('.electric-trace-reverse', { strokeDashoffset: 192, duration: 3.2, ease: 'none', stagger: .45 }, 0) : null;
      const visibility = () => { [intro, electric].filter(Boolean).forEach(a => document.hidden ? a.pause() : a.play()); };
      document.addEventListener('visibilitychange', visibility);
      if (!reduced && !lowPower) {
        gsap.to(backgroundRef.current, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true } });
        const move = event => { const x = (event.clientX / window.innerWidth - .5) * 2, y = (event.clientY / window.innerHeight - .5) * 2; gsap.to(backgroundRef.current, { x: x * 8, y: y * 5, overwrite: 'auto', duration: .7 }); };
        window.addEventListener('pointermove', move, { passive: true });
        return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pointermove', move); };
      }
      return () => document.removeEventListener('visibilitychange', visibility);
    }, heroRef);
    return () => ctx.revert();
  }, { scope: heroRef });

  useEffect(() => {
    fetch('/api/public/events')
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setEvents(data.data.events); })
      .catch(err => console.error('Error fetching events:', err))
      .finally(() => setLoading(false));
  }, []);

  const match = (event) => {
    const q = searchQuery.toLowerCase();
    if (q && !event.title?.toLowerCase().includes(q) && !event.category?.toLowerCase().includes(q)) return false;
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UPCOMING') return ['Upcoming', 'UPCOMING'].includes(event.status);
    if (activeFilter === 'ONGOING') return ['Ongoing', 'ONGOING', 'Live'].includes(event.status);
    return event.category?.toUpperCase() === activeFilter;
  };

  const upcoming = events.filter(e => !['Completed', 'COMPLETED'].includes(e.status) && match(e));
  const past = events.filter(e => ['Completed', 'COMPLETED'].includes(e.status) && match(e));

  return (
    <div className="w-full bg-[var(--paper)] min-h-screen font-body text-[var(--ink)]">

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative isolate border-b border-[var(--border)] bg-[var(--paper)] overflow-hidden px-6 pb-12 pt-20 md:px-12 lg:px-20" style={{ minHeight: 'min(680px,84svh)' }}>
        {/* Circuit horizon background image (matches Home.jsx treatment) */}
        <div ref={backgroundRef} className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <img src="/circuit-horizon.png" alt="" className="h-full w-full object-cover object-bottom opacity-30" />
        </div>
        {/* Gradient fade overlay — 15% start like Home so image shows through headline area */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--paper)_15%,transparent_65%,var(--paper)_100%)] pointer-events-none" />
        {/* Electric trace lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70 z-0" aria-hidden="true" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path d="M0 80 H200 L260 130 H500 L560 70 H780 L840 120 H1080 L1140 60 H1440" fill="none" stroke="var(--circuit)" strokeWidth="1.2" strokeDasharray="8 36" className="electric-trace-reverse" />
          <path d="M0 320 H180 L240 270 H460 L520 340 H740 L800 280 H1020 L1080 350 H1440" fill="none" stroke="var(--spark)" strokeWidth="1" strokeDasharray="6 42" className="electric-trace" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl flex flex-col justify-center h-full py-12 md:py-20">
          <p data-events-hero-copy className="font-mono text-[10px] font-bold tracking-[0.35em] uppercase text-[var(--circuit)] mb-6">LPU SCA / Brainstorm Club</p>
          <h1 className="font-heading font-black uppercase tracking-tight leading-[0.88] text-[var(--ink)]" style={{ fontSize: 'clamp(3.5rem,10vw,7.5rem)' }}>
            <span data-events-hero-line className="block">Ideas</span>
            <span data-events-hero-line className="block">in</span>
            <span data-events-hero-line className="block text-transparent bg-clip-text bg-gradient-to-r from-circuit to-spark">Motion.</span>
          </h1>
          <p data-events-hero-copy className="mt-8 max-w-lg font-body text-lg text-[var(--ink-soft)] leading-relaxed">
            Every event is a chance to think differently, build something real, and connect with people who care about the same things you do.
          </p>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <section className="sticky top-16 z-30 bg-[var(--paper)] border-b border-[var(--border)] px-6 lg:px-20 py-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 items-center">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`font-mono text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 border transition-all ${
                  activeFilter === f
                    ? 'border-spark bg-spark text-ink'
                    : 'border-[var(--border)] text-[var(--ink-soft)] hover:border-spark hover:text-[var(--ink)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
            <input
              type="text"
              placeholder="Search events…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 font-mono text-[11px] tracking-wider bg-[var(--paper-dim)] border border-[var(--border)] text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none focus:border-[var(--circuit)] transition-colors w-56"
            />
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section className="px-6 lg:px-20 py-20 bg-[var(--paper-dim)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-12 border-b border-[var(--border)] pb-6">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] mb-2">Schedule</p>
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-[var(--ink)] leading-none">Upcoming Events</h2>
            </div>
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink-soft)]">{upcoming.length} event{upcoming.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[var(--paper)] border border-[var(--border)] animate-pulse h-[400px]" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="py-20 text-center font-mono text-sm tracking-widest uppercase text-[var(--ink-soft)] border border-[var(--border)] bg-[var(--paper)]">
              NO UPCOMING EVENTS — CHECK BACK SOON.
            </div>
          ) : (
            <div className="space-y-4">
              {/* First 3 in grid */}
              {upcoming.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.slice(0, 3).map((event, i) => <EventGridCard key={event._id || i} event={event} index={i} />)}
                </div>
              )}
              {/* Remaining as hero rows */}
              {upcoming.slice(3).map((event, i) => <EventHeroCard key={event._id || i} event={event} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── PAST EVENTS ── */}
      <section className="px-6 lg:px-20 py-20 bg-[var(--paper)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-12 border-b border-[var(--border)] pb-6">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] mb-2">Archive</p>
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-[var(--ink)] leading-none">Past Events</h2>
            </div>
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink-soft)]">{past.length} event{past.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[380px] bg-[var(--paper-dim)] border border-[var(--border)] animate-pulse" />)}
            </div>
          ) : past.length === 0 ? (
            <div className="py-20 text-center font-mono text-sm tracking-widest uppercase text-[var(--ink-soft)] border border-[var(--border)]">
              NO PAST EVENTS FOUND.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {past.map((event, i) => <EventGridCard key={event._id || i} event={event} index={i} />)}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}