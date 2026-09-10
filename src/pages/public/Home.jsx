import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';

gsap.registerPlugin(ScrollTrigger);

const events = [
  { id: 'ideation-workshop', date: '15 Jan 2027', venue: 'Main Hall', title: 'Ideation workshop', description: 'A focused room for turning loose observations into practical event concepts.' },
  { id: 'tech-talk-ai', date: '05 Feb 2027', venue: 'Auditorium 1', title: 'Tech talk: AI', description: 'A conversation about the tools, people, and questions shaping applied AI.' },
  { id: 'spring-hackathon', date: '20 Mar 2027', venue: 'Campus Center', title: 'Spring hackathon', description: 'Forty-eight hours to make a useful thing with a team that shares your curiosity.' },
];
const nodes = [[5,75,'amber'],[11,83,'blue'],[18,60,'amber'],[25,87,'amber'],[34,70,'blue'],[42,88,'amber'],[53,72,'amber'],[61,84,'blue'],[69,66,'amber'],[77,87,'amber'],[84,59,'blue'],[92,79,'amber']];
const showcaseImages = [
  { src: '/workshop.jpg', label: '01 / 04', category: 'Event', title: 'Workshop' },
  { src: '/session.jpg', label: '02 / 04', category: 'Session', title: 'Brainstorm' },
  { src: '/build.jpg', label: '03 / 04', category: 'Build', title: 'Projects' },
  { src: '/meetup.jpg', label: '04 / 04', category: 'Community', title: 'Meetup' },
];
const people = [
  { name: 'Sujal Bhatia', role: 'President', image: '/sujal.png', featured: true },
  { name: 'Satyam Shakti', role: 'Media head', image: '/satyam.jpeg' },
  { name: 'Meharjot Singh', role: 'Head coordinator', image: '/Meharjot.jpg' },
  { name: 'Saksham Shakya', role: 'Technical head', image: '/saksham.png' },
];

function SparkMotes({ enabled, fieldRef }) {
  const refs = useRef([]);
  const motes = useMemo(() => Array.from({ length: 22 }, (_, id) => ({ id, left: 3 + ((id * 37) % 94), size: 2 + ((id * 13) % 5), duration: 6 + ((id * 29) % 9), delay: -((id * 17) % 12), drift: 15 + ((id * 11) % 26) })), []);
  useEffect(() => {
    const active = refs.current.filter(Boolean);
    if (!enabled || !active.length) return undefined;
    const animations = active.map((element, index) => anime({ targets: element, translateY: ['-12vh', '105vh'], translateX: [0, motes[index].drift, -motes[index].drift, 0], opacity: [0, 0.45 + ((index % 5) * 0.1), 0.4, 0], rotate: [0, index % 2 ? 90 : -90], duration: motes[index].duration * 1000, delay: motes[index].delay * 1000, easing: 'linear', loop: true }));
    const visibility = () => animations.forEach(item => document.hidden ? item.pause() : item.play());
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); animations.forEach(item => item.pause()); anime.remove(active); };
  }, [enabled, motes]);
  if (!enabled) return <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_60%,var(--spark-soft),transparent_18%)] opacity-30" />;
  return <div ref={fieldRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">{motes.map((mote, index) => <span key={mote.id} ref={el => { refs.current[index] = el; }} className="absolute rounded-full bg-[radial-gradient(circle,var(--spark)_0%,var(--spark-soft)_40%,transparent_72%)]" style={{ left: `${mote.left}%`, width: mote.size, height: mote.size, boxShadow: '0 0 10px var(--spark-glow)' }} />)}</div>;
}

export default function Home() {
  const mainRef = useRef(null), heroRef = useRef(null), backgroundRef = useRef(null), fieldRef = useRef(null), nodeRefs = useRef([]), statsRef = useRef(null), showcaseRef = useRef(null);
  const [capable, setCapable] = useState(false), [slide, setSlide] = useState(0);
  useEffect(() => { const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; const enoughPower = window.innerWidth >= 768 && (navigator.hardwareConcurrency || 8) > 4; setCapable(!reduced && enoughPower); }, []);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    const interval = window.setInterval(() => setSlide(current => (current + 1) % showcaseImages.length), 4500);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!capable) return undefined;
    const animations = nodeRefs.current.filter(Boolean).map((node, index) => anime({ targets: node, scale: [0.75, 1.25, 0.8], opacity: [0.3, 1, 0.45], duration: 1500 + ((index * 379) % 1700), delay: (index * 173) % 900, direction: 'alternate', easing: 'easeInOutSine', loop: true }));
    const visibility = () => animations.forEach(item => document.hidden ? item.pause() : item.play());
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); animations.forEach(item => item.pause()); anime.remove(nodeRefs.current); };
  }, [capable]);
  useGSAP(() => {
    if (!heroRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
    const ctx = gsap.context(() => {
      const intro = !reduced ? gsap.timeline().from('.reveal-navbar', { opacity: 0, y: -12, duration: .45, clearProps: 'all' }).from(backgroundRef.current, { opacity: 0, scale: 1.025, duration: .7, clearProps: 'all' }, .1).from('[data-hero-line]', { opacity: 0, y: 30, duration: .65, stagger: .12, clearProps: 'all' }, .35).from('[data-hero-copy]', { opacity: 0, y: 12, duration: .45, stagger: .08, clearProps: 'all' }, .8) : null;
      const electric = !reduced ? gsap.timeline({ repeat: -1 }).to('.electric-trace', { strokeDashoffset: -192, duration: 2.8, ease: 'none', stagger: .45 }, 0).to('.electric-trace-reverse', { strokeDashoffset: 192, duration: 3.2, ease: 'none', stagger: .45 }, 0) : null;
      const visibility = () => { [intro, electric].filter(Boolean).forEach(animation => document.hidden ? animation.pause() : animation.play()); };
      document.addEventListener('visibilitychange', visibility);
      const values = statsRef.current?.querySelectorAll('[data-stat-value]') || [];
      ScrollTrigger.create({ trigger: statsRef.current, start: 'top 82%', once: true, onEnter: () => values.forEach(element => { const value = { count: 0 }; gsap.to(value, { count: Number(element.dataset.statValue), duration: reduced ? 0 : 1.15, ease: 'power2.out', onUpdate: () => { element.textContent = `${Math.round(value.count)}${element.dataset.suffix || ''}`; } }); }) });
      if (!reduced && !lowPower) {
        gsap.to(backgroundRef.current, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to(fieldRef.current, { yPercent: 22, ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true } });
        const move = event => { const x = (event.clientX / window.innerWidth - .5) * 2, y = (event.clientY / window.innerHeight - .5) * 2; gsap.to(backgroundRef.current, { x: x * 8, y: y * 5, overwrite: 'auto', duration: .7 }); gsap.to(fieldRef.current, { x: x * 24, y: y * 16, overwrite: 'auto', duration: .7 }); };
        window.addEventListener('pointermove', move, { passive: true }); return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pointermove', move); };
      }
      return () => document.removeEventListener('visibilitychange', visibility);
    }, heroRef); return () => ctx.revert();
  }, { scope: heroRef, dependencies: [capable] });
  const handleTextClick = event => {
    if (!capable || !event.target.closest('h1, h2, h3, p, a')) return;
    const target = event.target.closest('[data-depth]') || showcaseRef.current || heroRef.current;
    gsap.fromTo(target, { rotationX: 0, rotationY: 0, z: 0 }, { rotationX: -2, rotationY: 3, z: 14, duration: .16, ease: 'power2.out', yoyo: true, repeat: 1, transformPerspective: 900, overwrite: 'auto' });
  };
  return <main ref={mainRef} onClick={handleTextClick} className="homepage min-h-screen overflow-x-hidden bg-paper font-body text-ink selection:bg-spark-soft" style={{ perspective: '1200px' }}>
    <section ref={heroRef} className="relative isolate flex min-h-[min(680px,84svh)] items-center overflow-hidden px-6 pb-12 pt-20 md:px-12 md:pt-24 lg:px-20">
      <div ref={backgroundRef} className="absolute inset-0 -z-20 overflow-hidden pointer-events-none"><img src="/circuit-horizon.png" alt="" className="h-full w-full object-cover object-bottom opacity-30" /></div><div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--paper)_15%,transparent_65%,var(--paper)_100%)] pointer-events-none" />
      <svg className="absolute inset-0 z-10 h-full w-full pointer-events-none opacity-70" aria-hidden="true" viewBox="0 0 1440 780" preserveAspectRatio="none"><path className="electric-trace-reverse" d="M0 170 H150 L210 220 H415 L470 155 H650 L710 205 H920 L980 145 H1190 L1250 195 H1440" fill="none" stroke="var(--circuit)" strokeWidth="1.25" strokeDasharray="10 38" /><path className="electric-trace-reverse" d="M0 110 H95 L145 150 H330 L390 95 H590 L640 145 H830 L890 90 H1080 L1140 135 H1440" fill="none" stroke="var(--spark)" strokeWidth="1.15" strokeDasharray="8 48" /><path className="electric-trace" d="M0 590 H190 L240 540 H440 L490 600 H710 L760 530 H970 L1020 570 H1240 L1300 505 H1440" fill="none" stroke="var(--circuit)" strokeWidth="1.4" strokeDasharray="10 38" /><path className="electric-trace" d="M0 650 H130 L205 610 H390 L450 670 H670 L725 620 H920 L970 680 H1170 L1230 610 H1440" fill="none" stroke="var(--spark)" strokeWidth="1.3" strokeDasharray="8 48" /></svg><div className="absolute inset-0 z-0 pointer-events-none">{nodes.map(([left, top, color], index) => <span key={`${left}-${top}`} ref={el => { nodeRefs.current[index] = el; }} className={`absolute h-2 w-2 rounded-full ${color === 'blue' ? 'bg-circuit' : 'bg-spark'}`} style={{ left: `${left}%`, top: `${top}%`, boxShadow: `0 0 12px ${color === 'blue' ? 'var(--circuit)' : 'var(--spark-glow)'}` }} />)}</div><SparkMotes enabled={capable} fieldRef={fieldRef} />
      <div className="relative z-20 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]"><div data-depth className="max-w-3xl" style={{ transformStyle: 'preserve-3d' }}><p data-hero-copy className="mb-5 font-mono text-sm text-circuit">LPU SCA / Brainstorm Club</p><h1 className="font-heading text-5xl font-bold leading-[.9] tracking-tight md:text-7xl"><span data-hero-line className="block">Where academia</span><span data-hero-line className="block">meets <span className="text-circuit">innovation.</span></span></h1><p data-hero-copy className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">A student-led technology community at Lovely Professional University where students think, build, connect and turn ideas into action.</p><div data-hero-copy className="mt-9 flex flex-wrap gap-3"><Link to="/events" className="rounded-[10px] bg-spark px-7 py-3.5 font-medium text-ink transition-transform hover:-translate-y-0.5">Explore Events</Link><Link to="/join-us" className="rounded-[10px] border border-circuit bg-paper px-7 py-3.5 font-medium text-ink transition-colors hover:bg-paper-dim">Join the community</Link></div></div><div ref={showcaseRef} data-depth className="relative mx-auto hidden h-[570px] w-full max-w-xl overflow-hidden rounded-[10px] border border-border bg-paper-dim lg:block" style={{ transformStyle: 'preserve-3d' }} aria-label="Club activity showcase">{showcaseImages.map((item, index) => <img key={item.src} src={item.src} alt="Students collaborating at a Brainstorm Club event" className="absolute inset-0 h-full w-full object-cover transition-all duration-1000" style={{ opacity: slide === index ? 1 : 0, transform: slide === index ? 'scale(1)' : 'scale(1.04)' }} />)}<div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,var(--ink)_100%)] opacity-70" /><div className="absolute inset-x-6 top-6 flex items-start justify-between"><span className="rounded bg-paper px-3 py-2 font-mono text-xs text-ink">{showcaseImages[slide].label}</span><div className="flex gap-1.5">{showcaseImages.map((item, index) => <span key={item.label} className={`h-0.5 w-7 ${index <= slide ? 'bg-spark' : 'bg-paper'}`} />)}</div></div><div className="absolute bottom-7 left-7"><p className="font-mono text-xs text-spark">{showcaseImages[slide].category}</p><h2 className="mt-2 font-heading text-4xl font-bold text-paper">{showcaseImages[slide].title}</h2></div></div></div>
    </section>
    <section ref={statsRef} className="border-y border-border bg-paper px-6 py-14 md:px-12 lg:px-20"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-9 md:grid-cols-4">{[['42','Events'],['18','Ideas'],['6','Teams'],['120','Members','+']].map(([number,label,suffix]) => <div key={label}><div data-stat-value={number} data-suffix={suffix || ''} className="font-mono text-4xl font-semibold text-ink md:text-5xl">{number}{suffix}</div><div className="mt-2 text-sm text-ink-soft">{label}</div></div>)}</div></section>
    <section className="bg-paper-dim px-6 py-24 md:px-12 lg:px-20"><div className="mx-auto max-w-7xl"><h2 className="border-b border-border pb-5 font-heading text-4xl font-bold">Upcoming events</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{events.map((event,index) => <article data-depth key={event.id} className={`flex min-h-72 flex-col rounded-[10px] border border-border bg-paper p-7 shadow-sys ${index === 1 ? 'md:translate-y-7' : index === 2 ? 'md:translate-y-14' : ''}`} style={{ transformStyle: 'preserve-3d' }}><p className="font-mono text-xs text-circuit">{event.date} / {event.venue}</p><h3 className="mt-6 font-heading text-2xl font-bold">{event.title}</h3><p className="mt-4 leading-relaxed text-ink-soft">{event.description}</p><Link to="/events" className="mt-auto pt-8 font-medium text-circuit hover:text-ink">View event</Link></article>)}</div></div></section>
    <section className="bg-paper px-6 py-24 md:px-12 lg:px-20"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">{[['Vision','Create a culture where student ideas become meaningful real-world experiences.'],['Mission','Turn student ideas into collaborative projects, events, experiments, and action.'],['What we run','Workshops, hackathons, ideation sessions, technical events, and community-building experiences.']].map(([heading,copy]) => <article key={heading} className="border-l-2 border-spark pl-6"><h2 className="font-heading text-2xl font-bold">{heading}</h2><p className="mt-4 text-lg leading-relaxed text-ink-soft">{copy}</p></article>)}</div></section>
    <section className="bg-paper-dim px-6 py-24 md:px-12 lg:px-20"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 className="font-heading text-4xl font-bold leading-tight md:text-5xl">The people<br />behind the ideas.</h2><Link to="/members" className="font-mono text-sm text-circuit hover:text-ink">Meet the team</Link></div><div className="mt-12 grid gap-4 md:grid-cols-12">{people.map((person, index) => <article data-depth key={person.name} className={`group relative min-h-80 overflow-hidden bg-paper ${person.featured ? 'md:col-span-6 md:row-span-2 md:min-h-[620px]' : 'md:col-span-3 md:min-h-[300px]'}`} style={{ transformStyle: 'preserve-3d' }}><img src={person.image} alt={person.name} className="h-full w-full object-cover object-top grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" /><div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,var(--ink)_100%)] opacity-75" /><div className="absolute bottom-6 left-6"><p className="font-mono text-xs text-spark">{person.role}</p><h3 className="mt-2 font-heading text-2xl font-bold text-paper">{person.name}</h3></div></article>)}</div></div></section>
    <section className="bg-paper-dim px-6 py-24 text-center md:px-12 lg:px-20"><div className="mx-auto max-w-3xl"><p className="font-mono text-sm text-circuit">A thought is better in the open.</p><h2 className="mt-4 font-heading text-5xl font-bold tracking-tight md:text-6xl">Got an idea? Pitch it.</h2><Link to="/ideas" className="mt-9 inline-flex rounded-[10px] bg-spark px-8 py-4 font-medium text-ink transition-transform hover:-translate-y-0.5">Pitch Your Idea</Link></div></section><div className="homepage-footer"><Footer /></div>
  </main>;
}
