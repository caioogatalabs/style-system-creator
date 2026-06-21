/**
 * Brand loader — the single bridge between the `public/brand/` contract and
 * the running app. Reads + validates the brand files and assembles a
 * `LoadedBrand` ({ manifest, assets, config }).
 *
 * Server-side only (uses `fs`). Call from Server Components / route handlers.
 *
 * Validation throws `BrandContractError` with a legible, path-prefixed message
 * — this is the surface the external scaffolding agent depends on, so errors
 * must point precisely at the offending file + field.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { TokenConfig } from '@/types/tokens';
import type {
  BrandManifest,
  BrandColorsFile,
  BrandTypographyFile,
  BrandSurfaceFile,
  BrandAssetsFile,
  BrandAssets,
  LoadedBrand,
} from '@/types/brand';
import type { SurfaceColorSet, SurfaceOverrides } from '@/types/tokens';

/** Absolute path to the brand contract folder. */
const BRAND_DIR = join(process.cwd(), 'public', 'brand');
/** Public URL prefix where the brand folder is served. */
const BRAND_URL = '/brand';

export class BrandContractError extends Error {
  constructor(message: string) {
    super(`[brand] ${message}`);
    this.name = 'BrandContractError';
  }
}

// ── validation helpers ───────────────────────────────────────────────────────

function readJson<T>(fileName: string): T {
  const path = join(BRAND_DIR, fileName);
  if (!existsSync(path)) {
    throw new BrandContractError(`missing required file public/brand/${fileName}`);
  }
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch (err) {
    throw new BrandContractError(
      `public/brand/${fileName} is not valid JSON: ${(err as Error).message}`,
    );
  }
}

function requireString(obj: Record<string, unknown>, key: string, where: string): string {
  const v = obj[key];
  if (typeof v !== 'string' || v.length === 0) {
    throw new BrandContractError(`${where}: missing or empty string field "${key}"`);
  }
  return v;
}

function requireNumber(obj: Record<string, unknown>, key: string, where: string): number {
  const v = obj[key];
  if (typeof v !== 'number' || Number.isNaN(v)) {
    throw new BrandContractError(`${where}: missing or invalid number field "${key}"`);
  }
  return v;
}

function requireHex(obj: Record<string, unknown>, key: string, where: string): string {
  const v = requireString(obj, key, where);
  if (!/^#[0-9a-fA-F]{6}$/.test(v)) {
    throw new BrandContractError(`${where}: "${key}" must be a 6-digit hex color, got "${v}"`);
  }
  return v;
}

function requireArray(obj: Record<string, unknown>, key: string, where: string): unknown[] {
  const v = obj[key];
  if (!Array.isArray(v)) {
    throw new BrandContractError(`${where}: "${key}" must be an array`);
  }
  return v;
}

function requireAssetFile(file: string, where: string): void {
  if (!existsSync(join(BRAND_DIR, file))) {
    throw new BrandContractError(`${where}: referenced file public/brand/${file} does not exist`);
  }
}

// ── per-file parsers ─────────────────────────────────────────────────────────

function parseManifest(): BrandManifest {
  const raw = readJson<Record<string, unknown>>('brand.json');
  const w = 'brand.json';
  const defaultTheme = requireString(raw, 'defaultTheme', w);
  if (defaultTheme !== 'light' && defaultTheme !== 'dark') {
    throw new BrandContractError(`${w}: "defaultTheme" must be "light" or "dark", got "${defaultTheme}"`);
  }
  return {
    name: requireString(raw, 'name', w),
    slug: requireString(raw, 'slug', w),
    description: requireString(raw, 'description', w),
    version: requireString(raw, 'version', w),
    defaultTheme,
  };
}

/** Optional hex field — validates only when present. */
function optionalHex(obj: Record<string, unknown>, key: string, where: string): string | undefined {
  if (obj[key] === undefined) return undefined;
  return requireHex(obj, key, where);
}

const SURFACE_KEYS: (keyof SurfaceColorSet)[] = [
  'background', 'foreground', 'card', 'popover', 'muted', 'mutedForeground', 'accent', 'border', 'input',
];

function parseSurfaceSet(raw: unknown, where: string): SurfaceColorSet {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const set: SurfaceColorSet = {};
  for (const key of SURFACE_KEYS) {
    const v = optionalHex(obj, key, where);
    if (v) set[key] = v;
  }
  return set;
}

function parseSurfaceOverrides(raw: Record<string, unknown>): SurfaceOverrides | undefined {
  if (raw.surfaces === undefined) return undefined;
  const s = raw.surfaces as Record<string, unknown>;
  const out: SurfaceOverrides = {};
  if (s.light !== undefined) out.light = parseSurfaceSet(s.light, 'colors.json → surfaces.light');
  if (s.dark !== undefined) out.dark = parseSurfaceSet(s.dark, 'colors.json → surfaces.dark');
  return out;
}

function parseColors(): BrandColorsFile {
  const raw = readJson<Record<string, unknown>>('colors.json');
  const w = 'colors.json';
  const colors = (raw.colors ?? {}) as Record<string, unknown>;
  const lr = (raw.lightnessRange ?? {}) as Record<string, unknown>;
  const status = (raw.status ?? {}) as Record<string, unknown>;
  return {
    colors: {
      primary: requireHex(colors, 'primary', `${w} → colors`),
      secondary: requireHex(colors, 'secondary', `${w} → colors`),
      accent: requireHex(colors, 'accent', `${w} → colors`),
      neutral: requireHex(colors, 'neutral', `${w} → colors`),
    },
    lightnessRange: {
      min: requireNumber(lr, 'min', `${w} → lightnessRange`),
      max: requireNumber(lr, 'max', `${w} → lightnessRange`),
    },
    status: {
      warning: requireHex(status, 'warning', `${w} → status`),
      error: requireHex(status, 'error', `${w} → status`),
      success: requireHex(status, 'success', `${w} → status`),
      info: requireHex(status, 'info', `${w} → status`),
    },
    surfaces: parseSurfaceOverrides(raw),
  };
}

function parseTypography(): BrandTypographyFile {
  const raw = readJson<Record<string, unknown>>('typography.json');
  const w = 'typography.json';
  return {
    headingFamily: requireString(raw, 'headingFamily', w),
    bodyFamily: requireString(raw, 'bodyFamily', w),
    baseSize: requireNumber(raw, 'baseSize', w),
    scaleRatio: requireNumber(raw, 'scaleRatio', w),
    headingWeight: requireNumber(raw, 'headingWeight', w),
    bodyWeight: requireNumber(raw, 'bodyWeight', w),
  };
}

function parseSurface(): BrandSurfaceFile {
  const raw = readJson<Record<string, unknown>>('surface.json');
  const w = 'surface.json';
  const elevation = requireString(raw, 'elevation', w);
  const allowed = ['flat', 'subtle', 'elevated', 'floating'];
  if (!allowed.includes(elevation)) {
    throw new BrandContractError(
      `${w}: "elevation" must be one of ${allowed.join(', ')}, got "${elevation}"`,
    );
  }
  return {
    radius: requireNumber(raw, 'radius', w),
    elevation: elevation as BrandSurfaceFile['elevation'],
    spacingBaseUnit: requireNumber(raw, 'spacingBaseUnit', w),
  };
}

function parseAssets(): BrandAssetsFile {
  const raw = readJson<Record<string, unknown>>('assets.json');
  const w = 'assets.json';

  const logo = requireArray(raw, 'logo', w).map((entry, i) => {
    const e = entry as Record<string, unknown>;
    const where = `${w} → logo[${i}]`;
    const file = requireString(e, 'file', where);
    requireAssetFile(file, where);
    return {
      id: requireString(e, 'id', where),
      label: requireString(e, 'label', where),
      file,
      variant: requireString(e, 'variant', where) as BrandAssetsFile['logo'][number]['variant'],
    };
  });

  const iconsRaw = (raw.icons ?? {}) as Record<string, unknown>;
  const iconsDir = requireString(iconsRaw, 'dir', `${w} → icons`);
  const iconFiles = requireArray(iconsRaw, 'files', `${w} → icons`).map((f, i) => {
    const name = String(f);
    requireAssetFile(join(iconsDir, name), `${w} → icons.files[${i}]`);
    return name;
  });

  const images = requireArray(raw, 'images', w).map((entry, i) => {
    const e = entry as Record<string, unknown>;
    const where = `${w} → images[${i}]`;
    const file = requireString(e, 'file', where);
    requireAssetFile(file, where);
    return { id: requireString(e, 'id', where), label: requireString(e, 'label', where), file };
  });

  const voiceRaw = (raw.voice ?? {}) as Record<string, unknown>;
  const wv = `${w} → voice`;
  const voice = {
    summary: requireString(voiceRaw, 'summary', wv),
    principles: requireArray(voiceRaw, 'principles', wv).map((p, i) => {
      const e = p as Record<string, unknown>;
      return {
        title: requireString(e, 'title', `${wv}.principles[${i}]`),
        description: requireString(e, 'description', `${wv}.principles[${i}]`),
      };
    }),
    dos: requireArray(voiceRaw, 'dos', wv).map(String),
    donts: requireArray(voiceRaw, 'donts', wv).map(String),
  };

  return { logo, icons: { dir: iconsDir, style: requireString(iconsRaw, 'style', `${w} → icons`), files: iconFiles }, images, voice };
}

// ── assembly ─────────────────────────────────────────────────────────────────

function toTokenConfig(
  colors: BrandColorsFile,
  typography: BrandTypographyFile,
  surface: BrandSurfaceFile,
  theme: 'light' | 'dark',
): TokenConfig {
  return {
    colors: colors.colors,
    lightnessRange: colors.lightnessRange,
    typography,
    surface: { radius: surface.radius, elevation: surface.elevation },
    spacing: { baseUnit: surface.spacingBaseUnit },
    theme,
    surfaceOverrides: colors.surfaces,
  };
}

function toBrandAssets(file: BrandAssetsFile): BrandAssets {
  return {
    logo: file.logo,
    icons: {
      style: file.icons.style,
      files: file.icons.files.map((name) => ({
        name,
        url: `${BRAND_URL}/${file.icons.dir}/${name}`,
      })),
    },
    images: file.images,
    voice: file.voice,
  };
}

/** Loads, validates and assembles the brand under `public/brand/`. */
export function loadBrand(): LoadedBrand {
  const manifest = parseManifest();
  const colors = parseColors();
  const typography = parseTypography();
  const surface = parseSurface();
  const assets = parseAssets();

  return {
    manifest,
    assets: toBrandAssets(assets),
    config: toTokenConfig(colors, typography, surface, manifest.defaultTheme),
  };
}

/** Resolves an asset file path from the contract to its served URL. */
export function brandAssetUrl(file: string): string {
  return `${BRAND_URL}/${file}`;
}

/** Lists icon files present in a directory (helper for tooling/agents). */
export function listIconFiles(dir: string): string[] {
  const abs = join(BRAND_DIR, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).filter((f) => f.endsWith('.svg'));
}
