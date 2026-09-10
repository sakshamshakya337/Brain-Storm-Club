import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TechnicalLabel from '../common/TechnicalLabel';
import IndexMarker from '../common/IndexMarker';
import AnimatedLine from '../common/AnimatedLine';

gsap.registerPlugin(ScrollTrigger);

export default function LayeredHero() {
  const containerRef = useRef(null);
  const heroImageRef = useRef(null);
  const textContentRef = useRef(null);

  useGSAP(() => {
    // Entrance Animation - Text NEVER disappears
    const tl = gsap.timeline();

    tl.fromTo(textContentRef.current, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", clearProps: "all" },
      0.5
    );

    tl.fromTo(heroImageRef.current,
      { scale: 1.05, opacity: 0, filter: "blur(10px)" },
      { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.5, ease: "power3.out" },
      0.2
    );

    // Subtle Scroll Parallax
    gsap.to(heroImageRef.current, {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-[90svh] w-full flex items-center pt-24 pb-12 overflow-hidden bg-slate-50 border-b border-slate-200">
      {/* Background & Grid (Layer 1 & 2) */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      
      {/* Ambient Shapes (Layer 3) */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200 to-transparent opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-100 to-transparent opacity-50 blur-3xl pointer-events-none" />

      <div className="w-full mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT: Typography & Content (Layer 10) */}
          <div ref={textContentRef} className="col-span-1 lg:col-span-6 flex flex-col items-start relative z-10">
            <TechnicalLabel text="LPU SCA / BRAIN-STORM" />
            
            <h1 className="font-heading font-black text-[clamp(3.5rem,10vw,7rem)] leading-[0.85] tracking-tighter text-slate-900 mb-8 uppercase">
              IDEAS<br/>
              THAT MOVE<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-900">FORWARD.</span>
            </h1>
            
            <p className="font-body text-lg md:text-xl text-slate-600 font-light max-w-xl mb-12 leading-relaxed">
              Join a community of students building what comes next. Connect, ideate, and construct the future at Brainstorm Club.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/ideas" className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 font-mono text-xs font-bold tracking-widest uppercase hover:bg-indigo-600 transition-colors">
                SUBMIT AN IDEA
                <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link to="/events" className="group flex items-center justify-center gap-2 bg-transparent border border-slate-300 text-slate-900 px-8 py-4 font-mono text-xs font-bold tracking-widest uppercase hover:border-slate-900 transition-colors">
                EXPLORE EVENTS
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          {/* RIGHT: Image Composition (Layers 4-9) */}
          <div className="col-span-1 lg:col-span-6 relative w-full h-[500px] lg:h-[700px] flex items-center justify-center">
            {/* Image Container */}
            <div className="relative w-[90%] h-[90%] border border-slate-200 p-4 bg-white shadow-xl shadow-slate-200/50">
              {/* Technical Accents */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-600" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-slate-900" />
              
              <div className="absolute top-8 -left-12 rotate-[-90deg] origin-bottom-left z-20">
                 <IndexMarker index="01" label="BUILD" />
              </div>

              {/* The Real Image */}
              <div ref={heroImageRef} className="relative w-full h-full overflow-hidden bg-slate-100">
                <img src="/build.jpg" alt="Brainstorm Session" className="absolute w-full h-full object-cover mix-blend-multiply opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                
                {/* Image Overlay Label */}
                <div className="absolute bottom-6 left-6 text-white flex flex-col gap-2">
                  <AnimatedLine width="w-8" color="bg-white" />
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase">BRAINSTORM SESSION</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
