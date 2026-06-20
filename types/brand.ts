/**
 * Brand contract — the canonical, agent-facing input shape.
 *
 * A brand is a set of plain files under `public/brand/` that the scaffolding
 * agent populates. `lib/brand-loader.ts` reads + validates these files and
 * converts them into the runtime `TokenConfig` (consumed unchanged by the
 * existing token engine) plus a `BrandAssets` index (consumed by /assets).
 *
 * THIS FILE IS THE SOURCE OF TRUTH for the contract. When you add a field
 * here, update `public/brand/README.md` and `lib/brand-loader.ts` to match.
 *
 * Files that make up a brand (all under `public/brand/`):
 *   brand.json       → BrandManifest
 *   colors.json      → BrandColorsFile
 *   typography.json  → BrandTypographyFile
 *   surface.json     → BrandSurfaceFile
 *   assets.json      → BrandAssetsFile
 *   assets/...       → the referenced binary/markup files (logos, icons, images)
 */

import type {
  PrimitiveColors,
  LightnessRange,
  SemanticColors,
  TypographyConfig,
  ElevationLevel,
} from './tokens';

// ── brand.json ───────────────────────────────────────────────────────────────

export interface BrandManifest {
  /** Display name shown in the top bar and overview, e.g. "Acme". */
  name: string;
  /** URL-safe identifier, e.g. "acme". */
  slug: string;
  /** One-line description of the brand. */
  description: string;
  /** Free-form version string for the brand package, e.g. "1.0.0". */
  version: string;
  /**
   * The tone the brand loads in. Unlike a theme *switcher*, this is the brand's
   * own decision — the viewer boots already showing the brand in this mode.
   * The theme toggle still lets a reviewer flip it to inspect the other tone.
   */
  defaultTheme: 'light' | 'dark';
}

// ── colors.json ──────────────────────────────────────────────────────────────

export interface BrandColorsFile {
  /** The 4 key colors as hex. Scales (50–950) are derived by the engine. */
  colors: PrimitiveColors;
  /** Lightness endpoints for the derived scales (step 950 / step 50). */
  lightnessRange: LightnessRange;
  /** Fixed status colors (warning/error/success/info) as hex. */
  status: SemanticColors;
}

// ── typography.json ──────────────────────────────────────────────────────────

/**
 * Declared typography. The viewer only READS the family names — connecting /
 * hosting the actual font files is the scaffolding agent's responsibility.
 */
export type BrandTypographyFile = TypographyConfig;

// ── surface.json ─────────────────────────────────────────────────────────────

export interface BrandSurfaceFile {
  /** Base corner radius in px; the engine derives radius-1/2/3. */
  radius: number;
  /** Elevation preset driving the shadow scale. */
  elevation: ElevationLevel;
  /** Base spacing unit in px; the engine derives the spacing scale. */
  spacingBaseUnit: number;
}

// ── assets.json ──────────────────────────────────────────────────────────────

export type LogoVariant = 'full' | 'mark' | 'mono' | 'inverse';

export interface LogoAsset {
  id: string;
  label: string;
  /** Path relative to `public/brand/`, e.g. "assets/logo/primary.svg". */
  file: string;
  variant: LogoVariant;
}

export interface IconsAsset {
  /** Directory (relative to `public/brand/`) holding the icon files. */
  dir: string;
  /** Free-form style note shown in the UI, e.g. "outline". */
  style: string;
  /** File names within `dir`, e.g. ["search.svg", "heart.svg"]. */
  files: string[];
}

export interface ImageAsset {
  id: string;
  label: string;
  /** Path relative to `public/brand/`. */
  file: string;
}

export interface VoicePrinciple {
  title: string;
  description: string;
}

/**
 * Tone of voice as structured data (zero-dependency, deterministic to render).
 */
export interface BrandVoice {
  /** Short summary of how the brand sounds. */
  summary: string;
  principles: VoicePrinciple[];
  dos: string[];
  donts: string[];
}

export interface BrandAssetsFile {
  logo: LogoAsset[];
  icons: IconsAsset;
  images: ImageAsset[];
  voice: BrandVoice;
}

// ── Loaded (runtime) shapes ──────────────────────────────────────────────────

/**
 * Assets as consumed by the UI. File paths are rewritten to served URLs
 * (prefixed with `/brand/`) by the loader.
 */
export interface BrandAssets {
  logo: LogoAsset[];
  icons: { style: string; files: { name: string; url: string }[] };
  images: ImageAsset[];
  voice: BrandVoice;
}

/** The fully loaded brand, ready for the app. */
export interface LoadedBrand {
  manifest: BrandManifest;
  assets: BrandAssets;
  /** The runtime TokenConfig the existing engine consumes. */
  config: import('./tokens').TokenConfig;
}
