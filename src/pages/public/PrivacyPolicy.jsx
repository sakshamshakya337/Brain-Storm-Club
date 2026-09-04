import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText, Mail } from 'lucide-react';
import Footer from '../../components/layout/Footer';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      num: '01',
      title: 'OVERVIEW & COMMITMENT',
      icon: Shield,
      content:
        'LPU SCA Brainstorm Club ("Brainstorm", "we", "our") is a student-led technology and innovation community at Lovely Professional University. We are committed to protecting the privacy of our students, participants, faculty mentors, and visitors. This Privacy Policy explains what information we collect across our website, event registrations, idea submissions, and membership applications, and how that information is handled with care and integrity.'
    },
    {
      num: '02',
      title: 'INFORMATION WE COLLECT',
      icon: Eye,
      content:
        'We collect only the information strictly necessary to facilitate community participation, event hosting, and project collaboration:\n\n• Membership Applications: Full name, university registration number, course, section, university or personal email, contact number, WhatsApp number, technical interests, and profile photo.\n• Event Registrations: Full name, registration number, course, section, email, phone number, and attendance records.\n• Idea Submissions: Title, description, category, expected outcomes, contact info, and optional supporting PDF documents.\n• System & Usage Data: Technical logs for security, visitor metrics on links (/connect), and session state to ensure platform reliability.'
    },
    {
      num: '03',
      title: 'HOW WE USE YOUR INFORMATION',
      icon: Lock,
      content:
        'Your information is used solely for legitimate educational and community purposes:\n\n• Processing and validating event entries and issuing participation certificates.\n• Reviewing student ideas and pairing project teams with faculty or student leads.\n• Managing active membership directories and publishing approved public member profiles.\n• Sending essential confirmations, event reminders, or notification updates regarding club activities.'
    },
    {
      num: '04',
      title: 'UPLOADS, DOCUMENTS & MEDIA',
      icon: FileText,
      content:
        'Uploaded profile photos, event posters, and idea PDF proposals are validated for safety and authenticity. Media files are stored securely using cloud storage infrastructure with authenticated or signed URL access. We never sell, rent, or trade your personal submissions, uploaded documents, or contact details to third-party commercial advertisers.'
    },
    {
      num: '05',
      title: 'DATA RETENTION & SECURITY',
      icon: Shield,
      content:
        'We enforce industry-standard security safeguards including encrypted data transmission (HTTPS/TLS), role-based administrative authentication, and strict MIME/magic-byte file verification. Data is retained for the duration of a student’s academic lifecycle with the club or until an authorized account deletion request is processed.'
    },
    {
      num: '06',
      title: 'CONTACT & INQUIRIES',
      icon: Mail,
      content:
        'If you have questions regarding this Privacy Policy, wish to update your public directory information, or request removal of personal data, please contact the Brainstorm leadership team at contact@lpusca.com or via our Contact page.'
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
            <span className="text-slate-900 dark:text-white">Privacy Policy</span>
          </div>

          <div className="max-w-4xl">
            <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary mb-6 border border-brand-primary/30 px-3 py-1.5 rounded-sm bg-brand-primary/5 inline-block">
              LEGAL & TRANSPARENCY
            </div>
            
            <h1 className="font-heading font-black text-[clamp(2.75rem,7vw,5rem)] leading-[0.9] tracking-tighter uppercase mb-6 text-slate-900 dark:text-white">
              PRIVACY POLICY
            </h1>

            <p className="font-body text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl leading-relaxed">
              How LPU SCA Brainstorm Club collects, uses, and safeguards your information across our digital platforms and activities.
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-6 font-mono text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              <span>LAST REVISED: {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}</span>
              <span>•</span>
              <span>VERSION 1.2</span>
            </div>
          </div>
        </div>
      </section>

      {/* POLICY CONTENT SECTIONS */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((sec) => (
              <div 
                key={sec.num}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 rounded-sm shadow-sm dark:shadow-none transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold tracking-widest text-brand-primary">
                      {sec.num}
                    </span>
                    <h2 className="font-heading font-bold text-xl sm:text-2xl uppercase tracking-tight text-slate-900 dark:text-white">
                      {sec.title}
                    </h2>
                  </div>
                  <sec.icon size={20} className="text-slate-400 dark:text-slate-500 shrink-0 mt-1" />
                </div>
                
                <div className="font-body text-slate-600 dark:text-slate-300 font-light leading-relaxed whitespace-pre-line text-base">
                  {sec.content}
                </div>
              </div>
            ))}

            {/* ACTION CARD */}
            <div className="p-8 sm:p-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-slate-900 dark:text-white mb-2">
                  HAVE QUESTIONS ABOUT YOUR DATA?
                </h3>
                <p className="font-body text-sm text-slate-600 dark:text-slate-400">
                  Reach out to us directly and our team will be glad to assist you.
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Link
                  to="/contact"
                  className="bg-brand-primary text-white px-6 py-3.5 rounded-sm font-mono text-xs font-bold tracking-widest uppercase hover:bg-brand-secondary transition-colors inline-flex items-center gap-2"
                >
                  CONTACT US
                </Link>
                <Link
                  to="/"
                  className="border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-3.5 rounded-sm font-mono text-xs font-bold tracking-widest uppercase hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft size={14} /> HOME
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
