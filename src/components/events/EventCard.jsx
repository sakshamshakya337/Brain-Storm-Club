import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import EventStatus from './EventStatus';
import ProtectedImage from '../common/ProtectedImage';

export default function EventCard({ event }) {
  return (
    <Link 
      to={`/events/${event.slug}`}
      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group hover:border-brand-primary/50 dark:hover:bg-bg-elevated dark:hover:border-slate-700 transition-colors relative overflow-hidden shadow-sm dark:shadow-none rounded-sm min-h-[400px]"
    >
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Image Block */}
      <div className="relative w-full h-48 md:h-56 overflow-hidden bg-slate-100 dark:bg-slate-950">
        <ProtectedImage 
          imageId={event.posterId?.imageId} 
          variant="event_card"
          alt={event.title} 
          className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:scale-[1.03] group-hover:mix-blend-normal transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-40"></div>
      </div>
      
      {/* Content Block */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-6">
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-secondary border border-slate-200 dark:border-slate-700 px-2 py-1 bg-white/50 dark:bg-transparent">
            {event.category}
          </span>
          <EventStatus status={event.status} />
        </div>
        
        <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors">
          {event.title}
        </h3>
        
        <p className="font-body text-sm font-light text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
          {event.desc}
        </p>
      </div>

      {/* Footer Block */}
      <div className="relative z-10 flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4 pb-6 px-6 md:px-8 font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-slate-500">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5"><Calendar size={12}/> {event.date || event.year}</span>
          <span className={event.registrationOpen ? 'text-emerald-500 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-600 font-bold'}>
            {event.registrationOpen ? 'REG OPEN' : 'REG CLOSED'}
          </span>
        </div>
        <div className="font-bold flex items-center justify-between transition-colors text-slate-900 dark:text-white w-full">
          READ MORE <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform"/>
        </div>
      </div>
    </Link>
  );
}
