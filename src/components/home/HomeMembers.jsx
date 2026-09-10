import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProtectedImage from '../common/ProtectedImage';

gsap.registerPlugin(ScrollTrigger);

function LeaderFeaturedCard({ member }) {
  if (!member) return null;
  return (
    <div className="relative w-full h-full min-h-[700px] bg-slate-100 group overflow-hidden border border-slate-200">
      <ProtectedImage
        imageId={member.photoId?.imageId}
        alt={member.fullName}
        variant="member_card"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
        style={{ objectPosition: 'center 10%' }}
      />
      {/* Bottom dark gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent pointer-events-none" />

      {/* Featured badge */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse flex-shrink-0"></span>
        <span className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-white/60">FEATURED</span>
      </div>

      {/* Info block at bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-16 z-10 bg-gradient-to-t from-slate-950/90 to-transparent">
        <span className="font-mono text-[11px] font-bold tracking-widest uppercase block mb-2 text-indigo-400">
          {member.role || 'President'}
        </span>
        <h4 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-white leading-none mb-2">
          {member.fullName}
        </h4>
        {(member.course || member.year) && (
          <p className="font-mono text-[10px] tracking-widest uppercase text-slate-400 mt-1">
            {member.course}{member.year ? ` · ${member.year}` : ''}
          </p>
        )}
        <div className="mt-5 w-10 h-[2px] bg-indigo-500 group-hover:w-20 transition-all duration-500 ease-out" />
      </div>
    </div>
  );
}

function LeaderCompactCard({ member, roleLabel }) {
  if (!member) return null;
  return (
    <div className="relative bg-slate-100 group overflow-hidden border border-slate-200 h-[320px]">
      <ProtectedImage
        imageId={member.photoId?.imageId}
        alt={member.fullName}
        variant="member_card"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        style={{ objectPosition: 'center 8%' }}
      />
      {/* Very subtle top fade so face is fully visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent pointer-events-none" />

      {/* Text panel at bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10 z-10 bg-gradient-to-t from-slate-950/95 to-transparent">
        <span className="font-mono text-[9px] font-bold tracking-[0.25em] uppercase block mb-1 text-indigo-400">
          {roleLabel}
        </span>
        <h4 className="font-heading font-bold text-xl uppercase tracking-tight text-white leading-tight">
          {member.fullName}
        </h4>
      </div>
    </div>
  );
}

export default function HomeMembers({ isMembersLoading, liveMembers, president, supportingSlots }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    const section = containerRef.current;
    if (!section) return;

    gsap.fromTo('.members-spark-connector',
      { scaleY: 0 },
      {
        scaleY: 1, duration: 1.5, ease: 'power2.out', transformOrigin: 'top',
        scrollTrigger: { trigger: '.members-spark-connector', start: 'top 70%', scrub: true }
      }
    );

    const cards = gsap.utils.toArray('.leader-card-anim', section);
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { y: 32, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.75, stagger: 0.1, ease: 'power3.out', clearProps: 'all',
          scrollTrigger: { trigger: section, start: 'top 82%', toggleActions: 'play none none none' }
        }
      );
    }
  }, { scope: containerRef, dependencies: [isMembersLoading, liveMembers, president, supportingSlots] });

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-[var(--paper)] border-b border-[var(--border)] relative">
      <div className="absolute top-0 left-1/2 w-[1px] h-32 bg-gradient-to-b from-[var(--spark)] to-transparent members-spark-connector z-0" />

      <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] mb-3">Leadership</p>
            <h2 className="font-heading font-black text-4xl md:text-6xl uppercase tracking-tight text-[var(--ink)] leading-[0.88]">
              THE PEOPLE<br />BEHIND THE IDEAS.
            </h2>
          </div>
          <Link
            to="/members"
            className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-[var(--circuit)] hover:text-[var(--ink)] transition-colors uppercase group self-start md:self-auto whitespace-nowrap"
          >
            Meet The Full Team
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Loading skeleton */}
        {isMembersLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-4">
            <div className="h-[700px] bg-slate-100 animate-pulse border border-slate-200" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[338px] bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          </div>
        )}

        {/* Main grid */}
        {!isMembersLoading && liveMembers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-4 items-stretch">

            {/* President — tall left card */}
            {president && (
              <div className="leader-card-anim">
                <LeaderFeaturedCard member={president} />
              </div>
            )}

            {/* Supporting heads — 2×2 right side */}
            {supportingSlots.length > 0 && (
              <div className="grid grid-cols-2 grid-rows-2 gap-4">
                {supportingSlots.slice(0, 4).map((slot, i) => (
                  <div key={slot.member._id || i} className="leader-card-anim">
                    <LeaderCompactCard member={slot.member} roleLabel={slot.roleLabel} />
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Empty state */}
        {!isMembersLoading && liveMembers.length === 0 && (
          <div className="py-16 text-center font-mono text-sm tracking-widest uppercase text-[var(--ink-soft)] border-t border-[var(--border)]">
            NO MEMBERS FOUND
          </div>
        )}

      </div>
    </section>
  );
}