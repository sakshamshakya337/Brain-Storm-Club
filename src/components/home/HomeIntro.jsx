import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import AnimatedLine from '../common/AnimatedLine';

gsap.registerPlugin(ScrollTrigger);

export default function HomeIntro() {
  const containerRef = useRef(null);
  const capabilitiesRef = useRef(null);

  useGSAP(() => {
    // Reveal main section container
    gsap.utils.toArray('.intro-reveal-section').forEach(section => {
      gsap.fromTo(section, 
        { y: 50, autoAlpha: 0 },
        { 
          y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", clearProps: "all",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    // Capability Cards Stagger
    if (capabilitiesRef.current) {
      gsap.fromTo('.capability-item', 
        { y: 30, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", clearProps: "all",
          scrollTrigger: {
            trigger: capabilitiesRef.current,
            start: "top 75%"
          }
        }
      );
    }
    
    // Connect spark line from hero to intro
    gsap.fromTo('.intro-spark-connector',
      { scaleY: 0 },
      {
        scaleY: 1, duration: 1.5, ease: "power2.out", transformOrigin: "top",
        scrollTrigger: {
          trigger: '.intro-spark-connector',
          start: "top 60%",
          scrub: true
        }
      }
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* 02 INTRODUCTION */}
      <section className="intro-reveal-section py-24 md:py-32 bg-[var(--paper)] border-b border-[var(--border)] relative">
        {/* Spark line connector from hero */}
        <div className="absolute top-0 left-1/2 w-[1px] h-32 bg-gradient-to-b from-[var(--spark)] to-transparent intro-spark-connector z-0" />
        
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
              <h2 className="font-heading font-black text-4xl md:text-6xl tracking-tight uppercase leading-[0.9] text-[var(--ink)]">
                WHERE IDEAS <br/>
                <span className="text-[var(--ink-soft)]">BECOME REAL.</span>
              </h2>
            </div>
            <div className="md:col-span-5 flex flex-col items-start">
              <AnimatedLine width="w-16" className="mb-6" color="bg-[var(--circuit)]" />
              <p className="text-lg text-[var(--ink-soft)] font-light leading-relaxed">
                Brain-Storm is more than a club. It is an ecosystem for creators, developers, and thinkers to collaborate on projects that push boundaries. We bridge the gap between imagination and execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 WHAT WE DO */}
      <section ref={capabilitiesRef} className="intro-reveal-section py-24 md:py-32 bg-[var(--paper-dim)] border-b border-[var(--border)] relative overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, var(--ink) 1px, transparent 1px), linear-gradient(to bottom, var(--ink) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div className="mb-16">
            <h2 className="font-heading font-black text-3xl md:text-5xl uppercase tracking-tight text-[var(--ink)]">Our Capabilities</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8">
            {[
              { id: '01', title: 'IDEATION', desc: 'Transforming abstract concepts into structured, viable project architectures.' },
              { id: '02', title: 'INNOVATION', desc: 'Pushing the boundaries of conventional thinking to solve modern problems.' },
              { id: '03', title: 'DEVELOPMENT', desc: 'Building scalable, robust, and elegant software solutions.' },
              { id: '04', title: 'COLLABORATION', desc: 'Fostering a network of multidisciplinary talent working in sync.' },
              { id: '05', title: 'EVENTS', desc: 'Hosting hackathons, seminars, and workshops to elevate technical skills.' },
              { id: '06', title: 'LEARNING', desc: 'Continuous mentorship and skill-building in bleeding-edge technologies.' }
            ].map((cap) => (
              <motion.div 
                key={cap.id}
                whileHover="hover"
                className="capability-item group border-t border-[var(--border)] pt-6 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <motion.span 
                    variants={{ hover: { color: 'var(--circuit)' } }}
                    className="font-mono text-xs font-bold text-[var(--ink-soft)] transition-colors"
                  >
                    {cap.id}
                  </motion.span>
                  <motion.div variants={{ hover: { x: 5, y: -5, opacity: 1 } }} initial={{ opacity: 0 }} className="text-[var(--circuit)]">
                    <ArrowUpRight size={16} />
                  </motion.div>
                </div>
                <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-[var(--ink)] mb-3">{cap.title}</h3>
                <p className="font-body text-[var(--ink-soft)] font-light">{cap.desc}</p>
                <motion.div 
                  variants={{ hover: { scaleX: 1 } }} 
                  initial={{ scaleX: 0 }} 
                  className="h-[2px] w-full bg-[var(--circuit)] mt-6 origin-left transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
