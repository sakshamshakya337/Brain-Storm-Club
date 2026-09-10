import React from 'react';
import ProtectedImage from '../common/ProtectedImage';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemberCompactCard({ member, roleLabel }) {
  if (!member) return null;

  return (
    <motion.div 
      whileHover="hover"
      className="relative h-[220px] md:h-auto bg-slate-100 group overflow-hidden border border-slate-200 cursor-pointer"
    >
      <ProtectedImage 
        imageId={member.photoId?.imageId} 
        alt={member.fullName} 
        variant="member_card"
        className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.03]" 
        style={{ objectPosition: 'center top' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent pointer-events-none" />
      
      <div className="absolute bottom-4 left-4 text-white z-10 w-full pr-8">
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

      {/* Hover Arrow */}
      <motion.div 
        variants={{
          hover: { x: -4, y: 4, opacity: 1 }
        }}
        initial={{ x: 10, y: -10, opacity: 0 }}
        className="absolute top-4 right-4 text-white"
      >
        <ArrowUpRight size={16} />
      </motion.div>
    </motion.div>
  );
}
