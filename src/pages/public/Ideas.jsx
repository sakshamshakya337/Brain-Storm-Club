import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Upload, X, FileText, AlertCircle,
  Lightbulb, Target, Sparkles, FileWarning, Loader2
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import Footer from '../../components/layout/Footer';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { validatePhone, validateName, validateRequiredText } from '../../utils/validation';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_PDF_BYTES = 2 * 1024 * 1024; // 2 MB

const CATEGORIES = [
  'AI / Machine Learning',
  'Web Development',
  'App Development',
  'Cybersecurity',
  'Cloud / DevOps',
  'IoT / Hardware',
  'Data Science',
  'Blockchain',
  'UI / UX',
  'Social Impact',
  'Other',
];

// ─── PDF compression helper ───────────────────────────────────────────────────
// pdf-lib re-serialises the document which strips unused objects/metadata.
// This won't rival Ghostscript but genuinely reduces bloated/exported PDFs.
async function compressPdf(arrayBuffer) {
  const srcDoc  = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const outDoc  = await PDFDocument.create();
  const indices = srcDoc.getPageIndices();
  const copied  = await outDoc.copyPages(srcDoc, indices);
  copied.forEach(p => outDoc.addPage(p));
  const bytes = await outDoc.save({ useObjectStreams: true, addDefaultPage: false });
  return bytes; // Uint8Array
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Ideas() {
  // Form state machine
  const [formState, setFormState] = useState('DEFAULT'); // DEFAULT | SUBMITTING | SUCCESS | ERROR
  const [errorMessage, setErrorMessage]  = useState('');

  const [formData, setFormData] = useState({
    name: '', course: '', section: '', contact: '',
    title: '', category: '', description: '', outcome: '',
  });

  // PDF state
  const [pdf, setPdf]               = useState(null);   // { file, bytes, originalSizeMB, finalSizeMB, status }
  const [pdfError, setPdfError]     = useState('');
  const fileInputRef                = useRef(null);

  const containerRef = useRef(null);
  usePageReveal(containerRef);
  useScrollReveal(containerRef);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePdfSelect = async (e) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';   // allow re-selecting same file
    if (!file) return;

    setPdfError('');
    setPdf({ status: 'LOADING', file, originalSizeMB: null, finalSizeMB: null, bytes: null });

    // 1. Validate MIME and extension
    const isMimePdf = file.type === 'application/pdf';
    const isExtPdf = file.name.toLowerCase().endsWith('.pdf');
    if (!isMimePdf && !isExtPdf) {
      setPdfError('Only PDF files are accepted. Please choose a valid .pdf file.');
      setPdf(null);
      return;
    }

    // Ensure the filename always preserves .pdf extension
    const properFileName = isExtPdf ? file.name : `${file.name}.pdf`;
    const originalSizeMB = +(file.size / (1024 * 1024)).toFixed(2);

    // 2. Already under 2 MB — accept as-is
    if (file.size <= MAX_PDF_BYTES) {
      const normalizedFile = new File([file], properFileName, { type: 'application/pdf' });
      setPdf({ status: 'READY', file: normalizedFile, originalSizeMB, finalSizeMB: originalSizeMB, bytes: null });
      return;
    }

    // 3. Over limit — attempt compression via pdf-lib
    setPdf({ status: 'COMPRESSING', file, originalSizeMB, finalSizeMB: null, bytes: null });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const compressed  = await compressPdf(arrayBuffer);
      const finalSizeMB = +(compressed.byteLength / (1024 * 1024)).toFixed(2);

      if (compressed.byteLength > MAX_PDF_BYTES) {
        setPdf(null);
        setPdfError(
          `Original: ${originalSizeMB} MB → Compressed: ${finalSizeMB} MB — still above 2 MB. ` +
          `Please upload a smaller or simpler PDF.`
        );
        return;
      }

      // Wrap Uint8Array back into a File with proper .pdf filename
      const compressedFile = new File([compressed], properFileName, { type: 'application/pdf' });
      setPdf({ status: 'READY', file: compressedFile, originalSizeMB, finalSizeMB, bytes: compressed });
    } catch (err) {
      console.error('[PDF compress error]', err);
      setPdf(null);
      setPdfError('Could not process the PDF. Please try a different file.');
    }
  };

  const removePdf = () => {
    setPdf(null);
    setPdfError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const errors = [
      validateName(formData.name, 'Full name'),
      validateRequiredText(formData.course, 'Course', 2, 100),
      validateRequiredText(formData.section, 'Section', 2, 50),
      validateRequiredText(formData.title, 'Project title', 2, 150),
      validateRequiredText(formData.description, 'Description', 30, 2000),
      validateRequiredText(formData.outcome, 'Expected outcome', 20, 1000)
    ].filter(Boolean);

    // custom contact check since it can be email or phone
    if (!formData.contact.trim()) {
      errors.push('Please provide your contact information (Email or Phone).');
    } else {
      const isEmail = formData.contact.includes('@');
      if (isEmail) {
        const eErr = validateEmail(formData.contact);
        if (eErr) errors.push(eErr);
      } else {
        const pErr = validatePhone(formData.contact, 'Contact number');
        if (pErr) errors.push(pErr);
      }
    }

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.category) {
      setErrorMessage('Please select a category.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (pdf && pdf.status !== 'READY') {
      setErrorMessage('Please wait for the PDF to finish processing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setFormState('SUBMITTING');

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v.trim()));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(formData.contact.trim())) {
      fd.append('email', formData.contact.trim().toLowerCase());
    }
    if (pdf?.file) fd.append('pdf', pdf.file);

    try {
      const res  = await fetch('/api/public/ideas', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setFormState('SUCCESS');
      } else {
        setFormState('ERROR');
        setErrorMessage(data.message || 'Submission failed. Please try again.');
      }
    } catch {
      setFormState('ERROR');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isBusy = formState === 'SUBMITTING' || pdf?.status === 'COMPRESSING';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-[var(--paper)] text-[var(--ink)] font-body overflow-x-hidden"
    >
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-[var(--border)] bg-[var(--paper)] px-6 pb-14 pt-16 md:px-12 md:pb-20 md:pt-20 lg:px-20">
        {/* Circuit artwork used by the Events page */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <img
            src="/circuit.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-bottom opacity-[0.24] scale-[1.02]"
          />
        </div>

        {/* Soft fade: artwork remains visible without reducing text contrast */}
        <div className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-b from-[var(--paper)]/95 via-[var(--paper)]/70 to-[var(--paper)]/90" />

        {/* Events-page style animated traces */}
        <svg
          className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-50"
          aria-hidden="true"
          viewBox="0 0 1440 500"
          preserveAspectRatio="none"
        >
          <path
            d="M0 100 H170 L230 150 H470 L530 95 H760 L820 145 H1060 L1120 85 H1440"
            fill="none"
            stroke="var(--circuit)"
            strokeWidth="1.1"
            strokeDasharray="8 36"
            className="electric-trace-reverse"
          />
          <path
            d="M0 390 H190 L250 340 H455 L520 405 H745 L810 350 H1020 L1090 410 H1440"
            fill="none"
            stroke="var(--spark)"
            strokeWidth="1"
            strokeDasharray="6 42"
            className="electric-trace"
          />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="reveal-eyebrow mb-7 flex flex-wrap items-center gap-3">
              <span className="border border-[var(--circuit)]/30 bg-[var(--paper)]/85 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] backdrop-blur-sm">
                LPU SCA / Brainstorm Club
              </span>
              <span className="border border-[var(--border)] bg-[var(--paper)]/85 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)] backdrop-blur-sm">
                Ideas / Submission
              </span>
            </div>

            <h1 className="font-heading font-black uppercase tracking-tight leading-[0.88] text-[var(--ink)] text-[clamp(3.5rem,9vw,7.5rem)]">
              <span className="reveal-heading-line block">Submit your</span>
              <span className="reveal-heading-line block bg-gradient-to-r from-[var(--circuit)] to-[var(--spark)] bg-clip-text text-transparent">
                idea.
              </span>
            </h1>

            <p className="reveal-text mt-8 max-w-2xl font-body text-lg leading-relaxed text-[var(--ink-soft)] md:text-xl">
              Have an idea that could make a difference? Share it with the Brainstorm community. The best ideas get pitched, prototyped and built — by you.
            </p>
          </div>
        </div>
      </section>

      {/* ── BENEFITS STRIP ──────────────────────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-[var(--paper-dim)]" data-reveal="stagger-children">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {[
              { icon: Lightbulb, label: '01 / IDEATE', desc: 'Submit any technology or impact idea — no prototype required.' },
              { icon: Sparkles,  label: '02 / REVIEW', desc: 'The Brainstorm team reviews every submission and provides feedback.' },
              { icon: Target,    label: '03 / BUILD',  desc: 'Shortlisted ideas get resources, a team and a shot at production.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 pt-8 sm:pt-0 sm:px-8 first:pt-0 first:pl-0 last:pr-0">
                <div className="w-10 h-10 rounded-sm bg-[var(--paper-dim)] bg-[var(--paper-dim)] flex items-center justify-center text-[var(--circuit)] shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--circuit)] mb-1">{label}</div>
                  <p className="font-body text-sm text-[var(--ink-soft)] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN FORM AREA ──────────────────────────────────────────────────── */}
      <section className="relative py-12 md:py-24 bg-[var(--paper)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            color: 'var(--ink)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24" data-reveal="up">

            {/* ── LEFT: Context ─────────────────────────────────────────────── */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-10">
              <div className="sticky top-28">
                <h3 className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink-soft)] mb-6">
                  WHAT TO INCLUDE
                </h3>
                <ul className="space-y-4 mb-10">
                  {[
                    'A clear, specific idea title',
                    'The problem your idea solves',
                    'Your proposed solution',
                    'The expected outcome or impact',
                    'A supporting PDF (optional, max 2 MB)',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" />
                      <span className="font-body text-[var(--ink-soft)] text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-5 border border-brand-primary/20 bg-[var(--paper-dim)] bg-[var(--paper)] rounded-sm">
                  <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--circuit)] mb-2">
                    IDEA STATUS FLOW
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <div className="absolute left-[7px] top-3 bottom-3 w-px bg-slate-200" />
                    {['New', 'Reviewed', 'Shortlisted', 'Implemented'].map((s, i) => (
                      <div key={s} className="flex items-center gap-3 relative z-10">
                        <div className="w-3.5 h-3.5 rounded-full bg-white bg-[var(--paper)] border-2 border-brand-primary shrink-0" />
                        <span className="font-mono text-[10px] font-bold tracking-widest text-[var(--ink-soft)] uppercase">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Form ───────────────────────────────────────────────── */}
            <div className="col-span-1 lg:col-span-8">

              {/* ── SUCCESS STATE ─────────────────────────────────────────── */}
              {formState === 'SUCCESS' ? (
                <div className="w-full bg-white bg-[var(--paper)] border border-[var(--border)] p-8 md:p-16 rounded-sm shadow-sm flex flex-col items-center justify-center text-center min-h-[600px]">
                  <div className="w-20 h-20 rounded-full bg-[var(--paper-dim)] bg-[var(--paper-dim)] flex items-center justify-center mb-8 text-[var(--circuit)] border border-brand-primary/20">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] mb-4">
                    SUBMISSION STATUS / RECEIVED
                  </div>
                  <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-[var(--ink)] mb-6">
                    IDEA RECEIVED.
                  </h2>
                  <p className="font-body text-lg text-[var(--ink-soft)] max-w-md mb-12">
                    Thanks for submitting your idea to Brainstorm. We'll review it and get back to you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        setFormState('DEFAULT');
                        setFormData({ name: '', course: '', section: '', contact: '', title: '', category: '', description: '', outcome: '' });
                        setPdf(null);
                        setPdfError('');
                        setErrorMessage('');
                      }}
                      className="bg-spark text-ink px-8 py-4 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-spark-soft hover:-translate-y-0.5 transition-colors flex items-center justify-center gap-2 group shadow-xl shadow-spark/20 rounded-[10px]"
                    >
                      SUBMIT ANOTHER IDEA
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <Link
                      to="/"
                      className="bg-paper border border-border text-ink px-8 py-4 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-paper-dim transition-colors flex items-center justify-center gap-2 rounded-[10px]"
                    >
                      BACK TO HOME
                    </Link>
                  </div>
                </div>
              ) : (
                /* ── FORM ─────────────────────────────────────────────────── */
                <div className="w-full bg-white bg-[var(--paper)] border border-[var(--border)] p-6 md:p-12 rounded-sm shadow-sm">

                  <div className="mb-10 pb-6 border-b border-[var(--border)]">
                    <h2 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-tight text-[var(--ink)] mb-2">
                      IDEA SUBMISSION
                    </h2>
                    <p className="font-body text-[var(--ink-soft)]">
                      All fields marked * are required.
                    </p>
                  </div>

                  {/* Error banner */}
                  {(errorMessage || formState === 'ERROR') && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 flex items-start gap-3 rounded-sm" role="alert">
                      <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                      <p className="text-sm font-body text-red-700">
                        {errorMessage || 'Something went wrong. Please try again.'}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

                    {/* ── Section 1: Your Details ─────────────────────────── */}
                    <fieldset className="flex flex-col gap-6">
                      <legend className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink-soft)] mb-2 border-b border-[var(--border)] pb-2 w-full">
                        01 / YOUR DETAILS
                      </legend>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Full Name *" name="name" maxLength={100} placeholder="Enter your full name" value={formData.name} onChange={handleInput} />
                        <FormField label="Contact (Email or Phone) *" name="contact" maxLength={150} placeholder="email@lpu.in or phone" value={formData.contact} onChange={handleInput} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className={labelCls}>COURSE *</label>
                          <select
                            name="course" required value={formData.course} onChange={handleInput}
                            className={selectCls}
                          >
                            <option value="" disabled hidden>Select your course</option>
                            {['MCA','BCA','B.Sc IT','M.Sc IT','B.Tech','M.Tech','Other'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <FormField label="Section *" name="section" maxLength={50} placeholder="e.g. K23MW" value={formData.section} onChange={handleInput} className="uppercase" />
                      </div>
                    </fieldset>

                    {/* ── Section 2: The Idea ─────────────────────────────── */}
                    <fieldset className="flex flex-col gap-6">
                      <legend className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink-soft)] mb-2 border-b border-[var(--border)] pb-2 w-full">
                        02 / THE IDEA
                      </legend>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Idea Title *" name="title" maxLength={150} placeholder="Give your idea a name" value={formData.title} onChange={handleInput} containerClassName="md:col-span-1" />
                        <div className="flex flex-col gap-2">
                          <label className={labelCls}>CATEGORY</label>
                          <select name="category" value={formData.category} onChange={handleInput} className={selectCls}>
                            <option value="">Select a category (optional)</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className={labelCls}>
                          DESCRIPTION * <span className="text-slate-400 normal-case font-normal tracking-normal">(min 30 chars)</span>
                        </label>
                        <textarea
                          name="description" required minLength={30} maxLength={2000}
                          placeholder="Describe your idea — what problem does it solve, how does it work?"
                          value={formData.description} onChange={handleInput}
                          rows={5}
                          className={`${inputCls} resize-y min-h-[120px]`}
                        />
                        <span className={`self-end font-mono text-[9px] ${formData.description.length < 30 ? 'text-red-400' : 'text-[var(--ink-soft)]'}`}>
                          {formData.description.length} / 2000
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className={labelCls}>
                          EXPECTED OUTCOME * <span className="text-slate-400 normal-case font-normal tracking-normal">(min 20 chars)</span>
                        </label>
                        <textarea
                          name="outcome" required minLength={20} maxLength={1000}
                          placeholder="What impact or result do you expect if this idea is implemented?"
                          value={formData.outcome} onChange={handleInput}
                          rows={3}
                          className={`${inputCls} resize-y min-h-[80px]`}
                        />
                        <span className={`self-end font-mono text-[9px] ${formData.outcome.length < 20 ? 'text-red-400' : 'text-[var(--ink-soft)]'}`}>
                          {formData.outcome.length} / 1000
                        </span>
                      </div>
                    </fieldset>

                    {/* ── Section 3: PDF Upload ───────────────────────────── */}
                    <fieldset className="flex flex-col gap-4">
                      <legend className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink-soft)] mb-2 border-b border-[var(--border)] pb-2 w-full">
                        03 / SUPPORTING DOCUMENT <span className="text-slate-400 normal-case font-normal tracking-normal">(optional)</span>
                      </legend>

                      <p className="font-mono text-[10px] tracking-wider text-[var(--ink-soft)] uppercase">
                        PDF only · Max 2 MB · Auto-compressed if possible
                      </p>

                      {!pdf ? (
                        /* Drop zone */
                        <div className="relative w-full border-2 border-dashed border-[var(--border)] bg-[var(--paper-dim)] hover:bg-slate-100 hover:border-brand-primary/50 transition-all rounded-sm flex flex-col items-center justify-center p-10 group cursor-pointer">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handlePdfSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            aria-label="Upload supporting PDF"
                          />
                          <div className="w-12 h-12 rounded-full bg-[var(--paper-dim)] bg-[var(--paper-dim)] flex items-center justify-center text-[var(--circuit)] mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                          </div>
                          <span className="font-heading font-bold text-[var(--ink)] mb-1 text-center">
                            CLICK OR DRAG TO UPLOAD PDF
                          </span>
                          <span className="font-mono text-[10px] text-[var(--ink-soft)] tracking-widest uppercase">
                            Max 2 MB · PDF only
                          </span>
                          {pdfError && (
                            <div className="mt-4 flex items-start gap-2 text-red-500 text-xs font-mono font-bold max-w-xs text-center" role="alert">
                              <FileWarning size={14} className="shrink-0 mt-0.5" />
                              <span>{pdfError}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* File status card */
                        <PdfStatusCard pdf={pdf} onRemove={removePdf} />
                      )}
                    </fieldset>

                    {/* ── Submit ──────────────────────────────────────────── */}
                    <div className="pt-6 mt-2 border-t border-[var(--border)]">
                      <button
                        type="submit"
                        disabled={isBusy}
                        aria-busy={isBusy}
                        className="w-full bg-spark text-ink px-10 py-5 font-heading font-semibold text-sm tracking-widest uppercase hover:bg-spark-soft hover:-translate-y-0.5 active:translate-y-0 transition-colors transform flex items-center justify-center gap-3 shadow-xl shadow-spark/20 disabled:opacity-70 disabled:translate-y-0 rounded-[10px]"
                      >
                        {formState === 'SUBMITTING' ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            SUBMITTING...
                          </>
                        ) : (
                          <>
                            SUBMIT IDEA
                            <ArrowRight size={16} />
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

      <Footer />
    </div>
  );
}

// ─── Shared style tokens ─────────────────────────────────────────────────────
const labelCls =
  'font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink-soft)]';
const inputCls =
  'w-full bg-[var(--paper-dim)] border border-[var(--border)] px-5 py-4 font-body text-[var(--ink)] focus:outline-none focus:border-brand-primary transition-colors rounded-sm placeholder-slate-400';
const selectCls =
  inputCls + ' appearance-none cursor-pointer';

// ─── Sub-components ───────────────────────────────────────────────────────────
function FormField({ label, name, placeholder, value, onChange, type = 'text', maxLength, className = '', containerClassName = '', ...props }) {
  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`.trim()}>
      <label htmlFor={name} className={labelCls}>{label}</label>
      <input
        id={name} name={name} type={type} required
        placeholder={placeholder} value={value} onChange={onChange}
        maxLength={maxLength}
        className={`${inputCls} ${className}`.trim()}
        {...props}
      />
    </div>
  );
}

function PdfStatusCard({ pdf, onRemove }) {
  const isCompressing = pdf.status === 'COMPRESSING';
  const isReady       = pdf.status === 'READY';
  const wasCompressed = isReady && pdf.originalSizeMB !== pdf.finalSizeMB;

  return (
    <div className="w-full border border-[var(--border)] bg-[var(--paper-dim)] p-4 rounded-sm relative">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-sm bg-[var(--paper-dim)] bg-[var(--paper-dim)] flex items-center justify-center text-[var(--circuit)] shrink-0">
          {isCompressing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <FileText size={20} />
          )}
        </div>

        <div className="flex flex-col flex-grow min-w-0 pr-8 gap-1">
          <span className="font-body text-sm font-bold text-[var(--ink)] truncate">
            {pdf.file?.name}
          </span>

          {isCompressing && (
            <span className="font-mono text-[10px] text-[var(--circuit)] tracking-widest uppercase flex items-center gap-1.5" aria-live="polite">
              <Loader2 size={10} className="animate-spin" />
              COMPRESSING… ({pdf.originalSizeMB} MB)
            </span>
          )}

          {isReady && (
            <span className="font-mono text-[10px] text-[var(--ink-soft)] tracking-widest uppercase flex flex-wrap gap-3" aria-live="polite">
              <span className="flex items-center gap-1 text-green-600 font-bold">
                <CheckCircle2 size={10} /> READY · {pdf.finalSizeMB} MB
              </span>
              {wasCompressed && (
                <span className="text-[var(--circuit)]">
                  (compressed from {pdf.originalSizeMB} MB)
                </span>
              )}
            </span>
          )}
        </div>

        {!isCompressing && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove PDF"
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Progress bar while compressing */}
      {isCompressing && (
        <div className="mt-3 h-0.5 w-full bg-slate-200 overflow-hidden rounded-full">
          <div className="h-full bg-brand-primary animate-[progress_1.5s_ease-in-out_infinite] rounded-full" />
          <style>{`
            @keyframes progress {
              0%   { width: 0%;   margin-left: 0%; }
              50%  { width: 60%;  margin-left: 20%; }
              100% { width: 0%;   margin-left: 100%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
