import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Calendar, Clock, MapPin, ChevronRight, PlayCircle, Users, Lightbulb, Zap, MessageSquare } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';
import IdeasFlow from '../../components/sections/IdeasFlow';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useMagneticButton } from '../../hooks/useMagneticButton';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef(null);
  usePageReveal(containerRef);
  useScrollReveal(containerRef);
  
  const ctaRef = useMagneticButton(0.4);
  const statsSectionRef = useRef(null);

  // Stats Counter Animation
  useGSAP(() => {
    if (!statsSectionRef.current) return;

    const statCards = gsap.utils.toArray('.stat-card', statsSectionRef.current);
    const statElements = gsap.utils.toArray('.stat-counter', statsSectionRef.current);
    const statLabels = gsap.utils.toArray('.stat-label', statsSectionRef.current);
    const statNums = gsap.utils.toArray('.stat-num', statsSectionRef.current);
    if (!statElements.length) return;

    // Respect prefers-reduced-motion: skip animation, show final values
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set([statCards, statElements, statLabels, statNums], { opacity: 1, y: 0 });
      statElements.forEach((el) => { el.innerText = el.dataset.value; });
      return;
    }

    // Set initial hidden states
    gsap.set(statCards, { opacity: 0, y: 20 });
    gsap.set(statNums, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: statsSectionRef.current,
        start: 'top 82%',
        once: true,
      }
    });

    // Staggered card reveal
    tl.to(statCards, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
    });

    // Index number reveal
    tl.to(statNums, {
      opacity: 1,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out',
    }, '-=0.5');

    // Count-up for each stat number
    statElements.forEach((el, index) => {
      const finalValue = el.dataset.value;
      const numericMatch = finalValue.match(/[\d.]+/);
      if (!numericMatch) return;

      const targetNum = parseFloat(numericMatch[0]);
      const suffix = finalValue.replace(numericMatch[0], '');
      const isDecimal = numericMatch[0].includes('.');

      // Reserve min-width to prevent layout shift during count-up
      el.style.minWidth = `${el.offsetWidth}px`;

      // Start at zero with the same suffix formatting to avoid layout shift
      el.innerText = isDecimal ? `0.0${suffix}` : `0${suffix}`;

      const proxy = { val: 0 };

      tl.to(proxy, {
        val: targetNum,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate() {
          const v = isDecimal
            ? proxy.val.toFixed(1)
            : Math.floor(proxy.val);
          el.innerText = `${v}${suffix}`;
        },
        onComplete() {
          // Guarantee exact final value
          el.innerText = finalValue;
          // Release min-width constraint once settled
          el.style.minWidth = '';
        },
      }, index * 0.15 + 0.2); // Subtle per-counter stagger, starts after card reveal
    });

  }, { scope: statsSectionRef });

  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const showcaseImages = [
    { src: 'https://i.ibb.co/fdnpG2jd/IMG-9328.jpg', label: '01 / THINK', type: 'EVENT', title: 'WORKSHOP' },
    { src: '/build.jpg', label: '02 / BUILD', type: 'BRAINSTORM', title: 'SESSION' },
    { src: 'https://i.ibb.co/4wmHXZfg/IMG-1202.avif', label: '03 / CONNECT', type: 'HACKATHON', title: 'PROJECTS' },
    { src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop', label: '04 / IMPACT', type: 'COMMUNITY', title: 'MEETUP' }
  ];

  useEffect(() => {
    // Auto-advance carousel
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-[100svh] flex items-center pt-6 md:pt-10 pb-12 overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        {/* Subtle Decorative Grid */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px', color: 'currentColor' }}
        />

        <div className="w-full mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center lg:items-start">

            {/* LEFT: Typography */}
            <div className="col-span-1 lg:col-span-6 flex flex-col items-start">
              <div className="reveal-eyebrow flex flex-wrap items-center gap-4 mb-8">
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-sm bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm">
                  LPU SCA / BRAINSTORM CLUB
                </span>
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></span>
                <span className="font-mono text-xs tracking-widest text-brand-primary font-bold uppercase hidden sm:block">
                  Innovation Community
                </span>
              </div>

              <h1 className="font-heading font-black text-[clamp(3rem,10vw,6rem)] leading-[0.9] tracking-tighter text-slate-900 dark:text-white mb-6 uppercase flex flex-col">
                <span className="overflow-hidden"><span className="reveal-heading-line block">WHERE</span></span>
                <span className="overflow-hidden"><span className="reveal-heading-line block">ACADEMIA</span></span>
                <span className="overflow-hidden"><span className="reveal-heading-line block">MEETS</span></span>
                <span className="overflow-hidden pb-4">
                  <span className="reveal-heading-line block text-brand-primary relative">
                    INNOVATION.
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-transparent opacity-50"></span>
                  </span>
                </span>
              </h1>

              <p className="reveal-text font-body text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mb-10 leading-relaxed font-light">
                A student-led technology community at Lovely Professional University where students think, build, connect and turn ideas into action.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link ref={ctaRef} to="/events" className="reveal-cta bg-slate-900 dark:bg-brand-primary text-white px-8 py-4 rounded-full font-mono text-sm font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-xl shadow-brand-primary/20 relative">
                  Explore Events
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/join-us" className="reveal-cta bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-full font-mono text-sm font-bold tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 group">
                  Join the Community
                  <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </div>

              {/* Scroll Indicator (Integrated into Left Column Flow) */}
              <div className="reveal-meta mt-16 md:mt-24 flex flex-col items-start gap-3 opacity-60">
                <span className="font-mono text-[10px] tracking-[0.3em] font-bold uppercase text-slate-500 dark:text-slate-400">Scroll to explore</span>
                <div className="w-[1px] h-12 bg-slate-300 dark:bg-slate-700 overflow-hidden relative ml-0.5">
                  <div className="absolute top-0 left-0 w-full h-full bg-brand-primary origin-top animate-[scroll_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>

            {/* RIGHT: Automatic Image Showcase */}
            <div className="reveal-image col-span-1 lg:col-span-6 relative min-h-[400px] lg:h-[700px] w-full bg-slate-100 dark:bg-slate-900/50 flex flex-col p-6 overflow-hidden">
              {/* Dynamic Image Container */}
              <div className="absolute inset-0 z-0 bg-slate-950">
                {showcaseImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="absolute inset-0 transition-all duration-1000 ease-in-out origin-center"
                    style={{
                      opacity: currentImageIndex === idx ? 1 : 0,
                      transform: currentImageIndex === idx ? 'scale(1)' : 'scale(1.05)',
                      visibility: currentImageIndex === idx ? 'visible' : 'hidden'
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="w-full h-full object-cover mix-blend-luminosity opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-transparent"></div>
                  </div>
                ))}
              </div>

              {/* Overlay Content */}
              <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start w-full">
                  {/* Subtle technical labels */}
                  <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1.5 font-mono text-[10px] tracking-widest flex items-center gap-2 text-slate-900 dark:text-white font-bold uppercase transition-all duration-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                    {showcaseImages[currentImageIndex].label}
                  </div>

                  {/* Progress Indicator */}
                  <div className="reveal-meta flex flex-col items-end gap-2">
                    <div className="font-mono text-xs font-bold text-white tracking-widest">
                      0{currentImageIndex + 1} <span className="text-slate-400">/ 0{showcaseImages.length}</span>
                    </div>
                    <div className="flex gap-1">
                      {showcaseImages.map((_, idx) => (
                        <div key={idx} className="h-0.5 w-6 bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-brand-primary transition-all duration-1000"
                            style={{
                              width: idx === currentImageIndex ? '100%' : (idx < currentImageIndex ? '100%' : '0%')
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="reveal-meta flex flex-col items-start pb-4">
                  <div className="font-mono text-[10px] tracking-widest text-brand-primary mb-2 font-bold bg-brand-primary/10 px-2 py-1 rounded-sm">
                    {showcaseImages[currentImageIndex].type}
                  </div>
                  <h3 className="font-heading text-4xl text-white font-bold tracking-tight uppercase">
                    {showcaseImages[currentImageIndex].title}
                  </h3>
                </div>
              </div>

              {/* Technical Grid Elements overlay */}
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 flex flex-col gap-2 z-20">
                <div className="w-1 h-8 bg-slate-800"></div>
                <div className="w-1 h-4 bg-brand-secondary"></div>
                <div className="w-1 h-12 bg-slate-800"></div>
              </div>
            </div>

          </div>
        </div>

        <style>{`
          @keyframes scroll {
            0% { transform: scaleY(0); transform-origin: top; }
            50% { transform: scaleY(1); transform-origin: top; }
            50.1% { transform: scaleY(1); transform-origin: bottom; }
            100% { transform: scaleY(0); transform-origin: bottom; }
          }
        `}</style>
      </section>

      {/* SECTION 2: TECHNICAL STRIP */}
      <div className="w-full bg-slate-950 text-white py-3 overflow-hidden border-b border-slate-900 relative">
        <div className="absolute inset-0 bg-brand-primary/5"></div>
        <div className="flex whitespace-nowrap animate-pulse font-mono text-[10px] sm:text-xs tracking-[0.3em] font-bold opacity-70 relative z-10">
          <style>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-marquee {
                animation: marquee 30s linear infinite;
            }
          `}</style>
          <div className="flex animate-marquee">
            <span className="mx-6 sm:mx-12">BRAINSTORM</span> •
            <span className="mx-6 sm:mx-12">LPU SCA</span> •
            <span className="mx-6 sm:mx-12 text-brand-primary">EVENTS</span> •
            <span className="mx-6 sm:mx-12">IDEAS</span> •
            <span className="mx-6 sm:mx-12 text-brand-secondary">COMMUNITY</span> •
            <span className="mx-6 sm:mx-12">INNOVATION</span> •
            <span className="mx-6 sm:mx-12">BUILD</span> •
            <span className="mx-6 sm:mx-12 text-brand-primary">IMPACT</span> •
            {/* Repeat for seamless loop */}
            <span className="mx-6 sm:mx-12">BRAINSTORM</span> •
            <span className="mx-6 sm:mx-12">LPU SCA</span> •
            <span className="mx-6 sm:mx-12 text-brand-primary">EVENTS</span> •
            <span className="mx-6 sm:mx-12">IDEAS</span> •
            <span className="mx-6 sm:mx-12 text-brand-secondary">COMMUNITY</span> •
            <span className="mx-6 sm:mx-12">INNOVATION</span> •
            <span className="mx-6 sm:mx-12">BUILD</span> •
            <span className="mx-6 sm:mx-12 text-brand-primary">IMPACT</span> •
          </div>
        </div>
      </div>

      {/* SECTION 3: STATISTICS (Editorial Grid) */}
      <section ref={statsSectionRef} className="py-16 border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
        <div className="container mx-auto px-6 md:px-12 max-w-[1440px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-slate-200 dark:divide-slate-800" data-reveal="stagger-children">
            {[
              { num: '01', value: '45+', label: 'EVENTS HOSTED' },
              { num: '02', value: '1.2K', label: 'ACTIVE MEMBERS' },
              { num: '03', value: '300+', label: 'IDEAS PITCHED' },
              { num: '04', value: '50+', label: 'LIVE PROJECTS' }
            ].map((stat, i) => (
              <div key={i} className="stat-card flex flex-col lg:px-10">
                <div className="stat-num font-mono text-[10px] font-bold tracking-widest text-brand-primary mb-4">{stat.num}</div>
                <div 
                  className="stat-counter font-heading font-black text-5xl md:text-6xl lg:text-7xl tracking-tighter text-slate-900 dark:text-white mb-2 tabular-nums"
                  data-value={stat.value}
                >
                  {stat.value}
                </div>
                <div className="stat-label font-mono text-xs font-medium tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: WHAT WE DO */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 md:px-12 max-w-[1440px]">
          <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-[4rem] tracking-tight text-slate-900 dark:text-white uppercase mb-16 max-w-2xl leading-[0.9]" data-reveal="up">
            WHAT WE DO
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-reveal="stagger-children">
            {[
              { num: '01 / THINK', title: 'Explore ideas', desc: 'Dive into emerging technologies and new possibilities.', icon: <Lightbulb size={24} />, weight: 'lg:col-span-1 lg:row-span-2 bg-slate-100 dark:bg-slate-900' },
              { num: '02 / BUILD', title: 'Turn concepts into reality', desc: 'Practical projects built by students, for the world.', icon: <Zap size={24} />, weight: 'lg:col-span-2 bg-brand-primary text-white' },
              { num: '03 / COMPETE', title: 'Hackathons & Contests', desc: 'Take part in coding challenges on a national scale.', icon: <PlayCircle size={24} />, weight: 'lg:col-span-1 bg-slate-900 text-white' },
              { num: '04 / CONNECT', title: 'Meet Innovators', desc: 'Meet students, mentors and industry experts.', icon: <Users size={24} />, weight: 'lg:col-span-3 bg-slate-50 dark:bg-slate-800' }
            ].map((item, i) => (
              <div key={i} className={`p-8 md:p-10 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300 border border-transparent hover:border-brand-secondary/30 ${item.weight}`}>
                <div className={`font-mono text-[10px] font-bold tracking-widest uppercase mb-8 ${i === 1 || i === 2 ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.num}
                </div>
                <div>
                  <div className={`mb-4 ${i === 1 || i === 2 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{item.icon}</div>
                  <h4 className={`font-heading font-bold text-2xl tracking-tight mb-3 ${i === 1 || i === 2 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{item.title}</h4>
                  <p className={`font-body font-light ${i === 1 || i === 2 ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: WHAT'S HAPPENING (Featured Events Grid) */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-[1440px]">
          <div className="mb-16 max-w-2xl" data-reveal="up">
            <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-[4rem] tracking-tight text-slate-900 dark:text-white uppercase leading-[0.9] mb-6">
              WHAT'S <br />HAPPENING.
            </h2>
            <p className="font-body text-lg text-slate-600 dark:text-slate-400 font-light">
              Explore workshops, hackathons, seminars, contests and community events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4" data-reveal="stagger-children">
            {/* ONE LARGE EVENT */}
            <div className="md:col-span-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group overflow-hidden relative min-h-[400px] flex flex-col justify-end p-8">
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 group-hover:scale-105 transition-transform duration-700" alt="Event" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              <div className="relative z-10 text-white">
                <div className="flex gap-3 mb-4">
                  <span className="font-mono text-[10px] font-bold tracking-widest bg-brand-primary px-2 py-1 uppercase">Workshop</span>
                  <span className="font-mono text-[10px] font-bold tracking-widest border border-white/30 px-2 py-1 uppercase">Live</span>
                </div>
                <h3 className="font-heading font-bold text-3xl md:text-4xl uppercase tracking-tight mb-2">AI Masterclass</h3>
                <div className="font-mono text-xs tracking-widest text-slate-300 mb-6 uppercase">OCT 20 • AUDITORIUM 1</div>
                <button className="font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:text-brand-primary transition-colors">
                  View Event <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* TWO SMALL EVENTS */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between group hover:border-brand-primary/50 transition-colors">
                <div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-brand-secondary uppercase block mb-3">Seminar</span>
                  <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-slate-900 dark:text-white mb-2">Future of Web3</h3>
                  <div className="font-mono text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase">NOV 05 • ONLINE</div>
                </div>
                <ArrowRight size={20} className="text-slate-300 dark:text-slate-700 group-hover:text-brand-primary transition-colors mt-4" />
              </div>
              <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between group hover:border-brand-primary/50 transition-colors">
                <div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-brand-secondary uppercase block mb-3">Meetup</span>
                  <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-slate-900 dark:text-white mb-2">Founder Connect</h3>
                  <div className="font-mono text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase">NOV 12 • LAB 32</div>
                </div>
                <ArrowRight size={20} className="text-slate-300 dark:text-slate-700 group-hover:text-brand-primary transition-colors mt-4" />
              </div>
            </div>

            {/* ONE HORIZONTAL EVENT */}
            <div className="md:col-span-12 bg-slate-900 text-white border border-slate-800 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                <div className="text-5xl font-mono font-black text-slate-600 dark:text-slate-500">04</div>
                <div>
                  <span className="font-mono text-[10px] font-bold tracking-widest text-brand-accent uppercase block mb-2">Contest</span>
                  <h3 className="font-heading font-bold text-2xl uppercase tracking-tight mb-2">Code Sprint Winter</h3>
                  <div className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">DEC 01 • CAMPUS WIDE</div>
                </div>
              </div>
              <button className="px-6 py-3 border border-white/20 font-mono text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-2 whitespace-nowrap">
                Register <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: IDEAS SECTION */}
      <IdeasFlow />

      {/* SECTION 8: PEOPLE SECTION */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-[1440px]">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6" data-reveal="up">
            <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-[4rem] tracking-tight text-slate-900 dark:text-white uppercase leading-[0.9]">
              THE PEOPLE <br />BEHIND THE IDEAS.
            </h2>
            <Link to="/members" className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-brand-primary hover:text-slate-900 dark:hover:text-white transition-colors uppercase group">
              Meet The Team
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* LARGE PORTRAIT */}
            <div className="md:col-span-6 bg-slate-200 dark:bg-slate-800 relative h-[400px] md:h-[600px] group overflow-hidden">
              <img src="/sujal.webp" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 transition-transform duration-700" alt="President" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase block mb-2 text-brand-secondary">President</span>
                <h4 className="font-heading font-bold text-3xl uppercase tracking-tight mb-1">Sujal Bhatia</h4>
                <p className="font-mono text-[10px] tracking-widest uppercase text-slate-300">MCA (2nd Year)</p>
              </div>
            </div>

            {/* SMALLER PORTRAITS */}
            <div className="md:col-span-6 grid grid-cols-2 gap-4">
              {[
                { name: 'Ritu Raj', role: 'Vice President', course: 'BCA', img: '/ritu.png' },
                { name: 'Ansh Bhatia', role: 'Secretary', course: 'MCA (2nd Year)', img: '/ansh.webp' },
                { name: 'Meharjot Singh', role: 'Head Coordinator', course: 'MCA (2nd Year)', img: '/Meharjot.jpg' },
                { name: 'Saksham Shakya', role: 'Technical Head', course: 'MCA (2nd Year)', img: 'https://i.ibb.co/PnsgYc4/saksham.png' }
              ].map((person, i) => (
                <div key={i} className="relative h-[190px] md:h-auto bg-slate-200 dark:bg-slate-800 group overflow-hidden">
                  <img src={person.img} className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 transition-transform duration-700" alt={person.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="font-mono text-[9px] font-bold tracking-widest uppercase block mb-1 text-brand-primary">{person.role}</span>
                    <h4 className="font-heading font-bold text-lg uppercase tracking-tight mb-0.5">{person.name}</h4>
                    <p className="font-mono text-[9px] tracking-widest uppercase text-slate-400">{person.course}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: GALLERY SECTION */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-[1440px]">
          <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-[4rem] tracking-tight text-slate-900 dark:text-white uppercase leading-[0.9] mb-16 text-center" data-reveal="up">
            MOMENTS <br />IN MOTION.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-[200px] md:auto-rows-[300px]" data-reveal="stagger-children">
            {/* Large */}
            <div className="col-span-2 row-span-2 bg-slate-100 dark:bg-slate-900 relative group overflow-hidden cursor-crosshair">
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:mix-blend-normal transition-all duration-700" alt="Gallery" />
            </div>
            {/* Small */}
            <div className="col-span-1 row-span-1 bg-slate-100 dark:bg-slate-900 relative group overflow-hidden cursor-crosshair">
              <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:mix-blend-normal transition-all duration-700" alt="Gallery" />
            </div>
            {/* Tall */}
            <div className="col-span-1 row-span-2 bg-slate-100 dark:bg-slate-900 relative group overflow-hidden cursor-crosshair">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:mix-blend-normal transition-all duration-700" alt="Gallery" />
            </div>
            {/* Small */}
            <div className="col-span-1 row-span-1 bg-slate-100 dark:bg-slate-900 relative group overflow-hidden cursor-crosshair">
              <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:mix-blend-normal transition-all duration-700" alt="Gallery" />
            </div>
            {/* Horizontal */}
            <div className="col-span-2 row-span-1 bg-slate-100 dark:bg-slate-900 relative group overflow-hidden cursor-crosshair">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:mix-blend-normal transition-all duration-700" alt="Gallery" />
            </div>
            {/* Small */}
            <div className="col-span-2 row-span-1 bg-slate-100 dark:bg-slate-900 relative group overflow-hidden cursor-crosshair">
              <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-105 group-hover:mix-blend-normal transition-all duration-700" alt="Gallery" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: BRAND STATEMENT & FINAL CTA */}
      <section className="py-32 md:py-48 bg-slate-950 text-white border-t border-slate-900 relative overflow-hidden">
        {/* Abstract Geometry Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/20 via-slate-950 to-slate-950"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand-secondary/10 via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 max-w-[1440px] relative z-10 flex flex-col items-center text-center">
          <div className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-brand-secondary mb-8 flex items-center gap-4">
            <span className="w-12 h-px bg-brand-secondary/50"></span>
            Join The Mission
            <span className="w-12 h-px bg-brand-secondary/50"></span>
          </div>

          <h2 className="font-heading font-black text-[clamp(3.5rem,12vw,8rem)] tracking-tighter uppercase leading-[0.85] mb-12 flex flex-col items-center">
            <span>THINK.</span>
            <span>BUILD.</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary">CHANGE</span>
            <span>THE FUTURE.</span>
          </h2>

          <p className="font-body text-xl md:text-2xl text-slate-400 font-light max-w-2xl mb-16">
            Join a community of students building what comes next.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/join-us" className="bg-white text-slate-950 px-10 py-5 rounded-full font-mono text-sm font-bold tracking-widest uppercase hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center gap-2 group">
              Join Brainstorm
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/ideas" className="bg-transparent border border-white/20 text-white px-10 py-5 rounded-full font-mono text-sm font-bold tracking-widest uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group">
              Submit An Idea
              <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
