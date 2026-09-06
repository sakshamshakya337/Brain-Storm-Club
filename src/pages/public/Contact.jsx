import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';

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

  usePageReveal(containerRef);
  useScrollReveal(containerRef);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState('SENDING');
    setErrorMessage('');
    
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
    <div ref={containerRef} className="w-full bg-white dark:bg-[#080D1A] min-h-screen text-slate-900 dark:text-[#F8FAFC] font-body overflow-x-hidden transition-colors duration-300">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[60svh] md:min-h-[75svh] flex items-center pt-6 md:pt-10 pb-20 overflow-hidden border-b border-slate-200 dark:border-[#26344D]">
        <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px', color: 'currentColor' }} />
        
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT */}
            <div className="col-span-1 lg:col-span-7 flex flex-col items-start min-w-0">
              <div className="reveal-eyebrow font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary mb-8 border border-brand-primary/30 px-3 py-1.5 rounded-sm bg-brand-primary/5 flex gap-4">
                <span>CONTACT</span>
                <span className="text-slate-400 dark:text-[#71819B]">/</span>
                <span>BRAINSTORM CLUB</span>
              </div>
              
              <h1 className="font-heading font-black text-[clamp(3.5rem,8vw,6rem)] leading-[0.9] tracking-tighter text-slate-900 dark:text-[#F8FAFC] mb-8 uppercase max-w-full break-words flex flex-col">
                <span className="overflow-hidden"><span className="reveal-heading-line block">LET'S</span></span>
                <span className="overflow-hidden"><span className="reveal-heading-line block">BUILD</span></span>
                <span className="overflow-hidden"><span className="reveal-heading-line block">SOMETHING</span></span>
                <span className="overflow-hidden pb-4">
                  <span className="reveal-heading-line block text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary">TOGETHER.</span>
                </span>
              </h1>
              
              <div className="reveal-text flex items-center gap-4 mb-6">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
                 </span>
                 <span className="font-mono text-[10px] font-bold tracking-widest text-slate-500 dark:text-[#71819B] uppercase">SYS.CONTACT / OPEN</span>
              </div>
              
              <p className="reveal-text font-body text-lg md:text-xl text-slate-600 dark:text-[#A8B5CC] max-w-xl font-light leading-relaxed">
                Have an idea, want to collaborate, or simply want to connect? Reach out to the Brainstorm community.
              </p>
            </div>
            
            {/* RIGHT (VISUAL) */}
            <div className="reveal-image col-span-1 lg:col-span-5 relative h-[400px] w-full hidden md:flex items-center justify-center p-6 lg:p-12">
              <div className="w-full h-full border border-slate-200 dark:border-[#26344D] bg-slate-50 dark:bg-[#0D1424] overflow-hidden rounded-sm relative flex items-center justify-center group p-8">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#151F33_1px,transparent_1px),linear-gradient(to_bottom,#151F33_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 dark:opacity-60" />
                
                {/* Stronger Composition */}
                <div className="relative w-full h-full z-10 flex items-center justify-center">
                  
                  {/* Central Large Element */}
                  <div className="absolute w-32 h-32 md:w-48 md:h-48 border border-brand-primary/20 dark:border-brand-primary/30 bg-brand-primary/5 dark:bg-[#111A2D] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-700 shadow-[0_0_40px_rgba(99,102,241,0.05)]">
                     <span className="font-heading font-black text-[clamp(4rem,15vw,8rem)] text-brand-primary/20 dark:text-[#26344D] group-hover:text-brand-primary/40 dark:group-hover:text-[#6366F1] transition-colors">@</span>
                  </div>

                  {/* Connecting Nodes */}
                  <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                     {/* Node 1 */}
                     <div className="absolute top-4 lg:top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                       <div className="w-12 h-12 bg-white dark:bg-[#151F33] border border-slate-200 dark:border-[#26344D] rounded-sm shadow-sm flex items-center justify-center overflow-hidden relative">
                         <div className="absolute inset-0 bg-brand-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <div className="w-2 h-2 bg-brand-secondary rounded-full"></div>
                       </div>
                     </div>
                     {/* Node 2 */}
                     <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2">
                       <div className="w-16 h-16 bg-white dark:bg-[#151F33] border border-slate-200 dark:border-[#26344D] rounded-full shadow-sm flex items-center justify-center overflow-hidden relative">
                          <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-3 h-3 bg-brand-primary rounded-full"></div>
                       </div>
                     </div>
                     {/* Node 3 */}
                     <div className="absolute top-1/3 left-4 flex flex-col items-center gap-2">
                       <div className="w-10 h-10 bg-white dark:bg-[#151F33] border border-slate-200 dark:border-[#26344D] rounded-sm shadow-sm flex items-center justify-center overflow-hidden relative">
                          <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-[#71819B] rounded-full"></div>
                       </div>
                     </div>
                  </div>

                  {/* Decorative Crosshairs */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-200 dark:bg-[#26344D] opacity-50"></div>
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200 dark:bg-[#26344D] opacity-50"></div>

                  {/* Floating Labels */}
                  <div className="absolute bottom-4 left-4 font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-[#71819B] bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-2 py-1">
                    PING_START
                  </div>
                  <div className="absolute top-4 right-4 font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-[#71819B] bg-white dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-2 py-1">
                    CONNECTION_ESTABLISHED
                  </div>

                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* CONTACT INFO GRID */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-[#26344D] bg-slate-50 dark:bg-[#080D1A]">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]" data-reveal="up">
          <h2 className="font-heading font-black text-3xl uppercase tracking-tight text-slate-900 dark:text-[#F8FAFC] mb-12">
            CONTACT CHANNELS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="flex flex-col p-8 border border-slate-200 dark:border-[#26344D] bg-white dark:bg-[#111A2D] hover:border-brand-primary/30 dark:hover:border-[#6366F1] transition-all duration-300 shadow-sm dark:shadow-none group relative overflow-hidden hover:-translate-y-1">
               <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B] mb-6">GENERAL</div>
               <p className="relative z-10 font-body text-lg text-slate-700 dark:text-[#A8B5CC] font-light leading-relaxed">
                 For questions, collaborations, and community opportunities.
               </p>
            </div>

            <a href="mailto:brainstorm.club.lpu@gmail.com" className="flex flex-col p-8 border border-slate-200 dark:border-[#26344D] bg-white dark:bg-[#111A2D] hover:border-brand-primary/30 dark:hover:border-[#6366F1] transition-all duration-300 shadow-sm dark:shadow-none group relative overflow-hidden hover:-translate-y-1">
               <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 flex justify-between items-center mb-6">
                 <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">EMAIL</div>
                 <ArrowUpRight size={16} className="text-slate-400 dark:text-[#71819B] group-hover:text-brand-primary group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
               </div>
               <p className="relative z-10 font-heading font-bold text-xl md:text-2xl text-slate-900 dark:text-[#F8FAFC] group-hover:text-brand-primary transition-colors break-all">
                 brainstorm.club.lpu@gmail.com
               </p>
            </a>

            <div className="flex flex-col p-8 border border-slate-200 dark:border-[#26344D] bg-white dark:bg-[#111A2D] hover:border-brand-primary/30 dark:hover:border-[#6366F1] transition-all duration-300 shadow-sm dark:shadow-none group relative overflow-hidden hover:-translate-y-1">
               <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B] mb-6">LOCATION</div>
               <p className="relative z-10 font-body text-lg text-slate-700 dark:text-[#A8B5CC] font-light leading-relaxed">
                 Lovely Professional University<br/>
                 Punjab, India
               </p>
            </div>

          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]" data-reveal="up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Left Context */}
            <div className="col-span-1 lg:col-span-5 flex flex-col">
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-slate-900 dark:text-[#F8FAFC] mb-6">
                SEND US A <span className="text-brand-primary">MESSAGE</span>
              </h2>
              <p className="font-body text-lg text-slate-600 dark:text-[#A8B5CC] font-light leading-relaxed mb-12 max-w-md">
                Tell us what you're working on, what you'd like to build, or how we can collaborate.
              </p>
              
              <div className="hidden lg:flex w-full h-[200px] border border-slate-200 dark:border-[#26344D] bg-slate-50 dark:bg-[#0D1424] mt-auto relative overflow-hidden p-6 flex-col justify-between group">
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#151F33_1px,transparent_1px),linear-gradient(to_bottom,#151F33_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
                 
                 {/* Decorative scanning line */}
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-primary/40 dark:bg-brand-primary/60 shadow-[0_0_8px_rgba(99,102,241,0.5)] transform -translate-y-full group-hover:translate-y-[200px] transition-transform duration-[3s] ease-linear" />
                 
                 {/* Connection Nodes */}
                 <div className="absolute inset-0">
                    <div className="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping opacity-75" />
                    <div className="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-brand-primary rounded-full" />
                    
                    <div className="absolute top-[60%] right-[30%] w-1.5 h-1.5 bg-brand-secondary rounded-full animate-pulse" />
                    
                    <div className="absolute bottom-[20%] left-[40%] w-1.5 h-1.5 bg-slate-400 dark:bg-[#71819B] rounded-full" />
                    
                    <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
                      <line x1="20%" y1="30%" x2="70%" y2="60%" stroke="currentColor" className="text-slate-400 dark:text-[#71819B]" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="20%" y1="30%" x2="40%" y2="80%" stroke="currentColor" className="text-slate-400 dark:text-[#71819B]" strokeWidth="1" strokeDasharray="3 3" />
                    </svg>
                 </div>

                 {/* Top Stats */}
                 <div className="relative z-10 flex justify-between items-start w-full">
                   <div className="flex flex-col gap-1">
                     <span className="font-mono text-[8px] font-bold tracking-widest text-slate-400 dark:text-[#71819B] uppercase">CONNECTION</span>
                     <span className="font-mono text-[10px] text-slate-700 dark:text-[#A8B5CC]">SECURE</span>
                   </div>
                   <div className="font-mono text-[8px] text-slate-400 dark:text-[#71819B] bg-white/50 dark:bg-[#111A2D]/50 px-2 py-1 border border-slate-200 dark:border-[#26344D] backdrop-blur-sm">
                     LATENCY: 24ms
                   </div>
                 </div>

                 {/* Bottom Status */}
                 <div className="relative z-10 flex items-center justify-between w-full mt-auto pt-4">
                    <div className="flex items-center gap-3 bg-white/50 dark:bg-[#111A2D]/50 px-3 py-1.5 border border-slate-200 dark:border-[#26344D] backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
                      <span className="font-mono text-[10px] font-bold tracking-widest text-slate-700 dark:text-[#F8FAFC] uppercase">CHANNEL / ACTIVE</span>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Right Form */}
            <div className="col-span-1 lg:col-span-7">
                  {/* ERROR STATE */}
                  {formState === 'ERROR' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-8 rounded-sm animate-in fade-in slide-in-from-bottom-4 flex items-start gap-4 mb-8">
                      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                        <span className="text-red-500 font-bold text-xl">!</span>
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-red-900 dark:text-red-100 mb-2">Message Failed</h3>
                        <p className="font-body text-red-800 dark:text-red-300 font-light">
                          {errorMessage}
                        </p>
                        <button 
                          onClick={() => setFormState('DEFAULT')}
                          className="mt-6 font-mono text-[10px] font-bold tracking-widest uppercase text-red-700 dark:text-red-400 hover:underline flex items-center gap-2"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}

                  {formState === 'SUCCESS' ? (
                <div className="w-full h-full min-h-[400px] border border-brand-primary/30 dark:border-brand-primary/20 bg-brand-primary/5 dark:bg-[#111A2D] p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 rounded-sm">
                  <div className="w-16 h-16 rounded-full bg-brand-primary/20 dark:bg-[#151F33] flex items-center justify-center mb-6 text-brand-primary">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-heading font-black text-3xl uppercase text-slate-900 dark:text-[#F8FAFC] mb-4">MESSAGE RECEIVED.</h3>
                  <p className="font-body text-lg text-slate-600 dark:text-[#A8B5CC] max-w-md">
                    Thanks for reaching out. The Brainstorm team will get back to you soon.
                  </p>
                  <button 
                    onClick={() => setFormState('DEFAULT')}
                    className="mt-8 font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B] hover:text-brand-primary dark:hover:text-brand-primary transition-colors border-b border-transparent hover:border-brand-primary pb-1"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">FULL NAME</label>
                      <input 
                        type="text" 
                        id="name" 
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full bg-white dark:bg-[#111A2D] border border-slate-300 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] dark:placeholder-[#71819B] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm shadow-sm dark:shadow-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">EMAIL ADDRESS</label>
                      <input 
                        type="email" 
                        id="email" 
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full bg-white dark:bg-[#111A2D] border border-slate-300 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] dark:placeholder-[#71819B] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm shadow-sm dark:shadow-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="subject" className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">SUBJECT</label>
                    <input 
                      type="text" 
                      id="subject" 
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What is this regarding?"
                      className="w-full bg-white dark:bg-[#111A2D] border border-slate-300 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] dark:placeholder-[#71819B] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm shadow-sm dark:shadow-none"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2 mb-4">
                    <label htmlFor="message" className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">MESSAGE</label>
                    <textarea 
                      id="message" 
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your message..."
                      className="w-full min-h-[160px] resize-y bg-white dark:bg-[#111A2D] border border-slate-300 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] dark:placeholder-[#71819B] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm shadow-sm dark:shadow-none"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={formState === 'SENDING'}
                    className="self-start bg-slate-900 dark:bg-brand-primary text-white px-10 py-5 font-heading font-semibold text-sm tracking-widest uppercase hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group shadow-xl shadow-brand-primary/10 disabled:opacity-70 disabled:scale-100 rounded-sm"
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
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-[#0D1424] border-t border-slate-200 dark:border-[#26344D]">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] text-center flex flex-col items-center" data-reveal="up">
          <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-slate-900 dark:text-[#F8FAFC] mb-6">
            HAVE AN IDEA?
          </h2>
          <p className="font-body text-lg md:text-xl text-slate-600 dark:text-[#A8B5CC] font-light max-w-2xl mb-12">
            Don't just tell us about it. <span className="text-brand-primary dark:text-[#6366F1] font-medium">Build it with us.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/ideas" className="bg-slate-900 dark:bg-brand-primary text-white px-8 py-4 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-lg">
              SUBMIT AN IDEA
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/events" className="bg-transparent border border-slate-300 dark:border-[#26344D] text-slate-900 dark:text-[#F8FAFC] px-8 py-4 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-slate-100 dark:hover:bg-[#111A2D] transition-colors flex items-center justify-center gap-2 group">
              EXPLORE EVENTS
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* OVERRIDING GLOBAL FOOTER WRAPPER FOR STRICT DARK THEME COMPLIANCE */}
      <div className="dark:bg-[#050914] dark:border-t dark:border-[#26344D]">
        <Footer />
      </div>
    </div>
  );
}
