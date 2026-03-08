'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PrimitiveColors } from '@/types/tokens';

export type OverlayType = 'typography' | 'color' | 'surface' | null;
export type SurfaceTab = 'radius' | 'elevation' | 'borders' | 'card';
export type FontTarget = 'heading' | 'body';

export interface ColorOverlayPayload {
  colorKey: keyof PrimitiveColors;
}

export interface TypographyOverlayPayload {
  target?: FontTarget;
}

export interface SurfaceOverlayPayload {
  tab?: SurfaceTab;
}

export type OverlayPayload = ColorOverlayPayload | TypographyOverlayPayload | SurfaceOverlayPayload;

export interface OverlayState {
  type: OverlayType;
  payload?: OverlayPayload;
}

interface OverlayContextValue {
  overlay: OverlayState;
  openOverlay: (type: Exclude<OverlayType, null>, payload?: OverlayPayload) => void;
  closeOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayState>({ type: null });

  const openOverlay = useCallback(
    (type: Exclude<OverlayType, null>, payload?: OverlayPayload) => {
      setOverlay({ type, payload });
    },
    []
  );

  const closeOverlay = useCallback(() => {
    setOverlay({ type: null });
  }, []);

  return (
    <OverlayContext.Provider value={{ overlay, openOverlay, closeOverlay }}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay must be used within OverlayProvider');
  return ctx;
}
