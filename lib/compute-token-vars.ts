import type { ResolvedTokens, TokenConfig } from '@/types/tokens';
import { hexToOklch } from './color-utils';

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

/**
 * Pure function — no DOM access, safe for both server and client.
 * Returns a flat map of CSS custom property name → value.
 * Used by applyTokensToDOM (client) and generateInitialStyles (server).
 */
export function computeTokenVars(
  resolved: ResolvedTokens,
  config: TokenConfig,
): Record<string, string> {
  const { colorScales, semanticColors, typography, spacing, surface } = resolved;
  const vars: Record<string, string> = {};

  // ── Color scales (primitives) ──────────────────────────────────────────────
  const colorNames = ['primary', 'secondary', 'accent', 'neutral', 'tertiary'] as const;
  colorNames.forEach((name) => {
    colorScales[name].forEach(({ step, oklch }) => {
      vars[`--color-${name}-${step}`] = oklch;
    });
  });

  // ── Derive hue/chroma from primitives ──────────────────────────────────────
  const { h: neutralH, c: neutralC } = hexToOklch(config.colors.neutral);
  const { h: secondaryH, c: secondaryC } = hexToOklch(config.colors.secondary);
  const { h: primaryH } = hexToOklch(config.colors.primary);
  const { h: tertiaryH, c: tertiaryC } = hexToOklch(config.colors.tertiary);

  const bgChroma       = Math.min(neutralC   * 0.30, 0.008);
  const fgChroma       = Math.min(secondaryC * 0.08, 0.012);
  const fgMutedChroma  = Math.min(secondaryC * 0.10, 0.015);
  const borderChroma   = Math.min(neutralC   * 0.40, 0.010);
  const tertiaryChroma = Math.min(tertiaryC  * 0.20, 0.020);

  const p = colorScales.primary;
  const s = colorScales.secondary;
  const a = colorScales.accent;

  const l = THEME_L[config.theme];

  // ── Backgrounds ───────────────────────────────────────────────────────────
  vars['--color-bg']                 = `oklch(${l.bg} ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`;
  vars['--color-bg-surface-primary'] = `oklch(${l.surface} ${bgChroma.toFixed(4)} ${neutralH.toFixed(1)})`;

  // ── Text ──────────────────────────────────────────────────────────────────
  vars['--color-text-primary']   = `oklch(${l.textPrimary} ${fgChroma.toFixed(4)} ${secondaryH.toFixed(1)})`;
  vars['--color-text-secondary'] = `oklch(${l.textSecondary} ${fgMutedChroma.toFixed(4)} ${secondaryH.toFixed(1)})`;
  vars['--color-text-tertiary']  = `oklch(${l.textTertiary} ${tertiaryChroma.toFixed(4)} ${tertiaryH.toFixed(1)})`;
  vars['--color-text-inverse']   = `oklch(0.97 0.01 ${primaryH.toFixed(1)})`;

  // ── Fills (interactive elements) ──────────────────────────────────────────
  vars['--color-bg-fill-primary']         = config.colors.primary;
  vars['--color-bg-fill-primary-hover']   = p[6].oklch;
  vars['--color-bg-fill-primary-active']  = p[7].oklch;
  vars['--color-bg-fill-secondary']       = s[5].oklch;
  vars['--color-bg-fill-secondary-hover'] = s[6].oklch;
  vars['--color-bg-fill-accent']          = a[5].oklch;
  vars['--color-bg-fill-accent-hover']    = a[6].oklch;

  // ── Borders ───────────────────────────────────────────────────────────────
  vars['--color-border-primary']   = `oklch(${l.border} ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`;
  vars['--color-border-secondary'] = `oklch(${l.borderSub} ${borderChroma.toFixed(4)} ${neutralH.toFixed(1)})`;

  // ── State fills ───────────────────────────────────────────────────────────
  vars['--color-text-danger']     = semanticColors.error;
  vars['--color-bg-fill-danger']  = `oklch(from ${semanticColors.error} l c h / 0.1)`;
  vars['--color-text-warning']    = semanticColors.warning;
  vars['--color-bg-fill-warning'] = `oklch(from ${semanticColors.warning} l c h / 0.1)`;
  vars['--color-text-success']    = semanticColors.success;
  vars['--color-bg-fill-success'] = `oklch(from ${semanticColors.success} l c h / 0.1)`;
  vars['--color-text-info']       = semanticColors.info;

  // ── Typography ────────────────────────────────────────────────────────────
  vars['--font-heading']        = `"${config.typography.headingFamily}", sans-serif`;
  vars['--font-body']           = `"${config.typography.bodyFamily}", sans-serif`;
  vars['--font-weight-heading'] = String(config.typography.headingWeight);
  vars['--font-weight-body']    = String(config.typography.bodyWeight);

  Object.entries(typography).forEach(([key, value]) => {
    vars[`--text-${key}`] = value;
  });

  // ── Spacing ───────────────────────────────────────────────────────────────
  Object.entries(spacing).forEach(([mult, value]) => {
    vars[`--space-${mult}`] = value;
  });

  // ── Surface ───────────────────────────────────────────────────────────────
  vars['--radius-component-sm']   = surface.radiusSm;
  vars['--radius-component-md']   = surface.radiusMd;
  vars['--radius-component-lg']   = surface.radiusLg;
  vars['--radius-component-full'] = surface.radiusFull;
  vars['--shadow-sm']             = surface.shadowSm;
  vars['--shadow-md']             = surface.shadowMd;
  vars['--shadow-lg']             = surface.shadowLg;

  // ── shadcn Bridge ─────────────────────────────────────────────────────────
  // Maps our semantic tokens → shadcn CSS var names so all base-ui components
  // are automatically live-reactive. These override the static values in globals.css.
  vars['--background']           = vars['--color-bg'];
  vars['--foreground']           = vars['--color-text-primary'];
  vars['--primary']              = vars['--color-bg-fill-primary'];
  vars['--primary-foreground']   = vars['--color-text-inverse'];
  vars['--secondary']            = vars['--color-bg-surface-primary'];
  vars['--secondary-foreground'] = vars['--color-text-primary'];
  vars['--muted']                = vars['--color-bg-surface-primary'];
  vars['--muted-foreground']     = vars['--color-text-secondary'];
  vars['--accent']               = vars['--color-bg-surface-primary']; // subtle for ghost hover UX
  vars['--accent-foreground']    = vars['--color-text-primary'];
  vars['--border']               = vars['--color-border-primary'];
  vars['--input']                = vars['--color-border-secondary'];
  vars['--ring']                 = vars['--color-bg-fill-primary'];
  vars['--destructive']          = semanticColors.error;
  vars['--card']                 = vars['--color-bg-surface-primary'];
  vars['--card-foreground']      = vars['--color-text-primary'];
  vars['--popover']              = vars['--color-bg-surface-primary'];
  vars['--popover-foreground']   = vars['--color-text-primary'];

  return vars;
}
