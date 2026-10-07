import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Check, X, Crop, Move, Image as ImageIcon, Sparkles 
} from 'lucide-react';
import './ImageCropperModal.css';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio?: number; // 1 for 1:1, 16/5 for banners, etc.
  title?: string;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
  onCancel: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  aspectRatio = 1, // Default square 1:1
  title = 'Crop & Align Image',
  onCropComplete,
  onCancel
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load Image
  useEffect(() => {
    if (!imageSrc || !isOpen) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc, isOpen]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    const exportCanvas = document.createElement('canvas');
    // High-resolution output (e.g. 1080x1080 for 1:1, or 1600x500 for banners)
    const exportWidth = aspectRatio === 1 ? 800 : 1200;
    const exportHeight = Math.round(exportWidth / aspectRatio);

    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#070d1e';
    ctx.fillRect(0, 0, exportWidth, exportHeight);

    // Calculate scaling
    const scale = (Math.max(exportWidth / img.width, exportHeight / img.height)) * zoom;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    // Center offset with user pan adjustments
    const panFactor = exportWidth / 320; // scale pan relative to preview size
    const drawX = (exportWidth - drawWidth) / 2 + (offset.x * panFactor);
    const drawY = (exportHeight - drawHeight) / 2 + (offset.y * panFactor);

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    const dataUrl = exportCanvas.toDataURL('image/webp', 0.92);
    exportCanvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob, dataUrl);
      }
    }, 'image/webp', 0.92);
  }, [aspectRatio, offset, zoom, onCropComplete]);

  if (!isOpen) return null;

  return (
    <div className="crop-modal-overlay" role="dialog" aria-modal="true">
      <div className="crop-modal-container">
        {/* Header */}
        <div className="crop-modal-header">
          <div className="crop-title-row">
            <Crop size={18} className="crop-header-icon" />
            <h3>{title}</h3>
            <span className="aspect-badge">
              {aspectRatio === 1 ? '1:1 Square Card' : 'Panoramic Banner'}
            </span>
          </div>
          <button 
            type="button" 
            className="crop-close-btn" 
            onClick={onCancel}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport / Crop Box */}
        <div className="crop-viewport-area">
          <div 
            ref={containerRef}
            className={`crop-mask-box ${aspectRatio === 1 ? 'ratio-square' : 'ratio-banner'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Crop preview"
                className="crop-target-image"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                draggable={false}
              />
            )}
            <div className="crop-grid-overlay" pointer-events="none">
              <div className="crop-grid-line h1"></div>
              <div className="crop-grid-line h2"></div>
              <div className="crop-grid-line v1"></div>
              <div className="crop-grid-line v2"></div>
            </div>
          </div>
          <p className="crop-drag-hint">
            <Move size={13} /> Drag image to adjust center • Use slider below to zoom
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="crop-controls-toolbar">
          <div className="zoom-control-group">
            <button
              type="button"
              className="zoom-btn"
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="zoom-slider"
            />
            <button
              type="button"
              className="zoom-btn"
              onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <span className="zoom-level-text">{Math.round(zoom * 100)}%</span>
          </div>

          <button
            type="button"
            className="btn-crop-reset"
            onClick={handleReset}
            title="Reset position & zoom"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        {/* Actions Footer */}
        <div className="crop-modal-footer">
          <button
            type="button"
            className="btn-crop-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-crop-confirm"
            onClick={handleConfirm}
          >
            <Check size={16} />
            <span>Confirm & Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
