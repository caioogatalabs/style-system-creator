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

  const bgChroma      = Math.min(neutralC   * 0.30, 0.008);
  const fgChroma      = Math.min(secondaryC * 0.08, 0.012);
  const fgMutedChroma = Math.min(secondaryC * 0.10, 0.015);
  const borderChroma  = Math.min(neutralC   * 0.40, 0.010);
  const tertiaryChroma = Math.min(tertiaryC * 0.20, 0.020);

  const p = colorScales.primary;
  const s = colorScales.secondary;
  const a = colorScales.accent;

  // ── Backgrounds ───────────────────────────────────────────────────────────
  setVar('--color-bg',                 `oklch(0.08 ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`);
  setVar('--color-bg-surface-primary', `oklch(0.12 ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`);

  // ── Text ──────────────────────────────────────────────────────────────────
  setVar('--color-text-primary',   `oklch(0.95 ${fgChroma.toFixed(4)} ${secondaryH.toFixed(1)})`);
  setVar('--color-text-secondary', `oklch(0.55 ${fgMutedChroma.toFixed(4)} ${secondaryH.toFixed(1)})`);
  setVar('--color-text-tertiary',  `oklch(0.35 ${tertiaryChroma.toFixed(4)} ${tertiaryH.toFixed(1)})`);
  setVar('--color-text-inverse',   `oklch(0.97 0.01 ${primaryH.toFixed(1)})`);

  // ── Fills (interactive elements) ──────────────────────────────────────────
  setVar('--color-bg-fill-primary',         config.colors.primary);
  setVar('--color-bg-fill-primary-hover',   p[6].oklch);
  setVar('--color-bg-fill-primary-active',  p[7].oklch);
  setVar('--color-bg-fill-secondary',       s[5].oklch);
  setVar('--color-bg-fill-secondary-hover', s[6].oklch);
  setVar('--color-bg-fill-accent',          a[5].oklch);
  setVar('--color-bg-fill-accent-hover',    a[6].oklch);

  // ── Borders ───────────────────────────────────────────────────────────────
  setVar('--color-border-primary',   `oklch(0.20 ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`);
  setVar('--color-border-secondary', `oklch(0.30 ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`);

  // ── State fills ───────────────────────────────────────────────────────────
  setVar('--color-text-danger',     semanticColors.error);
  setVar('--color-bg-fill-danger',  `oklch(from ${semanticColors.error} l c h / 0.1)`);
  setVar('--color-text-warning',    semanticColors.warning);
  setVar('--color-bg-fill-warning', `oklch(from ${semanticColors.warning} l c h / 0.1)`);
  setVar('--color-text-success',    semanticColors.success);
  setVar('--color-bg-fill-success', `oklch(from ${semanticColors.success} l c h / 0.1)`);
  setVar('--color-text-info',       semanticColors.info);

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
