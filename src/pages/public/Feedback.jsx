import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Footer from '../../components/layout/Footer';
import { usePageReveal } from '../../hooks/usePageReveal';
import ProtectedImage from '../../components/common/ProtectedImage';

export default function Feedback() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formState, setFormState] = useState('DEFAULT'); // DEFAULT, SENDING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    comment: ''
  });

  const containerRef = useRef(null);
  usePageReveal(containerRef);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/public/events/${slug}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Event not found');
        }
        
        setEvent(data.data.event);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage('Please select a star rating before submitting.');
      setFormState('ERROR');
      return;
    }

    setFormState('SENDING');
    setErrorMessage('');

    try {
      const res = await fetch('/api/public/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event._id,
          name: formData.name,
          rating,
          comment: formData.comment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');

      setFormState('SUCCESS');
    } catch (err) {
      setErrorMessage(err.message);
      setFormState('ERROR');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="w-6 h-6 border-2 border-[var(--ink)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--paper)] p-6 text-center font-body">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-heading font-black uppercase text-[var(--ink)] mb-2">Event Not Found</h2>
        <p className="text-[var(--ink-soft)] mb-8">We couldn't find the event you are looking for.</p>
        <Link to="/events" className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase border border-[var(--border)] px-6 py-3 hover:bg-[var(--paper-dim)] transition-colors">
          <ArrowLeft size={16} /> Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--paper)] flex flex-col font-body">
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="w-full max-w-xl relative z-10">
          <div className="text-center mb-8">
            <Link to="/events" className="inline-flex items-center gap-2 font-mono text-[10px] text-[var(--ink-soft)] uppercase tracking-widest hover:text-[var(--brand)] transition-colors mb-6">
              <ArrowLeft size={14} /> Back to Events
            </Link>
            <h1 className="text-3xl md:text-5xl font-heading font-black uppercase tracking-tight text-[var(--ink)] mb-3">Event Feedback</h1>
            <p className="text-[var(--ink-soft)] max-w-md mx-auto">We'd love to hear your thoughts on <strong>{event.title}</strong> to help us improve future events.</p>
          </div>

          <div className="bg-white border border-[var(--border)] p-6 md:p-10 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-20"></div>

            {formState === 'SUCCESS' ? (
              <div className="text-center py-12">
                <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-heading font-black uppercase text-[var(--ink)] mb-2">Thank You!</h2>
                <p className="text-[var(--ink-soft)] mb-8">Your feedback has been received. We appreciate your time.</p>
                <Link to="/events" className="font-mono text-[12px] font-bold tracking-widest uppercase bg-[var(--ink)] text-[var(--paper)] px-8 py-4 hover:bg-[var(--circuit)] transition-colors inline-block">
                  Explore More Events
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Rating Stars */}
                <div className="text-center">
                  <label className="block font-mono text-[10px] font-bold tracking-widest text-[var(--ink-soft)] uppercase mb-4">How would you rate this event?</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`p-2 transition-all duration-200 ${(hoverRating || rating) >= star ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
                      >
                        <Star size={40} className={(hoverRating || rating) >= star ? 'fill-current' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block font-mono text-[10px] font-bold tracking-widest text-[var(--ink-soft)] uppercase mb-2">Your Name (Optional)</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-[var(--border)] py-3 text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] transition-colors placeholder:text-slate-300"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="comment" className="block font-mono text-[10px] font-bold tracking-widest text-[var(--ink-soft)] uppercase mb-2">Additional Comments</label>
                    <textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      rows={4}
                      className="w-full bg-transparent border-b-2 border-[var(--border)] py-3 text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] transition-colors placeholder:text-slate-300 resize-none"
                      placeholder="What did you like? What could be better?"
                    ></textarea>
                  </div>
                </div>

                {formState === 'ERROR' && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 border border-red-100 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formState === 'SENDING'}
                  className={`w-full font-mono text-[12px] font-bold tracking-widest uppercase py-4 transition-colors flex items-center justify-center gap-2
                    ${formState === 'SENDING' 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--circuit)]'
                    }
                  `}
                >
                  {formState === 'SENDING' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
