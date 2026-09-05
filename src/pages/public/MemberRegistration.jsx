import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Upload, X, FileWarning, AlertCircle, ShieldAlert, Crop } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../../components/layout/Footer';
import imageCompression from 'browser-image-compression';
import MemberPhotoEditor from '../../components/common/MemberPhotoEditor';

gsap.registerPlugin(ScrollTrigger);

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
  const [formState, setFormState] = useState('DEFAULT'); // DEFAULT, SENDING, SUCCESS, DUPLICATE, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  
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
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (rawImageForCrop) URL.revokeObjectURL(rawImageForCrop);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }
      );
    }
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

  // Sync WhatsApp
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

      // Handle HEIC conversion
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
    
    // 1. Strict Validation
    if (!formData.course) return setErrorMessage('Please select your course.');
    if (!formData.role) return setErrorMessage('Please select a role.');
    if (!formData.profileImage) return setErrorMessage('Please upload a profile image (under 5MB).');

    // 2. Normalize Registration Number
    const normalizedRegNo = formData.regNo.trim().toUpperCase();

    // 3. Backend Mock Security Check: Prevent Admin Roles
    if (ADMIN_ROLES.includes(formData.role)) {
      setErrorMessage('SECURITY ERROR: The selected role requires Administrator privileges to assign.');
      return;
    }

    setFormState('SENDING');
    
    // Create FormData for file upload
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

    // Call real backend API
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

  return (
    <div className="w-full bg-white dark:bg-[#080D1A] min-h-screen text-slate-900 dark:text-[#F8FAFC] font-body transition-colors duration-300">
      
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden border-b border-slate-200 dark:border-[#26344D]">
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px', color: 'currentColor' }} />
        
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div ref={heroRef} className="max-w-4xl flex flex-col items-start">
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary border border-brand-primary/30 px-3 py-1.5 rounded-sm bg-brand-primary/5">
                LPU SCA / BRAINSTORM CLUB
              </div>
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500 dark:text-[#71819B] border border-slate-200 dark:border-[#26344D] px-3 py-1.5 rounded-sm bg-white dark:bg-[#111A2D]">
                MEMBERSHIP / REGISTRATION
              </div>
            </div>
            
            <h1 className="font-heading font-black text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-tighter text-slate-900 dark:text-[#F8FAFC] mb-8 uppercase">
              JOIN THE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">BRAINSTORM</span><br/>
              TEAM.
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
                 </span>
                 <span className="font-mono text-[10px] font-bold tracking-widest text-slate-500 dark:text-[#71819B] uppercase">REGISTRATION / OPEN</span>
            </div>

            <p className="font-body text-lg md:text-xl text-slate-600 dark:text-[#A8B5CC] max-w-2xl font-light leading-relaxed">
              Register as a Brainstorm member and become part of the community building ideas, projects, events and technology at LPU.
            </p>
          </div>
        </div>
      </section>

      {/* REGISTRATION FORM AREA */}
      <section className="py-12 md:py-24 bg-slate-50 dark:bg-[#0D1424]">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* LEFT: INFO & TIMELINE */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-12">
              <div className="sticky top-32">
                
                <div className="mb-12">
                  <h3 className="font-heading font-black text-2xl uppercase tracking-tight text-slate-900 dark:text-[#F8FAFC] mb-4">
                    BECOME PART OF THE TEAM.
                  </h3>
                  <p className="font-body text-slate-600 dark:text-[#A8B5CC] font-light leading-relaxed mb-8">
                    Complete your registration to officially join the club. Ensure your registration number is accurate.
                  </p>
                  
                  <div className="p-6 border border-brand-primary/20 bg-brand-primary/5 rounded-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-brand-primary font-mono text-[10px] font-bold tracking-widest uppercase">
                      <ShieldAlert size={14} /> SECURITY NOTICE
                    </div>
                    <p className="text-sm font-body text-slate-700 dark:text-[#F8FAFC] font-medium">One registration per student.</p>
                    <p className="text-xs font-body text-slate-500 dark:text-[#71819B]">Registration number is used to prevent duplicate membership records.</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B] mb-6">MEMBERSHIP STRUCTURE</h3>
                  <div className="flex flex-col gap-4 relative">
                    <div className="absolute left-[9px] top-4 bottom-4 w-px bg-slate-200 dark:bg-[#26344D]"></div>
                    {[
                      { step: '01', title: 'REGISTER', desc: 'Provide your core academic and contact details.' },
                      { step: '02', title: 'VERIFY', desc: 'System verifies registration number uniqueness.' },
                      { step: '03', title: 'ASSIGN ROLE', desc: 'Secure your public team role in the directory.' },
                      { step: '04', title: 'BUILD TOGETHER', desc: 'Welcome to the Brainstorm club.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-6 relative z-10">
                        <div className="w-[19px] h-[19px] rounded-full bg-slate-50 dark:bg-[#0D1424] border-2 border-brand-primary flex items-center justify-center mt-0.5">
                           <div className="w-1.5 h-1.5 bg-brand-primary rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-heading font-bold text-slate-900 dark:text-[#F8FAFC] tracking-widest uppercase">{item.step} / {item.title}</span>
                          <span className="font-body text-sm text-slate-500 dark:text-[#71819B] mt-1">{item.desc}</span>
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
                <div className="w-full bg-white dark:bg-[#111A2D] border border-slate-200 dark:border-[#26344D] p-8 md:p-16 rounded-sm shadow-sm flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 min-h-[600px]">
                  <div className="w-20 h-20 rounded-full bg-brand-primary/10 dark:bg-[#151F33] flex items-center justify-center mb-8 text-brand-primary border border-brand-primary/20">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary mb-4">
                    REGISTRATION STATUS / ✓ REGISTERED
                  </div>
                  <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-slate-900 dark:text-[#F8FAFC] mb-6">
                    WELCOME TO BRAINSTORM.
                  </h2>
                  <p className="font-body text-lg text-slate-600 dark:text-[#A8B5CC] max-w-md mx-auto mb-12">
                    Your membership registration has been successfully received. Your details have been added to the Brainstorm member system.
                  </p>
                  <Link to="/" className="bg-slate-900 dark:bg-brand-primary text-white px-8 py-4 font-mono text-[10px] font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-xl shadow-brand-primary/10 rounded-sm">
                    BACK TO BRAINSTORM
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}

              {/* DUPLICATE ERROR STATE */}
              {formState === 'DUPLICATE' && (
                <div className="w-full bg-white dark:bg-[#111A2D] border border-red-200 dark:border-red-900/30 p-8 md:p-16 rounded-sm shadow-sm flex flex-col items-center justify-center text-center animate-in slide-in-from-right duration-500 min-h-[600px]">
                  <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-8 text-red-500 border border-red-200 dark:border-red-500/30">
                    <ShieldAlert size={40} />
                  </div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-red-500 mb-4">
                    REGISTRATION REJECTED / DUPLICATE
                  </div>
                  <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-slate-900 dark:text-[#F8FAFC] mb-6">
                    ALREADY REGISTERED.
                  </h2>
                  <p className="font-body text-lg text-slate-600 dark:text-[#A8B5CC] max-w-md mx-auto mb-2">
                    This registration number ({formData.regNo.trim().toUpperCase()}) is already associated with a Brainstorm member.
                  </p>
                  <p className="font-body text-sm text-slate-500 dark:text-[#71819B] max-w-md mx-auto mb-12">
                    Each student can have only one membership registration.
                  </p>
                  <button 
                    onClick={() => setFormState('DEFAULT')}
                    className="bg-slate-100 dark:bg-[#151F33] text-slate-900 dark:text-[#F8FAFC] px-8 py-4 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-slate-200 dark:hover:bg-[#26344D] transition-colors rounded-sm"
                  >
                    BACK TO FORM
                  </button>
                </div>
              )}

              {/* FORM STATE */}
              {(formState === 'DEFAULT' || formState === 'SENDING') && (
                <div className="w-full bg-white dark:bg-[#111A2D] border border-slate-200 dark:border-[#26344D] p-6 md:p-12 rounded-sm shadow-sm">
                  
                  <div className="mb-10 pb-6 border-b border-slate-100 dark:border-[#26344D] flex justify-between items-end">
                    <div>
                      <h2 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-tight text-slate-900 dark:text-[#F8FAFC] mb-2">
                        MEMBERSHIP APPLICATION
                      </h2>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 flex items-start gap-3 rounded-sm">
                      <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-sm font-body text-red-700 dark:text-red-400 font-medium">{errorMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                    
                    {/* PERSONAL INFO */}
                    <div className="flex flex-col gap-6">
                      <h4 className="font-mono text-xs font-bold tracking-widest uppercase text-slate-900 dark:text-[#F8FAFC] border-b border-slate-100 dark:border-[#26344D] pb-3">
                        PERSONAL INFORMATION
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">FULL NAME *</label>
                          <input 
                            type="text" name="name" required placeholder="Enter your full name"
                            value={formData.name} onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm placeholder-slate-400 dark:placeholder-[#71819B]"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">REGISTRATION NUMBER *</label>
                          <input 
                            type="text" name="regNo" required placeholder="Enter your registration number"
                            value={formData.regNo} onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm placeholder-slate-400 dark:placeholder-[#71819B]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ACADEMICS */}
                    <div className="flex flex-col gap-6">
                      <h4 className="font-mono text-xs font-bold tracking-widest uppercase text-slate-900 dark:text-[#F8FAFC] border-b border-slate-100 dark:border-[#26344D] pb-3">
                        ACADEMIC INFORMATION
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">COURSE *</label>
                          <select 
                            name="course" required 
                            value={formData.course} onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm appearance-none cursor-pointer invalid:text-slate-400 dark:invalid:text-[#71819B]"
                          >
                            <option value="" disabled hidden>Select your course</option>
                            <option value="MCA" className="text-slate-900 dark:text-[#F8FAFC]">MCA</option>
                            <option value="BCA" className="text-slate-900 dark:text-[#F8FAFC]">BCA</option>
                            <option value="B.Sc IT" className="text-slate-900 dark:text-[#F8FAFC]">B.Sc IT</option>
                            <option value="M.Sc IT" className="text-slate-900 dark:text-[#F8FAFC]">M.Sc IT</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">SECTION *</label>
                          <input 
                            type="text" name="section" required placeholder="Enter your section"
                            value={formData.section} onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm placeholder-slate-400 dark:placeholder-[#71819B]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CONTACT */}
                    <div className="flex flex-col gap-6">
                      <h4 className="font-mono text-xs font-bold tracking-widest uppercase text-slate-900 dark:text-[#F8FAFC] border-b border-slate-100 dark:border-[#26344D] pb-3">
                        CONTACT INFORMATION
                      </h4>
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">EMAIL ADDRESS *</label>
                        <input 
                          type="email" name="email" required placeholder="you@example.com"
                          value={formData.email} onChange={handleInputChange}
                          className="w-full bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm placeholder-slate-400 dark:placeholder-[#71819B]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">PHONE NUMBER *</label>
                          <input 
                            type="tel" name="phone" required placeholder="Enter your phone number"
                            value={formData.phone} onChange={handleInputChange}
                            className="w-full bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm placeholder-slate-400 dark:placeholder-[#71819B]"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                            <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">WHATSAPP NUMBER *</label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox" 
                                  checked={sameAsPhone}
                                  onChange={(e) => setSameAsPhone(e.target.checked)}
                                  className="appearance-none w-4 h-4 border border-slate-300 dark:border-[#26344D] bg-slate-50 dark:bg-[#080D1A] rounded-[2px] checked:bg-brand-primary checked:border-brand-primary cursor-pointer transition-colors"
                                />
                                {sameAsPhone && <CheckCircle2 size={12} className="absolute text-white pointer-events-none" strokeWidth={4} />}
                              </div>
                              <span className="font-mono text-[8px] tracking-widest text-slate-500 dark:text-[#71819B] uppercase group-hover:text-slate-700 dark:group-hover:text-[#A8B5CC] transition-colors">Same as phone number</span>
                            </label>
                          </div>
                          <input 
                            type="tel" name="whatsapp" required placeholder="Enter your WhatsApp number"
                            value={formData.whatsapp} 
                            onChange={handleInputChange}
                            readOnly={sameAsPhone}
                            className={`w-full bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm placeholder-slate-400 dark:placeholder-[#71819B] ${sameAsPhone ? 'opacity-70 cursor-not-allowed' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ROLE & PROFILE */}
                    <div className="flex flex-col gap-6">
                      <h4 className="font-mono text-xs font-bold tracking-widest uppercase text-slate-900 dark:text-[#F8FAFC] border-b border-slate-100 dark:border-[#26344D] pb-3">
                        ROLE & PROFILE
                      </h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">ROLE *</label>
                          <span className="font-mono text-[8px] tracking-widest text-slate-400 dark:text-[#71819B] uppercase">Leadership roles assigned by admin</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {PUBLIC_ROLES.map(r => (
                            <label key={r} className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${formData.role === r ? 'border-brand-primary bg-brand-primary/5 dark:bg-[#151F33]' : 'border-slate-200 dark:border-[#26344D] bg-slate-50 dark:bg-[#080D1A] hover:border-brand-primary/50 dark:hover:border-[#6366F1]/50'}`}>
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="radio" 
                                  name="role"
                                  value={r}
                                  checked={formData.role === r}
                                  onChange={handleInputChange}
                                  className="appearance-none w-4 h-4 border border-slate-300 dark:border-[#26344D] rounded-full checked:border-brand-primary transition-colors"
                                />
                                {formData.role === r && <div className="absolute w-2 h-2 rounded-full bg-brand-primary pointer-events-none" />}
                              </div>
                              <span className={`font-body text-sm font-medium ${formData.role === r ? 'text-slate-900 dark:text-[#F8FAFC]' : 'text-slate-600 dark:text-[#A8B5CC]'}`}>{r}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="flex flex-col gap-2 mt-4">
                        <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">PROFILE IMAGE * (PNG, JPG, HEIC)</label>
                        
                        {!imagePreview ? (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-full border-2 border-dashed border-slate-300 dark:border-[#26344D] bg-slate-50 dark:bg-[#080D1A] hover:bg-slate-100 dark:hover:bg-[#151F33] hover:border-brand-primary/50 dark:hover:border-[#6366F1]/50 transition-all rounded-sm flex flex-col items-center justify-center p-12 group cursor-pointer"
                          >
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/webp"
                              onChange={handleImageUpload}
                              className="hidden" 
                            />
                            <div className="w-12 h-12 rounded-full bg-brand-primary/10 dark:bg-[#151F33] flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 transition-transform">
                              {imageProcessing ? (
                                 <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                 <Upload size={20} />
                              )}
                            </div>
                            <span className="font-heading font-bold text-slate-900 dark:text-[#F8FAFC] mb-2 text-center">
                              {imageProcessing ? 'PROCESSING...' : 'CHOOSE PHOTO & ADJUST CROP'}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-[#71819B] tracking-widest uppercase text-center">
                              PNG · JPG · HEIC · Max 5 MB (Auto-cropped to 4:5 Card Ratio)
                            </span>
                            
                            {imageError && (
                              <div className="absolute bottom-3 text-red-500 text-xs font-mono font-bold flex items-center gap-1 z-20">
                                <FileWarning size={12} /> {imageError}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full border border-slate-200 dark:border-[#26344D] bg-slate-50 dark:bg-[#080D1A] p-4 flex items-center gap-4 rounded-sm relative group overflow-hidden">
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic,image/webp"
                              onChange={handleImageUpload}
                              className="hidden" 
                            />
                            <div className="w-16 h-20 aspect-[4/5] rounded-sm overflow-hidden bg-slate-200 dark:bg-[#151F33] flex-shrink-0 border border-slate-300 dark:border-slate-700">
                              <img src={imagePreview} alt="Crop Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col flex-grow min-w-0 pr-8">
                              <span className="font-body text-sm font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                                {formData.profileImage?.name || 'profile.jpg'}
                              </span>
                              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mt-1 flex items-center gap-1.5 font-bold">
                                <CheckCircle2 size={11} />
                                CROPPED & READY ({(formData.profileImage.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setCropModalOpen(true)}
                                  className="font-mono text-[10px] font-bold text-brand-primary hover:underline uppercase flex items-center gap-1"
                                >
                                  <Crop size={12} />
                                  Adjust Crop
                                </button>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="font-mono text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase"
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
                    <div className="pt-6 mt-4 border-t border-slate-100 dark:border-[#26344D]">
                      <button 
                        type="submit"
                        disabled={formState === 'SENDING' || imageProcessing}
                        className="w-full bg-slate-900 dark:bg-brand-primary text-white px-10 py-5 font-heading font-semibold text-sm tracking-widest uppercase hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 group shadow-xl shadow-brand-primary/10 disabled:opacity-70 disabled:scale-100 rounded-sm"
                      >
                        {formState === 'SENDING' ? (
                          <div className="flex items-center gap-3">
                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

      <div className="dark:bg-[#050914] dark:border-t dark:border-[#26344D]">
        <Footer />
      </div>
    </div>
  );
}
