import React, { useState, useEffect, useRef } from 'react';
import {
  Loader2, Search, Filter, Edit, Trash2, Eye, Mail, Phone,
  Download, UserPlus, X, Upload, CheckCircle2, AlertCircle,
  Users, GraduationCap, Crop
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import MemberPhotoEditor from '../../components/common/MemberPhotoEditor';

// ─── Role constants (mirrors backend + public ROLE_ORDER) ─────────────────────
const FACULTY_ROLES     = ['HOS', 'COS', 'Founder', 'Dean', 'Associate Dean', 'Faculty Advisor', 'Faculty Coordinator', 'Faculty'];
const LEADERSHIP_ROLES  = ['President', 'Vice President', 'Secretary', 'Head Coordinator', 'Technical Head', 'Social Media Head'];
const TEAM_ROLES        = ['Technical Team', 'Media Team', 'Anchor', 'Coordinator'];
const ALL_ROLES         = [...FACULTY_ROLES, ...LEADERSHIP_ROLES, ...TEAM_ROLES];

const COURSES = ['MCA', 'BCA', 'BSC.IT', 'MSC.IT'];
const STUDENT_DOMAINS = ['Technical', 'Media', 'Anchor', 'Coordinator', 'Executive'];

// ─── Shared input styles ──────────────────────────────────────────────────────
const inp = 'w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white';
const lbl = 'block text-[10px] font-bold font-mono tracking-widest uppercase text-slate-500 mb-1';

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ label }) {
  return (
    <div className="pt-2 pb-1 border-b border-slate-100">
      <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">{label}</p>
    </div>
  );
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────
function AddMemberModal({ onClose, onCreated }) {
  const [memberType, setMemberType]       = useState('student');
  const [step, setStep]                   = useState(1);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [rawImageForCrop, setRawImageForCrop] = useState(null);
  const [rawFileName, setRawFileName]     = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [isCustomRole, setIsCustomRole]   = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', whatsapp: '',
    registrationNumber: '', course: '', section: '', domain: '',
    employeeId: '', department: '', designation: '',
    role: '', status: 'Approved',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (rawImageForCrop) URL.revokeObjectURL(rawImageForCrop);
    };
  }, []);

  // Escape key
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // ── Image ──────────────────────────────────────────────────────────────
  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (e.target) e.target.value = '';

    const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(file.name);
    if (!isImg) {
      setError('Only image files are accepted for the profile photo.');
      return;
    }
    setImageProcessing(true);
    setError('');
    try {
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
      setError(err.message || 'Image processing failed. Please try a different image.');
    } finally {
      setImageProcessing(false);
    }
  };

  const handleCropConfirm = async (croppedBlob, croppedFile) => {
    setImageProcessing(true);
    try {
      const options = { maxSizeMB: 2.0, maxWidthOrHeight: 1200, useWebWorker: true };
      const compressedFile = await imageCompression(croppedFile, options);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
      setCropModalOpen(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to process cropped photo.');
    } finally {
      setImageProcessing(false);
    }
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (rawImageForCrop) URL.revokeObjectURL(rawImageForCrop);
    setImageFile(null);
    setImagePreview(null);
    setRawImageForCrop(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('memberType', memberType);
      fd.append('fullName',   form.fullName.trim());
      fd.append('role',       form.role);
      fd.append('status',     form.status);

      // Contact fields — optional for faculty, email required for students
      if (form.email.trim())    fd.append('email',    form.email.trim());
      if (form.phone.trim())    fd.append('phone',    form.phone.trim());
      if (form.whatsapp.trim()) fd.append('whatsapp', form.whatsapp.trim());

      if (memberType === 'student') {
        fd.append('registrationNumber', form.registrationNumber.trim().toUpperCase());
        fd.append('course',  form.course);
        fd.append('section', form.section.trim());
        if (form.domain.trim()) fd.append('domain', form.domain.trim());
      } else {
        fd.append('domain', 'Faculty');
        if (form.employeeId.trim())  fd.append('employeeId',  form.employeeId.trim());
        if (form.department.trim())  fd.append('department',  form.department.trim());
        if (form.designation.trim()) fd.append('designation', form.designation.trim());
      }
      if (imageFile) fd.append('profileImage', imageFile);

      const res  = await fetch('/api/admin/members', { method: 'POST', credentials: 'include', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create member');
      onCreated(json.data.member);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = memberType === 'faculty' ? FACULTY_ROLES : [...LEADERSHIP_ROLES, ...TEAM_ROLES];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-brand-primary" />
            <h3 className="text-base font-heading font-bold text-slate-900">Add Member</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Step 1 — member type */}
        {step === 1 && (
          <div className="p-6 flex flex-col gap-6">
            <p className="text-sm text-slate-600">Select the type of member you want to add:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setMemberType('student'); setStep(2); }}
                className="flex flex-col items-center gap-3 p-6 border-2 border-slate-200 rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <GraduationCap size={22} />
                </div>
                <div className="text-center">
                  <p className="font-heading font-bold text-slate-900 uppercase tracking-tight">Student</p>
                  <p className="text-xs text-slate-500 mt-0.5">Registered student member</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setMemberType('faculty'); set('status', 'Approved'); setStep(2); }}
                className="flex flex-col items-center gap-3 p-6 border-2 border-slate-200 rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <Users size={22} />
                </div>
                <div className="text-center">
                  <p className="font-heading font-bold text-slate-900 uppercase tracking-tight">Faculty</p>
                  <p className="text-xs text-slate-500 mt-0.5">Permanent faculty member</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            {/* Type indicator + back */}
            <div className="px-6 pt-4 pb-0 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-brand-primary font-mono font-bold tracking-widest uppercase transition-colors"
              >
                ← Back
              </button>
              <span className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border',
                memberType === 'faculty'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              )}>
                {memberType === 'faculty' ? '⬥ Faculty' : '⬦ Student'}
              </span>
            </div>

            {/* Scrollable body */}
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}

              {/* 01 Personal */}
              <SectionHeader label="01 / Personal Information" />
              <div>
                <label className={lbl}>Full Name *</label>
                <input className={inp} value={form.fullName} onChange={e => set('fullName', e.target.value)} required placeholder="Enter full name" />
              </div>

              {/* Contact fields — student & faculty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>{memberType === 'student' ? 'Email *' : 'Official Email'}</label>
                  <input
                    className={inp}
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    required={memberType === 'student'}
                    placeholder={memberType === 'student' ? 'email@lpu.in' : 'faculty@lpu.co.in'}
                  />
                </div>
                <div>
                  <label className={lbl}>Phone</label>
                  <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Mobile number" />
                </div>
              </div>
              <div>
                <label className={lbl}>WhatsApp</label>
                <input className={inp} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="WhatsApp number" />
              </div>

              {/* 02 Academic / Faculty */}
              {memberType === 'student' ? (
                <>
                  <SectionHeader label="02 / Academic Information" />
                  <div>
                    <label className={lbl}>Registration Number *</label>
                    <input
                      className={inp}
                      value={form.registrationNumber}
                      onChange={e => set('registrationNumber', e.target.value.toUpperCase())}
                      required
                      placeholder="e.g. 12302960"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Course *</label>
                      <select className={inp} value={form.course} onChange={e => set('course', e.target.value)} required>
                        <option value="">Select course</option>
                        {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Section *</label>
                      <input className={inp} value={form.section} onChange={e => set('section', e.target.value)} required placeholder="e.g. K23MW" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Domain *</label>
                    <select className={inp} value={form.domain} onChange={e => set('domain', e.target.value)} required>
                      <option value="">Select domain</option>
                      {STUDENT_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <SectionHeader label="02 / Faculty Information" />
                  <div>
                    <label className={lbl}>Employee / Faculty ID</label>
                    <input className={inp} value={form.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="Faculty ID (optional, must be unique)" />
                  </div>
                  <div>
                    <label className={lbl}>Department / School</label>
                    <input className={inp} value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. School of Computer Applications" />
                  </div>
                  <div>
                    <label className={lbl}>Designation</label>
                    <input className={inp} value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. Assistant Professor" />
                  </div>
                </>
              )}

              {/* 03 Role */}
              <SectionHeader label="03 / Role & Position" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={lbl}>Role *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isCustomRole;
                      setIsCustomRole(next);
                      if (next) {
                        set('role', customRoleText.trim());
                      } else {
                        set('role', roleOptions[0] || '');
                      }
                    }}
                    className="text-[10px] font-mono text-brand-primary hover:underline font-bold uppercase tracking-wider"
                  >
                    {isCustomRole ? '← Choose preset role' : '+ Custom role'}
                  </button>
                </div>

                {!isCustomRole ? (
                  <select
                    className={inp}
                    value={roleOptions.includes(form.role) ? form.role : (form.role ? '__custom__' : '')}
                    onChange={e => {
                      if (e.target.value === '__custom__') {
                        setIsCustomRole(true);
                        set('role', customRoleText.trim());
                      } else {
                        set('role', e.target.value);
                      }
                    }}
                    required
                  >
                    <option value="">Select role</option>
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    <option value="__custom__">+ Custom Role / Other…</option>
                  </select>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      className={cn(inp, 'border-brand-primary/50 focus:ring-brand-primary')}
                      value={customRoleText}
                      onChange={e => {
                        setCustomRoleText(e.target.value);
                        set('role', e.target.value);
                      }}
                      placeholder={memberType === 'faculty' ? 'e.g. COS, Chief of School, Associate Dean…' : 'e.g. Technical Lead, Event Head…'}
                      required
                      autoFocus
                    />
                    <p className="text-[10px] text-slate-400 font-mono">
                      Type any custom role or title.
                    </p>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wider">
                  {memberType === 'faculty'
                    ? 'Faculty roles — permanent positions'
                    : 'All leadership & team roles are admin-assigned only'}
                </p>
              </div>

              {/* 04 Profile Image */}
              <SectionHeader label="04 / Profile Image (optional)" />
              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 hover:border-brand-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center py-8 gap-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.heic,image/*"
                    onChange={handleImage}
                    className="hidden"
                    aria-label="Upload profile photo"
                  />
                  {imageProcessing
                    ? <Loader2 size={20} className="animate-spin text-brand-primary" />
                    : <Upload size={20} className="text-slate-400" />
                  }
                  <p className="text-sm text-slate-600 font-medium">
                    {imageProcessing ? 'Processing…' : 'Click to select & crop photo'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">PNG · JPG · HEIC · Max 5 MB (Auto 4:5 Card Ratio)</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.heic,image/*"
                    onChange={handleImage}
                    className="hidden"
                  />
                  <div className="w-14 h-17 aspect-[4/5] rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{imageFile?.name || 'profile.jpg'}</p>
                    <p className="text-xs text-emerald-600 font-mono font-bold mt-0.5 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Cropped & Ready ({(imageFile?.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setCropModalOpen(true)}
                        className="text-[11px] font-mono font-bold text-brand-primary hover:underline uppercase flex items-center gap-1"
                      >
                        <Crop size={11} /> Adjust Crop
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-mono font-bold text-slate-500 hover:text-slate-800 uppercase"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                  <button type="button" onClick={removeImage} aria-label="Remove image" className="p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors shrink-0">
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* 05 Status */}
              <SectionHeader label="05 / Status" />
              <div className="flex gap-3">
                {['Approved', 'Pending'].map(s => (
                  <label
                    key={s}
                    className={cn(
                      'flex-1 flex items-center gap-2.5 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all text-sm font-medium',
                      form.status === s
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <input type="radio" name="addMemberStatus" value={s} checked={form.status === s} onChange={() => set('status', s)} className="sr-only" />
                    <span className={cn(
                      'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0',
                      form.status === s ? 'border-brand-primary' : 'border-slate-300'
                    )}>
                      {form.status === s && <span className="w-2 h-2 rounded-full bg-brand-primary" />}
                    </span>
                    <span>{s === 'Approved' ? (memberType === 'faculty' ? 'Live (Permanent)' : 'Live') : 'Pending Review'}</span>
                  </label>
                ))}
              </div>
              {memberType === 'faculty' && (
                <p className="text-[10px] text-emerald-600 font-mono font-bold uppercase tracking-wider">
                  Faculty members default to Live — no approval workflow needed.
                </p>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || imageProcessing}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2 shadow-sm"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Create Member
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Add Member Crop Modal */}
      <MemberPhotoEditor
        isOpen={cropModalOpen}
        imageSrc={rawImageForCrop || imagePreview}
        fileName={rawFileName}
        aspect={4 / 5}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropModalOpen(false)}
        theme="light"
        title="Adjust Profile Photo"
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminMembers() {
  const [members, setMembers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchTerm, setSearchTerm]     = useState('');
  const [roleFilter, setRoleFilter]     = useState('All');
  const [typeFilter, setTypeFilter]     = useState('All'); // 'All' | 'student' | 'faculty'

  // Edit modal
  const [editModalOpen, setEditModalOpen]   = useState(false);
  const [editingMember, setEditingMember]   = useState(null);
  const [editCustomRole, setEditCustomRole] = useState(false);
  const [saving, setSaving]                 = useState(false);

  // Edit photo states
  const [editPhotoFile, setEditPhotoFile]             = useState(null);
  const [editPhotoPreview, setEditPhotoPreview]       = useState(null);
  const [editRawImageForCrop, setEditRawImageForCrop] = useState(null);
  const [editRawFileName, setEditRawFileName]         = useState('');
  const [editCropModalOpen, setEditCropModalOpen]     = useState(false);
  const [editImageProcessing, setEditImageProcessing] = useState(false);
  const editFileInputRef                              = useRef(null);

  // Add member modal
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
      if (editRawImageForCrop) URL.revokeObjectURL(editRawImageForCrop);
    };
  }, []);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/admin/members?status=Approved', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch members');
      const json = await res.json();
      if (json.status === 'success') setMembers(json.data.members);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (member) => {
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    if (editRawImageForCrop) URL.revokeObjectURL(editRawImageForCrop);
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
    setEditRawImageForCrop(null);
    setEditRawFileName('');
    setEditCropModalOpen(false);
    setEditImageProcessing(false);
    setEditCustomRole(!ALL_ROLES.includes(member.role));
    setEditingMember({ ...member });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    if (editRawImageForCrop) URL.revokeObjectURL(editRawImageForCrop);
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
    setEditRawImageForCrop(null);
    setEditCropModalOpen(false);
    setEditModalOpen(false);
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (e.target) e.target.value = '';

    const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(file.name);
    if (!isImg) {
      alert('Only image files are accepted for the profile photo.');
      return;
    }
    setEditImageProcessing(true);
    try {
      let fileToProcess = file;
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        fileToProcess = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      }
      if (editRawImageForCrop) URL.revokeObjectURL(editRawImageForCrop);
      const previewUrl = URL.createObjectURL(fileToProcess);
      setEditRawImageForCrop(previewUrl);
      setEditRawFileName(fileToProcess.name);
      setEditCropModalOpen(true);
    } catch (err) {
      alert(err.message || 'Image processing failed. Please try a different image.');
    } finally {
      setEditImageProcessing(false);
    }
  };

  const handleEditCropConfirm = async (croppedBlob, croppedFile) => {
    setEditImageProcessing(true);
    try {
      const options = { maxSizeMB: 2.0, maxWidthOrHeight: 1200, useWebWorker: true };
      const compressedFile = await imageCompression(croppedFile, options);
      if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
      setEditPhotoFile(compressedFile);
      setEditPhotoPreview(URL.createObjectURL(compressedFile));
      setEditCropModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to process cropped photo.');
    } finally {
      setEditImageProcessing(false);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const isFaculty = (editingMember.memberType || 'student') === 'faculty';
      
      let res;
      if (editPhotoFile) {
        const fd = new FormData();
        fd.append('fullName', editingMember.fullName);
        fd.append('course', editingMember.course || '');
        fd.append('section', editingMember.section || '');
        fd.append('domain', editingMember.domain || (isFaculty ? 'Faculty' : ''));
        fd.append('department', editingMember.department || '');
        fd.append('designation', editingMember.designation || '');
        if (isFaculty && editingMember.employeeId) fd.append('employeeId', editingMember.employeeId);
        fd.append('role', editingMember.role);
        fd.append('phone', editingMember.phone || '');
        fd.append('whatsapp', editingMember.whatsapp || '');
        fd.append('email', editingMember.email || '');
        fd.append('profileImage', editPhotoFile);

        res = await fetch(`/api/admin/members/${editingMember._id}`, {
          method: 'PATCH',
          credentials: 'include',
          body: fd,
        });
      } else {
        res = await fetch(`/api/admin/members/${editingMember._id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName:    editingMember.fullName,
            course:      editingMember.course      || '',
            section:     editingMember.section     || '',
            domain:      editingMember.domain      || (isFaculty ? 'Faculty' : ''),
            department:  editingMember.department  || '',
            designation: editingMember.designation || '',
            employeeId:  isFaculty ? (editingMember.employeeId || undefined) : undefined,
            role:        editingMember.role,
            phone:       editingMember.phone       || '',
            whatsapp:    editingMember.whatsapp    || '',
            email:       editingMember.email       || '',
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update member');
      setMembers(members.map(m => m._id === editingMember._id ? data.data.member : m));
      closeEditModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this member? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete member');
      setMembers(members.filter(m => m._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMemberCreated = (newMember) => {
    if (newMember.status === 'Approved') {
      setMembers(prev => [newMember, ...prev]);
    }
    setAddModalOpen(false);
  };

  const handleExport = () => {
    window.location.href = `/api/admin/exports?resource=members&format=xlsx&status=Approved`;
  };

  // ── Filters ────────────────────────────────────────────────────────────
  const filteredMembers = members.filter(m => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (m.fullName || '').toLowerCase().includes(q) ||
      (m.registrationNumber || '').toLowerCase().includes(q) ||
      (m.employeeId || '').toLowerCase().includes(q) ||
      (m.course || '').toLowerCase().includes(q) ||
      (m.section || '').toLowerCase().includes(q) ||
      (m.department || '').toLowerCase().includes(q) ||
      (m.designation || '').toLowerCase().includes(q) ||
      (m.domain || '').toLowerCase().includes(q) ||
      (m.role || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'All' || m.role === roleFilter;
    const matchesType = typeFilter === 'All' || (m.memberType || 'student') === typeFilter;
    return matchesSearch && matchesRole && matchesType;
  });

  const uniqueRoles = [...new Set(members.map(m => m.role))].sort();

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Live Members</h2>
          <p className="text-sm font-mono text-slate-500">Manage all approved club members.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-semibold hover:bg-brand-primary/90 transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            Add Member
          </button>
          <Link
            to="/control/members/pending"
            className="px-4 py-2 bg-white border border-brand-primary text-brand-primary rounded-md text-sm font-medium hover:bg-brand-primary/5 transition-colors shadow-sm"
          >
            Pending Approvals
          </Link>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">

          {/* Row 1: search + role filter */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, reg no, or email…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={15} className="text-slate-400 shrink-0" />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none bg-white"
              >
                <option value="All">All Roles</option>
                {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: type filter chips */}
          <div className="flex items-center gap-2">
            {['All', 'student', 'faculty'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase rounded-sm border transition-colors',
                  typeFilter === t
                    ? 'bg-brand-primary border-brand-primary text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                )}
              >
                {t === 'All' ? 'All Types' : t === 'student' ? '⬦ Students' : '⬥ Faculty'}
              </button>
            ))}
            <span className="text-xs text-slate-400 font-mono ml-auto hidden sm:block">
              {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium w-16">Photo</th>
                <th className="px-6 py-4 font-medium">Member Details</th>
                <th className="px-6 py-4 font-medium">Info</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-500">Loading members…</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-red-500">Error: {error}</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No approved members found. Check "Pending Approvals" or use "Add Member".
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => {
                  const isFaculty = (member.memberType || 'student') === 'faculty';
                  return (
                    <tr key={member._id} className="hover:bg-slate-50 transition-colors group">
                      {/* Photo */}
                      <td className="px-6 py-4">
                        <div 
                          onClick={() => openEditModal(member)}
                          className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-brand-primary transition-all"
                          title="Click to view/edit member photo"
                        >
                          {member.photoId ? (
                            <img
                              src={`/api/images/${member.photoId?.imageId || member.photoId}?variant=member_card`}
                              alt={member.fullName}
                              className="w-full h-full object-cover"
                              crossOrigin="use-credentials"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">
                              {member.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Member details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-semibold text-slate-900">{member.fullName}</span>
                          {isFaculty && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold font-mono tracking-wider uppercase rounded border border-emerald-200">
                              Faculty
                            </span>
                          )}
                        </div>
                        {member.registrationNumber && (
                          <div className="text-xs text-slate-500 font-mono">{member.registrationNumber}</div>
                        )}
                        {member.employeeId && (
                          <div className="text-xs text-slate-500 font-mono">ID: {member.employeeId}</div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                          {member.email && <span className="flex items-center gap-1"><Mail size={10} /> {member.email}</span>}
                          {member.phone && <span className="flex items-center gap-1"><Phone size={10} /> {member.phone}</span>}
                          {member.whatsapp && member.whatsapp !== member.phone && (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">WA: {member.whatsapp}</span>
                          )}
                        </div>
                      </td>

                      {/* Info column — context-aware */}
                      <td className="px-6 py-4">
                        {isFaculty ? (
                          <>
                            {member.department  && <div className="text-slate-800 text-xs font-medium">{member.department}</div>}
                            {member.designation && <div className="text-xs text-slate-500 mt-0.5">{member.designation}</div>}
                            {!member.department && !member.designation && (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-slate-900 font-medium">{member.course || '—'}</div>
                            {member.section && <div className="text-xs text-slate-500 mt-0.5">Section: {member.section}</div>}
                            {member.domain && (
                              <div className="mt-1">
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-mono font-bold uppercase rounded border border-slate-200">
                                  {member.domain}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </td>

                      {/* Role badge */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold tracking-wide">
                          {member.role}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors"
                            title="Edit Member"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Member"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editModalOpen && editingMember && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Member</h3>
                {editingMember.memberType === 'faculty' && (
                  <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">Faculty</span>
                )}
              </div>
              <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-700">
                {editingMember.registrationNumber || editingMember.employeeId || '—'}
              </span>
            </div>

            <form onSubmit={handleEditSave}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">

                {/* Profile Photo */}
                <div>
                  <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1.5">
                    Profile Photo
                  </label>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.heic,image/*"
                    onChange={handleEditImageUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="w-16 h-20 aspect-[4/5] rounded-lg overflow-hidden border border-slate-300 bg-slate-200 shrink-0 flex items-center justify-center">
                      {editPhotoPreview ? (
                        <img src={editPhotoPreview} alt="Pending Crop" className="w-full h-full object-cover" />
                      ) : editingMember.photoId ? (
                        <img
                          src={`/api/images/${editingMember.photoId?.imageId || editingMember.photoId}?variant=member_card`}
                          alt={editingMember.fullName}
                          className="w-full h-full object-cover"
                          crossOrigin="use-credentials"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <Users size={20} />
                          <span className="text-[10px] font-mono mt-1">No Photo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editPhotoPreview ? (
                        <>
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {editPhotoFile?.name || 'New photo selected'}
                          </p>
                          <p className="text-[11px] text-amber-600 font-mono font-bold mt-0.5 flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-500" />
                            Pending save ({(editPhotoFile?.size / (1024 * 1024)).toFixed(2)} MB)
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => setEditCropModalOpen(true)}
                              className="text-[11px] font-mono font-bold text-brand-primary hover:underline uppercase flex items-center gap-1"
                            >
                              <Crop size={11} /> Adjust Crop
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => editFileInputRef.current?.click()}
                              className="text-[11px] font-mono font-bold text-slate-600 hover:text-slate-900 uppercase"
                            >
                              Change
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
                                setEditPhotoFile(null);
                                setEditPhotoPreview(null);
                              }}
                              className="text-[11px] font-mono font-bold text-red-500 hover:underline uppercase"
                            >
                              Revert
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-slate-800">
                            {editingMember.photoId ? 'Current profile photo active' : 'No photo uploaded yet'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                            4:5 card aspect ratio crop
                          </p>
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            disabled={editImageProcessing}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-brand-primary text-slate-700 hover:text-brand-primary rounded-md text-xs font-medium font-mono uppercase tracking-wider transition-colors"
                          >
                            {editImageProcessing ? (
                              <>
                                <Loader2 size={12} className="animate-spin text-brand-primary" /> Processing...
                              </>
                            ) : (
                              <>
                                <Upload size={12} /> {editingMember.photoId ? 'Replace Photo' : 'Upload Photo'}
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingMember.fullName}
                    onChange={e => setEditingMember({ ...editingMember, fullName: e.target.value })}
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                {/* Student or faculty conditional fields */}
                {(editingMember.memberType || 'student') === 'student' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Course</label>
                        <select
                          value={editingMember.course || ''}
                          onChange={e => setEditingMember({ ...editingMember, course: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-white"
                        >
                          <option value="">Select course</option>
                          {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Section</label>
                        <input
                          type="text"
                          value={editingMember.section || ''}
                          onChange={e => setEditingMember({ ...editingMember, section: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                          placeholder="e.g. K23MW"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Domain</label>
                      <select
                        value={editingMember.domain || ''}
                        onChange={e => setEditingMember({ ...editingMember, domain: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-white"
                      >
                        <option value="">Select domain</option>
                        {STUDENT_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Employee / Faculty ID</label>
                      <input
                        type="text"
                        value={editingMember.employeeId || ''}
                        onChange={e => setEditingMember({ ...editingMember, employeeId: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                        placeholder="Faculty ID"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Department</label>
                        <input
                          type="text"
                          value={editingMember.department || ''}
                          onChange={e => setEditingMember({ ...editingMember, department: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Designation</label>
                        <input
                          type="text"
                          value={editingMember.designation || ''}
                          onChange={e => setEditingMember({ ...editingMember, designation: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Role — all roles available to admin */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500">Role (Admin Only) *</label>
                    <button
                      type="button"
                      onClick={() => setEditCustomRole(!editCustomRole)}
                      className="text-[10px] font-mono text-brand-primary hover:underline font-bold uppercase tracking-wider"
                    >
                      {editCustomRole ? '← Choose preset role' : '+ Custom role'}
                    </button>
                  </div>

                  {!editCustomRole && ALL_ROLES.includes(editingMember.role) ? (
                    <select
                      value={editingMember.role}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          setEditCustomRole(true);
                        } else {
                          setEditingMember({ ...editingMember, role: e.target.value });
                        }
                      }}
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-white"
                    >
                      <optgroup label="Faculty Roles">
                        {FACULTY_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </optgroup>
                      <optgroup label="Leadership Roles">
                        {LEADERSHIP_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </optgroup>
                      <optgroup label="Team Roles">
                        {TEAM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </optgroup>
                      <option value="__custom__">+ Custom Role / Other…</option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editingMember.role || ''}
                        onChange={e => setEditingMember({ ...editingMember, role: e.target.value })}
                        required
                        placeholder="e.g. COS, Chief of School, Technical Lead…"
                        className="w-full p-2 border border-brand-primary/50 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">
                    {(editingMember.memberType || 'student') === 'student' ? 'Email *' : 'Official Email'}
                  </label>
                  <input
                    type="email"
                    value={editingMember.email || ''}
                    onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
                    required={(editingMember.memberType || 'student') === 'student'}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingMember.phone || ''}
                      onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={editingMember.whatsapp || ''}
                      onChange={e => setEditingMember({ ...editingMember, whatsapp: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Edit Member Photo Crop Modal */}
          <MemberPhotoEditor
            isOpen={editCropModalOpen}
            imageSrc={editRawImageForCrop || editPhotoPreview}
            fileName={editRawFileName}
            aspect={4 / 5}
            onConfirm={handleEditCropConfirm}
            onCancel={() => setEditCropModalOpen(false)}
            theme="light"
            title="Adjust Member Photo"
          />
        </div>
      )}

      {/* ── Add Member Modal ────────────────────────────────────────────────── */}
      {addModalOpen && (
        <AddMemberModal
          onClose={() => setAddModalOpen(false)}
          onCreated={handleMemberCreated}
        />
      )}

    </div>
  );
}
