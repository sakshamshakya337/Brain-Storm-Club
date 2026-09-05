import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, ShieldCheck, AlertOctagon, Scale, Users,
  Mail, Ban, Award, CheckCircle
} from 'lucide-react';
import Footer from '../../components/layout/Footer';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      num: '01',
      title: 'ACCEPTANCE OF TERMS',
      icon: Scale,
      content:
        'By accessing or using the LPU SCA Brainstorm Club website (https://sca-brainstorm.lpu.in), submitting membership applications, registering for events, or submitting ideas, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must refrain from using the platform and its related services.'
    },
    {
      num: '02',
      title: 'ACCEPTABLE USE & STRICT PROHIBITIONS',
      icon: Ban,
      content:
        'To ensure a secure and trustworthy environment for all students and mentors, the following behaviors are strictly prohibited:\n\n• Automated Scraping & Bot Traffic: Scraping, data harvesting, or automated querying using headless browsers or bots.\n• Denial of Service & Abuse: Deliberately stressing, disrupting, or exhausting server infrastructure or Cloudinary storage quotas.\n• Credential Manipulation & Impersonation: Providing false university registration numbers, impersonating other students, or attempting to access administrative control portals without authorization.\n• Malicious Uploads: Submitting corrupted, oversized, or malicious files through idea proposals or member registration forms.\n• Violation of University Codes: Any behavior that contravenes the disciplinary code or academic integrity standards of Lovely Professional University.'
    },
    {
      num: '03',
      title: 'EVENT REGISTRATION & ATTENDANCE',
      icon: Award,
      content:
        'Registration for Brainstorm events, hackathons, and seminars is subject to capacity and eligibility criteria.\n\n• Registered participants are expected to attend or cancel in advance to allow waitlisted peers to participate.\n• Certificates of Participation or Achievement are awarded strictly to verified attendees who meet event completion requirements.\n• The club reserves the right to cancel, reschedule, or modify event details with prior notice.'
    },
    {
      num: '04',
      title: 'INTELLECTUAL PROPERTY & STUDENT IDEAS',
      icon: ShieldCheck,
      content:
        'We deeply value innovation and student authorship:\n\n• Intellectual Property Ownership: Authors of ideas and project proposals submitted through the portal retain full intellectual property rights to their original creations.\n• Review License: By submitting an idea, you grant the Brainstorm review panel a non-exclusive license to review and evaluate the submission for club mentorship or funding.\n• Club Brand & Assets: The Brainstorm Club name, logo, event branding, and web code are the property of LPU SCA Brainstorm Club.'
    },
    {
      num: '05',
      title: 'MEMBERSHIP POLICIES & CODE OF CONDUCT',
      icon: Users,
      content:
        'Members of LPU SCA Brainstorm Club are expected to uphold highest standards of collaboration, respect, and technical ethics.\n\n• Membership may be revoked by leadership for persistent non-participation, academic dishonesty, harassment, or misconduct.\n• Members appearing on the public directory agree to the publication of their club domain and approved photograph.'
    },
    {
      num: '06',
      title: 'DISCLAIMERS & CONTACT',
      icon: Mail,
      content:
        'The platform and all community services are provided on an "as is" and "as available" basis without warranties of any kind.\n\nFor any questions regarding these Terms or legal compliance, please reach out to:\n\n• Email: contact@lpusca.com\n• Campus Desk: Block 32, Innovation Lab, Lovely Professional University, Punjab, India.'
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-300 font-body transition-colors duration-300">
      
      {/* HERO SECTION */}
      <section className="relative pt-6 md:pt-10 pb-16 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
        <div 
          className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', 
            backgroundSize: '64px 64px' 
          }} 
        />

        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div className="mb-8 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white">Terms of Service</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-brand-primary mb-6 border border-brand-primary/30 px-3.5 py-1.5 rounded-sm bg-brand-primary/5">
              <FileText size={13} />
              LEGAL & COMMUNITY AGREEMENT
            </div>

            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.95] mb-6">
              Terms of Service & Rules.
            </h1>

            <p className="font-body text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
              Clear, transparent rules designed to safeguard our community, student innovations, platform security, and academic standards.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-bold">
              <span>ACADEMIC YEAR 2026-2027</span>
              <span>•</span>
              <span>EFFECTIVE: SEPTEMBER 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTIONS LIST */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <div 
                  key={sec.num}
                  className="p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-sm hover:border-brand-primary/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-sm bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                        <Icon size={20} />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest">
                        TOS / {sec.num}
                      </span>
                    </div>

                    <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight uppercase mb-4">
                      {sec.title}
                    </h2>

                    <div className="font-body text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line font-light">
                      {sec.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
