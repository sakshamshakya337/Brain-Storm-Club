import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';

export default function SparkNetwork() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Anime.js ambient micro-animations
    const sparks = containerRef.current.querySelectorAll('.spark-particle');
    const nodes = containerRef.current.querySelectorAll('.network-node');

    // Make sparks travel along paths (simulated via simple translations for performance, 
    // or opacity pulses if path tracking is too heavy)
    anime({
      targets: sparks,
      opacity: [0.1, 0.8, 0.1],
      scale: [0.8, 1.5, 0.8],
      duration: () => anime.random(2000, 4000),
      delay: () => anime.random(0, 2000),
      loop: true,
      easing: 'easeInOutSine'
    });

    // Slow pulse for nodes
    anime({
      targets: nodes,
      opacity: [0.3, 0.7, 0.3],
      r: [3, 4, 3], // SVG radius
      duration: () => anime.random(3000, 6000),
      delay: () => anime.random(0, 3000),
      loop: true,
      easing: 'easeInOutQuad'
    });

    // Orbital ring slow rotation
    anime({
      targets: '.orbital-ring',
      rotateZ: 360,
      duration: 60000,
      loop: true,
      easing: 'linear',
      transformOrigin: '50% 50%'
    });
    
    // Reverse ring
    anime({
      targets: '.orbital-ring-reverse',
      rotateZ: -360,
      duration: 80000,
      loop: true,
      easing: 'linear',
      transformOrigin: '50% 50%'
    });

  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full absolute inset-0 opacity-40" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        
        {/* Layer 2 - Orbital Rings */}
        <g className="orbital-ring" stroke="#2E4BB0" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.4">
          <circle cx="720" cy="450" r="400" />
        </g>
        <g className="orbital-ring-reverse" stroke="#E4E2D9" strokeWidth="1" opacity="0.6">
          <circle cx="720" cy="450" r="550" />
        </g>

        {/* Layer 3 - Network Lines */}
        <path d="M-100 200 Q 300 150 720 450 T 1540 700" stroke="#E4E2D9" strokeWidth="1" fill="none" opacity="0.7"/>
        <path d="M-100 700 Q 400 800 720 450 T 1540 200" stroke="#2E4BB0" strokeWidth="0.5" fill="none" opacity="0.3"/>
        <path d="M 200 -100 Q 300 300 720 450 T 1200 1000" stroke="#FBE4AE" strokeWidth="1" fill="none" opacity="0.5"/>
        
        {/* Network Nodes */}
        <circle cx="300" cy="225" r="3" fill="#2E4BB0" className="network-node" />
        <circle cx="1140" cy="575" r="3" fill="#F2A70B" className="network-node" />
        <circle cx="450" cy="650" r="3" fill="#55575F" className="network-node" />
        <circle cx="950" cy="275" r="3" fill="#2E4BB0" className="network-node" />
        <circle cx="720" cy="450" r="4" fill="#F2A70B" className="network-node" opacity="0.8" />

        {/* Spark Particles (Ambient) */}
        <circle cx="350" cy="250" r="2" fill="#F2A70B" className="spark-particle" />
        <circle cx="1040" cy="625" r="2" fill="#F2A70B" className="spark-particle" />
        <circle cx="500" cy="600" r="2" fill="#2E4BB0" className="spark-particle" />
        <circle cx="900" cy="325" r="2" fill="#FBE4AE" className="spark-particle" />
        
      </svg>
    </div>
  );
}
