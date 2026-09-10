import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Code, Trophy, Users, Zap, Briefcase, Globe, Sparkles, MessageSquare, Terminal } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {
  const containerRef = useRef(null);
  const processRef = useRef(null);
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
        .from('[data-about-hero-line]', { opacity: 0, y: 30, duration: .65, stagger: .12, clearProps: 'all' }, .35)
        .from('[data-about-hero-copy]', { opacity: 0, y: 12, duration: .45, stagger: .08, clearProps: 'all' }, .8) : null;
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

  useGSAP(() => {
    if (processRef.current) {
      const nodes = processRef.current.querySelectorAll('.process-node');
      const lines = processRef.current.querySelectorAll('.process-line');
      
      gsap.fromTo(nodes,
        { scale: 0.8, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.2, 
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: processRef.current,
            start: "top 70%",
          }
        }
      );
      
      gsap.fromTo(lines,
        { scaleX: 0, scaleY: 0, opacity: 0 },
        { 
          scaleX: 1, 
          scaleY: 1, 
          opacity: 1, 
          duration: 0.4, 
          stagger: 0.2, 
          delay: 0.3,
          scrollTrigger: {
            trigger: processRef.current,
            start: "top 70%",
          }
        }
      );
    }
  }, { scope: processRef });

  const activities = [
    { id: '01', title: 'HACKATHONS', icon: Code, desc: 'Intense coding marathons focused on rapid prototyping and competitive problem-solving.' },
    { id: '02', title: 'WORKSHOPS', icon: Terminal, desc: 'Skill-building sessions led by industry experts and senior students on cutting-edge tech.' },
    { id: '03', title: 'SEMINARS', icon: Users, desc: 'Insightful talks exploring the future of decentralized systems, AI, and engineering.' },
    { id: '04', title: 'CONTESTS', icon: Trophy, desc: 'Competitive challenges pushing students to optimize algorithms and build under pressure.' },
    { id: '05', title: 'COMMUNITY EVENTS', icon: Globe, desc: 'Networking, casual meetups, and open forums to connect builders with founders.' },
    { id: '06', title: 'PROJECT BUILDING', icon: Zap, desc: 'Turning raw ideas into fully functional startups and robust open-source contributions.' },
  ];

  const values = [
    { num: '01', title: 'CURIOSITY', desc: 'Always ask why. The best innovations start with a simple question and the drive to uncover the mechanics beneath.' },
    { num: '02', title: 'CREATION', desc: 'Ideas matter when they become something real. We bias heavily toward execution and shipping working products.' },
    { num: '03', title: 'COLLABORATION', desc: 'Great ideas grow through people. We cross-pollinate skills between design, engineering, and business.' },
    { num: '04', title: 'IMPACT', desc: 'Build things that matter. We focus our energy on technology that solves actual problems in our community.' },
  ];

  const processSteps = [
    { label: 'IDEA', icon: LightbulbIcon },
    { label: 'EXPLORE', icon: CompassIcon },
    { label: 'BUILD', icon: WrenchIcon },
    { label: 'SHARE', icon: MegaphoneIcon },
    { label: 'IMPACT', icon: TargetIcon },
  ];

  return (
    <div ref={containerRef} className="w-full bg-paper min-h-screen text-ink font-body">
      
      {/* SECTION 01: HERO */}
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
          <div className="col-span-1 lg:col-span-6 flex flex-col items-start">
            <p data-about-hero-copy className="font-mono text-[10px] font-bold tracking-[0.35em] uppercase text-circuit mb-6">
              LPU SCA / Brainstorm Club
            </p>
            
            <h1 className="font-heading font-black uppercase tracking-tight leading-[0.88] text-ink" style={{ fontSize: 'clamp(3.5rem,10vw,7.5rem)' }}>
              <span data-about-hero-line className="block">WE THINK.</span>
              <span data-about-hero-line className="block">WE BUILD.</span>
              <span data-about-hero-line className="block">WE CONNECT.</span>
              <span data-about-hero-line className="block text-transparent bg-clip-text bg-gradient-to-r from-circuit to-spark">WE CREATE IMPACT.</span>
            </h1>
            
            <p data-about-hero-copy className="mt-8 max-w-xl font-body text-lg text-ink-soft leading-relaxed">
              Brainstorm is a student-led technology community at Lovely Professional University where curious minds come together to learn, build, experiment and turn ideas into action.
            </p>
          </div>
          
          {/* RIGHT */}
          <div data-about-hero-copy className="col-span-1 lg:col-span-6 relative h-[400px] lg:h-[520px] w-full flex items-center justify-center p-6 lg:p-12">
            <div className="absolute inset-0 border border-border bg-paper-dim overflow-hidden rounded-sm flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
                alt="Team Collaboration" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40" 
              />
              <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-8 w-full max-w-md p-8">
                {['01 / THINK', '02 / BUILD', '03 / CONNECT', '04 / IMPACT'].map((label, idx) => (
                  <div key={idx} className="bg-paper/80 backdrop-blur-md border border-border p-4 font-mono text-[10px] tracking-widest font-bold uppercase text-ink flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-circuit animate-pulse"></span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* SECTION 02: MISSION */}
      <section className="py-24 md:py-32 bg-paper border-b border-border px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl" data-reveal="up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT */}
            <div className="col-span-1 lg:col-span-5 order-2 lg:order-1">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-border"></span>
                01 / MISSION
              </div>
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-ink mb-8">
                WHY WE EXIST
              </h2>
              <p className="font-body text-lg text-ink-soft leading-relaxed font-light mb-6">
                The LPU SCA Brainstorm Club is a hub of innovation where students from diverse technical backgrounds come together to ideate, create, and build. 
              </p>
              <p className="font-body text-lg text-ink-soft leading-relaxed font-light">
                We believe that structured creativity can solve complex problems. By providing the environment, resources, and network, we transform raw ambition into deployed reality.
              </p>
            </div>
            {/* RIGHT */}
            <div className="col-span-1 lg:col-span-7 order-1 lg:order-2 flex justify-end">
              <div className="relative w-full lg:w-[80%] aspect-square max-h-[500px] border border-border bg-paper-dim flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
                <span className="font-heading font-black text-[12rem] md:text-[16rem] text-border opacity-60 select-none tracking-tighter">01</span>
                <span className="absolute font-mono text-2xl md:text-3xl font-bold tracking-[0.5em] text-circuit uppercase">THINK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: ACTIVITIES */}
      <section className="py-24 md:py-32 bg-paper-dim border-b border-border px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl" data-reveal="stagger-children">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-border"></span>
                02 / ACTIVITIES
              </div>
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-ink">
                WHAT WE DO
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-paper border border-border p-8 flex flex-col group hover:border-circuit hover:bg-paper-dim transition-colors shadow-sys rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-circuit/5 rounded-bl-[100px] -z-0"></div>
                <div className="relative z-10 flex justify-between items-start mb-12">
                  <span className="font-mono text-xs font-bold tracking-widest text-circuit">{activity.id}</span>
                  <activity.icon size={24} className="text-ink-soft group-hover:text-circuit transition-colors" />
                </div>
                <h3 className="relative z-10 font-heading font-bold text-2xl uppercase tracking-tight text-ink mb-4">{activity.title}</h3>
                <p className="relative z-10 font-body text-ink-soft font-light text-sm leading-relaxed mb-8 flex-grow">{activity.desc}</p>
                <div className="relative z-10 border-t border-border pt-4 flex items-center justify-between font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft group-hover:text-circuit transition-colors">
                  EXPLORE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 04: PROCESS */}
      <section className="py-24 md:py-32 bg-paper border-b border-border overflow-hidden px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl text-center flex flex-col items-center">
          <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft mb-6 flex items-center justify-center gap-3">
            03 / PROCESS
          </div>
          <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-ink mb-20">
            FROM IDEA TO IMPACT
          </h2>
          
          {/* Interactive Pipeline */}
          <div ref={processRef} className="flex flex-col md:flex-row items-center md:items-stretch justify-center w-full max-w-5xl gap-0">
            {processSteps.map((step, idx) => (
              <React.Fragment key={step.label}>
                {/* Node */}
                <div className="process-node flex flex-col items-center gap-4 relative z-10 shrink-0 min-w-[80px]">
                  <div className="w-16 h-16 rounded-full border border-border bg-paper-dim flex items-center justify-center transition-all hover:border-circuit hover:bg-circuit group">
                    <step.icon size={20} className="text-ink-soft group-hover:text-paper transition-colors" />
                  </div>
                  <div className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-ink-soft font-bold">{step.label}</div>
                </div>
                
                {/* Line (Don't render after last node) */}
                {idx < processSteps.length - 1 && (
                  <div className="process-line relative w-1 h-12 md:w-full md:h-1 bg-border my-2 md:my-0 md:mt-8 shrink-0 md:min-w-[40px] origin-top md:origin-left overflow-hidden">
                    <div className="absolute inset-0 bg-circuit opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 05: COMMUNITY */}
      <section className="py-24 md:py-32 bg-paper-dim border-b border-border px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl" data-reveal="up">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-border"></span>
                04 / COMMUNITY
              </div>
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-ink mb-4">
                A COMMUNITY OF BUILDERS
              </h2>
              <p className="font-body text-ink-soft font-light max-w-xl">
                Students, creators, developers, designers and problem-solvers coming together to learn and build.
              </p>
            </div>
            <Link to="/members" className="bg-transparent border border-border text-ink px-6 py-3 font-mono text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-paper transition-colors flex items-center gap-2 group whitespace-nowrap">
              MEET THE COMMUNITY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Placeholder Profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { img: '/satyam.jpeg', name: 'Satyam Shakti', role: 'Social Media', interest: 'Social Media' },
              { img: '/ashvi.jpeg', name: 'Ashvi Gupta', role: 'Research', interest: 'Patent' },
              { img: '/sujal.png', name: 'Sujal Bhatia', role: 'President', interest: 'Revenue Generation' },
              { img: '/HarshSharma.jpeg', name: 'Harsh Sharma', role: 'Development', interest: 'Freelancing' },
            ].map((member, idx) => (
              <div key={idx} className="bg-paper border border-border p-4 group hover:border-circuit transition-colors">
                <div className="aspect-[3/4] w-full relative overflow-hidden mb-4 bg-paper-dim">
                  <img src={member.img} alt="Member placeholder" className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:mix-blend-normal group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60"></div>
                </div>
                <h4 className="font-heading font-bold uppercase text-lg text-ink mb-1">{member.name}</h4>
                <div className="flex justify-between items-center font-mono text-[10px] uppercase font-bold tracking-widest text-ink-soft">
                  <span>{member.role}</span>
                  <span className="text-circuit">{member.interest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 06: STATISTICS STRIP */}
      <section className="py-12 bg-ink text-paper border-b border-border px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-border" data-reveal="stagger-children">
            {[
              { label: 'APPROACH', value: 'STUDENT-LED' },
              { label: 'FOCUS', value: 'TECH-DRIVEN' },
              { label: 'OUTPUT', value: 'PROJECT-BASED' },
              { label: 'CULTURE', value: 'COMMUNITY-FIRST' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center px-4">
                <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tighter text-paper mb-2">{stat.value}</span>
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-spark">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 07: VALUES */}
      <section className="py-24 md:py-32 bg-paper border-b border-border px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl" data-reveal="stagger-children">
          <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
            <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft mb-6 flex items-center justify-center gap-3">
              05 / PRINCIPLES
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-ink">
              WHAT WE BELIEVE
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <div key={value.num} className="flex gap-6 md:gap-8 items-start group p-6 border border-transparent hover:border-border hover:bg-paper-dim transition-colors rounded-sm">
                <span className="font-heading font-black text-5xl md:text-6xl text-border group-hover:text-circuit transition-colors">{value.num}</span>
                <div>
                  <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-ink mb-3">{value.title}</h3>
                  <p className="font-body text-ink-soft font-light leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 08: VISUAL STATEMENT */}
      <section className="py-32 md:py-48 bg-paper-dim border-b border-border relative overflow-hidden flex items-center justify-center text-center px-6 md:px-12 lg:px-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:100px_100px] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-circuit/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 px-6 mx-auto max-w-7xl" data-reveal="up">
          <h2 className="font-heading font-black text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] leading-[0.9] tracking-tighter uppercase text-ink mix-blend-normal">
            IDEAS ARE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-spark to-circuit">ONLY THE</span> <br/>
            BEGINNING.
          </h2>
        </div>
      </section>

      {/* SECTION 09: CTA */}
      <section className="py-24 md:py-32 bg-paper px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl text-center flex flex-col items-center relative z-10" data-reveal="up">
          <h2 className="font-heading font-black text-4xl md:text-6xl uppercase tracking-tight text-ink mb-6">
            HAVE AN IDEA?
          </h2>
          <p className="font-body text-lg md:text-xl text-ink-soft font-light max-w-2xl mb-12">
            Bring your idea to Brainstorm and turn it into something real. Join the community, find a team, and start building.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link to="/ideas" className="rounded-[10px] bg-spark px-8 py-4 font-medium text-ink transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group shadow-xl shadow-spark/20">
              Submit An Idea
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/events" className="rounded-[10px] border border-circuit bg-paper px-8 py-4 font-medium text-ink transition-colors hover:bg-paper-dim flex items-center justify-center gap-2 group">
              Explore Events
              <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Icon Helpers for Process Section
function LightbulbIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
}
function CompassIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
}
function WrenchIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
}
function MegaphoneIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
}
function TargetIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
