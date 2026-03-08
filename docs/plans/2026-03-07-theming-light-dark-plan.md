# Light/Dark Theming Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `theme: 'light' | 'dark'` to `TokenConfig` so the entire app — UI and preview — switches via a single toggle in the TopBar, with the theme serialized in the URL.

**Architecture:** `computeTokenVars` reads `config.theme` and picks from a `THEME_L` map to produce the correct semantic lightness values. All vars are written as inline styles on `:root` (existing pattern). `applyTokensToDOM` also sets `data-theme` on `<html>` so CSS fallbacks and future CSS-only consumers stay in sync. No component in the preview or overlay layer changes.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, CSS custom properties (oklch), lucide-react icons.

---

## Important Context

- `url-serializer.ts` already uses `'t'` for the tertiary color. Use `'th'` for theme.
- `useTokenConfig()` returns only `config`. Use `useTokenConfigContext()` (from `context/TokenConfigContext.tsx`) when you need `dispatch` too.
- All semantic vars (`--color-bg`, `--color-text-primary`, etc.) are already consumed via CSS vars in all components — **no component files need to change**.
- There are no automated tests in this project. Verification is: `npx tsc --noEmit` (TypeScript compile) + dev server smoke test in browser.
- Default theme stays `'dark'` to preserve current behavior.

---

### Task 1: Add `theme` to types

**Files:**
- Modify: `types/tokens.ts`

**Step 1: Add the theme field and action**

In `types/tokens.ts`, add `theme: 'light' | 'dark'` to `TokenConfig` and `SET_THEME` to `TokenAction`:

```ts
export interface TokenConfig {
  colors: PrimitiveColors;
  typography: TypographyConfig;
  surface: {
    radius: RadiusPreset;
    elevation: ElevationLevel;
  };
  spacing: { baseUnit: number };
  theme: 'light' | 'dark';   // ADD THIS LINE
}

export type TokenAction =
  | { type: 'SET_COLOR'; key: keyof PrimitiveColors; value: string }
  | { type: 'SET_TYPOGRAPHY'; patch: Partial<TypographyConfig> }
  | { type: 'SET_SURFACE'; patch: Partial<TokenConfig['surface']> }
  | { type: 'SET_SPACING'; patch: Partial<TokenConfig['spacing']> }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }   // ADD THIS LINE
  | { type: 'LOAD_CONFIG'; config: TokenConfig }
  | { type: 'RESET' };
```

**Step 2: Verify TypeScript catches usages**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: errors about `DEFAULT_TOKEN_CONFIG` missing `theme` (Task 2 will fix these). That's fine — proceed.

---

### Task 2: Add default theme to `DEFAULT_TOKEN_CONFIG`

**Files:**
- Modify: `lib/default-config.ts`

**Step 1: Add `theme: 'dark'`**

```ts
export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    neutral: '#64748b',
    tertiary: '#4a5568',
  },
  typography: {
    headingFamily: 'Playfair Display',
    bodyFamily: 'Inter',
    baseSize: 16,
    scaleRatio: 1.25,
    headingWeight: 700,
    bodyWeight: 400,
  },
  surface: {
    radius: 'md',
    elevation: 'subtle',
  },
  spacing: {
    baseUnit: 4,
  },
  theme: 'dark',   // ADD THIS LINE
};
```

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: errors should now only be in `compute-token-vars.ts` and `context/TokenConfigContext.tsx` (Tasks 3 and 5). Proceed.

**Step 3: Commit**

```bash
git add types/tokens.ts lib/default-config.ts
git commit -m "feat(theme): add theme field to TokenConfig and TokenAction"
```

---

### Task 3: Make `computeTokenVars` theme-aware

**Files:**
- Modify: `lib/compute-token-vars.ts`

This is the core change. Replace the 7 hardcoded L values with a `THEME_L` lookup table.

**Step 1: Add the THEME_L map at the top of the file (after imports)**

```ts
const THEME_L = {
  dark: {
    bg: 0.08,
    surface: 0.12,
    textPrimary: 0.95,
    textSecondary: 0.55,
    textTertiary: 0.35,
    border: 0.20,
    borderSub: 0.30,
  },
  light: {
    bg: 0.99,
    surface: 0.96,
    textPrimary: 0.10,
    textSecondary: 0.45,
    textTertiary: 0.55,
    border: 0.88,
    borderSub: 0.82,
  },
} as const;
```

**Step 2: Add `const l = THEME_L[config.theme];` right before the `// ── Backgrounds` section**

```ts
const l = THEME_L[config.theme];
```

**Step 3: Replace the 7 hardcoded L values in the Backgrounds, Text, and Borders sections**

Replace:
```ts
vars['--color-bg']                 = `oklch(0.08 ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`;
vars['--color-bg-surface-primary'] = `oklch(0.12 ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`;

vars['--color-text-primary']   = `oklch(0.95 ${fgChroma.toFixed(4)} ${secondaryH.toFixed(1)})`;
vars['--color-text-secondary'] = `oklch(0.55 ${fgMutedChroma.toFixed(4)} ${secondaryH.toFixed(1)})`;
vars['--color-text-tertiary']  = `oklch(0.35 ${tertiaryChroma.toFixed(4)} ${tertiaryH.toFixed(1)})`;
vars['--color-text-inverse']   = `oklch(0.97 0.01 ${primaryH.toFixed(1)})`;

vars['--color-border-primary']   = `oklch(0.20 ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`;
vars['--color-border-secondary'] = `oklch(0.30 ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`;
```

With:
```ts
vars['--color-bg']                 = `oklch(${l.bg} ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`;
vars['--color-bg-surface-primary'] = `oklch(${l.surface} ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`;

vars['--color-text-primary']   = `oklch(${l.textPrimary} ${fgChroma.toFixed(4)} ${secondaryH.toFixed(1)})`;
vars['--color-text-secondary'] = `oklch(${l.textSecondary} ${fgMutedChroma.toFixed(4)} ${secondaryH.toFixed(1)})`;
vars['--color-text-tertiary']  = `oklch(${l.textTertiary} ${tertiaryChroma.toFixed(4)} ${tertiaryH.toFixed(1)})`;
vars['--color-text-inverse']   = `oklch(0.97 0.01 ${primaryH.toFixed(1)})`;

vars['--color-border-primary']   = `oklch(${l.border} ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`;
vars['--color-border-secondary'] = `oklch(${l.borderSub} ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`;
```

Note: `--color-text-inverse` stays hardcoded at `0.97` — it's always a near-white value for text on filled buttons regardless of theme.

**Step 4: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors in `compute-token-vars.ts`.

**Step 5: Commit**

```bash
git add lib/compute-token-vars.ts
git commit -m "feat(theme): replace hardcoded dark L values with THEME_L map"
```

---

### Task 4: Set `data-theme` attribute on `<html>` from `applyTokensToDOM`

**Files:**
- Modify: `lib/token-applier.ts`

The `applyTokensToDOM` function already has access to `config`. Add one line to keep `data-theme` in sync with the active theme. This enables CSS fallbacks and future CSS-only consumers to work correctly.

**Step 1: Add the attribute set**

```ts
export function applyTokensToDOM(resolved: ResolvedTokens, config: TokenConfig): void {
  document.documentElement.setAttribute('data-theme', config.theme);   // ADD THIS LINE
  const vars = computeTokenVars(resolved, config);
  Object.entries(vars).forEach(([name, value]) => setVar(name, value));
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: clean.

**Step 3: Commit**

```bash
git add lib/token-applier.ts
git commit -m "feat(theme): sync data-theme attribute on html from applyTokensToDOM"
```

---

### Task 5: Add `data-theme` to `<html>` in layout (SSR)

**Files:**
- Modify: `app/layout.tsx`

The server needs to set `data-theme` on initial render so there's no attribute mismatch flash. Since the client will update it via `applyTokensToDOM`, add `suppressHydrationWarning` to `<html>`.

**Step 1: Update the `<html>` tag**

```tsx
<html lang="en" data-theme="dark" suppressHydrationWarning>
```

Note: hardcode `"dark"` here because `DEFAULT_TOKEN_CONFIG.theme` is always `'dark'` and the layout is a server component that can't read URL params at this level. URLs with `th=light` will be corrected immediately after hydration by `URLConfigLoader`.

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: clean.

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(theme): add data-theme attribute to html element for SSR"
```

---

### Task 6: Add `SET_THEME` to the reducer

**Files:**
- Modify: `context/TokenConfigContext.tsx`

**Step 1: Add the case to `tokenReducer`**

Add after the `SET_SPACING` case:

```ts
case 'SET_THEME':
  return { ...state, theme: action.theme };
```

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: clean.

**Step 3: Commit**

```bash
git add context/TokenConfigContext.tsx
git commit -m "feat(theme): add SET_THEME case to token reducer"
```

---

### Task 7: Serialize/deserialize theme in URL

**Files:**
- Modify: `lib/url-serializer.ts`

`'t'` is already used for tertiary color. Use `'th'` for theme. Default `'dark'` is omitted from the URL to keep links short — deserializer falls back to `'dark'` when absent.

**Step 1: Update `serializeConfig`**

Add after `params.set('el', config.surface.elevation);`:

```ts
if (config.theme !== 'dark') params.set('th', config.theme);
```

**Step 2: Update `deserializeConfig` return value**

Add `theme` field to the returned object:

```ts
const VALID_THEMES = ['light', 'dark'] as const;
type ThemeValue = typeof VALID_THEMES[number];

// inside deserializeConfig, before the return:
const themeParam = params.get('th');
const theme: ThemeValue = (themeParam && VALID_THEMES.includes(themeParam as ThemeValue))
  ? (themeParam as ThemeValue)
  : 'dark';
```

Add `theme` to the returned object:

```ts
return {
  colors: { ... },
  typography: { ... },
  surface: { ... },
  spacing: def.spacing,
  theme,   // ADD THIS LINE
};
```

**Step 3: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: clean.

**Step 4: Commit**

```bash
git add lib/url-serializer.ts
git commit -m "feat(theme): serialize theme as 'th' param in URL (dark omitted by default)"
```

---

### Task 8: Update CSS fallbacks in `globals.css`

**Files:**
- Modify: `app/globals.css`

The `:root` block currently has dark fallbacks. Change it so `:root` has light fallbacks (web default), and add a `[data-theme="dark"]` block that overrides with dark values. These are only fallbacks — JS overwrites them at runtime — but they matter for initial paint and for any future CSS-only usage.

**Step 1: Replace the token seeds section in `:root` (lines 52–133)**

Replace the current `:root` block with these two blocks. Keep everything above (the `@theme inline` block) and below (the `@layer base` block) exactly as they are. Only replace the "shadcn token seeds" section:

```css
/* ── shadcn token seeds (light fallbacks — JS overwrites these at runtime) ── */
:root {
  --background: oklch(0.99 0 0);
  --foreground: oklch(0.10 0.005 264);
  --card: oklch(0.96 0 0);
  --card-foreground: oklch(0.10 0.005 264);
  --popover: oklch(0.96 0 0);
  --popover-foreground: oklch(0.10 0.005 264);
  --primary: oklch(0.55 0.22 264);
  --primary-foreground: oklch(0.97 0.01 264);
  --secondary: oklch(0.92 0 0);
  --secondary-foreground: oklch(0.10 0.005 264);
  --muted: oklch(0.94 0 0);
  --muted-foreground: oklch(0.45 0.005 264);
  --accent: oklch(0.93 0 0);
  --accent-foreground: oklch(0.10 0.005 264);
  --destructive: oklch(0.58 0.22 27);
  --border: oklch(0.88 0 0);
  --input: oklch(0.82 0 0);
  --ring: oklch(0.55 0.22 264);
  --radius: 0.5rem;
  --sidebar: oklch(0.96 0 0);
  --sidebar-foreground: oklch(0.10 0 0);
  --sidebar-primary: oklch(0.55 0.22 264);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.92 0 0);
  --sidebar-accent-foreground: oklch(0.10 0 0);
  --sidebar-border: oklch(0.88 0 0);
  --sidebar-ring: oklch(0.55 0.22 264);

  /* ── Our token system seeds (JS overwrites these at runtime) ── */
  --color-bg:                  oklch(0.99 0 0);
  --color-bg-surface-primary:  oklch(0.96 0 0);

  --color-text-primary:        oklch(0.10 0.005 264);
  --color-text-secondary:      oklch(0.45 0.005 264);
  --color-text-tertiary:       oklch(0.55 0 0);
  --color-text-inverse:        oklch(0.97 0.01 264);

  --color-bg-fill-primary:         oklch(0.55 0.22 264);
  --color-bg-fill-primary-hover:   oklch(0.47 0.20 264);
  --color-bg-fill-primary-active:  oklch(0.40 0.18 264);
  --color-bg-fill-secondary:       oklch(0.55 0 0);
  --color-bg-fill-secondary-hover: oklch(0.50 0 0);
  --color-bg-fill-accent:          oklch(0.70 0.18 85);
  --color-bg-fill-accent-hover:    oklch(0.62 0.18 85);

  --color-border-primary:   oklch(0.88 0 0);
  --color-border-secondary: oklch(0.82 0 0);

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
}

/* ── Dark theme overrides ── */
[data-theme="dark"] {
  --background: oklch(0.08 0 0);
  --foreground: oklch(0.96 0.005 264);
  --card: oklch(0.11 0 0);
  --card-foreground: oklch(0.96 0.005 264);
  --popover: oklch(0.12 0 0);
  --popover-foreground: oklch(0.96 0.005 264);
  --primary: oklch(0.55 0.22 264);
  --primary-foreground: oklch(0.97 0.01 264);
  --secondary: oklch(0.15 0 0);
  --secondary-foreground: oklch(0.96 0.005 264);
  --muted: oklch(0.14 0 0);
  --muted-foreground: oklch(0.55 0.005 264);
  --accent: oklch(0.16 0 0);
  --accent-foreground: oklch(0.96 0.005 264);
  --destructive: oklch(0.58 0.22 27);
  --border: oklch(0.20 0 0);
  --input: oklch(0.20 0 0);
  --ring: oklch(0.55 0.22 264);
  --sidebar: oklch(0.10 0 0);
  --sidebar-foreground: oklch(0.96 0 0);
  --sidebar-primary: oklch(0.55 0.22 264);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.15 0 0);
  --sidebar-accent-foreground: oklch(0.96 0 0);
  --sidebar-border: oklch(0.20 0 0);
  --sidebar-ring: oklch(0.55 0.22 264);

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
}
```

Also update the scrollbar thumb colors (currently hardcoded dark values). They should adapt:

```css
::-webkit-scrollbar-thumb { background: oklch(0.75 0 0); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: oklch(0.65 0 0); }
[data-theme="dark"] ::-webkit-scrollbar-thumb { background: oklch(0.25 0 0); }
[data-theme="dark"] ::-webkit-scrollbar-thumb:hover { background: oklch(0.35 0 0); }
```

**Step 2: Verify TypeScript and build**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(theme): add light defaults to :root and dark overrides to [data-theme=dark]"
```

---

### Task 9: Add theme toggle to TopBar

**Files:**
- Modify: `components/layout/TopBar.tsx`

Add a sun/moon toggle button in the actions area, left of the Share button. Uses `useTokenConfigContext` to get both `config` and `dispatch`.

**Step 1: Replace the TopBar file content**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Share2, Sun, Moon } from 'lucide-react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { serializeConfig } from '@/lib/url-serializer';

const NAV_ITEMS = [
  { href: '/', label: 'Overview' },
  { href: '/typography', label: 'Typography' },
  { href: '/colors', label: 'Colors' },
  { href: '/components', label: 'Components' },
];

export function TopBar() {
  const pathname = usePathname();
  const { config, dispatch } = useTokenConfigContext();

  function handleShare() {
    const params = serializeConfig(config);
    const url = `${window.location.origin}/?${params.toString()}`;
    navigator.clipboard.writeText(url);
  }

  function handleToggleTheme() {
    dispatch({ type: 'SET_THEME', theme: config.theme === 'dark' ? 'light' : 'dark' });
  }

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="flex h-14 w-full items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-mono tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Style System
          </span>
          <span style={{ color: 'var(--color-border-primary)' }}>·</span>
          <span
            className="text-xs font-mono tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Creator
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors duration-150"
                style={{
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-4 right-4 h-px"
                    style={{ backgroundColor: 'var(--color-text-primary)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={handleToggleTheme}
            className="flex items-center justify-center rounded p-1.5 transition-colors"
            style={{
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-primary)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
            }}
            title={config.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {config.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded px-3 py-1.5 text-xs tracking-[0.08em] uppercase transition-colors"
            style={{
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-primary)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
            }}
          >
            <Share2 size={12} />
            Share
          </button>
        </div>
      </div>
    </header>
  );
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit 2>&1 | head -40
```

Expected: clean.

**Step 3: Smoke test in browser**

```bash
cd /Users/caioogata/Projects/style-system-creator && npm run dev
```

Open `http://localhost:3002`. Verify:
- App loads in dark mode (default)
- Sun icon visible in TopBar
- Click toggles to light mode (bg becomes near-white, text near-black)
- Moon icon replaces sun
- Click again returns to dark
- Share button copies URL with `th=light` when in light mode, no `th` param when in dark
- Paste the light URL in a new tab — loads in light mode

**Step 4: Final TypeScript check**

```bash
cd /Users/caioogata/Projects/style-system-creator && npx tsc --noEmit
```

Expected: zero errors.

**Step 5: Commit**

```bash
git add components/layout/TopBar.tsx
git commit -m "feat(theme): add light/dark toggle to TopBar"
```

---

## Done

All 9 tasks complete. Theme is:
- Part of `TokenConfig` (serialized in URL as `th=light`, omitted when dark)
- Switched instantly via TopBar toggle
- Applied via inline styles on `:root` (existing pattern)
- Synced to `data-theme` attribute on `<html>` for CSS fallbacks
- SSR-safe (layout sets `data-theme="dark"` server-side, hydration corrects it)
