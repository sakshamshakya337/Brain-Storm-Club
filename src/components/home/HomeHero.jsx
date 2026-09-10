import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import TechnicalLabel from '../common/TechnicalLabel';
import AnimatedLine from '../common/AnimatedLine';
import SparkNetwork from './SparkNetwork';
import HeroScene3D from './HeroScene3D';

export default function HomeHero() {
  const containerRef = useRef(null);
  
  // Refs for animation targets
  const bgGridRef = useRef(null);
  const sparkNetworkRef = useRef(null);
  const labelRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const accentLineRef = useRef(null);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const scene3DRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Reset initial states for safety (in case clearProps un-hides them prematurely before animation starts)
    gsap.set([
      bgGridRef.current, sparkNetworkRef.current, labelRef.current, 
      line1Ref.current, line2Ref.current, line3Ref.current, 
      accentLineRef.current, descRef.current, ctaRef.current, scene3DRef.current
    ], { opacity: 0, visibility: 'hidden' });

    // 250ms: background grid
    tl.to(bgGridRef.current, { autoAlpha: 1, duration: 1, ease: 'power2.out' }, 0.25);
    
    // 400ms: spark/node base visibility (handled by SparkNetwork SVG internals via anime, but container appears here)
    tl.to(sparkNetworkRef.current, { autoAlpha: 1, duration: 1.5, ease: 'power2.out' }, 0.4);

    // 550ms: eyebrow/label
    tl.fromTo(labelRef.current, 
      { y: 20, autoAlpha: 0 }, 
      { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', clearProps: 'transform' }, 
      0.55
    );

    // 700ms, 850ms, 950ms: headline lines
    tl.fromTo(line1Ref.current,
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', clearProps: 'transform' },
      0.70
    );
    tl.fromTo(line2Ref.current,
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', clearProps: 'transform' },
      0.85
    );
    tl.fromTo(line3Ref.current,
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', clearProps: 'transform' },
      0.95
    );

    // 1000ms: accent line
    tl.fromTo(accentLineRef.current,
      { scaleX: 0, autoAlpha: 0 },
      { scaleX: 1, autoAlpha: 1, duration: 0.8, ease: 'power3.out', transformOrigin: 'left', clearProps: 'transform' },
      1.00
    );

    // 1150ms: description
    tl.fromTo(descRef.current,
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', clearProps: 'transform' },
      1.15
    );

    // 1300ms: CTA
    tl.fromTo(ctaRef.current,
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', clearProps: 'transform' },
      1.30
    );

    // 1450ms: 3D Scene
    tl.fromTo(scene3DRef.current,
      { scale: 0.9, autoAlpha: 0, filter: 'blur(10px)' },
      { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out', clearProps: 'transform,filter' },
      1.45
    );

    // Parallax effect on scroll for the entire hero to connect with next sections
    gsap.to(containerRef.current, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-[100svh] w-full flex items-center pt-24 pb-12 overflow-hidden bg-[var(--paper)] border-b border-[var(--border)]">
      
      {/* Layer 1: Fine Grid */}
      <div 
        ref={bgGridRef} 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'linear-gradient(to right, var(--ink) 1px, transparent 1px), linear-gradient(to bottom, var(--ink) 1px, transparent 1px)', backgroundSize: '64px 64px' }} 
      />
      
      {/* Layer 2 & 3: Spark Network & Orbital Lines */}
      <div ref={sparkNetworkRef} className="absolute inset-0 z-[1]">
        <SparkNetwork />
      </div>

      {/* Layer 4-6: 3D Central Object */}
      <div ref={scene3DRef} className="absolute top-0 right-0 w-full lg:w-3/5 h-full z-[2]">
        <HeroScene3D />
      </div>

      {/* Layer 7: Foreground / UI Context */}
      <div className="w-full mx-auto px-6 lg:px-12 max-w-[1440px] relative z-[10] pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center h-full">
          
          {/* Layer 8 & 9: Typography & CTA */}
          <div className="col-span-1 lg:col-span-6 flex flex-col items-start relative z-10 pointer-events-auto mt-20 lg:mt-0">
            
            <div ref={labelRef}>
              <TechnicalLabel text="LPU SCA / BRAIN-STORM" />
            </div>
            
            <h1 className="font-heading font-black text-[clamp(4rem,12vw,8rem)] leading-[0.85] tracking-tighter text-[var(--ink)] mb-8 uppercase flex flex-col mt-6">
              <div className="overflow-hidden"><span ref={line1Ref} className="block">IDEAS</span></div>
              <div className="overflow-hidden"><span ref={line2Ref} className="block">THAT MOVE</span></div>
              <div className="overflow-hidden">
                <span ref={line3Ref} className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--circuit)] to-[var(--ink)]">
                  FORWARD.
                </span>
              </div>
            </h1>
            
            <div ref={accentLineRef} className="w-16 h-1 bg-[var(--spark)] mb-8" />
            
            <p ref={descRef} className="font-body text-lg md:text-xl text-[var(--ink-soft)] font-light max-w-xl mb-12 leading-relaxed">
              Join a community of students building what comes next. Connect, ideate, and construct the future at Brainstorm Club.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6">
              <motion.div whileTap={{ scale: 0.98 }} transition={{ type: "tween", duration: 0.1 }}>
                <Link to="/ideas" className="group flex items-center justify-center gap-2 bg-[var(--ink)] text-white px-8 py-4 font-mono text-xs font-bold tracking-widest uppercase hover:bg-[var(--circuit)] transition-colors shadow-lg rounded-[10px]">
                  SUBMIT AN IDEA
                  <motion.div 
                    variants={{ hover: { x: 4, y: -4 } }} 
                    transition={{ type: "tween", duration: 0.2 }}
                    className="origin-bottom-left group-hover:text-[var(--spark)]"
                  >
                    <ArrowUpRight size={14} />
                  </motion.div>
                </Link>
              </motion.div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
