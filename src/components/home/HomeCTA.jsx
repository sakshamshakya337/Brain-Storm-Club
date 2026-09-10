import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PremiumCTA from './PremiumCTA';

gsap.registerPlugin(ScrollTrigger);

export default function HomeCTA() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const section = containerRef.current;
    
    // Reveal entire section
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
    
    // Spark line connection
    gsap.fromTo('.cta-spark-connector',
      { scaleY: 0 },
      {
        scaleY: 1, duration: 1.5, ease: "power2.out", transformOrigin: "top",
        scrollTrigger: {
          trigger: '.cta-spark-connector',
          start: "top 60%",
          scrub: true
        }
      }
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-32 md:py-48 bg-[var(--paper)] flex items-center justify-center text-center relative">
      <div className="absolute top-0 left-1/2 w-[1px] h-48 bg-gradient-to-b from-[var(--circuit)] via-[var(--spark)] to-transparent cta-spark-connector z-0" />
      
      <div className="container mx-auto px-6 max-w-4xl flex flex-col items-center relative z-10">
        <div className="w-1.5 h-1.5 bg-[var(--spark)] rounded-full mb-8 animate-pulse" />
        <h2 className="font-heading font-black text-[clamp(2.5rem,6vw,5rem)] tracking-tight uppercase leading-[0.9] text-[var(--ink)] mb-6">
          HAVE AN IDEA?
        </h2>
        <p className="text-xl text-[var(--ink-soft)] font-light mb-12 max-w-lg">
          Don't let it stay an idea. Connect with the community, form a team, and build something extraordinary.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <PremiumCTA 
            to="/ideas" 
            text="Submit An Idea" 
            supportingText="Project Pipeline" 
            variant="primary"
          />
          <PremiumCTA 
            to="/join-us" 
            text="Join The Community" 
            supportingText="Become a Member" 
            variant="secondary"
          />
        </div>
      </div>
    </section>
  );
}
