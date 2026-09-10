import React from 'react';

export default function TechnicalLabel({ text, className = "" }) {
  return (
    <div className={`font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500 border border-slate-200 px-3 py-1.5 rounded-sm bg-white/50 backdrop-blur-sm mb-8 flex items-center gap-2 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
      {text}
    </div>
  );
}
