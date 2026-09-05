import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, Loader2 } from 'lucide-react';
import getCroppedImg from '../../utils/cropImage';

/**
 * MemberPhotoEditor
 * 
 * Reusable modal for interactive profile photo cropping, positioning (drag),
 * and zoom before uploading.
 * 
 * Target aspect ratio matches the public Member Card frame: 4:5 (0.8).
 */
export default function MemberPhotoEditor({
  isOpen,
  imageSrc,
  fileName = 'profile.jpg',
  aspect = 4 / 5,
  onConfirm,
  onCancel,
  theme = 'auto', // 'auto' (respects dark mode) | 'light' (admin light only)
  title = 'Adjust Profile Photo',
  confirmText = 'Use This Photo'
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Reset state when opening or when imageSrc changes
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      setIsGenerating(false);
      setError('');
    }
  }, [isOpen, imageSrc]);

  // Handle escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isGenerating) {
        onCancel();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel, isGenerating]);

  const onCropCompleteHandler = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError('Please position the photo inside the crop frame.');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        'image/jpeg',
        0.92
      );

      const safeName = (fileName || 'profile.jpg').replace(/\.[^/.]+$/, '') + '.jpg';
      const croppedFile = new File([croppedBlob], safeName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      await onConfirm(croppedBlob, croppedFile);
    } catch (err) {
      console.error('Crop export failed:', err);
      setError(err.message || 'Failed to generate cropped image. Please try again.');
      setIsGenerating(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const isDarkEnabled = theme === 'auto';

  // Theme styling tokens
  const modalBg = isDarkEnabled
    ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
    : 'bg-white border border-slate-200';

  const headerBg = isDarkEnabled
    ? 'border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60'
    : 'border-b border-slate-100 bg-slate-50';

  const textPrimary = isDarkEnabled
    ? 'text-slate-900 dark:text-white'
    : 'text-slate-900';

  const textMuted = isDarkEnabled
    ? 'text-slate-500 dark:text-slate-400'
    : 'text-slate-500';

  const controlPanelBg = isDarkEnabled
    ? 'bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800'
    : 'bg-slate-50 border border-slate-200';

  const footerBg = isDarkEnabled
    ? 'border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60'
    : 'border-t border-slate-100 bg-slate-50';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-editor-title"
    >
      <div
        className={`${modalBg} rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-3.5 ${headerBg} shrink-0`}>
          <div>
            <h3 id="photo-editor-title" className={`text-base font-heading font-bold ${textPrimary}`}>
              {title}
            </h3>
            <p className={`text-xs font-mono ${textMuted} mt-0.5`}>
              Drag to position • Zoom to scale (4:5 Card Ratio)
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isGenerating}
            className={`p-1.5 rounded-md ${textMuted} hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Crop Canvas Container */}
        <div className="relative w-full h-64 sm:h-80 md:h-[360px] bg-slate-950 overflow-hidden select-none shrink-0">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteHandler}
            showGrid={true}
            zoomWithScroll={true}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                backgroundColor: '#020617',
              },
              cropAreaStyle: {
                border: '2px solid #6366f1',
                boxShadow: '0 0 0 9999em rgba(2, 6, 23, 0.75)',
              },
            }}
          />

          {/* Top-right hint overlay */}
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
            <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-white/90 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
              4:5 PORTRAIT
            </span>
          </div>
        </div>

        {/* Controls Section */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {/* Zoom Slider Bar */}
          <div className={`p-3 rounded-lg ${controlPanelBg} flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[10px] font-bold tracking-widest uppercase ${textMuted}`}>
                Zoom
              </span>
              <span className="font-mono text-xs font-bold text-brand-primary">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
                disabled={zoom <= 1 || isGenerating}
                className={`p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30`}
                aria-label="Zoom out"
              >
                <ZoomOut size={16} />
              </button>

              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                disabled={isGenerating}
                className="flex-1 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                aria-label="Zoom slider"
              />

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.1).toFixed(2)))}
                disabled={zoom >= 3 || isGenerating}
                className={`p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30`}
                aria-label="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          {/* Action Pills: Reset & Rotate */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isGenerating || (zoom === 1 && crop.x === 0 && crop.y === 0 && rotation === 0)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold tracking-wider uppercase border border-slate-200 dark:border-slate-800 ${textMuted} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40`}
            >
              <RotateCcw size={13} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleRotate}
              disabled={isGenerating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold tracking-wider uppercase border border-slate-200 dark:border-slate-800 ${textMuted} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40`}
            >
              <RotateCw size={13} />
              Rotate 90°
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3.5 ${footerBg} flex items-center justify-end gap-3 shrink-0`}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isGenerating}
            className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-lg border border-slate-200 dark:border-slate-700 ${textMuted} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 text-xs font-mono font-bold tracking-wider uppercase text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Check size={14} />
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
