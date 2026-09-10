import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedLine from '../common/AnimatedLine';

export default function PremiumCTA({ to, text, supportingText, variant = "secondary" }) {
  const isPrimary = variant === "primary";

  return (
    <motion.div 
      whileHover="hover"
      whileTap="tap"
      variants={{ tap: { scale: 0.98 } }}
      transition={{ type: "tween", duration: 0.1 }}
      className={`relative overflow-hidden inline-block rounded-[10px] ${
        isPrimary 
          ? "bg-[var(--ink)] text-white border border-transparent shadow-lg" 
          : "bg-transparent border border-[var(--border)] text-[var(--ink)]"
      }`}
    >
      <Link to={to} className="relative z-10 flex flex-col justify-center px-10 py-6 min-w-[280px]">
        {supportingText && (
          <span className={`font-mono text-[9px] font-bold tracking-[0.2em] uppercase mb-4 ${isPrimary ? 'text-slate-400' : 'text-slate-500'}`}>
            {supportingText}
          </span>
        )}
        
        <div className="flex items-center justify-between gap-8 group">
          <span className={`font-heading font-bold text-xl uppercase tracking-tight transition-colors ${
            isPrimary ? "text-white" : "text-[var(--ink)] group-hover:text-[var(--circuit)]"
          }`}>
            {text}
          </span>
          <motion.div
            variants={{
              hover: { x: 4, y: -4, rotate: 0 }
            }}
            initial={{ rotate: -15 }}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              isPrimary 
                ? "bg-[var(--circuit)] text-white" 
                : "bg-[var(--paper-dim)] text-[var(--ink)] border border-[var(--border)] group-hover:bg-[var(--circuit)] group-hover:text-white"
            }`}
          >
            <ArrowUpRight size={16} />
          </motion.div>
        </div>
        
        {/* Animated accent line on hover */}
        <div className={`absolute bottom-0 left-0 w-full h-0.5 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out ${isPrimary ? 'bg-[var(--spark)]' : 'bg-[var(--circuit)]'}`} />
      </Link>
    </motion.div>
  );
}
