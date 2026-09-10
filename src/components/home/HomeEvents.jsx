import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import EventEditorialCard from './EventEditorialCard';

gsap.registerPlugin(ScrollTrigger);

export default function HomeEvents({ featuredEvents, isEventsLoading }) {
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

    // Event Cards Stagger
    const eventCards = gsap.utils.toArray('.event-card-animate', section);
    if (eventCards.length > 0) {
      gsap.fromTo(eventCards,
        { y: 40, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", clearProps: "all",
          scrollTrigger: {
            trigger: eventCards[0],
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }
    
    // Spark line connection
    gsap.fromTo('.events-spark-connector',
      { scaleY: 0 },
      {
        scaleY: 1, duration: 1.5, ease: "power2.out", transformOrigin: "top",
        scrollTrigger: {
          trigger: '.events-spark-connector',
          start: "top 70%",
          scrub: true
        }
      }
    );

  }, { scope: containerRef, dependencies: [isEventsLoading, featuredEvents] });

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-[var(--paper-dim)] border-b border-[var(--border)] relative">
      <div className="absolute top-0 left-1/2 w-[1px] h-32 bg-gradient-to-b from-[var(--spark)] to-transparent events-spark-connector z-0" />
      
      <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
        <div className="mb-16">
          <h2 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-[var(--ink)] leading-[0.9]">
            WHAT'S HAPPENING.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!isEventsLoading && featuredEvents.length > 0 ? (
            featuredEvents.map((event, index) => (
              <EventEditorialCard key={event._id || event.id || index} event={event} index={index + 1} />
            ))
          ) : isEventsLoading ? (
            // Loading State Skeleton Grid
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full h-[400px] bg-[var(--paper)] animate-pulse border border-[var(--border)]"></div>
            ))
          ) : (
            // Empty State
            <div className="col-span-full py-12 border-t border-[var(--border)] text-[var(--ink-soft)] font-mono text-sm uppercase tracking-widest text-center">
              NO UPCOMING EVENTS<br/>CHECK BACK SOON.
            </div>
          )}
        </div>
        
        <div className="border-t border-[var(--border)] pt-8 mt-12 flex justify-end">
          <Link to="/events" className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-[var(--ink)] hover:text-[var(--circuit)] transition-colors uppercase group">
            VIEW ALL EVENTS
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
