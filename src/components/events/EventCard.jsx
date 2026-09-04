import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import EventStatus from './EventStatus';
import ProtectedImage from '../common/ProtectedImage';

export default function EventCard({ event }) {
  const cover = event.coverImage || (event.images && event.images.find(img => img.isCover)) || (event.images && event.images[0]);
  const imageId = cover?.imageId?.imageId || cover?.imageId || event.posterId?.imageId || (typeof event.posterId === 'string' ? event.posterId : null);
  const externalSrc = cover?.source === 'external' ? cover.url : (event.images?.[0]?.source === 'external' ? event.images[0].url : null);
  const galleryCount = Array.isArray(event.images) ? event.images.length : (imageId || externalSrc ? 1 : 0);

  return (
    <Link 
      to={`/events/${event.slug}`}
      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group hover:border-brand-primary/50 dark:hover:bg-bg-elevated dark:hover:border-slate-700 transition-colors relative overflow-hidden shadow-sm dark:shadow-none rounded-sm min-h-[400px]"
    >
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Responsive Image Block with Ambient Backdrop */}
      <div className="relative w-full aspect-[16/10] sm:aspect-auto sm:h-48 md:h-56 overflow-hidden bg-slate-950 flex items-center justify-center">
        {/* Ambient blurred backdrop to prevent black bars and match image palette */}
        <ProtectedImage 
          imageId={imageId} 
          src={externalSrc}
          variant="event_card"
          alt="" 
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-35 dark:opacity-40 pointer-events-none" 
        />
        {/* Crisp foreground poster with full containment (no cropped text) */}
        <ProtectedImage 
          imageId={imageId} 
          src={externalSrc}
          variant="event_card"
          alt={event.title} 
          className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-20 pointer-events-none"></div>

        {galleryCount > 1 && (
          <span className="absolute bottom-2 right-2 z-20 font-mono text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-900/85 text-slate-200 border border-white/15 backdrop-blur-sm">
            {galleryCount} PHOTOS
          </span>
        )}
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
      <div className="relative z-10 flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4 pb-6 px-6 md:px-8 font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5"><Calendar size={12}/> {event.date || event.year}</span>
          <span className={event.registrationOpen ? 'text-emerald-500 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500 font-bold'}>
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
