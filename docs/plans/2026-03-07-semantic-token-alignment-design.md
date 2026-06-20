# Design: Semantic Token Alignment

**Date:** 2026-03-07
**Status:** Approved

## Problem

The project has two interconnected issues:

1. **Hardcoded color values** — Components use literal `oklch()` values (e.g. `oklch(0.08 0 0)`)
   instead of CSS custom properties, so color changes made by the user never reflect in the UI.

2. **Wrong token naming** — Existing CSS vars don't follow the design-system skill convention
   (`--[category]-[element]-[variant]-[state]`), making semantic intent ambiguous and the system
   hard to scale.

Typography already works correctly because it uses `var(--font-heading)` / `var(--font-body)`.
Colors need the same treatment.

## Semantic Convention

Every token follows: `--[category]-[element]-[variant]-[state]`

- **element**: `bg`, `text`, `border`, `icon`, `shadow`
- **variant**: `surface`, `fill`, `primary`, `secondary`, `tertiary`, `inverse`, `brand`, `danger`, `warning`, `success`, `info`, `accent`
- **state**: omit for default, or `hover`, `active`, `disabled`

Rule: UI element / Priority / State. Semantics are for humans — the hierarchy of components and
elements does not change.

## Token Rename Map

### Backgrounds

| Old | New |
|-----|-----|
| `--color-bg` | `--color-bg` ✓ |
| `--color-bg-subtle` | `--color-bg-surface-primary` |

### Text

| Old | New |
|-----|-----|
| `--color-fg` | `--color-text-primary` |
| `--color-fg-muted` | `--color-text-secondary` |
| *(none)* | `--color-text-tertiary` ← new primitive |
| `--color-primary-fg` / `--color-primary-fg-var` | `--color-text-inverse` |
| `--color-secondary-fg` | `--color-text-inverse` |
| `--color-accent-fg` | `--color-text-inverse` |

### Fills (interactive elements)

| Old | New |
|-----|-----|
| `--color-primary` / `--color-primary-var` | `--color-bg-fill-primary` |
| `--color-primary-hover` / `--color-primary-hover-var` | `--color-bg-fill-primary-hover` |
| `--color-primary-active` | `--color-bg-fill-primary-active` |
| `--color-secondary` | `--color-bg-fill-secondary` |
| `--color-secondary-hover` | `--color-bg-fill-secondary-hover` |
| `--color-accent` | `--color-bg-fill-accent` |
| `--color-accent-hover` | `--color-bg-fill-accent-hover` |

### Borders

| Old | New |
|-----|-----|
| `--color-border-var` / `--color-border` | `--color-border-primary` |
| `--color-border-strong` | `--color-border-secondary` |

### State colors

| Old | New |
|-----|-----|
| `--color-error` / `--color-error-fg` | `--color-text-danger` |
| `--color-error-bg` | `--color-bg-fill-danger` |
| `--color-warning` | `--color-text-warning` |
| `--color-warning-bg` | `--color-bg-fill-warning` |
| `--color-success` | `--color-text-success` |
| `--color-success-bg` | `--color-bg-fill-success` |
| `--color-info` | `--color-text-info` |

### Radius & Shadow

| Old | New |
|-----|-----|
| `--radius-token-sm/md/lg/full` | `--radius-component-sm/md/lg/full` |
| `--shadow-token-sm/md/lg` | `--shadow-sm/md/lg` |

## New Primitive: `tertiary`

Add `tertiary: string` to `PrimitiveColors`. This is a configurable color the user picks via the
`ColorOverlayPanel` (new picker box alongside primary/secondary/accent/neutral). It maps directly
to `--color-text-tertiary` — used for dim labels, captions, decorative text.

Default: `#4a5568`

The `tertiary` scale is generated like all other colors (11 steps via `generateColorScale`).
`ResolvedColorScales` gains a `tertiary` entry.

## Files to Change

| File | Change |
|------|--------|
| `types/tokens.ts` | Add `tertiary` to `PrimitiveColors`; add `tertiary` to `ResolvedColorScales` |
| `lib/default-config.ts` | Add `tertiary: '#4a5568'` |
| `lib/token-engine.ts` | Include `tertiary` in `generateAllColorScales` |
| `lib/token-applier.ts` | Rename all `setVar` calls to new token names; add `--color-text-tertiary` |
| `app/globals.css` | Rename all CSS var seeds; fix radius/shadow names |
| `context/TokenConfigContext.tsx` | `SET_COLOR` already accepts `keyof PrimitiveColors` — no change needed once type is updated |
| `components/overlay/panels/ColorOverlayPanel.tsx` | Add `tertiary` to `COLOR_META` |
| `components/preview/sections/TypographyPreview.tsx` | Replace all hardcoded `oklch()` with vars |
| `components/preview/sections/ColorSwatchPreview.tsx` | Replace all hardcoded `oklch()` with vars; show tertiary swatch |
| `components/preview/sections/SurfacePreview.tsx` | Replace all hardcoded `oklch()` with vars |
| `components/layout/TopBar.tsx` | Replace hardcoded `oklch(0.08 0 0)` with `var(--color-bg)` |

## Constraints

- The `TokenApplierBridge` already re-runs on every config change — no changes needed there.
- The shadcn `--radius-sm/md/lg` passthroughs in `@theme` are kept as-is (shadcn internal).
  Our custom tokens use `--radius-component-*` to avoid conflict.
- The `--color-border` token written by `token-applier.ts` (legacy alias) is removed; only
  `--color-border-primary` is written.
- All duplicate `-var` suffix variants (`--color-primary-var`, `--color-border-var`) are removed.
  One name per token.

## Success Criteria

- Changing any primitive color in the overlay immediately updates all UI elements that use that color.
- No `oklch()`, `rgb()`, or hex literal appears in any component's inline style (except
  ColorOverlayPanel's dynamic contrast computation, which is intentionally based on the selected color).
- All CSS vars follow `--[category]-[element]-[variant]-[state]` convention.
- `tertiary` color is configurable via the color overlay and reflects on dim text elements.
