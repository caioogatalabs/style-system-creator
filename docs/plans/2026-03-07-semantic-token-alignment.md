# Semantic Token Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rename all CSS custom properties to the `--[category]-[element]-[variant]-[state]` convention, eliminate every hardcoded `oklch()`/hex value from components, and add `tertiary` as a new configurable primitive color.

**Architecture:** `TokenApplierBridge` already re-runs `applyTokensToDOM` on every config change — the reactive plumbing is correct. The problem is (a) components bypass the token system with hardcoded values, and (b) the token names don't follow the design-system convention. Fix order: types → engine → applier → CSS seeds → components.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, OKLCH color space (culori), no test runner (verify with `tsc --noEmit` + dev server visual check).

**Design doc:** `docs/plans/2026-03-07-semantic-token-alignment-design.md`

---

### Task 1: Add `tertiary` to TypeScript types

**Files:**
- Modify: `types/tokens.ts`

**Step 1: Add `tertiary` to `PrimitiveColors` and `ResolvedColorScales`**

In `types/tokens.ts`, change:

```ts
export interface PrimitiveColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  tertiary: string; // ← add
}
```

And:

```ts
export interface ResolvedColorScales {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  tertiary: ColorScale; // ← add
}
```

**Step 2: Verify TypeScript catches downstream errors**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: errors in `default-config.ts` and `token-engine.ts` (missing `tertiary`) — that's correct, they'll be fixed in the next tasks.

**Step 3: Commit**

```bash
git add types/tokens.ts
git commit -m "feat(tokens): add tertiary to PrimitiveColors and ResolvedColorScales types"
```

---

### Task 2: Add `tertiary` default and update the engine

**Files:**
- Modify: `lib/default-config.ts`
- Modify: `lib/token-engine.ts`

**Step 1: Add default value in `lib/default-config.ts`**

```ts
export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    neutral: '#64748b',
    tertiary: '#4a5568', // ← add
  },
  // ... rest unchanged
};
```

**Step 2: Include `tertiary` in `generateAllColorScales` in `lib/token-engine.ts`**

Change `generateAllColorScales`:

```ts
export function generateAllColorScales(colors: TokenConfig['colors']): ResolvedColorScales {
  return {
    primary: generateColorScale(colors.primary),
    secondary: generateColorScale(colors.secondary),
    accent: generateColorScale(colors.accent),
    neutral: generateColorScale(colors.neutral),
    tertiary: generateColorScale(colors.tertiary), // ← add
  };
}
```

**Step 3: Verify TypeScript is clean**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: errors now only in `token-applier.ts` (no `tertiary` usage yet) — actually no errors there since it doesn't reference the type directly. Should be clean or minimal.

**Step 4: Commit**

```bash
git add lib/default-config.ts lib/token-engine.ts
git commit -m "feat(tokens): generate tertiary color scale from new primitive"
```

---

### Task 3: Rewrite `token-applier.ts` with new token names

**Files:**
- Modify: `lib/token-applier.ts`

This is the core rename. Replace the entire body of `applyTokensToDOM`.

**Step 1: Replace the full semantic token block**

The new `applyTokensToDOM` function (full replacement):

```ts
'use client';

import type { ResolvedTokens, TokenConfig } from '@/types/tokens';
import { hexToOklch } from './color-utils';

function setVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function stepToIndex(step: number): number {
  const map: Record<number, number> = {
    50: 0, 100: 1, 200: 2, 300: 3, 400: 4,
    500: 5, 600: 6, 700: 7, 800: 8, 900: 9, 950: 10,
  };
  return map[step] ?? 5;
}

export function applyTokensToDOM(resolved: ResolvedTokens, config: TokenConfig): void {
  const { colorScales, semanticColors, typography, spacing, surface } = resolved;

  // ── Color scales (primitives) ──────────────────────────────────────────────
  const colorNames = ['primary', 'secondary', 'accent', 'neutral', 'tertiary'] as const;
  colorNames.forEach((name) => {
    colorScales[name].forEach(({ step, oklch }) => {
      setVar(`--color-${name}-${step}`, oklch);
    });
  });

  // ── Derive hue/chroma from primitives ──────────────────────────────────────
  const { h: neutralH, c: neutralC } = hexToOklch(config.colors.neutral);
  const { h: secondaryH, c: secondaryC } = hexToOklch(config.colors.secondary);
  const { h: primaryH } = hexToOklch(config.colors.primary);
  const { h: tertiaryH, c: tertiaryC } = hexToOklch(config.colors.tertiary);

  const bgChroma     = Math.min(neutralC   * 0.30, 0.008);
  const fgChroma     = Math.min(secondaryC * 0.08, 0.012);
  const fgMutedChroma = Math.min(secondaryC * 0.10, 0.015);
  const borderChroma = Math.min(neutralC   * 0.40, 0.010);
  const tertiaryChroma = Math.min(tertiaryC * 0.20, 0.020);

  const p = colorScales.primary;
  const s = colorScales.secondary;
  const a = colorScales.accent;
  const n = colorScales.neutral;

  // ── Backgrounds ───────────────────────────────────────────────────────────
  setVar('--color-bg',                 `oklch(0.08 ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`);
  setVar('--color-bg-surface-primary', `oklch(0.12 ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`);

  // ── Text ──────────────────────────────────────────────────────────────────
  setVar('--color-text-primary',   `oklch(0.95 ${fgChroma.toFixed(4)} ${secondaryH.toFixed(1)})`);
  setVar('--color-text-secondary', `oklch(0.55 ${fgMutedChroma.toFixed(4)} ${secondaryH.toFixed(1)})`);
  setVar('--color-text-tertiary',  `oklch(0.35 ${tertiaryChroma.toFixed(4)} ${tertiaryH.toFixed(1)})`);
  setVar('--color-text-inverse',   `oklch(0.97 0.01 ${primaryH.toFixed(1)})`);

  // ── Fills (interactive elements) ──────────────────────────────────────────
  setVar('--color-bg-fill-primary',        config.colors.primary);
  setVar('--color-bg-fill-primary-hover',  p[6].oklch);
  setVar('--color-bg-fill-primary-active', p[7].oklch);
  setVar('--color-bg-fill-secondary',      s[5].oklch);
  setVar('--color-bg-fill-secondary-hover', s[6].oklch);
  setVar('--color-bg-fill-accent',         a[5].oklch);
  setVar('--color-bg-fill-accent-hover',   a[6].oklch);

  // ── Borders ───────────────────────────────────────────────────────────────
  setVar('--color-border-primary',   `oklch(0.20 ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`);
  setVar('--color-border-secondary', `oklch(0.30 ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`);

  // ── State fills ───────────────────────────────────────────────────────────
  setVar('--color-text-danger',       semanticColors.error);
  setVar('--color-bg-fill-danger',    `oklch(from ${semanticColors.error} l c h / 0.1)`);
  setVar('--color-text-warning',      semanticColors.warning);
  setVar('--color-bg-fill-warning',   `oklch(from ${semanticColors.warning} l c h / 0.1)`);
  setVar('--color-text-success',      semanticColors.success);
  setVar('--color-bg-fill-success',   `oklch(from ${semanticColors.success} l c h / 0.1)`);
  setVar('--color-text-info',         semanticColors.info);

  // ── Typography ────────────────────────────────────────────────────────────
  setVar('--font-heading', `"${config.typography.headingFamily}", sans-serif`);
  setVar('--font-body',    `"${config.typography.bodyFamily}", sans-serif`);
  setVar('--font-weight-heading', String(config.typography.headingWeight));
  setVar('--font-weight-body',    String(config.typography.bodyWeight));

  Object.entries(typography).forEach(([key, value]) => {
    setVar(`--text-${key}`, value);
  });

  // ── Spacing ───────────────────────────────────────────────────────────────
  Object.entries(spacing).forEach(([mult, value]) => {
    setVar(`--space-${mult}`, value);
  });

  // ── Surface ───────────────────────────────────────────────────────────────
  setVar('--radius-component-sm',   surface.radiusSm);
  setVar('--radius-component-md',   surface.radiusMd);
  setVar('--radius-component-lg',   surface.radiusLg);
  setVar('--radius-component-full', surface.radiusFull);
  setVar('--shadow-sm', surface.shadowSm);
  setVar('--shadow-md', surface.shadowMd);
  setVar('--shadow-lg', surface.shadowLg);
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: errors in components that still reference old var names — that's expected, they'll be fixed next.

**Step 3: Commit**

```bash
git add lib/token-applier.ts
git commit -m "feat(tokens): rename all semantic CSS vars to element/variant/state convention"
```

---

### Task 4: Update `globals.css` seed values

**Files:**
- Modify: `app/globals.css`

**Step 1: Replace the `:root` token seeds block (lines 81–116)**

Replace the `/* ── Our token system seeds ── */` block with:

```css
  /* ── Our token system seeds (JS overwrites these at runtime) ── */
  --color-bg:                  oklch(0.08 0 0);
  --color-bg-surface-primary:  oklch(0.12 0 0);

  --color-text-primary:        oklch(0.96 0.005 264);
  --color-text-secondary:      oklch(0.55 0.005 264);
  --color-text-tertiary:       oklch(0.35 0 0);
  --color-text-inverse:        oklch(0.97 0.01 264);

  --color-bg-fill-primary:         oklch(0.55 0.22 264);
  --color-bg-fill-primary-hover:   oklch(0.47 0.20 264);
  --color-bg-fill-primary-active:  oklch(0.40 0.18 264);
  --color-bg-fill-secondary:       oklch(0.15 0 0);
  --color-bg-fill-secondary-hover: oklch(0.20 0 0);
  --color-bg-fill-accent:          oklch(0.70 0.18 85);
  --color-bg-fill-accent-hover:    oklch(0.62 0.18 85);

  --color-border-primary:   oklch(0.20 0 0);
  --color-border-secondary: oklch(0.30 0 0);

  --color-text-danger:     oklch(0.58 0.22 27);
  --color-bg-fill-danger:  oklch(0.58 0.22 27 / 0.10);
  --color-text-warning:    oklch(0.78 0.18 85);
  --color-bg-fill-warning: oklch(0.78 0.18 85 / 0.10);
  --color-text-success:    oklch(0.60 0.18 150);
  --color-bg-fill-success: oklch(0.60 0.18 150 / 0.10);
  --color-text-info:       oklch(0.60 0.18 234);

  --font-heading:        "Playfair Display", serif;
  --font-body:           "Inter", sans-serif;
  --font-weight-heading: 700;
  --font-weight-body:    400;

  --text-h1:      61.04px;
  --text-h2:      48.83px;
  --text-h3:      39.06px;
  --text-h4:      31.25px;
  --text-h5:      25.00px;
  --text-h6:      20.00px;
  --text-bodyLg:  20.00px;
  --text-body:    16.00px;
  --text-bodySm:  12.80px;
  --text-caption: 10.24px;

  --radius-component-sm:   4px;
  --radius-component-md:   8px;
  --radius-component-lg:   12px;
  --radius-component-full: 9999px;

  --shadow-sm: 0 1px 3px oklch(0 0 0 / 0.08);
  --shadow-md: 0 4px 8px oklch(0 0 0 / 0.08);
  --shadow-lg: 0 8px 24px oklch(0 0 0 / 0.08);
```

**Step 2: Update `@layer base` body styles**

Change:

```css
body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);        /* was --color-fg */
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

And the `*` rule:

```css
* {
  box-sizing: border-box;
  border-color: var(--color-border-primary);  /* was --color-border-var */
}
```

**Step 3: Start dev server and verify the page loads without visual breakage**

```bash
cd /Users/caioogata/Projects/style-system-creator && npm run dev -- --port 3002
```

Expected: page loads, fonts visible, layout intact (some colors may still be wrong — that's fine, components haven't been updated yet).

**Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(tokens): update globals.css seeds to new token naming convention"
```

---

### Task 5: Update `TopBar.tsx`

**Files:**
- Modify: `components/layout/TopBar.tsx`

**Step 1: Replace hardcoded background**

Line ~33: change `backgroundColor: 'oklch(0.08 0 0)'` → `backgroundColor: 'var(--color-bg)'`

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | grep TopBar
```

Expected: no output (clean).

**Step 3: Commit**

```bash
git add components/layout/TopBar.tsx
git commit -m "fix(topbar): use --color-bg token instead of hardcoded value"
```

---

### Task 6: Update `TypographyPreview.tsx`

**Files:**
- Modify: `components/preview/sections/TypographyPreview.tsx`

**Step 1: Replace all hardcoded values**

| Line (approx) | Old value | New value |
|---|---|---|
| section `backgroundColor` | `'oklch(0.08 0 0)'` | `'var(--color-bg)'` |
| section letter "A" `color` | `'oklch(0.20 0 0)'` | `'var(--color-border-primary)'` |
| "font:", "for:", "specification:" labels | `'oklch(0.35 0 0)'` | `'var(--color-text-tertiary)'` |

There are 3 occurrences of `'oklch(0.35 0 0)'` (one per column header in both font rows — search and replace all).

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | grep Typography
```

Expected: no output.

**Step 3: Commit**

```bash
git add components/preview/sections/TypographyPreview.tsx
git commit -m "fix(typography-preview): replace hardcoded oklch values with semantic tokens"
```

---

### Task 7: Update `ColorSwatchPreview.tsx`

**Files:**
- Modify: `components/preview/sections/ColorSwatchPreview.tsx`

**Step 1: Replace hardcoded background**

Line ~57: change `backgroundColor: 'oklch(0.08 0 0)'` → `backgroundColor: 'var(--color-bg)'`

**Step 2: Add `tertiary` to `COLOR_NAMES` and `COLOR_LABELS`**

```ts
const COLOR_NAMES = ['primary', 'secondary', 'accent', 'neutral', 'tertiary'] as const;
const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  neutral: 'Neutral',
  tertiary: 'Tertiary',
};
```

**Step 3: Update the main color blocks section**

The large color blocks loop currently uses `COLOR_NAMES.slice(0, 4)`. Change to `slice(0, 5)` — or remove the slice entirely since we now want all 5 shown. Check that the flex layout still looks good with 5 items (the first item has `flex: 2.5`, others `flex: 1`).

```tsx
{COLOR_NAMES.map((name, colorIdx) => {
  // ...
  flex: colorIdx === 0 ? '2.5' : '1',
  // ...
})}
```

**Step 4: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | grep ColorSwatch
```

Expected: no output.

**Step 5: Commit**

```bash
git add components/preview/sections/ColorSwatchPreview.tsx
git commit -m "feat(color-preview): add tertiary swatch and replace hardcoded bg"
```

---

### Task 8: Update `SurfacePreview.tsx`

**Files:**
- Modify: `components/preview/sections/SurfacePreview.tsx`

**Step 1: Replace all hardcoded values**

| Old | New |
|---|---|
| `backgroundColor: 'oklch(0.08 0 0)'` (section) | `backgroundColor: 'var(--color-bg)'` |
| `color: 'oklch(0.20 0 0)'` (section letter "C") | `color: 'var(--color-border-primary)'` |
| `borderRadius: 'var(--radius-token-lg)'` (cards) | `borderRadius: 'var(--radius-component-lg)'` |
| `borderRadius: 'var(--radius-token-md)'` (small box) | `borderRadius: 'var(--radius-component-md)'` |
| `boxShadow: 'var(--shadow-token-md)'` | `boxShadow: 'var(--shadow-md)'` |
| `boxShadow: 'var(--shadow-token-lg)'` | `boxShadow: 'var(--shadow-lg)'` |

Search for all occurrences of `radius-token` and `shadow-token` in this file and replace.

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | grep SurfacePreview
```

Expected: no output.

**Step 3: Commit**

```bash
git add components/preview/sections/SurfacePreview.tsx
git commit -m "fix(surface-preview): replace hardcoded values with semantic tokens"
```

---

### Task 9: Update `ColorOverlayPanel.tsx` — add tertiary picker

**Files:**
- Modify: `components/overlay/panels/ColorOverlayPanel.tsx`

**Step 1: Add `tertiary` to `COLOR_META`**

```ts
const COLOR_META: Record<keyof PrimitiveColors, { label: string; description: string }> = {
  primary:   { label: 'Primary',   description: 'CTAs, buttons, interactive elements' },
  secondary: { label: 'Secondary', description: 'Text, typography, readable content' },
  accent:    { label: 'Accent',    description: 'Highlights, badges, decorative elements' },
  neutral:   { label: 'Neutral',   description: 'Backgrounds, borders, surfaces' },
  tertiary:  { label: 'Tertiary',  description: 'Dim labels, captions, decorative text' }, // ← add
};
```

No other changes needed — the panel already works generically via `colorKey: keyof PrimitiveColors`.

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | grep ColorOverlay
```

Expected: no output.

**Step 3: Commit**

```bash
git add components/overlay/panels/ColorOverlayPanel.tsx
git commit -m "feat(color-overlay): add tertiary color picker"
```

---

### Task 10: Full TypeScript check + visual verification

**Step 1: Full type check**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit
```

Expected: zero errors.

**Step 2: Grep for any remaining hardcoded oklch values in components**

```bash
grep -r "oklch" /Users/caioogata/Projects/style-system-creator/components --include="*.tsx" -n
```

Expected: only `ColorOverlayPanel.tsx` (intentional — dynamic contrast logic for the picker UI itself).

**Step 3: Grep for remaining radius-token or shadow-token references**

```bash
grep -r "radius-token\|shadow-token" /Users/caioogata/Projects/style-system-creator/components --include="*.tsx" -n
```

Expected: no output.

**Step 4: Start dev server and verify visually**

```bash
cd /Users/caioogata/Projects/style-system-creator && npm run dev -- --port 3002
```

Checklist:
- [ ] Page background changes when Neutral color is modified
- [ ] Text color changes when Secondary color is modified
- [ ] Buttons/CTAs change when Primary color is modified
- [ ] Tertiary color picker appears in color overlay alongside the other 4
- [ ] Dim labels ("font:", "for:", "specification:") use `--color-text-tertiary` and update live
- [ ] Radius/shadow cards in SurfacePreview update when surface settings change

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore(tokens): verify semantic token alignment complete"
```

---

### Task 11: Update MEMORY.md

**Files:**
- Modify: `/Users/caioogata/.claude/projects/-Users-caioogata-Projects-style-system-creator/memory/MEMORY.md`

Update the **CSS Variable Naming Convention** and **Semantic Token Mapping** sections to reflect the new names. Key entries to update:

- Replace all old token names in `## CSS Variable Naming Convention`
- Replace all old token names in `## Semantic Token Mapping (dark mode only)`
- Add `tertiary` to the **Implemented Features** list
- Note: always use design-system skill for token decisions in this project

```bash
git add memory/ 2>/dev/null || true
```

(Memory file is outside the repo — no commit needed.)
