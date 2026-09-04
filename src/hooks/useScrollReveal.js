import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useScrollReveal(externalRef = null, dependencies = []) {
  const internalRef = useRef(null);
  const container = externalRef || internalRef;

  useGSAP(() => {
    if (dependencies.includes(true)) return;

    let mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Setup elements with data-reveal attributes to be visible immediately
      const elements = gsap.utils.toArray('[data-reveal]');
      gsap.set(elements, { opacity: 1, y: 0, x: 0, scale: 1, clearProps: "all" });
      return;
    });

    mm.add("(prefers-reduced-motion: no-preference)", (context) => {
      const isMobile = context.conditions ? context.conditions.isMobile : window.innerWidth < 768;
      
      // Select all elements that want a scroll reveal
      const revealElements = gsap.utils.toArray('[data-reveal]');

      revealElements.forEach((el) => {
        const type = el.dataset.reveal || 'up'; // default to 'up'
        
        // Default initial states based on type
        if (type === 'up') {
          gsap.set(el, { opacity: 0, y: isMobile ? 30 : 50 });
        } else if (type === 'fade') {
          gsap.set(el, { opacity: 0 });
        } else if (type === 'scale') {
          gsap.set(el, { opacity: 0, scale: 0.95 });
        } else if (type === 'stagger-children') {
          gsap.set(el.children, { opacity: 0, y: isMobile ? 20 : 30 });
        } else if (type === 'left') {
          gsap.set(el, { opacity: 0, x: isMobile ? -20 : -50 });
        } else if (type === 'right') {
          gsap.set(el, { opacity: 0, x: isMobile ? 20 : 50 });
        }

        // Set up ScrollTrigger
        if (type === 'stagger-children') {
          gsap.to(el.children, {
            scrollTrigger: {
              trigger: el,
              start: "top 85%", // trigger when top of element hits 85% of viewport
              once: true,
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "transform"
          });
        } else {
          gsap.to(el, {
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "transform"
          });
        }
      });
    });

  }, { scope: container, dependencies });

  return container;
}
