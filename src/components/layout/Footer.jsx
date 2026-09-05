import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050914] border-t border-slate-900 text-slate-300 relative overflow-hidden font-body">
      {/* Subtle Technical Background */}
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/15 rounded-full blur-[120px] -translate-y-1/2 mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-[1440px] relative z-10 pt-16 pb-8">

        {/* ── Main Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.6fr] gap-10 lg:gap-8 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-start">
            <Link to="/" className="mb-5 flex items-center gap-3 group" aria-label="Brainstorm Club Home">
              <img src="/favicon.jpg" alt="Brainstorm Club" className="h-10 w-auto object-contain shrink-0" />
              <div>
                <span className="font-heading font-black text-xl tracking-tight text-white uppercase block leading-tight">
                  BRAINSTORM
                </span>
                <span className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-brand-primary">
                  LPU SCA
                </span>
              </div>
            </Link>

            <p className="text-slate-400 font-light leading-relaxed text-sm mb-6 max-w-[18rem]">
              A student-led technology and innovation community at Lovely Professional University.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/brainstorm.lpu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:border-brand-primary transition-colors"
              >
                <Instagram size={15} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="w-9 h-9 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:border-brand-primary transition-colors"
              >
                <Twitter size={15} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:border-brand-primary transition-colors"
              >
                <Linkedin size={15} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:border-brand-primary transition-colors"
              >
                <Github size={15} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-white uppercase mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full shrink-0" />
              Explore
            </h4>
            <ul className="space-y-3 text-sm font-light text-slate-400">
              <li><Link to="/events" className="hover:text-brand-secondary transition-colors">Events</Link></li>
              <li><Link to="/members" className="hover:text-brand-secondary transition-colors">Members</Link></li>
              <li><Link to="/about" className="hover:text-brand-secondary transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-brand-secondary transition-colors">Contact</Link></li>
              <li>
                <Link to="/join-us" className="hover:text-brand-secondary transition-colors text-white font-medium">
                  Join Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-white uppercase mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-primary rounded-full shrink-0" />
              Get Involved
            </h4>
            <ul className="space-y-3 text-sm font-light text-slate-400">
              <li>
                <Link to="/ideas" className="hover:text-brand-primary transition-colors">Submit an Idea</Link>
              </li>
              <li>
                <Link to="/join-us" className="hover:text-brand-primary transition-colors">Join the Community</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-white uppercase mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-accent rounded-full shrink-0" />
              Contact
            </h4>
            <ul className="space-y-4 text-sm font-light text-slate-400">
              <li className="flex items-start gap-2.5 min-w-0">
                <Mail size={14} className="text-slate-500 shrink-0 mt-0.5" />
                <a
                  href="mailto:brainstorm.club.lpu@gmail.com"
                  className="hover:text-white transition-colors break-all min-w-0"
                >
                  brainstorm.club.lpu@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-slate-500 shrink-0 mt-0.5" />
                <address className="not-italic leading-snug text-slate-400 text-sm">
                  Block 38-507, Cabin 1<br />
                  School of Computer Applications<br />
                  LPU Campus, Punjab, India
                </address>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom Bar ────────────────────────────────────────── */}
        <div className="pt-6 border-t border-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Left: Copyright + Developer */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase whitespace-nowrap">
                &copy; {new Date().getFullYear()} Brain Storm Club, SCA. All Rights Reserved.
              </p>
              <span className="hidden sm:inline text-slate-800 select-none">|</span>
              <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                Developed by{' '}
                <a
                  href="https://sakshamshakya.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-secondary hover:text-white hover:underline transition-colors font-bold"
                >
                  Saksham Shakya
                </a>
              </p>
            </div>

            {/* Right: Legal + Status */}
            <nav aria-label="Legal links" className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link to="/about" className="font-mono text-[10px] tracking-widest text-slate-500 uppercase hover:text-slate-300 transition-colors">
                About Us
              </Link>
              <Link to="/terms" className="font-mono text-[10px] tracking-widest text-slate-500 uppercase hover:text-slate-300 transition-colors">
                Terms
              </Link>
              <Link to="/privacy-policy" className="font-mono text-[10px] tracking-widest text-slate-500 uppercase hover:text-slate-300 transition-colors">
                Privacy
              </Link>
              <Link to="/security" className="font-mono text-[10px] tracking-widest text-slate-500 uppercase hover:text-slate-300 transition-colors">
                Security
              </Link>
              <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-emerald-500 uppercase whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                All Systems Operational
              </div>
            </nav>

          </div>
        </div>

      </div>
    </footer>
  );
}
