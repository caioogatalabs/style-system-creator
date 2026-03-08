# Design: Light/Dark Theming

**Date:** 2026-03-07
**Status:** Approved

## Goal

Add light/dark theme support to the style-system-creator. The entire app — tool UI and preview — switches via a single toggle. The theme is part of the serializable `TokenConfig` (included in the shareable URL). Default remains `dark`.

## Approach: `data-theme` attribute on `<html>`

Theme is a field in `TokenConfig`. `computeTokenVars` reads `config.theme` and applies the correct semantic lightness values. The `<html>` element carries a `data-theme` attribute for CSS context. All vars are written as inline styles (existing pattern), so switching is instant — just a state update triggering a re-apply.

No component changes required. The naming convention (`--color-bg`, `--color-text-primary`) is already semantic and theme-agnostic.

## Semantic Lightness Maps

```ts
const THEME_L = {
  dark: {
    bg: 0.08, surface: 0.12,
    textPrimary: 0.95, textSecondary: 0.55, textTertiary: 0.35,
    border: 0.20, borderSub: 0.30,
  },
  light: {
    bg: 0.99, surface: 0.96,
    textPrimary: 0.10, textSecondary: 0.45, textTertiary: 0.55,
    border: 0.88, borderSub: 0.82,
  },
};
```

## Data Flow

```
TokenConfig.theme ('light' | 'dark')
  → computeTokenVars(resolved, config)   // reads config.theme, uses THEME_L
  → applyTokensToDOM                     // no change
  → inline styles on :root              // no change
```

Toggle in TopBar dispatches `SET_THEME` → reducer updates `config.theme` → `TokenApplierBridge` calls `applyTokensToDOM` → vars update instantly.

## Files Changed

| File | Change |
|---|---|
| `types/tokens.ts` | Add `theme: 'light' \| 'dark'` to `TokenConfig`. Add `SET_THEME` to `TokenAction`. |
| `lib/default-config.ts` | Add `theme: 'dark'`. |
| `lib/compute-token-vars.ts` | Add `THEME_L` map. Read `config.theme`. Replace hardcoded L values. |
| `lib/token-css-server.ts` | No signature change — already receives `config`. Works automatically. |
| `lib/url-serializer.ts` | Add `th` param (`th=dark` / `th=light`). |
| `app/globals.css` | `:root` fallbacks become light defaults. Add `[data-theme="dark"]` block for dark fallbacks. |
| `app/layout.tsx` | `<html data-theme="dark">` + `suppressHydrationWarning`. |
| `context/TokenConfigContext.tsx` | Add `SET_THEME` case to reducer. |
| `components/layout/TopBar` | Add sun/moon icon toggle that dispatches `SET_THEME`. |

**Total: ~9 files. No preview or overlay components touched.**

## What Does NOT Change

- `lib/token-engine.ts` — color scale engine is theme-agnostic
- All preview sections (`ColorSwatchPreview`, `TypographyPreview`, `SurfacePreview`)
- All overlay panels
- shadcn bridge (already uses semantic vars as sources)
- Fill colors (p[5], p[6], p[7]) — saturated mids work for both modes
- Shadows — use black at opacity, fine for both modes
- Typography, spacing, radius tokens — fully theme-agnostic

## SSR / No-Flash Strategy

`generateInitialStyles(DEFAULT_TOKEN_CONFIG)` already injects a `<style>` block into `<head>` before paint. Since `config.theme` will be `'dark'` by default, the L values in that block are correct for dark mode. The `<html data-theme="dark">` attribute is set server-side. After hydration, if the URL carries `th=light`, `URLConfigLoader` dispatches `LOAD_CONFIG` with the light theme — `applyTokensToDOM` rewrites all vars. Flash is negligible (same hydration window as existing config from URL).

## URL Serialization

Add `th` to the URL params alongside existing color/typography/surface params.

```
?p=%236366f1&s=%238b5cf6&...&th=light
```

Default (`dark`) can be omitted from the URL to keep links short; deserializer defaults to `'dark'` when absent.

## Toggle UI

- Location: TopBar, right side, near the share button
- Component: icon button (sun icon for light, moon icon for dark)
- On click: `dispatch({ type: 'SET_THEME', theme: config.theme === 'dark' ? 'light' : 'dark' })`
- No animation required; transition is near-instant via CSS vars
