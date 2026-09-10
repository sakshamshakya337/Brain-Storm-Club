import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function HeroDecorations() {
  const containerRef = useRef(null);

  useEffect(() => {
    // PHASE 02: Grid Reveals, Image reveals & PHASE 08: Labels appear
    const masterTl = anime.timeline({
      easing: 'easeOutExpo',
    });

    masterTl
      .add({
        targets: '.hero-grid-line-x',
        scaleX: [0, 1],
        opacity: [0, 0.4],
        duration: 2000,
        delay: anime.stagger(150, { start: 400 })
      })
      .add({
        targets: '.hero-grid-line-y',
        scaleY: [0, 1],
        opacity: [0, 0.4],
        duration: 2000,
        delay: anime.stagger(150)
      }, '-=1500')
      .add({
        targets: '.hero-label',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1200,
        delay: anime.stagger(200)
      }, 2500); // Wait for 3D scene to start assembling

    // Ambient idle motion for labels
    anime({
      targets: '.hero-label',
      translateY: '-=6',
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      duration: 3500,
      delay: anime.stagger(600)
    });

    return () => {
      anime.remove('.hero-grid-line-x');
      anime.remove('.hero-grid-line-y');
      anime.remove('.hero-label');
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      
      {/* LAYER 02: Technical Grid */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-multiply"
        style={{ WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)', maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)' }}
      >
        {/* Horizontal Lines */}
        <div className="absolute top-[20%] left-0 w-full h-[1px] bg-slate-300 hero-grid-line-x origin-left opacity-0"></div>
        <div className="absolute top-[40%] left-0 w-full h-[1px] bg-slate-300 hero-grid-line-x origin-left opacity-0"></div>
        <div className="absolute top-[60%] left-0 w-full h-[1px] bg-slate-300 hero-grid-line-x origin-left opacity-0"></div>
        <div className="absolute top-[80%] left-0 w-full h-[1px] bg-slate-300 hero-grid-line-x origin-left opacity-0"></div>
        
        {/* Vertical Lines */}
        <div className="absolute top-0 left-[15%] w-[1px] h-full bg-slate-300 hero-grid-line-y origin-top opacity-0 hidden lg:block"></div>
        <div className="absolute top-0 left-[35%] w-[1px] h-full bg-slate-300 hero-grid-line-y origin-top opacity-0 hidden lg:block"></div>
        <div className="absolute top-0 left-[65%] w-[1px] h-full bg-slate-300 hero-grid-line-y origin-top opacity-0 hidden lg:block"></div>
        <div className="absolute top-0 left-[85%] w-[1px] h-full bg-slate-300 hero-grid-line-y origin-top opacity-0 hidden lg:block"></div>
      </div>

      {/* LAYER 03: Existing Image Composition Removed (Handled by Home.jsx) */}
      {/* LAYER 08: Technical Labels */}
      <div className="absolute top-[25%] right-[15%] hero-label opacity-0 flex items-center gap-2 hidden lg:flex">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold text-slate-500">IDEA / 01</span>
      </div>
      
      <div className="absolute bottom-[20%] right-[25%] hero-label opacity-0 flex flex-col gap-1 hidden md:flex">
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold text-slate-400">INNOVATION</span>
        <span className="font-mono text-[10px] tracking-widest text-slate-300">SYS.ONLINE</span>
      </div>

      <div className="absolute top-[60%] left-[8%] hero-label opacity-0 flex flex-col gap-1">
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold text-slate-500">BUILD / 03</span>
        <div className="w-8 h-[1px] bg-slate-300 mt-1"></div>
      </div>
      
      <div className="absolute top-[10%] left-[40%] hero-label opacity-0 flex flex-col items-center gap-2 hidden lg:flex">
        <div className="w-[1px] h-8 bg-slate-300"></div>
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold text-slate-400">CORE</span>
      </div>

    </div>
  );
}
