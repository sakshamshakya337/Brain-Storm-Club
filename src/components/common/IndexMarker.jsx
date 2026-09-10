import React from 'react';

export default function IndexMarker({ index, label, className = "" }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 ${className}`}>
      <span className="text-slate-300">{index} /</span>
      <span className="text-slate-900">{label}</span>
    </div>
  );
}
