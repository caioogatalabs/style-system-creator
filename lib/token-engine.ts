import { hexToOklch, oklchToHex, oklchToString, hexToRgb } from './color-utils';
import type {
  TokenConfig,
  ColorScale,
  ResolvedColorScales,
  SemanticColors,
  TypeScale,
  SpacingScale,
  SurfaceTokens,
  ResolvedTokens,
  RadiusPreset,
  ElevationLevel,
} from '@/types/tokens';

// ─── Color Scale ────────────────────────────────────────────────────────────

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Target lightness for each step
const LIGHTNESS_MAP: Record<number, number> = {
  50: 0.975,
  100: 0.950,
  200: 0.900,
  300: 0.820,
  400: 0.720,
  500: 0.620,
  600: 0.520,
  700: 0.430,
  800: 0.340,
  900: 0.250,
  950: 0.180,
};

// Chroma multiplier per step (reduces at extremes)
const CHROMA_MAP: Record<number, number> = {
  50: 0.15,
  100: 0.25,
  200: 0.40,
  300: 0.60,
  400: 0.80,
  500: 0.95,
  600: 1.00,
  700: 0.95,
  800: 0.80,
  900: 0.60,
  950: 0.40,
};

export function generateColorScale(seedHex: string): ColorScale {
  const { l: seedL, c: seedC, h: seedH } = hexToOklch(seedHex);
  // Find which step the seed color is closest to
  const maxChroma = Math.max(seedC, 0.05);

  return SCALE_STEPS.map((step) => {
    const l = LIGHTNESS_MAP[step];
    const c = maxChroma * CHROMA_MAP[step];
    const h = seedH;

    const hex = oklchToHex(l, c, h);
    const rgb = hexToRgb(hex);

    return {
      step,
      oklch: oklchToString(l, c, h),
      hex,
      rgb,
    };
  });
}

export function generateAllColorScales(colors: TokenConfig['colors']): ResolvedColorScales {
  return {
    primary: generateColorScale(colors.primary),
    secondary: generateColorScale(colors.secondary),
    accent: generateColorScale(colors.accent),
    neutral: generateColorScale(colors.neutral),
    tertiary: generateColorScale(colors.tertiary),
  };
}

export function deriveSemanticColors(primaryHex: string): SemanticColors {
  const { h } = hexToOklch(primaryHex);

  // Error: fixed warm red
  const errorHex = oklchToHex(0.58, 0.22, 27);
  // Success: fixed green
  const successHex = oklchToHex(0.60, 0.18, 150);
  // Warning: amber/yellow
  const warningHex = oklchToHex(0.78, 0.18, 85);
  // Info: primary hue shifted -30deg
  const infoHue = ((h - 30) + 360) % 360;
  const infoHex = oklchToHex(0.60, 0.18, infoHue);

  return {
    warning: warningHex,
    error: errorHex,
    success: successHex,
    info: infoHex,
  };
}

// ─── Typography Scale ────────────────────────────────────────────────────────

export function generateTypeScale(baseSize: number, ratio: number): TypeScale {
  const step = (n: number) => `${(baseSize * Math.pow(ratio, n)).toFixed(2)}px`;

  return {
    h1: step(7),
    h2: step(6),
    h3: step(5),
    h4: step(4),
    h5: step(3),
    h6: step(2),
    bodyLg: step(1),
    body: step(0),
    bodySm: step(-1),
    caption: step(-2),
  };
}

// ─── Spacing Scale ───────────────────────────────────────────────────────────

const SPACING_MULTIPLIERS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];

export function generateSpacingScale(baseUnit: number): SpacingScale {
  const scale: SpacingScale = {};
  SPACING_MULTIPLIERS.forEach((m) => {
    scale[String(m)] = `${baseUnit * m}px`;
  });
  return scale;
}

// ─── Surface Tokens ──────────────────────────────────────────────────────────

const RADIUS_VALUES: Record<RadiusPreset, [sm: string, md: string, lg: string]> = {
  none: ['0px', '0px', '0px'],
  sm: ['2px', '4px', '6px'],
  md: ['4px', '8px', '12px'],
  lg: ['8px', '16px', '24px'],
  full: ['9999px', '9999px', '9999px'],
};

const SHADOW_VALUES: Record<ElevationLevel, [sm: string, md: string, lg: string]> = {
  flat: ['none', 'none', 'none'],
  subtle: [
    '0 1px 3px oklch(0 0 0 / 0.08)',
    '0 4px 8px oklch(0 0 0 / 0.08)',
    '0 8px 24px oklch(0 0 0 / 0.08)',
  ],
  elevated: [
    '0 2px 4px oklch(0 0 0 / 0.12)',
    '0 6px 16px oklch(0 0 0 / 0.12)',
    '0 16px 40px oklch(0 0 0 / 0.12)',
  ],
  floating: [
    '0 4px 8px oklch(0 0 0 / 0.16)',
    '0 12px 32px oklch(0 0 0 / 0.16)',
    '0 24px 64px oklch(0 0 0 / 0.16)',
  ],
};

export function resolveSurfaceTokens(surface: TokenConfig['surface']): SurfaceTokens {
  const [radiusSm, radiusMd, radiusLg] = RADIUS_VALUES[surface.radius];
  const [shadowSm, shadowMd, shadowLg] = SHADOW_VALUES[surface.elevation];

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

// ─── Master Resolver ─────────────────────────────────────────────────────────

export function resolveTokens(config: TokenConfig): ResolvedTokens {
  return {
    colorScales: generateAllColorScales(config.colors),
    semanticColors: deriveSemanticColors(config.colors.primary),
    typography: generateTypeScale(config.typography.baseSize, config.typography.scaleRatio),
    spacing: generateSpacingScale(config.spacing.baseUnit),
    surface: resolveSurfaceTokens(config.surface),
  };
}
