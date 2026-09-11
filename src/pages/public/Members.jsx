import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';
import ProtectedImage from '../../components/common/ProtectedImage';

gsap.registerPlugin(ScrollTrigger);

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
  'VicePresident',
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
    title: 'President & CEO',
    badge: 'Leadership',
    leadBadge: 'President',
  },
  VicePresident: {
    title: 'Vice President',
    badge: 'Leadership',
    leadBadge: 'Vice President',
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
  ],
  VicePresident: [
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

  // 2. President section — ONLY President
  if (
    role === 'president' ||
    (role.includes('president') && !role.includes('vice')) ||
    domain === 'president'
  ) {
    return 'President';
  }

  // 2.5 Vice President section
  if (
    role.includes('vice president') ||
    role.includes('vice-president') ||
    role === 'vp'
  ) {
    return 'VicePresident';
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

const FILTERS = ['ALL', ...DOMAIN_ORDER];

// ─── Shared Upper Image Role Tag Component ─────────────────────────────────────
function MemberRoleOverlay({ role }) {
  if (!role) return null;

  return (
    <div className="absolute top-3 left-3 z-30 max-w-[calc(100%-24px)] pointer-events-none select-none">
      <span
        className="inline-flex items-center gap-1.5 font-mono text-[9px] font-extrabold tracking-[0.2em] uppercase text-white px-2.5 py-1 shadow-sm backdrop-blur-md border border-white/15"
        style={{ backgroundColor: 'rgba(10,15,30,0.82)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--spark)] shrink-0 animate-pulse shadow-sm shadow-[var(--spark-glow)]" />
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
    <div className={`bg-[var(--paper)] border border-[var(--border)] flex flex-col group hover:border-[var(--circuit)] transition-all duration-500 relative overflow-hidden w-full ${isSolo ? 'sm:mx-auto lg:mx-0' : ''}`}>
      {/* Thin top editorial accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-[var(--spark)] via-[var(--circuit)] to-[var(--spark)] z-20" />

      {/* Hover ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--circuit)]/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

      {/* Image Block (aspect 4/5) — edge-to-edge object-cover */}
      <div className="relative z-10 w-full aspect-[4/5] overflow-hidden bg-[var(--paper-dim)] border-b border-[var(--border)] m-0 p-0">
        <ProtectedImage
          imageId={imageId}
          variant="member_card"
          alt={member.fullName}
          className="w-full h-full m-0 object-cover object-top"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Readability vignette — overlay only, no spacing */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/18 via-transparent to-[var(--ink)]/8 z-20 pointer-events-none p-0 m-0" />

        {showTag && <MemberRoleOverlay role={displayBadge} />}

        {/* Bottom-right index-style accent */}
        <div className="absolute bottom-3 right-3 z-30 p-0 m-0">
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-white mix-blend-difference opacity-60">
            {isSolo ? '01' : 'HL'}
          </span>
        </div>
      </div>

      {/* Content Block */}
      <div className="relative z-10 flex flex-col flex-grow p-6 md:p-7">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--spark)] bg-[var(--paper-dim)] border border-[var(--border)] px-2.5 py-1 inline-block">
            {member.role || leadBadge || 'Domain Lead'}
          </span>
        </div>

        <h3 className="font-heading font-black text-2xl md:text-[26px] uppercase tracking-tight text-[var(--ink)] group-hover:text-[var(--circuit)] transition-colors mb-2 leading-[1.02]">
          {member.fullName}
        </h3>

        {member.memberType === 'faculty' ? (
          <span className="font-body text-sm text-[var(--ink-soft)] font-light leading-snug">
            {member.designation
              ? member.department
                ? `${member.designation} \u2022 ${member.department}`
                : member.designation
              : member.department || 'Faculty Mentor'}
          </span>
        ) : (
          member.course && (
            <span className="font-body text-sm text-[var(--ink-soft)] font-light leading-snug">
              {member.course}
              {member.section ? ` \u2022 Sec ${member.section}` : ''}
              {member.year ? ` \u2022 ${member.year}` : ''}
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
    <div className="bg-[var(--paper)] border border-[var(--border)] flex flex-col group hover:border-[var(--circuit)] transition-all duration-400 relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--circuit)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10" />

      {/* Image Block — edge-to-edge object-cover, zero internal spacing */}
      <div className="relative z-10 w-full aspect-[4/5] overflow-hidden bg-[var(--paper-dim)] border-b border-[var(--border)] m-0 p-0">
        <ProtectedImage
          imageId={imageId}
          variant="member_card"
          alt={member.fullName}
          className="w-full h-full m-0 object-cover object-top"
          style={{ width: '100%', height: '100%' }}
        />
        {/* Subtle vignette overlay — no spacing */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/15 via-transparent to-[var(--ink)]/6 z-20 pointer-events-none p-0 m-0" />

        {showTag && <MemberRoleOverlay role={displayBadge} />}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-grow p-4 md:p-5 gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[9.5px] font-bold tracking-[0.2em] uppercase text-[var(--spark)] bg-[var(--paper-dim)] border border-[var(--border)] px-2 py-0.5 inline-block w-max max-w-full truncate">
            {member.role || 'Member'}
          </span>
        </div>
        <h4 className="font-heading font-bold text-base md:text-lg uppercase tracking-tight text-[var(--ink)] group-hover:text-[var(--circuit)] transition-colors leading-tight truncate">
          {member.fullName}
        </h4>
        {member.memberType === 'faculty' ? (
          <span className="font-body text-[11px] md:text-xs font-light text-[var(--ink-soft)] truncate">
            {member.designation || member.department || 'Faculty'}
          </span>
        ) : (
          member.course && (
            <span className="font-body text-[11px] md:text-xs font-light text-[var(--ink-soft)] truncate">
              {member.course}
              {member.section ? ` \u2022 Sec ${member.section}` : ''}
            </span>
          )
        )}
      </div>
    </div>
  );
}

// ─── Domain Section ────────────────────────────────────────────────────────────
function DomainSection({ domain, index }) {
  const { title, badge, leadBadge, leadMember, supportingMembers, totalCount } = domain;
  const hasLead = !!leadMember;

  const countText = `${totalCount} ${totalCount === 1 ? 'Member' : 'Members'}`;
  const compositionText = hasLead
    ? `\u2022 1 Lead${supportingMembers.length > 0 ? ` + ${supportingMembers.length} Supporting` : ''}`
    : '';

  return (
    <div className="mb-16 md:mb-20 last:mb-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--border)] pb-5 mb-7 sm:mb-9 gap-3">
        <div>
          <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] mb-2.5 flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--circuit)]/50" />
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span className="text-[var(--border)]">/</span>
            <span>{badge}</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[var(--ink)] leading-none">
            {title}
          </h2>
        </div>
        <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--ink-soft)] font-bold uppercase flex items-center gap-2">
          <span>{countText}</span>
          {compositionText && (
            <span className="text-[var(--circuit)] hidden sm:inline">{compositionText}</span>
          )}
        </div>
      </div>

      {!hasLead ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-[1500px]">
          {supportingMembers.map((member) => (
            <SupportingMemberCard key={member._id || member.id} member={member} />
          ))}
        </div>
      ) : supportingMembers.length === 0 ? (
        <div className="max-w-[340px]">
          <FeaturedMemberCard member={leadMember} isSolo={true} leadBadge={leadBadge} />
        </div>
      ) : supportingMembers.length === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-[620px] items-start">
          <FeaturedMemberCard member={leadMember} leadBadge={leadBadge} />
          <SupportingMemberCard member={supportingMembers[0]} />
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start max-w-[1280px]">
          {/* Featured Head Card */}
          <div className="w-full lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 lg:max-w-[340px]">
            <FeaturedMemberCard member={leadMember} leadBadge={leadBadge} />
          </div>

          {/* Right: Supporting Members Grid */}
          <div className="w-full lg:col-span-8 xl:col-span-9">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {supportingMembers.map((member) => (
                <SupportingMemberCard key={member._id || member.id} member={member} />
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
  const heroRef = useRef(null);
  const backgroundRef = useRef(null);
  const containerRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [groupedDomains, setGroupedDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  // ─── GSAP Hero Motion Pipeline (matches Home + Events pattern) ────────────────
  useGSAP(() => {
    if (!heroRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
    const ctx = gsap.context(() => {
      const intro = !reduced ? gsap.timeline()
        .from(backgroundRef.current, { opacity: 0, scale: 1.025, duration: .7, clearProps: 'all' }, .1)
        .from('[data-members-hero-line]', { opacity: 0, y: 30, duration: .65, stagger: .12, clearProps: 'all' }, .35)
        .from('[data-members-hero-copy]', { opacity: 0, y: 12, duration: .45, stagger: .08, clearProps: 'all' }, .85)
        .from('[data-members-hero-preview]', { opacity: 0, y: 20, duration: .6, ease: 'power2.out', clearProps: 'all' }, 1.0)
        : null;
      const electric = !reduced ? gsap.timeline({ repeat: -1 })
        .to('.electric-trace', { strokeDashoffset: -192, duration: 2.8, ease: 'none', stagger: .45 }, 0)
        .to('.electric-trace-reverse', { strokeDashoffset: 192, duration: 3.2, ease: 'none', stagger: .45 }, 0) : null;
      const visibility = () => { [intro, electric].filter(Boolean).forEach(a => document.hidden ? a.pause() : a.play()); };
      document.addEventListener('visibilitychange', visibility);
      if (!reduced && !lowPower) {
        gsap.to(backgroundRef.current, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true } });
        const move = event => { const x = (event.clientX / window.innerWidth - .5) * 2, y = (event.clientY / window.innerHeight - .5) * 2; gsap.to(backgroundRef.current, { x: x * 8, y: y * 5, overwrite: 'auto', duration: .7 }); };
        window.addEventListener('pointermove', move, { passive: true });
        return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pointermove', move); };
      }
      return () => document.removeEventListener('visibilitychange', visibility);
    }, heroRef);
    return () => ctx.revert();
  }, { scope: heroRef });

  // Hero preview members (first 4 approved members)
  const previewMembers = members.slice(0, 4);

  // Filter + search logic — operates on already-grouped domains
  const matchMember = (m) => {
    const q = searchQuery.toLowerCase();
    if (q && !m.fullName?.toLowerCase().includes(q) && !m.role?.toLowerCase().includes(q) && !m.department?.toLowerCase().includes(q) && !m.course?.toLowerCase().includes(q)) return false;
    if (activeFilter === 'ALL') return true;
    return resolveMemberDomain(m) === activeFilter;
  };

  const filteredDomains = activeFilter === 'ALL' && !searchQuery
    ? groupedDomains
    : groupedDomains
        .map(sec => {
          const filteredLead = sec.leadMember && matchMember(sec.leadMember) ? sec.leadMember : null;
          const filteredSupporting = sec.supportingMembers.filter(matchMember);
          // If filter hits supporting lead-matching, promote top match
          let lead = filteredLead;
          let supporting = filteredSupporting;
          if (!lead && activeFilter !== 'ALL' && filteredSupporting.length > 0) {
            const withTag = filteredSupporting.find(shouldShowTag);
            if (withTag) { lead = withTag; supporting = filteredSupporting.filter(m => m !== withTag); }
          }
          return { ...sec, leadMember: lead, supportingMembers: supporting, totalCount: (lead ? 1 : 0) + supporting.length };
        })
        .filter(sec => sec.leadMember || sec.supportingMembers.length > 0);

  const visibleCount = filteredDomains.reduce((acc, s) => acc + s.totalCount, 0);

  return (
    <div ref={containerRef} className="w-full bg-[var(--paper)] min-h-screen font-body text-[var(--ink)]">

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative isolate border-b border-[var(--border)] bg-[var(--paper)] overflow-hidden px-6 pb-16 pt-20 md:px-12 lg:px-20" style={{ minHeight: 'min(680px,84svh)' }}>
        {/* Circuit horizon background image — matches Home/Events treatment */}
        <div ref={backgroundRef} className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <img src="/circuit-horizon.png" alt="" className="h-full w-full object-cover object-bottom opacity-28" />
        </div>
        {/* Gradient fade overlay — 15%/65%/100% stop pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--paper)_15%,transparent_65%,var(--paper)_100%)] pointer-events-none" />
        {/* Electric trace lines — matches Events.jsx SVG pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70 z-0" aria-hidden="true" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path d="M0 80 H200 L260 130 H500 L560 70 H780 L840 120 H1080 L1140 60 H1440" fill="none" stroke="var(--circuit)" strokeWidth="1.2" strokeDasharray="8 36" className="electric-trace-reverse" />
          <path d="M0 320 H180 L240 270 H460 L520 340 H740 L800 280 H1020 L1080 350 H1440" fill="none" stroke="var(--spark)" strokeWidth="1" strokeDasharray="6 42" className="electric-trace" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center py-12 md:py-20">
          {/* Left — headline + copy */}
          <div className="col-span-1 lg:col-span-7 flex flex-col items-start">
            <p data-members-hero-copy className="font-mono text-[10px] font-bold tracking-[0.35em] uppercase text-[var(--circuit)] mb-6">LPU SCA / Brainstorm Club</p>
            <h1 className="font-heading font-black uppercase tracking-tight leading-[0.88] text-[var(--ink)]" style={{ fontSize: 'clamp(3.5rem,10vw,7.5rem)' }}>
              <span data-members-hero-line className="block">Meet The</span>
              <span data-members-hero-line className="block text-transparent bg-clip-text bg-gradient-to-r from-circuit to-spark">Minds</span>
              <span data-members-hero-line className="block">Behind</span>
              <span data-members-hero-line className="block">Brainstorm.</span>
            </h1>
            <p data-members-hero-copy className="mt-8 max-w-xl font-body text-lg text-[var(--ink-soft)] leading-relaxed">
              Students, mentors and leaders who turn curiosity into experiments, and ideas into impact. A dedicated hierarchy ensuring continuous innovation across every discipline.
            </p>
          </div>

          {/* Right — hero preview editorial frame */}
          <div data-members-hero-preview className="col-span-1 lg:col-span-5 relative w-full flex items-center justify-center">
            <div className="relative w-full max-w-[480px] aspect-[4/5] md:aspect-[5/6] border border-[var(--border)] bg-[var(--paper-dim)] overflow-hidden">
              {/* Frame ambient */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--circuit)]/5 via-transparent to-[var(--spark)]/5" />

              {/* Corner brackets — editorial */}
              <div className="absolute top-3 left-3 w-5 h-5 border-l border-t border-[var(--circuit)]/70 z-30" />
              <div className="absolute top-3 right-3 w-5 h-5 border-r border-t border-[var(--circuit)]/70 z-30" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-l border-b border-[var(--spark)]/60 z-30" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-r border-b border-[var(--spark)]/60 z-30" />

              {/* Grid of preview portraits */}
              <div className="relative z-10 w-full h-full p-6 md:p-8 grid grid-cols-2 gap-3 md:gap-4">
                {previewMembers.length > 0
                  ? previewMembers.map((member, i) => (
                      <div
                        key={member._id || i}
                        className="aspect-[4/5] border border-[var(--border)] bg-[var(--paper)] flex items-center justify-center relative overflow-hidden group shadow-sm"
                      >
                        {/* Dual-layer portraits */}
                        <ProtectedImage
                          imageId={member.photoId?.imageId}
                          variant="member_card"
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-35 pointer-events-none"
                        />
                        <ProtectedImage
                          imageId={member.photoId?.imageId}
                          variant="member_card"
                          alt={member.fullName}
                          className="relative z-10 max-w-[92%] max-h-[92%] w-auto h-auto object-contain drop-shadow-sm opacity-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/10 via-transparent to-[var(--circuit)]/5 z-20 pointer-events-none" />
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-[var(--paper)]/92 backdrop-blur-sm border border-[var(--border)] px-2 py-1 flex justify-between items-center z-30">
                          <span className="font-mono text-[8px] font-bold text-[var(--ink)] uppercase truncate">
                            {member.fullName}
                          </span>
                          <span className="font-mono text-[8px] text-[var(--circuit)] font-bold">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    ))
                  : Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[4/5] border border-[var(--border)] bg-[var(--paper-dim)] animate-pulse"
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATISTICS STRIP ── */}
      <section className="py-12 bg-[var(--ink)] text-[var(--paper)] border-b border-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-[var(--ink-soft)]/30">
            {[
              { label: 'Active Members', value: members.length.toString().padStart(2, '0') },
              { label: 'Teams', value: groupedDomains.length.toString().padStart(2, '0') },
              { label: 'Projects', value: '12+' },
              { label: 'Events Hosted', value: '20+' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center px-4">
                <span className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tighter text-[var(--paper)] mb-2">
                  {stat.value}
                </span>
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--spark)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTERS + SEARCH (sticky, matches Events page) ── */}
      <section className="sticky top-16 z-30 bg-[var(--paper)] border-b border-[var(--border)] px-6 lg:px-20 py-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            {FILTERS.map((f, i) => {
              const badge = i === 0 ? f : DOMAIN_METADATA[f]?.badge || f;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`font-mono text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 border transition-all ${
                    activeFilter === f
                      ? 'border-spark bg-spark text-ink'
                      : 'border-[var(--border)] text-[var(--ink-soft)] hover:border-[var(--circuit)] hover:text-[var(--ink)]'
                  }`}
                >
                  {badge}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="font-mono text-[9px] tracking-[0.2em] font-bold uppercase text-[var(--ink-soft)] border border-[var(--border)] px-2.5 py-1.5 whitespace-nowrap">
              {visibleCount} SHOWN
            </div>
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
              <input
                type="text"
                placeholder="Search members…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 font-mono text-[11px] tracking-wider bg-[var(--paper-dim)] border border-[var(--border)] text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none focus:border-[var(--circuit)] transition-colors w-full sm:w-60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── DIRECTORY SECTION ── */}
      <section className="px-6 lg:px-20 py-20 bg-[var(--paper-dim)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl">

          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <div className="font-mono text-sm tracking-[0.2em] font-bold text-[var(--circuit)] uppercase animate-pulse">
                Loading Directory…
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-32">
              <div className="font-mono text-sm tracking-[0.2em] font-bold text-red-600 uppercase border border-red-500/20 bg-red-500/5 px-6 py-4">
                {error}
              </div>
            </div>
          ) : filteredDomains.length === 0 ? (
            <div className="py-20 text-center font-mono text-sm tracking-widest uppercase text-[var(--ink-soft)] border border-[var(--border)] bg-[var(--paper)]">
              {searchQuery || activeFilter !== 'ALL' ? 'NO MEMBERS MATCH YOUR FILTERS.' : 'NO ACTIVE MEMBERS FOUND.'}
            </div>
          ) : (
            filteredDomains.map((domain, idx) => (
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
      <section className="px-6 lg:px-20 py-24 md:py-32 bg-[var(--paper)]">
        <div className="mx-auto max-w-7xl text-center flex flex-col items-center">
          <p className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] mb-3">Join The Roster</p>
          <h2 className="font-heading font-black text-4xl md:text-6xl uppercase tracking-tight text-[var(--ink)] mb-6">
            HAVE AN IDEA?
          </h2>
          <p className="font-body text-lg md:text-xl text-[var(--ink-soft)] font-light max-w-2xl mb-12">
            Turn your curiosity into something real. The Brainstorm community is always looking for new builders.
          </p>
          <Link
            to="/ideas"
            className="bg-spark text-ink px-10 py-5 font-mono text-sm font-bold tracking-widest uppercase hover:bg-spark-soft transition-colors flex items-center justify-center gap-2 group shadow-xl shadow-spark/20 hover:-translate-y-0.5"
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
