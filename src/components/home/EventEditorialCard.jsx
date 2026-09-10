import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProtectedImage from '../common/ProtectedImage';

export default function EventEditorialCard({ event, index }) {
  const hCover = event.coverImage || (event.images && event.images.find(img => img.isCover)) || (event.images && event.images[0]);
  const hImageId = hCover?.imageId?.imageId || hCover?.imageId || event.posterId?.imageId || (typeof event.posterId === 'string' ? event.posterId : null);
  const hSrc = hCover?.source === 'external' ? hCover.url : (event.images?.[0]?.source === 'external' ? event.images[0].url : null);
  
  const paddedIndex = String(index).padStart(2, '0');

  const isLiveOrUpcoming = ['Live', 'Ongoing', 'Upcoming'].includes(event.status);

  return (
    <motion.div 
      whileHover="hover"
      className="event-card-animate group flex flex-col w-full h-full bg-white border border-slate-200 transition-colors hover:border-slate-400 overflow-hidden"
    >
      <Link to={`/events/${event.slug}`} className="flex flex-col h-full">
        
        {/* MEDIA SECTION */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-200">
          <motion.div
            variants={{ hover: { scale: 1.03 } }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-full"
          >
            <ProtectedImage 
              imageId={hImageId} 
              src={hSrc}
              variant="event_card" 
              className="w-full h-full object-cover object-center mix-blend-multiply" 
              alt={event.title} 
            />
          </motion.div>
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-1 shadow-sm backdrop-blur-md ${isLiveOrUpcoming ? 'bg-indigo-600/90 text-white' : 'bg-white/80 text-slate-600 border border-slate-200'}`}>
              {isLiveOrUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
              {event.status}
            </span>
          </div>

          {/* Index Marker */}
          <div className="absolute bottom-4 right-4 z-10">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-white mix-blend-difference opacity-70">
              {paddedIndex}
            </span>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="flex flex-col flex-grow p-6 md:p-8">
          
          {/* Category */}
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-400 mb-3 uppercase">
            {event.category || 'EVENT'}
          </span>
          
          {/* Title */}
          <h3 className="font-heading font-bold text-xl md:text-2xl uppercase tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors mb-4 line-clamp-2">
            {event.title}
          </h3>
          
          <div className="mt-auto">
            {/* Metadata */}
            <div className="flex flex-col gap-2 mb-6">
              <div className="font-mono text-[10px] tracking-widest uppercase text-slate-500 flex items-center gap-3">
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="truncate">{event.date}</span>
              </div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-slate-500 flex items-center gap-3">
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="truncate">{event.venue}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-900">
                VIEW EVENT
              </span>
              <motion.div 
                variants={{ hover: { x: 4, y: -4 } }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-500 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-colors"
              >
                <ArrowUpRight size={14} />
              </motion.div>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
