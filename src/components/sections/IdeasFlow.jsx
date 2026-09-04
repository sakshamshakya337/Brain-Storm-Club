import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, MessageSquare, Users, Zap, Calendar, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function IdeasFlow() {
  const sectionRef = useRef(null);
  
  // Node Refs
  const ideaNodeRef = useRef(null);
  const reviewNodeRef = useRef(null);
  const buildNodeRef = useRef(null);
  const eventNodeRef = useRef(null);
  
  // Icon Refs
  const ideaIconRef = useRef(null);
  const reviewIconRef = useRef(null);
  const buildIconRef = useRef(null);
  const eventIconRef = useRef(null);

  // Label Refs
  const ideaLabelRef = useRef(null);
  const reviewLabelRef = useRef(null);
  const buildLabelRef = useRef(null);
  const eventLabelRef = useRef(null);
  
  // Line Refs
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  
  // Particle Refs
  const particle1Ref = useRef(null);
  const particle2Ref = useRef(null);
  const particle3Ref = useRef(null);

  // CTA Ref
  const ctaRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Create a master timeline tied to scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 40%",
          end: "bottom 60%",
          scrub: 1, // Smooth scrubbing
        }
      });

      // We will define the animation sequence linearly.
      // GSAP automatically handles reversing on scroll up with scrub: true.

      // Initial States (set via CSS/Tailwind where possible, but GSAP enforces starting values)
      
      // 1. IDEA ACTIVATES
      tl.to(ideaNodeRef.current, {
        backgroundColor: "var(--brand-primary)",
        borderColor: "var(--brand-primary)",
        boxShadow: "0 0 20px rgba(79, 70, 229, 0.4)", // Indigo glow
        scale: 1,
        duration: 1
      }, 0)
      .to(ideaIconRef.current, { color: "#ffffff", duration: 1 }, 0)
      .to(ideaLabelRef.current, { color: "var(--text-primary)", opacity: 1, duration: 1 }, 0);

      // 2. PROGRESS TRAVELS: IDEA -> REVIEW
      // We animate the height for mobile (vertical line) or width for desktop (horizontal line)
      // To handle both responsively in one GSAP timeline without complex matchMedia, 
      // we animate a CSS variable or use scale. 
      // Using scaleX/scaleY with proper transform origins is safest.
      // But since mobile is vertical and desktop is horizontal, we can animate both scaleX and scaleY.
      // The CSS classes will ensure the line is either horizontal or vertical, and scale expands it appropriately.
      
      tl.to(particle1Ref.current, { opacity: 1, duration: 0.1 }, 1)
        .to(particle1Ref.current, { left: "100%", top: "100%", duration: 2, ease: "none" }, 1)
        .to(line1Ref.current, { scaleX: 1, scaleY: 1, duration: 2, ease: "none" }, 1)
        .to(particle1Ref.current, { opacity: 0, duration: 0.1 }, 3);

      // 3. REVIEW ACTIVATES
      tl.to(reviewNodeRef.current, {
        backgroundColor: "var(--brand-primary)",
        borderColor: "var(--brand-primary)",
        boxShadow: "0 0 20px rgba(79, 70, 229, 0.4)",
        scale: 1,
        duration: 1
      }, 3)
      .to(reviewIconRef.current, { color: "#ffffff", duration: 1 }, 3)
      .to(reviewLabelRef.current, { color: "var(--text-primary)", opacity: 1, duration: 1 }, 3);

      // 4. PROGRESS TRAVELS: REVIEW -> BUILD
      tl.to(particle2Ref.current, { opacity: 1, duration: 0.1 }, 4)
        .to(particle2Ref.current, { left: "100%", top: "100%", duration: 2, ease: "none" }, 4)
        .to(line2Ref.current, { scaleX: 1, scaleY: 1, duration: 2, ease: "none" }, 4)
        .to(particle2Ref.current, { opacity: 0, duration: 0.1 }, 6);

      // 5. BUILD ACTIVATES
      tl.to(buildNodeRef.current, {
        backgroundColor: "var(--brand-primary)",
        borderColor: "var(--brand-primary)",
        boxShadow: "0 0 20px rgba(79, 70, 229, 0.4)",
        scale: 1,
        duration: 1
      }, 6)
      .to(buildIconRef.current, { color: "#ffffff", duration: 1 }, 6)
      .to(buildLabelRef.current, { color: "var(--text-primary)", opacity: 1, duration: 1 }, 6);

      // 6. PROGRESS TRAVELS: BUILD -> EVENT
      tl.to(particle3Ref.current, { opacity: 1, duration: 0.1 }, 7)
        .to(particle3Ref.current, { left: "100%", top: "100%", duration: 2, ease: "none" }, 7)
        .to(line3Ref.current, { scaleX: 1, scaleY: 1, duration: 2, ease: "none" }, 7)
        .to(particle3Ref.current, { opacity: 0, duration: 0.1 }, 9);

      // 7. EVENT ACTIVATES (Final State)
      tl.to(eventNodeRef.current, {
        backgroundColor: "var(--brand-primary)",
        borderColor: "var(--brand-primary)",
        boxShadow: "0 0 30px rgba(79, 70, 229, 0.6)",
        scale: 1.1,
        duration: 1
      }, 9)
      .to(eventIconRef.current, { color: "#ffffff", duration: 1 }, 9)
      .to(eventLabelRef.current, { color: "var(--brand-primary)", opacity: 1, fontWeight: "bold", duration: 1 }, 9);

      // 8. CTA ENHANCEMENT
      tl.to(ctaRef.current, {
        boxShadow: "0 0 40px rgba(79, 70, 229, 0.3)",
        borderColor: "var(--brand-primary)",
        duration: 1
      }, 9);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-40 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative overflow-hidden">
      {/* Subtle Background Atmosphere */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
        <Lightbulb size={600} />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-6 md:px-12 max-w-[1440px] relative z-10 text-center flex flex-col items-center">
        
        {/* Heading */}
        <h2 className="font-heading font-black text-5xl md:text-7xl lg:text-[6rem] tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.9] mb-8">
          YOUR IDEA <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary relative inline-block">
            COULD BECOME
            <span className="absolute -bottom-1 left-0 w-full h-[4px] bg-gradient-to-r from-brand-secondary to-brand-primary opacity-50"></span>
          </span> <br/>
          OUR NEXT EVENT.
        </h2>
        
        <p className="font-body text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mb-24">
          Share an idea for a workshop, hackathon, seminar or community activity. We provide the resources and team to make it happen.
        </p>
        
        {/* Interactive Process Diagram */}
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-0 mb-24 w-full justify-center">
          
          {/* STEP 1: IDEA */}
          <div className="flex flex-col items-center gap-4 relative z-10 shrink-0 min-w-[80px]">
            <div 
              ref={ideaNodeRef}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors scale-90"
            >
              <MessageSquare ref={ideaIconRef} size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
            <div ref={ideaLabelRef} className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-slate-500 dark:text-slate-400 font-medium">IDEA</div>
          </div>
          
          {/* LINE 1 */}
          <div className="relative w-1 h-12 md:w-24 lg:w-32 md:h-1 bg-slate-200 dark:bg-slate-800 my-2 md:my-0 md:mt-10 shrink-0">
            <div 
              ref={line1Ref} 
              className="absolute top-0 left-0 w-full h-full bg-brand-primary origin-top md:origin-left scale-y-0 md:scale-y-100 scale-x-100 md:scale-x-0"
            />
            {/* Traveling Particle */}
            <div 
              ref={particle1Ref}
              className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-[0_0_10px_#4F46E5] -translate-x-1/2 -translate-y-1/2 md:translate-y-[calc(-50%+2px)] opacity-0 z-20"
            />
          </div>

          {/* STEP 2: REVIEW */}
          <div className="flex flex-col items-center gap-4 relative z-10 shrink-0 min-w-[80px]">
            <div 
              ref={reviewNodeRef}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors scale-90"
            >
              <Users ref={reviewIconRef} size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
            <div ref={reviewLabelRef} className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-slate-500 dark:text-slate-400 font-medium">REVIEW</div>
          </div>
          
          {/* LINE 2 */}
          <div className="relative w-1 h-12 md:w-24 lg:w-32 md:h-1 bg-slate-200 dark:bg-slate-800 my-2 md:my-0 md:mt-10 shrink-0">
            <div 
              ref={line2Ref} 
              className="absolute top-0 left-0 w-full h-full bg-brand-primary origin-top md:origin-left scale-y-0 md:scale-y-100 scale-x-100 md:scale-x-0"
            />
            <div 
              ref={particle2Ref}
              className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-[0_0_10px_#4F46E5] -translate-x-1/2 -translate-y-1/2 md:translate-y-[calc(-50%+2px)] opacity-0 z-20"
            />
          </div>

          {/* STEP 3: BUILD */}
          <div className="flex flex-col items-center gap-4 relative z-10 shrink-0 min-w-[80px]">
            <div 
              ref={buildNodeRef}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors scale-90"
            >
              <Zap ref={buildIconRef} size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
            <div ref={buildLabelRef} className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-slate-500 dark:text-slate-400 font-medium">BUILD</div>
          </div>
          
          {/* LINE 3 */}
          <div className="relative w-1 h-12 md:w-24 lg:w-32 md:h-1 bg-slate-200 dark:bg-slate-800 my-2 md:my-0 md:mt-10 shrink-0">
            <div 
              ref={line3Ref} 
              className="absolute top-0 left-0 w-full h-full bg-brand-primary origin-top md:origin-left scale-y-0 md:scale-y-100 scale-x-100 md:scale-x-0"
            />
            <div 
              ref={particle3Ref}
              className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-[0_0_10px_#4F46E5] -translate-x-1/2 -translate-y-1/2 md:translate-y-[calc(-50%+2px)] opacity-0 z-20"
            />
          </div>

          {/* STEP 4: EVENT */}
          <div className="flex flex-col items-center gap-4 relative z-10 shrink-0 min-w-[80px]">
            <div 
              ref={eventNodeRef}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors scale-90"
            >
              <Calendar ref={eventIconRef} size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
            <div ref={eventLabelRef} className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-slate-500 dark:text-slate-400 font-medium">EVENT</div>
          </div>
          
        </div>
        
        {/* CTA */}
        <Link 
          to="/ideas" 
          ref={ctaRef}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-full font-heading text-sm font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-xl border border-transparent"
        >
          Submit An Idea
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
