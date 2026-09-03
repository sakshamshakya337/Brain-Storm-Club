import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Upload, X, FileImage, AlertCircle, FileWarning } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../../components/layout/Footer';

// Dynamically import compression libs to prevent SSR issues if this was Next.js (fine for Vite)
import imageCompression from 'browser-image-compression';

gsap.registerPlugin(ScrollTrigger);

const INTERESTS = [
  'Web Development', 'App Development', 'AI / ML', 'Data Science', 
  'Cybersecurity', 'Cloud', 'IoT', 'Blockchain', 'UI/UX', 'Other'
];

export default function JoinUs() {
  const [formState, setFormState] = useState('DEFAULT'); // DEFAULT, SENDING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    course: '',
    section: '',
    email: '',
    phone: '',
    whatsapp: '',
    whyJoin: '',
    interests: [],
    profileImage: null
  });

  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageError, setImageError] = useState('');

  const heroRef = useRef(null);
  const contentRef = useRef(null);

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

  // Sync WhatsApp when phone changes if checkbox is checked
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
    const file = e.target.files[0];
    if (!file) return;

    setImageError('');
    setImageProcessing(true);

    try {
      let fileToProcess = file;
      
      // Handle HEIC conversion
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        // heic2any can return an array of blobs if it's an animation, grab first
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        fileToProcess = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      }

      // Check if it's already under 5MB and a valid image
      if (fileToProcess.size <= 5 * 1024 * 1024 && fileToProcess.type.startsWith('image/')) {
         setFormData(prev => ({ ...prev, profileImage: fileToProcess }));
         setImagePreview(URL.createObjectURL(fileToProcess));
         setImageProcessing(false);
         return;
      }

      // Compress if larger than 5MB
      const options = {
        maxSizeMB: 4.8, // Target safely under 5MB
        maxWidthOrHeight: 2048,
        useWebWorker: true
      };

      const compressedFile = await imageCompression(fileToProcess, options);
      
      if (compressedFile.size > 5 * 1024 * 1024) {
        throw new Error('Unable to compress image under 5MB. Please choose a different image.');
      }

      setFormData(prev => ({ ...prev, profileImage: compressedFile }));
      setImagePreview(URL.createObjectURL(compressedFile));

    } catch (err) {
      console.error(err);
      setImageError(err.message || 'Error processing image. Please try another file (JPG, PNG).');
      setFormData(prev => ({ ...prev, profileImage: null }));
      setImagePreview(null);
    } finally {
      setImageProcessing(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
    setImagePreview(null);
    setImageError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Strict Validation
    if (!formData.course) {
      setErrorMessage('Please select your course.');
      return;
    }
    if (formData.interests.length === 0) {
      setErrorMessage('Please select at least one technical interest.');
      return;
    }
    if (!formData.profileImage) {
      setErrorMessage('Please upload a profile image (under 5MB).');
      return;
    }
    if (formData.whyJoin.length < 20) {
      setErrorMessage('Please provide a more detailed reason for joining (min 20 chars).');
      return;
    }

    setFormState('SENDING');
    
    const submitData = new FormData();
    submitData.append('fullName', formData.name);
    submitData.append('registrationNumber', formData.regNo.trim().toUpperCase());
    submitData.append('course', formData.course);
    submitData.append('section', formData.section);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('whatsapp', formData.whatsapp);
    submitData.append('whyJoin', formData.whyJoin);
    
    // Append interests array correctly
    formData.interests.forEach(interest => {
      submitData.append('interests[]', interest);
    });
    
    submitData.append('profileImage', formData.profileImage);

    fetch('/api/public/join-us', {
      method: 'POST',
      body: submitData
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        setFormState('SUCCESS');
      } else {
        setFormState('DEFAULT');
        setErrorMessage(data.message || 'Error submitting application.');
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
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-slate-200 dark:border-[#26344D]">
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '48px 48px', color: 'currentColor' }} />
        
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] relative z-10">
          <div ref={heroRef} className="max-w-4xl flex flex-col items-start">
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary border border-brand-primary/30 px-3 py-1.5 rounded-sm bg-brand-primary/5">
                LPU SCA / BRAINSTORM CLUB
              </div>
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500 dark:text-[#71819B] border border-slate-200 dark:border-[#26344D] px-3 py-1.5 rounded-sm bg-white dark:bg-[#111A2D]">
                MEMBERSHIP / APPLICATION
              </div>
            </div>
            
            <h1 className="font-heading font-black text-[clamp(3rem,6vw,5rem)] leading-[0.95] tracking-tighter text-slate-900 dark:text-[#F8FAFC] mb-8 uppercase">
              JOIN THE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">BRAINSTORM</span><br/>
              COMMUNITY.
            </h1>
            
            <p className="font-body text-lg md:text-xl text-slate-600 dark:text-[#A8B5CC] max-w-2xl font-light leading-relaxed">
              Become part of LPU's student-led technology community where ideas become projects, skills become experience, and students build together.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN APPLICATION AREA */}
      <section className="py-12 md:py-24 bg-slate-50 dark:bg-[#0D1424]">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* LEFT: BENEFITS & PROCESS */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-12">
              <div className="sticky top-32">
                
                <div className="mb-12">
                  <h3 className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B] mb-6">WHY JOIN BRAINSTORM?</h3>
                  <ul className="space-y-4">
                    {[
                      'Build real-world projects',
                      'Participate in hackathons and workshops',
                      'Collaborate with other technical students',
                      'Learn from peers and mentors',
                      'Turn ideas into working solutions'
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0" />
                         <span className="font-body text-slate-700 dark:text-[#A8B5CC] leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B] mb-6">APPLICATION PROCESS</h3>
                  <div className="flex flex-col gap-4 relative">
                    <div className="absolute left-[9px] top-4 bottom-4 w-px bg-slate-200 dark:bg-[#26344D]"></div>
                    {[
                      { step: '01', title: 'APPLY', desc: 'Submit your details.' },
                      { step: '02', title: 'REVIEW', desc: 'We evaluate your application.' },
                      { step: '03', title: 'CONNECT', desc: 'Join the community.' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-6 relative z-10">
                        <div className="w-[19px] h-[19px] rounded-full bg-white dark:bg-[#111A2D] border-2 border-brand-primary flex items-center justify-center mt-0.5">
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

            {/* RIGHT: FORM */}
            <div className="col-span-1 lg:col-span-8">
              
              {formState === 'SUCCESS' ? (
                <div className="w-full bg-white dark:bg-[#111A2D] border border-slate-200 dark:border-[#26344D] p-8 md:p-16 rounded-sm shadow-sm flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 min-h-[600px]">
                  <div className="w-20 h-20 rounded-full bg-brand-primary/10 dark:bg-[#151F33] flex items-center justify-center mb-8 text-brand-primary border border-brand-primary/20">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-brand-primary mb-4">
                    APPLICATION STATUS / RECEIVED
                  </div>
                  <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-slate-900 dark:text-[#F8FAFC] mb-6">
                    APPLICATION RECEIVED.
                  </h2>
                  <p className="font-body text-lg text-slate-600 dark:text-[#A8B5CC] max-w-md mx-auto mb-12">
                    Thanks for applying to Brainstorm. Your application has been successfully submitted and is under review.
                  </p>
                  <Link to="/" className="bg-slate-900 dark:bg-brand-primary text-white px-8 py-4 font-mono text-[10px] font-bold tracking-widest uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-xl shadow-brand-primary/10 rounded-sm">
                    BACK TO HOME
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="w-full bg-white dark:bg-[#111A2D] border border-slate-200 dark:border-[#26344D] p-6 md:p-12 rounded-sm shadow-sm">
                  
                  <div className="mb-10 pb-6 border-b border-slate-100 dark:border-[#26344D]">
                    <h2 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-tight text-slate-900 dark:text-[#F8FAFC] mb-2">
                      MEMBERSHIP APPLICATION
                    </h2>
                    <p className="font-body text-slate-500 dark:text-[#71819B]">
                      Complete your details to apply for the Brainstorm community. All fields are required.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 flex items-start gap-3 rounded-sm">
                      <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-sm font-body text-red-700 dark:text-red-400">{errorMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    
                    {/* Basic Info */}
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

                    {/* Academics */}
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

                    {/* Contact */}
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

                    {/* Interests */}
                    <div className="flex flex-col gap-4">
                      <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">TECHNICAL INTERESTS * (Select at least one)</label>
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
                                  ? 'bg-brand-primary border-brand-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                                  : 'bg-slate-50 dark:bg-[#080D1A] border-slate-200 dark:border-[#26344D] text-slate-600 dark:text-[#A8B5CC] hover:border-brand-primary/50 dark:hover:border-[#6366F1]/50'
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
                      <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">WHY DO YOU WANT TO JOIN? *</label>
                      <textarea 
                        name="whyJoin" required minLength="20" placeholder="Tell us why you want to join Brainstorm and what you hope to contribute (min 20 characters)."
                        value={formData.whyJoin} onChange={handleInputChange}
                        className="w-full min-h-[160px] resize-y bg-slate-50 dark:bg-[#080D1A] border border-slate-200 dark:border-[#26344D] px-5 py-4 font-body text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-brand-primary dark:focus:border-[#6366F1] transition-colors rounded-sm placeholder-slate-400 dark:placeholder-[#71819B]"
                      ></textarea>
                    </div>

                    {/* Image Upload */}
                    <div className="flex flex-col gap-4">
                      <label className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-[#71819B]">PROFILE IMAGE * (PNG, JPG, JPEG, HEIC)</label>
                      
                      {!imagePreview ? (
                        <div className="relative w-full border-2 border-dashed border-slate-300 dark:border-[#26344D] bg-slate-50 dark:bg-[#080D1A] hover:bg-slate-100 dark:hover:bg-[#0D1424] hover:border-brand-primary/50 dark:hover:border-[#6366F1]/50 transition-all rounded-sm flex flex-col items-center justify-center p-12 group cursor-pointer">
                          <input 
                            type="file" 
                            accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          />
                          <div className="w-12 h-12 rounded-full bg-brand-primary/10 dark:bg-[#151F33] flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 transition-transform">
                            {imageProcessing ? (
                               <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                               <Upload size={20} />
                            )}
                          </div>
                          <span className="font-heading font-bold text-slate-900 dark:text-[#F8FAFC] mb-2">
                            {imageProcessing ? 'PROCESSING...' : 'CLICK OR DRAG TO UPLOAD'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-[#71819B] tracking-widest uppercase">
                            MAX FINAL SIZE: 5 MB (Auto-compressed)
                          </span>
                          
                          {imageError && (
                            <div className="absolute bottom-4 text-red-500 text-xs font-mono font-bold mt-2 flex items-center gap-1 z-20">
                              <FileWarning size={12} /> {imageError}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full border border-slate-200 dark:border-[#26344D] bg-slate-50 dark:bg-[#080D1A] p-4 flex items-center gap-4 rounded-sm relative group overflow-hidden">
                          <div className="w-16 h-16 rounded-sm overflow-hidden bg-slate-200 dark:bg-[#151F33] flex-shrink-0">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col flex-grow min-w-0 pr-8">
                            <span className="font-body text-sm font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                              {formData.profileImage.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-[#71819B] tracking-widest uppercase mt-1 flex items-center gap-2">
                              <CheckCircle2 size={10} className="text-brand-primary" />
                              READY ({(formData.profileImage.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
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

      {/* OVERRIDING GLOBAL FOOTER WRAPPER FOR STRICT DARK THEME COMPLIANCE */}
      <div className="dark:bg-[#050914] dark:border-t dark:border-[#26344D]">
        <Footer />
      </div>
    </div>
  );
}
