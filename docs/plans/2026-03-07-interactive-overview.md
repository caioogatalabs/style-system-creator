# Interactive Overview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the static EditorPanel + static preview with a fully interactive overview where clicking any element (typography, color, surface) opens an inline overlay to configure it in real-time.

**Architecture:** Global `OverlayContext` at root controls a single full-width `OverlayPanel` portal. Three overlay types: `typography` (Google Fonts-style 70/30 panel), `color` (HEX input + live scale 50–950), `surface` (tabbed: Radius/Elevation/Borders/Card). Semantic tokens are derived from primitive colors and applied automatically in dark-mode.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, OKLCH colors, Google Fonts / Fontshare

---

## Naming conventions & CSS var alignment

Current inconsistency:
- `globals.css` seeds: `--color-border-var`, `--color-primary-var`, `--color-primary-hover-var`, `--color-primary-fg-var`
- `token-applier.ts` writes: `--color-border`, `--color-primary`, `--color-primary-hover`, `--color-primary-fg`
- Preview components consume: `--color-border-var`, `--color-fg`, `--color-fg-muted`, `--color-primary`, etc.

Resolution: `token-applier` must write BOTH names (old and new) during this transition, or we update all consumers. Plan chooses to **update token-applier to write the `--color-border-var` name** that components already use, plus also set the dark-mode semantic tokens correctly.

---

## Task 1: Remove EditorPanel + full-width layout

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/layout/AppShell.tsx`
- Delete: `components/editor/` (entire directory)

**Step 1: Update page.tsx — remove EditorPanel**

```tsx
// app/page.tsx
import { OverviewPreview } from '@/components/preview/OverviewPreview';

export default function OverviewPage() {
  return <OverviewPreview />;
}
```

**Step 2: Update AppShell — remove max-width, full viewport**

```tsx
// components/layout/AppShell.tsx
import { TopBar } from './TopBar';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <TopBar />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
```

**Step 3: Delete editor directory**

```bash
rm -rf components/editor
```

**Step 4: Verify dev server starts without errors**

```bash
npm run dev
```

Expected: no import errors, page renders with TypographyPreview + ColorSwatchPreview + ComponentsPreview

**Step 5: Commit**

```bash
git add app/page.tsx components/layout/AppShell.tsx
git rm -r components/editor/
git commit -m "feat: remove EditorPanel, full-width layout"
```

---

## Task 2: Fix semantic token mapping (dark mode)

**Files:**
- Modify: `lib/token-applier.ts`
- Modify: `lib/color-utils.ts` (verify `hexToOklch` is exported — it is)

**Context:** The app is dark-mode only. Currently `applyTokensToDOM` applies light-mode semantics (neutral-50 as bg), which is wrong. Also, `--color-border-var` is used in components but token-applier writes `--color-border`. We fix both here.

**Semantic mapping (dark mode, our responsibility):**
- `--color-bg` → neutral hue, L=0.08, very low chroma (tinted dark)
- `--color-bg-subtle` → neutral hue, L=0.12
- `--color-fg` → secondary hue, L=0.95, very low chroma (readable light tint)
- `--color-fg-muted` → secondary hue, L=0.55, low chroma
- `--color-border-var` → neutral hue, L=0.20, low chroma
- `--color-border-strong` → neutral hue, L=0.30
- `--color-primary` → primary seed hex (used in CTAs/buttons)
- `--color-primary-var` → same as --color-primary (alias for old components)
- `--color-primary-hover` → primary scale step 600 oklch
- `--color-primary-fg` → near-white oklch(0.97 0.01 primary_hue)

**Step 1: Update applyTokensToDOM in token-applier.ts**

Replace the semantic surface colors block with:

```ts
// lib/token-applier.ts — update applyTokensToDOM
// Add import at top:
import { hexToOklch } from './color-utils';

// Inside applyTokensToDOM, replace the "Semantic surface colors" block:

// ── Dark-mode semantic tokens ─────────────────────────────────────────────
const { h: neutralH, c: neutralC } = hexToOklch(config.colors.neutral);
const { h: secondaryH, c: secondaryC } = hexToOklch(config.colors.secondary);
const { h: primaryH } = hexToOklch(config.colors.primary);

const bgChroma = Math.min(neutralC * 0.3, 0.008);
const fgChroma = Math.min(secondaryC * 0.08, 0.012);
const fgMutedChroma = Math.min(secondaryC * 0.10, 0.015);
const borderChroma = Math.min(neutralC * 0.4, 0.010);

// Backgrounds (neutral-tinted dark)
setVar('--color-bg',        `oklch(0.08 ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`);
setVar('--color-bg-subtle', `oklch(0.12 ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`);

// Foregrounds (secondary-tinted light)
setVar('--color-fg',        `oklch(0.95 ${fgChroma.toFixed(4)} ${secondaryH.toFixed(1)})`);
setVar('--color-fg-muted',  `oklch(0.55 ${fgMutedChroma.toFixed(4)} ${secondaryH.toFixed(1)})`);

// Borders (neutral-tinted)
setVar('--color-border-var',    `oklch(0.20 ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`);
setVar('--color-border',        `oklch(0.20 ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`);
setVar('--color-border-strong', `oklch(0.30 ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`);

// Primary (seed hex as CTA, scale for hover)
setVar('--color-primary',       config.colors.primary);
setVar('--color-primary-var',   config.colors.primary);
setVar('--color-primary-hover', p[6].oklch);   // scale 600
setVar('--color-primary-active',p[7].oklch);   // scale 700
setVar('--color-primary-fg',    `oklch(0.97 0.01 ${primaryH.toFixed(1)})`);

// Secondary
setVar('--color-secondary',       s[5].oklch);
setVar('--color-secondary-hover', s[6].oklch);
setVar('--color-secondary-fg',    `oklch(0.97 0.01 ${secondaryH.toFixed(1)})`);

// Accent
setVar('--color-accent',       a[5].oklch);
setVar('--color-accent-hover', a[6].oklch);
setVar('--color-accent-fg',    n[0].oklch);

// State colors
setVar('--color-error',       semanticColors.error);
setVar('--color-error-bg',    `oklch(from ${semanticColors.error} l c h / 0.1)`);
setVar('--color-error-fg',    semanticColors.error);
setVar('--color-warning',     semanticColors.warning);
setVar('--color-warning-bg',  `oklch(from ${semanticColors.warning} l c h / 0.1)`);
setVar('--color-success',     semanticColors.success);
setVar('--color-success-bg',  `oklch(from ${semanticColors.success} l c h / 0.1)`);
setVar('--color-info',        semanticColors.info);
```

**Step 2: Remove applyDarkModeTokens** — it's no longer needed since applyTokensToDOM now handles dark mode.

**Step 3: Verify colors apply correctly on page**

Change primary color in DEFAULT_TOKEN_CONFIG to something distinct (e.g. `#e85d04` orange) temporarily, reload, verify buttons/CTAs turn orange, then revert.

**Step 4: Commit**

```bash
git add lib/token-applier.ts
git commit -m "fix: dark-mode semantic token mapping, align CSS var names"
```

---

## Task 3: Create OverlayContext

**Files:**
- Create: `context/OverlayContext.tsx`

**Step 1: Write OverlayContext**

```tsx
// context/OverlayContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PrimitiveColors } from '@/types/tokens';

export type OverlayType = 'typography' | 'color' | 'surface' | null;

export interface ColorOverlayPayload {
  colorKey: keyof PrimitiveColors;
}

export interface OverlayState {
  type: OverlayType;
  payload?: ColorOverlayPayload;
}

interface OverlayContextValue {
  overlay: OverlayState;
  openOverlay: (type: Exclude<OverlayType, null>, payload?: ColorOverlayPayload) => void;
  closeOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayState>({ type: null });

  const openOverlay = useCallback(
    (type: Exclude<OverlayType, null>, payload?: ColorOverlayPayload) => {
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
```

**Step 2: Add OverlayProvider to layout.tsx**

```tsx
// app/layout.tsx — wrap with OverlayProvider inside TokenConfigProvider
import { OverlayProvider } from '@/context/OverlayContext';

// In RootLayout, inside TokenConfigProvider:
<TokenConfigProvider>
  <OverlayProvider>
    <TokenApplierBridge />
    <AppShell>
      {children}
    </AppShell>
  </OverlayProvider>
</TokenConfigProvider>
```

**Step 3: Commit**

```bash
git add context/OverlayContext.tsx app/layout.tsx
git commit -m "feat: add OverlayContext for managing interactive overlay panels"
```

---

## Task 4: Create OverlayPanel shell (portal)

**Files:**
- Create: `components/overlay/OverlayPanel.tsx`

**Step 1: Write OverlayPanel**

```tsx
// components/overlay/OverlayPanel.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useOverlay } from '@/context/OverlayContext';
import { TypographyOverlayPanel } from './panels/TypographyOverlayPanel';
import { ColorOverlayPanel } from './panels/ColorOverlayPanel';
import { SurfaceOverlayPanel } from './panels/SurfaceOverlayPanel';

export function OverlayPanel() {
  const { overlay, closeOverlay } = useOverlay();

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
      document.body.style.overflow = '';
    };
  }, [overlay.type, handleKeyDown]);

  if (!overlay.type || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'oklch(0.06 0 0)' }}>
      {/* Close bar */}
      <div
        className="flex items-center justify-between border-b px-8 py-4 shrink-0"
        style={{ borderColor: 'var(--color-border-var)' }}
      >
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
          {overlay.type === 'typography' && 'Typography'}
          {overlay.type === 'color' && 'Color'}
          {overlay.type === 'surface' && 'Surfaces'}
        </span>
        <button
          type="button"
          onClick={closeOverlay}
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-fg-muted)' }}
        >
          <span className="text-xs tracking-[0.15em] uppercase">Close</span>
          <X size={14} />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-auto">
        {overlay.type === 'typography' && <TypographyOverlayPanel />}
        {overlay.type === 'color' && overlay.payload && (
          <ColorOverlayPanel colorKey={overlay.payload.colorKey} />
        )}
        {overlay.type === 'surface' && <SurfaceOverlayPanel />}
      </div>
    </div>,
    document.body
  );
}
```

**Step 2: Add OverlayPanel to layout.tsx** (inside OverlayProvider, after AppShell)

```tsx
import { OverlayPanel } from '@/components/overlay/OverlayPanel';

// In JSX:
<OverlayProvider>
  <TokenApplierBridge />
  <AppShell>{children}</AppShell>
  <OverlayPanel />
</OverlayProvider>
```

**Step 3: Commit**

```bash
git add components/overlay/OverlayPanel.tsx app/layout.tsx
git commit -m "feat: add OverlayPanel portal shell with ESC close"
```

---

## Task 5: Typography Overlay Panel

**Files:**
- Create: `components/overlay/panels/TypographyOverlayPanel.tsx`

**Design:** Full-height panel. Left 70%: large font specimen (font name in that font, alphabet, sentence). Right 30%: font list (heading / body tabs), size slider, ratio selector, weight selector. Clicking a font in the list applies it and updates the specimen live. Font list uses `preloadAllFonts` on mount.

**Step 1: Write TypographyOverlayPanel**

```tsx
// components/overlay/panels/TypographyOverlayPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { preloadAllFonts } from '@/lib/font-loader';

const FONT_CATEGORIES = {
  'Sans Serif': ['Inter', 'DM Sans', 'Plus Jakarta Sans', 'Outfit', 'Nunito', 'Lato', 'Roboto',
    'IBM Plex Sans', 'Manrope', 'Space Grotesk', 'Syne', 'Epilogue', 'Raleway', 'Josefin Sans',
    'Satoshi', 'General Sans', 'Switzer', 'Cabinet Grotesk', 'Supreme', 'Clash Display'],
  'Serif': ['Source Serif 4', 'Playfair Display', 'DM Serif Display', 'Cormorant', 'Fraunces',
    'Libre Baskerville', 'Merriweather', 'Crimson Text'],
  'Display': ['Bebas Neue'],
};

const ALL_FONTS = Object.values(FONT_CATEGORIES).flat();

type FontTarget = 'heading' | 'body';

const SCALE_RATIOS = [
  { label: 'Minor Second', value: 1.067 },
  { label: 'Major Second', value: 1.125 },
  { label: 'Minor Third', value: 1.200 },
  { label: 'Major Third', value: 1.250 },
  { label: 'Perfect Fourth', value: 1.333 },
  { label: 'Golden Ratio', value: 1.618 },
];

export function TypographyOverlayPanel() {
  const { config, dispatch } = useTokenConfigContext();
  const [activeTarget, setActiveTarget] = useState<FontTarget>('heading');
  const [search, setSearch] = useState('');

  useEffect(() => {
    preloadAllFonts();
  }, []);

  const activeFont =
    activeTarget === 'heading'
      ? config.typography.headingFamily
      : config.typography.bodyFamily;

  const filteredFonts = ALL_FONTS.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  function selectFont(family: string) {
    if (activeTarget === 'heading') {
      dispatch({ type: 'SET_TYPOGRAPHY', patch: { headingFamily: family } });
    } else {
      dispatch({ type: 'SET_TYPOGRAPHY', patch: { bodyFamily: family } });
    }
  }

  return (
    <div className="flex h-full">
      {/* ── Left: specimen (70%) ── */}
      <div
        className="flex flex-col justify-end p-16 border-r"
        style={{ flex: '7', borderColor: 'var(--color-border-var)' }}
      >
        {/* Target toggle */}
        <div className="mb-8 flex gap-1">
          {(['heading', 'body'] as FontTarget[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTarget(t)}
              className="px-4 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors"
              style={{
                backgroundColor: activeTarget === t ? 'var(--color-primary)' : 'transparent',
                color: activeTarget === t ? 'var(--color-primary-fg)' : 'var(--color-fg-muted)',
                borderRadius: 'var(--radius-token-sm)',
              }}
            >
              {t === 'heading' ? 'Heading' : 'Body'}
            </button>
          ))}
        </div>

        {/* Large specimen */}
        <div className="mb-6">
          <p
            className="leading-none select-none"
            style={{
              fontFamily: `"${activeFont}", sans-serif`,
              fontWeight: activeTarget === 'heading' ? config.typography.headingWeight : config.typography.bodyWeight,
              fontSize: 'clamp(64px, 10vw, 160px)',
              color: 'var(--color-fg)',
              letterSpacing: '-0.02em',
            }}
          >
            {activeFont}
          </p>
        </div>

        {/* Alphabet */}
        <p
          className="mb-4 text-2xl tracking-widest select-none"
          style={{
            fontFamily: `"${activeFont}", sans-serif`,
            color: 'var(--color-fg-muted)',
          }}
        >
          Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm
        </p>

        {/* Sentence */}
        <p
          className="text-lg leading-relaxed max-w-prose"
          style={{
            fontFamily: `"${activeFont}", sans-serif`,
            color: 'var(--color-fg-muted)',
          }}
        >
          The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
        </p>
      </div>

      {/* ── Right: controls (30%) ── */}
      <div className="flex flex-col overflow-auto p-8" style={{ flex: '3', minWidth: 0 }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search fonts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full border px-4 py-2.5 text-sm outline-none"
          style={{
            backgroundColor: 'oklch(0.10 0 0)',
            borderColor: 'var(--color-border-var)',
            color: 'var(--color-fg)',
            borderRadius: 'var(--radius-token-sm)',
            fontFamily: 'var(--font-body)',
          }}
        />

        {/* Font list */}
        <div className="flex-1 overflow-auto mb-8">
          {filteredFonts.map((family) => (
            <button
              key={family}
              type="button"
              onClick={() => selectFont(family)}
              className="flex w-full items-center justify-between border-b py-3 text-left transition-opacity hover:opacity-100"
              style={{
                borderColor: 'var(--color-border-var)',
                opacity: family === activeFont ? 1 : 0.5,
              }}
            >
              <span
                style={{
                  fontFamily: `"${family}", sans-serif`,
                  fontSize: '1.125rem',
                  color: 'var(--color-fg)',
                }}
              >
                {family}
              </span>
              {family === activeFont && (
                <span
                  className="text-[9px] tracking-[0.15em] uppercase"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Active
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scale Ratio */}
        <div className="mb-6">
          <p className="mb-3 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
            Scale Ratio
          </p>
          <div className="flex flex-col gap-1">
            {SCALE_RATIOS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => dispatch({ type: 'SET_TYPOGRAPHY', patch: { scaleRatio: r.value } })}
                className="flex items-center justify-between px-3 py-2 text-left transition-colors"
                style={{
                  backgroundColor:
                    config.typography.scaleRatio === r.value ? 'var(--color-bg-subtle)' : 'transparent',
                  borderRadius: 'var(--radius-token-sm)',
                }}
              >
                <span className="text-sm" style={{ color: 'var(--color-fg)' }}>
                  {r.label}
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                  {r.value}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Base size */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
              Base Size
            </p>
            <span className="font-mono text-xs" style={{ color: 'var(--color-fg)' }}>
              {config.typography.baseSize}px
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={24}
            step={1}
            value={config.typography.baseSize}
            onChange={(e) =>
              dispatch({ type: 'SET_TYPOGRAPHY', patch: { baseSize: Number(e.target.value) } })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/overlay/panels/TypographyOverlayPanel.tsx
git commit -m "feat: add TypographyOverlayPanel with font list, scale ratio, base size"
```

---

## Task 6: Color Overlay Panel

**Files:**
- Create: `components/overlay/panels/ColorOverlayPanel.tsx`

**Design:** Left side: large color block showing the seed color + HEX input + native color picker. Right side: full scale 50–950 rendered as columns in real-time. Updates config on change.

**Step 1: Write ColorOverlayPanel**

```tsx
// components/overlay/panels/ColorOverlayPanel.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { generateColorScale } from '@/lib/token-engine';
import type { PrimitiveColors } from '@/types/tokens';

const COLOR_LABELS: Record<keyof PrimitiveColors, { label: string; description: string }> = {
  primary: { label: 'Primary', description: 'CTAs, buttons, interactive elements' },
  secondary: { label: 'Secondary', description: 'Text, typography, readable content' },
  accent: { label: 'Accent', description: 'Highlights, badges, decorative elements' },
  neutral: { label: 'Neutral', description: 'Backgrounds, borders, surfaces' },
};

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? 'oklch(0.10 0 0)' : 'oklch(0.96 0 0)';
}

interface ColorOverlayPanelProps {
  colorKey: keyof PrimitiveColors;
}

export function ColorOverlayPanel({ colorKey }: ColorOverlayPanelProps) {
  const { config, dispatch } = useTokenConfigContext();
  const [hex, setHex] = useState(config.colors[colorKey]);
  const [inputValue, setInputValue] = useState(config.colors[colorKey].toUpperCase());
  const [error, setError] = useState(false);

  const scale = useMemo(() => {
    try {
      return generateColorScale(hex);
    } catch {
      return null;
    }
  }, [hex]);

  // Sync input when colorKey changes
  useEffect(() => {
    setHex(config.colors[colorKey]);
    setInputValue(config.colors[colorKey].toUpperCase());
    setError(false);
  }, [colorKey, config.colors]);

  function applyHex(value: string) {
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      setHex(normalized);
      setInputValue(normalized.toUpperCase());
      setError(false);
      dispatch({ type: 'SET_COLOR', key: colorKey, value: normalized });
    } else {
      setError(true);
    }
  }

  const meta = COLOR_LABELS[colorKey];

  return (
    <div className="flex h-full">
      {/* ── Left: color preview + input ── */}
      <div
        className="flex flex-col justify-end p-16 border-r"
        style={{
          flex: '4',
          backgroundColor: hex,
          borderColor: 'var(--color-border-var)',
        }}
      >
        <div className="mb-4">
          <p
            className="text-[10px] tracking-[0.2em] uppercase mb-2"
            style={{ color: getContrastColor(hex), opacity: 0.6 }}
          >
            {meta.label}
          </p>
          <p
            className="text-5xl font-light leading-none mb-3"
            style={{
              color: getContrastColor(hex),
              fontFamily: 'var(--font-heading)',
            }}
          >
            {hex.toUpperCase()}
          </p>
          <p
            className="text-sm"
            style={{ color: getContrastColor(hex), opacity: 0.7 }}
          >
            {meta.description}
          </p>
        </div>

        {/* HEX input */}
        <div className="flex items-center gap-3">
          {/* Native color picker */}
          <div className="relative h-10 w-10 overflow-hidden rounded-sm border" style={{ borderColor: 'oklch(1 0 0 / 0.2)' }}>
            <input
              type="color"
              value={hex}
              onChange={(e) => applyHex(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <div className="h-full w-full" style={{ backgroundColor: hex }} />
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => applyHex(inputValue)}
            onKeyDown={(e) => e.key === 'Enter' && applyHex(inputValue)}
            maxLength={7}
            className="flex-1 border px-4 py-2.5 font-mono text-sm outline-none"
            style={{
              backgroundColor: 'oklch(0 0 0 / 0.3)',
              borderColor: error ? 'var(--color-error)' : 'oklch(1 0 0 / 0.2)',
              color: getContrastColor(hex),
              borderRadius: 'var(--radius-token-sm)',
            }}
          />
        </div>
        {error && (
          <p className="mt-2 text-xs" style={{ color: 'var(--color-error)' }}>
            Invalid hex color
          </p>
        )}
      </div>

      {/* ── Right: live scale 50–950 ── */}
      <div className="flex flex-col p-8 overflow-auto" style={{ flex: '6' }}>
        <p className="mb-6 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
          Generated Scale
        </p>

        {scale ? (
          <div className="flex gap-1 flex-1">
            {scale.map((step) => {
              const textColor = getContrastColor(step.hex);
              return (
                <div
                  key={step.step}
                  className="flex flex-col justify-end rounded-sm p-3 transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: step.hex,
                    flex: 1,
                    minHeight: '320px',
                  }}
                >
                  <p className="font-mono text-[9px] mb-0.5" style={{ color: textColor, opacity: 0.7 }}>
                    {step.step}
                  </p>
                  <p className="font-mono text-[9px]" style={{ color: textColor, opacity: 0.9 }}>
                    {step.hex.toUpperCase()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              Enter a valid hex color
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/overlay/panels/ColorOverlayPanel.tsx
git commit -m "feat: add ColorOverlayPanel with live scale preview"
```

---

## Task 7: Surface Overlay Panel

**Files:**
- Create: `components/overlay/panels/SurfaceOverlayPanel.tsx`

**Design:** Tabs at top (Radius / Elevation / Borders / Card). Each tab shows its options as selectable chips/cards + a live preview area showing Card, Input, Button with the current settings applied.

**Step 1: Write SurfaceOverlayPanel**

```tsx
// components/overlay/panels/SurfaceOverlayPanel.tsx
'use client';

import { useState } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import type { RadiusPreset, ElevationLevel } from '@/types/tokens';

type SurfaceTab = 'radius' | 'elevation' | 'borders' | 'card';

const RADIUS_OPTIONS: { value: RadiusPreset; label: string; preview: string }[] = [
  { value: 'none', label: 'None', preview: '0px' },
  { value: 'sm', label: 'Small', preview: '4px' },
  { value: 'md', label: 'Medium', preview: '8px' },
  { value: 'lg', label: 'Large', preview: '16px' },
  { value: 'full', label: 'Full', preview: '9999px' },
];

const ELEVATION_OPTIONS: { value: ElevationLevel; label: string; description: string }[] = [
  { value: 'flat', label: 'Flat', description: 'No shadows' },
  { value: 'subtle', label: 'Subtle', description: 'Soft, minimal depth' },
  { value: 'elevated', label: 'Elevated', description: 'Visible depth' },
  { value: 'floating', label: 'Floating', description: 'Strong depth, modals' },
];

const BORDER_PRESETS = [
  { label: 'None', width: '0px', opacity: 0 },
  { label: 'Whisper', width: '1px', opacity: 0.04 },
  { label: 'Subtle', width: '1px', opacity: 0.08 },
  { label: 'Visible', width: '1px', opacity: 0.14 },
  { label: 'Medium', width: '2px', opacity: 0.14 },
  { label: 'Strong', width: '2px', opacity: 0.22 },
];

const BORDER_STYLES = ['solid', 'dashed', 'dotted'] as const;

function LivePreview({ borderWidth = '1px', borderStyle = 'solid', borderOpacity = 0.14 }: {
  borderWidth?: string;
  borderStyle?: string;
  borderOpacity?: number;
}) {
  const borderColor = `oklch(0.60 0 0 / ${borderOpacity})`;
  return (
    <div className="flex gap-6 items-start flex-wrap">
      {/* Card */}
      <div
        className="p-6"
        style={{
          border: `${borderWidth} ${borderStyle} ${borderColor}`,
          borderRadius: 'var(--radius-token-lg)',
          boxShadow: 'var(--shadow-token-md)',
          backgroundColor: 'var(--color-bg-subtle)',
          width: 220,
        }}
      >
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--color-fg-muted)' }}>Card</p>
        <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-fg)', fontFamily: 'var(--font-heading)' }}>Card Title</p>
        <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Surface preview with current tokens.</p>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Input placeholder..."
          readOnly
          className="px-4 py-2.5 text-sm outline-none"
          style={{
            border: `${borderWidth} ${borderStyle} ${borderColor}`,
            borderRadius: 'var(--radius-token-md)',
            backgroundColor: 'var(--color-bg-subtle)',
            color: 'var(--color-fg)',
            fontFamily: 'var(--font-body)',
            width: 200,
          }}
        />
        <input
          type="text"
          defaultValue="focus"
          readOnly
          className="px-4 py-2.5 text-sm outline-none"
          style={{
            border: `2px solid var(--color-primary)`,
            borderRadius: 'var(--radius-token-md)',
            backgroundColor: 'var(--color-bg-subtle)',
            color: 'var(--color-fg)',
            fontFamily: 'var(--font-body)',
            width: 200,
          }}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <button
          className="px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-fg)',
            borderRadius: 'var(--radius-token-md)',
            border: 'none',
            fontFamily: 'var(--font-body)',
          }}
        >
          Primary
        </button>
        <button
          className="px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-fg)',
            borderRadius: 'var(--radius-token-md)',
            border: `${borderWidth} ${borderStyle} ${borderColor}`,
            fontFamily: 'var(--font-body)',
          }}
        >
          Outline
        </button>
      </div>
    </div>
  );
}

export function SurfaceOverlayPanel() {
  const { config, dispatch } = useTokenConfigContext();
  const [activeTab, setActiveTab] = useState<SurfaceTab>('radius');
  const [borderPreset, setBorderPreset] = useState(2); // Subtle
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');

  const tabs: { id: SurfaceTab; label: string }[] = [
    { id: 'radius', label: 'Radius' },
    { id: 'elevation', label: 'Elevation' },
    { id: 'borders', label: 'Borders' },
    { id: 'card', label: 'Card' },
  ];

  const currentBorderPreset = BORDER_PRESETS[borderPreset];

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'var(--color-border-var)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="px-8 py-4 text-xs tracking-[0.15em] uppercase transition-colors border-b-2"
            style={{
              color: activeTab === tab.id ? 'var(--color-fg)' : 'var(--color-fg-muted)',
              borderBottomColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex flex-1 overflow-auto">
        {/* Options */}
        <div className="p-8 border-r shrink-0" style={{ width: 380, borderColor: 'var(--color-border-var)' }}>
          {activeTab === 'radius' && (
            <div className="flex flex-col gap-2">
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
                Border Radius Preset
              </p>
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SURFACE', patch: { radius: opt.value } })}
                  className="flex items-center justify-between px-4 py-3 border transition-colors"
                  style={{
                    borderColor: config.surface.radius === opt.value
                      ? 'var(--color-primary)'
                      : 'var(--color-border-var)',
                    borderRadius: 'var(--radius-token-sm)',
                    backgroundColor: config.surface.radius === opt.value
                      ? 'oklch(from var(--color-primary) l c h / 0.08)'
                      : 'transparent',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-fg)' }}>{opt.label}</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>{opt.preview}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'elevation' && (
            <div className="flex flex-col gap-2">
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
                Shadow Level
              </p>
              {ELEVATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SURFACE', patch: { elevation: opt.value } })}
                  className="flex flex-col items-start px-4 py-3 border transition-colors text-left"
                  style={{
                    borderColor: config.surface.elevation === opt.value
                      ? 'var(--color-primary)'
                      : 'var(--color-border-var)',
                    borderRadius: 'var(--radius-token-sm)',
                    backgroundColor: config.surface.elevation === opt.value
                      ? 'oklch(from var(--color-primary) l c h / 0.08)'
                      : 'transparent',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-fg)' }}>{opt.label}</span>
                  <span className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>{opt.description}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'borders' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
                Intensity Preset
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {BORDER_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBorderPreset(i)}
                    className="px-4 py-2 text-sm border transition-colors"
                    style={{
                      borderColor: borderPreset === i ? 'var(--color-primary)' : 'var(--color-border-var)',
                      color: borderPreset === i ? 'var(--color-primary)' : 'var(--color-fg-muted)',
                      borderRadius: 'var(--radius-token-sm)',
                      backgroundColor: borderPreset === i ? 'oklch(from var(--color-primary) l c h / 0.08)' : 'transparent',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <p className="mb-3 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
                Style
              </p>
              <div className="flex gap-2 mb-6">
                {BORDER_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBorderStyle(s)}
                    className="px-4 py-2 text-sm border transition-colors"
                    style={{
                      borderColor: borderStyle === s ? 'var(--color-primary)' : 'var(--color-border-var)',
                      color: borderStyle === s ? 'var(--color-primary)' : 'var(--color-fg-muted)',
                      borderRadius: 'var(--radius-token-sm)',
                      backgroundColor: borderStyle === s ? 'oklch(from var(--color-primary) l c h / 0.08)' : 'transparent',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="p-3 border" style={{ borderColor: 'var(--color-border-var)', borderRadius: 'var(--radius-token-sm)' }}>
                <p className="text-[9px] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--color-fg-muted)' }}>Width</p>
                <p className="font-mono text-sm" style={{ color: 'var(--color-fg)' }}>
                  {currentBorderPreset.width} {borderStyle}
                </p>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>
                  opacity: {currentBorderPreset.opacity}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
                Card Padding
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Compact', value: 12 },
                  { label: 'Default', value: 16 },
                  { label: 'Comfortable', value: 24 },
                  { label: 'Spacious', value: 32 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="flex items-center justify-between px-4 py-3 border text-left"
                    style={{
                      borderColor: 'var(--color-border-var)',
                      borderRadius: 'var(--radius-token-sm)',
                    }}
                  >
                    <span className="text-sm" style={{ color: 'var(--color-fg)' }}>{opt.label}</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-fg-muted)' }}>{opt.value}px</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div className="flex-1 p-12 flex items-center">
          <div>
            <p className="mb-8 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
              Live Preview
            </p>
            <LivePreview
              borderWidth={currentBorderPreset.width}
              borderStyle={borderStyle}
              borderOpacity={currentBorderPreset.opacity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/overlay/panels/SurfaceOverlayPanel.tsx
git commit -m "feat: add SurfaceOverlayPanel with Radius/Elevation/Borders/Card tabs"
```

---

## Task 8: Make TypographyPreview interactive

**Files:**
- Modify: `components/preview/sections/TypographyPreview.tsx`

**Step 1: Add `useOverlay` hook and wrap heading/body rows in clickable containers**

Add to each font row:
- `onClick={() => openOverlay('typography')}` on the entire row div
- `cursor-pointer` and hover border/highlight
- A subtle "click to edit" affordance (small label appears on hover)

```tsx
// Add at top of component:
import { useOverlay } from '@/context/OverlayContext';
const { openOverlay } = useOverlay();

// Wrap each grid row with onClick:
<div
  className="grid border-b py-10 cursor-pointer group"
  onClick={() => openOverlay('typography')}
  style={{ gridTemplateColumns: '1fr 1fr 1fr', borderColor: 'var(--color-border-var)', alignItems: 'end' }}
>
  {/* Add edit hint */}
  <div className="col-span-3 flex justify-end mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <span className="text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-primary)' }}>
      Click to edit →
    </span>
  </div>
  {/* existing content */}
</div>
```

**Step 2: Commit**

```bash
git add components/preview/sections/TypographyPreview.tsx
git commit -m "feat: make TypographyPreview rows clickable to open overlay"
```

---

## Task 9: Make ColorSwatchPreview interactive

**Files:**
- Modify: `components/preview/sections/ColorSwatchPreview.tsx`

**Step 1: Add `useOverlay` and make each color block clickable**

Each color block (primary, secondary, accent, neutral) gets:
- `onClick={() => openOverlay('color', { colorKey: name })}`
- `cursor-pointer` + hover ring
- "Click to edit" hint on hover

```tsx
import { useOverlay } from '@/context/OverlayContext';
const { openOverlay } = useOverlay();

// On each color block:
<div
  key={name}
  className="group relative flex flex-col justify-end rounded-sm p-5 cursor-pointer"
  onClick={() => openOverlay('color', { colorKey: name })}
  style={{ backgroundColor: midStep.hex, flex: colorIdx === 0 ? '2.5' : '1', minHeight: '160px' }}
>
  {/* hover hint */}
  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
    <span className="text-[9px] tracking-[0.15em] uppercase" style={{ color: textColor, opacity: 0.8 }}>
      Edit →
    </span>
  </div>
  {/* existing label content */}
</div>
```

**Step 2: Commit**

```bash
git add components/preview/sections/ColorSwatchPreview.tsx
git commit -m "feat: make ColorSwatchPreview blocks clickable to open color overlay"
```

---

## Task 10: Replace ComponentsPreview with SurfacePreview

**Files:**
- Create: `components/preview/sections/SurfacePreview.tsx`
- Modify: `components/preview/OverviewPreview.tsx`

**Step 1: Create SurfacePreview — clickable entry point to surface overlay**

```tsx
// components/preview/sections/SurfacePreview.tsx
'use client';

import { useOverlay } from '@/context/OverlayContext';
import { useTokenConfig } from '@/hooks/useTokenConfig';

export function SurfacePreview() {
  const config = useTokenConfig();
  const { openOverlay } = useOverlay();

  return (
    <section
      className="px-6 py-16 cursor-pointer group"
      onClick={() => openOverlay('surface')}
      style={{ borderColor: 'var(--color-border-var)', backgroundColor: 'oklch(0.08 0 0)' }}
    >
      {/* Section header */}
      <div className="mb-12 flex items-start justify-between gap-6 border-b pb-6" style={{ borderColor: 'var(--color-border-var)' }}>
        <div className="flex items-start gap-6">
          <span className="font-mono text-7xl font-light leading-none select-none" style={{ color: 'oklch(0.20 0 0)' }}>
            C
          </span>
          <div className="flex items-center gap-3 pt-4">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-mono"
              style={{ borderColor: 'var(--color-fg-muted)', color: 'var(--color-fg-muted)' }}>
              3
            </span>
            <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>
              Surfaces
            </span>
          </div>
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] tracking-[0.15em] uppercase pt-4" style={{ color: 'var(--color-primary)' }}>
          Click to configure →
        </span>
      </div>

      {/* Quick-view: cards showing current surface tokens */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Radius */}
        <div className="border p-6" style={{ borderColor: 'var(--color-border-var)', borderRadius: 'var(--radius-token-lg)' }}>
          <p className="mb-3 text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>Radius</p>
          <p className="text-2xl font-semibold" style={{ color: 'var(--color-fg)', fontFamily: 'var(--font-heading)' }}>
            {config.surface.radius}
          </p>
          <div className="mt-4 h-8 w-8 border" style={{ borderColor: 'var(--color-fg-muted)', borderRadius: 'var(--radius-token-md)' }} />
        </div>

        {/* Elevation */}
        <div className="border p-6" style={{ borderColor: 'var(--color-border-var)', borderRadius: 'var(--radius-token-lg)', boxShadow: 'var(--shadow-token-md)' }}>
          <p className="mb-3 text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>Elevation</p>
          <p className="text-2xl font-semibold" style={{ color: 'var(--color-fg)', fontFamily: 'var(--font-heading)' }}>
            {config.surface.elevation}
          </p>
        </div>

        {/* Borders */}
        <div className="border-2 p-6" style={{ borderColor: 'var(--color-border-var)', borderRadius: 'var(--radius-token-lg)' }}>
          <p className="mb-3 text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>Borders</p>
          <p className="text-2xl font-semibold" style={{ color: 'var(--color-fg)', fontFamily: 'var(--font-heading)' }}>
            solid
          </p>
        </div>

        {/* Card */}
        <div className="p-6" style={{ backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-token-lg)', boxShadow: 'var(--shadow-token-lg)' }}>
          <p className="mb-3 text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-fg-muted)' }}>Card</p>
          <p className="text-base font-semibold" style={{ color: 'var(--color-fg)', fontFamily: 'var(--font-heading)' }}>
            Card Title
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-fg-muted)' }}>Surfaces preview</p>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Update OverviewPreview**

```tsx
// components/preview/OverviewPreview.tsx
import { TypographyPreview } from './sections/TypographyPreview';
import { ColorSwatchPreview } from './sections/ColorSwatchPreview';
import { SurfacePreview } from './sections/SurfacePreview';

export function OverviewPreview() {
  return (
    <div>
      <TypographyPreview />
      <ColorSwatchPreview />
      <SurfacePreview />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add components/preview/sections/SurfacePreview.tsx components/preview/OverviewPreview.tsx
git commit -m "feat: add SurfacePreview replacing ComponentsPreview"
```

---

## Task 11: Final wiring + TopBar cleanup

**Files:**
- Modify: `components/layout/TopBar.tsx` (read first)

**Step 1: Read TopBar and remove any EditorPanel references**

**Step 2: Run dev server, test all overlays open/close correctly**

```bash
npm run dev
```

Manual test checklist:
- [ ] Page loads without EditorPanel
- [ ] App is full-width
- [ ] Clicking heading font row opens typography overlay
- [ ] Clicking body font row opens typography overlay
- [ ] Font list shows and clicking a font updates the specimen + preview
- [ ] ESC closes overlay
- [ ] Clicking primary/secondary/accent/neutral color block opens color overlay with correct colorKey
- [ ] HEX input + native picker update scale in real-time
- [ ] Clicking anywhere on Surfaces section opens surface overlay
- [ ] Radius/Elevation/Borders/Card tabs work
- [ ] Token changes persist across overlay close/open

**Step 3: Save memory**

After completion, save project memory to `/Users/caioogata/.claude/projects/-Users-caioogata-Projects-style-system-creator/memory/MEMORY.md`

---

## Summary

| Task | Files Changed | Complexity |
|------|--------------|------------|
| 1 | page.tsx, AppShell, delete editor/ | Low |
| 2 | token-applier.ts | Medium |
| 3 | context/OverlayContext.tsx, layout.tsx | Low |
| 4 | components/overlay/OverlayPanel.tsx, layout.tsx | Medium |
| 5 | overlay/panels/TypographyOverlayPanel.tsx | High |
| 6 | overlay/panels/ColorOverlayPanel.tsx | High |
| 7 | overlay/panels/SurfaceOverlayPanel.tsx | High |
| 8 | preview/sections/TypographyPreview.tsx | Low |
| 9 | preview/sections/ColorSwatchPreview.tsx | Low |
| 10 | preview/sections/SurfacePreview.tsx, OverviewPreview.tsx | Medium |
| 11 | TopBar.tsx, final testing | Low |
