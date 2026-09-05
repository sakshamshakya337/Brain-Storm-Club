import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import ProtectedImage from '../../components/common/ProtectedImage';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';

// ─── Role Configuration ────────────────────────────────────────────────────────
// ─── Domain & Lead Configuration ──────────────────────────────────────────────
// Canonical domain sequence:
// 1. Faculty & Mentors
// 2. Leadership (President, Vice President, Secretary, Head Coordinator)
// 3. Technical Team (Technical Head + Technical Team)
// 4. Media & Creative Team (Media Head + Media Team)
// 5. Anchor Section
// 6. Event Coordinators
const DOMAIN_ORDER = [
  'Faculty',
  'President',
  'Secretariat',
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
  President: {
    title: 'President & Vice President',
    badge: 'Leadership',
    leadBadge: 'President',
  },
  Secretariat: {
    title: 'Secretariat',
    badge: 'Executive',
    leadBadge: 'Secretary',
  },
  Technical: {
    title: 'Technical Team',
    badge: 'Engineering',
    leadBadge: 'Technical Head',
  },
  Media: {
    title: 'Media & Creative Team',
    badge: 'Creative & PR',
    leadBadge: 'Media Head',
  },
  Anchor: {
    title: 'Anchor Section',
    badge: 'PR & Stage',
    leadBadge: 'Anchor Head',
  },
  Coordinator: {
    title: 'Event Coordinators',
    badge: 'Operations',
    leadBadge: 'Lead Coordinator',
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
  'professor',
  'mentor',
  'faculty advisor',
  'faculty coordinator',
];

// Lead/Head priority within each domain to identify the primary featured member
const DOMAIN_LEAD_PRIORITIES = {
  Faculty: [
    'hos',
    'head of school',
    'cos',
    'chief of school',
    'founder',
    'dean',
    'associate dean',
    'faculty advisor',
    'advisor',
    'faculty coordinator',
    'faculty',
    'mentor',
    'professor',
  ],
  President: [
    'president',
    'vice president',
    'vp',
  ],
  Secretariat: [
    'secretary',
  ],
  Technical: [
    'technical head',
    'tech head',
    'technical lead',
    'tech lead',
    'lead developer',
    'technical team',
    'tech',
  ],
  Media: [
    'social media head',
    'media head',
    'creative head',
    'media lead',
    'media team',
    'media',
  ],
  Anchor: ['anchor head', 'lead anchor', 'anchor'],
  Coordinator: [
    'head coordinator',
    'head coord',
    'coordinator',
  ],
};

/**
 * shouldShowTag — single source of truth for upper image tag visibility and featured eligibility.
 * Returns true ONLY for:
 *   - Faculty members (memberType === 'faculty') with a qualifying head/lead role
 *   - Student members whose role matches a head/lead keyword
 */
const shouldShowTag = (member) => {
  const role = (member.role || '').trim().toLowerCase();
  if (!role) return false;

  // STRICT RULE: Regular coordinators can NEVER be featured/tagged.
  if (
    role === 'coordinator' ||
    role === 'senior coordinator' ||
    role === 'lead coordinator' ||
    role === 'event coordinator'
  ) {
    return false;
  }

  // STRICT RULE: Regular anchors can NEVER be featured/tagged.
  if (role === 'anchor') {
    return false;
  }

  if (member.memberType === 'faculty') {
    const LEADERSHIP_FACULTY_KEYWORDS = [
      'hos', 'head of school', 'cos', 'chief of school', 'founder',
      'dean', 'associate dean', 'faculty advisor', 'faculty coordinator'
    ];
    return LEADERSHIP_FACULTY_KEYWORDS.some((k) => role.includes(k));
  }

  const HEAD_ROLE_KEYWORDS = [
    'president', 'vice president', 'vp', 'secretary', 'head coordinator', 'head coord',
    'technical head', 'tech head', 'technical lead', 'tech lead',
    'social media head', 'media head', 'creative head', 'media lead',
    'anchor head', 'lead anchor'
  ];

  return HEAD_ROLE_KEYWORDS.some((k) => role.includes(k));
};

/**
 * Normalise and resolve the canonical section for a member.
 * Inspects memberType, explicit domain, and role heuristics.
 */
const resolveMemberDomain = (member) => {
  const role = (member.role || '').trim().toLowerCase();
  const domain = (member.domain || '').trim().toLowerCase();
  const memberType = (member.memberType || '').trim().toLowerCase();

  // 1. Faculty check
  if (
    memberType === 'faculty' ||
    (memberType !== 'student' &&
      FACULTY_KEYWORDS.some((k) => role.includes(k) || domain.includes(k)))
  ) {
    return 'Faculty';
  }

  // 2. President section — ONLY President and Vice President
  if (
    role === 'president' ||
    (role.includes('president') && !role.includes('vice')) ||
    role.includes('vice president') ||
    role.includes('vice-president') ||
    role === 'vp' ||
    domain === 'president'
  ) {
    return 'President';
  }

  // 3. Secretariat — Secretary only
  if (
    role.includes('secretary') ||
    domain === 'secretariat' ||
    domain === 'executive'
  ) {
    return 'Secretariat';
  }

  // 3. Anchor Section
  if (
    role.includes('anchor') ||
    domain.includes('anchor') ||
    role.includes('host')
  ) {
    return 'Anchor';
  }

  // 4. Technical (Technical Head + Technical Team)
  if (
    role.includes('tech') ||
    domain.includes('tech') ||
    role.includes('developer') ||
    role.includes('coding')
  ) {
    return 'Technical';
  }

  // 5. Media (Media Head + Media Team)
  if (
    role.includes('media') ||
    domain.includes('media') ||
    role.includes('social') ||
    role.includes('creative') ||
    role.includes('design')
  ) {
    return 'Media';
  }

  // 6. Coordinators
  if (role.includes('coord') || domain.includes('coord')) {
    return 'Coordinator';
  }

  // 7. Explicit domain match if present
  if (member.domain && member.domain.trim()) {
    const d = member.domain.trim().toLowerCase();
    if (d === 'leadership' || d === 'president') return 'President';
    if (d === 'executive' || d === 'secretariat') return 'Secretariat';
    if (d.includes('tech')) return 'Technical';
    if (d.includes('media')) return 'Media';
    if (d.includes('anchor')) return 'Anchor';
    if (d.includes('coord')) return 'Coordinator';
  }

  // Fallback
  return 'Coordinator';
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

  Object.entries(domainMap).forEach(([domainKey, list]) => {
    const sorted = [...list].sort((a, b) => {
      const sa = getDomainLeadScore(a, domainKey);
      const sb = getDomainLeadScore(b, domainKey);
      if (sa !== sb) return sa - sb;
      return (a.fullName || '').localeCompare(b.fullName || '');
    });

    let lead = null;
    let supporting = [];

    const potentialLead = sorted[0];
    if (potentialLead && shouldShowTag(potentialLead)) {
      lead = potentialLead;
      supporting = sorted.slice(1);
    } else {
      lead = null;
      supporting = sorted;
    }

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
      leadMember: lead,
      supportingMembers: supporting,
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

// ─── Shared Upper Image Role Tag Component ─────────────────────────────────────
function MemberRoleOverlay({ role }) {
  if (!role) return null;

  return (
    <div className="absolute top-2.5 left-2.5 z-30 max-w-[calc(100%-20px)] pointer-events-none select-none">
      <span
        className="inline-flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase text-white px-2.5 py-1 rounded-sm shadow-md border border-slate-700/60 dark:border-white/20"
        style={{ backgroundColor: '#0a0f1e' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse shadow-sm shadow-emerald-400/50" />
        <span className="truncate">{role}</span>
      </span>
    </div>
  );
}

// ─── Featured Member Card (Lead / Head) ────────────────────────────────────────
function FeaturedMemberCard({ member, isSolo = false, leadBadge }) {
  const imageId = member.photoId?.imageId || null;
  const displayBadge = member.role || leadBadge || 'Lead / Head';
  const showTag = shouldShowTag(member);

  return (
    <div
      className={`bg-white dark:bg-slate-900 border-2 border-brand-primary/40 dark:border-brand-primary/30 flex flex-col group hover:border-brand-primary dark:hover:border-brand-primary transition-all duration-500 shadow-lg dark:shadow-2xl dark:shadow-brand-primary/5 rounded-sm relative overflow-hidden w-full sm:max-w-[310px] md:max-w-[330px] ${
        isSolo ? 'sm:mx-auto lg:mx-0' : ''
      }`}
    >
      {/* Top Banner Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-secondary z-20" />

      {/* Subtle Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

      {/* Image Block (aspect 4/5) */}
      <div className="relative z-10 w-full aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-950">
        <ProtectedImage
          imageId={imageId}
          variant="member_card"
          alt={member.fullName}
          className="w-full h-full object-cover object-center opacity-90 group-hover:scale-[1.03] transition-all duration-700"
        />

        {/* Upper Image Role / Status Tag */}
        {showTag && <MemberRoleOverlay role={displayBadge} />}
      </div>

      {/* Content Block */}
      <div className="relative z-10 flex flex-col flex-grow p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-secondary bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 inline-block">
            {member.role || leadBadge || 'Domain Lead'}
          </span>
        </div>

        <h3 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-tight text-slate-900 dark:text-white mb-1.5 group-hover:text-brand-primary transition-colors leading-tight">
          {member.fullName}
        </h3>

        {member.memberType === 'faculty' ? (
          <span className="font-body text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light">
            {member.designation
              ? member.department
                ? `${member.designation} • ${member.department}`
                : member.designation
              : member.department || 'Faculty Mentor'}
          </span>
        ) : (
          member.course && (
            <span className="font-body text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light">
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
  const displayBadge = member.role || 'Member';
  const showTag = shouldShowTag(member);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col group hover:border-brand-primary/60 dark:hover:bg-slate-900/90 transition-all duration-300 shadow-sm dark:shadow-none rounded-sm relative overflow-hidden w-full sm:max-w-[240px]">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

      {/* Image Block */}
      <div className="relative z-10 w-full aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-950">
        <ProtectedImage
          imageId={imageId}
          variant="member_card"
          alt={member.fullName}
          className="w-full h-full object-cover object-center opacity-80 group-hover:scale-[1.04] transition-all duration-500"
        />

        {/* Upper Image Role / Status Tag */}
        {showTag && <MemberRoleOverlay role={displayBadge} />}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-grow p-2.5 sm:p-3">
        <span className="font-mono text-[8.5px] sm:text-[9px] font-bold tracking-widest uppercase text-brand-secondary mb-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-0.5 inline-block w-max max-w-full truncate">
          {member.role || 'Member'}
        </span>
        <h4 className="font-heading font-bold text-sm sm:text-base uppercase tracking-tight text-slate-900 dark:text-white mb-0.5 group-hover:text-brand-primary transition-colors leading-tight truncate">
          {member.fullName}
        </h4>
        {member.memberType === 'faculty' ? (
          <span className="font-body text-[11px] sm:text-xs font-light text-slate-500 dark:text-slate-400 truncate">
            {member.designation || member.department || 'Faculty'}
          </span>
        ) : (
          member.course && (
            <span className="font-body text-[11px] sm:text-xs font-light text-slate-500 dark:text-slate-400 truncate">
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

  const { title, badge, leadBadge, leadMember, supportingMembers, totalCount } = domain;
  const hasLead = !!leadMember;

  const countText = `${totalCount} ${totalCount === 1 ? 'Member' : 'Members'}`;
  const compositionText = hasLead 
    ? `• 1 Lead${supportingMembers.length > 0 ? ` + ${supportingMembers.length} Supporting` : ''}` 
    : '';

  return (
    <div ref={sectionRef} className="mb-16 md:mb-20 last:mb-0">
      {/* Section Header */}
      <div
        data-reveal="up"
        className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 sm:mb-8 gap-3"
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
          <span>{countText}</span>
          {compositionText && (
            <span className="text-brand-primary hidden sm:inline">{compositionText}</span>
          )}
        </div>
      </div>

      {!hasLead ? (
        <div
          data-reveal="stagger-children"
          className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 max-w-[1440px]"
        >
          {supportingMembers.map((member) => (
            <div key={member._id || member.id}>
              <SupportingMemberCard member={member} />
            </div>
          ))}
        </div>
      ) : supportingMembers.length === 0 ? (
        <div data-reveal="up" className="max-w-[320px]">
          <FeaturedMemberCard member={leadMember} isSolo={true} leadBadge={leadBadge} />
        </div>
      ) : supportingMembers.length === 1 ? (
        <div
          data-reveal="up"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-[580px] items-start"
        >
          <div>
            <FeaturedMemberCard member={leadMember} leadBadge={leadBadge} />
          </div>
          <div>
            <SupportingMemberCard member={supportingMembers[0]} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start max-w-[1240px]">
          {/* Featured Head Card */}
          <div
            data-reveal="up"
            className="w-full lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 lg:max-w-[320px]"
          >
            <FeaturedMemberCard member={leadMember} leadBadge={leadBadge} />
          </div>

          {/* Right: Supporting Members Grid */}
          <div className="w-full lg:col-span-8 xl:col-span-9 lg:max-w-[900px]">
            <div
              data-reveal="stagger-children"
              className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
            >
              {supportingMembers.map((member) => (
                <div key={member._id || member.id}>
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
