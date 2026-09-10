import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Calendar, MapPin, Clock } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import EventStatus from '../../components/events/EventStatus';

const FIELD_CLASS = "w-full bg-[var(--paper-dim)] border border-[var(--border)] px-4 py-3 font-body text-sm text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none focus:border-[var(--circuit)] transition-colors";
const LABEL_CLASS = "block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2";

export default function EventRegistration() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventError, setEventError] = useState('');
  const [formState, setFormState] = useState('DEFAULT');
  const [errorMessage, setErrorMessage] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', registrationNumber: '', course: '', section: '',
    email: '', phone: '', whatsapp: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/public/events/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') setEvent(data.data.event);
        else setEventError('Event not found.');
      })
      .catch(() => setEventError('Unable to load event details.'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (sameAsPhone) setFormData(p => ({ ...p, whatsapp: p.phone }));
  }, [formData.phone, sameAsPhone]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!event) return;
    const req = ['fullName','registrationNumber','course','section','email','phone'];
    if (req.some(k => !formData[k])) {
      setErrorMessage('Please fill all required fields.');
      setFormState('ERROR');
      return;
    }
    setFormState('SENDING');
    setErrorMessage('');
    try {
      const res = await fetch('/api/public/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event._id,
          ...formData,
          whatsapp: formData.whatsapp || formData.phone,
          hasWhatsapp: true
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      setFormState('SUCCESS');
      setFormData({ fullName:'', registrationNumber:'', course:'', section:'', email:'', phone:'', whatsapp:'' });
      setSameAsPhone(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'A network error occurred. Please try again.');
      setFormState('ERROR');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="w-full bg-[var(--paper)] min-h-screen font-body flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40">
        <div className="w-8 h-8 border-2 border-[var(--circuit)] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--ink-soft)]">LOADING…</span>
      </div>
      <Footer />
    </div>
  );

  /* ── Error ── */
  if (eventError || !event) return (
    <div className="w-full bg-[var(--paper)] min-h-screen font-body flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-40">
        <span className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)] border border-[var(--border)] px-3 py-1 mb-6">ERROR 404</span>
        <h1 className="font-heading font-black text-4xl uppercase tracking-tight text-[var(--ink)] mb-4">Event Not Found</h1>
        <Link to="/events" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase border border-[var(--border)] px-6 py-3 text-[var(--ink)] hover:border-[var(--circuit)] transition-colors mt-6">
          <ArrowLeft size={13} /> Back to Events
        </Link>
      </div>
      <Footer />
    </div>
  );

  const isClosed = !event.registrationOpen;

  return (
    <div className="w-full bg-[var(--paper)] min-h-screen font-body text-[var(--ink)]">

      {/* ── HERO ── */}
      <section className="relative border-b border-[var(--border)] bg-[var(--paper-dim)] overflow-hidden">
        {/* Circuit horizon background */}
        <div className="absolute inset-0 -z-20 pointer-events-none">
          <img src="/circuit-horizon.png" alt="" className="h-full w-full object-cover object-bottom opacity-20" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--paper-dim)_0%,transparent_50%,var(--paper-dim)_100%)] pointer-events-none" />
        {/* Electric traces */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" aria-hidden="true" viewBox="0 0 1440 360" preserveAspectRatio="none">
          <path d="M0 80 H220 L280 130 H520 L580 70 H800 L860 120 H1100 L1160 60 H1440" fill="none" stroke="var(--circuit)" strokeWidth="1.2" strokeDasharray="8 36" className="electric-trace-reverse" />
          <path d="M0 280 H180 L240 240 H460 L520 300 H740 L800 250 H1020 L1080 310 H1440" fill="none" stroke="var(--spark)" strokeWidth="1" strokeDasharray="6 42" className="electric-trace" />
        </svg>

        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] pt-10 pb-14 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--ink-soft)] mb-10">
            <Link to="/events" className="hover:text-[var(--circuit)] transition-colors flex items-center gap-1.5">
              <ArrowLeft size={11} /> Events
            </Link>
            <span>/</span>
            <Link to={`/events/${event.slug}`} className="hover:text-[var(--circuit)] transition-colors truncate max-w-[180px]">{event.title}</Link>
            <span>/</span>
            <span className="text-[var(--ink)]">Register</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <EventStatus status={event.status} />
                {event.category && (
                  <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--circuit)] border border-[var(--circuit)]/40 px-2.5 py-1">
                    {event.category}
                  </span>
                )}
              </div>
              <h1 className="font-heading font-black uppercase tracking-tight text-[var(--ink)] leading-[0.9] mb-4" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)' }}>
                {isClosed ? 'Registration Closed' : 'Event Registration'}
              </h1>
              <p className="font-body text-lg text-[var(--ink-soft)] max-w-xl leading-relaxed">
                {isClosed
                  ? `Registration for ${event.title} is currently closed.`
                  : `Secure your spot for ${event.title}. Fill in accurate details — they will be used for your certificate and communications.`}
              </p>
            </div>

            {/* Event quick-info */}
            <div className="flex flex-wrap gap-4 md:flex-col md:items-end font-mono text-[10px] tracking-widest uppercase text-[var(--ink-soft)]">
              {event.date && <span className="flex items-center gap-1.5"><Calendar size={11} className="text-[var(--circuit)]" />{event.date}</span>}
              {event.time && <span className="flex items-center gap-1.5"><Clock size={11} className="text-[var(--circuit)]" />{event.time}</span>}
              {event.venue && <span className="flex items-center gap-1.5"><MapPin size={11} className="text-[var(--circuit)]" />{event.venue}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      <section className="py-20 bg-[var(--paper)]">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">

          {/* Registration Closed */}
          {isClosed && (
            <div className="max-w-2xl mx-auto border border-[var(--border)] bg-[var(--paper-dim)] p-12 text-center">
              <span className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)] border border-[var(--border)] px-3 py-1 mb-6 inline-block">UNAVAILABLE</span>
              <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-[var(--ink)] mt-4 mb-3">Currently Unavailable</h2>
              <p className="font-body text-[var(--ink-soft)] mb-8">We are no longer accepting registrations for this event.</p>
              <Link to={`/events/${event.slug}`} className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase border border-[var(--border)] px-6 py-3 text-[var(--ink)] hover:border-[var(--circuit)] hover:text-[var(--circuit)] transition-colors">
                <ArrowLeft size={13} /> Back to Event Details
              </Link>
            </div>
          )}

          {!isClosed && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 max-w-5xl">

              {/* Form */}
              <div>
                {/* Success */}
                {formState === 'SUCCESS' && (
                  <div className="border border-[var(--circuit)]/40 bg-[var(--paper-dim)] p-8 mb-10 flex items-start gap-4">
                    <CheckCircle2 size={22} className="text-[var(--circuit)] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-[var(--ink)] mb-2">Registration Successful!</h3>
                      <p className="font-body text-[var(--ink-soft)] mb-5">Thank you for registering for <strong>{event.title}</strong>. Your spot is confirmed. We will reach you on your registered email/phone.</p>
                      <div className="flex flex-wrap gap-3">
                        <Link to={`/events/${event.slug}`} className="font-mono text-[10px] font-bold tracking-widest uppercase border border-[var(--border)] px-4 py-2 text-[var(--ink)] hover:border-[var(--circuit)] transition-colors">
                          Back to Event
                        </Link>
                        <button onClick={() => setFormState('DEFAULT')} className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--circuit)] hover:underline">
                          Register Another Person
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {formState === 'ERROR' && (
                  <div className="border border-red-300 bg-red-50 p-6 mb-8 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-red-700 mb-1">Registration Failed</p>
                      <p className="font-body text-sm text-red-600">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {formState !== 'SUCCESS' && (
                  <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Section 1 */}
                    <div>
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
                        <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)]">01</span>
                        <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)]">Student Details</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <label className={LABEL_CLASS}>Full Name <span className="text-[var(--spark)]">*</span></label>
                          <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className={FIELD_CLASS} placeholder="As per university records" />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Registration No. <span className="text-[var(--spark)]">*</span></label>
                          <input type="text" name="registrationNumber" required value={formData.registrationNumber} onChange={handleChange} className={`${FIELD_CLASS} uppercase`} placeholder="e.g. 122XXXXX" />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Course <span className="text-[var(--spark)]">*</span></label>
                          <input type="text" name="course" required value={formData.course} onChange={handleChange} className={FIELD_CLASS} placeholder="e.g. MCA / BCA" />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Section <span className="text-[var(--spark)]">*</span></label>
                          <input type="text" name="section" required value={formData.section} onChange={handleChange} className={`${FIELD_CLASS} uppercase`} placeholder="e.g. K22XX" />
                        </div>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div>
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
                        <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)]">02</span>
                        <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)]">Contact Details</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <label className={LABEL_CLASS}>Email Address <span className="text-[var(--spark)]">*</span></label>
                          <input type="email" name="email" required value={formData.email} onChange={handleChange} className={FIELD_CLASS} placeholder="University or personal email" />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Phone Number <span className="text-[var(--spark)]">*</span></label>
                          <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={FIELD_CLASS} placeholder="10-digit mobile number" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className={LABEL_CLASS + " mb-0"}>WhatsApp Number</label>
                            <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                              <input type="checkbox" checked={sameAsPhone} onChange={() => setSameAsPhone(!sameAsPhone)} className="w-3 h-3 accent-[var(--circuit)]" />
                              Same as phone
                            </label>
                          </div>
                          <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} disabled={sameAsPhone}
                            className={`${FIELD_CLASS} ${sameAsPhone ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="Optional" />
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <p className="font-mono text-[9px] tracking-wider text-[var(--ink-soft)] max-w-sm">
                        By submitting, you agree to participate and receive event communications.
                      </p>
                      <button type="submit" disabled={formState === 'SENDING'}
                        className="flex-shrink-0 inline-flex items-center gap-2 bg-spark text-ink px-8 py-4 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-spark-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed group shadow-xl shadow-spark/20 hover:-translate-y-0.5 disabled:translate-y-0">
                        {formState === 'SENDING' ? 'SUBMITTING…' : 'CONFIRM REGISTRATION'}
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Sidebar — event summary */}
              <div className="lg:sticky lg:top-24 self-start">
                <div className="border border-[var(--border)] bg-[var(--paper-dim)] p-6 space-y-5">
                  <div className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] mb-4 border-b border-[var(--border)] pb-4">
                    Event Summary
                  </div>
                  <div>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-[var(--ink-soft)] mb-1">Event</div>
                    <div className="font-heading font-bold text-lg uppercase tracking-tight text-[var(--ink)] leading-tight">{event.title}</div>
                  </div>
                  {event.date && (
                    <div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-[var(--ink-soft)] mb-1">Date</div>
                      <div className="font-body font-medium text-[var(--ink)] flex items-center gap-1.5">
                        <Calendar size={12} className="text-[var(--circuit)]" />{event.date}
                      </div>
                    </div>
                  )}
                  {event.time && (
                    <div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-[var(--ink-soft)] mb-1">Time</div>
                      <div className="font-body font-medium text-[var(--ink)] flex items-center gap-1.5">
                        <Clock size={12} className="text-[var(--circuit)]" />{event.time}
                      </div>
                    </div>
                  )}
                  {event.venue && (
                    <div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-[var(--ink-soft)] mb-1">Venue</div>
                      <div className="font-body font-medium text-[var(--ink)] flex items-center gap-1.5">
                        <MapPin size={12} className="text-[var(--circuit)]" />{event.venue}
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t border-[var(--border)]">
                    <Link to={`/events/${event.slug}`} className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest uppercase text-[var(--circuit)] hover:text-[var(--ink)] transition-colors">
                      <ArrowLeft size={11} /> View Event Details
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}