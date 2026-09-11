import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Upload, X, FileWarning, AlertCircle, ShieldAlert, Crop, Lock, Phone } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';
import imageCompression from 'browser-image-compression';
import MemberPhotoEditor from '../../components/common/MemberPhotoEditor';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PUBLIC_ROLES = [
  'Technical Team',
  'Media Team',
  'Anchor',
  'Coordinator'
];

const ADMIN_ROLES = [
  'Head Coordinator',
  'Technical Head',
  'Social Media Head'
];

export default function MemberRegistration() {
  const [gateChecked, setGateChecked]   = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false); // default closed until API confirms open
  const [formState, setFormState]       = useState('DEFAULT'); // DEFAULT, SENDING, SUCCESS, DUPLICATE
  const [errorMessage, setErrorMessage] = useState('');

  // ── Check if registration gate is open ─────────────────────────
  useEffect(() => {
    fetch('/api/site/status', { cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        setRegistrationOpen(json?.data?.memberRegistrationOpen ?? false);
      })
      .catch(() => {
        setRegistrationOpen(false); // fail closed — admin must explicitly open it
      })
      .finally(() => setGateChecked(true));
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    course: '',
    section: '',
    email: '',
    phone: '',
    whatsapp: '',
    role: '',
    profileImage: null
  });

  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [rawImageForCrop, setRawImageForCrop] = useState(null);
  const [rawFileName, setRawFileName] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageError, setImageError] = useState('');

  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  usePageReveal(containerRef);
  useScrollReveal(containerRef);

  useGSAP(() => {
    if (!heroRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
    const ctx = gsap.context(() => {
      const intro = !reduced ? gsap.timeline()
        .from(backgroundRef.current, { opacity: 0, scale: 1.025, duration: .7, clearProps: 'all' }, .1)
        .from('[data-register-hero-line]', { opacity: 0, y: 30, duration: .65, stagger: .12, clearProps: 'all' }, .35)
        .from('[data-register-hero-copy]', { opacity: 0, y: 12, duration: .45, stagger: .08, clearProps: 'all' }, .8) : null;
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

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (rawImageForCrop) URL.revokeObjectURL(rawImageForCrop);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: contentRef.current, start: 'top 85%' }
        }
      );
    }
  }, []);

  useEffect(() => {
    if (sameAsPhone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [formData.phone, sameAsPhone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (e.target) e.target.value = '';

    setImageError('');
    setImageProcessing(true);

    try {
      const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(file.name);
      if (!isImage) {
        throw new Error('Only image files (JPG, PNG, WebP, HEIC) are accepted.');
      }

      let fileToProcess = file;

      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        fileToProcess = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      }

      if (rawImageForCrop) URL.revokeObjectURL(rawImageForCrop);

      const previewUrl = URL.createObjectURL(fileToProcess);
      setRawImageForCrop(previewUrl);
      setRawFileName(fileToProcess.name);
      setCropModalOpen(true);
    } catch (err) {
      console.error('Image selection error:', err);
      setImageError(err.message || 'Failed to process selected image.');
    } finally {
      setImageProcessing(false);
    }
  };

  const handleCropConfirm = async (croppedBlob, croppedFile) => {
    setImageProcessing(true);
    try {
      const options = {
        maxSizeMB: 2.0,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(croppedFile, options);

      if (compressedFile.size > 5 * 1024 * 1024) {
        throw new Error('Compressed image exceeds 5MB limit. Please choose a different crop.');
      }

      if (imagePreview) URL.revokeObjectURL(imagePreview);

      setFormData((prev) => ({ ...prev, profileImage: compressedFile }));
      setImagePreview(URL.createObjectURL(compressedFile));
      setCropModalOpen(false);
      setImageError('');
    } catch (err) {
      console.error('Crop compression error:', err);
      setImageError(err.message || 'Failed to compress cropped image.');
    } finally {
      setImageProcessing(false);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (rawImageForCrop) URL.revokeObjectURL(rawImageForCrop);
    setFormData((prev) => ({ ...prev, profileImage: null }));
    setImagePreview(null);
    setRawImageForCrop(null);
    setImageError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!formData.course) return setErrorMessage('Please select your course.');
    if (!formData.role) return setErrorMessage('Please select a role.');
    if (!formData.profileImage) return setErrorMessage('Please upload a profile image (under 5MB).');

    const normalizedRegNo = formData.regNo.trim().toUpperCase();

    if (ADMIN_ROLES.includes(formData.role)) {
      setErrorMessage('SECURITY ERROR: The selected role requires Administrator privileges to assign.');
      return;
    }

    setFormState('SENDING');
    
    const submitData = new FormData();
    submitData.append('fullName', formData.name);
    submitData.append('registrationNumber', normalizedRegNo);
    submitData.append('course', formData.course);
    submitData.append('section', formData.section);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('whatsapp', formData.whatsapp);
    submitData.append('role', formData.role);
    submitData.append('profileImage', formData.profileImage);

    fetch('/api/public/members/register', {
      method: 'POST',
      body: submitData
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.status === 409) {
        setFormState('DUPLICATE');
      } else if (res.ok) {
        setFormState('SUCCESS');
      } else {
        setFormState('DEFAULT');
        setErrorMessage(data.message || 'Error submitting registration.');
      }
    })
    .catch((err) => {
      setFormState('DEFAULT');
      setErrorMessage('Network error. Please try again.');
    });
  };

  // ── Gate loading ───────────────────────────────────────────────
  if (!gateChecked) {
    return (
      <div className="w-full bg-paper min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-spark border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Registration CLOSED state ──────────────────────────────────
  if (!registrationOpen) {
    return (
      <div className="w-full bg-paper min-h-screen text-ink font-body flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--paper)_0%,var(--paper-dim)_100%)] pointer-events-none" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" aria-hidden="true" viewBox="0 0 1440 600" preserveAspectRatio="none">
            <path d="M0 80 H200 L260 130 H500 L560 70 H780 L840 120 H1080 L1140 60 H1440" fill="none" stroke="var(--border)" strokeWidth="1.2" strokeDasharray="8 36" />
            <path d="M0 520 H180 L240 470 H460 L520 540 H740 L800 480 H1020 L1080 550 H1440" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="6 42" />
          </svg>

          <div className="relative z-10 max-w-lg mx-auto text-center flex flex-col items-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-paper border-2 border-border flex items-center justify-center mb-8 shadow-sys">
              <Lock size={36} className="text-ink-soft" />
            </div>

            {/* Label */}
            <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft border border-border px-3 py-1.5 rounded-sm bg-paper mb-6">
              REGISTRATION / CLOSED
            </div>

            {/* Heading */}
            <h1 className="font-heading font-black text-4xl md:text-5xl uppercase tracking-tight text-ink leading-[0.92] mb-6">
              REGISTRATION IS<br />
              <span className="text-ink-soft">CURRENTLY CLOSED.</span>
            </h1>

            {/* Body */}
            <p className="font-body text-base text-ink-soft max-w-sm mx-auto leading-relaxed mb-10">
              Member registrations are not being accepted at this time. Please check back later or contact the Brainstorm team for more information.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/contact"
                className="flex items-center gap-2 rounded-sm bg-spark px-8 py-4 font-heading font-bold text-sm tracking-widest uppercase text-ink transition-transform hover:-translate-y-0.5 shadow-lg shadow-spark/20 group"
              >
                <Phone size={14} />
                Contact the Team
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2 rounded-sm border border-border bg-paper px-8 py-4 font-heading font-bold text-sm tracking-widest uppercase text-ink-soft hover:text-ink hover:bg-paper-dim transition-colors"
              >
                Back to Home
              </Link>
            </div>

            {/* Divider note */}
            <div className="mt-12 pt-8 border-t border-border w-full">
              <p className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">
                BRAINSTORM CLUB · LPU SCA · MEMBER ENROLLMENT PORTAL
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full bg-paper min-h-screen text-ink font-body">
      
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative isolate border-b border-border bg-paper overflow-hidden px-6 pb-12 pt-20 md:px-12 lg:px-20" style={{ minHeight: 'min(680px,84svh)' }}>
        <div ref={backgroundRef} className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <img src="/circuit-horizon.png" alt="" className="h-full w-full object-cover object-bottom opacity-30" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--paper)_15%,transparent_65%,var(--paper)_100%)] pointer-events-none" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70 z-0" aria-hidden="true" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path d="M0 80 H200 L260 130 H500 L560 70 H780 L840 120 H1080 L1140 60 H1440" fill="none" stroke="var(--circuit)" strokeWidth="1.2" strokeDasharray="8 36" className="electric-trace-reverse" />
          <path d="M0 320 H180 L240 270 H460 L520 340 H740 L800 280 H1020 L1080 350 H1440" fill="none" stroke="var(--spark)" strokeWidth="1" strokeDasharray="6 42" className="electric-trace" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl py-12 md:py-20">
          <div className="max-w-5xl flex flex-col items-start">
            
            <div data-register-hero-copy className="flex flex-wrap gap-4 mb-8">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-spark border border-spark/30 px-3 py-1.5 rounded-sm bg-spark/5">
                LPU SCA / BRAINSTORM CLUB
              </div>
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft border border-border px-3 py-1.5 rounded-sm bg-paper">
                MEMBERSHIP / REGISTRATION
              </div>
            </div>
            
            <h1 className="font-heading font-black uppercase tracking-tight leading-[0.88] text-ink" style={{ fontSize: 'clamp(3.5rem,10vw,7.5rem)' }}>
              <span data-register-hero-line className="block">JOIN THE</span>
              <span data-register-hero-line className="block text-transparent bg-clip-text bg-gradient-to-r from-circuit to-spark">BRAINSTORM</span>
              <span data-register-hero-line className="block">TEAM.</span>
            </h1>
            
            <div data-register-hero-copy className="flex items-center gap-4 my-8">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circuit opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-circuit"></span>
                 </span>
                 <span className="font-mono text-[10px] font-bold tracking-widest text-ink-soft uppercase">REGISTRATION / OPEN</span>
            </div>

            <p data-register-hero-copy className="font-body text-lg md:text-xl text-ink-soft max-w-2xl font-light leading-relaxed">
              Register as a Brainstorm member and become part of the community building ideas, projects, events and technology at LPU.
            </p>
          </div>
        </div>
      </section>

      {/* REGISTRATION FORM AREA */}
      <section className="py-16 md:py-24 bg-paper-dim border-b border-border px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24" data-reveal="up">
            
            {/* LEFT: INFO & TIMELINE */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-12">
              <div className="sticky top-32">
                
                <div className="mb-12">
                  <h3 className="font-heading font-black text-2xl uppercase tracking-tight text-ink mb-4">
                    BECOME PART OF THE TEAM.
                  </h3>
                  <p className="font-body text-ink-soft font-light leading-relaxed mb-8">
                    Complete your registration to officially join the club. Ensure your registration number is accurate.
                  </p>
                  
                  <div className="p-6 border border-spark/30 bg-spark/5 rounded-sm flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-spark/5 pointer-events-none"></div>
                    <div className="flex items-center gap-2 text-spark font-mono text-[10px] font-bold tracking-widest uppercase relative z-10">
                      <ShieldAlert size={14} /> SECURITY NOTICE
                    </div>
                    <p className="text-sm font-body text-ink font-medium relative z-10">One registration per student.</p>
                    <p className="text-xs font-body text-ink-soft relative z-10">Registration number is used to prevent duplicate membership records.</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft mb-6 flex items-center gap-3">
                    <span className="w-6 h-px bg-border"></span>
                    MEMBERSHIP STRUCTURE
                  </h3>
                  <div className="flex flex-col gap-4 relative">
                    <div className="absolute left-[9px] top-4 bottom-4 w-px bg-border"></div>
                    {[
                      { step: '01', title: 'REGISTER', desc: 'Provide your core academic and contact details.' },
                      { step: '02', title: 'VERIFY', desc: 'System verifies registration number uniqueness.' },
                      { step: '03', title: 'ASSIGN ROLE', desc: 'Secure your public team role in the directory.' },
                      { step: '04', title: 'BUILD TOGETHER', desc: 'Welcome to the Brainstorm club.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-6 relative z-10">
                        <div className="w-[19px] h-[19px] rounded-full bg-paper-dim border-2 border-spark flex items-center justify-center mt-0.5">
                           <div className="w-1.5 h-1.5 bg-circuit rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-heading font-bold text-ink tracking-widest uppercase">{item.step} / {item.title}</span>
                          <span className="font-body text-sm text-ink-soft mt-1">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT: FORM STATES */}
            <div className="col-span-1 lg:col-span-8">
              
              {/* SUCCESS STATE */}
              {formState === 'SUCCESS' && (
                <div className="w-full bg-paper border border-spark/30 p-8 md:p-16 rounded-sm shadow-sys flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 min-h-[600px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-spark/5"></div>
                  <div className="w-20 h-20 rounded-full bg-spark/10 flex items-center justify-center mb-8 text-spark border border-spark/20 relative z-10">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-spark mb-4 relative z-10">
                    REGISTRATION STATUS / ✓ REGISTERED
                  </div>
                  <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-ink mb-6 relative z-10">
                    WELCOME TO BRAINSTORM.
                  </h2>
                  <p className="font-body text-lg text-ink-soft max-w-md mx-auto mb-12 relative z-10">
                    Your membership registration has been successfully received. Your details have been added to the Brainstorm member system.
                  </p>
                  <Link to="/" className="rounded-[10px] bg-spark px-8 py-4 font-medium text-ink transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group shadow-xl shadow-spark/20 relative z-10">
                    BACK TO BRAINSTORM
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}

              {/* DUPLICATE ERROR STATE */}
              {formState === 'DUPLICATE' && (
                <div className="w-full bg-paper border border-red-200/60 p-8 md:p-16 rounded-sm shadow-sys flex flex-col items-center justify-center text-center animate-in slide-in-from-right duration-500 min-h-[600px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-50/50"></div>
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8 text-red-500 border border-red-200/60 relative z-10">
                    <ShieldAlert size={40} />
                  </div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-red-500 mb-4 relative z-10">
                    REGISTRATION REJECTED / DUPLICATE
                  </div>
                  <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-ink mb-6 relative z-10">
                    ALREADY REGISTERED.
                  </h2>
                  <p className="font-body text-lg text-ink-soft max-w-md mx-auto mb-2 relative z-10">
                    This registration number ({formData.regNo.trim().toUpperCase()}) is already associated with a Brainstorm member.
                  </p>
                  <p className="font-body text-sm text-ink-soft max-w-md mx-auto mb-12 relative z-10">
                    Each student can have only one membership registration.
                  </p>
                  <button 
                    onClick={() => setFormState('DEFAULT')}
                    className="rounded-[10px] border border-border bg-paper px-8 py-4 font-medium text-ink transition-colors hover:bg-paper-dim relative z-10"
                  >
                    BACK TO FORM
                  </button>
                </div>
              )}

              {/* FORM STATE */}
              {(formState === 'DEFAULT' || formState === 'SENDING') && (
                <div className="w-full bg-paper border border-border p-6 md:p-12 rounded-sm shadow-sys">
                  
                  <div className="mb-10 pb-6 border-b border-border flex justify-between items-end">
                    <div>
                      <h2 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-tight text-ink mb-2">
                        MEMBERSHIP APPLICATION
                      </h2>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 flex items-start gap-3 rounded-sm">
                      <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-sm font-body text-red-700 font-medium">{errorMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                    
                    {/* PERSONAL INFO */}
                    <div className="flex flex-col gap-6">
                      <h4 className="font-mono text-xs font-bold tracking-widest uppercase text-ink border-b border-border pb-3">
                        PERSONAL INFORMATION
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">FULL NAME *</label>
                          <input 
                            type="text" name="name" required placeholder="Enter your full name"
                            value={formData.name} onChange={handleInputChange}
                            className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-spark transition-colors rounded-sm shadow-sys"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">REGISTRATION NUMBER *</label>
                          <input 
                            type="text" name="regNo" required placeholder="Enter your registration number"
                            value={formData.regNo} onChange={handleInputChange}
                            className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-spark transition-colors rounded-sm shadow-sys"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ACADEMICS */}
                    <div className="flex flex-col gap-6">
                      <h4 className="font-mono text-xs font-bold tracking-widest uppercase text-ink border-b border-border pb-3">
                        ACADEMIC INFORMATION
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">COURSE *</label>
                          <select 
                            name="course" required 
                            value={formData.course} onChange={handleInputChange}
                            className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink focus:outline-none focus:border-spark transition-colors rounded-sm appearance-none cursor-pointer invalid:text-ink-soft"
                          >
                            <option value="" disabled hidden>Select your course</option>
                            <option value="MCA" className="text-ink">MCA</option>
                            <option value="BCA" className="text-ink">BCA</option>
                            <option value="B.Sc IT" className="text-ink">B.Sc IT</option>
                            <option value="M.Sc IT" className="text-ink">M.Sc IT</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">SECTION *</label>
                          <input 
                            type="text" name="section" required placeholder="Enter your section"
                            value={formData.section} onChange={handleInputChange}
                            className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-spark transition-colors rounded-sm shadow-sys"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CONTACT */}
                    <div className="flex flex-col gap-6">
                      <h4 className="font-mono text-xs font-bold tracking-widest uppercase text-ink border-b border-border pb-3">
                        CONTACT INFORMATION
                      </h4>
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">EMAIL ADDRESS *</label>
                        <input 
                          type="email" name="email" required placeholder="you@example.com"
                          value={formData.email} onChange={handleInputChange}
                          className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-spark transition-colors rounded-sm shadow-sys"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">PHONE NUMBER *</label>
                          <input 
                            type="tel" name="phone" required placeholder="Enter your phone number"
                            value={formData.phone} onChange={handleInputChange}
                            className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-spark transition-colors rounded-sm shadow-sys"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                            <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">WHATSAPP NUMBER *</label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox" 
                                  checked={sameAsPhone}
                                  onChange={(e) => setSameAsPhone(e.target.checked)}
                                  className="appearance-none w-4 h-4 border border-border bg-paper-dim rounded-[2px] checked:bg-spark checked:border-spark cursor-pointer transition-colors"
                                />
                                {sameAsPhone && <CheckCircle2 size={12} className="absolute text-paper pointer-events-none" strokeWidth={4} />}
                              </div>
                              <span className="font-mono text-[8px] tracking-widest text-ink-soft uppercase group-hover:text-ink transition-colors">Same as phone number</span>
                            </label>
                          </div>
                          <input 
                            type="tel" name="whatsapp" required placeholder="Enter your WhatsApp number"
                            value={formData.whatsapp} 
                            onChange={handleInputChange}
                            readOnly={sameAsPhone}
                            className={`w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-spark transition-colors rounded-sm shadow-sys ${sameAsPhone ? 'opacity-70 cursor-not-allowed' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ROLE & PROFILE */}
                    <div className="flex flex-col gap-6">
                      <h4 className="font-mono text-xs font-bold tracking-widest uppercase text-ink border-b border-border pb-3">
                        ROLE & PROFILE
                      </h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">ROLE *</label>
                          <span className="font-mono text-[8px] tracking-widest text-ink-soft uppercase">Leadership roles assigned by admin</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {PUBLIC_ROLES.map(r => (
                            <label key={r} className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${formData.role === r ? 'border-spark bg-spark/5' : 'border-border bg-paper-dim hover:border-spark/50'}`}>
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="radio" 
                                  name="role"
                                  value={r}
                                  checked={formData.role === r}
                                  onChange={handleInputChange}
                                  className="appearance-none w-4 h-4 border border-border rounded-full checked:border-spark transition-colors"
                                />
                                {formData.role === r && <div className="absolute w-2 h-2 rounded-full bg-spark pointer-events-none" />}
                              </div>
                              <span className={`font-body text-sm font-medium ${formData.role === r ? 'text-ink' : 'text-ink-soft'}`}>{r}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="flex flex-col gap-2 mt-4">
                        <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">PROFILE IMAGE * (PNG, JPG, HEIC)</label>
                        
                        {!imagePreview ? (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-full border-2 border-dashed border-border bg-paper-dim hover:bg-paper hover:border-spark/50 transition-all rounded-sm flex flex-col items-center justify-center p-12 group cursor-pointer"
                          >
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/webp"
                              onChange={handleImageUpload}
                              className="hidden" 
                            />
                            <div className="w-12 h-12 rounded-full bg-spark/10 flex items-center justify-center text-spark mb-4 group-hover:scale-110 transition-transform">
                              {imageProcessing ? (
                                 <div className="w-5 h-5 border-2 border-spark border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                 <Upload size={20} />
                              )}
                            </div>
                            <span className="font-heading font-bold text-ink mb-2 text-center">
                              {imageProcessing ? 'PROCESSING...' : 'CHOOSE PHOTO & ADJUST CROP'}
                            </span>
                            <span className="font-mono text-[10px] text-ink-soft tracking-widest uppercase text-center">
                              PNG · JPG · HEIC · Max 5 MB (Auto-cropped to 4:5 Card Ratio)
                            </span>
                            
                            {imageError && (
                              <div className="absolute bottom-3 text-red-500 text-xs font-mono font-bold flex items-center gap-1 z-20">
                                <FileWarning size={12} /> {imageError}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full border border-border bg-paper-dim p-4 flex items-center gap-4 rounded-sm relative group overflow-hidden">
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/webp"
                              onChange={handleImageUpload}
                              className="hidden" 
                            />
                            <div className="w-16 h-20 aspect-[4/5] rounded-sm overflow-hidden bg-paper flex-shrink-0 border border-border">
                              <img src={imagePreview} alt="Crop Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col flex-grow min-w-0 pr-8">
                              <span className="font-body text-sm font-bold text-ink truncate">
                                {formData.profileImage?.name || 'profile.jpg'}
                              </span>
                              <span className="font-mono text-[10px] text-emerald-600 tracking-widest uppercase mt-1 flex items-center gap-1.5 font-bold">
                                <CheckCircle2 size={11} />
                                CROPPED & READY ({(formData.profileImage.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setCropModalOpen(true)}
                                  className="font-mono text-[10px] font-bold text-spark hover:underline uppercase flex items-center gap-1"
                                >
                                  <Crop size={12} />
                                  Adjust Crop
                                </button>
                                <span className="text-border">•</span>
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="font-mono text-[10px] font-bold text-ink-soft hover:text-ink uppercase"
                                >
                                  Change Photo
                                </button>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={removeImage}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
                              title="Remove image"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 mt-4 border-t border-border">
                      <button 
                        type="submit"
                        disabled={formState === 'SENDING' || imageProcessing}
                        className="w-full rounded-[10px] bg-spark px-10 py-5 font-medium text-ink transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group shadow-xl shadow-spark/20 disabled:opacity-70 disabled:translate-y-0"
                      >
                        {formState === 'SENDING' ? (
                          <div className="flex items-center gap-3">
                             <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
                             SUBMITTING...
                          </div>
                        ) : (
                          <>
                            JOIN BRAINSTORM
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </section>

      {/* ── Photo Crop Modal ── */}
      <MemberPhotoEditor
        isOpen={cropModalOpen}
        imageSrc={rawImageForCrop || imagePreview}
        fileName={rawFileName}
        aspect={4 / 5}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
        theme="auto"
        title="Adjust Profile Photo"
      />

      <Footer />
    </div>
  );
}
