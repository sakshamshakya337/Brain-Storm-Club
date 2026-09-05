import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import ProtectedImage from '../../components/common/ProtectedImage';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';

// ─── Role Configuration ────────────────────────────────────────────────────────
// ─── Domain & Lead Configuration ──────────────────────────────────────────────
// Canonical domain sequence
const DOMAIN_ORDER = [
  'Faculty',
  'Leadership',
  'Technical',
  'Media',
  'Anchor',
  'Coordinator',
];

// Curated domain metadata
const DOMAIN_METADATA = {
  Faculty: {
    title: 'Faculty & Mentors',
    badge: 'Advisory',
    leadBadge: 'Faculty Lead',
  },
  Leadership: {
    title: 'Leadership & Executive',
    badge: 'Executive',
    leadBadge: 'President / Lead',
  },
  Technical: {
    title: 'Technical Domain',
    badge: 'Engineering',
    leadBadge: 'Technical Head',
  },
  Media: {
    title: 'Media & Creative',
    badge: 'Creative & PR',
    leadBadge: 'Media Head',
  },
  Anchor: {
    title: 'Anchor & Public Relations',
    badge: 'PR & Stage',
    leadBadge: 'Anchor Head',
  },
  Coordinator: {
    title: 'Event & Logistics Coordination',
    badge: 'Operations',
    leadBadge: 'Head Coordinator',
  },
};

const FACULTY_KEYWORDS = [
  'faculty',
  'founder',
  'hos',
  'head of school',
  'cos',
  'chief of school',
  'dean',
  'associate dean',
  'advisor',
  'coordinator',
  'professor',
  'mentor',
];

// Lead/Head priority within each domain to identify the primary featured member
const DOMAIN_LEAD_PRIORITIES = {
  Faculty: ['hos', 'head of school', 'founder', 'cos', 'chief of school', 'dean', 'advisor', 'coordinator', 'faculty'],
  Leadership: ['president', 'vice president', 'secretary', 'head coordinator', 'executive'],
  Technical: ['technical head', 'tech head', 'lead developer', 'technical lead', 'technical team'],
  Media: ['social media head', 'media head', 'creative head', 'media team'],
  Anchor: ['anchor head', 'lead anchor', 'anchor'],
  Coordinator: ['head coordinator', 'lead coordinator', 'coordinator'],
};

/**
 * Normalise and resolve the canonical domain for a member.
 * Inspects memberType, explicit domain, and role heuristics.
 */
const resolveMemberDomain = (member) => {
  const rawRole = (member.role || '').trim().toLowerCase();
  const rawDomain = (member.domain || '').trim().toLowerCase();

  // 1. Faculty check
  if (
    member.memberType === 'faculty' ||
    FACULTY_KEYWORDS.some((k) => rawRole.includes(k) || rawDomain.includes(k))
  ) {
    return 'Faculty';
  }

  // 2. Executive / Leadership
  if (
    rawDomain === 'executive' ||
    rawDomain === 'leadership' ||
    rawRole.includes('president') ||
    rawRole.includes('secretary') ||
    rawRole.includes('vice president') ||
    rawRole === 'vp'
  ) {
    return 'Leadership';
  }

  // 3. Technical
  if (rawDomain.includes('tech') || rawRole.includes('tech')) {
    return 'Technical';
  }

  // 4. Media
  if (
    rawDomain.includes('media') ||
    rawRole.includes('media') ||
    rawRole.includes('social')
  ) {
    return 'Media';
  }

  // 5. Anchor
  if (
    rawDomain.includes('anchor') ||
    rawRole.includes('anchor') ||
    rawRole.includes('host')
  ) {
    return 'Anchor';
  }

  // 6. Coordinator
  if (rawDomain.includes('coord') || rawRole.includes('coord')) {
    return 'Coordinator';
  }

  // 7. Explicit domain if present
  if (member.domain && member.domain.trim()) {
    const d = member.domain.trim();
    return d.charAt(0).toUpperCase() + d.slice(1);
  }

  // Fallback
  return 'Leadership';
};

/**
 * Hierarchy score within a domain to detect Head / Lead member.
 * Lower score = higher rank.
 */
const getDomainLeadScore = (member, domainKey) => {
  const role = (member.role || '').trim().toLowerCase();
  const priorities = DOMAIN_LEAD_PRIORITIES[domainKey] || [];

  for (let i = 0; i < priorities.length; i++) {
    if (role.includes(priorities[i])) return i;
  }

  // Generic keyword match
  if (role.includes('head') || role.includes('chief') || role.includes('president')) return 10;
  if (role.includes('lead') || role.includes('director')) return 20;
  if (role.includes('vice')) return 30;
  if (role.includes('coordinator')) return 40;
  if (role.includes('team') || role.includes('member')) return 80;

  return 99;
};

/**
 * Group members into domain sections, identify the lead in each domain,
 * and sort remaining members by hierarchy.
 */
const groupAndRankMembers = (members) => {
  const domainMap = {};

  members.forEach((m) => {
    const domain = resolveMemberDomain(m);
    if (!domainMap[domain]) domainMap[domain] = [];
    domainMap[domain].push(m);
  });

  const domainSections = [];

  Object.entries(domainMap).forEach(([domainKey, domainMemberList]) => {
    // Sort members within this domain so the primary Lead/Head is at index 0
    const sorted = [...domainMemberList].sort((a, b) => {
      const scoreA = getDomainLeadScore(a, domainKey);
      const scoreB = getDomainLeadScore(b, domainKey);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return (a.fullName || '').localeCompare(b.fullName || '');
    });

    const leadMember = sorted[0];
    const supportingMembers = sorted.slice(1);

    const meta = DOMAIN_METADATA[domainKey] || {
      title: `${domainKey} Team`,
      badge: 'Domain',
      leadBadge: `${domainKey} Lead`,
    };

    domainSections.push({
      key: domainKey,
      title: meta.title,
      badge: meta.badge,
      leadBadge: meta.leadBadge,
      leadMember,
      supportingMembers,
      totalCount: sorted.length,
    });
  });

  // Sort domain sections according to DOMAIN_ORDER
  domainSections.sort((a, b) => {
    const ia = DOMAIN_ORDER.indexOf(a.key);
    const ib = DOMAIN_ORDER.indexOf(b.key);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.title.localeCompare(b.title);
  });

  return domainSections;
};

// ─── Featured Member Card (Lead / Head) ────────────────────────────────────────
function FeaturedMemberCard({ member, isSolo = false }) {
  const imageId = member.photoId?.imageId || null;

  return (
    <div
      className={`bg-white dark:bg-slate-900 border-2 border-brand-primary/40 dark:border-brand-primary/30 flex flex-col group hover:border-brand-primary dark:hover:border-brand-primary transition-all duration-500 shadow-lg dark:shadow-2xl dark:shadow-brand-primary/5 rounded-sm relative overflow-hidden ${
        isSolo ? 'w-full max-w-md mx-auto sm:mx-0' : 'w-full'
      }`}
    >
      {/* Top Banner Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary z-20" />

      {/* Subtle Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

      {/* Image Block (Large aspect 4/5) */}
      <div className="relative z-10 w-full aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-950">
        <ProtectedImage
          imageId={imageId}
          variant="member_card"
          alt={member.fullName}
          className="w-full h-full object-cover mix-blend-luminosity opacity-90 group-hover:mix-blend-normal group-hover:scale-[1.03] transition-all duration-700"
        />

        {/* Lead Badge Floating on Image */}
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase text-white bg-brand-primary/95 backdrop-blur-md px-2.5 py-1 rounded-sm shadow-md border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Lead / Head
          </span>
        </div>
      </div>

      {/* Content Block */}
      <div className="relative z-10 flex flex-col flex-grow p-6 sm:p-7">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-brand-secondary bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 inline-block">
            {member.role || 'Domain Lead'}
          </span>
        </div>

        <h3 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-slate-900 dark:text-white mb-2 group-hover:text-brand-primary transition-colors leading-tight">
          {member.fullName}
        </h3>

        {member.memberType === 'faculty' ? (
          <span className="font-body text-sm text-slate-600 dark:text-slate-400 font-light">
            {member.designation
              ? member.department
                ? `${member.designation} • ${member.department}`
                : member.designation
              : member.department || 'Faculty Mentor'}
          </span>
        ) : (
          member.course && (
            <span className="font-body text-sm text-slate-600 dark:text-slate-400 font-light">
              {member.course}
              {member.section ? ` • Sec ${member.section}` : ''}
            </span>
          )
        )}
      </div>
    </div>
  );
}

// ─── Supporting Member Card ───────────────────────────────────────────────────
function SupportingMemberCard({ member }) {
  const imageId = member.photoId?.imageId || null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col group hover:border-brand-primary/60 dark:hover:bg-slate-900/90 transition-all duration-300 shadow-sm dark:shadow-none rounded-sm relative overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

      {/* Image Block */}
      <div className="relative z-10 w-full aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-950">
        <ProtectedImage
          imageId={imageId}
          variant="member_card"
          alt={member.fullName}
          className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:scale-[1.04] transition-all duration-500"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-grow p-3.5 sm:p-4">
        <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-brand-secondary mb-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-0.5 inline-block w-max max-w-full truncate">
          {member.role || 'Member'}
        </span>
        <h4 className="font-heading font-bold text-base sm:text-lg uppercase tracking-tight text-slate-900 dark:text-white mb-1 group-hover:text-brand-primary transition-colors leading-tight truncate">
          {member.fullName}
        </h4>
        {member.memberType === 'faculty' ? (
          <span className="font-body text-xs font-light text-slate-500 dark:text-slate-400 truncate">
            {member.designation || member.department || 'Faculty'}
          </span>
        ) : (
          member.course && (
            <span className="font-body text-xs font-light text-slate-500 dark:text-slate-400 truncate">
              {member.course}
              {member.section ? ` • Sec ${member.section}` : ''}
            </span>
          )
        )}
      </div>
    </div>
  );
}

// ─── Domain Section ────────────────────────────────────────────────────────────
function DomainSection({ domain, index }) {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  const { title, badge, leadMember, supportingMembers, totalCount } = domain;
  const isSolo = supportingMembers.length === 0;
  const isPair = supportingMembers.length === 1;

  return (
    <div ref={sectionRef} className="mb-20 md:mb-28 last:mb-0">
      {/* Section Header */}
      <div
        data-reveal="up"
        className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-5 mb-8 sm:mb-10 gap-3"
      >
        <div>
          <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-primary mb-2 flex items-center gap-3">
            <span className="w-6 h-px bg-brand-primary/50" />
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span>{badge}</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="font-mono text-[10px] tracking-widest text-slate-500 dark:text-slate-400 font-bold uppercase flex items-center gap-2">
          <span>
            {totalCount} {totalCount === 1 ? 'Member' : 'Members'}
          </span>
          {!isSolo && (
            <span className="text-brand-primary">
              • 1 Lead + {supportingMembers.length} Supporting
            </span>
          )}
        </div>
      </div>

      {/* ── Case A: 1 member in this domain (Solo) ── */}
      {isSolo && (
        <div data-reveal="up" className="max-w-md">
          <FeaturedMemberCard member={leadMember} isSolo={true} />
        </div>
      )}

      {/* ── Case B: 2 members (Lead + 1 Supporting) ── */}
      {isPair && (
        <div
          data-reveal="up"
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 max-w-3xl"
        >
          <div>
            <FeaturedMemberCard member={leadMember} />
          </div>
          <div>
            <SupportingMemberCard member={supportingMembers[0]} />
          </div>
        </div>
      )}

      {/* ── Case C: 3 or more members (Lead + 2+ Supporting) ── */}
      {!isSolo && !isPair && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Featured Head Card */}
          <div
            data-reveal="up"
            className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24"
          >
            <FeaturedMemberCard member={leadMember} />
          </div>

          {/* Right: Supporting Members Grid */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div
              data-reveal="stagger-children"
              className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5"
            >
              {supportingMembers.map((member) => (
                <div key={member._id || member.id} className="h-full">
                  <SupportingMemberCard member={member} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Members() {
  const containerRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [groupedDomains, setGroupedDomains] = useState([]); // array of domain sections
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
          const sections = groupAndRankMembers(raw);
          setGroupedDomains(sections);
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

  usePageReveal(containerRef);
  useScrollReveal(containerRef, [groupedDomains.length]);

  // Hero preview members (first 4 approved members)
  const previewMembers = members.slice(0, 4);

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body">

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[60svh] md:min-h-[75svh] flex items-center pt-6 md:pt-10 pb-20 overflow-hidden border-b border-slate-200 dark:border-slate-800">
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
            <div className="col-span-1 lg:col-span-6 flex flex-col items-start">
              <div className="reveal-eyebrow font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary mb-8 border border-brand-primary/30 px-3 py-1.5 rounded-sm bg-brand-primary/5 flex gap-4">
                <span>LPU SCA</span>
                <span className="text-slate-400">/</span>
                <span>BRAINSTORM CLUB</span>
              </div>

              <h1 className="font-heading font-black text-[clamp(2.5rem,10vw,6rem)] leading-[0.9] tracking-tighter text-slate-900 dark:text-white mb-8 uppercase flex flex-col">
                <span className="overflow-hidden"><span className="reveal-heading-line block">MEET THE</span></span>
                <span className="overflow-hidden"><span className="reveal-heading-line block text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary">
                  MINDS
                </span></span>
                <span className="overflow-hidden"><span className="reveal-heading-line block">BEHIND</span></span>
                <span className="overflow-hidden pb-4"><span className="reveal-heading-line block">BRAINSTORM.</span></span>
              </h1>

              <p className="reveal-text font-body text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl font-light leading-relaxed">
                Meet the students, mentors and leaders who turn curiosity into experiments, and ideas into impact. A dedicated hierarchy ensuring continuous innovation.
              </p>
            </div>

            {/* Right — preview grid */}
            <div className="reveal-image col-span-1 lg:col-span-6 relative h-[400px] lg:h-[500px] w-full flex items-center justify-center p-6 lg:p-12">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-slate-800" data-reveal="stagger-children">
            {[
              { label: 'Active Members', value: members.length.toString().padStart(2, '0') },
              { label: 'Teams', value: groupedDomains.length.toString().padStart(2, '0') },
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
          ) : groupedDomains.length === 0 ? (
            <div className="flex justify-center items-center py-32">
              <div className="font-mono text-sm tracking-[0.2em] font-bold text-slate-500 dark:text-slate-400 uppercase">
                No active members found.
              </div>
            </div>
          ) : (
            groupedDomains.map((domain, idx) => (
              <DomainSection
                key={domain.key}
                domain={domain}
                index={idx}
              />
            ))
          )}

        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24 md:py-32 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] text-center flex flex-col items-center" data-reveal="up">
          <h2 className="font-heading font-black text-4xl md:text-6xl uppercase tracking-tight text-slate-900 dark:text-white mb-6">
            HAVE AN IDEA?
          </h2>
          <p className="font-body text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mb-12">
            Turn your curiosity into something real. The Brainstorm community is always looking for new builders.
          </p>
          <Link
            to="/ideas"
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
