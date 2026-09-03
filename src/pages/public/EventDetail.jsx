import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Clock } from 'lucide-react';
import EventStatus from '../../components/events/EventStatus';
import EventCard from '../../components/events/EventCard';
import ProtectedImage from '../../components/common/ProtectedImage';
import Footer from '../../components/layout/Footer';

export default function EventDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    // Scroll to top when loading new event
    window.scrollTo(0, 0);
    setLoading(true);

    Promise.all([
      fetch(`/api/public/events/${slug}`).then(res => res.json()),
      fetch('/api/public/events').then(res => res.json())
    ])
    .then(([eventData, allEventsData]) => {
      if (eventData.status === 'success') {
        setEvent(eventData.data.event);
      } else {
        setEvent(null);
      }
      
      if (allEventsData.status === 'success') {
        const events = allEventsData.data.events;
        const past = events.filter(e => e.status === 'COMPLETED' || e.status === 'Completed' || e.status === 'Past');
        const related = past.filter(e => e.slug !== slug).slice(0, 3);
        setRelatedEvents(related);
      }
    })
    .catch(err => {
      console.error('Error fetching event detail:', err);
      setEvent(null);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-bg-primary"></div>;

  if (!event) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center font-body text-slate-900 dark:text-slate-300">
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4 border border-slate-200 dark:border-slate-800 px-3 py-1">ERROR 404</span>
        <h1 className="font-heading font-black text-4xl mb-6">EVENT NOT FOUND</h1>
        <Link to="/events" className="font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:text-brand-primary transition-colors">
          <ArrowLeft size={14} /> Back to Events
        </Link>
      </div>
    );
  }

  // Get 3 random related events (excluding current) (handled in useEffect)

  return (
    <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body">
      
      {/* HERO SECTION */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          
          {/* Breadcrumb */}
          <div className="mb-12 font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold flex flex-wrap items-center gap-2">
            <Link to="/events" className="hover:text-brand-primary transition-colors">Events</Link>
            <span>/</span>
            <span className="text-slate-400">{event.category}</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">{event.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 lg:gap-16">
            {/* LEFT: Meta & Title */}
            <div className="flex flex-col justify-center min-w-0 max-w-full break-words event-detail-content">
              <div className="flex gap-3 mb-6">
                <EventStatus status={event.status} />
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-secondary border border-slate-200 dark:border-slate-800 px-2 py-1 bg-white/50 dark:bg-slate-900/50">
                  {event.category}
                </span>
              </div>
              
              <h1 className="font-heading font-black text-[clamp(2.75rem,8vw,5rem)] lg:text-[clamp(3.5rem,5vw,6.5rem)] leading-[0.9] tracking-tighter uppercase mb-6 text-slate-900 dark:text-white max-w-full">
                {event.title}
              </h1>
              
              <p className="font-body text-lg text-slate-600 dark:text-slate-400 font-light mb-12">
                {event.desc}
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-slate-200 dark:border-slate-800 pt-8">
                <div>
                  <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">DATE</div>
                  <div className="font-body font-medium text-slate-900 dark:text-white">{event.date || event.year}</div>
                </div>
                {event.time && (
                  <div>
                    <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">TIME</div>
                    <div className="font-body font-medium text-slate-900 dark:text-white">{event.time}</div>
                  </div>
                )}
                {event.venue && (
                  <div>
                    <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">LOCATION</div>
                    <div className="font-body font-medium text-slate-900 dark:text-white">{event.venue}</div>
                  </div>
                )}
              </div>

              {/* Registration CTA */}
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4">REGISTRATION</div>
                {event.registrationOpen ? (
                  <Link 
                    to={`/events/${event.slug}/register`}
                    className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-4 font-heading font-bold tracking-widest uppercase hover:bg-brand-secondary transition-colors shadow-xl hover:shadow-brand-primary/20 group"
                  >
                    REGISTER NOW <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-8 py-4 font-heading font-bold tracking-widest uppercase cursor-not-allowed">
                    REGISTRATION CLOSED
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Hero Image */}
            <div className="relative min-w-0 max-w-full overflow-hidden">
              <div className="w-full h-[400px] lg:h-[600px] relative overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm">
                <ProtectedImage 
                  imageId={event.posterId?.imageId} 
                  variant="event_detail"
                  alt={event.title} 
                  className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="py-16 lg:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            <div className="col-span-1 lg:col-span-3">
              <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 sticky top-28 flex items-center gap-3">
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                OVERVIEW
              </div>
            </div>
            
            <div className="col-span-1 lg:col-span-9 max-w-3xl">
              <div className="font-body text-lg md:text-xl text-slate-700 dark:text-slate-300 font-light leading-relaxed mb-12">
                {event.overview || event.desc}
              </div>

              {event.highlights && event.highlights.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-sm">
                  <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-slate-900 dark:text-white mb-6">EVENT HIGHLIGHTS</h3>
                  <ul className="space-y-4">
                    {event.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex gap-4 font-body text-slate-600 dark:text-slate-400 font-light">
                        <span className="font-mono text-brand-primary mt-1">0{idx+1}</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION (Conditional) */}
      {event.gallery && event.gallery.length > 0 && (
        <section className="py-16 lg:py-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
          <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
             <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-8 flex items-center gap-3">
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                GALLERY
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* First image is large */}
                {event.gallery[0] && (
                  <div className="md:col-span-2 h-[300px] md:h-[500px] relative border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden group">
                     <img src={event.gallery[0]} alt="Gallery 1" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500" />
                  </div>
                )}
                {/* Secondary images stacked */}
                <div className="md:col-span-1 flex flex-col gap-4 h-[500px]">
                  {event.gallery.slice(1, 3).map((img, idx) => (
                     <div key={idx} className="flex-1 relative border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden group">
                       <img src={img} alt={`Gallery ${idx+2}`} className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500" />
                     </div>
                  ))}
                </div>
              </div>
          </div>
        </section>
      )}

      {/* BOTTOM CTA / RELATED */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
            <h3 className="font-heading font-bold text-3xl uppercase tracking-tight text-slate-900 dark:text-white">
              MORE FROM BRAINSTORM
            </h3>
            <Link to="/events" className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-3 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-2 group whitespace-nowrap">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO EVENTS
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map(related => (
              <EventCard key={related._id || related.id} event={related} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
