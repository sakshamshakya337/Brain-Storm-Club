import React, { useState, useEffect, useRef } from 'react';
import { 
  Instagram, Linkedin, Youtube, Twitter, Github, 
  Globe, Mail, MessageCircle, Facebook, Loader2, Link as LinkIcon 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const PRESET_ICONS = {
  Globe: Globe,
  Instagram: Instagram,
  Linkedin: Linkedin,
  Youtube: Youtube,
  Twitter: Twitter,
  Github: Github,
  Facebook: Facebook,
  Mail: Mail,
  MessageCircle: MessageCircle,
};

export default function Connect() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Fetch links from the API
  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/public/links');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      // The API returns { status: 'success', data: { links: [...] } }
      if (json.data && Array.isArray(json.data.links)) {
        setLinks(json.data.links);
      } else {
        setLinks([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Handle link click tracking
  const handleLinkClick = (e, link) => {
    e.preventDefault();
    // Hit the tracking endpoint in the background
    fetch(`/api/public/links/${link._id}/visit`).catch(console.error);
    // Navigate immediately
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  // GSAP Choreography
  useGSAP(() => {
    if (loading || error) return;
    
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      gsap.set('.gsap-reveal', { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline();

    // 1. Profile/logo appears first
    tl.fromTo('.gsap-profile', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );

    // 2. Link buttons enter sequentially if there are any
    if (links.length > 0) {
      tl.fromTo('.gsap-link-item',
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.08, 
          ease: 'back.out(1.2)'
        },
        "-=0.3" // Overlap slightly with profile entrance
      );
    }

    // 3. Footer fade in
    tl.fromTo('.gsap-footer',
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' },
      "-=0.2"
    );

  }, { dependencies: [loading, error, links], scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-bg-primary flex justify-center relative overflow-x-hidden"
    >
      {/* Background Grid Pattern - reusing existing visual language */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="w-full max-w-2xl px-6 py-12 flex flex-col items-center z-10 min-h-screen">
        
        {/* Profile Area */}
        <div className="gsap-profile flex flex-col items-center mb-10 w-full opacity-0">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
            <img 
              src="/logo.png"
              alt="Brainstorm Project Club" 
              className="w-full h-auto object-contain"
              style={{ maxHeight: '144px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="hidden w-full h-full items-center justify-center rounded-full bg-brand-primary/10 border-4 border-slate-100 dark:border-slate-800"
              style={{ width: '112px', height: '112px' }}
            >
              <span className="text-brand-primary font-heading font-bold text-3xl">B</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2 text-center">
            Brainstorm Club
          </h1>
          <p className="text-sm font-mono text-text-secondary text-center max-w-sm">
            LPU SCA • Innovation Community
          </p>
        </div>

        {/* Links Area */}
        <div className="w-full flex-1 flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={32} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Unable to load our links right now.</p>
              <button 
                onClick={fetchLinks}
                className="px-5 py-2 text-sm font-bold font-mono tracking-widest uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full hover:bg-brand-primary/20 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <LinkIcon size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-medium text-slate-500 dark:text-slate-400">No links available yet.</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Connect with us soon. Our links will appear here.</p>
            </div>
          ) : (
            links.map((link) => {
              const Icon = PRESET_ICONS[link.presetIcon] || Globe;
              return (
                <a
                  key={link._id}
                  href={link.url}
                  onClick={(e) => handleLinkClick(e, link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "gsap-link-item opacity-0 group relative w-full flex items-center p-2 sm:p-2.5",
                    "bg-white dark:bg-slate-900",
                    "border border-slate-200 dark:border-slate-800",
                    "rounded-2xl sm:rounded-full shadow-sm",
                    "hover:border-brand-primary/50 dark:hover:border-brand-primary/50",
                    "hover:shadow-md transition-all duration-300 ease-out",
                    // Micro-interactions via CSS (GSAP handles entrance)
                    "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                  )}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700/50 group-hover:bg-brand-primary/5 transition-colors">
                    {link.iconType === 'custom' && link.customImageId ? (
                      <img 
                        src={`/api/images/${link.customImageId?.imageId || link.customImageId}?variant=member_card`} 
                        alt=""
                        className="w-full h-full object-cover rounded-xl sm:rounded-full"
                        crossOrigin="use-credentials"
                      />
                    ) : (
                      <Icon size={22} className="text-slate-700 dark:text-slate-300 group-hover:text-brand-primary transition-colors group-hover:scale-110 duration-300" />
                    )}
                  </div>
                  
                  <span className="flex-1 text-center font-medium text-slate-800 dark:text-slate-200 pr-12 sm:pr-14 truncate px-2 group-hover:text-brand-primary transition-colors">
                    {link.title}
                  </span>
                </a>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="gsap-footer opacity-0 mt-24 pb-6 pt-8 border-t border-slate-200 dark:border-slate-800 w-full max-w-[200px] flex flex-col items-center">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            Brainstorm Club
          </span>
        </div>
      </div>
    </div>
  );
}
