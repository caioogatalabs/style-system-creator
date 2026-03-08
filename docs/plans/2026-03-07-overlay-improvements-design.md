# Overlay Improvements Design

**Date:** 2026-03-07
**Status:** Approved

## Goal

Four improvements to the overlay editing panels: (1) Apply/staging pattern so changes only commit on explicit confirm, (2) deep-link navigation so clicking a preview element opens the correct tab, (3) live scale table in the typography overlay, (4) numeric radius with slider in the surface overlay.

---

## Feature 1: Apply + Staging Pattern

Each overlay panel gets local draft state initialized from `config` on mount. All controls update the local draft only — the preview inside the overlay reflects the draft, the page behind does not change.

**Footer bar (new, fixed at bottom of each panel):**
```
[ Cancel ]                              [ Apply → ]
```

- **Apply**: dispatches the draft patch to global config → closes overlay
- **Cancel button / X in top bar / ESC**: discards draft → closes overlay (no confirmation dialog)

`OverlayPanel.tsx` does not change — the X calls `closeOverlay()` which is already the discard behavior. Each panel owns its footer.

**Panels affected:** `TypographyOverlayPanel`, `SurfaceOverlayPanel`, `ColorOverlayPanel`

---

## Feature 2: Deep-Link Navigation (Click → Correct Tab)

### OverlayContext payload expansion

```ts
type OverlayPayload =
  | { colorKey: string }
  | { target?: 'heading' | 'body' }
  | { tab?: 'radius' | 'elevation' | 'borders' | 'card' }
  | null;
```

### Preview components pass initial context

- `TypographyPreview.tsx`: clicking heading area → `openOverlay({ type: 'typography', payload: { target: 'heading' } })`, body area → `{ target: 'body' }`
- `SurfacePreview.tsx`: clicking each zone → `openOverlay({ type: 'surface', payload: { tab: 'radius' } })` etc.

### Overlays read initial state from payload

```ts
// TypographyOverlayPanel
const [activeTarget, setActiveTarget] = useState(payload?.target ?? 'heading');

// SurfaceOverlayPanel
const [activeTab, setActiveTab] = useState(payload?.tab ?? 'radius');
```

---

## Feature 3: Live Scale Table in Typography Overlay

Below the base size slider, add a compact two-column table of all derived sizes, calculated inline from the draft values (no engine call needed):

```
step(n) = baseSize * ratio^n

H1       61px
H2       49px
H3       39px
H4       31px
H5       25px
H6       20px
Body LG  20px
Body     16px
Body SM  13px
Caption  10px
```

Table updates live as the user drags the base size slider or selects a different scale ratio. Values come from `localTypography.baseSize` and `localTypography.scaleRatio`.

---

## Feature 4: Surface Radius — Numeric with Slider

### Type change

`surface.radius: RadiusPreset` → `surface.radius: number` (px integer)

`RadiusPreset` type is removed from `types/tokens.ts`.

### Chip presets (shortcuts)

| Chip  | Sets value |
|-------|------------|
| None  | 0          |
| Small | 4          |
| Med   | 8          |
| Large | 16         |
| Full  | 9999       |

Chip highlights when current value matches exactly.

### Slider

Range 0–32px, step 1, full width below the chips. Shows current px value. Dragging deselects any matching chip (or highlights the matching one if it lands on a preset).

### Engine derivation

```ts
if (radius === 9999) → sm = md = lg = '9999px'
else:
  sm = Math.round(radius * 0.5) + 'px'
  md = radius + 'px'
  lg = Math.round(radius * 1.5) + 'px'
radiusFull = '9999px' (always)
```

### Default config

`radius: 8` (equivalent to previous 'md')

### URL serialization

`params.set('r', String(config.surface.radius))` — stored as number string.
`deserialize`: `Number(params.get('r'))` with fallback to `8`. Must validate: `isFinite(n) && n >= 0`.

---

## Files Impacted

| File | Change |
|---|---|
| `types/tokens.ts` | Remove `RadiusPreset`, `surface.radius: number` |
| `lib/token-engine.ts` | `resolveSurfaceTokens` accepts `number`, derives proportionally |
| `lib/default-config.ts` | `radius: 8` |
| `lib/url-serializer.ts` | Serialize/deserialize radius as number, remove `VALID_RADIUS` |
| `context/OverlayContext.tsx` | Expand payload union type |
| `components/preview/sections/TypographyPreview.tsx` | Pass `target` in payload |
| `components/preview/sections/SurfacePreview.tsx` | Pass `tab` in payload |
| `components/overlay/panels/TypographyOverlayPanel.tsx` | Local draft + footer + scale table + read payload |
| `components/overlay/panels/SurfaceOverlayPanel.tsx` | Local draft + footer + slider + read payload |
| `components/overlay/panels/ColorOverlayPanel.tsx` | Local draft + footer |

## Out of Scope (Next Cycle)

Manual per-step typography editing (H1, H2... individually) on the `/typography` internal page. Requires changes to `TypeScale` storage in `TokenConfig` and the derivation pipeline.
