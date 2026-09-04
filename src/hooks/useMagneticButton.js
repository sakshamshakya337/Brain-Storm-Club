import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useMagneticButton(intensity = 0.5) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Respect reduced motion and mobile devices (no hover)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isTouchDevice) return;

    // Using gsap.quickTo for performance
    const xTo = gsap.quickTo(button, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    const yTo = gsap.quickTo(button, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

    const handleMouseMove = (e) => {
      const rect = button.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * intensity;
      const y = (e.clientY - (rect.top + rect.height / 2)) * intensity;
      xTo(x);
      yTo(y);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return buttonRef;
}
