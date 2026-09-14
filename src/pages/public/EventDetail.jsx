import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Calendar, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import EventStatus from '../../components/events/EventStatus';
import ProtectedImage from '../../components/common/ProtectedImage';
import Footer from '../../components/layout/Footer';
import DOMPurify from 'dompurify';

function formatEventDate(dateVal) {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  } catch { return dateVal; }
}

function decodeHtmlEntities(html) {
  if (!html) return '';
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

export default function EventDetail() {
  const containerRef = useRef(null);
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => { setActiveImageIndex(0); }, [slug]);

  const galleryImages = React.useMemo(() => {
    if (!event) return [];
    const validImages = Array.isArray(event.images)
      ? event.images.filter(img => img && (img.imageId || img.url || typeof img === 'string'))
      : [];
    if (validImages.length > 0) return [...validImages].sort((a, b) => (a.order || 0) - (b.order || 0));
    const hasValidCover = event.coverImage && (event.coverImage.imageId || event.coverImage.url || typeof event.coverImage === 'string');
    if (hasValidCover) return [event.coverImage];
    if (event.posterId) return [{ source: 'cloudinary', imageId: event.posterId, isCover: true, alt: event.title }];
    if (event.poster || event.image) return [{ source: 'cloudinary', imageId: event.poster || event.image, isCover: true, alt: event.title }];
    return [];
  }, [event]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setFetchError(null);
    let isMounted = true;
    const fetchJson = async res => {
      if (!res.ok) { if (res.status === 404) return { status: 'not_found' }; throw new Error(`HTTP ${res.status}`); }
      const text = await res.text();
      try { return JSON.parse(text); } catch { throw new Error('Invalid JSON'); }
    };
    Promise.all([
      fetch(`/api/public/events/${slug}`).then(fetchJson),
      fetch('/api/public/events').then(fetchJson).catch(() => ({ status: 'error' }))
    ]).then(([eventData, allData]) => {
      if (!isMounted) return;
      if (eventData?.status === 'success' && eventData.data?.event) setEvent(eventData.data.event);
      else setEvent(null);
      if (allData?.status === 'success' && allData.data?.events) {
        const others = allData.data.events.filter(e => e.slug !== slug);
        const past = others.filter(e => ['COMPLETED','Completed','Past'].includes(e.status));
        setRelatedEvents((past.length > 0 ? past : others).slice(0, 3));
      }
    }).catch(err => {
      if (!isMounted) return;
      setFetchError(err.message || 'Failed to load event');
      setEvent(null);
    }).finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [slug]);

  /* ── Loading ── */
  if (loading) return (
    <div className="w-full bg-[var(--paper)] min-h-screen font-body flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40">
        <div className="w-8 h-8 border-2 border-[var(--circuit)] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--ink-soft)]">LOADING EVENT…</span>
      </div>
      <Footer />
    </div>
  );

  /* ── Error / Not found ── */
  if (!event) return (
    <div className="w-full bg-[var(--paper)] min-h-screen font-body flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-40">
        <span className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)] border border-[var(--border)] px-3 py-1 mb-6">
          {fetchError ? 'ERROR' : 'ERROR 404'}
        </span>
        <h1 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-[var(--ink)] mb-4">
          {fetchError ? 'Could Not Load Event' : 'Event Not Found'}
        </h1>
        <p className="font-body text-[var(--ink-soft)] max-w-md mb-10">
          {fetchError || 'The event you are looking for may have been removed or does not exist.'}
        </p>
        <Link to="/events" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase border border-[var(--border)] px-6 py-3 text-[var(--ink)] hover:border-[var(--circuit)] hover:text-[var(--circuit)] transition-colors">
          <ArrowLeft size={13} /> Back to Events
        </Link>
      </div>
      <Footer />
    </div>
  );

  const displayDate = formatEventDate(event.date) || event.date || '';
  const displayDescription = event.overview || event.description || event.desc || '';
  const isLive = ['Live', 'Ongoing', 'Upcoming'].includes(event.status);

  const currentImage = galleryImages[activeImageIndex] || galleryImages[0];
  const currentImageId = currentImage?.imageId?.imageId || (typeof currentImage?.imageId === 'string' ? currentImage.imageId : null) || (typeof currentImage === 'string' ? currentImage : null);
  const currentSrc = currentImage?.source === 'external' ? currentImage.url : (currentImage?.url || null);

  return (
    <div ref={containerRef} className="w-full bg-[var(--paper)] min-h-screen font-body text-[var(--ink)]">

      {/* ── HERO SECTION ── */}
      <section className="border-b border-[var(--border)] bg-[var(--paper-dim)] relative overflow-hidden">
        {/* Circuit horizon background */}
        <div className="absolute inset-0 -z-20 pointer-events-none">
          <img src="/circuit-horizon.png" alt="" className="h-full w-full object-cover object-bottom opacity-20" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--paper-dim)_0%,transparent_40%,var(--paper-dim)_100%)] pointer-events-none" />
        {/* Electric traces */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" aria-hidden="true" viewBox="0 0 1440 600" preserveAspectRatio="none">
          <path d="M0 120 H250 L310 170 H560 L620 100 H860 L920 160 H1160 L1220 90 H1440" fill="none" stroke="var(--circuit)" strokeWidth="1.2" strokeDasharray="8 36" className="electric-trace-reverse" />
          <path d="M0 480 H200 L260 430 H500 L560 500 H780 L840 440 H1080 L1140 510 H1440" fill="none" stroke="var(--spark)" strokeWidth="1" strokeDasharray="6 42" className="electric-trace" />
        </svg>
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] pt-8 pb-0 relative z-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--ink-soft)] mb-10">
            <Link to="/events" className="hover:text-[var(--circuit)] transition-colors flex items-center gap-1.5">
              <ArrowLeft size={11} /> Events
            </Link>
            <span className="text-[var(--border)]">/</span>
            <span className="text-[var(--ink-soft)]">{event.category}</span>
            <span className="text-[var(--border)]">/</span>
            <span className="text-[var(--ink)] line-clamp-1 max-w-[200px]">{event.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 items-start">

            {/* LEFT: Meta & CTA */}
            <div className="pb-12 lg:pb-16">
              {/* Status + Category */}
              <div className="flex items-center gap-3 mb-6">
                <EventStatus status={event.status} />
                <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--circuit)] border border-[var(--circuit)]/40 px-2.5 py-1">
                  {event.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading font-black uppercase tracking-tight text-[var(--ink)] leading-[0.9] mb-6" style={{ fontSize: 'clamp(2.5rem,6vw,5.5rem)' }}>
                {event.title}
              </h1>

              {/* Description */}
              {displayDescription && (
                <p className="font-body text-lg text-[var(--ink-soft)] leading-relaxed mb-10 max-w-lg">
                  {displayDescription}
                </p>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-[var(--border)] pt-8 mb-10">
                {displayDate && (
                  <div>
                    <div className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--ink-soft)] mb-1.5 flex items-center gap-1.5">
                      <Calendar size={10} className="text-[var(--circuit)]" /> DATE
                    </div>
                    <div className="font-body font-semibold text-[var(--ink)]">{displayDate}</div>
                  </div>
                )}
                {event.time && (
                  <div>
                    <div className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--ink-soft)] mb-1.5 flex items-center gap-1.5">
                      <Clock size={10} className="text-[var(--circuit)]" /> TIME
                    </div>
                    <div className="font-body font-semibold text-[var(--ink)]">{event.time}</div>
                  </div>
                )}
                {event.venue && (
                  <div className="col-span-2">
                    <div className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--ink-soft)] mb-1.5 flex items-center gap-1.5">
                      <MapPin size={10} className="text-[var(--circuit)]" /> VENUE
                    </div>
                    <div className="font-body font-semibold text-[var(--ink)]">{event.venue}</div>
                  </div>
                )}
                
                {/* Team Info */}
                {event.allowTeamRegistration && (
                  <div className="col-span-2 bg-[var(--paper-dim)] p-4 border border-[var(--border)]">
                    <div className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--circuit)] mb-3">
                      TEAM REGISTRATION ENABLED
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--ink-soft)] mb-1">MAX TEAM SIZE</div>
                        <div className="font-body font-semibold text-[var(--ink)]">{event.maxTeamSize || 5} Members</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="border-t border-[var(--border)] pt-8">
                <div className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--ink-soft)] mb-4">REGISTRATION</div>
                {event.registrationOpen ? (
                  <Link
                    to={`/events/${event.slug}/register`}
                    className="inline-flex items-center gap-3 bg-spark text-ink px-8 py-4 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-spark-soft transition-colors group shadow-xl shadow-spark/20 hover:-translate-y-0.5"
                  >
                    REGISTER NOW
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-[var(--paper)] border border-[var(--border)] text-[var(--ink-soft)] px-8 py-4 font-mono text-[10px] font-bold tracking-widest uppercase cursor-not-allowed">
                    REGISTRATION CLOSED
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Image gallery */}
            <div className="lg:sticky lg:top-20 pb-12 lg:pb-16">
              {galleryImages.length > 0 ? (
                <div>
                  {/* Main image */}
                  <div className="relative bg-[var(--paper)] border border-[var(--border)] overflow-hidden flex items-center justify-center min-h-[320px] max-h-[560px] group">
                    <ProtectedImage
                      imageId={currentImageId}
                      src={currentSrc}
                      variant="event_detail"
                      alt={currentImage?.alt || event.title}
                      className="max-w-full max-h-[540px] w-auto h-auto object-contain block mx-auto"
                    />
                    {galleryImages.length > 1 && (
                      <>
                        <button onClick={() => setActiveImageIndex(p => p === 0 ? galleryImages.length - 1 : p - 1)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--ink)]/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--ink)]">
                          <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => setActiveImageIndex(p => p === galleryImages.length - 1 ? 0 : p + 1)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--ink)]/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--ink)]">
                          <ChevronRight size={18} />
                        </button>
                        <span className="absolute bottom-3 right-3 font-mono text-[9px] font-bold tracking-widest bg-[var(--ink)]/70 text-white px-2 py-1">
                          {activeImageIndex + 1} / {galleryImages.length}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {galleryImages.length > 1 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                      {galleryImages.map((img, i) => {
                        const tId = img.imageId?.imageId || img.imageId || (typeof img === 'string' ? img : null);
                        const tSrc = img.source === 'external' ? img.url : null;
                        return (
                          <button key={i} onClick={() => setActiveImageIndex(i)}
                            className={`relative w-16 h-12 flex-shrink-0 border overflow-hidden transition-all ${i === activeImageIndex ? 'border-[var(--circuit)] opacity-100 ring-2 ring-[var(--circuit)]/40' : 'border-[var(--border)] opacity-50 hover:opacity-100'}`}>
                            <ProtectedImage imageId={tId} src={tSrc} variant="event_card" alt="" className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-[var(--border)] bg-[var(--paper-dim)] flex flex-col items-center justify-center min-h-[320px] text-[var(--ink-soft)] gap-3">
                  <Calendar size={40} strokeWidth={1} className="opacity-30" />
                  <span className="font-mono text-[10px] tracking-widest uppercase opacity-50">No Image Available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW CONTENT ── */}
      {(displayDescription || event.highlights?.length > 0 || event.schedule?.length > 0) && (
        <section className="border-b border-[var(--border)] bg-[var(--paper)] py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
            <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-12">
              <div className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)] pt-1 flex items-start gap-3">
                <span className="w-6 h-px bg-[var(--circuit)] mt-[0.4em] flex-shrink-0" />
                OVERVIEW
              </div>
              <div className="max-w-3xl space-y-8">
                {displayDescription && (
                  <p className="font-body text-lg md:text-xl text-[var(--ink-soft)] font-light leading-relaxed">{displayDescription}</p>
                )}
                {event.highlights?.length > 0 && (
                  <div className="border-l-2 border-[var(--spark)] pl-6">
                    <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-[var(--ink)] mb-5">EVENT HIGHLIGHTS</h3>
                    <ul className="space-y-4">
                      {event.highlights.map((h, i) => (
                        <li key={i} className="flex gap-4 font-body text-[var(--ink-soft)]">
                          <span className="font-mono text-[var(--circuit)] font-bold text-sm flex-shrink-0">0{i + 1}</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {event.schedule?.length > 0 && (
                  <div className="border-l-2 border-[var(--circuit)] pl-6">
                    <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-[var(--ink)] mb-5">SCHEDULE</h3>
                    <div className="space-y-3">
                      {event.schedule.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 border-b border-[var(--border)] pb-3">
                          {item.time && <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--circuit)] flex-shrink-0">{item.time}</span>}
                          <span className="font-body text-[var(--ink-soft)]">{item.activity || item.label || item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT THIS EVENT (STORY) ── */}
      {event?.eventStory && event.eventStory.trim() !== '' && (
        <section className="border-b border-[var(--border)] bg-[var(--paper)] py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
            <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-12">
              <div className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)] pt-1 flex items-start gap-3">
                <span className="w-6 h-px bg-[var(--circuit)] mt-[0.4em] flex-shrink-0" />
                ABOUT THIS EVENT
              </div>
              <div className="max-w-[850px]">
                <div 
                  className="max-w-none 
                    [&_h1]:font-heading [&_h1]:font-bold [&_h1]:uppercase [&_h1]:tracking-tight [&_h1]:text-[var(--ink)] [&_h1]:text-3xl [&_h1]:mt-12 [&_h1]:mb-6
                    [&_h2]:font-heading [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-[var(--ink)] [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-5
                    [&_h3]:font-heading [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-tight [&_h3]:text-[var(--ink)] [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-4
                    [&_p]:font-body [&_p]:text-[var(--ink-soft)] [&_p]:leading-relaxed [&_p]:mb-6
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6 [&_ul]:font-body [&_ul]:text-[var(--ink-soft)]
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6 [&_ol]:font-body [&_ol]:text-[var(--ink-soft)]
                    [&_li]:mb-2 [&_li_p]:mb-2
                    [&_a]:text-[var(--circuit)] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[var(--ink)]
                    [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--circuit)] [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-[var(--ink-soft)] [&_blockquote]:my-6
                    [&_strong]:font-bold [&_strong]:text-[var(--ink)]
                    [&_img]:max-w-full [&_img]:h-auto [&_img]:border [&_img]:border-[var(--border)] [&_img]:my-6"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtmlEntities(event.eventStory)) }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── RELATED EVENTS ── */}
      {relatedEvents.length > 0 && (
        <section className="border-b border-[var(--border)] bg-[var(--paper-dim)] py-20">
          <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
            <div className="flex items-end justify-between mb-12 border-b border-[var(--border)] pb-6">
              <div>
                <p className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] mb-2">More From Us</p>
                <h2 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-[var(--ink)]">Related Events</h2>
              </div>
              <Link to="/events" className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-widest uppercase text-[var(--circuit)] hover:text-[var(--ink)] transition-colors group">
                ALL EVENTS <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedEvents.map((rel, i) => {
                const cover = rel.coverImage || (rel.images && rel.images[0]);
                const imgId = cover?.imageId?.imageId || cover?.imageId || rel.posterId?.imageId || (typeof rel.posterId === 'string' ? rel.posterId : null);
                const imgSrc = cover?.source === 'external' ? cover.url : null;
                return (
                  <Link key={rel._id || i} to={`/events/${rel.slug}`} className="group bg-[var(--paper)] border border-[var(--border)] hover:border-[var(--circuit)] transition-colors overflow-hidden flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--paper-dim)] border-b border-[var(--border)]">
                      <ProtectedImage imageId={imgId} src={imgSrc} variant="event_card" alt={rel.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-2">{rel.category}</span>
                      <h3 className="font-heading font-bold text-lg uppercase tracking-tight text-[var(--ink)] group-hover:text-[var(--circuit)] transition-colors line-clamp-2 leading-tight flex-1">{rel.title}</h3>
                      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="font-mono text-[9px] tracking-widest uppercase text-[var(--ink-soft)]">{rel.date}</span>
                        <ArrowUpRight size={14} className="text-[var(--ink-soft)] group-hover:text-[var(--circuit)] transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}