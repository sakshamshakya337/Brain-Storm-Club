import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MemberFeaturedCard from './MemberFeaturedCard';
import MemberCompactCard from './MemberCompactCard';

gsap.registerPlugin(ScrollTrigger);

export default function HomeMembers({ isMembersLoading, liveMembers, president, supportingSlots }) {
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
    gsap.fromTo('.members-spark-connector',
      { scaleY: 0 },
      {
        scaleY: 1, duration: 1.5, ease: "power2.out", transformOrigin: "top",
        scrollTrigger: {
          trigger: '.members-spark-connector',
          start: "top 70%",
          scrub: true
        }
      }
    );

  }, { scope: containerRef, dependencies: [isMembersLoading, liveMembers] });

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-[var(--paper)] border-b border-[var(--border)] relative">
      <div className="absolute top-0 left-1/2 w-[1px] h-32 bg-gradient-to-b from-[var(--spark)] to-transparent members-spark-connector z-0" />
      
      <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-[var(--ink)] leading-[0.9]">
            THE PEOPLE <br />BEHIND THE IDEAS.
          </h2>
          <Link to="/members" className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-[var(--circuit)] hover:text-[var(--ink)] transition-colors uppercase group">
            Meet The Team
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {!isMembersLoading && liveMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <MemberFeaturedCard member={president} />
            
            {supportingSlots.length > 0 && (
              <div className="md:col-span-6 grid grid-cols-2 gap-4">
                {supportingSlots.map((slot, i) => (
                  <MemberCompactCard key={slot.member._id || i} member={slot.member} roleLabel={slot.roleLabel} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
