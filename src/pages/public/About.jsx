import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Code, Trophy, Users, Zap, Briefcase, Globe, Sparkles, MessageSquare, Terminal } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../../components/layout/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const heroRef = useRef(null);
  const processRef = useRef(null);

  useEffect(() => {
    // Basic Hero Reveal
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }
      );
    }

    // Process nodes stagger on scroll
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
  }, []);

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
    <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body">
      
      {/* SECTION 01: HERO */}
      <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center pt-32 pb-20 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px', color: 'currentColor' }} />
        
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT */}
            <div ref={heroRef} className="col-span-1 lg:col-span-6 flex flex-col items-start">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary mb-8 border border-brand-primary/30 px-3 py-1.5 rounded-sm bg-brand-primary/5">
                BRAINSTORM / ABOUT
              </div>
              
              <h1 className="font-heading font-black text-[3.5rem] sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[0.9] tracking-tighter text-slate-900 dark:text-white mb-8 uppercase">
                WE THINK. <br/>
                WE BUILD. <br/>
                WE CONNECT. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">WE CREATE IMPACT.</span>
              </h1>
              
              <p className="font-body text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl font-light leading-relaxed">
                Brainstorm is a student-led technology community at Lovely Professional University where curious minds come together to learn, build, experiment and turn ideas into action.
              </p>
            </div>
            
            {/* RIGHT */}
            <div className="col-span-1 lg:col-span-6 relative h-[400px] lg:h-[600px] w-full flex items-center justify-center p-6 lg:p-12">
              <div className="absolute inset-0 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 overflow-hidden rounded-sm flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
                  alt="Team Collaboration" 
                  className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 dark:opacity-30" 
                />
                <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-8 w-full max-w-md p-8">
                  {['01 / THINK', '02 / BUILD', '03 / CONNECT', '04 / IMPACT'].map((label, idx) => (
                    <div key={idx} className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 font-mono text-[10px] tracking-widest font-bold uppercase text-slate-900 dark:text-white flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* SECTION 02: MISSION */}
      <section className="py-24 md:py-32 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT */}
            <div className="col-span-1 lg:col-span-5 order-2 lg:order-1">
              <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                01 / MISSION
              </div>
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-slate-900 dark:text-white mb-8">
                WHY WE EXIST
              </h2>
              <p className="font-body text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light mb-6">
                The LPU SCA Brainstorm Club is a hub of innovation where students from diverse technical backgrounds come together to ideate, create, and build. 
              </p>
              <p className="font-body text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                We believe that structured creativity can solve complex problems. By providing the environment, resources, and network, we transform raw ambition into deployed reality.
              </p>
            </div>
            {/* RIGHT */}
            <div className="col-span-1 lg:col-span-7 order-1 lg:order-2 flex justify-end">
              <div className="relative w-full lg:w-[80%] aspect-square max-h-[500px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
                <span className="font-heading font-black text-[12rem] md:text-[16rem] text-slate-200 dark:text-slate-800 opacity-30 select-none tracking-tighter">01</span>
                <span className="absolute font-mono text-2xl md:text-3xl font-bold tracking-[0.5em] text-brand-primary uppercase">THINK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: ACTIVITIES */}
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                02 / ACTIVITIES
              </div>
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-slate-900 dark:text-white">
                WHAT WE DO
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 flex flex-col group hover:border-brand-primary dark:hover:border-brand-primary hover:bg-slate-50 dark:hover:bg-bg-elevated transition-colors shadow-sm dark:shadow-none rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[100px] -z-0"></div>
                <div className="relative z-10 flex justify-between items-start mb-12">
                  <span className="font-mono text-xs font-bold tracking-widest text-brand-primary">{activity.id}</span>
                  <activity.icon size={24} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
                </div>
                <h3 className="relative z-10 font-heading font-bold text-2xl uppercase tracking-tight text-slate-900 dark:text-white mb-4">{activity.title}</h3>
                <p className="relative z-10 font-body text-slate-600 dark:text-slate-400 font-light text-sm leading-relaxed mb-8 flex-grow">{activity.desc}</p>
                <div className="relative z-10 border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 group-hover:text-brand-primary transition-colors">
                  EXPLORE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 04: PROCESS */}
      <section className="py-24 md:py-32 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] text-center flex flex-col items-center">
          <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-6 flex items-center justify-center gap-3">
            03 / PROCESS
          </div>
          <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-slate-900 dark:text-white mb-20">
            FROM IDEA TO IMPACT
          </h2>
          
          {/* Interactive Pipeline */}
          <div ref={processRef} className="flex flex-col md:flex-row items-center md:items-stretch justify-center w-full max-w-5xl gap-0">
            {processSteps.map((step, idx) => (
              <React.Fragment key={step.label}>
                {/* Node */}
                <div className="process-node flex flex-col items-center gap-4 relative z-10 shrink-0 min-w-[80px]">
                  <div className="w-16 h-16 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-all hover:border-brand-primary hover:bg-brand-primary hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] group">
                    <step.icon size={20} className="text-slate-400 dark:text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-slate-500 dark:text-slate-400 font-bold">{step.label}</div>
                </div>
                
                {/* Line (Don't render after last node) */}
                {idx < processSteps.length - 1 && (
                  <div className="process-line relative w-1 h-12 md:w-full md:h-1 bg-slate-200 dark:bg-slate-800 my-2 md:my-0 md:mt-8 shrink-0 md:min-w-[40px] origin-top md:origin-left overflow-hidden">
                    <div className="absolute inset-0 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 05: COMMUNITY */}
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                04 / COMMUNITY
              </div>
              <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-slate-900 dark:text-white mb-4">
                A COMMUNITY OF BUILDERS
              </h2>
              <p className="font-body text-slate-600 dark:text-slate-400 font-light max-w-xl">
                Students, creators, developers, designers and problem-solvers coming together to learn and build.
              </p>
            </div>
            <Link to="/members" className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-3 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-2 group whitespace-nowrap">
              MEET THE COMMUNITY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Placeholder Profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop', name: 'Member Profile', role: 'Engineering', interest: 'AI / ML' },
              { img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop', name: 'Member Profile', role: 'Design', interest: 'UI / UX' },
              { img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop', name: 'Member Profile', role: 'Product', interest: 'Strategy' },
              { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop', name: 'Member Profile', role: 'Development', interest: 'Web3' },
            ].map((member, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 group hover:border-brand-primary transition-colors">
                <div className="aspect-[3/4] w-full relative overflow-hidden mb-4 bg-slate-100 dark:bg-slate-950">
                  <img src={member.img} alt="Member placeholder" className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:mix-blend-normal group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                </div>
                <h4 className="font-heading font-bold uppercase text-lg text-slate-900 dark:text-white mb-1">{member.name}</h4>
                <div className="flex justify-between items-center font-mono text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  <span>{member.role}</span>
                  <span className="text-brand-primary">{member.interest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 06: STATISTICS STRIP */}
      <section className="py-12 bg-slate-900 dark:bg-[#050914] text-white border-b border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-slate-800">
            {[
              { label: 'APPROACH', value: 'STUDENT-LED' },
              { label: 'FOCUS', value: 'TECH-DRIVEN' },
              { label: 'OUTPUT', value: 'PROJECT-BASED' },
              { label: 'CULTURE', value: 'COMMUNITY-FIRST' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center px-4">
                <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tighter text-white mb-2">{stat.value}</span>
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-secondary">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 07: VALUES */}
      <section className="py-24 md:py-32 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
            <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-6 flex items-center justify-center gap-3">
              05 / PRINCIPLES
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-slate-900 dark:text-white">
              WHAT WE BELIEVE
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <div key={value.num} className="flex gap-6 md:gap-8 items-start group p-6 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-sm">
                <span className="font-heading font-black text-5xl md:text-6xl text-slate-200 dark:text-slate-800 group-hover:text-brand-primary transition-colors">{value.num}</span>
                <div>
                  <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-slate-900 dark:text-white mb-3">{value.title}</h3>
                  <p className="font-body text-slate-600 dark:text-slate-400 font-light leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 08: VISUAL STATEMENT */}
      <section className="py-32 md:py-48 bg-slate-50 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:100px_100px] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 px-6">
          <h2 className="font-heading font-black text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] leading-[0.9] tracking-tighter uppercase text-slate-900 dark:text-white mix-blend-normal">
            IDEAS ARE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary">ONLY THE</span> <br/>
            BEGINNING.
          </h2>
        </div>
      </section>

      {/* SECTION 09: CTA */}
      <section className="py-24 md:py-32 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] text-center flex flex-col items-center relative z-10">
          <h2 className="font-heading font-black text-4xl md:text-6xl uppercase tracking-tight text-slate-900 dark:text-white mb-6">
            HAVE AN IDEA?
          </h2>
          <p className="font-body text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mb-12">
            Bring your idea to Brainstorm and turn it into something real. Join the community, find a team, and start building.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link to="/join-us" className="bg-slate-900 dark:bg-brand-primary text-white px-10 py-5 rounded-full font-mono text-sm font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-xl shadow-brand-primary/20">
              Submit An Idea
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/events" className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-10 py-5 rounded-full font-mono text-sm font-bold tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 group">
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
