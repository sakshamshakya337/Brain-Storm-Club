import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, ArrowLeft, Home, Calendar, Users, Lightbulb,
  UserPlus, Mail, Info, Compass, ArrowUpRight, Sparkles
} from 'lucide-react';
import Footer from '../../components/layout/Footer';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Smart routing for common queries
    if (query.includes('event') || query.includes('hackathon') || query.includes('workshop')) {
      navigate('/events');
    } else if (query.includes('member') || query.includes('team') || query.includes('lead')) {
      navigate('/members');
    } else if (query.includes('join') || query.includes('apply') || query.includes('recruit')) {
      navigate('/join-us');
    } else if (query.includes('idea') || query.includes('pitch') || query.includes('submit')) {
      navigate('/ideas');
    } else if (query.includes('about') || query.includes('club') || query.includes('history')) {
      navigate('/about');
    } else if (query.includes('contact') || query.includes('query') || query.includes('help')) {
      navigate('/contact');
    } else if (query.includes('admin') || query.includes('control') || query.includes('login')) {
      navigate('/control');
    } else {
      // General search query falls back to events search
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickLinks = [
    {
      title: 'Upcoming Events',
      desc: 'Hackathons, workshops & tech sessions',
      path: '/events',
      icon: Calendar,
      tag: '01 / EVENTS',
    },
    {
      title: 'Our Members',
      desc: 'Meet the technical & creative minds',
      path: '/members',
      icon: Users,
      tag: '02 / TEAM',
    },
    {
      title: 'Join Brainstorm Club',
      desc: 'Apply to become an official core member',
      path: '/join-us',
      icon: UserPlus,
      tag: '03 / RECRUITMENT',
    },
    {
      title: 'Submit an Idea',
      desc: 'Pitch a project, initiative, or event idea',
      path: '/ideas',
      icon: Lightbulb,
      tag: '04 / INNOVATION',
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-body transition-colors">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] py-4 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold tracking-widest uppercase">ERROR 404 / NOT FOUND</span>
          </div>
          <span className="hidden sm:inline font-mono tracking-widest uppercase opacity-70">
            PATH: {location.pathname}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center py-16 md:py-24 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 dark:bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 max-w-[1100px] relative z-10 text-center">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary font-mono text-[11px] font-bold tracking-widest uppercase mb-6">
            <Compass size={13} />
            <span>NAVIGATION DRIFT / 404 ERROR</span>
          </div>

          {/* Huge 404 Numerical Display */}
          <h1 className="font-heading font-black text-[clamp(6rem,18vw,13rem)] leading-[0.85] tracking-tighter text-slate-900 dark:text-white select-none mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-primary via-brand-secondary to-slate-400 dark:to-slate-600">
              404
            </span>
          </h1>

          {/* Heading */}
          <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-slate-900 dark:text-white uppercase tracking-tight mb-4">
            Lost in the Brainstorm.
          </h2>

          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base sm:text-lg mb-10 leading-relaxed font-light">
            The page you are looking for doesn't exist, has been relocated, or is no longer accessible. Use the search bar below or pick a direct destination.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative flex items-center shadow-lg rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Search size={18} className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything (e.g. events, hackathons, team, ideas)..."
                className="w-full pl-11 pr-28 py-3.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-mono font-bold tracking-wider uppercase rounded hover:bg-brand-primary/90 transition-colors shadow-sm cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Quick Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase">Quick Jump:</span>
              <Link
                to="/events"
                className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors border border-slate-200 dark:border-slate-700"
              >
                Events
              </Link>
              <Link
                to="/members"
                className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors border border-slate-200 dark:border-slate-700"
              >
                Members
              </Link>
              <Link
                to="/join-us"
                className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors border border-slate-200 dark:border-slate-700"
              >
                Join Us
              </Link>
              <Link
                to="/ideas"
                className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors border border-slate-200 dark:border-slate-700"
              >
                Ideas
              </Link>
              <Link
                to="/about"
                className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors border border-slate-200 dark:border-slate-700"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors border border-slate-200 dark:border-slate-700"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-xs font-mono font-bold tracking-widest uppercase rounded-sm hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 hover:shadow-lg"
            >
              <Home size={15} />
              Return Home
            </Link>
            {location.pathname.startsWith('/control') && (
              <Link
                to="/control/dashboard"
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-mono font-bold tracking-widest uppercase rounded-sm hover:opacity-90 transition-all shadow-md"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold tracking-widest uppercase rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              Go Back
            </button>
          </div>

          {/* Section: Quick Exploration Directory */}
          <div className="text-left border-t border-slate-200 dark:border-slate-800 pt-12">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
                RECOMMENDED DESTINATIONS
              </span>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                INDEX [01-04]
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-md hover:border-brand-primary/50 dark:hover:border-brand-primary/50 transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 rounded bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                          <Icon size={18} />
                        </div>
                        <ArrowUpRight size={16} className="text-slate-400 group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-brand-primary block mb-1">
                        {item.tag}
                      </span>
                      <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Footer (only on public 404) */}
      {!location.pathname.startsWith('/control') && <Footer />}
    </div>
  );
}
