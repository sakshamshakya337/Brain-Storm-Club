import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050914] border-t border-slate-900 text-slate-300 relative overflow-hidden font-body">
      {/* Subtle Technical Background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-[1440px] relative z-10 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* LEFT: Branding */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col items-start pr-0 lg:pr-12">
            <Link to="/" className="mb-6 flex flex-col items-start gap-4">
              <img src="/favicon.jpg" alt="Brainstorm Logo" className="h-16 w-auto object-contain" />
              <div>
                <span className="font-heading font-black text-3xl tracking-tight text-white uppercase block">
                  BRAINSTORM
                </span>
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary mt-1">
                  LPU SCA
                </span>
              </div>
            </Link>
            
            <p className="text-slate-500 font-light leading-relaxed max-w-sm mb-10 text-sm">
              A student-led technology and innovation community at Lovely Professional University. We build the future.
            </p>
            
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-colors">
                <Linkedin size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-colors">
                <Github size={16} />
              </a>
            </div>
          </div>
          
          {/* CENTER: Explore */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="font-mono text-xs font-bold tracking-widest text-white uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full"></span>
              Explore
            </h4>
            <ul className="space-y-4 text-sm font-light text-slate-400">
              <li><Link to="/events" className="hover:text-brand-secondary transition-colors">Events</Link></li>
              <li><Link to="/members" className="hover:text-brand-secondary transition-colors">Members</Link></li>
              <li><Link to="/about" className="hover:text-brand-secondary transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-brand-secondary transition-colors">Contact</Link></li>
              <li><Link to="/join-us" className="hover:text-brand-secondary transition-colors text-white font-medium">Join Us</Link></li>
            </ul>
          </div>
          
          {/* RIGHT: Get Involved & Contact */}
          <div className="md:col-span-8 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-12 lg:gap-8">
            <div>
              <h4 className="font-mono text-xs font-bold tracking-widest text-white uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                Get Involved
              </h4>
              <ul className="space-y-4 text-sm font-light text-slate-400">
                <li><Link to="/ideas" className="hover:text-brand-primary transition-colors block">Submit an Idea</Link></li>
                <li><Link to="/join-us" className="hover:text-brand-primary transition-colors block">Join the Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-mono text-xs font-bold tracking-widest text-white uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
                Contact
              </h4>
              <ul className="space-y-4 text-sm font-light text-slate-400">
                <li className="flex items-start gap-3">
                  <Mail size={16} className="text-slate-600 shrink-0 mt-0.5" />
                  <a href="mailto:contact@lpusca.com" className="hover:text-white transition-colors break-words">contact@lpusca.com</a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-sm shrink-0 mt-0.5">HQ</span>
                  <span className="leading-snug">LPU Campus<br/>Block 32, Innovation Lab<br/>Punjab, India</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
        
        {/* BOTTOM: Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] tracking-widest text-slate-600 uppercase">
            &copy; {new Date().getFullYear()} LPU SCA Brainstorm Club
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="font-mono text-[10px] tracking-widest text-slate-600 uppercase hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-slate-600 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
