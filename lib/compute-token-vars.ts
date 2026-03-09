import type { ResolvedTokens, TokenConfig } from '@/types/tokens';

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
  vars['--color-on-primary']     = p[m.on].oklch;

  // ── Secondary fills & text ────────────────────────────────────────────────
  vars['--color-secondary']       = s[m.fill].oklch;
  vars['--color-secondary-hover'] = s[m.hover].oklch;
  vars['--color-secondary-text']  = s[m.text].oklch;
  vars['--color-on-secondary']    = s[m.on].oklch;

  // ── Accent fills & text ───────────────────────────────────────────────────
  vars['--color-accent']       = a[m.fill].oklch;
  vars['--color-accent-hover'] = a[m.hover].oklch;
  vars['--color-accent-text']  = a[m.text].oklch;
  vars['--color-on-accent']    = a[m.on].oklch;

  // ── Borders (from neutral scale) ──────────────────────────────────────────
  vars['--color-border']       = n[m.border].oklch;
  vars['--color-border-muted'] = n[m.border_muted].oklch;

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
  vars['--muted']                = vars['--color-surface-raised'];
  vars['--muted-foreground']     = vars['--color-text-muted'];
  vars['--accent']               = vars['--color-surface-raised'];
  vars['--accent-foreground']    = vars['--color-text'];
  vars['--border']               = vars['--color-border'];
  vars['--input']                = vars['--color-border-muted'];
  vars['--ring']                 = vars['--color-primary'];
  vars['--destructive']          = semanticColors.error;
  vars['--card']                 = vars['--color-surface-raised'];
  vars['--card-foreground']      = vars['--color-text'];
  vars['--popover']              = vars['--color-surface-raised'];
  vars['--popover-foreground']   = vars['--color-text'];

  return vars;
}
