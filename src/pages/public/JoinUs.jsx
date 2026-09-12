import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Upload, X, FileWarning, Crop } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';
import MemberPhotoEditor from '../../components/common/MemberPhotoEditor';
import imageCompression from 'browser-image-compression';
import { validateRegistrationNumber, validatePhone, validateEmail, validateName, validateRequiredText } from '../../utils/validation';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const DOMAINS = ['Technical', 'Media', 'Anchor', 'Coordinator'];

const INTERESTS = [
  'Web Development', 'App Development', 'AI / ML', 'Data Science', 
  'Cybersecurity', 'Cloud', 'IoT', 'Blockchain', 'UI/UX', 'Other'
];

export default function JoinUs() {
  const navigate = useNavigate();
  const location = useLocation();

  const [errorMessage, setErrorMessage] = useState('');

  // ── Form data — supports restoration when Back is pressed from Rules page ──
  const restored = location.state?.restoredData;

  const [formData, setFormData] = useState({
    name:         restored?.name         ?? '',
    regNo:        restored?.regNo        ?? '',
    course:       restored?.course       ?? '',
    section:      restored?.section      ?? '',
    email:        restored?.email        ?? '',
    phone:        restored?.phone        ?? '',
    whatsapp:     restored?.whatsapp     ?? '',
    domain:       restored?.domain       ?? 'Technical',
    whyJoin:      restored?.whyJoin      ?? '',
    interests:    restored?.interests    ?? [],
    profileImage: restored?.profileImage ?? null,
  });

  const [sameAsPhone, setSameAsPhone] = useState(false);

  // Restore image preview if returning from rules page
  const [imagePreview, setImagePreview] = useState(() => {
    if (restored?.profileImage instanceof File) {
      return URL.createObjectURL(restored.profileImage);
    }
    return null;
  });

  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageError, setImageError] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState(null);
  const [rawFileName, setRawFileName] = useState('profile.jpg');
  const fileInputRef = useRef(null);

  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const backgroundRef = useRef(null);

  usePageReveal(containerRef);
  useScrollReveal(containerRef);

  useGSAP(() => {
    if (!heroRef.current) return undefined;
    const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
    const ctx = gsap.context(() => {
      const intro = !reduced ? gsap.timeline()
        .from(backgroundRef.current, { opacity: 0, scale: 1.025, duration: .7, clearProps: 'all' }, .1)
        .from('[data-join-hero-line]', { opacity: 0, y: 30, duration: .65, stagger: .12, clearProps: 'all' }, .35)
        .from('[data-join-hero-copy]', { opacity: 0, y: 12, duration: .45, stagger: .08, clearProps: 'all' }, .8) : null;
      const electric = !reduced ? gsap.timeline({ repeat: -1 })
        .to('.electric-trace',         { strokeDashoffset: -192, duration: 2.8, ease: 'none', stagger: .45 }, 0)
        .to('.electric-trace-reverse', { strokeDashoffset:  192, duration: 3.2, ease: 'none', stagger: .45 }, 0) : null;
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
    // Only scroll to top on fresh entry, not when restoring from Rules page
    if (!restored) window.scrollTo(0, 0);
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (rawImageForCrop) URL.revokeObjectURL(rawImageForCrop);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sameAsPhone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [formData.phone, sameAsPhone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const current = prev.interests;
      if (current.includes(interest)) {
        return { ...prev, interests: current.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...current, interest] };
      }
    });
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
      const options = { maxSizeMB: 2.0, maxWidthOrHeight: 1200, useWebWorker: true };
      const compressedFile = await imageCompression(croppedFile, options);

      if (compressedFile.size > 5 * 1024 * 1024) {
        throw new Error('Compressed image exceeds 5MB limit. Please choose a different crop.');
      }

      if (imagePreview) URL.revokeObjectURL(imagePreview);

      setFormData(prev => ({ ...prev, profileImage: compressedFile }));
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

  const handleCropCancel = () => setCropModalOpen(false);

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (rawImageForCrop) URL.revokeObjectURL(rawImageForCrop);
    setFormData(prev => ({ ...prev, profileImage: null }));
    setImagePreview(null);
    setRawImageForCrop(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit: validate then navigate to rules page — NO API call yet ──────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const errors = [
      validateName(formData.fullName, 'Full name'),
      validateRegistrationNumber(formData.regNo),
      validateRequiredText(formData.course, 'Course', 2, 100),
      validateRequiredText(formData.section, 'Section', 2, 50),
      validateEmail(formData.email),
      validatePhone(formData.phone, 'Phone number'),
      formData.whatsapp && !sameAsPhone ? validatePhone(formData.whatsapp, 'WhatsApp number') : null,
      validateRequiredText(formData.whyJoin, 'Why join', 10, 1000)
    ].filter(Boolean);

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (formData.interests.length === 0) {
      setErrorMessage('Please select at least one technical interest.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.profileImage) {
      setErrorMessage('Please upload a profile image (under 5MB).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // All validation passed — hand off to Rules page (File survives router state)
    navigate('/join-us/rules', { state: { pendingData: formData } });
  };

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
            
            <div data-join-hero-copy className="flex flex-wrap gap-4 mb-8">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-circuit border border-circuit/30 px-3 py-1.5 rounded-sm bg-circuit/5">
                LPU SCA / BRAINSTORM CLUB
              </div>
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft border border-border px-3 py-1.5 rounded-sm bg-paper">
                MEMBERSHIP / APPLICATION
              </div>
            </div>
            
            <h1 className="font-heading font-black uppercase tracking-tight leading-[0.88] text-ink" style={{ fontSize: 'clamp(3.5rem,10vw,7.5rem)' }}>
              <span data-join-hero-line className="block">JOIN THE</span>
              <span data-join-hero-line className="block text-transparent bg-clip-text bg-gradient-to-r from-circuit to-spark">BRAINSTORM</span>
              <span data-join-hero-line className="block">COMMUNITY.</span>
            </h1>
            
            <p data-join-hero-copy className="mt-8 font-body text-lg md:text-xl text-ink-soft max-w-2xl font-light leading-relaxed">
              Become part of LPU's student-led technology community where ideas become projects, skills become experience, and students build together.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN APPLICATION AREA */}
      <section className="py-16 md:py-24 bg-paper-dim border-b border-border px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24" data-reveal="up">
            
            {/* LEFT: BENEFITS & PROCESS */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-12">
              <div className="sticky top-32">
                
                <div className="mb-12">
                  <h3 className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft mb-6 flex items-center gap-3">
                    <span className="w-6 h-px bg-border"></span>
                    WHY JOIN BRAINSTORM?
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Build real-world projects',
                      'Participate in hackathons and workshops',
                      'Collaborate with other technical students',
                      'Learn from peers and mentors',
                      'Turn ideas into working solutions'
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-circuit mt-2 flex-shrink-0" />
                         <span className="font-body text-ink-soft leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft mb-6 flex items-center gap-3">
                    <span className="w-6 h-px bg-border"></span>
                    APPLICATION PROCESS
                  </h3>
                  <div className="flex flex-col gap-4 relative">
                    <div className="absolute left-[9px] top-4 bottom-4 w-px bg-border"></div>
                    {[
                      { step: '01', title: 'APPLY',   desc: 'Submit your details.' },
                      { step: '02', title: 'REVIEW',  desc: 'We evaluate your application.' },
                      { step: '03', title: 'CONNECT', desc: 'Join the community.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-6 relative z-10">
                        <div className="w-[19px] h-[19px] rounded-full bg-paper-dim border-2 border-circuit flex items-center justify-center mt-0.5">
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

            {/* RIGHT: FORM */}
            <div className="col-span-1 lg:col-span-8">
              
              <div className="w-full bg-paper border border-border p-6 md:p-12 rounded-sm shadow-sys">
                
                <div className="mb-10 pb-6 border-b border-border">
                  <h2 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-tight text-ink mb-2">
                    MEMBERSHIP APPLICATION
                  </h2>
                  <p className="font-body text-ink-soft">
                    Complete your details to apply for the Brainstorm community. All fields are required.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-200 flex items-start gap-3 rounded-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-red-500 mt-0.5 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <p className="text-sm font-body text-red-700">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                  
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">FULL NAME *</label>
                      <input 
                        type="text" name="name" required maxLength={100} placeholder="Enter your full name"
                        value={formData.name} onChange={handleInputChange}
                        className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">REGISTRATION NUMBER *</label>
                      <input 
                        type="text" inputMode="numeric" pattern="\d*" maxLength={8} name="regNo" required placeholder="Enter your registration number"
                        value={formData.regNo} onChange={handleInputChange}
                        className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys uppercase"
                      />
                    </div>
                  </div>

                  {/* Academics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">COURSE *</label>
                      <select 
                        name="course" required 
                        value={formData.course} onChange={handleInputChange}
                        className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink focus:outline-none focus:border-circuit transition-colors rounded-sm appearance-none cursor-pointer invalid:text-ink-soft"
                      >
                        <option value="" disabled hidden>Select your course</option>
                        <option value="MCA"     className="text-ink">MCA</option>
                        <option value="BCA"     className="text-ink">BCA</option>
                        <option value="B.Sc IT" className="text-ink">B.Sc IT</option>
                        <option value="M.Sc IT" className="text-ink">M.Sc IT</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">SECTION *</label>
                      <input 
                        type="text" name="section" required maxLength={50} placeholder="Enter your section"
                        value={formData.section} onChange={handleInputChange}
                        className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys uppercase"
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">EMAIL ADDRESS *</label>
                    <input 
                      type="email" name="email" required placeholder="you@example.com"
                      value={formData.email} onChange={handleInputChange}
                      className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">PHONE NUMBER *</label>
                      <input 
                        type="tel" inputMode="numeric" pattern="\d*" maxLength={10} name="phone" required placeholder="Enter your phone number"
                        value={formData.phone} onChange={handleInputChange}
                        className="w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys"
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
                              className="appearance-none w-4 h-4 border border-border bg-paper-dim rounded-[2px] checked:bg-circuit checked:border-circuit cursor-pointer transition-colors"
                            />
                            {sameAsPhone && <CheckCircle2 size={12} className="absolute text-paper pointer-events-none" strokeWidth={4} />}
                          </div>
                          <span className="font-mono text-[8px] tracking-widest text-ink-soft uppercase group-hover:text-ink transition-colors">Same as phone number</span>
                        </label>
                      </div>
                      <input 
                        type="tel" inputMode="numeric" pattern="\d*" maxLength={10} name="whatsapp" required placeholder="Enter your WhatsApp number"
                        value={formData.whatsapp} 
                        onChange={handleInputChange}
                        readOnly={sameAsPhone}
                        className={`w-full bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys ${sameAsPhone ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Domain Selection */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                      <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">
                        DESIRED DOMAIN *
                      </label>
                      <span className="font-mono text-[9px] text-circuit font-bold tracking-wider uppercase">
                        Selected: {formData.domain}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {DOMAINS.map((dom) => {
                        const isSelected = formData.domain === dom;
                        return (
                          <button
                            type="button"
                            key={dom}
                            onClick={() => setFormData(prev => ({ ...prev, domain: dom }))}
                            className={`py-3 px-3 border rounded-sm font-mono text-xs font-bold tracking-wider transition-all duration-300 text-center uppercase ${
                              isSelected
                                ? 'bg-circuit border-circuit text-paper shadow-[0_0_15px_rgba(79,70,229,0.25)] scale-[1.02]'
                                : 'bg-paper-dim border-border text-ink-soft hover:border-circuit/50'
                            }`}
                          >
                            {dom}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] font-mono text-ink-soft">
                      Choose your primary team interest. Leadership positions (Head Coordinator, Technical Head, Social Media Head) are assigned by administrators after review.
                    </p>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-col gap-4">
                    <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">TECHNICAL INTERESTS * (Select at least one)</label>
                    <div className="flex flex-wrap gap-3">
                      {INTERESTS.map((interest) => {
                        const isSelected = formData.interests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`px-4 py-2 border rounded-sm font-mono text-[10px] font-bold tracking-wider transition-all duration-300 ${
                              isSelected 
                                ? 'bg-circuit border-circuit text-paper shadow-[0_0_15px_rgba(79,70,229,0.2)]' 
                                : 'bg-paper-dim border-border text-ink-soft hover:border-circuit/50'
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Why Join */}
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">WHY DO YOU WANT TO JOIN? *</label>
                    <textarea 
                      name="whyJoin" required minLength="20" placeholder="Tell us why you want to join Brainstorm and what you hope to contribute (min 20 characters)."
                      value={formData.whyJoin} onChange={handleInputChange}
                      className="w-full min-h-[160px] resize-y bg-paper-dim border border-border px-5 py-4 font-body text-ink placeholder-ink-soft focus:outline-none focus:border-circuit transition-colors rounded-sm shadow-sys"
                    ></textarea>
                  </div>

                  {/* Image Upload */}
                  <div className="flex flex-col gap-4">
                    <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-ink-soft">PROFILE IMAGE * (PNG, JPG, JPEG, HEIC)</label>
                    
                    {!imagePreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-full border-2 border-dashed border-border bg-paper-dim hover:bg-paper hover:border-circuit/50 transition-all rounded-sm flex flex-col items-center justify-center p-10 group cursor-pointer"
                      >
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/webp"
                          onChange={handleImageUpload}
                          className="hidden" 
                        />
                        <div className="w-12 h-12 rounded-full bg-circuit/10 flex items-center justify-center text-circuit mb-4 group-hover:scale-110 transition-transform">
                          {imageProcessing ? (
                             <div className="w-5 h-5 border-2 border-circuit border-t-transparent rounded-full animate-spin"></div>
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
                              className="font-mono text-[10px] font-bold text-circuit hover:underline uppercase flex items-center gap-1"
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

                  {/* ── Submit → navigates to rules page, NO API call here ── */}
                  <div className="pt-6 mt-4 border-t border-border">
                    <button 
                      type="submit"
                      disabled={imageProcessing}
                      className="w-full rounded-[10px] bg-spark px-10 py-5 font-medium text-ink transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group shadow-xl shadow-spark/20 disabled:opacity-70 disabled:translate-y-0"
                    >
                      REVIEW RULES & SUBMIT
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-center font-mono text-[10px] text-ink-soft tracking-wider mt-3">
                      You will review the club rules before your request is submitted.
                    </p>
                  </div>

                </form>
              </div>
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
