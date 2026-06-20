'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { BrandManifest, BrandAssets } from '@/types/brand';

/**
 * Static brand identity (manifest + assets) loaded server-side from the
 * `public/brand/` contract and handed to the client tree. Unlike TokenConfig
 * (which the playground can tweak), this is read-only — it never changes at
 * runtime, so it's a plain context with no reducer.
 */
interface BrandContextValue {
  manifest: BrandManifest;
  assets: BrandAssets;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({
  manifest,
  assets,
  children,
}: BrandContextValue & { children: ReactNode }) {
  return (
    <BrandContext.Provider value={{ manifest, assets }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
}
