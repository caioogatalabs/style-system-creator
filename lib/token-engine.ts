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
  ElevationLevel,
  LightnessRange,
} from '@/types/tokens';

// ─── Color Scale ────────────────────────────────────────────────────────────

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Ratios for interpolating each half of the scale around the seed (step 500).
// Light half: 0 = seed lightness, 1 = lightnessRange.max
const LIGHT_HALF_RATIOS: Record<number, number> = {
  50: 1.000,
  100: 0.930,
  200: 0.789,
  300: 0.565,
  400: 0.283,
};

// Dark half: 0 = seed lightness, 1 = lightnessRange.min
const DARK_HALF_RATIOS: Record<number, number> = {
  600: 0.227,
  700: 0.431,
  800: 0.637,
  900: 0.841,
  950: 1.000,
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

const DEFAULT_LIGHTNESS_RANGE: LightnessRange = { min: 0.05, max: 0.98 };

export function generateColorScale(
  seedHex: string,
  lightnessRange: LightnessRange = DEFAULT_LIGHTNESS_RANGE,
): ColorScale {
  const { l: seedL, c: seedC, h: seedH } = hexToOklch(seedHex);
  const maxChroma = Math.max(seedC, 0.05);
  const { min, max } = lightnessRange;

  return SCALE_STEPS.map((step) => {
    let l: number;
    if (step === 500) {
      // Anchor: always the seed's own lightness
      l = seedL;
    } else if (step < 500) {
      // Light half: interpolate from seedL toward max
      l = seedL + LIGHT_HALF_RATIOS[step] * (max - seedL);
    } else {
      // Dark half: interpolate from seedL toward min
      l = seedL - DARK_HALF_RATIOS[step] * (seedL - min);
    }
    l = Math.max(0, Math.min(1, l));

    // Step 500 preserves seed chroma exactly; others scale relative to it
    const c = step === 500 ? seedC : maxChroma * CHROMA_MAP[step];
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

export function generateAllColorScales(
  colors: TokenConfig['colors'],
  lightnessRange: LightnessRange = DEFAULT_LIGHTNESS_RANGE,
): ResolvedColorScales {
  return {
    primary: generateColorScale(colors.primary, lightnessRange),
    secondary: generateColorScale(colors.secondary, lightnessRange),
    accent: generateColorScale(colors.accent, lightnessRange),
    neutral: generateColorScale(colors.neutral, lightnessRange),
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
  const { radius, elevation } = surface;

  let radius1: string, radius2: string, radius3: string;
  if (radius >= 9999) {
    radius1 = radius2 = radius3 = '9999px';
  } else {
    radius1 = `${Math.round(radius * 0.5)}px`;
    radius2 = `${radius}px`;
    radius3 = `${Math.round(radius * 1.5)}px`;
  }

  const [shadow1, shadow2, shadow3] = SHADOW_VALUES[elevation];

  return {
    radius1,
    radius2,
    radius3,
    radiusFull: '9999px',
    shadow1,
    shadow2,
    shadow3,
  };
}

// ─── Master Resolver ─────────────────────────────────────────────────────────

export function resolveTokens(config: TokenConfig): ResolvedTokens {
  return {
    colorScales: generateAllColorScales(config.colors, config.lightnessRange),
    semanticColors: deriveSemanticColors(config.colors.primary),
    typography: generateTypeScale(config.typography.baseSize, config.typography.scaleRatio),
    spacing: generateSpacingScale(config.spacing.baseUnit),
    surface: resolveSurfaceTokens(config.surface),
  };
}
