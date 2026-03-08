export interface PrimitiveColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  tertiary: string;
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

export interface TokenConfig {
  colors: PrimitiveColors;
  typography: TypographyConfig;
  surface: {
    radius: number;
    elevation: ElevationLevel;
  };
  spacing: { baseUnit: number };
  theme: 'light' | 'dark';
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
  tertiary: ColorScale;
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
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusFull: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
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
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'LOAD_CONFIG'; config: TokenConfig }
  | { type: 'RESET' };
