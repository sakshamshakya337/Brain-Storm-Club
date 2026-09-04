import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Preloader({ onComplete }) {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const ringRef = useRef(null);
  const textRef = useRef(null);
  const progressLineRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }
    });

    // Initial state
    gsap.set(logoRef.current, { scale: 0.8, opacity: 0 });
    gsap.set(ringRef.current, { rotation: 0, opacity: 0 });
    gsap.set(textRef.current, { y: 10, opacity: 0 });
    gsap.set(progressLineRef.current, { scaleX: 0, transformOrigin: "left center" });

    // 1. Logo appears and gently scales up
    tl.to(logoRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    })
    
    // 2. Ring appears and rotates slowly
    .to(ringRef.current, {
      opacity: 0.5,
      duration: 0.4
    }, "-=0.4")
    .to(ringRef.current, {
      rotation: 180,
      duration: 1.5,
      ease: "power1.inOut"
    }, "-=0.8")
    
    // 3. Technical text appears
    .to(textRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    }, "-=1.2")
    
    // 4. Progress line completes
    .to(progressLineRef.current, {
      scaleX: 1,
      duration: 1.2,
      ease: "power2.inOut"
    }, "-=1.2")
    
    // 5. Outro transition
    .to([logoRef.current, ringRef.current, textRef.current, progressLineRef.current], {
      opacity: 0,
      scale: 1.1,
      duration: 0.4,
      ease: "power2.in",
      stagger: 0.05
    })
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut"
    });

  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-200"
    >
      <div className="relative flex items-center justify-center mb-8">
        {/* Orbital Ring */}
        <div 
          ref={ringRef}
          className="absolute w-40 h-40 border border-slate-200 dark:border-slate-800 rounded-full border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent"
        />
        
        {/* Logo */}
        <img 
          ref={logoRef}
          src="/logo.png" 
          alt="Brainstorm" 
          className="w-24 h-24 object-contain relative z-10 filter drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] dark:brightness-110"
        />
      </div>

      {/* Technical Text */}
      <div 
        ref={textRef}
        className="font-mono text-[10px] tracking-[0.3em] font-bold text-slate-500 dark:text-slate-400 uppercase mb-4"
      >
        INITIALIZING / BRAINSTORM
      </div>

      {/* Progress Line */}
      <div className="w-48 h-[1px] bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div 
          ref={progressLineRef}
          className="w-full h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
        />
      </div>
    </div>
  );
}
