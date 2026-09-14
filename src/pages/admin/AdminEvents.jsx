import React, { useState, useEffect } from 'react';
import { 
  Loader2, Search, Filter, Plus, Calendar, Clock, MapPin, MoreVertical, 
  Edit, Trash2, Users, Image as ImageIcon, Upload, ChevronUp, ChevronDown, 
  Check, Star, AlertCircle, ExternalLink 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import ProtectedImage from '../../components/common/ProtectedImage';
import ReactQuill from 'react-quill';
import imageCompression from 'browser-image-compression';
import 'react-quill/dist/quill.snow.css';

function decodeHtmlEntities(html) {
  if (!html) return '';
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state for Create/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const initialFormData = {
    title: '',
    slug: '',
    description: '',
    eventStory: '',
    date: '',
    venue: '',
    category: 'Other',
    status: 'Upcoming',
    registrationOpen: true,
    allowIndividualRegistration: true,
    allowTeamRegistration: false,
    maxTeamSize: 5,
    paymentRequired: false,
    paymentQrImage: null
  };
  const [formData, setFormData] = useState(initialFormData);
  
  // Multi-image gallery state
  const [imagesList, setImagesList] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  // Payment QR Upload State
  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const json = await res.json();
      if (json.status === 'success') {
        setEvents(json.data.events);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setImagesList([]);
    setExternalUrlInput('');
    setUrlError('');
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setFormData({
      _id: event._id,
      title: event.title,
      slug: event.slug,
      description: event.description || '',
      eventStory: decodeHtmlEntities(event.eventStory || ''),
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      venue: event.venue,
      category: event.category || 'Other',
      status: event.status,
      registrationOpen: event.registrationOpen ?? true,
      allowIndividualRegistration: event.allowIndividualRegistration ?? true,
      allowTeamRegistration: event.allowTeamRegistration ?? false,
      maxTeamSize: event.maxTeamSize || 5,
      paymentRequired: event.paymentRequired ?? false,
      paymentQrImage: event.paymentQrImage || null
    });

    // Populate imagesList
    let initialImgs = [];
    if (Array.isArray(event.images) && event.images.length > 0) {
      initialImgs = event.images.map((img, idx) => ({
        source: img.source || (img.url ? 'external' : 'cloudinary'),
        url: img.url || '',
        imageId: img.imageId?._id || img.imageId || null,
        publicId: img.publicId || '',
        isCover: !!img.isCover,
        order: typeof img.order === 'number' ? img.order : idx,
        alt: img.alt || event.title
      }));
    } else if (event.coverImage) {
      initialImgs = [{
        source: event.coverImage.source || 'cloudinary',
        url: event.coverImage.url || '',
        imageId: event.coverImage.imageId?._id || event.coverImage.imageId || null,
        publicId: event.coverImage.publicId || '',
        isCover: true,
        order: 0,
        alt: event.title
      }];
    } else if (event.posterId) {
      initialImgs = [{
        source: 'cloudinary',
        url: '',
        imageId: event.posterId?._id || event.posterId,
        publicId: '',
        isCover: true,
        order: 0,
        alt: event.title
      }];
    }

    if (initialImgs.length > 0 && !initialImgs.some(i => i.isCover)) {
      initialImgs[0].isCover = true;
    }

    setImagesList(initialImgs);
    setExternalUrlInput('');
    setUrlError('');
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleUploadImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      let uploadFile = file;
      if (file.type.startsWith('image/')) {
        try {
          // Compress the image before uploading to avoid Vercel's 4.5MB payload limit
          const options = { maxSizeMB: 2, maxWidthOrHeight: 1200, useWebWorker: true };
          uploadFile = await imageCompression(file, options);
        } catch (compErr) {
          console.warn('Image compression failed on client, proceeding with original', compErr);
        }
      }

      const fd = new FormData();
      fd.append('image', uploadFile);

      const res = await fetch('/api/admin/events/upload-image', {
        method: 'POST',
        body: fd
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('Server returned an invalid response (Payload too large or server error).');
      }
      
      if (!res.ok) throw new Error(data?.message || 'Image upload failed');

      const newImg = {
        source: 'cloudinary',
        imageId: data.data._id,
        publicId: data.data.publicId,
        url: '',
        isCover: imagesList.length === 0,
        order: imagesList.length,
        alt: formData.title || 'Event image'
      };

      setImagesList(prev => [...prev, newImg]);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddExternalUrl = () => {
    setUrlError('');
    const trimmed = externalUrlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('https://')) {
      setUrlError('Only secure HTTPS URLs (https://...) are accepted.');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setUrlError('Invalid URL format.');
      return;
    }

    const newImg = {
      source: 'external',
      url: trimmed,
      imageId: null,
      publicId: '',
      isCover: imagesList.length === 0,
      order: imagesList.length,
      alt: formData.title || 'Event image'
    };

    setImagesList(prev => [...prev, newImg]);
    setExternalUrlInput('');
  };

  const handleSetCover = (index) => {
    setImagesList(prev => prev.map((img, i) => ({
      ...img,
      isCover: i === index
    })));
  };

  const handleMoveImage = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= imagesList.length) return;

    setImagesList(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((img, i) => ({ ...img, order: i }));
    });
  };

  const handleRemoveImage = (index) => {
    setImagesList(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      if (prev[index]?.isCover && filtered.length > 0) {
        filtered[0].isCover = true;
      }
      return filtered.map((img, i) => ({ ...img, order: i }));
    });
  };

  const handleUploadQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingQr(true);

      let uploadFile = file;
      if (file.type.startsWith('image/')) {
        try {
          const options = { maxSizeMB: 2, maxWidthOrHeight: 1200, useWebWorker: true };
          uploadFile = await imageCompression(file, options);
        } catch (compErr) {
          console.warn('Image compression failed on client, proceeding with original', compErr);
        }
      }

      const fd = new FormData();
      fd.append('image', uploadFile);

      const res = await fetch('/api/admin/events/upload-image', {
        method: 'POST',
        body: fd
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('Server returned an invalid response (Payload too large or server error).');
      }
      
      if (!res.ok) throw new Error(data?.message || 'Image upload failed');

      setFormData({ ...formData, paymentQrImage: { _id: data.data._id, imageId: data.data.imageId } });
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingQr(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.registrationOpen && !formData.allowIndividualRegistration && !formData.allowTeamRegistration) {
      return alert('If registration is open, you must allow at least one registration mode (Individual or Team).');
    }

    try {
      setSaving(true);
      
      const endpoint = isEditing ? `/api/admin/events/${formData._id}` : '/api/admin/events';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const sanitizedImages = imagesList.map((img, i) => ({
        ...img,
        order: i
      }));
      if (sanitizedImages.length > 0 && !sanitizedImages.some(img => img.isCover)) {
        sanitizedImages[0].isCover = true;
      }

      const payload = {
        ...formData,
        images: sanitizedImages
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save event');
      
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete event');
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleRegistration = async (event) => {
    const action = event.registrationOpen ? "CLOSE" : "OPEN";
    if (action === "CLOSE") {
      if (!window.confirm("Close registration for this event?\n\nExisting registrations will remain available, but new registrations will no longer be accepted.")) return;
    }
    
    try {
      const res = await fetch(`/api/admin/events/${event._id}/registration`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationOpen: !event.registrationOpen })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to toggle registration');
      
      // Update local state
      setEvents(events.map(e => e._id === event._id ? { ...e, registrationOpen: data.registrationOpen } : e));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Ongoing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-[var(--paper-dim)] text-[var(--ink-soft)] border-[var(--border)]';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-[var(--ink)]">Events Management</h2>
          <p className="text-sm font-mono text-[var(--ink-soft)]">Create and manage club events and activities.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-[var(--spark)] text-ink rounded-none text-sm font-medium hover:bg-[var(--spark-soft)] transition-colors shadow-none">
          <Plus size={16} />
          Create Event
        </button>
      </div>

      <div className="bg-[var(--paper)] border border-[var(--border)] overflow-hidden shadow-none flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--paper-dim)] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" size={18} />
            <input 
              type="text" 
              placeholder="Search event title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--circuit)]/20 focus:border-[var(--circuit)] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-[var(--ink-soft)]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-8 py-2 border border-[var(--border)] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--circuit)]/20 transition-all appearance-none bg-[var(--paper)]"
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* List View */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto text-[var(--ink-soft)] mb-2" size={24} />
              <p className="text-[var(--ink-soft)]">Loading events...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              Error: {error}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-[var(--ink-soft)]">
              No events found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-[var(--paper-dim)]">
              {filteredEvents.map((event) => (
                <div key={event._id} className="bg-[var(--paper)] border border-[var(--border)] overflow-hidden shadow-none flex flex-col group hover:shadow-none transition-shadow">
                  {/* Event Poster Header */}
                  <div className="h-36 bg-[var(--paper-dim)] relative border-b border-[var(--border)]">
                    {(() => {
                      const cover = event.coverImage || (event.images && event.images.find(i => i.isCover)) || (event.images && event.images[0]);
                      const imgId = cover?.imageId?.imageId || cover?.imageId || event.posterId?.imageId || (typeof event.posterId === 'string' ? event.posterId : null);
                      const srcUrl = cover?.source === 'external' ? cover.url : null;
                      const count = event.images?.length || (imgId || srcUrl ? 1 : 0);

                      return (
                        <>
                          {imgId || srcUrl ? (
                            <ProtectedImage 
                              imageId={imgId} 
                              src={srcUrl}
                              variant="event_card"
                              alt={event.title} 
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--ink-soft)]">
                              <Calendar size={32} />
                            </div>
                          )}
                          {count > 1 && (
                            <span className="absolute bottom-2 left-2 z-10 bg-[var(--ink)]/80 text-[var(--paper)] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-none border border-white/10 backdrop-blur-sm flex items-center gap-1 shadow-none">
                              <ImageIcon size={10} /> {count} images
                            </span>
                          )}
                        </>
                      );
                    })()}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={cn("px-2.5 py-1 rounded-none-full text-[10px] font-bold tracking-wider uppercase shadow-none border", getStatusColor(event.status))}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1">
                    <h3 className="font-bold text-[var(--ink)] truncate mb-1" title={event.title}>{event.title}</h3>
                    <div className="text-xs text-[var(--circuit)] font-mono mb-3">{event.category}</div>
                    
                    <div className="space-y-2 text-xs text-[var(--ink-soft)]">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[var(--ink-soft)]" />
                        <span>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[var(--ink-soft)]" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 bg-[var(--paper-dim)] border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <button 
                      onClick={() => handleToggleRegistration(event)}
                      className={cn(
                        "flex items-center gap-1.5 font-medium px-2 py-1 rounded-none transition-colors border shadow-none",
                        event.registrationOpen 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                          : "bg-[var(--paper-dim)] text-[var(--ink-soft)] border-[var(--border)] hover:bg-[var(--paper-dim)]"
                      )}
                      title={event.registrationOpen ? "Click to close registration" : "Click to open registration"}
                    >
                      <div className={cn("w-2 h-2 rounded-none-full", event.registrationOpen ? "bg-emerald-500" : "bg-slate-400")}></div>
                      {event.registrationOpen ? 'Reg Open' : 'Reg Closed'}
                    </button>
                    
                    <div className="flex gap-2">
                      <Link to={`/control/events/${event._id}/entries`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-none transition-colors" title="View Registrations">
                        <Users size={16} />
                      </Link>
                      <button onClick={() => openEditModal(event)} className="p-1.5 text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] rounded-none transition-colors" title="Edit Event">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(event._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-none transition-colors" title="Delete Event">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--paper)] rounded-none shadow-none w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--paper)]">
              <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-[var(--ink)]">{isEditing ? 'Edit Event' : 'Create New Event'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--ink-soft)] hover:text-[var(--ink-soft)]">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2">Event Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => {
                        // Auto-generate slug from title
                        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setFormData({...formData, title: e.target.value, slug});
                      }}
                      required
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-none text-sm focus:outline-none focus:border-[var(--circuit)] focus:ring-1 focus:ring-[var(--circuit)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2">URL Slug</label>
                    <input 
                      type="text" 
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-none text-sm focus:outline-none focus:border-[var(--circuit)] focus:ring-1 focus:ring-[var(--circuit)] transition-colors bg-[var(--paper-dim)]"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-none text-sm focus:outline-none focus:border-[var(--circuit)] focus:ring-1 focus:ring-[var(--circuit)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2">Venue</label>
                    <input 
                      type="text" 
                      value={formData.venue}
                      onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-none text-sm focus:outline-none focus:border-[var(--circuit)] focus:ring-1 focus:ring-[var(--circuit)] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-none text-sm focus:outline-none focus:border-[var(--circuit)] focus:ring-1 focus:ring-[var(--circuit)] transition-colors bg-[var(--paper)]"
                    >
                      <option value="Hackathon">Hackathon</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Coding Contest">Coding Contest</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-none text-sm focus:outline-none focus:border-[var(--circuit)] focus:ring-1 focus:ring-[var(--circuit)] transition-colors bg-[var(--paper)]"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2">Short Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-none text-sm focus:outline-none focus:border-[var(--circuit)] focus:ring-1 focus:ring-[var(--circuit)] transition-colors resize-y bg-[var(--paper)]"
                  ></textarea>
                </div>

                {/* Event Story Editor */}
                <div className="pt-2 border-t border-[var(--border)] mt-4">
                  <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-1">Event Story / About This Event</label>
                  <p className="text-[11px] text-[var(--ink-soft)] mb-3">Write detailed information about this event that users can read on the event details page.</p>
                  
                  <div className="bg-[var(--paper)] border border-[var(--border)] [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-[var(--border)] [&_.ql-container]:border-none [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-[var(--ink)] [&_.ql-editor]:font-body [&_.ql-editor]:text-sm">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.eventStory} 
                      onChange={(content) => setFormData({...formData, eventStory: content})}
                      modules={{
                        toolbar: [
                          [{ 'header': [2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'clean']
                        ]
                      }}
                      formats={[
                        'header',
                        'bold', 'italic', 'underline', 'strike', 'blockquote',
                        'list', 'bullet',
                        'link'
                      ]}
                    />
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className={`text-[10px] font-mono tracking-wider ${formData.eventStory?.replace(/<[^>]*>?/gm, '').length > 10000 ? 'text-red-500 font-bold' : 'text-[var(--ink-soft)]'}`}>
                      {formData.eventStory?.replace(/<[^>]*>?/gm, '').length || 0} / 10,000 characters
                    </span>
                  </div>
                </div>

                {/* Registration Open Toggle */}
                <div className="pt-2 border-t border-[var(--border)] mt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
                    <input 
                      type="checkbox"
                      checked={formData.registrationOpen}
                      onChange={(e) => setFormData({...formData, registrationOpen: e.target.checked})}
                      className="w-4 h-4 text-[var(--circuit)] rounded-none border-[var(--border)] focus:ring-[var(--circuit)]"
                    />
                    <span className="text-sm font-bold text-[var(--ink)]">Registrations Open (Allow public users to register)</span>
                  </label>

                  {formData.registrationOpen && (
                    <div className="pl-6 space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={formData.allowIndividualRegistration}
                          onChange={(e) => setFormData({...formData, allowIndividualRegistration: e.target.checked})}
                          className="w-4 h-4 text-[var(--circuit)] rounded-none border-[var(--border)] focus:ring-[var(--circuit)]"
                        />
                        <span className="text-sm text-[var(--ink-soft)]">Allow Individual Registration</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={formData.allowTeamRegistration}
                          onChange={(e) => setFormData({...formData, allowTeamRegistration: e.target.checked})}
                          className="w-4 h-4 text-[var(--circuit)] rounded-none border-[var(--border)] focus:ring-[var(--circuit)]"
                        />
                        <span className="text-sm text-[var(--ink-soft)]">Allow Team Registration</span>
                      </label>

                      {formData.allowTeamRegistration && (
                        <div className="pl-6 space-y-4 pt-2">
                          <div>
                            <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2">Maximum Team Size</label>
                            <select
                              value={formData.maxTeamSize}
                              onChange={(e) => setFormData({...formData, maxTeamSize: parseInt(e.target.value) || 5})}
                              className="w-full px-4 py-3 bg-[var(--paper-dim)] border border-[var(--border)] text-[var(--ink)] rounded-none focus:outline-none focus:border-[var(--circuit)] font-mono text-xs transition-colors appearance-none cursor-pointer"
                            >
                              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num} Members</option>
                              ))}
                            </select>
                            <p className="text-[10px] text-[var(--ink-soft)] mt-1">Total people including the leader (min 2, max 10).</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={formData.paymentRequired}
                            onChange={(e) => setFormData({...formData, paymentRequired: e.target.checked})}
                            className="w-4 h-4 text-[var(--circuit)] rounded-none border-[var(--border)] focus:ring-[var(--circuit)]"
                          />
                          <span className="text-sm font-bold text-[var(--ink)]">Payment Required for this event</span>
                        </label>
                        
                        {formData.paymentRequired && (
                          <div className="mt-3 bg-[var(--paper-dim)] border border-[var(--border)] rounded-none p-4">
                            <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2 mb-2">Payment QR Code</label>
                            
                            {formData.paymentQrImage ? (
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-none border border-[var(--border)] overflow-hidden relative bg-[var(--paper)]">
                                  <ProtectedImage imageId={formData.paymentQrImage?.imageId || formData.paymentQrImage} variant="public" alt="QR" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex gap-2">
                                  <label className="text-xs font-medium bg-[var(--paper)] border border-[var(--border)] px-3 py-1.5 rounded-none cursor-pointer hover:bg-[var(--paper-dim)] transition-colors shadow-none">
                                    {uploadingQr ? <Loader2 size={14} className="animate-spin inline mr-1" /> : <Upload size={14} className="inline mr-1" />}
                                    Replace
                                    <input type="file" accept="image/*" onChange={handleUploadQr} className="hidden" disabled={uploadingQr} />
                                  </label>
                                  <button type="button" onClick={() => setFormData({...formData, paymentQrImage: null})} className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-none border border-red-100 hover:bg-red-100 transition-colors">
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="inline-flex items-center gap-2 text-xs font-medium bg-[var(--paper)] border border-[var(--border)] px-3 py-2 rounded-none cursor-pointer hover:bg-[var(--paper-dim)] transition-colors shadow-none">
                                {uploadingQr ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {uploadingQr ? 'Uploading...' : 'Upload QR Image'}
                                <input type="file" accept="image/*" onChange={handleUploadQr} className="hidden" disabled={uploadingQr} />
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Media Gallery Manager */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--ink)] mb-2">Event Media Gallery</label>
                      <p className="text-[11px] text-[var(--ink-soft)]">Upload images or paste secure HTTPS image links (ImgBB, Cloudinary, Unsplash, etc.). Mark any photo as cover.</p>
                    </div>
                    <span className="font-mono text-xs text-[var(--ink-soft)] bg-[var(--paper-dim)] px-2 py-0.5 rounded-none font-medium border border-[var(--border)]">
                      {imagesList.length} {imagesList.length === 1 ? 'image' : 'images'}
                    </span>
                  </div>

                  {/* Add Image Controls: File upload + External URL input */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[var(--paper-dim)] p-3.5 rounded-none border border-[var(--border)]">
                    {/* File Upload Button */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold font-mono uppercase text-[var(--ink-soft)] mb-1">Upload Local Image</label>
                      <label className={cn(
                        "flex items-center justify-center gap-2 px-3 py-2 bg-[var(--paper)] border border-[var(--border)] rounded-none text-xs font-medium text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] cursor-pointer transition-colors shadow-none",
                        uploadingImage && "opacity-60 pointer-events-none"
                      )}>
                        {uploadingImage ? <Loader2 className="animate-spin text-[var(--circuit)]" size={14} /> : <Upload size={14} className="text-[var(--ink-soft)]" />}
                        <span>{uploadingImage ? 'Uploading & Processing...' : 'Select image file'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          disabled={uploadingImage}
                          onChange={handleUploadImageFile} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                    {/* External URL Input */}
                    <div className="sm:col-span-7">
                      <label className="block text-[10px] font-bold font-mono uppercase text-[var(--ink-soft)] mb-1">Add Image via HTTPS URL</label>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          placeholder="https://i.ibb.co/... or https://..."
                          value={externalUrlInput}
                          onChange={(e) => { setExternalUrlInput(e.target.value); setUrlError(''); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddExternalUrl(); } }}
                          className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-none text-xs focus:ring-2 focus:ring-[var(--circuit)]/20 focus:border-[var(--circuit)] outline-none bg-[var(--paper)]"
                        />
                        <button
                          type="button"
                          onClick={handleAddExternalUrl}
                          className="px-3 py-1.5 bg-[var(--ink)] text-[var(--paper)] rounded-none text-xs font-medium hover:bg-slate-700 transition-colors shadow-none shrink-0"
                        >
                          Add URL
                        </button>
                      </div>
                      {urlError && <p className="text-[10px] text-red-500 mt-1">{urlError}</p>}
                    </div>
                  </div>

                  {/* Images List Cards */}
                  {imagesList.length === 0 ? (
                    <div className="border border-dashed border-[var(--border)] rounded-none p-5 text-center text-[var(--ink-soft)] bg-[var(--paper)]">
                      <ImageIcon size={26} className="mx-auto mb-1 opacity-40" />
                      <p className="text-xs">No media added yet. Upload an image file or add an external URL above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {imagesList.map((img, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-none border transition-all bg-[var(--paper)]",
                            img.isCover ? "border-[var(--circuit)] ring-1 ring-[var(--circuit)]/20 bg-[var(--circuit)]/5" : "border-[var(--border)] hover:border-[var(--border)]"
                          )}
                        >
                          {/* Thumbnail preview */}
                          <div className="w-14 h-12 rounded-none overflow-hidden bg-[var(--ink)] flex-shrink-0 relative border border-[var(--border)] flex items-center justify-center">
                            <ProtectedImage 
                              imageId={img.imageId?.imageId || img.imageId} 
                              src={img.source === 'external' ? img.url : null} 
                              variant="event_card" 
                              className="w-full h-full object-cover" 
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-1.5 py-0.5 rounded-none text-[9px] font-mono font-bold tracking-wider uppercase",
                                img.isCover ? "bg-[var(--spark)] text-ink shadow-xs" : "bg-[var(--paper-dim)] text-[var(--ink-soft)]"
                              )}>
                                {img.isCover ? "COVER" : `PHOTO #${idx + 1}`}
                              </span>
                              <span className="text-[10px] font-mono text-[var(--ink-soft)]">
                                {img.source === 'external' ? 'External URL' : 'Cloudinary Upload'}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--ink-soft)] truncate mt-0.5" title={img.url || img.publicId || (typeof img.imageId === 'string' ? img.imageId : img.imageId?.imageId)}>
                              {img.source === 'external' ? img.url : (img.publicId || 'Secure storage')}
                            </p>
                          </div>

                          {/* Reorder and management buttons */}
                          <div className="flex items-center gap-1">
                            {!img.isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(idx)}
                                className="px-2 py-1 text-[10px] font-medium text-[var(--ink-soft)] hover:text-[var(--circuit)] hover:bg-[var(--paper-dim)] rounded-none transition-colors"
                                title="Set as event cover poster"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, -1)}
                              className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] rounded-none disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === imagesList.length - 1}
                              onClick={() => handleMoveImage(idx, 1)}
                              className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] rounded-none disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Down"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-none transition-colors"
                              title="Remove image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-[var(--paper-dim)] border-t border-[var(--border)] flex justify-end gap-3 sticky bottom-0">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[var(--paper)] border border-[var(--border)] text-[var(--ink-soft)] rounded-none text-sm font-medium hover:bg-[var(--paper-dim)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[var(--spark)] text-ink rounded-none text-sm font-medium hover:bg-[var(--spark-soft)] transition-colors shadow-none flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {isEditing ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



