# Overlay Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Apply/staging to all overlay panels, deep-link navigation from previews, a live scale table in the typography overlay, and a numeric radius slider in the surface overlay.

**Architecture:** Each overlay works off a local draft copy of the relevant config section. Controls mutate draft only. Apply commits draft via dispatch + closes. The radius token changes from a string preset to a plain `number` (px), with the engine deriving sm/md/lg proportionally. Deep-links pass initial tab/target through the existing `OverlayContext` payload system.

**Tech Stack:** Next.js 15, TypeScript, React `useState`, `useCallback`, existing token context/dispatch system.

---

## Important Context

- No automated tests — verify with `npx tsc --noEmit` + browser smoke test at `http://localhost:3002`
- `'t'` URL param = tertiary color; `'r'` URL param = radius (currently string preset, will become number string)
- `useTokenConfigContext()` returns `{ config, dispatch }`. `useOverlay()` returns `{ overlay, openOverlay, closeOverlay }`.
- `RadiusPreset` type will be removed — do not reference it after Task 1.
- The overlay `minHeight: 'calc(100vh - 57px)'` accounts for the top bar (57px).

---

### Task 1: Radius type change (types, engine, default-config, url-serializer)

**Files:**
- Modify: `types/tokens.ts`
- Modify: `lib/token-engine.ts`
- Modify: `lib/default-config.ts`
- Modify: `lib/url-serializer.ts`

**Step 1: Update `types/tokens.ts`**

Read the file first. Then make these changes:

1. Remove the entire `RadiusPreset` line:
```ts
// DELETE THIS LINE:
export type RadiusPreset = 'none' | 'sm' | 'md' | 'lg' | 'full';
```

2. Change `surface.radius` type from `RadiusPreset` to `number`:
```ts
export interface TokenConfig {
  colors: PrimitiveColors;
  typography: TypographyConfig;
  surface: {
    radius: number;          // was: RadiusPreset
    elevation: ElevationLevel;
  };
  spacing: { baseUnit: number };
  theme: 'light' | 'dark';
}
```

**Step 2: Update `lib/token-engine.ts`**

Read the file. Make these changes:

1. Remove the `RadiusPreset` import from `@/types/tokens` (keep `ElevationLevel` and the rest).

2. Remove the entire `RADIUS_VALUES` constant (lines ~135–142 in the current file).

3. Replace the `resolveSurfaceTokens` function with:
```ts
export function resolveSurfaceTokens(surface: TokenConfig['surface']): SurfaceTokens {
  const { radius, elevation } = surface;

  let radiusSm: string, radiusMd: string, radiusLg: string;
  if (radius >= 9999) {
    radiusSm = radiusMd = radiusLg = '9999px';
  } else {
    radiusSm = `${Math.round(radius * 0.5)}px`;
    radiusMd = `${radius}px`;
    radiusLg = `${Math.round(radius * 1.5)}px`;
  }

  const [shadowSm, shadowMd, shadowLg] = SHADOW_VALUES[elevation];

  return {
    radiusSm,
    radiusMd,
    radiusLg,
    radiusFull: '9999px',
    shadowSm,
    shadowMd,
    shadowLg,
  };
}
```

**Step 3: Update `lib/default-config.ts`**

Change `radius: 'md'` to `radius: 8`.

**Step 4: Update `lib/url-serializer.ts`**

Read the file. Make these changes:

1. Remove the `RadiusPreset` import from `@/types/tokens`.

2. In `serializeConfig`, `params.set('r', config.surface.radius)` needs to become `params.set('r', String(config.surface.radius))` (since `radius` is now a number).

3. Remove the `VALID_RADIUS` constant line.

4. Replace the radius deserialization block inside `deserializeConfig`. The old code was:
```ts
const radius = params.get('r');
// ... then: radius: (radius && VALID_RADIUS.includes(radius as RadiusPreset)) ? ...
```

Replace with:
```ts
const radiusParam = params.get('r');
const radius: number =
  radiusParam !== null && isFinite(Number(radiusParam)) && Number(radiusParam) >= 0
    ? Math.round(Number(radiusParam))
    : def.surface.radius;
```

And in the returned object, change:
```ts
surface: {
  radius,   // now a number
  elevation: ...
},
```

**Step 5: Verify TypeScript — must be clean**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors. If `SurfaceOverlayPanel.tsx` or `SurfacePreview.tsx` errors because they still reference `RadiusPreset` or treat radius as a string — fix those too (next task covers them).

**Step 6: Commit**

```bash
cd /Users/caioogata/Projects/style-system-creator && git add types/tokens.ts lib/token-engine.ts lib/default-config.ts lib/url-serializer.ts && git commit -m "feat(surface): convert radius from RadiusPreset enum to numeric px value"
```

---

### Task 2: Fix SurfacePreview radius display + OverlayContext payload expansion

**Files:**
- Modify: `components/preview/sections/SurfacePreview.tsx`
- Modify: `context/OverlayContext.tsx`
- Modify: `components/overlay/OverlayPanel.tsx`

**Step 1: Fix radius display in `SurfacePreview.tsx`**

Read the file. Find the Radius card (around line 73–85). It currently renders `{config.surface.radius}` as text. Change it to show a meaningful label:

```tsx
<p
  className="text-2xl font-semibold"
  style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
>
  {config.surface.radius >= 9999 ? 'Full' : `${config.surface.radius}px`}
</p>
```

**Step 2: Expand payload types in `context/OverlayContext.tsx`**

Read the file. Replace the current content with:

```ts
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
```

**Step 3: Fix the cast in `OverlayPanel.tsx`**

Read the file. The color panel render currently uses `overlay.payload.colorKey` directly. With the widened payload type, TypeScript will error. Update the import and the render line:

Add import at top: `import type { ColorOverlayPayload } from '@/context/OverlayContext';`

Change the color panel render:
```tsx
{overlay.type === 'color' && overlay.payload && (
  <ColorOverlayPanel colorKey={(overlay.payload as ColorOverlayPayload).colorKey} />
)}
```

**Step 4: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors.

**Step 5: Commit**

```bash
cd /Users/caioogata/Projects/style-system-creator && git add components/preview/sections/SurfacePreview.tsx context/OverlayContext.tsx components/overlay/OverlayPanel.tsx && git commit -m "feat(overlay): expand payload types for deep-link navigation"
```

---

### Task 3: Typography and Surface preview deep-links

**Files:**
- Modify: `components/preview/sections/TypographyPreview.tsx`
- Modify: `components/preview/sections/SurfacePreview.tsx`

**Step 1: Update `TypographyPreview.tsx`**

Read the file. There are two clickable rows:

1. **Heading font row** (around line 70–143): currently calls `openOverlay('typography')`. Change to:
```tsx
onClick={() => openOverlay('typography', { target: 'heading' })}
onKeyDown={(e) => e.key === 'Enter' && openOverlay('typography', { target: 'heading' })}
```

2. **Body font row** (around line 146–211): currently calls `openOverlay('typography')`. Change to:
```tsx
onClick={() => openOverlay('typography', { target: 'body' })}
onKeyDown={(e) => e.key === 'Enter' && openOverlay('typography', { target: 'body' })}
```

Also add the import for `TypographyOverlayPayload` — actually not needed, TypeScript will infer the object literal correctly since `openOverlay` now accepts `OverlayPayload`.

**Step 2: Update `SurfacePreview.tsx`**

Read the file. The whole section is one clickable area calling `openOverlay('surface')`. Change to pass a default tab:
```tsx
onClick={() => openOverlay('surface', { tab: 'radius' })}
onKeyDown={(e) => e.key === 'Enter' && openOverlay('surface', { tab: 'radius' })}
```

**Step 3: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -20
```

Expected: zero errors.

**Step 4: Commit**

```bash
cd /Users/caioogata/Projects/style-system-creator && git add components/preview/sections/TypographyPreview.tsx components/preview/sections/SurfacePreview.tsx && git commit -m "feat(overlay): pass deep-link target/tab when opening overlays from preview"
```

---

### Task 4: ColorOverlayPanel — Apply/staging footer

**Files:**
- Modify: `components/overlay/panels/ColorOverlayPanel.tsx`

The color overlay already has good local draft state (`hex`, `inputValue`, `error`). The main changes:
1. Remove the `dispatch` call from `applyHex` — it should only update local state
2. Add `useOverlay` for `closeOverlay`
3. Add Apply/Cancel footer at the bottom

**Step 1: Read the file**

**Step 2: Rewrite `ColorOverlayPanel.tsx`**

Key changes from the current file:
- Add `useOverlay` import and call
- Remove `dispatch` from `applyHex` (only updates `hex`/`inputValue`/`error` state)
- Add Apply/Cancel footer bar

Here is the complete new file:

```tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { useOverlay } from '@/context/OverlayContext';
import { generateColorScale } from '@/lib/token-engine';
import type { PrimitiveColors } from '@/types/tokens';

const COLOR_META: Record<keyof PrimitiveColors, { label: string; description: string }> = {
  primary: { label: 'Primary', description: 'CTAs, buttons, interactive elements' },
  secondary: { label: 'Secondary', description: 'Text, typography, readable content' },
  accent: { label: 'Accent', description: 'Highlights, badges, decorative elements' },
  neutral:   { label: 'Neutral',   description: 'Backgrounds, borders, surfaces' },
  tertiary:  { label: 'Tertiary',  description: 'Dim labels, captions, decorative text' },
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
  const { closeOverlay } = useOverlay();

  // Local draft — does NOT write to global config until Apply
  const [hex, setHex] = useState(config.colors[colorKey]);
  const [inputValue, setInputValue] = useState(config.colors[colorKey].toUpperCase());
  const [error, setError] = useState(false);

  useEffect(() => {
    setHex(config.colors[colorKey]);
    setInputValue(config.colors[colorKey].toUpperCase());
    setError(false);
  }, [colorKey, config.colors]);

  const scale = useMemo(() => {
    try {
      return generateColorScale(hex);
    } catch {
      return null;
    }
  }, [hex]);

  // Updates local draft only — no dispatch
  function applyHex(value: string) {
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      setHex(normalized);
      setInputValue(normalized.toUpperCase());
      setError(false);
    } else {
      setError(true);
    }
  }

  function handleApply() {
    if (!error) {
      dispatch({ type: 'SET_COLOR', key: colorKey, value: hex });
    }
    closeOverlay();
  }

  const meta = COLOR_META[colorKey];
  const contrastColor = getContrastColor(hex);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 57px)' }}>
      <div className="flex flex-1">
        {/* ── Left: color preview + picker ── */}
        <div
          className="flex flex-col justify-end p-16 border-r transition-colors duration-300"
          style={{
            flex: '4',
            backgroundColor: hex,
            borderColor: 'var(--color-border-primary)',
          }}
        >
          <div className="mb-6">
            <p
              className="text-[10px] tracking-[0.2em] uppercase mb-2"
              style={{ color: contrastColor, opacity: 0.6 }}
            >
              {meta.label}
            </p>
            <p
              className="font-light leading-none mb-3"
              style={{
                color: contrastColor,
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(40px, 5vw, 80px)',
              }}
            >
              {hex.toUpperCase()}
            </p>
            <p
              className="text-sm"
              style={{ color: contrastColor, opacity: 0.7 }}
            >
              {meta.description}
            </p>
          </div>

          {/* Picker row */}
          <div className="flex items-center gap-3">
            <div
              className="relative h-10 w-10 overflow-hidden border shrink-0"
              style={{
                borderColor: `oklch(1 0 0 / 0.25)`,
                borderRadius: 'var(--radius-component-sm)',
              }}
            >
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
                backgroundColor: 'oklch(0 0 0 / 0.25)',
                borderColor: error ? 'var(--color-error)' : `oklch(1 0 0 / 0.25)`,
                color: contrastColor,
                borderRadius: 'var(--radius-component-sm)',
              }}
            />
          </div>
          {error && (
            <p className="mt-2 text-xs" style={{ color: 'var(--color-error)' }}>
              Invalid hex color
            </p>
          )}
        </div>

        {/* ── Right: live scale ── */}
        <div
          className="flex flex-col p-8 overflow-auto"
          style={{ flex: '6' }}
        >
          <p
            className="mb-6 text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Generated Scale — {meta.label}
          </p>

          {scale ? (
            <div className="flex gap-1.5 flex-1" style={{ minHeight: 320 }}>
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
                    <p
                      className="font-mono text-[9px] mb-0.5"
                      style={{ color: textColor, opacity: 0.7 }}
                    >
                      {step.step}
                    </p>
                    <p
                      className="font-mono text-[9px]"
                      style={{ color: textColor, opacity: 0.9 }}
                    >
                      {step.hex.toUpperCase()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Enter a valid hex color
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer: Apply / Cancel ── */}
      <div
        className="flex items-center justify-between border-t px-8 py-4 shrink-0"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <button
          type="button"
          onClick={closeOverlay}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={error}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase transition-colors"
          style={{
            backgroundColor: error ? 'var(--color-border-primary)' : 'var(--color-bg-fill-primary)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-component-sm)',
            opacity: error ? 0.5 : 1,
          }}
        >
          Apply →
        </button>
      </div>
    </div>
  );
}
```

**Step 3: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
cd /Users/caioogata/Projects/style-system-creator && git add components/overlay/panels/ColorOverlayPanel.tsx && git commit -m "feat(overlay): add Apply/staging to color overlay"
```

---

### Task 5: TypographyOverlayPanel — staging + Apply + scale table + read payload

**Files:**
- Modify: `components/overlay/panels/TypographyOverlayPanel.tsx`

**Step 1: Read the file**

**Step 2: Rewrite `TypographyOverlayPanel.tsx`**

Key changes:
- Import `useOverlay` and `TypographyOverlayPayload`
- Read `overlay.payload` to get initial `activeTarget`
- Replace all `dispatch` calls with local state mutations
- Add scale table below the base size slider
- Add Apply/Cancel footer

Complete new file:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { useOverlay } from '@/context/OverlayContext';
import type { TypographyOverlayPayload } from '@/context/OverlayContext';
import { preloadAllFonts } from '@/lib/font-loader';

const FONT_LIST = [
  // Sans Serif
  'Inter', 'DM Sans', 'Plus Jakarta Sans', 'Outfit', 'Nunito', 'Lato', 'Roboto',
  'IBM Plex Sans', 'Manrope', 'Space Grotesk', 'Syne', 'Epilogue', 'Raleway',
  'Josefin Sans', 'Satoshi', 'General Sans', 'Switzer', 'Cabinet Grotesk', 'Supreme', 'Clash Display',
  // Serif
  'Source Serif 4', 'Playfair Display', 'DM Serif Display', 'Cormorant', 'Fraunces',
  'Libre Baskerville', 'Merriweather', 'Crimson Text',
  // Display
  'Bebas Neue',
];

const SCALE_RATIOS = [
  { label: 'Minor Second', value: 1.067 },
  { label: 'Major Second', value: 1.125 },
  { label: 'Minor Third', value: 1.200 },
  { label: 'Major Third', value: 1.250 },
  { label: 'Perfect Fourth', value: 1.333 },
  { label: 'Golden Ratio', value: 1.618 },
];

const SCALE_STEPS = [
  { key: 'H1', exp: 7 },
  { key: 'H2', exp: 6 },
  { key: 'H3', exp: 5 },
  { key: 'H4', exp: 4 },
  { key: 'H5', exp: 3 },
  { key: 'H6', exp: 2 },
  { key: 'Body LG', exp: 1 },
  { key: 'Body', exp: 0 },
  { key: 'Body SM', exp: -1 },
  { key: 'Caption', exp: -2 },
];

type FontTarget = 'heading' | 'body';

export function TypographyOverlayPanel() {
  const { config, dispatch } = useTokenConfigContext();
  const { overlay, closeOverlay } = useOverlay();

  const typographyPayload = overlay.payload as TypographyOverlayPayload | undefined;
  const [activeTarget, setActiveTarget] = useState<FontTarget>(typographyPayload?.target ?? 'heading');
  const [search, setSearch] = useState('');

  // Local draft — does NOT write to global config until Apply
  const [draft, setDraft] = useState({
    headingFamily: config.typography.headingFamily,
    bodyFamily: config.typography.bodyFamily,
    headingWeight: config.typography.headingWeight,
    bodyWeight: config.typography.bodyWeight,
    baseSize: config.typography.baseSize,
    scaleRatio: config.typography.scaleRatio,
  });

  useEffect(() => {
    preloadAllFonts();
  }, []);

  const activeFont = activeTarget === 'heading' ? draft.headingFamily : draft.bodyFamily;

  const filteredFonts = FONT_LIST.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  function selectFont(family: string) {
    if (activeTarget === 'heading') {
      setDraft((d) => ({ ...d, headingFamily: family }));
    } else {
      setDraft((d) => ({ ...d, bodyFamily: family }));
    }
  }

  // Compute scale table inline from draft values
  const scaleTable = SCALE_STEPS.map(({ key, exp }) => ({
    key,
    size: Math.round(draft.baseSize * Math.pow(draft.scaleRatio, exp)),
  }));

  function handleApply() {
    dispatch({ type: 'SET_TYPOGRAPHY', patch: draft });
    closeOverlay();
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 57px)' }}>
      <div className="flex flex-1">
        {/* ── Left: specimen (70%) ── */}
        <div
          className="flex flex-col justify-end p-16 border-r"
          style={{ flex: '7', borderColor: 'var(--color-border-primary)' }}
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
                  backgroundColor: activeTarget === t ? 'var(--color-bg-fill-primary)' : 'transparent',
                  color: activeTarget === t ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                  borderRadius: 'var(--radius-component-sm)',
                }}
              >
                {t === 'heading' ? 'Heading' : 'Body'}
              </button>
            ))}
          </div>

          {/* Large specimen */}
          <p
            className="leading-none select-none mb-6"
            style={{
              fontFamily: `"${activeFont}", sans-serif`,
              fontWeight: activeTarget === 'heading' ? draft.headingWeight : draft.bodyWeight,
              fontSize: 'clamp(48px, 8vw, 140px)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {activeFont}
          </p>

          {/* Alphabet */}
          <p
            className="mb-4 text-xl tracking-widest select-none"
            style={{
              fontFamily: `"${activeFont}", sans-serif`,
              color: 'var(--color-text-secondary)',
            }}
          >
            Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm
          </p>

          {/* Sentence */}
          <p
            className="text-lg leading-relaxed max-w-prose"
            style={{
              fontFamily: `"${activeFont}", sans-serif`,
              color: 'var(--color-text-secondary)',
            }}
          >
            The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
          </p>
        </div>

        {/* ── Right: controls (30%) ── */}
        <div
          className="flex flex-col overflow-auto p-8"
          style={{ flex: '3', minWidth: 0 }}
        >
          {/* Search */}
          <input
            type="text"
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full border px-4 py-2.5 text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-bg-surface-primary)',
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-component-sm)',
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
                  borderColor: 'var(--color-border-primary)',
                  opacity: family === activeFont ? 1 : 0.5,
                }}
              >
                <span
                  style={{
                    fontFamily: `"${family}", sans-serif`,
                    fontSize: '1.125rem',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {family}
                </span>
                {family === activeFont && (
                  <span
                    className="text-[9px] tracking-[0.15em] uppercase shrink-0"
                    style={{ color: 'var(--color-bg-fill-primary)' }}
                  >
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Scale Ratio */}
          <div className="mb-6 shrink-0">
            <p className="mb-3 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
              Scale Ratio
            </p>
            <div className="flex flex-col gap-1">
              {SCALE_RATIOS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, scaleRatio: r.value }))}
                  className="flex items-center justify-between px-3 py-2 text-left transition-colors"
                  style={{
                    backgroundColor:
                      draft.scaleRatio === r.value
                        ? 'var(--color-bg-surface-primary)'
                        : 'transparent',
                    borderRadius: 'var(--radius-component-sm)',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {r.label}
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {r.value}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Base size + scale table */}
          <div className="shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                Base Size
              </p>
              <span className="font-mono text-xs" style={{ color: 'var(--color-text-primary)' }}>
                {draft.baseSize}px
              </span>
            </div>
            <input
              type="range"
              min={12}
              max={24}
              step={1}
              value={draft.baseSize}
              onChange={(e) => setDraft((d) => ({ ...d, baseSize: Number(e.target.value) }))}
              className="w-full mb-6"
            />

            {/* Scale table */}
            <p className="mb-2 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
              Derived Scale
            </p>
            <div className="flex flex-col gap-1">
              {scaleTable.map(({ key, size }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <span className="text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                    {key}
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--color-text-primary)' }}>
                    {size}px
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer: Apply / Cancel ── */}
      <div
        className="flex items-center justify-between border-t px-8 py-4 shrink-0"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <button
          type="button"
          onClick={closeOverlay}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase"
          style={{
            backgroundColor: 'var(--color-bg-fill-primary)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-component-sm)',
          }}
        >
          Apply →
        </button>
      </div>
    </div>
  );
}
```

**Step 3: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
cd /Users/caioogata/Projects/style-system-creator && git add components/overlay/panels/TypographyOverlayPanel.tsx && git commit -m "feat(overlay): add Apply/staging, scale table, and deep-link to typography overlay"
```

---

### Task 6: SurfaceOverlayPanel — staging + Apply + radius slider + read payload

**Files:**
- Modify: `components/overlay/panels/SurfaceOverlayPanel.tsx`

**Step 1: Read the file**

**Step 2: Rewrite `SurfaceOverlayPanel.tsx`**

Key changes:
- Import `useOverlay` and `SurfaceOverlayPayload`
- Read `overlay.payload` for initial `activeTab`
- Replace all `dispatch({ type: 'SET_SURFACE', ... })` calls with local `setLocalSurface`
- Remove the old `RADIUS_OPTIONS` array (it referenced `RadiusPreset` values like `'sm'`, `'md'`)
- Add chip presets (numeric) + slider for radius tab
- Add Apply/Cancel footer

Complete new file:

```tsx
'use client';

import { useState } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { useOverlay } from '@/context/OverlayContext';
import type { SurfaceOverlayPayload, SurfaceTab } from '@/context/OverlayContext';
import type { ElevationLevel } from '@/types/tokens';

const RADIUS_PRESETS: { label: string; value: number }[] = [
  { label: 'None', value: 0 },
  { label: 'Small', value: 4 },
  { label: 'Med', value: 8 },
  { label: 'Large', value: 16 },
  { label: 'Full', value: 9999 },
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

function LivePreview({
  borderWidth = '1px',
  borderStyle = 'solid',
  borderOpacity = 0.14,
}: {
  borderWidth?: string;
  borderStyle?: string;
  borderOpacity?: number;
}) {
  const borderColor = `oklch(0.60 0 0 / ${borderOpacity})`;
  return (
    <div className="flex gap-8 items-start flex-wrap">
      {/* Card */}
      <div
        className="p-6"
        style={{
          border: `${borderWidth} ${borderStyle} ${borderColor}`,
          borderRadius: 'var(--radius-component-lg)',
          boxShadow: 'var(--shadow-md)',
          backgroundColor: 'var(--color-bg-surface-primary)',
          width: 220,
        }}
      >
        <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Card
        </p>
        <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
          Card Title
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Surface preview with current tokens applied.
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-secondary)' }}>Input</p>
          <input
            type="text"
            placeholder="Input placeholder..."
            readOnly
            className="px-4 py-2.5 text-sm outline-none"
            style={{
              border: `${borderWidth} ${borderStyle} ${borderColor}`,
              borderRadius: 'var(--radius-component-md)',
              backgroundColor: 'var(--color-bg-surface-primary)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              width: 200,
              display: 'block',
            }}
          />
        </div>
        <div>
          <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-secondary)' }}>:focus</p>
          <input
            type="text"
            defaultValue="focus"
            readOnly
            className="px-4 py-2.5 text-sm outline-none"
            style={{
              border: `2px solid var(--color-bg-fill-primary)`,
              borderRadius: 'var(--radius-component-md)',
              backgroundColor: 'var(--color-bg-surface-primary)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              width: 200,
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>Buttons</p>
        <button
          className="px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-bg-fill-primary)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-component-md)',
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
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-component-md)',
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
  const { overlay, closeOverlay } = useOverlay();

  const surfacePayload = overlay.payload as SurfaceOverlayPayload | undefined;
  const [activeTab, setActiveTab] = useState<SurfaceTab>(surfacePayload?.tab ?? 'radius');

  // Local draft — does NOT write to global config until Apply
  const [localSurface, setLocalSurface] = useState({
    radius: config.surface.radius,
    elevation: config.surface.elevation,
  });

  const [borderPresetIdx, setBorderPresetIdx] = useState(2);
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');

  const tabs: { id: SurfaceTab; label: string }[] = [
    { id: 'radius', label: 'Radius' },
    { id: 'elevation', label: 'Elevation' },
    { id: 'borders', label: 'Borders' },
    { id: 'card', label: 'Card' },
  ];

  const currentBorderPreset = BORDER_PRESETS[borderPresetIdx];

  function handleApply() {
    dispatch({ type: 'SET_SURFACE', patch: { radius: localSurface.radius, elevation: localSurface.elevation } });
    closeOverlay();
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 57px)' }}>
      {/* Tab bar */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'var(--color-border-primary)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="px-8 py-4 text-xs tracking-[0.15em] uppercase transition-colors border-b-2"
            style={{
              color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderBottomColor: activeTab === tab.id ? 'var(--color-bg-fill-primary)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex flex-1">
        {/* Options panel */}
        <div
          className="p-8 border-r overflow-auto shrink-0"
          style={{ width: 380, borderColor: 'var(--color-border-primary)' }}
        >
          {activeTab === 'radius' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                Border Radius
              </p>

              {/* Chip presets */}
              <div className="flex flex-wrap gap-2 mb-6">
                {RADIUS_PRESETS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setLocalSurface((s) => ({ ...s, radius: opt.value }))}
                    className="px-4 py-2 text-sm border transition-colors"
                    style={{
                      borderColor:
                        localSurface.radius === opt.value
                          ? 'var(--color-bg-fill-primary)'
                          : 'var(--color-border-primary)',
                      color:
                        localSurface.radius === opt.value
                          ? 'var(--color-bg-fill-primary)'
                          : 'var(--color-text-secondary)',
                      borderRadius: 'var(--radius-component-sm)',
                      backgroundColor:
                        localSurface.radius === opt.value
                          ? 'oklch(from var(--color-bg-fill-primary) l c h / 0.08)'
                          : 'transparent',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Slider — hidden when Full (9999) */}
              {localSurface.radius < 9999 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                      Custom
                    </p>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text-primary)' }}>
                      {localSurface.radius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={32}
                    step={1}
                    value={localSurface.radius}
                    onChange={(e) =>
                      setLocalSurface((s) => ({ ...s, radius: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'elevation' && (
            <div className="flex flex-col gap-2">
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                Shadow Level
              </p>
              {ELEVATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLocalSurface((s) => ({ ...s, elevation: opt.value }))}
                  className="flex flex-col items-start px-4 py-3 border transition-colors text-left"
                  style={{
                    borderColor:
                      localSurface.elevation === opt.value
                        ? 'var(--color-bg-fill-primary)'
                        : 'var(--color-border-primary)',
                    borderRadius: 'var(--radius-component-sm)',
                    backgroundColor:
                      localSurface.elevation === opt.value
                        ? 'oklch(from var(--color-bg-fill-primary) l c h / 0.08)'
                        : 'transparent',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {opt.label}
                  </span>
                  <span className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'borders' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                Intensity
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {BORDER_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBorderPresetIdx(i)}
                    className="px-4 py-2 text-sm border transition-colors"
                    style={{
                      borderColor:
                        borderPresetIdx === i ? 'var(--color-bg-fill-primary)' : 'var(--color-border-primary)',
                      color:
                        borderPresetIdx === i ? 'var(--color-bg-fill-primary)' : 'var(--color-text-secondary)',
                      borderRadius: 'var(--radius-component-sm)',
                      backgroundColor:
                        borderPresetIdx === i
                          ? 'oklch(from var(--color-bg-fill-primary) l c h / 0.08)'
                          : 'transparent',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <p className="mb-3 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
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
                      borderColor:
                        borderStyle === s ? 'var(--color-bg-fill-primary)' : 'var(--color-border-primary)',
                      color: borderStyle === s ? 'var(--color-bg-fill-primary)' : 'var(--color-text-secondary)',
                      borderRadius: 'var(--radius-component-sm)',
                      backgroundColor:
                        borderStyle === s
                          ? 'oklch(from var(--color-bg-fill-primary) l c h / 0.08)'
                          : 'transparent',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div
                className="p-3 border"
                style={{
                  borderColor: 'var(--color-border-primary)',
                  borderRadius: 'var(--radius-component-sm)',
                }}
              >
                <p className="text-[9px] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Current
                </p>
                <p className="font-mono text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {currentBorderPreset.width} {borderStyle}
                </p>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  opacity: {currentBorderPreset.opacity}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
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
                    className="flex items-center justify-between px-4 py-3 border text-left transition-colors"
                    style={{
                      borderColor: 'var(--color-border-primary)',
                      borderRadius: 'var(--radius-component-sm)',
                    }}
                  >
                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {opt.label}
                    </span>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {opt.value}px
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div className="flex-1 p-12 flex items-start">
          <div>
            <p
              className="mb-8 text-[10px] tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-text-secondary)' }}
            >
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

      {/* ── Footer: Apply / Cancel ── */}
      <div
        className="flex items-center justify-between border-t px-8 py-4 shrink-0"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <button
          type="button"
          onClick={closeOverlay}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase"
          style={{
            backgroundColor: 'var(--color-bg-fill-primary)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-component-sm)',
          }}
        >
          Apply →
        </button>
      </div>
    </div>
  );
}
```

**Step 3: Verify TypeScript — must be zero errors**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Browser smoke test**

```bash
cd /Users/caioogata/Projects/style-system-creator && npm run dev
```

Open `http://localhost:3002`. Verify:
- Clicking Heading row → typography overlay opens with Heading tab active
- Clicking Body row → typography overlay opens with Body tab active
- Changing font → preview inside overlay updates, main page doesn't change
- Scale table updates as slider moves
- Apply → changes persist on main page, overlay closes
- Cancel → main page unchanged, overlay closes
- Surface overlay opens at Radius tab by default
- Radius chips + slider work, both update the preview live
- Color overlay: picking color only applies on Apply
- Theme toggle still works in both modes

**Step 5: Commit**

```bash
cd /Users/caioogata/Projects/style-system-creator && git add components/overlay/panels/SurfaceOverlayPanel.tsx && git commit -m "feat(overlay): add Apply/staging, radius slider, and deep-link to surface overlay"
```

---

## Done

All 6 tasks complete. Summary of what changed:
- `surface.radius` is now a `number` (px), engine derives sm/md/lg proportionally
- All 3 overlay panels stage changes locally; Apply commits, Cancel/X discards
- Typography overlay opens at the correct Heading/Body tab from the preview click
- Surface overlay opens at the correct tab from the preview click
- Typography overlay shows live scale table (H1–Caption) as base size and ratio change
- Surface overlay has chip presets + pixel slider for radius
