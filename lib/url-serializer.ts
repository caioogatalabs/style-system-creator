import type { TokenConfig, RadiusPreset, ElevationLevel } from '@/types/tokens';
import { DEFAULT_TOKEN_CONFIG } from './default-config';

export function serializeConfig(config: TokenConfig): URLSearchParams {
  const params = new URLSearchParams();
  params.set('p', config.colors.primary);
  params.set('s', config.colors.secondary);
  params.set('a', config.colors.accent);
  params.set('n', config.colors.neutral);
  params.set('t', config.colors.tertiary);
  params.set('hf', config.typography.headingFamily);
  params.set('bf', config.typography.bodyFamily);
  params.set('hw', String(config.typography.headingWeight));
  params.set('bw', String(config.typography.bodyWeight));
  params.set('r', config.surface.radius);
  params.set('el', config.surface.elevation);
  if (config.theme !== 'dark') params.set('th', config.theme);
  return params;
}

const VALID_RADIUS: RadiusPreset[] = ['none', 'sm', 'md', 'lg', 'full'];
const VALID_ELEVATION: ElevationLevel[] = ['flat', 'subtle', 'elevated', 'floating'];
const VALID_THEMES = ['light', 'dark'] as const;
type ThemeValue = typeof VALID_THEMES[number];

export function deserializeConfig(params: URLSearchParams): TokenConfig {
  const def = DEFAULT_TOKEN_CONFIG;

  const radius = params.get('r');
  const elevation = params.get('el');

  const themeParam = params.get('th');
  const theme: ThemeValue = (themeParam && VALID_THEMES.includes(themeParam as ThemeValue))
    ? (themeParam as ThemeValue)
    : 'dark';

  return {
    colors: {
      primary:   params.get('p') ?? def.colors.primary,
      secondary: params.get('s') ?? def.colors.secondary,
      accent:    params.get('a') ?? def.colors.accent,
      neutral:   params.get('n') ?? def.colors.neutral,
      tertiary:  params.get('t') ?? def.colors.tertiary,
    },
    typography: {
      ...def.typography,
      headingFamily: params.get('hf') ?? def.typography.headingFamily,
      bodyFamily:    params.get('bf') ?? def.typography.bodyFamily,
      headingWeight: Number(params.get('hw')) || def.typography.headingWeight,
      bodyWeight:    Number(params.get('bw')) || def.typography.bodyWeight,
    },
    surface: {
      radius:    (radius && VALID_RADIUS.includes(radius as RadiusPreset))
        ? (radius as RadiusPreset)
        : def.surface.radius,
      elevation: (elevation && VALID_ELEVATION.includes(elevation as ElevationLevel))
        ? (elevation as ElevationLevel)
        : def.surface.elevation,
    },
    spacing: def.spacing,
    theme,
  };
}
