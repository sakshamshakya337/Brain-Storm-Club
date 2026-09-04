import React, { useState, useEffect } from 'react';
import { 
  Loader2, Search, Filter, Plus, Calendar, Clock, MapPin, MoreVertical, 
  Edit, Trash2, Users, Image as ImageIcon, Upload, ChevronUp, ChevronDown, 
  Check, Star, AlertCircle, ExternalLink 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import ProtectedImage from '../../components/common/ProtectedImage';

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
    date: '',
    venue: '',
    category: 'Other',
    status: 'Upcoming',
    registrationOpen: true
  };
  const [formData, setFormData] = useState(initialFormData);
  
  // Multi-image gallery state
  const [imagesList, setImagesList] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

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
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      venue: event.venue,
      category: event.category || 'Other',
      status: event.status,
      registrationOpen: event.registrationOpen
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
      const fd = new FormData();
      fd.append('image', file);

      const res = await fetch('/api/admin/events/upload-image', {
        method: 'POST',
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Image upload failed');

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

  const handleSave = async (e) => {
    e.preventDefault();
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
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Events Management</h2>
          <p className="text-sm font-mono text-slate-500">Create and manage club events and activities.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-brand-secondary transition-colors shadow-sm">
          <Plus size={16} />
          Create Event
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search event title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none bg-white"
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
              <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={24} />
              <p className="text-slate-500">Loading events...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              Error: {error}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No events found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50">
              {filteredEvents.map((event) => (
                <div key={event._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  {/* Event Poster Header */}
                  <div className="h-36 bg-slate-100 relative border-b border-slate-200">
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
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Calendar size={32} />
                            </div>
                          )}
                          {count > 1 && (
                            <span className="absolute bottom-2 left-2 z-10 bg-slate-900/80 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 backdrop-blur-sm flex items-center gap-1 shadow-sm">
                              <ImageIcon size={10} /> {count} images
                            </span>
                          )}
                        </>
                      );
                    })()}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm border", getStatusColor(event.status))}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1">
                    <h3 className="font-bold text-slate-900 truncate mb-1" title={event.title}>{event.title}</h3>
                    <div className="text-xs text-brand-primary font-mono mb-3">{event.category}</div>
                    
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button 
                      onClick={() => handleToggleRegistration(event)}
                      className={cn(
                        "flex items-center gap-1.5 font-medium px-2 py-1 rounded-md transition-colors border shadow-sm",
                        event.registrationOpen 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      )}
                      title={event.registrationOpen ? "Click to close registration" : "Click to open registration"}
                    >
                      <div className={cn("w-2 h-2 rounded-full", event.registrationOpen ? "bg-emerald-500" : "bg-slate-400")}></div>
                      {event.registrationOpen ? 'Reg Open' : 'Reg Closed'}
                    </button>
                    
                    <div className="flex gap-2">
                      <Link to={`/control/events/${event._id}/entries`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View Registrations">
                        <Users size={16} />
                      </Link>
                      <button onClick={() => openEditModal(event)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors" title="Edit Event">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(event._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Event">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Edit Event' : 'Create New Event'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Event Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => {
                        // Auto-generate slug from title
                        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setFormData({...formData, title: e.target.value, slug});
                      }}
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">URL Slug</label>
                    <input 
                      type="text" 
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-slate-50"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Venue</label>
                    <input 
                      type="text" 
                      value={formData.venue}
                      onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      required
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-white"
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
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none bg-white"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y"
                  ></textarea>
                </div>

                {/* Registration Open Toggle */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={formData.registrationOpen}
                      onChange={(e) => setFormData({...formData, registrationOpen: e.target.checked})}
                      className="w-4 h-4 text-brand-primary rounded border-slate-300 focus:ring-brand-primary"
                    />
                    <span className="text-sm font-medium text-slate-700">Registrations Open (Allow public users to register)</span>
                  </label>
                </div>

                {/* Event Media Gallery Manager */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-700">Event Media Gallery</label>
                      <p className="text-[11px] text-slate-500">Upload images or paste secure HTTPS image links (ImgBB, Cloudinary, Unsplash, etc.). Mark any photo as cover.</p>
                    </div>
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                      {imagesList.length} {imagesList.length === 1 ? 'image' : 'images'}
                    </span>
                  </div>

                  {/* Add Image Controls: File upload + External URL input */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    {/* File Upload Button */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold font-mono uppercase text-slate-500 mb-1">Upload Local Image</label>
                      <label className={cn(
                        "flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-sm",
                        uploadingImage && "opacity-60 pointer-events-none"
                      )}>
                        {uploadingImage ? <Loader2 className="animate-spin text-brand-primary" size={14} /> : <Upload size={14} className="text-slate-500" />}
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
                      <label className="block text-[10px] font-bold font-mono uppercase text-slate-500 mb-1">Add Image via HTTPS URL</label>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          placeholder="https://i.ibb.co/... or https://..."
                          value={externalUrlInput}
                          onChange={(e) => { setExternalUrlInput(e.target.value); setUrlError(''); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddExternalUrl(); } }}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddExternalUrl}
                          className="px-3 py-1.5 bg-slate-800 text-white rounded-md text-xs font-medium hover:bg-slate-700 transition-colors shadow-sm shrink-0"
                        >
                          Add URL
                        </button>
                      </div>
                      {urlError && <p className="text-[10px] text-red-500 mt-1">{urlError}</p>}
                    </div>
                  </div>

                  {/* Images List Cards */}
                  {imagesList.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-lg p-5 text-center text-slate-400 bg-white">
                      <ImageIcon size={26} className="mx-auto mb-1 opacity-40" />
                      <p className="text-xs">No media added yet. Upload an image file or add an external URL above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {imagesList.map((img, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-lg border transition-all bg-white",
                            img.isCover ? "border-brand-primary ring-1 ring-brand-primary/20 bg-brand-primary/[0.02]" : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          {/* Thumbnail preview */}
                          <div className="w-14 h-12 rounded overflow-hidden bg-slate-900 flex-shrink-0 relative border border-slate-200 flex items-center justify-center">
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
                                "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase",
                                img.isCover ? "bg-brand-primary text-white shadow-xs" : "bg-slate-100 text-slate-600"
                              )}>
                                {img.isCover ? "COVER" : `PHOTO #${idx + 1}`}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {img.source === 'external' ? 'External URL' : 'Cloudinary Upload'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 truncate mt-0.5" title={img.url || img.publicId || (typeof img.imageId === 'string' ? img.imageId : img.imageId?.imageId)}>
                              {img.source === 'external' ? img.url : (img.publicId || 'Secure storage')}
                            </p>
                          </div>

                          {/* Reorder and management buttons */}
                          <div className="flex items-center gap-1">
                            {!img.isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(idx)}
                                className="px-2 py-1 text-[10px] font-medium text-slate-600 hover:text-brand-primary hover:bg-slate-100 rounded transition-colors"
                                title="Set as event cover poster"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, -1)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === imagesList.length - 1}
                              onClick={() => handleMoveImage(idx, 1)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Down"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
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

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-secondary transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
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
