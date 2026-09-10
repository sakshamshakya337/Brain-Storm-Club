import React from 'react';
import ProtectedImage from '../common/ProtectedImage';

export default function MemberCompactCard({ member, roleLabel }) {
  if (!member) return null;

  return (
    <div className="block">
      <div className="relative h-[220px] md:h-auto bg-slate-100 group overflow-hidden border border-slate-200 p-0 m-0">
        <ProtectedImage 
          imageId={member.photoId?.imageId} 
          alt={member.fullName} 
          variant="member_card"
          className="absolute inset-0 w-full h-full m-0 p-0 object-cover object-top transition-transform duration-700 ease-out" 
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent pointer-events-none p-0 m-0" />
        
        <div className="absolute bottom-4 left-4 text-white z-10 w-full pr-8 p-0 m-0">
          <span className="font-mono text-[9px] font-bold tracking-widest uppercase block mb-1 text-indigo-400">
            {roleLabel}
          </span>
          <h4 className="font-heading font-bold text-lg uppercase tracking-tight mb-1">
            {member.fullName}
          </h4>
          <p className="font-mono text-[9px] tracking-widest uppercase text-slate-400">
            {member.course} {member.year ? `(${member.year})` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
