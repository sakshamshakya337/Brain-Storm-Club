import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';

/**
 * ProtectedImage — renders an image served through the /api/images/:imageId endpoint.
 *
 * The endpoint generates a short-lived signed Cloudinary URL and redirects (302) to it.
 * We fetch it ourselves so we can correctly distinguish loading / loaded / error states
 * WITHOUT the crossOrigin="use-credentials" attribute which breaks the cross-domain redirect.
 *
 * Security features preserved:
 *  - Right-click / context-menu disabled
 *  - Dragging disabled
 *  - select-none / pointer-events-none on the rendered img
 *  - No Cloudinary URL or API Secret exposed to callers
 *  - Revocable object URL is used (cleaned up on unmount)
 */
export default function ProtectedImage({
  imageId,
  src = null,
  variant = 'event_card',
  alt = '',
  className = '',
  style = {},
  fallback = null,
}) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const [objectUrl, setObjectUrl] = useState(null);
  const abortRef = useRef(null);
  const timeoutRef = useRef(null);

  // External URL handling
  useEffect(() => {
    if (!src) return;
    setStatus('loading');
    const img = new window.Image();
    img.src = src;
    img.onload = () => setStatus('loaded');
    img.onerror = () => setStatus('error');
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Protected imageId handling
  useEffect(() => {
    if (src) return; // If direct src is provided, skip fetch

    // No imageId → show fallback immediately
    if (!imageId) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    setObjectUrl(null);

    const controller = new AbortController();
    abortRef.current = controller;

    // 15-second safety timeout
    timeoutRef.current = setTimeout(() => {
      controller.abort();
    }, 15000);

    fetch(`/api/images/${imageId}?variant=${variant}`, {
      signal: controller.signal,
      credentials: 'same-origin',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (controller.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
        setStatus('loaded');
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          // Aborted by our timeout or unmount
          setStatus('error');
          return;
        }
        setStatus('error');
      })
      .finally(() => {
        clearTimeout(timeoutRef.current);
      });

    return () => {
      controller.abort();
      clearTimeout(timeoutRef.current);
    };
  }, [imageId, variant, src]);

  // Cleanup object URL on unmount or when it changes
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const preventInteraction = (e) => e.preventDefault();

  const displayUrl = src || objectUrl;

  // — Fallback / error —
  if (status === 'error' || (!displayUrl && status !== 'loading')) {
    if (fallback) return fallback;
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 ${className}`}
        style={style}
        aria-label="Image unavailable"
      >
        <User size={28} strokeWidth={1.5} className="opacity-40" />
      </div>
    );
  }

  // — Loading skeleton —
  if (status === 'loading') {
    return (
      <div
        className={`bg-slate-100 dark:bg-slate-900 animate-pulse w-full min-h-[200px] ${className}`}
        style={style}
        aria-label="Loading image…"
      />
    );
  }

  // — Loaded —
  return (
    <img
      src={displayUrl}
      alt={alt}
      draggable="false"
      onContextMenu={preventInteraction}
      onDragStart={preventInteraction}
      className={`select-none pointer-events-none ${className}`}
      style={{ WebkitUserSelect: 'none', msUserSelect: 'none', userSelect: 'none', ...style }}
    />
  );
}
