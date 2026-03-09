'use client';

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useOverlay } from '@/context/OverlayContext';
import type { ColorOverlayPayload } from '@/context/OverlayContext';
import { TypographyOverlayPanel } from './panels/TypographyOverlayPanel';
import { ColorOverlayPanel } from './panels/ColorOverlayPanel';
import { SurfaceOverlayPanel } from './panels/SurfaceOverlayPanel';

const OVERLAY_LABELS: Record<string, string> = {
  typography: 'Typography',
  color: 'Color',
  surface: 'Surfaces',
};

export function OverlayPanel() {
  const { overlay, closeOverlay } = useOverlay();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOverlay();
    },
    [closeOverlay]
  );

  useEffect(() => {
    if (overlay.type) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [overlay.type, handleKeyDown]);

  if (!mounted || !overlay.type) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* Close bar */}
      <div
        className="flex items-center justify-between border-b px-8 py-4 shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span
          className="text-xs tracking-[0.2em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {OVERLAY_LABELS[overlay.type]}
        </span>
        <button
          type="button"
          onClick={closeOverlay}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span className="text-xs tracking-[0.15em] uppercase">Close</span>
          <X size={14} />
        </button>
      </div>

      {/* Panel content — typography manages its own scroll, others overflow */}
      <div className={`flex-1 ${overlay.type === 'typography' ? 'min-h-0' : 'overflow-auto'}`}>
        {overlay.type === 'typography' && <TypographyOverlayPanel />}
        {overlay.type === 'color' && overlay.payload && (
          <ColorOverlayPanel colorKey={(overlay.payload as ColorOverlayPayload).colorKey} />
        )}
        {overlay.type === 'surface' && <SurfaceOverlayPanel />}
      </div>
    </div>,
    document.body
  );
}
