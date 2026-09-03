import React from 'react';

export default function EventStatus({ status }) {
  const colors = {
    'UPCOMING': 'text-brand-accent border-brand-accent bg-brand-accent/10',
    'ONGOING': 'text-brand-primary border-brand-primary bg-brand-primary/10',
    'COMPLETED': 'text-slate-500 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900',
  };
  
  return (
    <span className={`font-mono text-[10px] font-bold tracking-widest uppercase border px-2 py-1 ${colors[status]}`}>
      {status}
    </span>
  );
}
