import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMemberBySlug, TEAM_MEMBERS } from '../../data/members';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import Footer from '../../components/layout/Footer';

export default function MemberDetail() {
  const { slug } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when loading new member
    window.scrollTo(0, 0);
    const foundMember = getMemberBySlug(slug);
    setMember(foundMember);
    setLoading(false);
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-bg-primary"></div>;

  if (!member) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center font-body text-slate-900 dark:text-slate-300">
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-4 border border-slate-200 dark:border-slate-800 px-3 py-1">ERROR 404</span>
        <h1 className="font-heading font-black text-4xl mb-6">MEMBER NOT FOUND</h1>
        <Link to="/members" className="font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:text-brand-primary transition-colors">
          <ArrowLeft size={14} /> Back to Members
        </Link>
      </div>
    );
  }

  // Get 3 random related members (excluding current)
  const relatedMembers = TEAM_MEMBERS.filter(m => m.id !== member.id).slice(0, 3);

  return (
    <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body">
      
      {/* HERO SECTION */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          
          {/* Breadcrumb */}
          <div className="mb-12 font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold flex flex-wrap items-center gap-2">
            <Link to="/members" className="hover:text-brand-primary transition-colors">Members</Link>
            <span>/</span>
            <span className="text-slate-400">{member.group}</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">{member.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 lg:gap-16">
            {/* LEFT: Meta & Title */}
            <div className="flex flex-col justify-center min-w-0 max-w-full break-words">
              <div className="flex gap-3 mb-6">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-secondary border border-slate-200 dark:border-slate-800 px-3 py-1.5 bg-white/50 dark:bg-slate-900/50">
                  {member.role}
                </span>
              </div>
              
              <h1 className="font-heading font-black text-[clamp(2.75rem,8vw,5rem)] lg:text-[clamp(3.5rem,5vw,6.5rem)] leading-[0.9] tracking-tighter uppercase mb-6 text-slate-900 dark:text-white max-w-full">
                {member.name}
              </h1>
              
              {member.course && (
                 <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-8 border border-slate-200 dark:border-slate-800 px-3 py-1.5 inline-block w-max">
                   {member.course}
                 </div>
              )}
              
              {member.bio && (
                <p className="font-body text-lg text-slate-600 dark:text-slate-400 font-light mb-12 max-w-xl">
                  {member.bio}
                </p>
              )}
            </div>

            {/* RIGHT: Hero Image */}
            <div className="relative min-w-0 max-w-full overflow-hidden flex lg:justify-end items-center">
              <div className="w-full lg:w-[80%] aspect-[4/5] max-h-[600px] relative overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-sm">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA / RELATED */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
            <h3 className="font-heading font-bold text-3xl uppercase tracking-tight text-slate-900 dark:text-white">
              MORE FROM BRAINSTORM
            </h3>
            <Link to="/members" className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-3 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-2 group whitespace-nowrap">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO MEMBERS
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedMembers.map(related => (
              <Link 
                key={related.id} 
                to={`/members/${related.slug}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col group hover:border-brand-primary/50 dark:hover:bg-bg-elevated transition-colors shadow-sm dark:shadow-none rounded-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 w-full aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-950 mb-6">
                  <img src={related.image} alt={related.name} className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:scale-[1.03] transition-all duration-700" />
                </div>
                <div className="relative z-10 font-mono text-[10px] font-bold tracking-widest uppercase text-brand-secondary mb-2">{related.role}</div>
                <h4 className="relative z-10 font-heading font-bold text-2xl uppercase tracking-tight text-slate-900 dark:text-white mb-6 group-hover:text-brand-primary transition-colors">{related.name}</h4>
                <div className="relative z-10 border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between items-center font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold group-hover:text-brand-primary transition-colors">
                  VIEW PROFILE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
