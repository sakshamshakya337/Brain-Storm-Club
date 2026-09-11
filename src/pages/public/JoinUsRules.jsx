import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import { usePageReveal } from '../../hooks/usePageReveal';

// ─── Club Rules ────────────────────────────────────────────────────────────────
const CLUB_RULES = [
  {
    num: '01',
    title: 'One-Club Policy',
    body: 'Members are allowed to join only one club. However, you may also participate in our coordinated club, Bodh Script Club, along with your primary club. Joining or actively participating in any other club is not permitted.',
  },
  {
    num: '02',
    title: 'Discipline & Conduct',
    body: 'Discipline and proper conduct are expected at all times, whether during club events, meetings, or group activities. Any form of indiscipline, misconduct, or inappropriate behaviour will not be tolerated and may result in immediate removal from the club/group.',
  },
  {
    num: '03',
    title: 'Warnings & Removal',
    body: 'A member may be removed from the club after two warnings for repeated violations of club rules, misconduct, or failure to follow instructions.',
  },
  {
    num: '04',
    title: 'Active Participation',
    body: 'Members are expected to remain active and participate in club activities and events. Repeated inactivity or failure to participate in events without a valid reason may result in removal from the club.',
  },
  {
    num: '05',
    title: 'Meeting Attendance',
    body: 'Club meetings are considered important and must be taken seriously. Members are expected to attend scheduled meetings and actively participate.',
  },
  {
    num: '06',
    title: 'Valid Reasons for Absence',
    body: 'If you are unable to attend a meeting due to CA examinations, placement drives, or other official academic commitments, you must share valid proof in the group. Without proper information or proof, the absence may be considered a lack of seriousness towards the club.',
  },
  {
    num: '07',
    title: 'Responsibility & Commitment',
    body: "Being a member of the club comes with responsibility and commitment. Members are expected to respect the club, attend important activities, follow instructions, and contribute actively to the club's work.",
  },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function JoinUsRules() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const containerRef = useRef(null);

  // Pending submission data passed via router state from JoinUs.jsx
  const pendingData = location.state?.pendingData ?? null;

  // Guard: if someone lands here directly without form data, send them back
  useEffect(() => {
    if (!pendingData) {
      navigate('/join-us', { replace: true });
    }
    window.scrollTo(0, 0);
  }, [pendingData, navigate]);

  usePageReveal(containerRef);

  const [agreed, setAgreed]               = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  const [submitState, setSubmitState]     = useState('IDLE'); // IDLE | SENDING | SUCCESS | ERROR
  const [errorMessage, setErrorMessage]   = useState('');
  const submitted = useRef(false); // prevent double-submit

  // ── Final submit ────────────────────────────────────────────────────────────
  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setAgreementError(false);

    if (!agreed) {
      setAgreementError(true);
      document.getElementById('agree-checkbox')?.focus();
      return;
    }

    if (!pendingData) {
      navigate('/join-us', { replace: true });
      return;
    }

    // Guard against double submit
    if (submitted.current || submitState === 'SENDING') return;
    submitted.current = true;

    setSubmitState('SENDING');
    setErrorMessage('');

    try {
      // Rebuild FormData from stored pending data (File objects survive router state)
      const fd = new FormData();
      fd.append('fullName',           pendingData.name);
      fd.append('registrationNumber', pendingData.regNo.trim().toUpperCase());
      fd.append('course',             pendingData.course);
      fd.append('section',            pendingData.section);
      fd.append('email',              pendingData.email);
      fd.append('phone',              pendingData.phone);
      fd.append('whatsapp',           pendingData.whatsapp);
      fd.append('domain',             pendingData.domain);
      fd.append('whyJoin',            pendingData.whyJoin);
      (pendingData.interests || []).forEach(i => fd.append('interests[]', i));
      fd.append('profileImage',       pendingData.profileImage);
      fd.append('rulesAccepted',      'true');

      const res  = await fetch('/api/public/join-us', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok) {
        setSubmitState('SUCCESS');
      } else {
        submitted.current = false;
        setSubmitState('ERROR');
        setErrorMessage(data.message || 'Error submitting application. Please try again.');
      }
    } catch {
      submitted.current = false;
      setSubmitState('ERROR');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  // ── Back handler — return form data to JoinUs ───────────────────────────────
  const handleBack = () => {
    navigate('/join-us', { state: { restoredData: pendingData }, replace: false });
  };

  // ── Render nothing while redirecting (guard) ────────────────────────────────
  if (!pendingData) return null;

  // ── Success state ───────────────────────────────────────────────────────────
  if (submitState === 'SUCCESS') {
    return (
      <div className="w-full bg-paper min-h-screen text-ink font-body flex flex-col">
        <section className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-lg mx-auto text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-circuit/10 flex items-center justify-center mb-8 text-circuit border border-circuit/20">
              <CheckCircle2 size={40} />
            </div>
            <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-circuit mb-4">
              APPLICATION STATUS / RECEIVED
            </div>
            <h2 className="font-heading font-black text-3xl md:text-4xl uppercase text-ink mb-6">
              APPLICATION RECEIVED.
            </h2>
            <p className="font-body text-lg text-ink-soft max-w-md mx-auto mb-12">
              Thanks for applying to Brainstorm. Your application has been successfully submitted and is under review.
            </p>
            <Link
              to="/"
              className="rounded-[10px] bg-spark px-8 py-4 font-medium text-ink transition-transform hover:-translate-y-0.5 flex items-center gap-2 group shadow-xl shadow-spark/20"
            >
              BACK TO HOME
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // ── Main rules page ─────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="w-full bg-paper min-h-screen text-ink font-body">

      {/* ── Page Header ── */}
      <section className="border-b border-border bg-paper px-6 py-12 md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl">

          {/* Breadcrumb nav */}
          <button
            type="button"
            onClick={handleBack}
            className="mb-8 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-ink-soft hover:text-ink transition-colors group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Join Us Form
          </button>

          {/* Eyebrow */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-circuit border border-circuit/30 px-3 py-1.5 rounded-sm bg-circuit/5">
              LPU SCA / BRAINSTORM CLUB
            </div>
            <div className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft border border-border px-3 py-1.5 rounded-sm bg-paper">
              MEMBERSHIP / RULES
            </div>
          </div>

          <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-ink leading-[0.92] mb-4">
            Before You Join
          </h1>
          <p className="font-body text-base md:text-lg text-ink-soft max-w-2xl leading-relaxed">
            Please review the club rules and confirm that you agree to follow them. Your application will only be submitted after acknowledgement.
          </p>
        </div>
      </section>

      {/* ── Rules + Form ── */}
      <section className="py-12 md:py-16 px-6 md:px-12 lg:px-20 bg-paper-dim border-b border-border">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleConfirmSubmit} noValidate>

            {/* ── Rules heading ── */}
            <div className="mb-8 flex items-center gap-4">
              <ShieldCheck size={20} className="text-circuit flex-shrink-0" />
              <h2 className="font-heading font-black text-lg md:text-xl uppercase tracking-wide text-ink">
                Club Rules & Guidelines
              </h2>
            </div>

            {/* ── Rules list ── */}
            <div className="flex flex-col gap-3 mb-10">
              {CLUB_RULES.map((rule) => (
                <div
                  key={rule.num}
                  className="flex items-start gap-4 p-5 bg-paper border border-border rounded-sm hover:border-circuit/25 transition-colors"
                >
                  {/* Number badge */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-sm bg-circuit/8 border border-circuit/20 flex items-center justify-center mt-0.5">
                    <span className="font-mono text-[10px] font-bold text-circuit tracking-wider leading-none">
                      {rule.num}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="font-heading font-bold text-sm uppercase tracking-wide text-ink">
                      {rule.title}
                    </span>
                    <p className="font-body text-sm text-ink-soft leading-relaxed">
                      {rule.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Acknowledgement area ── */}
            <div className="border-t border-border pt-8 flex flex-col gap-5">

              <div className="flex items-center gap-3 mb-1">
                <span className="w-6 h-px bg-circuit block flex-shrink-0" />
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-ink-soft">
                  ACKNOWLEDGEMENT REQUIRED
                </span>
              </div>

              {/* Checkbox row */}
              <label
                htmlFor="agree-checkbox"
                className={[
                  'flex items-start gap-4 p-5 rounded-sm border cursor-pointer select-none transition-all',
                  agreed
                    ? 'bg-circuit/5 border-circuit/40'
                    : agreementError
                    ? 'bg-red-50 border-red-300 dark:bg-red-950/20 dark:border-red-700'
                    : 'bg-paper border-border hover:border-circuit/30',
                ].join(' ')}
              >
                {/* Custom checkbox — large tap target, accessible */}
                <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                  <input
                    id="agree-checkbox"
                    type="checkbox"
                    required
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (e.target.checked) setAgreementError(false);
                    }}
                    className={[
                      'appearance-none w-5 h-5 border-2 rounded-[3px] cursor-pointer transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-circuit/40 focus:ring-offset-2',
                      agreed
                        ? 'bg-circuit border-circuit'
                        : agreementError
                        ? 'bg-paper border-red-400'
                        : 'bg-paper border-border',
                    ].join(' ')}
                    aria-required="true"
                    aria-invalid={agreementError ? 'true' : 'false'}
                    aria-describedby={agreementError ? 'agree-error' : undefined}
                  />
                  {/* Checkmark overlay */}
                  {agreed && (
                    <CheckCircle2
                      size={13}
                      className="absolute text-paper pointer-events-none"
                      strokeWidth={3}
                    />
                  )}
                </div>

                <span
                  className={[
                    'font-body text-sm leading-relaxed',
                    agreed ? 'text-ink' : 'text-ink-soft',
                  ].join(' ')}
                >
                  I have read the club rules and agree to follow them.
                </span>
              </label>

              {/* Validation error */}
              {agreementError && (
                <p
                  id="agree-error"
                  role="alert"
                  className="flex items-center gap-2 font-mono text-[11px] font-bold text-red-600 tracking-wide"
                >
                  <AlertCircle size={13} aria-hidden="true" />
                  Please confirm that you have read and agree to follow the club rules.
                </p>
              )}

              {/* API error */}
              {submitState === 'ERROR' && errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 flex items-start gap-3 rounded-sm">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <p className="text-sm font-body text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* ── Buttons ── */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">

                {/* Confirm & Submit — primary CTA */}
                <button
                  type="submit"
                  disabled={submitState === 'SENDING' || !agreed}
                  aria-disabled={!agreed || submitState === 'SENDING'}
                  title={!agreed ? 'Check the box above to confirm you have read the rules' : undefined}
                  className={[
                    'flex-1 sm:flex-none rounded-[10px] px-8 py-4 font-medium text-ink',
                    'flex items-center justify-center gap-2 group transition-all shadow-xl',
                    agreed && submitState !== 'SENDING'
                      ? 'bg-spark shadow-spark/20 hover:-translate-y-0.5 cursor-pointer'
                      : 'bg-spark/40 shadow-spark/10 opacity-60 cursor-not-allowed',
                  ].join(' ')}
                >
                  {submitState === 'SENDING' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      SUBMITTING…
                    </>
                  ) : (
                    <>
                      CONFIRM & SUBMIT REQUEST
                      <ArrowRight
                        size={15}
                        className={agreed ? 'group-hover:translate-x-1 transition-transform' : ''}
                      />
                    </>
                  )}
                </button>

                {/* Back — secondary */}
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitState === 'SENDING'}
                  className="flex-1 sm:flex-none rounded-[10px] border border-border bg-paper px-8 py-4 font-medium text-ink-soft hover:text-ink hover:bg-paper-dim transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                  Back to Join Us
                </button>

              </div>

              {/* Hint when button is locked */}
              {!agreed && submitState !== 'SENDING' && (
                <p className="text-center font-mono text-[10px] text-ink-soft tracking-wider">
                  Check the box above to enable submission.
                </p>
              )}

            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
