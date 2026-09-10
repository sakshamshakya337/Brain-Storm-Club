import React from 'react';
import ProtectedImage from '../common/ProtectedImage';

export default function MemberFeaturedCard({ member }) {
  if (!member) return null;
  
  return (
    <div className="md:col-span-6 relative h-[450px] md:h-[600px] bg-slate-100 group overflow-hidden border border-slate-200">
      <ProtectedImage 
        imageId={member.photoId?.imageId} 
        alt={member.fullName} 
        variant="member_card"
        className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out" 
        style={{ objectPosition: 'center top' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />
      
      {/* Editorial UI overlay */}
      <div className="absolute top-6 left-6 flex gap-2 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
        <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-white/70">FEATURED</span>
      </div>

      <div className="absolute bottom-8 left-8 text-white z-10">
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase block mb-2 text-indigo-400">
          {member.role || 'President'}
        </span>
        <h4 className="font-heading font-black text-4xl uppercase tracking-tight mb-2">
          {member.fullName}
        </h4>
        <p className="font-mono text-[10px] tracking-widest uppercase text-slate-300">
          {member.course} {member.year ? `(${member.year})` : ''}
        </p>
      </div>
      
      {/* Technical decorative lines */}
      <div className="absolute top-0 right-8 w-px h-16 bg-white/20" />
      <div className="absolute bottom-8 right-0 w-16 h-px bg-white/20" />
    </div>
  );
}
