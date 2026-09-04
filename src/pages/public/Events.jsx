import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ArrowUpRight, Calendar, MapPin, Clock, Filter, PlayCircle } from 'lucide-react';
import gsap from 'gsap';
import Footer from '../../components/layout/Footer';

import EventStatus from '../../components/events/EventStatus';
import EventCard from '../../components/events/EventCard';
import ProtectedImage from '../../components/common/ProtectedImage';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function Events() {
  const containerRef = useRef(null);
  usePageReveal(containerRef);
  useScrollReveal(containerRef);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/events')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setEvents(data.data.events);
        }
      })
      .catch(err => console.error('Error fetching events:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredUpcoming = events.filter(event => {
    if (event.status === 'COMPLETED' || event.status === 'Completed') return false;
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UPCOMING') return event.status === 'UPCOMING' || event.status === 'Upcoming';
    if (activeFilter === 'ONGOING') return event.status === 'ONGOING' || event.status === 'Ongoing';
    return event.category?.toUpperCase() === activeFilter;
  });

  const filteredPast = events.filter(event => {
    if (event.status !== 'COMPLETED' && event.status !== 'Completed') return false;
    if (activeFilter === 'ALL') return true;
    return event.category?.toUpperCase() === activeFilter;
  });

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300">
      {/* SECTION 1: EDITORIAL HERO */}
      <section className="relative min-h-[70svh] md:min-h-[85svh] flex items-center pt-6 md:pt-10 pb-12 overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px', color: 'currentColor' }} />
        
        <div className="w-full mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT: Typography */}
            <div className="col-span-1 lg:col-span-6 flex flex-col items-start">
              <div className="reveal-eyebrow font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary mb-8 border border-brand-primary/30 px-3 py-1.5 rounded-sm bg-brand-primary/5">
                BRAINSTORM / EVENTS
              </div>
              
              <h1 className="font-heading font-black text-[clamp(3.5rem,10vw,7rem)] leading-[0.85] tracking-tighter text-slate-900 dark:text-white mb-8 uppercase flex flex-col">
                <span className="overflow-hidden"><span className="reveal-heading-line block">IDEAS</span></span>
                <span className="overflow-hidden"><span className="reveal-heading-line block">IN</span></span>
                <span className="overflow-hidden pb-4">
                  <span className="reveal-heading-line block text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">MOTION.</span>
                </span>
              </h1>
              
              <p className="reveal-text font-body text-lg text-slate-600 dark:text-slate-400 max-w-xl mb-12 font-light leading-relaxed">
                Discover workshops, hackathons, seminars, contests and community events designed to help students learn, build and connect.
              </p>

              {/* Technical Metadata */}
              <div className="reveal-meta flex flex-wrap gap-6 font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-accent"></div> 01 / UPCOMING</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> 02 / ONGOING</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> 03 / COMPLETED</span>
              </div>
            </div>
            
            {/* RIGHT: Abstract Visual Composition */}
            <div className="reveal-image col-span-1 lg:col-span-6 relative h-[400px] lg:h-[600px] w-full flex items-center justify-center p-6">
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 opacity-50">
                <div className="col-span-2 row-span-2 bg-slate-100 dark:bg-slate-900 relative overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" className="absolute w-full h-full object-cover mix-blend-luminosity opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="Event" />
                </div>
                <div className="col-span-1 row-span-1 bg-brand-primary/10 relative overflow-hidden border border-brand-primary/20 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold text-brand-primary rotate-90 tracking-widest">2026</span>
                </div>
                <div className="col-span-1 row-span-2 bg-slate-100 dark:bg-slate-900 relative overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop" className="absolute w-full h-full object-cover mix-blend-luminosity opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="Event" />
                </div>
                <div className="col-span-2 row-span-1 bg-slate-100 dark:bg-slate-900 relative overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" className="absolute w-full h-full object-cover mix-blend-luminosity opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="Event" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DISCOVERY HEADER & FILTERS */}
      <section className="pt-20 pb-8 bg-slate-50 dark:bg-transparent">
        <div className="container mx-auto px-6 md:px-12 max-w-[1440px]" data-reveal="up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-slate-900 dark:text-white uppercase tracking-tight mb-2">Explore Events</h2>
              <p className="font-body text-slate-600 dark:text-slate-400 font-light">Find your next opportunity to learn, build and compete.</p>
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                className="w-full md:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 pl-12 pr-4 font-body text-sm outline-none focus:border-brand-primary dark:focus:border-brand-primary dark:focus:ring-1 dark:focus:ring-brand-primary/50 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 md:gap-3 items-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <Filter size={16} className="text-slate-400 mr-2 hidden md:block" />
            {['ALL', 'UPCOMING', 'ONGOING', 'HACKATHON', 'WORKSHOP', 'SEMINAR', 'CONTEST'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`font-mono text-[10px] font-bold tracking-widest uppercase px-4 py-2 border transition-colors ${
                  activeFilter === filter 
                    ? 'border-brand-primary bg-brand-primary text-white' 
                    : 'border-slate-200 dark:border-slate-800 dark:bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-brand-primary dark:hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: ASYMMETRIC EVENT GRID */}
      <section className="py-12 pb-24 bg-slate-50 dark:bg-transparent">
        <div className="container mx-auto px-6 md:px-12 max-w-[1440px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6" data-reveal="stagger-children">
            
            {filteredUpcoming.length === 0 ? (
              <div className="md:col-span-12 py-24 text-center flex flex-col items-center">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-4 border border-slate-200 dark:border-slate-800 px-3 py-1">NO EVENTS FOUND</span>
                <p className="font-body text-slate-600 dark:text-slate-400">Try another category or search term.</p>
              </div>
            ) : (
              <>
                {/* EVENT 1: LARGE MAIN (Col 8) */}
                {filteredUpcoming[0] && (() => {
                  const firstEv = filteredUpcoming[0];
                  const firstCover = firstEv.coverImage || (firstEv.images && firstEv.images.find(img => img.isCover)) || (firstEv.images && firstEv.images[0]);
                  const firstImageId = firstCover?.imageId?.imageId || firstCover?.imageId || firstEv.posterId?.imageId || (typeof firstEv.posterId === 'string' ? firstEv.posterId : null);
                  const firstSrc = firstCover?.source === 'external' ? firstCover.url : (firstEv.images?.[0]?.source === 'external' ? firstEv.images[0].url : null);

                  return (
                    <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group overflow-hidden relative min-h-[450px] flex flex-col justify-end p-8 lg:p-12 hover:border-brand-primary/50 dark:hover:bg-bg-elevated dark:hover:border-slate-700 transition-colors shadow-sm dark:shadow-none rounded-sm">
                      <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
                        <ProtectedImage 
                          imageId={firstImageId} 
                          src={firstSrc}
                          variant="event_detail" 
                          className="absolute inset-0 w-full h-full object-cover blur-sm scale-105 opacity-40 group-hover:scale-110 transition-all duration-700 pointer-events-none" 
                          alt="" 
                          aria-hidden="true"
                        />
                        <ProtectedImage 
                          imageId={firstImageId} 
                          src={firstSrc}
                          variant="event_detail" 
                          className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain opacity-90 group-hover:opacity-100 transition-all duration-700" 
                          alt={firstEv.title} 
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10"></div>
                      
                      <div className="relative z-20 text-white w-full">
                        <div className="flex flex-wrap gap-3 mb-6">
                          <span className="font-mono text-[10px] font-bold tracking-widest uppercase border border-white/20 px-3 py-1 bg-white/5 backdrop-blur-sm">{firstEv.category}</span>
                          <EventStatus status={firstEv.status} />
                        </div>
                        <h3 className="font-heading font-bold text-3xl md:text-5xl uppercase tracking-tight mb-4">{firstEv.title}</h3>
                        <p className="font-body text-slate-300 font-light mb-8 max-w-lg hidden sm:block">{firstEv.desc}</p>
                        <div className="flex flex-wrap items-center justify-between gap-6 font-mono text-[10px] tracking-widest text-slate-300 uppercase border-t border-white/20 pt-6">
                          <div className="flex gap-6">
                            <span className="flex items-center gap-2"><Calendar size={14}/> {firstEv.date}</span>
                            <span className="flex items-center gap-2"><MapPin size={14}/> {firstEv.venue}</span>
                          </div>
                          <Link to={`/events/${firstEv.slug}`} className="font-bold flex items-center gap-2 hover:text-brand-primary transition-colors">
                            View Event <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* EVENT 2 & 3: SMALL STACKED (Col 4) */}
                <div className="md:col-span-4 flex flex-col gap-4 lg:gap-6">
                  {filteredUpcoming.slice(1, 3).map((event) => (
                    <div key={event._id || event.id} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between group hover:border-brand-primary/50 dark:hover:bg-bg-elevated dark:hover:border-slate-700 transition-colors relative overflow-hidden shadow-sm dark:shadow-none rounded-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">{event.category}</span>
                          <EventStatus status={event.status} />
                        </div>
                        <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-slate-900 dark:text-white mb-3 line-clamp-2">{event.title}</h3>
                        <p className="font-body text-sm font-light text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">{event.desc}</p>
                      </div>
                      <div className="relative z-10 flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4 font-mono text-[9px] tracking-widest uppercase text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1.5"><Calendar size={12}/> {event.date}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={12}/> {event.venue}</span>
                        </div>
                        <Link to={`/events/${event.slug}`} className="font-bold flex items-center justify-between hover:text-brand-primary transition-colors text-slate-900 dark:text-white w-full group/link">
                          VIEW EVENT <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform"/>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* EVENT 4+: HORIZONTAL FULL WIDTH */}
                {filteredUpcoming.slice(3).map(event => {
                  const hCover = event.coverImage || (event.images && event.images.find(img => img.isCover)) || (event.images && event.images[0]);
                  const hImageId = hCover?.imageId?.imageId || hCover?.imageId || event.posterId?.imageId || (typeof event.posterId === 'string' ? event.posterId : null);
                  const hSrc = hCover?.source === 'external' ? hCover.url : (event.images?.[0]?.source === 'external' ? event.images[0].url : null);

                  return (
                    <div key={event._id || event.id} className="md:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row group hover:border-brand-primary/50 dark:hover:bg-bg-elevated dark:hover:border-slate-700 transition-colors overflow-hidden shadow-sm dark:shadow-none rounded-sm mt-2">
                      <div className="w-full md:w-[380px] aspect-[16/10] md:aspect-auto md:min-h-[260px] relative overflow-hidden shrink-0 bg-slate-950 flex items-center justify-center">
                        <ProtectedImage 
                          imageId={hImageId} 
                          src={hSrc}
                          variant="event_card" 
                          className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-35 pointer-events-none" 
                          alt="" 
                          aria-hidden="true"
                        />
                        <ProtectedImage 
                          imageId={hImageId} 
                          src={hSrc}
                          variant="event_card" 
                          className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]" 
                          alt={event.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-20 pointer-events-none"></div>
                      </div>
                      <div className="p-8 lg:p-12 flex flex-col justify-center w-full relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 to-transparent"></div>
                        <div className="flex gap-3 mb-4">
                          <EventStatus status={event.status} />
                          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-secondary border border-slate-200 dark:border-slate-800 px-2 py-1">{event.category}</span>
                        </div>
                        <h3 className="font-heading font-bold text-3xl md:text-4xl uppercase tracking-tight text-slate-900 dark:text-white mb-3">{event.title}</h3>
                        <p className="font-body text-slate-600 dark:text-slate-400 font-light mb-8 max-w-2xl">{event.desc}</p>
                        <div className="flex flex-wrap items-center gap-8 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> {event.date}</span>
                          <span className="flex items-center gap-2"><Clock size={14} className="text-slate-400"/> {event.time}</span>
                          <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {event.venue}</span>
                          <Link to={`/events/${event.slug}`} className="font-bold flex items-center gap-2 text-slate-900 dark:text-white hover:text-brand-primary transition-colors ml-auto group/link">
                            VIEW DETAILS <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform"/>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          
          {/* Load More */}
          <div className="mt-12 flex justify-center">
            <button className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-8 py-4 font-heading font-bold text-sm tracking-widest uppercase hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
              Load More Events
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: PAST EVENTS TIMELINE / ARCHIVE */}
      <section className="py-24 md:py-32 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-[1440px]">
          <div className="mb-16">
            <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-slate-900 dark:text-white mb-4">Past Events</h2>
            <p className="font-body text-lg text-slate-600 dark:text-slate-400 font-light max-w-2xl">A record of ideas, people and projects brought together by Brainstorm.</p>
          </div>
          
            {/* Event Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-reveal="stagger-children">
              {filteredPast.length > 0 ? (
                filteredPast.map((event) => (
                  <EventCard key={event._id || event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center flex flex-col items-center">
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-4 border border-slate-200 dark:border-slate-800 px-3 py-1">NO PAST EVENTS FOUND</span>
                </div>
              )}
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
