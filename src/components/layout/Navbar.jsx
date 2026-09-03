import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Events', path: '/events' },
    { name: 'Members', path: '/members' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Join Us', path: '/join-us' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800" : "bg-transparent border-transparent"
    )}>
      <div className="flex justify-between items-center h-20 px-6 lg:px-8 max-w-[1440px] mx-auto">
        <Link to="/" className="flex items-center gap-3 group h-full">
          <img 
            src={theme === 'dark' ? '/favicon.jpg' : '/logo.png'}
            alt="Brainstorm Logo" 
            className={cn(
              "object-contain origin-left transition-transform drop-shadow-sm",
              theme === 'dark'
                ? "h-10 md:h-12 w-auto group-hover:scale-105" // Constrained compact brand mark
                : "h-20 md:h-28 w-auto group-hover:scale-[1.15] scale-110" // Exact original light mode styling
            )}
          />
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-body text-sm tracking-tight uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "hover:text-slate-900 dark:hover:text-white transition-colors",
                location.pathname === link.path ? "text-brand-primary font-semibold" : "text-slate-600 dark:text-slate-400"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode" 
            className="scale-95 active:scale-90 transition-transform p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full flex items-center justify-center"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link 
            to="/join-us"
            className="hidden md:block bg-slate-900 dark:bg-brand-primary text-white dark:text-white px-6 py-2.5 rounded-full font-mono text-xs font-bold tracking-wider uppercase hover:bg-brand-primary dark:hover:bg-brand-primary/80 transition-colors scale-95 active:scale-90"
          >
            Submit an Idea
          </Link>
        </div>
      </div>
    </nav>
  );
}
