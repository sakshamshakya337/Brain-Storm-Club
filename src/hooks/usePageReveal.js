import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function usePageReveal(externalRef = null, dependencies = []) {
  const internalRef = useRef(null);
  const container = externalRef || internalRef;

  useGSAP(() => {
    // If we are waiting for data (e.g. loading === true), don't run the animation yet.
    if (dependencies.includes(true)) return;
    
    // Basic failsafe: if user prefers reduced motion, skip complex animations
    let mm = gsap.matchMedia();
    
    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Just immediately show everything
      gsap.set(".reveal-navbar, .reveal-eyebrow, .reveal-heading-line, .reveal-text, .reveal-cta, .reveal-image, .reveal-meta", {
        opacity: 1,
        y: 0,
        scale: 1,
        clipPath: "none",
        clearProps: "all"
      });
      return; // Stop execution
    });

    // Standard Animation (runs if no reduced motion)
    mm.add("(prefers-reduced-motion: no-preference)", (context) => {
      // 1. Initial State Setup
      // We set elements hidden/transformed before they enter
      
      const isMobile = context.conditions ? context.conditions.isMobile : window.innerWidth < 768;
      const yDistance = isMobile ? 20 : 40;

      // Navbar setup (if targeted)
      gsap.set(".reveal-navbar", { opacity: 0, y: -20 });
      
      // Eyebrow
      gsap.set(".reveal-eyebrow", { opacity: 0, y: yDistance / 2 });
      
      // Heading lines (needs overflow-hidden wrapper on parent in DOM)
      gsap.set(".reveal-heading-line", { y: "110%", opacity: 0, rotateZ: isMobile ? 0 : 2 });
      
      // Text & CTAs
      gsap.set(".reveal-text, .reveal-cta", { opacity: 0, y: yDistance });
      
      // Image container (mask reveal)
      gsap.set(".reveal-image", { opacity: 0, scale: 1.05, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" });
      
      // Small details
      gsap.set(".reveal-meta", { opacity: 0 });

      // 2. Master Timeline
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.to(".reveal-navbar", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      }, 0.05)
      
      .to(".reveal-eyebrow", {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }, 0.15)
      
      .to(".reveal-heading-line", {
        y: "0%",
        opacity: 1,
        rotateZ: 0,
        duration: 1.2,
        stagger: 0.1,
      }, 0.25)
      
      .to(".reveal-text", {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }, 0.55)
      
      .to(".reveal-cta", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
      }, 0.70)
      
      .to(".reveal-image", {
        opacity: 1,
        scale: 1,
        clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
        duration: 1.5,
        ease: "power3.inOut"
      }, 0.65)
      
      .to(".reveal-meta", {
        opacity: 1,
        duration: 0.8,
        stagger: 0.1
      }, 1.00);
      
      // Clear props at the end so it doesn't interfere with responsive resizing
      tl.eventCallback("onComplete", () => {
        gsap.set(".reveal-navbar, .reveal-eyebrow, .reveal-heading-line, .reveal-text, .reveal-cta, .reveal-image, .reveal-meta", {
          clearProps: "transform,clipPath"
        });
      });
      
    });

  }, { scope: container, dependencies });

  return container;
}
