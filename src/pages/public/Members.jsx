import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';
import ProtectedImage from '../../components/common/ProtectedImage';

gsap.registerPlugin(ScrollTrigger);

// ─── Role Configuration ────────────────────────────────────────────────────────
// Defines the display order and canonical display names for each role key.
// Roles in DB are matched case-insensitively against these keys.
// Roles NOT in this list still appear — they are appended alphabetically at the end.
const ROLE_ORDER = [
  'HOS',
  'Faculty',
  'President',
  'Vice President',
  'Head Coordinator',
  'Technical Head',
  'Social Media Head',
  'Coordinator',
  'Technical Team',
  'Media Team',
  'Anchor',
];

/**
 * Normalise a raw role string so that minor capitalisation differences
 * ("technical team" vs "Technical Team") resolve to the same bucket.
 */
const normaliseRole = (rawRole) => {
  if (!rawRole) return 'Member';
  const trimmed = rawRole.trim();
  // Try to find a canonical match (case-insensitive)
  const canonical = ROLE_ORDER.find(
    (r) => r.toLowerCase() === trimmed.toLowerCase()
  );
  return canonical || trimmed; // If unknown, preserve as-is (with original casing)
};

/**
 * Sort role names according to ROLE_ORDER; unknowns go at the end alphabetically.
 */
const sortRoles = (roleA, roleB) => {
  const ia = ROLE_ORDER.findIndex((r) => r.toLowerCase() === roleA.toLowerCase());
  const ib = ROLE_ORDER.findIndex((r) => r.toLowerCase() === roleB.toLowerCase());
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return roleA.localeCompare(roleB);
};

/**
 * Group members by their normalised role.
 * Returns an array of [roleName, members[]] pairs sorted by ROLE_ORDER.
 */
const groupMembersByRole = (members) => {
  const map = {};
  members.forEach((m) => {
    const role = normaliseRole(m.role);
    if (!map[role]) map[role] = [];
    map[role].push(m);
  });
  return Object.entries(map).sort(([a], [b]) => sortRoles(a, b));
};

// ─── Member Card ───────────────────────────────────────────────────────────────
function MemberCard({ member }) {
  const imageId = member.photoId?.imageId || null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col group hover:border-brand-primary/50 dark:hover:bg-bg-elevated transition-colors shadow-sm dark:shadow-none rounded-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Image Block */}
      <div className="relative z-10 w-full aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-950">
        <ProtectedImage
          imageId={imageId}
          variant="member_card"
          alt={member.fullName}
          className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:scale-[1.03] transition-all duration-700"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-grow p-5">
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-secondary mb-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-1 inline-block w-max">
          {member.role || 'Member'}
        </span>
        <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-slate-900 dark:text-white mb-1 group-hover:text-brand-primary transition-colors leading-tight">
          {member.fullName}
        </h3>
        {member.course && (
          <span className="font-body text-sm font-light text-slate-500">
            {member.course}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Role Section ──────────────────────────────────────────────────────────────
function RoleSection({ roleName, members, index }) {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const header = sectionRef.current.querySelector('.role-header');
    const cards = sectionRef.current.querySelectorAll('.member-card');

    gsap.fromTo(
      header,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );

    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cards[0],
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="mb-20 last:mb-0">
      {/* Section Header */}
      <div className="role-header flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-10 gap-4">
        <div>
          <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-primary mb-3 flex items-center gap-3">
            <span className="w-6 h-px bg-brand-primary/50" />
            {String(index + 1).padStart(2, '0')}
          </div>
          <h2 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight text-slate-900 dark:text-white">
            {roleName}
          </h2>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-slate-400 font-bold uppercase">
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {members.map((member) => (
          <div key={member._id || member.id} className="member-card">
            <MemberCard member={member} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Members() {
  const heroRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [groupedMembers, setGroupedMembers] = useState([]); // array of [role, members[]]
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/public/members')
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          const raw = data.data.members || [];
          setMembers(raw);
          setGroupedMembers(groupMembersByRole(raw));
        } else {
          setError(data.message || 'Failed to load members');
        }
      })
      .catch((err) => {
        console.error('Members fetch error:', err);
        setError('Unable to load members right now.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Hero entrance animation
  useGSAP(() => {
    if (!heroRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      heroRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
    );
  }, { scope: heroRef });

  // Hero preview members (first 4 approved members)
  const previewMembers = members.slice(0, 4);

  return (
    <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body">

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[60vh] md:min-h-[75vh] flex items-center pt-32 pb-20 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div
          className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left — text */}
            <div ref={heroRef} className="col-span-1 lg:col-span-6 flex flex-col items-start">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary mb-8 border border-brand-primary/30 px-3 py-1.5 rounded-sm bg-brand-primary/5 flex gap-4">
                <span>LPU SCA</span>
                <span className="text-slate-400">/</span>
                <span>BRAINSTORM CLUB</span>
              </div>

              <h1 className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-tighter text-slate-900 dark:text-white mb-8 uppercase">
                MEET THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary">
                  MINDS
                </span>{' '}
                <br />
                BEHIND <br />
                BRAINSTORM.
              </h1>

              <p className="font-body text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl font-light leading-relaxed">
                Meet the students, mentors and leaders who turn curiosity into experiments, and ideas into impact. A dedicated hierarchy ensuring continuous innovation.
              </p>
            </div>

            {/* Right — preview grid */}
            <div className="col-span-1 lg:col-span-6 relative h-[400px] lg:h-[500px] w-full flex items-center justify-center p-6 lg:p-12">
              <div className="absolute inset-0 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 overflow-hidden rounded-sm flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
                <div className="relative z-10 w-full max-w-md p-8 grid grid-cols-2 gap-4">
                  {previewMembers.length > 0
                    ? previewMembers.map((member, i) => (
                        <div
                          key={member._id || i}
                          className="aspect-square border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center relative overflow-hidden group shadow-sm"
                        >
                          <ProtectedImage
                            imageId={member.photoId?.imageId}
                            variant="member_card"
                            alt={member.fullName}
                            className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 group-hover:opacity-80 group-hover:mix-blend-normal transition-all duration-500 group-hover:scale-105"
                          />
                          <div className="absolute w-full h-full bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" />
                          <div className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-2 py-1 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                            <span className="font-mono text-[8px] font-bold text-slate-900 dark:text-white uppercase truncate">
                              {member.fullName}
                            </span>
                            <span className="font-mono text-[8px] text-brand-primary font-bold">
                              0{i + 1}
                            </span>
                          </div>
                        </div>
                      ))
                    : // Skeleton placeholders while loading
                      Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 animate-pulse"
                        />
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATISTICS STRIP ── */}
      <section className="py-12 bg-slate-900 dark:bg-[#050914] text-white border-b border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-slate-800">
            {[
              { label: 'Active Members', value: members.length.toString().padStart(2, '0') },
              { label: 'Teams', value: groupedMembers.length.toString().padStart(2, '0') },
              { label: 'Projects', value: '12+' },
              { label: 'Events Hosted', value: '20+' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center px-4">
                <span className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tighter text-white mb-2">
                  {stat.value}
                </span>
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-secondary">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIRECTORY SECTION ── */}
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/20">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">

          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <div className="font-mono text-sm tracking-[0.2em] font-bold text-brand-primary uppercase animate-pulse">
                Loading Directory…
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-32">
              <div className="font-mono text-sm tracking-[0.2em] font-bold text-red-500 uppercase border border-red-500/20 bg-red-500/5 px-6 py-4 rounded-sm">
                {error}
              </div>
            </div>
          ) : groupedMembers.length === 0 ? (
            <div className="flex justify-center items-center py-32">
              <div className="font-mono text-sm tracking-[0.2em] font-bold text-slate-500 uppercase">
                No active members found.
              </div>
            </div>
          ) : (
            groupedMembers.map(([roleName, roleMembers], idx) => (
              <RoleSection
                key={roleName}
                roleName={roleName}
                members={roleMembers}
                index={idx}
              />
            ))
          )}

        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24 md:py-32 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] text-center flex flex-col items-center">
          <h2 className="font-heading font-black text-4xl md:text-6xl uppercase tracking-tight text-slate-900 dark:text-white mb-6">
            HAVE AN IDEA?
          </h2>
          <p className="font-body text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mb-12">
            Turn your curiosity into something real. The Brainstorm community is always looking for new builders.
          </p>
          <Link
            to="/join-us"
            className="bg-slate-900 dark:bg-brand-primary text-white px-10 py-5 rounded-full font-mono text-sm font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-xl shadow-brand-primary/20"
          >
            SUBMIT AN IDEA
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
