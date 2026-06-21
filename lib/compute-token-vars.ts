import type { ResolvedTokens, TokenConfig, ColorScale } from '@/types/tokens';
import { hexToRgb } from '@/lib/color-utils';

/** WCAG relative luminance from a hex color. */
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Picks the "on" (foreground) color for a filled surface by CONTRAST rather
 * than a fixed scale step. The fill (step 500) can be light (e.g. a lime brand
 * primary) or dark; we return whichever scale endpoint — lightest (step 50) or
 * darkest (step 950) — reads better on it. This is what keeps text legible on
 * bright brand colors, where a fixed light-step foreground would wash out.
 */
function onColorFor(scale: ColorScale, fillIndex: number): string {
  const fill = scale[fillIndex];
  const lightEnd = scale[0]; // step 50
  const darkEnd = scale[scale.length - 1]; // step 950
  return contrastRatio(fill.hex, darkEnd.hex) >= contrastRatio(fill.hex, lightEnd.hex)
    ? darkEnd.oklch
    : lightEnd.oklch;
}

/**
 * Scale-step index mapping for theme inversion.
 * Symmetric mirroring around step 500 (index 5).
 * Dark mode pulls toward lighter steps; light mode pulls toward darker steps.
 *
 * Index → Step: 0=50, 1=100, 2=200, 3=300, 4=400, 5=500, 6=600, 7=700, 8=800, 9=900, 10=950
 */
const STEP_MAP = {
  dark: {
    // Per-color fills (primary, secondary, accent)
    fill: 5,      // step 500 (seed)
    hover: 4,     // step 400
    active: 3,    // step 300
    text: 3,      // step 300 (colored text — links, labels)
    on: 10,       // step 950 (text on fill)
    // Neutral-derived
    surface: 10,       // step 950
    surface_raised: 9, // step 900
    muted: 8,          // step 800 — hover/highlight, must out-contrast raised
    text_body: 1,      // step 100
    text_muted: 4,     // step 400
    text_dim: 8,       // step 800
    border: 7,         // step 700
    border_muted: 8,   // step 800
  },
  light: {
    fill: 5, hover: 6, active: 7, text: 7, on: 0,
    surface: 0,        // step 50
    surface_raised: 1, // step 100
    muted: 2,          // step 200 — hover/highlight, must out-contrast raised
    text_body: 9,      // step 900
    text_muted: 6,     // step 600
    text_dim: 2,       // step 200
    border: 3,         // step 300
    border_muted: 2,   // step 200
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
  const colorNames = ['primary', 'secondary', 'accent', 'neutral'] as const;
  colorNames.forEach((name) => {
    colorScales[name].forEach(({ step, oklch }) => {
      vars[`--color-${name}-${step}`] = oklch;
    });
  });

  const p = colorScales.primary;
  const s = colorScales.secondary;
  const a = colorScales.accent;
  const n = colorScales.neutral;
  const m = STEP_MAP[config.theme];

  // ── Surfaces (from neutral scale) ─────────────────────────────────────────
  vars['--color-surface']        = n[m.surface].oklch;
  vars['--color-surface-raised'] = n[m.surface_raised].oklch;

  // ── Text (from neutral scale) ─────────────────────────────────────────────
  vars['--color-text']       = n[m.text_body].oklch;
  vars['--color-text-muted'] = n[m.text_muted].oklch;
  vars['--color-text-dim']   = n[m.text_dim].oklch;

  // ── Primary fills & text ──────────────────────────────────────────────────
  vars['--color-primary']        = p[m.fill].oklch;
  vars['--color-primary-hover']  = p[m.hover].oklch;
  vars['--color-primary-active'] = p[m.active].oklch;
  vars['--color-primary-text']   = p[m.text].oklch;
  vars['--color-on-primary']     = onColorFor(p, m.fill);

  // ── Secondary fills & text ────────────────────────────────────────────────
  vars['--color-secondary']       = s[m.fill].oklch;
  vars['--color-secondary-hover'] = s[m.hover].oklch;
  vars['--color-secondary-text']  = s[m.text].oklch;
  vars['--color-on-secondary']    = onColorFor(s, m.fill);

  // ── Accent fills & text ───────────────────────────────────────────────────
  vars['--color-accent']       = a[m.fill].oklch;
  vars['--color-accent-hover'] = a[m.hover].oklch;
  vars['--color-accent-text']  = a[m.text].oklch;
  vars['--color-on-accent']    = onColorFor(a, m.fill);

  // ── Borders (from neutral scale) ──────────────────────────────────────────
  vars['--color-border']       = n[m.border].oklch;
  vars['--color-border-muted'] = n[m.border_muted].oklch;

  // ── Faithful surface overrides (per tone) ─────────────────────────────────
  // When a brand imports a hand-designed theme, these replace the generated
  // neutrals so borders/backgrounds/cards render exactly as designed. Applied
  // before the shadcn bridge so the override propagates to every derived role.
  const ov = config.surfaceOverrides?.[config.theme] ?? {};
  if (ov.background) vars['--color-surface'] = ov.background;
  if (ov.card) vars['--color-surface-raised'] = ov.card;
  if (ov.foreground) vars['--color-text'] = ov.foreground;
  if (ov.mutedForeground) vars['--color-text-muted'] = ov.mutedForeground;
  if (ov.border) vars['--color-border'] = ov.border;
  if (ov.input) vars['--color-border-muted'] = ov.input;

  // ── Status ────────────────────────────────────────────────────────────────
  vars['--color-danger']       = semanticColors.error;
  vars['--color-danger-muted'] = `oklch(from ${semanticColors.error} l c h / 0.1)`;
  vars['--color-warning']       = semanticColors.warning;
  vars['--color-warning-muted'] = `oklch(from ${semanticColors.warning} l c h / 0.1)`;
  vars['--color-success']       = semanticColors.success;
  vars['--color-success-muted'] = `oklch(from ${semanticColors.success} l c h / 0.1)`;
  vars['--color-info']          = semanticColors.info;

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
  vars['--radius-1']    = surface.radius1;
  vars['--radius-2']    = surface.radius2;
  vars['--radius-3']    = surface.radius3;
  vars['--radius-full'] = surface.radiusFull;
  vars['--shadow-1']    = surface.shadow1;
  vars['--shadow-2']    = surface.shadow2;
  vars['--shadow-3']    = surface.shadow3;

  // ── shadcn Bridge ─────────────────────────────────────────────────────────
  vars['--background']           = vars['--color-surface'];
  vars['--foreground']           = vars['--color-text'];
  vars['--primary']              = vars['--color-primary'];
  vars['--primary-foreground']   = vars['--color-on-primary'];
  vars['--secondary']            = vars['--color-surface-raised'];
  vars['--secondary-foreground'] = vars['--color-text'];
  // muted/accent = hover/highlight surfaces — a step more contrasting than
  // card/popover/raised so hovers stay visible when they land on those surfaces.
  vars['--muted']                = ov.muted ?? n[m.muted].oklch;
  vars['--muted-foreground']     = vars['--color-text-muted'];
  vars['--accent']               = ov.accent ?? n[m.muted].oklch;
  vars['--accent-foreground']    = vars['--color-text'];
  vars['--border']               = vars['--color-border'];
  vars['--input']                = vars['--color-border-muted'];
  vars['--ring']                 = vars['--color-primary'];
  vars['--destructive']          = semanticColors.error;
  vars['--card']                 = vars['--color-surface-raised'];
  vars['--card-foreground']      = vars['--color-text'];
  vars['--popover']              = ov.popover ?? vars['--color-surface-raised'];
  vars['--popover-foreground']   = vars['--color-text'];

  return vars;
}
