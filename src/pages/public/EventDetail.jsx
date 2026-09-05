import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import EventStatus from '../../components/events/EventStatus';
import EventCard from '../../components/events/EventCard';
import ProtectedImage from '../../components/common/ProtectedImage';
import Footer from '../../components/layout/Footer';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';

function formatEventDate(dateVal) {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  } catch {
    return dateVal;
  }
}

export default function EventDetail() {
  const containerRef = useRef(null);
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  usePageReveal(containerRef, [loading]);
  useScrollReveal(containerRef, [loading]);

  // Reset active image when slug changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [slug]);

  // Normalized gallery images array (sorted by order)
  const galleryImages = React.useMemo(() => {
    if (!event) return [];

    // 1. Check images array for valid images
    const validImages = Array.isArray(event.images)
      ? event.images.filter((img) => img && (img.imageId || img.url || (typeof img === 'string' && img.length > 0)))
      : [];

    if (validImages.length > 0) {
      return [...validImages].sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // 2. Check coverImage - ONLY if it actually has an imageId or a url!
    const hasValidCover = event.coverImage && (
      event.coverImage.imageId || 
      event.coverImage.url || 
      (typeof event.coverImage === 'string' && event.coverImage.length > 0)
    );

    if (hasValidCover) {
      return [event.coverImage];
    }

    // 3. Fall back to posterId
    if (event.posterId) {
      return [{
        source: 'cloudinary',
        imageId: event.posterId,
        isCover: true,
        alt: event.title,
      }];
    }

    // 4. Fall back to legacy poster or image field
    if (event.poster || event.image) {
      return [{
        source: 'cloudinary',
        imageId: event.poster || event.image,
        isCover: true,
        alt: event.title,
      }];
    }

    return [];
  }, [event]);

  useEffect(() => {
    // Scroll to top when loading new event
    window.scrollTo(0, 0);
    setLoading(true);
    setFetchError(null);

    let isMounted = true;

    const fetchJson = async (res) => {
      if (!res.ok) {
        if (res.status === 404) return { status: 'not_found' };
        throw new Error(`HTTP Error ${res.status}`);
      }
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error('Invalid JSON response from server');
      }
    };

    Promise.all([
      fetch(`/api/public/events/${slug}`).then(fetchJson),
      fetch('/api/public/events').then(fetchJson).catch(() => ({ status: 'error' }))
    ])
    .then(([eventData, allEventsData]) => {
      if (!isMounted) return;

      if (eventData && eventData.status === 'success' && eventData.data?.event) {
        setEvent(eventData.data.event);
      } else {
        setEvent(null);
      }
      
      if (allEventsData && allEventsData.status === 'success' && allEventsData.data?.events) {
        const allEvents = allEventsData.data.events;
        const others = allEvents.filter(e => e.slug !== slug);
        const past = others.filter(e => e.status === 'COMPLETED' || e.status === 'Completed' || e.status === 'Past');
        setRelatedEvents(past.length > 0 ? past.slice(0, 3) : others.slice(0, 3));
      }
    })
    .catch(err => {
      if (!isMounted) return;
      console.error('Error fetching event detail:', err);
      setFetchError(err.message || 'Failed to load event');
      setEvent(null);
    })
    .finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body flex flex-col justify-between">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] pt-24 pb-32 flex-1 flex flex-col justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-xs tracking-widest text-slate-500 dark:text-slate-400 uppercase">LOADING EVENT DETAILS...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (fetchError && !event) {
    return (
      <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body flex flex-col justify-between">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] pt-24 pb-32 flex-1 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-4 border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/30 px-3 py-1">ERROR LOADING EVENT</span>
          <h1 className="font-heading font-black text-3xl md:text-4xl mb-4 text-slate-900 dark:text-white">COULD NOT LOAD EVENT</h1>
          <p className="font-body text-slate-600 dark:text-slate-400 max-w-md mb-8 font-light">An unexpected error occurred while fetching event information. Please check your connection and try again.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="font-mono text-xs font-bold tracking-widest uppercase bg-brand-primary text-white px-6 py-3 hover:bg-brand-secondary transition-colors">
              RETRY
            </button>
            <Link to="/events" className="font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 border border-slate-300 dark:border-slate-700 px-6 py-3 hover:text-brand-primary transition-colors">
              <ArrowLeft size={14} /> Back to Events
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body flex flex-col justify-between">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] pt-24 pb-32 flex-1 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-4 border border-slate-200 dark:border-slate-800 px-3 py-1">ERROR 404</span>
          <h1 className="font-heading font-black text-4xl mb-6 text-slate-900 dark:text-white">EVENT NOT FOUND</h1>
          <p className="font-body text-slate-600 dark:text-slate-400 max-w-md mb-8 font-light">The event you are looking for may have been removed or does not exist.</p>
          <Link to="/events" className="font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 border border-slate-300 dark:border-slate-700 px-6 py-3 hover:text-brand-primary transition-colors">
            <ArrowLeft size={14} /> Back to Events
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const displayDate = formatEventDate(event.date) || event.date || event.year || '';
  const displayDescription = event.overview || event.description || event.desc || '';

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body">
      
      {/* HERO SECTION */}
      <section className="pt-6 md:pt-10 pb-16 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          
          {/* Breadcrumb */}
          <div className="reveal-eyebrow mb-12 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-bold flex flex-wrap items-center gap-2">
            <Link to="/events" className="hover:text-brand-primary transition-colors">Events</Link>
            <span>/</span>
            <span className="text-slate-400">{event.category}</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">{event.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 lg:gap-16">
            {/* LEFT: Meta & Title */}
            <div className="flex flex-col justify-center min-w-0 max-w-full break-words event-detail-content">
              <div className="reveal-eyebrow flex gap-3 mb-6">
                <EventStatus status={event.status} />
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-secondary border border-slate-200 dark:border-slate-800 px-2 py-1 bg-white/50 dark:bg-slate-900/50">
                  {event.category}
                </span>
              </div>
              
              <h1 className="font-heading font-black text-[clamp(2.75rem,8vw,5rem)] lg:text-[clamp(3.5rem,5vw,6.5rem)] leading-[0.9] tracking-tighter uppercase mb-6 text-slate-900 dark:text-white max-w-full flex flex-col">
                <span className="overflow-hidden pb-2"><span className="reveal-heading-line block">{event.title}</span></span>
              </h1>
              
              <p className="reveal-text font-body text-lg text-slate-600 dark:text-slate-400 font-light mb-12">
                {displayDescription}
              </p>

              {/* Metadata Grid */}
              <div className="reveal-meta grid grid-cols-2 gap-y-6 gap-x-4 border-t border-slate-200 dark:border-slate-800 pt-8">
                {displayDate && (
                  <div>
                    <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2">DATE</div>
                    <div className="font-body font-medium text-slate-900 dark:text-white">{displayDate}</div>
                  </div>
                )}
                {event.time && (
                  <div>
                    <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2">TIME</div>
                    <div className="font-body font-medium text-slate-900 dark:text-white">{event.time}</div>
                  </div>
                )}
                {event.venue && (
                  <div className={!event.time ? "col-span-2" : ""}>
                    <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2">LOCATION</div>
                    <div className="font-body font-medium text-slate-900 dark:text-white">{event.venue}</div>
                  </div>
                )}
              </div>

              {/* Registration CTA */}
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="reveal-meta font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-4">REGISTRATION</div>
                {event.registrationOpen ? (
                  <Link 
                    to={`/events/${event.slug}/register`}
                    className="reveal-cta inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-4 font-heading font-bold tracking-widest uppercase hover:bg-brand-secondary transition-colors shadow-xl hover:shadow-brand-primary/20 group"
                  >
                    REGISTER NOW <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div className="reveal-cta inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-8 py-4 font-heading font-bold tracking-widest uppercase cursor-not-allowed">
                    REGISTRATION CLOSED
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Hero Poster / Gallery */}
            <div className="reveal-image relative min-w-0 max-w-full flex flex-col items-center justify-center">
              <div className="relative w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden p-2 sm:p-4 min-h-[260px] sm:min-h-[360px] lg:min-h-[440px] max-h-[620px] group/poster">
                {galleryImages.length > 0 ? (() => {
                  const currentImage = galleryImages[activeImageIndex] || galleryImages[0];
                  const currentImageId = currentImage?.imageId?.imageId || (typeof currentImage?.imageId === 'string' ? currentImage.imageId : null) || currentImage?.imageId?._id || (typeof currentImage === 'string' ? currentImage : null);
                  const currentSrc = currentImage?.source === 'external' ? currentImage.url : (currentImage?.url || null);

                  return (
                    <>
                      <ProtectedImage 
                        imageId={currentImageId} 
                        src={currentSrc}
                        variant="event_detail"
                        alt={currentImage?.alt || event.title} 
                        className="max-w-full max-h-[580px] w-auto h-auto object-contain block mx-auto rounded-sm shadow-sm"
                      />

                      {/* Multi-image Prev/Next Controls */}
                      {galleryImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Previous image"
                            onClick={() => setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center transition-all border border-white/20 shadow-lg active:scale-95 sm:opacity-0 sm:group-hover/poster:opacity-100 focus:opacity-100"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            type="button"
                            aria-label="Next image"
                            onClick={() => setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center transition-all border border-white/20 shadow-lg active:scale-95 sm:opacity-0 sm:group-hover/poster:opacity-100 focus:opacity-100"
                          >
                            <ChevronRight size={20} />
                          </button>

                          {/* Image Counter Badge */}
                          <span className="absolute bottom-3 right-3 z-20 font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-slate-900/80 text-white border border-white/10 backdrop-blur-sm shadow-sm">
                            {activeImageIndex + 1} / {galleryImages.length}
                          </span>
                        </>
                      )}
                    </>
                  );
                })() : (
                  <div className="w-full h-64 sm:h-80 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-3">
                    <Calendar size={48} strokeWidth={1.5} className="opacity-40" />
                    <span className="font-mono text-xs tracking-widest uppercase">No Poster Available</span>
                  </div>
                )}
              </div>

              {/* Gallery Thumbnails (When >1 image) */}
              {galleryImages.length > 1 && (
                <div className="w-full mt-3 flex flex-col items-center">
                  {/* Desktop / Tablet Thumbnail Strip */}
                  <div className="hidden sm:flex items-center gap-2 overflow-x-auto py-1 px-1 max-w-full scrollbar-thin">
                    {galleryImages.map((img, idx) => {
                      const thumbId = img.imageId?.imageId || img.imageId || (typeof img === 'string' ? img : null);
                      const thumbSrc = img.source === 'external' ? img.url : null;
                      const isActive = idx === activeImageIndex;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          aria-label={`View image ${idx + 1}`}
                          className={`relative w-16 h-12 rounded-sm overflow-hidden border transition-all flex-shrink-0 bg-slate-900 ${
                            isActive 
                              ? 'border-brand-primary ring-2 ring-brand-primary/50 scale-105 opacity-100' 
                              : 'border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <ProtectedImage 
                            imageId={thumbId}
                            src={thumbSrc}
                            variant="event_card"
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Compact Dot Indicators */}
                  <div className="flex sm:hidden items-center justify-center gap-2 py-2">
                    {galleryImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`transition-all rounded-full ${
                          idx === activeImageIndex 
                            ? 'w-6 h-1.5 bg-brand-primary' 
                            : 'w-2 h-1.5 bg-slate-400 dark:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="py-16 lg:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]" data-reveal="up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            <div className="col-span-1 lg:col-span-3">
              <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 sticky top-28 flex items-center gap-3">
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                OVERVIEW
              </div>
            </div>
            
            <div className="col-span-1 lg:col-span-9 max-w-3xl">
              <div className="font-body text-lg md:text-xl text-slate-700 dark:text-slate-300 font-light leading-relaxed mb-12">
                {displayDescription}
              </div>

              {event.highlights && event.highlights.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-sm mb-8">
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

              {event.schedule && event.schedule.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-sm mb-8">
                  <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-slate-900 dark:text-white mb-6">SCHEDULE</h3>
                  <div className="space-y-4">
                    {event.schedule.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 border-b border-slate-200 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                        <span className="font-mono text-xs font-bold text-brand-primary tracking-wider">{item.time}</span>
                        <span className="font-body text-slate-700 dark:text-slate-300 font-light">{item.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.coordinators && event.coordinators.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-sm">
                  <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-slate-900 dark:text-white mb-6">COORDINATORS</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.coordinators.map((coord, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-sm">
                        <div className="font-heading font-bold text-slate-900 dark:text-white">{coord.name}</div>
                        <div className="font-mono text-xs text-brand-primary tracking-wider uppercase mt-1">{coord.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION (Conditional) */}
      {event.gallery && event.gallery.length > 0 && (
        <section className="py-16 lg:py-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
          <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]" data-reveal="stagger-children">
             <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-8 flex items-center gap-3">
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                GALLERY
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {event.gallery[0] && (
                  <div className="md:col-span-2 h-[300px] md:h-[500px] relative border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden group">
                     <img src={event.gallery[0]} alt="Gallery 1" className="absolute inset-0 w-full h-full object-cover transition-all duration-500" />
                  </div>
                )}
                <div className="md:col-span-1 flex flex-col gap-4 h-[500px]">
                  {event.gallery.slice(1, 3).map((img, idx) => (
                     <div key={idx} className="flex-1 relative border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden group">
                       <img src={img} alt={`Gallery ${idx+2}`} className="absolute inset-0 w-full h-full object-cover transition-all duration-500" />
                     </div>
                  ))}
                </div>
              </div>
          </div>
        </section>
      )}

      {/* BOTTOM CTA / RELATED */}
      {relatedEvents.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6" data-reveal="up">
              <h3 className="font-heading font-bold text-3xl uppercase tracking-tight text-slate-900 dark:text-white">
                MORE FROM BRAINSTORM
              </h3>
              <Link to="/events" className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-3 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-2 group whitespace-nowrap">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO EVENTS
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-reveal="stagger-children">
              {relatedEvents.map(related => (
                <EventCard key={related._id || related.id} event={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
