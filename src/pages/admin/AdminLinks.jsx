import React, { useState, useEffect } from 'react';
import { 
  Loader2, Plus, Edit, Trash2, GripVertical, Copy, Check, 
  Link as LinkIcon, Instagram, Linkedin, Youtube, Twitter, 
  Github, Globe, Mail, MessageCircle, Facebook, Image as ImageIcon 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRESET_ICONS = {
  Globe: Globe,
  Instagram: Instagram,
  Linkedin: Linkedin,
  Youtube: Youtube,
  Twitter: Twitter,
  Github: Github,
  Facebook: Facebook,
  Mail: Mail,
  MessageCircle: MessageCircle, // Using MessageCircle for WhatsApp/Telegram generically
};

// Sortable Item Component
const SortableLinkItem = ({ link, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = PRESET_ICONS[link.presetIcon] || Globe;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-3 gap-3 group",
        isDragging && "opacity-50 ring-2 ring-brand-primary border-transparent z-10 relative shadow-md",
        !link.isActive && "opacity-75 bg-slate-50"
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <button 
          className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0 touch-none"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <GripVertical size={20} />
        </button>
        
        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0 border border-brand-primary/20 overflow-hidden">
          {link.iconType === 'custom' && link.customImageId ? (
            <img 
              src={`/api/images/${link.customImageId?.imageId || link.customImageId}?variant=member_card`} 
              alt={link.title}
              className="w-full h-full object-cover"
              crossOrigin="use-credentials"
            />
          ) : (
            <IconComponent size={20} className="text-brand-primary" />
          )}
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm truncate">{link.title}</span>
            {!link.isActive && (
              <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded shrink-0">Inactive</span>
            )}
          </div>
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 truncate hover:text-brand-primary transition-colors flex items-center gap-1 mt-0.5">
            <span className="truncate">{link.url}</span>
          </a>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
        <div className="text-[11px] font-mono font-bold text-slate-500 px-2.5 py-1 bg-slate-100 rounded-md">
          {link.clickCount} CLICKS
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onEdit(link)}
            className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors" 
            title="Edit Link"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(link._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
            title="Delete Link"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [copied, setCopied] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    iconType: 'preset',
    presetIcon: 'Globe',
    isActive: true,
  });
  const [customIconFile, setCustomIconFile] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/links');
      if (!res.ok) throw new Error('Failed to fetch links');
      const json = await res.json();
      setLinks(json.data.links);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = links.findIndex((item) => item._id === active.id);
      const newIndex = links.findIndex((item) => item._id === over.id);
      
      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks); // Optimistic update
      
      try {
        const linkIds = newLinks.map(l => l._id);
        const res = await fetch('/api/admin/links/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkIds })
        });
        if (!res.ok) throw new Error('Failed to save order');
      } catch (err) {
        alert("Failed to save new order. Refreshing.");
        fetchLinks(); // Rollback
      }
    }
  };

  const openModal = (link = null) => {
    if (link) {
      setEditingId(link._id);
      setFormData({
        title: link.title,
        url: link.url,
        iconType: link.iconType,
        presetIcon: link.presetIcon,
        isActive: link.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        url: '',
        iconType: 'preset',
        presetIcon: 'Globe',
        isActive: true,
      });
    }
    setCustomIconFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('url', formData.url);
      submitData.append('iconType', formData.iconType);
      submitData.append('presetIcon', formData.presetIcon);
      submitData.append('isActive', formData.isActive);
      
      if (formData.iconType === 'custom' && customIconFile) {
        submitData.append('customIcon', customIconFile);
      }
      
      const endpoint = editingId ? `/api/admin/links/${editingId}` : '/api/admin/links';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        body: submitData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save link');
      
      await fetchLinks();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    try {
      const res = await fetch(`/api/admin/links/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setLinks(links.filter(l => l._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const copyPublicUrl = () => {
    const url = `${window.location.origin}/connect`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview logic
  const PreviewIcon = PRESET_ICONS[formData.presetIcon] || Globe;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">Links Hub</h2>
          <p className="text-sm font-mono text-slate-500">Manage your public /connect page.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={copyPublicUrl}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-brand-secondary transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Link
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading links...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500 bg-white rounded-lg border border-red-100">
            Error: {error}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg border border-slate-200 flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-4">
              <LinkIcon size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add your first platform link</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md">Create a Linktree-style page to share all your important Brainstorm Club platforms in one place.</p>
            <button 
              onClick={() => openModal()}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-secondary transition-colors"
            >
              Add Link
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={links.map(l => l._id)} strategy={verticalListSortingStrategy}>
                {links.map(link => (
                  <SortableLinkItem 
                    key={link._id} 
                    link={link} 
                    onEdit={openModal} 
                    onDelete={handleDelete} 
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* Form Section */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Link' : 'Add New Link'}</h3>
              </div>
              
              <form id="linkForm" onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-2">Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Follow us on Instagram"
                    required
                    maxLength={50}
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-2">Destination URL</label>
                  <input 
                    type="url" 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://instagram.com/..."
                    required
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-2">Icon Type</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="iconType" 
                        className="peer sr-only" 
                        checked={formData.iconType === 'preset'}
                        onChange={() => setFormData({...formData, iconType: 'preset'})}
                      />
                      <div className="p-3 text-center border border-slate-200 rounded-lg peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 peer-checked:text-brand-primary text-sm font-medium text-slate-600 transition-all">
                        Preset Icon
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="iconType" 
                        className="peer sr-only" 
                        checked={formData.iconType === 'custom'}
                        onChange={() => setFormData({...formData, iconType: 'custom'})}
                      />
                      <div className="p-3 text-center border border-slate-200 rounded-lg peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 peer-checked:text-brand-primary text-sm font-medium text-slate-600 transition-all">
                        Custom Upload
                      </div>
                    </label>
                  </div>
                </div>

                {formData.iconType === 'preset' ? (
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-2">Select Icon</label>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.keys(PRESET_ICONS).map(iconName => {
                        const Icon = PRESET_ICONS[iconName];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData({...formData, presetIcon: iconName})}
                            className={cn(
                              "p-3 flex items-center justify-center rounded-lg border transition-all",
                              formData.presetIcon === iconName 
                                ? "border-brand-primary bg-brand-primary/10 text-brand-primary" 
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            )}
                            title={iconName}
                          >
                            <Icon size={24} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-2">Custom Logo/Image (Max 2MB)</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setCustomIconFile(e.target.files[0])}
                          className="hidden"
                          id="custom-icon-upload"
                          required={!editingId}
                        />
                        <label 
                          htmlFor="custom-icon-upload"
                          className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer bg-slate-50"
                        >
                          <ImageIcon size={20} />
                          <span className="text-sm font-medium">{customIconFile ? customIconFile.name : 'Choose an image...'}</span>
                        </label>
                      </div>
                    </div>
                    {editingId && !customIconFile && (
                      <p className="text-xs text-slate-400 mt-2">Leave empty to keep existing custom image.</p>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <input 
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">Active Link</span>
                      <span className="text-xs text-slate-500">Visible on the public /connect page</span>
                    </div>
                  </label>
                </div>
              </form>
            </div>
            
            {/* Live Preview Section */}
            <div className="md:w-[320px] bg-slate-50 p-6 md:p-8 flex flex-col border-t md:border-t-0 md:border-l border-slate-100 shrink-0">
              <label className="block text-xs font-bold font-mono tracking-widest uppercase text-slate-500 mb-6 text-center">Live Preview</label>
              
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] border-[6px] border-slate-200 shadow-inner p-4 relative overflow-hidden h-[500px]">
                {/* Mock phone notch */}
                <div className="absolute top-0 w-32 h-6 bg-slate-200 rounded-b-xl left-1/2 -translate-x-1/2"></div>
                
                <div className="w-full flex flex-col items-center mt-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center text-slate-300">
                    <Globe size={24} />
                  </div>
                  <div className="w-24 h-4 bg-slate-200 rounded-full mb-8"></div>
                  
                  {/* The actual button preview */}
                  <div className={cn(
                    "w-full flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm relative overflow-hidden transition-all duration-300",
                    !formData.isActive && "opacity-50 grayscale"
                  )}>
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      {formData.iconType === 'custom' && customIconFile ? (
                        <img src={URL.createObjectURL(customIconFile)} alt="Preview" className="w-full h-full object-cover rounded-full" />
                      ) : formData.iconType === 'preset' ? (
                        <PreviewIcon size={20} className="text-slate-700" />
                      ) : (
                        <ImageIcon size={20} className="text-slate-400" />
                      )}
                    </div>
                    <span className="flex-1 text-center font-medium text-sm text-slate-800 pr-12 truncate">
                      {formData.title || 'Link Title'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="linkForm"
                  disabled={saving}
                  className="px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-secondary transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  Save Link
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
