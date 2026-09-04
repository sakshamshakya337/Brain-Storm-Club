import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import EventStatus from '../../components/events/EventStatus';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function EventRegistration() {
  const { slug } = useParams();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventError, setEventError] = useState('');

  const [formState, setFormState] = useState('DEFAULT'); // DEFAULT, SENDING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    registrationNumber: '',
    course: '',
    section: '',
    email: '',
    phone: '',
    whatsapp: ''
  });

  const [sameAsPhone, setSameAsPhone] = useState(false);

  const containerRef = useRef(null);

  usePageReveal(containerRef, [loading, !event]);
  useScrollReveal(containerRef, [loading, !event]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch event details
    fetch(`/api/public/events/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setEvent(data.data.event);
        } else {
          setEventError('Event not found.');
        }
      })
      .catch(err => {
        setEventError('Unable to load event details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // Sync WhatsApp
  useEffect(() => {
    if (sameAsPhone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [formData.phone, sameAsPhone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;

    if (!formData.fullName || !formData.registrationNumber || !formData.course || !formData.section || !formData.email || !formData.phone) {
      setErrorMessage("Please fill all required fields.");
      setFormState('ERROR');
      return;
    }

    setFormState('SENDING');
    setErrorMessage('');

    try {
      const payload = {
        eventId: event._id,
        fullName: formData.fullName,
        registrationNumber: formData.registrationNumber,
        course: formData.course,
        section: formData.section,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        hasWhatsapp: true
      };

      const res = await fetch('/api/public/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setFormState('SUCCESS');
      setFormData({
        fullName: '', registrationNumber: '', course: '', section: '', email: '', phone: '', whatsapp: ''
      });
      setSameAsPhone(false);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "A network error occurred. Please try again later.");
      setFormState('ERROR');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body flex flex-col justify-between">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] pt-24 pb-32 flex-1 flex flex-col justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-xs tracking-widest text-slate-500 uppercase">LOADING EVENT REGISTRATION...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (eventError || !event) {
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

  const isClosed = !event.registrationOpen;

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body">
      
      {/* HERO SECTION */}
      <section className="pt-6 md:pt-10 pb-16 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="reveal-eyebrow mb-6 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-bold flex flex-wrap items-center gap-2">
            <Link to="/events" className="hover:text-brand-primary transition-colors">Events</Link>
            <span>/</span>
            <Link to={`/events/${event.slug}`} className="hover:text-brand-primary transition-colors truncate max-w-[200px]">{event.title}</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">Register</span>
          </div>

          <div className="max-w-4xl">
            <h1 className="font-heading font-black text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.9] tracking-tighter uppercase mb-6 text-slate-900 dark:text-white flex flex-col">
              <span className="overflow-hidden pb-2"><span className="reveal-heading-line block">{isClosed ? "REGISTRATION CLOSED" : "EVENT REGISTRATION"}</span></span>
            </h1>
            <p className="reveal-text font-body text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl leading-relaxed mb-8">
              {isClosed 
                ? `Registration for ${event.title} is currently closed. We are no longer accepting new registrations.`
                : `Secure your spot for ${event.title}. Please provide accurate information as it will be used for your certificate and event communications.`}
            </p>
            
            <div className="reveal-text flex flex-wrap gap-4 items-center font-mono text-xs font-bold tracking-widest uppercase">
               <EventStatus status={event.status} />
               <span className="border border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-white/50 dark:bg-slate-900/50">
                 {event.date}
               </span>
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]" data-reveal="up">
          
          {isClosed ? (
            <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-8 lg:p-12 text-center rounded-sm">
              <h2 className="font-heading font-bold text-2xl uppercase tracking-tight mb-4 text-slate-900 dark:text-white">Currently Unavailable</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                We are sorry, but registrations for this event are no longer being accepted.
              </p>
              <Link to={`/events/${event.slug}`} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 font-heading font-bold tracking-widest uppercase hover:bg-brand-primary dark:hover:bg-brand-primary hover:text-white transition-colors inline-flex items-center gap-2 text-sm shadow-xl">
                <ArrowLeft size={16} /> Back to Event Details
              </Link>
            </div>
          ) : (
            <div className="max-w-3xl">
              {/* SUCCESS MESSAGE */}
              {formState === 'SUCCESS' && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-8 mb-12 rounded-sm animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 size={24} className="text-emerald-500 mt-1 shrink-0" />
                    <div>
                      <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-emerald-900 dark:text-emerald-100 mb-2">Registration Successful</h3>
                      <p className="font-body text-emerald-800 dark:text-emerald-300 font-light">
                        Thank you for registering for {event.title}! Your spot is confirmed. We will reach out to you with further details on your registered email/phone.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-4">
                         <Link to={`/events/${event.slug}`} className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                           Back to Event
                         </Link>
                         <button onClick={() => { setFormState('DEFAULT'); }} className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 hover:underline">
                           Register Another Person
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {formState === 'ERROR' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 mb-12 rounded-sm animate-in fade-in slide-in-from-bottom-4 flex items-start gap-4">
                  <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-900 dark:text-red-100 mb-1">Registration Failed</h3>
                    <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
                  </div>
                </div>
              )}

              {formState !== 'SUCCESS' && (
                <form onSubmit={handleSubmit} className="space-y-12">
                  
                  {/* Personal Details */}
                  <div className="space-y-6">
                    <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                      1. PERSONAL DETAILS
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block font-mono text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">
                          Full Name <span className="text-brand-primary">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="fullName" 
                          required 
                          value={formData.fullName} 
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 font-body text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary transition-colors rounded-sm"
                          placeholder="As per university records"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block font-mono text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">
                          Registration Number <span className="text-brand-primary">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="registrationNumber" 
                          required 
                          value={formData.registrationNumber} 
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 font-body text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary transition-colors uppercase rounded-sm"
                          placeholder="e.g. 122XXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block font-mono text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">
                          Course <span className="text-brand-primary">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="course" 
                          required 
                          value={formData.course} 
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 font-body text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary transition-colors rounded-sm"
                          placeholder="e.g. MCA/BCA"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block font-mono text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">
                          Section <span className="text-brand-primary">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="section" 
                          required 
                          value={formData.section} 
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 font-body text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary transition-colors uppercase rounded-sm"
                          placeholder="e.g. K22XX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-6">
                    <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                      2. CONTACT DETAILS
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block font-mono text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">
                          Email Address <span className="text-brand-primary">*</span>
                        </label>
                        <input 
                          type="email" 
                          name="email" 
                          required 
                          value={formData.email} 
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 font-body text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary transition-colors rounded-sm"
                          placeholder="university or personal email"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block font-mono text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">
                            Phone Number <span className="text-brand-primary">*</span>
                          </label>
                          <input 
                            type="tel" 
                            name="phone" 
                            required 
                            value={formData.phone} 
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 font-body text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary transition-colors rounded-sm"
                            placeholder="10-digit mobile number"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <label className="block font-mono text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">
                              WhatsApp Number
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              <input 
                                type="checkbox" 
                                checked={sameAsPhone} 
                                onChange={() => setSameAsPhone(!sameAsPhone)}
                                className="w-3 h-3 accent-brand-primary"
                              />
                              Same as Phone
                            </label>
                          </div>
                          <input 
                            type="tel" 
                            name="whatsapp" 
                            value={formData.whatsapp} 
                            onChange={handleInputChange}
                            disabled={sameAsPhone}
                            className={`w-full border border-slate-200 dark:border-slate-800 px-4 py-3 font-body text-slate-900 dark:text-white focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary transition-colors rounded-sm ${sameAsPhone ? 'bg-slate-100 dark:bg-slate-800/50 opacity-70 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900'}`}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-6 flex-wrap">
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                      By submitting this form, you agree to participate in the event and receive communications.
                    </p>
                    <button 
                      type="submit" 
                      disabled={formState === 'SENDING'}
                      className="bg-brand-primary text-white px-8 py-4 font-heading font-bold tracking-widest uppercase hover:bg-brand-secondary transition-colors inline-flex items-center gap-2 shadow-xl hover:shadow-brand-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {formState === 'SENDING' ? 'SUBMITTING...' : 'CONFIRM REGISTRATION'}
                      <ArrowRight size={16} />
                    </button>
                  </div>

                </form>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
