export interface PrimitiveColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
}

export interface LightnessRange {
  min: number; // step 950 lightness (darkest)
  max: number; // step 50 lightness (lightest)
}

export type ElevationLevel = 'flat' | 'subtle' | 'elevated' | 'floating';

export interface TypographyConfig {
  headingFamily: string;
  bodyFamily: string;
  baseSize: number;
  scaleRatio: number;
  headingWeight: number;
  bodyWeight: number;
}

/**
 * Optional faithful overrides for the neutral/surface tokens. When a brand is
 * imported from a hand-designed theme, the engine can't reproduce these from a
 * single neutral seed — so a brand may supply them verbatim per tone. Fields
 * are named after shadcn roles so a theme export maps 1:1. Any omitted field
 * falls back to the generated value.
 */
export interface SurfaceColorSet {
  background?: string;
  foreground?: string;
  card?: string;
  popover?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  border?: string;
  input?: string;
}

export interface SurfaceOverrides {
  light?: SurfaceColorSet;
  dark?: SurfaceColorSet;
}

export interface TokenConfig {
  colors: PrimitiveColors;
  lightnessRange: LightnessRange;
  typography: TypographyConfig;
  surface: {
    radius: number;
    elevation: ElevationLevel;
  };
  spacing: { baseUnit: number };
  theme: 'light' | 'dark';
  /** Faithful neutral/surface overrides (per tone). Optional. */
  surfaceOverrides?: SurfaceOverrides;
}

export interface ColorStep {
  step: number;
  oklch: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
}

export type ColorScale = ColorStep[];

export interface ResolvedColorScales {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
}

export interface SemanticColors {
  warning: string;
  error: string;
  success: string;
  info: string;
}

export type TypeScale = Record<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'bodyLg' | 'body' | 'bodySm' | 'caption',
  string
>;

export type SpacingScale = Record<string, string>;

export interface SurfaceTokens {
  radius1: string;
  radius2: string;
  radius3: string;
  radiusFull: string;
  shadow1: string;
  shadow2: string;
  shadow3: string;
}

export interface ResolvedTokens {
  colorScales: ResolvedColorScales;
  semanticColors: SemanticColors;
  typography: TypeScale;
  spacing: SpacingScale;
  surface: SurfaceTokens;
}

export type TokenAction =
  | { type: 'SET_COLOR'; key: keyof PrimitiveColors; value: string }
  | { type: 'SET_TYPOGRAPHY'; patch: Partial<TypographyConfig> }
  | { type: 'SET_SURFACE'; patch: Partial<TokenConfig['surface']> }
  | { type: 'SET_SPACING'; patch: Partial<TokenConfig['spacing']> }
  | { type: 'SET_LIGHTNESS_RANGE'; patch: Partial<LightnessRange> }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'LOAD_CONFIG'; config: TokenConfig }
  | { type: 'RESET' };
