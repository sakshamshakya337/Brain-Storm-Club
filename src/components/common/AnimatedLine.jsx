import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';

export default function AnimatedLine({ width = "w-12", color = "bg-slate-900", className = "" }) {
  const lineRef = useRef(null);

  useEffect(() => {
    anime({
      targets: lineRef.current,
      scaleX: [0, 1],
      transformOrigin: '0% 50%',
      easing: 'easeInOutExpo',
      duration: 1000,
      delay: 500
    });
  }, []);

  return (
    <div className={`h-px ${width} ${color} ${className}`} ref={lineRef}></div>
  );
}
