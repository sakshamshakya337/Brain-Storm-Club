import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Calendar, MapPin, Clock, Upload, Trash2, Plus } from 'lucide-react';
import Footer from '../../components/layout/Footer';
import EventStatus from '../../components/events/EventStatus';
import ProtectedImage from '../../components/common/ProtectedImage';
import { validateRegistrationNumber, validatePhone, validateEmail, validateName, validateTransactionId } from '../../utils/validation';

const FIELD_CLASS = "w-full bg-[var(--paper-dim)] border border-[var(--border)] px-4 py-3 font-body text-sm text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none focus:border-[var(--circuit)] transition-colors";
const LABEL_CLASS = "block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2";

export default function EventRegistration() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventError, setEventError] = useState('');
  
  const [formState, setFormState] = useState('DEFAULT'); // DEFAULT, SENDING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  
  const [registrationType, setRegistrationType] = useState('individual'); // 'individual' or 'team'
  const [sameAsPhone, setSameAsPhone] = useState(false);

  const emptyLeader = { fullName: '', registrationNumber: '', course: '', section: '', email: '', phone: '', whatsapp: '' };
  const emptyMember = { fullName: '', registrationNumber: '', phone: '' };

  const [formData, setFormData] = useState({
    teamName: '',
    leader: { ...emptyLeader },
    members: [{ ...emptyMember }], // Minimum 1 member required for team (i.e. size 2 team)
    transactionId: '',
    paymentScreenshot: null
  });

  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  const fileInputRef = React.useRef(null);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [paymentInstructionsAccepted, setPaymentInstructionsAccepted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/public/events/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          setEvent(data.data.event);
          if (data.data.event.allowIndividualRegistration && !data.data.event.allowTeamRegistration) {
            setRegistrationType('individual');
          } else if (!data.data.event.allowIndividualRegistration && data.data.event.allowTeamRegistration) {
            setRegistrationType('team');
          }
        }
        else setEventError('Event not found.');
      })
      .catch(() => setEventError('Unable to load event details.'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (sameAsPhone) {
      handleLeaderChange({ target: { name: 'whatsapp', value: formData.leader.phone } });
    }
  }, [formData.leader.phone, sameAsPhone]);

  const handleLeaderChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, leader: { ...p.leader, [name]: value } }));
  };

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [name]: value };
    setFormData(p => ({ ...p, members: newMembers }));
  };

  const addMember = () => {
    if (formData.members.length < 4) { // max 5 members including leader = max 4 in members array
      setFormData(p => ({ ...p, members: [...p.members, { ...emptyMember }] }));
    }
  };

  const removeMember = (index) => {
    const newMembers = formData.members.filter((_, i) => i !== index);
    setFormData(p => ({ ...p, members: newMembers }));
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB.');
        return;
      }
      setFormData(p => ({ ...p, paymentScreenshot: file }));
      setScreenshotPreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!event) return;
    
    // Explicit Client-Side Validation
    const l = formData.leader;
    const leaderErrors = [
      validateName(l.fullName, 'Leader name'),
      validateRegistrationNumber(l.registrationNumber),
      !l.course.trim() ? 'Leader course is required.' : null,
      !l.section.trim() ? 'Leader section is required.' : null,
      validateEmail(l.email),
      validatePhone(l.phone, 'Leader phone number'),
      l.whatsapp && !sameAsPhone ? validatePhone(l.whatsapp, 'Leader WhatsApp number') : null
    ].filter(Boolean);

    if (leaderErrors.length > 0) {
      setErrorMessage(leaderErrors[0]);
      setFormState('ERROR');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (registrationType === 'team') {
      for (let i = 0; i < formData.members.length; i++) {
        const m = formData.members[i];
        const mErrors = [
          validateName(m.fullName, `Team Member ${i+1} name`),
          validateRegistrationNumber(m.registrationNumber),
          validatePhone(m.phone, `Team Member ${i+1} phone number`)
        ].filter(Boolean);
        if (mErrors.length > 0) {
          setErrorMessage(mErrors[0]);
          setFormState('ERROR');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }

    if (event.paymentRequired) {
      if (!formData.transactionId || !formData.paymentScreenshot) {
        setErrorMessage('Payment screenshot and Transaction ID are required.');
        setFormState('ERROR');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const tErr = validateTransactionId(formData.transactionId);
      if (tErr) {
        setErrorMessage(tErr);
        setFormState('ERROR');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setFormState('SENDING');
    setErrorMessage('');
    try {
      const fd = new FormData();
      fd.append('eventId', event._id);
      fd.append('registrationType', registrationType);
      
      const payloadData = {
        leader: { ...formData.leader, whatsapp: formData.leader.whatsapp || formData.leader.phone, hasWhatsapp: true }
      };
      if (registrationType === 'team') {
        payloadData.members = formData.members;
        payloadData.teamName = formData.teamName;
      }
      fd.append('data', JSON.stringify(payloadData));

      if (event.paymentRequired) {
        fd.append('transactionId', formData.transactionId);
        fd.append('paymentScreenshot', formData.paymentScreenshot);
      }

      const res = await fetch('/api/public/events/register', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      
      setFormState('SUCCESS');
      setFormData({
        leader: { ...emptyLeader },
        members: [{ ...emptyMember }],
        transactionId: '',
        paymentScreenshot: null
      });
      setSameAsPhone(false);
      setScreenshotPreview(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'A network error occurred. Please try again.');
      setFormState('ERROR');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="w-full bg-[var(--paper)] min-h-screen font-body flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40">
        <div className="w-8 h-8 border-2 border-[var(--circuit)] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--ink-soft)]">LOADING…</span>
      </div>
      <Footer />
    </div>
  );

  /* ── Error ── */
  if (eventError || !event) return (
    <div className="w-full bg-[var(--paper)] min-h-screen font-body flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-40">
        <span className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)] border border-[var(--border)] px-3 py-1 mb-6">ERROR 404</span>
        <h1 className="font-heading font-black text-4xl uppercase tracking-tight text-[var(--ink)] mb-4">Event Not Found</h1>
        <Link to="/events" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase border border-[var(--border)] px-6 py-3 text-[var(--ink)] hover:border-[var(--circuit)] transition-colors mt-6">
          <ArrowLeft size={13} /> Back to Events
        </Link>
      </div>
      <Footer />
    </div>
  );

  const isClosed = !event.registrationOpen;

  return (
    <div className="w-full bg-[var(--paper)] min-h-screen font-body text-[var(--ink)]">
      {/* ── HERO ── */}
      <section className="relative border-b border-[var(--border)] bg-[var(--paper-dim)] overflow-hidden">
        <div className="absolute inset-0 -z-20 pointer-events-none">
          <img src="/circuit-horizon.png" alt="" className="h-full w-full object-cover object-bottom opacity-20" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--paper-dim)_0%,transparent_50%,var(--paper-dim)_100%)] pointer-events-none" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" aria-hidden="true" viewBox="0 0 1440 360" preserveAspectRatio="none">
          <path d="M0 80 H220 L280 130 H520 L580 70 H800 L860 120 H1100 L1160 60 H1440" fill="none" stroke="var(--circuit)" strokeWidth="1.2" strokeDasharray="8 36" className="electric-trace-reverse" />
          <path d="M0 280 H180 L240 240 H460 L520 300 H740 L800 250 H1020 L1080 310 H1440" fill="none" stroke="var(--spark)" strokeWidth="1" strokeDasharray="6 42" className="electric-trace" />
        </svg>

        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px] pt-10 pb-14 relative z-10">
          <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--ink-soft)] mb-10">
            <Link to="/events" className="hover:text-[var(--circuit)] transition-colors flex items-center gap-1.5"><ArrowLeft size={11} /> Events</Link>
            <span>/</span>
            <Link to={`/events/${event.slug}`} className="hover:text-[var(--circuit)] transition-colors truncate max-w-[180px]">{event.title}</Link>
            <span>/</span>
            <span className="text-[var(--ink)]">Register</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <EventStatus status={event.status} />
                {event.category && <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--circuit)] border border-[var(--circuit)]/40 px-2.5 py-1">{event.category}</span>}
              </div>
              <h1 className="font-heading font-black uppercase tracking-tight text-[var(--ink)] leading-[0.9] mb-4" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)' }}>
                {isClosed ? 'Registration Closed' : 'Event Registration'}
              </h1>
              <p className="font-body text-lg text-[var(--ink-soft)] max-w-xl leading-relaxed">
                {isClosed ? `Registration for ${event.title} is currently closed.` : `Secure your spot for ${event.title}.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:flex-col md:items-end font-mono text-[10px] tracking-widest uppercase text-[var(--ink-soft)]">
              {event.date && <span className="flex items-center gap-1.5"><Calendar size={11} className="text-[var(--circuit)]" />{new Date(event.date).toLocaleDateString()}</span>}
              {event.venue && <span className="flex items-center gap-1.5"><MapPin size={11} className="text-[var(--circuit)]" />{event.venue}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      <section className="py-20 bg-[var(--paper)]">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          {isClosed && (
            <div className="max-w-2xl mx-auto border border-[var(--border)] bg-[var(--paper-dim)] p-12 text-center">
              <span className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)] border border-[var(--border)] px-3 py-1 mb-6 inline-block">UNAVAILABLE</span>
              <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-[var(--ink)] mt-4 mb-3">Currently Unavailable</h2>
              <p className="font-body text-[var(--ink-soft)] mb-8">We are no longer accepting registrations for this event.</p>
              <Link to={`/events/${event.slug}`} className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase border border-[var(--border)] px-6 py-3 text-[var(--ink)] hover:border-[var(--circuit)] hover:text-[var(--circuit)] transition-colors">
                <ArrowLeft size={13} /> Back to Event Details
              </Link>
            </div>
          )}

          {!isClosed && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 max-w-5xl">
              <div>
                {formState === 'SUCCESS' && (
                  <div className="border border-[var(--circuit)]/40 bg-[var(--paper-dim)] p-8 mb-10 flex items-start gap-4">
                    <CheckCircle2 size={22} className="text-[var(--circuit)] mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-[var(--ink)] mb-2">Registration Successful!</h3>
                      <p className="font-body text-[var(--ink-soft)] mb-5">Your spot is confirmed. We will reach you on your registered email/phone.</p>
                      <div className="flex flex-wrap gap-3">
                        <Link to={`/events/${event.slug}`} className="font-mono text-[10px] font-bold tracking-widest uppercase border border-[var(--border)] px-4 py-2 text-[var(--ink)] hover:border-[var(--circuit)] transition-colors">Back to Event</Link>
                        <button onClick={() => setFormState('DEFAULT')} className="font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--circuit)] hover:underline">Register Another Person</button>
                      </div>
                    </div>
                  </div>
                )}

                {formState === 'ERROR' && (
                  <div className="border border-red-300 bg-red-50 p-6 mb-8 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-red-700 mb-1">Registration Failed</p>
                      <p className="font-body text-sm text-red-600">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {formState !== 'SUCCESS' && (
                  <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Registration Mode Selection */}
                    {event.allowIndividualRegistration && event.allowTeamRegistration && (
                      <div>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
                          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)]">MODE</span>
                        </div>
                        <div className="flex gap-4">
                          <label className={`flex-1 p-4 border ${registrationType === 'individual' ? 'border-[var(--circuit)] bg-[var(--paper-dim)]' : 'border-[var(--border)] bg-[var(--paper)]'} cursor-pointer text-center transition-colors`}>
                            <input type="radio" name="registrationType" value="individual" checked={registrationType === 'individual'} onChange={() => setRegistrationType('individual')} className="hidden" />
                            <div className="font-heading font-bold uppercase text-[var(--ink)] mb-1">Individual</div>
                            <div className="text-xs text-[var(--ink-soft)]">Register as a single participant</div>
                          </label>
                          <label className={`flex-1 p-4 border ${registrationType === 'team' ? 'border-[var(--circuit)] bg-[var(--paper-dim)]' : 'border-[var(--border)] bg-[var(--paper)]'} cursor-pointer text-center transition-colors`}>
                            <input type="radio" name="registrationType" value="team" checked={registrationType === 'team'} onChange={() => setRegistrationType('team')} className="hidden" />
                            <div className="font-heading font-bold uppercase text-[var(--ink)] mb-1">Team</div>
                            <div className="text-xs text-[var(--ink-soft)]">Register as a team (2-{event.maxTeamSize || 5} members)</div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Team Details (if team) */}
                    {registrationType === 'team' && (
                      <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
                          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)]">01</span>
                          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)]">Team Name</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className={LABEL_CLASS}>Team Name <span className="text-[var(--spark)]">*</span></label>
                            <input 
                              type="text" 
                              name="teamName" 
                              required 
                              maxLength={100} 
                              value={formData.teamName} 
                              onChange={(e) => setFormData({...formData, teamName: e.target.value})} 
                              className={FIELD_CLASS} 
                              placeholder="e.g. Code Ninjas"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Leader Details */}
                    <div>
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
                        <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)]">
                          {registrationType === 'team' ? '02' : '01'}
                        </span>
                        <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)]">
                          {registrationType === 'team' ? 'Team Leader Details' : 'Student Details'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <label className={LABEL_CLASS}>Full Name <span className="text-[var(--spark)]">*</span></label>
                          <input type="text" name="fullName" required maxLength={100} value={formData.leader.fullName} onChange={handleLeaderChange} className={FIELD_CLASS} />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Registration No. <span className="text-[var(--spark)]">*</span></label>
                          <input type="text" inputMode="numeric" pattern="\d*" maxLength={8} name="registrationNumber" required value={formData.leader.registrationNumber} onChange={handleLeaderChange} className={`${FIELD_CLASS} uppercase`} />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Course <span className="text-[var(--spark)]">*</span></label>
                          <input type="text" name="course" required maxLength={100} value={formData.leader.course} onChange={handleLeaderChange} className={FIELD_CLASS} />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Section <span className="text-[var(--spark)]">*</span></label>
                          <input type="text" name="section" required maxLength={50} value={formData.leader.section} onChange={handleLeaderChange} className={`${FIELD_CLASS} uppercase`} />
                        </div>
                        <div className="md:col-span-2">
                          <label className={LABEL_CLASS}>Email Address <span className="text-[var(--spark)]">*</span></label>
                          <input type="email" name="email" required value={formData.leader.email} onChange={handleLeaderChange} className={FIELD_CLASS} />
                        </div>
                        <div>
                          <label className={LABEL_CLASS}>Phone Number <span className="text-[var(--spark)]">*</span></label>
                          <input type="tel" inputMode="numeric" pattern="\d*" maxLength={10} name="phone" required value={formData.leader.phone} onChange={handleLeaderChange} className={FIELD_CLASS} />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className={LABEL_CLASS + " mb-0"}>WhatsApp Number</label>
                            <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                              <input type="checkbox" checked={sameAsPhone} onChange={() => setSameAsPhone(!sameAsPhone)} className="w-3 h-3 accent-[var(--circuit)]" />
                              Same as phone
                            </label>
                          </div>
                          <input type="tel" inputMode="numeric" pattern="\d*" maxLength={10} name="whatsapp" value={formData.leader.whatsapp} onChange={handleLeaderChange} disabled={sameAsPhone} className={`${FIELD_CLASS} ${sameAsPhone ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {/* Team Members Section */}
                    {registrationType === 'team' && (
                      <div>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
                          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)]">03</span>
                          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)]">Team Members</span>
                        </div>
                        
                        <div className="space-y-6">
                          {formData.members.map((member, index) => (
                            <div key={index} className="p-5 border border-[var(--border)] bg-[var(--paper-dim)] relative">
                              <div className="absolute top-2 right-2 text-xs font-mono font-bold text-[var(--ink-soft)]">Member {index + 1}</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="md:col-span-2">
                                  <label className={LABEL_CLASS}>Full Name <span className="text-[var(--spark)]">*</span></label>
                                  <input type="text" name="fullName" required maxLength={100} value={member.fullName} onChange={(e) => handleMemberChange(index, e)} className={FIELD_CLASS} />
                                </div>
                                <div>
                                  <label className={LABEL_CLASS}>Registration No. <span className="text-[var(--spark)]">*</span></label>
                                  <input type="text" inputMode="numeric" pattern="\d*" maxLength={8} name="registrationNumber" required value={member.registrationNumber} onChange={(e) => handleMemberChange(index, e)} className={`${FIELD_CLASS} uppercase`} />
                                </div>
                                <div>
                                  <label className={LABEL_CLASS}>Phone <span className="text-[var(--spark)]">*</span></label>
                                  <input type="tel" inputMode="numeric" pattern="\d*" maxLength={10} name="phone" required value={member.phone} onChange={(e) => handleMemberChange(index, e)} className={FIELD_CLASS} />
                                </div>
                              </div>
                              {formData.members.length > 1 && (
                                <button type="button" onClick={() => removeMember(index)} className="text-red-500 font-mono text-[10px] font-bold uppercase flex items-center gap-1 mt-4 hover:text-red-400">
                                  <Trash2 size={12} /> Remove Member
                                </button>
                              )}
                            </div>
                          ))}

                          {formData.members.length < (event.maxTeamSize ? event.maxTeamSize - 1 : 4) && (
                            <button type="button" onClick={addMember} className="w-full p-4 border border-dashed border-[var(--border)] hover:border-[var(--circuit)] transition-colors flex items-center justify-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink)]">
                              <Plus size={14} /> Add Another Member (Max {event.maxTeamSize ? event.maxTeamSize - 1 : 4})
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Proof */}
                    {event.paymentRequired && (
                      <div>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
                          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)]">
                            {registrationType === 'team' ? '03' : '02'}
                          </span>
                          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--ink-soft)]">Payment Details</span>
                        </div>
                        <div className="bg-[var(--paper-dim)] border border-[var(--border)] p-6 md:p-8 grid grid-cols-1 md:grid-cols-[minmax(280px,0.9fr)_minmax(320px,1.1fr)] gap-8 md:gap-12 items-start">
                          {event.paymentQrImage && (
                            <div className="flex flex-col items-center gap-4 w-full max-w-[360px] mx-auto md:mx-0">
                              <button type="button" onClick={() => setIsQrModalOpen(true)} className="w-full aspect-square bg-white border border-[var(--border)] p-4 md:p-6 hover:border-[var(--circuit)] transition-colors cursor-zoom-in relative group shadow-sm">
                                <ProtectedImage imageId={event.paymentQrImage?.imageId || event.paymentQrImage} variant="public" alt="Event payment QR code" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest text-slate-800 shadow-sm border border-slate-200">Click to enlarge</span>
                                </div>
                              </button>
                              <span className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--ink-soft)] text-center">Scan to Pay</span>
                            </div>
                          )}
                          <div className="flex flex-col gap-6">
                            <div>
                              <label className={LABEL_CLASS}>Transaction / Reference ID <span className="text-[var(--spark)]">*</span></label>
                              <input type="text" name="transactionId" required maxLength={30} value={formData.transactionId} onChange={(e) => setFormData(p => ({...p, transactionId: e.target.value.replace(/[^A-Za-z0-9]/g, '')}))} className={FIELD_CLASS} placeholder="e.g. UPI Ref / UTR Number" />
                            </div>
                            <div>
                              <label className={LABEL_CLASS}>Payment Screenshot <span className="text-[var(--spark)]">*</span></label>
                              <button type="button" onClick={() => { setShowPaymentInstructions(true); setPaymentInstructionsAccepted(false); }} className="flex flex-col items-center justify-center w-full h-40 md:h-48 border-2 border-dashed border-[var(--border)] hover:border-[var(--circuit)] transition-colors cursor-pointer bg-[var(--paper)]">
                                <div className="flex flex-col items-center justify-center text-[var(--ink-soft)] px-4 text-center">
                                  <Upload className="w-6 h-6 mb-3" />
                                  <p className="font-mono text-[10px] uppercase font-bold tracking-widest">{screenshotPreview ? 'Change Image' : 'Click to upload'}</p>
                                  <p className="font-body text-xs mt-2">PNG, JPG, HEIC</p>
                                  <p className="font-body text-[10px] opacity-75 mt-1">(Max 10MB, auto-compressed to &lt;2MB)</p>
                                </div>
                              </button>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/heic, image/heif" onChange={handleFileChange} />
                              {screenshotPreview && (
                                <div className="mt-4 flex items-center gap-4 bg-[var(--paper)] p-3 border border-[var(--border)]">
                                  <img src={screenshotPreview} alt="Preview" className="w-12 h-12 object-cover border border-[var(--border)]" />
                                  <span className="font-mono text-[10px] uppercase text-[var(--circuit)] font-bold">Screenshot Attached</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <p className="font-mono text-[9px] tracking-wider text-[var(--ink-soft)] max-w-sm">
                        By submitting, you agree to participate and receive event communications.
                      </p>
                      <button type="submit" disabled={formState === 'SENDING'}
                        className="flex-shrink-0 inline-flex items-center gap-2 bg-spark text-ink px-8 py-4 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-spark-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed group shadow-xl shadow-spark/20 hover:-translate-y-0.5 disabled:translate-y-0">
                        {formState === 'SENDING' ? 'SUBMITTING…' : 'CONFIRM REGISTRATION'}
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:sticky lg:top-24 self-start">
                <div className="border border-[var(--border)] bg-[var(--paper-dim)] p-6 space-y-5">
                  <div className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--circuit)] mb-4 border-b border-[var(--border)] pb-4">Event Summary</div>
                  <div>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-[var(--ink-soft)] mb-1">Event</div>
                    <div className="font-heading font-bold text-lg uppercase tracking-tight text-[var(--ink)] leading-tight">{event.title}</div>
                  </div>
                  {event.date && (
                    <div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-[var(--ink-soft)] mb-1">Date</div>
                      <div className="font-body font-medium text-[var(--ink)] flex items-center gap-1.5"><Calendar size={12} className="text-[var(--circuit)]" />{new Date(event.date).toLocaleDateString()}</div>
                    </div>
                  )}
                  {event.venue && (
                    <div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-[var(--ink-soft)] mb-1">Venue</div>
                      <div className="font-body font-medium text-[var(--ink)] flex items-center gap-1.5"><MapPin size={12} className="text-[var(--circuit)]" />{event.venue}</div>
                    </div>
                  )}
                  <div className="pt-4 border-t border-[var(--border)]">
                    <Link to={`/events/${event.slug}`} className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest uppercase text-[var(--circuit)] hover:text-[var(--ink)] transition-colors">
                      <ArrowLeft size={11} /> View Event Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />

      {/* QR Lightbox Modal */}
      {isQrModalOpen && event?.paymentQrImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsQrModalOpen(false)}>
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsQrModalOpen(false)} className="absolute -top-12 right-0 text-white hover:text-[var(--circuit)] transition-colors p-2">
              <span className="sr-only">Close</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="bg-white p-4 border border-[var(--border)]">
              <ProtectedImage imageId={event.paymentQrImage?.imageId || event.paymentQrImage} variant="public" alt="Payment QR Code Enlarged" className="max-w-full max-h-[75vh] object-contain" />
            </div>
            <div className="mt-4 font-mono text-xs font-bold uppercase tracking-widest text-white">Scan to Pay</div>
          </div>
        </div>
      )}

      {/* Payment Instructions Modal */}
      {showPaymentInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[var(--ink)]/80 backdrop-blur-sm" onClick={() => setShowPaymentInstructions(false)}>
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--paper)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--border)] shadow-2xl" 
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-labelledby="payment-instruction-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-[var(--border)] bg-[var(--paper-dim)] shrink-0">
              <h2 id="payment-instruction-title" className="font-heading text-lg md:text-xl font-bold uppercase tracking-wide text-[var(--ink)]">Upload Payment Screenshot</h2>
              <button onClick={() => setShowPaymentInstructions(false)} className="text-[var(--ink-soft)] hover:text-[var(--circuit)] transition-colors">
                <span className="sr-only">Close</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-8">
              <div className="flex flex-col items-center">
                <p className="font-body text-sm md:text-base text-[var(--ink)] mb-6 text-center max-w-2xl">
                  Before uploading your payment screenshot, please follow these instructions carefully to ensure your registration is verified successfully.
                </p>
                
                {/* Instruction Image */}
                <div className="w-full max-w-3xl bg-[var(--paper-dim)] border border-[var(--border)] p-2">
                  <img src="/instruction.png" alt="Payment Screenshot Instructions" className="w-full h-auto object-contain" />
                </div>
              </div>

              {/* Warning Text */}
              <div className="bg-red-50 border border-red-200 p-4 md:p-6 mx-auto w-full max-w-3xl">
                <h3 className="font-mono text-[10px] font-bold tracking-widest uppercase text-red-600 mb-2">Important Requirements</h3>
                <ul className="list-disc list-inside font-body text-sm text-red-900 space-y-2">
                  <li>Upload a <strong>clear and complete</strong> screenshot of your successful UPI payment.</li>
                  <li>Make sure the <strong>payment amount</strong> and <strong>Transaction ID (UTR)</strong> are clearly visible.</li>
                  <li>Do not upload a cropped, edited, unclear, or unrelated screenshot.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="p-4 md:p-6 border-t border-[var(--border)] bg-[var(--paper-dim)] shrink-0">
              <div className="max-w-3xl mx-auto flex flex-col gap-6">
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 appearance-none border-2 border-[var(--border)] bg-[var(--paper)] checked:border-[var(--circuit)] checked:bg-[var(--circuit)] transition-colors cursor-pointer"
                      checked={paymentInstructionsAccepted}
                      onChange={(e) => setPaymentInstructionsAccepted(e.target.checked)}
                    />
                    <CheckCircle2 size={14} className="absolute text-[var(--paper)] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" style={{ opacity: paymentInstructionsAccepted ? 1 : 0 }} />
                  </div>
                  <span className="font-body text-sm font-bold text-[var(--ink)] group-hover:text-[var(--circuit)] transition-colors select-none">
                    I have followed the above instructions and confirm that my payment screenshot is clear and complete.
                  </span>
                </label>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                  <button 
                    type="button" 
                    onClick={() => setShowPaymentInstructions(false)}
                    className="w-full sm:w-auto px-6 py-3 font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink-soft)] border border-[var(--border)] bg-[var(--paper)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    disabled={!paymentInstructionsAccepted}
                    onClick={() => {
                      if (paymentInstructionsAccepted) {
                        setShowPaymentInstructions(false);
                        fileInputRef.current.click();
                      }
                    }}
                    className="w-full sm:w-auto px-8 py-3 font-mono text-[10px] font-bold tracking-widest uppercase text-[var(--ink)] bg-[var(--spark)] hover:bg-[var(--spark-soft)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue to Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}