import type { TokenConfig } from '@/types/tokens';

export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    neutral: '#64748b',
  },
  lightnessRange: {
    min: 0.05,
    max: 0.98,
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
    radius: 8,
    elevation: 'subtle',
  },
  spacing: {
    baseUnit: 4,
  },
  theme: 'dark',
};
