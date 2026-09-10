import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function CustomCursor() {
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if the device has a fine pointer (mouse) and doesn't prefer reduced motion
    const pointerFine = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (pointerFine && !reducedMotion) {
      setIsSupported(true);
      document.documentElement.classList.add('custom-cursor-active');
    }
    
    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, []);

  useGSAP(() => {
    if (!isSupported || !cursorDotRef.current || !cursorRingRef.current) return;

    // Use quickTo for highly optimized mouse tracking
    const xDotTo = gsap.quickTo(cursorDotRef.current, "x", { duration: 0.1, ease: "power3.out" });
    const yDotTo = gsap.quickTo(cursorDotRef.current, "y", { duration: 0.1, ease: "power3.out" });
    
    const xRingTo = gsap.quickTo(cursorRingRef.current, "x", { duration: 0.5, ease: "power3.out" });
    const yRingTo = gsap.quickTo(cursorRingRef.current, "y", { duration: 0.5, ease: "power3.out" });

    let isHoveringInteractive = false;

    const onPointerMove = (e) => {
      const { clientX, clientY } = e;
      
      xDotTo(clientX);
      yDotTo(clientY);
      xRingTo(clientX);
      yRingTo(clientY);

      // If we weren't visible, smoothly fade in
      if (!isVisible) {
        setIsVisible(true);
      }

      // Check for interactive targets under cursor
      const target = e.target;
      const isInteractiveTarget = target.closest('a, button, [role="button"], input, textarea, select, .interactive-cursor');
      
      if (isInteractiveTarget && !isHoveringInteractive) {
        isHoveringInteractive = true;
        setIsInteractive(true);
      } else if (!isInteractiveTarget && isHoveringInteractive) {
        isHoveringInteractive = false;
        setIsInteractive(false);
      }
    };

    const onPointerEnter = () => setIsVisible(true);
    const onPointerLeave = () => {
      setIsVisible(false);
      setIsInteractive(false);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerenter', onPointerEnter);
    document.addEventListener('pointerleave', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerenter', onPointerEnter);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [isSupported, isVisible]);

  // GSAP animation for hover states
  useGSAP(() => {
    if (!isSupported || !cursorRingRef.current || !cursorDotRef.current) return;

    if (isInteractive) {
      gsap.to(cursorRingRef.current, { scale: 1.5, opacity: 0.5, duration: 0.3, ease: "power2.out" });
      gsap.to(cursorDotRef.current, { scale: 0.5, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(cursorRingRef.current, { scale: 1, opacity: 0.3, duration: 0.3, ease: "power2.out" });
      gsap.to(cursorDotRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
    }
  }, [isInteractive, isSupported]);

  if (!isSupported) return null;

  return (
    <>
      <style>{`
        html.custom-cursor-active * { cursor: none !important; }
      `}</style>
      
      <div 
        className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9999]"
      >
        {/* Outer Ring */}
        <div 
          ref={cursorRingRef}
          className="absolute top-0 left-0 w-8 h-8 -ml-4 -mt-4 border border-indigo-600 rounded-full opacity-30 pointer-events-none mix-blend-difference"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
        
        {/* Inner Dot */}
        <div 
          ref={cursorDotRef}
          className="absolute top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-indigo-500 rounded-full pointer-events-none mix-blend-difference"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      </div>
    </>
  );
}
