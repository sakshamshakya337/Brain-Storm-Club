import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { validateEmail, validateName, validateRequiredText } from '../../utils/validation';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Contact() {
  const [formState, setFormState] = useState('DEFAULT'); // DEFAULT, SENDING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const backgroundRef = useRef(null);

  usePageReveal(containerRef);
  useScrollReveal(containerRef);

  useGSAP(() => {
    if (!heroRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
    const ctx = gsap.context(() => {
      const intro = !reduced ? gsap.timeline()
        .from(backgroundRef.current, { opacity: 0, scale: 1.025, duration: .7, clearProps: 'all' }, .1)
        .from('[data-contact-hero-line]', { opacity: 0, y: 30, duration: .65, stagger: .12, clearProps: 'all' }, .35)
        .from('[data-contact-hero-copy]', { opacity: 0, y: 12, duration: .45, stagger: .08, clearProps: 'all' }, .8) : null;
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
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const errors = [
      validateName(formData.name, 'Name'),
      validateEmail(formData.email),
      validateRequiredText(formData.subject, 'Subject', 2, 150),
      validateRequiredText(formData.message, 'Message', 10, 2000)
    ].filter(Boolean);

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
      setFormState('ERROR');
      return;
    }

    setFormState('SENDING');
    
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      setFormState('SUCCESS');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Unable to send your message right now. Please try again.');
      setFormState('ERROR');
    }
  };

  return (
    <div ref={containerRef} className="w-full bg-paper min-h-screen text-ink font-body overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative isolate border-b border-border bg-paper overflow-hidden px-6 pb-12 pt-20 md:px-12 lg:px-20" style={{ minHeight: 'min(680px,84svh)' }}>
        <div ref={backgroundRef} className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <img src="/circuit-horizon.png" alt="" className="h-full w-full object-cover object-bottom opacity-30" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--paper)_15%,transparent_65%,var(--paper)_100%)] pointer-events-none" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70 z-0" aria-hidden="true" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path d="M0 80 H200 L260 130 H500 L560 70 H780 L840 120 H1080 L1140 60 H1440" fill="none" stroke="var(--circuit)" strokeWidth="1.2" strokeDasharray="8 36" className="electric-trace-reverse" />
          <path d="M0 320 H180 L240 270 H460 L520 340 H740 L800 280 H1020 L1080 350 H1440" fill="none" stroke="var(--spark)" strokeWidth="1" strokeDasharray="6 42" className="electric-trace" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center h-full py-12 md:py-20">
          
          {/* LEFT */}
          <div className="col-span-1 lg:col-span-7 flex flex-col items-start min-w-0">
            <p data-contact-hero-copy className="font-mono text-[10px] font-bold tracking-[0.35em] uppercase text-circuit mb-6">
              LPU SCA / Brainstorm Club
            </p>
            
            <h1 className="font-heading font-black uppercase tracking-tight leading-[0.88] text-ink" style={{ fontSize: 'clamp(3.5rem,10vw,7.5rem)' }}>
              <span data-contact-hero-line className="block">LET'S BUILD</span>
              <span data-contact-hero-line className="block">SOMETHING</span>
              <span data-contact-hero-line className="block text-transparent bg-clip-text bg-gradient-to-r from-spark to-circuit">TOGETHER.</span>
            </h1>
            
            <div data-contact-hero-copy className="flex items-center gap-4 mt-8 mb-8">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circuit opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-circuit"></span>
               </span>
               <span className="font-mono text-[10px] font-bold tracking-widest text-ink-soft uppercase">SYS.CONTACT / OPEN</span>
            </div>
            
            <p data-contact-hero-copy className="max-w-xl font-body text-lg text-ink-soft leading-relaxed">
              Have an idea, want to collaborate, or simply want to connect? Reach out to the Brainstorm community.
            </p>
          </div>
          
          {/* RIGHT (VISUAL) */}
          <div data-contact-hero-copy className="col-span-1 lg:col-span-5 relative h-[400px] w-full hidden md:flex items-center justify-center p-6 lg:p-12">
            <div className="w-full h-full border border-border bg-paper-dim overflow-hidden rounded-sm relative flex items-center justify-center group p-8">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
                
              <div className="relative w-full h-full z-10 flex items-center justify-center">
                  
                <div className="absolute w-32 h-32 md:w-48 md:h-48 border border-circuit/20 bg-circuit/5 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-700 shadow-[0_0_40px_rgba(79,70,229,0.05)]">
                   <span className="font-heading font-black text-[clamp(4rem,15vw,8rem)] text-circuit/20 group-hover:text-circuit/40 transition-colors">@</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                   <div className="absolute top-4 lg:top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                     <div className="w-12 h-12 bg-paper border border-border rounded-sm shadow-sys flex items-center justify-center overflow-hidden relative">
                       <div className="absolute inset-0 bg-spark/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <div className="w-2 h-2 bg-spark rounded-full"></div>
                     </div>
                   </div>
                   <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2">
                     <div className="w-16 h-16 bg-paper border border-border rounded-full shadow-sys flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-circuit/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-3 h-3 bg-circuit rounded-full"></div>
                     </div>
                   </div>
                   <div className="absolute top-1/3 left-4 flex flex-col items-center gap-2">
                     <div className="w-10 h-10 bg-paper border border-border rounded-sm shadow-sys flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-circuit/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-1.5 h-1.5 bg-ink-soft rounded-full"></div>
                     </div>
                   </div>
                </div>

                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border opacity-50"></div>
                <div className="absolute left-0 right-0 top-1/2 h-px bg-border opacity-50"></div>

                <div className="absolute bottom-4 left-4 font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft bg-paper border border-border px-2 py-1">
                  PING_START
                </div>
                <div className="absolute top-4 right-4 font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft bg-paper border border-border px-2 py-1">
                  CONNECTION_ESTABLISHED
                </div>

              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* CONTACT INFO GRID */}
      <section className="py-16 md:py-24 border-b border-border bg-paper-dim px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl" data-reveal="up">
          <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-border"></span>
            CHANNELS
          </div>
          <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-ink mb-12">
            CONTACT CHANNELS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="flex flex-col p-8 border border-border bg-paper hover:border-circuit transition-all duration-300 shadow-sys group relative overflow-hidden hover:-translate-y-1">
               <div className="absolute inset-0 bg-circuit/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft mb-6">GENERAL</div>
               <p className="relative z-10 font-body text-lg text-ink-soft font-light leading-relaxed">
                 For questions, collaborations, and community opportunities.
               </p>
            </div>

            <a href="mailto:brainstorm.club.lpu@gmail.com" className="flex flex-col p-8 border border-border bg-paper hover:border-circuit transition-all duration-300 shadow-sys group relative overflow-hidden hover:-translate-y-1">
               <div className="absolute inset-0 bg-circuit/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 flex justify-between items-center mb-6">
                 <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">EMAIL</div>
                 <ArrowUpRight size={16} className="text-ink-soft group-hover:text-circuit group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
               </div>
               <p className="relative z-10 font-heading font-bold text-xl md:text-2xl text-ink group-hover:text-circuit transition-colors break-all">
                 brainstorm.club.lpu@gmail.com
               </p>
            </a>

            <div className="flex flex-col p-8 border border-border bg-paper hover:border-circuit transition-all duration-300 shadow-sys group relative overflow-hidden hover:-translate-y-1">
               <div className="absolute inset-0 bg-circuit/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft mb-6">LOCATION</div>
               <p className="relative z-10 font-body text-lg text-ink-soft font-light leading-relaxed">
                 Lovely Professional University<br/>
                 Punjab, India
               </p>
            </div>

          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl" data-reveal="up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Left Context */}
            <div className="col-span-1 lg:col-span-5 flex flex-col">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-border"></span>
                MESSAGE
              </div>
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-ink mb-6">
                SEND US A <span className="text-circuit">MESSAGE</span>
              </h2>
              <p className="font-body text-lg text-ink-soft font-light leading-relaxed mb-12 max-w-md">
                Tell us what you're working on, what you'd like to build, or how we can collaborate.
              </p>
              
              <div className="hidden lg:flex w-full h-[200px] border border-border bg-paper-dim mt-auto relative overflow-hidden p-6 flex-col justify-between group">
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
                 
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-circuit/40 shadow-[0_0_8px_rgba(79,70,229,0.5)] transform -translate-y-full group-hover:translate-y-[200px] transition-transform duration-[3s] ease-linear" />
                 
                 <div className="absolute inset-0">
                    <div className="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-circuit rounded-full animate-ping opacity-75" />
                    <div className="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-circuit rounded-full" />
                    
                    <div className="absolute top-[60%] right-[30%] w-1.5 h-1.5 bg-spark rounded-full animate-pulse" />
                    
                    <div className="absolute bottom-[20%] left-[40%] w-1.5 h-1.5 bg-ink-soft rounded-full" />
                    
                    <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                      <line x1="20%" y1="30%" x2="70%" y2="60%" stroke="currentColor" className="text-ink-soft" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20%" y1="30%" x2="40%" y2="80%" stroke="currentColor" className="text-ink-soft" strokeWidth="1" strokeDasharray="3 3" />
                    </svg>
                 </div>

                 <div className="relative z-10 flex justify-between items-start w-full">
                   <div className="flex flex-col gap-1">
                     <span className="font-mono text-[8px] font-bold tracking-widest text-ink-soft uppercase">CONNECTION</span>
                     <span className="font-mono text-[10px] text-ink">SECURE</span>
                   </div>
                   <div className="font-mono text-[8px] text-ink-soft bg-paper/50 px-2 py-1 border border-border backdrop-blur-sm">
                     LATENCY: 24ms
                   </div>
                 </div>

                 <div className="relative z-10 flex items-center justify-between w-full mt-auto pt-4">
                    <div className="flex items-center gap-3 bg-paper/50 px-3 py-1.5 border border-border backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-circuit animate-pulse"></div>
                      <span className="font-mono text-[10px] font-bold tracking-widest text-ink uppercase">CHANNEL / ACTIVE</span>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Right Form */}
            <div className="col-span-1 lg:col-span-7">
                  {/* ERROR STATE */}
                  {formState === 'ERROR' && (
                    <div className="bg-red-50 border border-red-200 p-8 rounded-sm animate-in fade-in slide-in-from-bottom-4 flex items-start gap-4 mb-8">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <span className="text-red-500 font-bold text-xl">!</span>
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-red-900 mb-2">Message Failed</h3>
                        <p className="font-body text-red-800 font-light">
                          {errorMessage}
                        </p>
                        <button 
                          onClick={() => setFormState('DEFAULT')}
                          className="mt-6 font-mono text-[10px] font-bold tracking-widest uppercase text-red-700 hover:underline flex items-center gap-2"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}

                  {formState === 'SUCCESS' ? (
                <div className="w-full h-full min-h-[400px] border border-circuit/30 bg-circuit/5 p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 rounded-sm">
                  <div className="w-16 h-16 rounded-full bg-circuit/20 flex items-center justify-center mb-6 text-circuit">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-heading font-black text-3xl uppercase text-ink mb-4">MESSAGE RECEIVED.</h3>
                  <p className="font-body text-lg text-ink-soft max-w-md">
                    Thanks for reaching out. The Brainstorm team will get back to you soon.
                  </p>
                  <button 
                    onClick={() => setFormState('DEFAULT')}
                    className="mt-8 font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft hover:text-circuit transition-colors border-b border-transparent hover:border-circuit pb-1"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">FULL NAME</label>
                      <input 
                        type="text" 
                        id="name" 
                        required
                        maxLength={100}
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full bg-paper border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">EMAIL ADDRESS</label>
                      <input 
                        type="email" 
                        id="email" 
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full bg-paper border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="subject" className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">SUBJECT</label>
                    <input 
                      type="text" 
                      id="subject" 
                      required
                      maxLength={150}
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What is this regarding?"
                      className="w-full bg-paper border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2 mb-4">
                    <label htmlFor="message" className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">MESSAGE</label>
                    <textarea 
                      id="message" 
                      required
                      maxLength={2000}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your message..."
                      className="w-full min-h-[160px] resize-y bg-paper border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={formState === 'SENDING'}
                    className="self-start rounded-[10px] bg-spark px-8 py-4 font-medium text-ink transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group shadow-xl shadow-spark/20 disabled:opacity-70 disabled:translate-y-0"
                  >
                    {formState === 'SENDING' ? 'SENDING...' : 'SEND MESSAGE'}
                    {formState !== 'SENDING' && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section className="py-24 md:py-32 bg-paper-dim border-t border-border px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl text-center flex flex-col items-center" data-reveal="up">
          <p className="font-mono text-sm text-circuit mb-4">A thought is better in the open.</p>
          <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-ink mb-6">
            HAVE AN IDEA?
          </h2>
          <p className="font-body text-lg md:text-xl text-ink-soft font-light max-w-2xl mb-12">
            Don't just tell us about it. <span className="text-circuit font-medium">Build it with us.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link to="/ideas" className="rounded-[10px] bg-spark px-8 py-4 font-medium text-ink transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group shadow-xl shadow-spark/20">
              SUBMIT AN IDEA
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/events" className="rounded-[10px] border border-circuit bg-paper px-8 py-4 font-medium text-ink transition-colors hover:bg-paper-dim flex items-center justify-center gap-2 group">
              EXPLORE EVENTS
              <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
