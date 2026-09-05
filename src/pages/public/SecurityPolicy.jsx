import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Lock, AlertTriangle, Bug, KeyRound,
  Mail, CheckCircle2, ArrowLeft, ExternalLink, ShieldAlert
} from 'lucide-react';
import Footer from '../../components/layout/Footer';

export default function SecurityPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      num: '01',
      title: 'SECURITY ARCHITECTURE & COMMITMENT',
      icon: ShieldCheck,
      content:
        'LPU SCA Brainstorm Club ("Brainstorm", "we", "our") maintains a multi-tier defense architecture to protect our student members, event participants, idea submissions, and administrative systems.\n\nOur platform operates under strict least-privilege access, role-based access control (RBAC), end-to-end HTTPS/TLS encrypted transmission, and automated input validation to guarantee data confidentiality, integrity, and availability.'
    },
    {
      num: '02',
      title: 'RESPONSIBLE VULNERABILITY DISCLOSURE',
      icon: Bug,
      content:
        'We welcome responsible security researchers, students, and white-hat professionals to test and inspect our platform. If you believe you have found a security vulnerability in our application, API, or infrastructure, we ask that you disclose it to us responsibly before making any public disclosure.\n\nWhen reporting a vulnerability, please include:\n• A detailed description of the vulnerability and its potential impact.\n• Reproducible steps, proof-of-concept (PoC) code, or HTTP request logs.\n• The affected URL, route, or API endpoint.\n• Your name or handle if you wish to be credited in our security acknowledgments.'
    },
    {
      num: '03',
      title: 'SAFE HARBOR FOR ETHICAL RESEARCHERS',
      icon: Lock,
      content:
        'We consider security research conducted in accordance with this policy to be authorized and conducted in good faith. If you practice responsible disclosure:\n\n• We will not initiate or pursue legal action against you.\n• We will work collaboratively to validate, remediate, and verify the fix.\n• We will keep you updated throughout the remediation timeline.\n• We will publicly acknowledge your contribution to keeping our student community safe.'
    },
    {
      num: '04',
      title: 'SCOPE & PROHIBITED ACTIVITIES',
      icon: AlertTriangle,
      content:
        'In-Scope Targets:\n• Primary Web Application: https://sca-brainstorm.lpu.in\n• Backend API Endpoints: /api/*\n• Authentication & OTP Verification Flows\n• Cloud Media Storage Delivery & Access Controls\n\nStrictly Prohibited & Out of Scope:\n• Denial of Service (DoS / DDoS) attacks or intentional bandwidth saturation.\n• Social engineering, phishing, or credential harvesting targeting students or mentors.\n• Accessing, copying, deleting, or altering data belonging to another user.\n• Automated spamming of event registrations, idea submissions, or contact queries.\n• Physical attacks against university facilities, networks, or infrastructure.'
    },
    {
      num: '05',
      title: 'PLATFORM DEFENSES & DATA PROTECTION',
      icon: KeyRound,
      content:
        'Our active defensive mechanisms include:\n\n• Two-Factor Administrative Authentication: High-entropy passwords coupled with single-use cryptographic OTP verification delivered via encrypted SMTP.\n• Multi-Tier Rate Limiting: IP-based sliding window rate limits on authentication, OTP requests, and public submission endpoints.\n• Injection & XSS Defenses: Strict NoSQL query sanitization, XSS payload filtering, and parameterized Mongoose queries.\n• Storage Isolation: Authenticated access controls on uploaded student photos and PDF proposals via signed URL delivery.\n• Header Hardening: X-Frame-Options (DENY) clickjacking protection, X-Content-Type-Options (nosniff), and suppressed server signature headers.'
    },
    {
      num: '06',
      title: 'SECURITY CONTACT & ESCALATION',
      icon: Mail,
      content:
        'To report a security issue or reach the security coordinators directly, email us at:\n\n• Security Team: sakshamshakya319@gmail.com\n• Club Official Desk: contact@lpusca.com\n• Standard RFC 9116 Metadata: /.well-known/security.txt\n\nWe endeavor to acknowledge all security disclosures within 24–48 hours.'
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
            <span className="text-slate-900 dark:text-white">Security Policy</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-brand-primary mb-6 border border-brand-primary/30 px-3.5 py-1.5 rounded-sm bg-brand-primary/5">
              <ShieldCheck size={13} />
              SYSTEM PROTOCOL / VULNERABILITY DISCLOSURE
            </div>

            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.95] mb-6">
              Security Policy & Safe Harbor.
            </h1>

            <p className="font-body text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
              We treat security as an uncompromising core requirement. This document outlines our defensive standards, vulnerability disclosure guidelines, and safe harbor commitments for researchers.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-bold">
              <span>RFC 9116 COMPLIANT</span>
              <span>•</span>
              <span>VERSION 2.0</span>
              <span>•</span>
              <span>UPDATED: SEPTEMBER 2026</span>
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
                        SEC / {sec.num}
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

          {/* REPORT VULNERABILITY CTA BOX */}
          <div className="mt-16 p-8 sm:p-12 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-brand-primary block mb-2">
                FOUND SOMETHING UNEXPECTED?
              </span>
              <h3 className="font-heading font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                Report a Vulnerability Directly.
              </h3>
              <p className="font-body text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                Our core technical leads review disclosures with priority. We commit to timely responses and transparent communication.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <a 
                href="mailto:sakshamshakya319@gmail.com?subject=Vulnerability%20Disclosure%20-%20LPU%20SCA%20Brainstorm"
                className="px-6 py-3.5 bg-brand-primary text-white text-xs font-mono font-bold tracking-wider uppercase rounded-sm hover:bg-brand-primary/90 transition-colors shadow-md shadow-brand-primary/20 text-center flex items-center justify-center gap-2"
              >
                <Mail size={14} /> Email Security Lead
              </a>
              <Link 
                to="/contact"
                className="px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold tracking-wider uppercase rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center"
              >
                Contact Desk
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
