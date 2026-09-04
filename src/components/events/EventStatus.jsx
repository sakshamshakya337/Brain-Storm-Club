import React from 'react';

export default function EventStatus({ status }) {
  const norm = (status || '').toUpperCase();
  const colors = {
    'UPCOMING': 'text-amber-600 dark:text-amber-400 border-amber-500/40 dark:border-amber-400/30 bg-amber-500/10 dark:bg-amber-400/10',
    'ONGOING': 'text-brand-primary dark:text-brand-secondary border-brand-primary/40 dark:border-brand-secondary/30 bg-brand-primary/10 dark:bg-brand-secondary/10',
    'COMPLETED': 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900',
    'PAST': 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900',
  };
  
  const colorClass = colors[norm] || 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900';
  
  return (
    <span className={`font-mono text-[10px] font-bold tracking-widest uppercase border px-2.5 py-1 rounded-[2px] ${colorClass}`}>
      {status || 'UPCOMING'}
    </span>
  );
}
