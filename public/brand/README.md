# Brand contract (`public/brand/`)

This folder **is** the brand. Everything the viewer shows is read from here.
To configure a new brand, the scaffolding agent **replaces the contents of this
folder** — nothing else in the codebase needs to change.

The canonical types live in [`types/brand.ts`](../../types/brand.ts). The loader
that reads + validates this folder is [`lib/brand-loader.ts`](../../lib/brand-loader.ts).
If validation fails, the loader throws a `[brand] …` error pointing at the exact
file and field — fix what it names.

## Folder layout

```
public/brand/
  brand.json        # identity (name, slug, description, version)
  colors.json       # 4 key colors + lightness range + status colors
  typography.json   # declared font families + type scale
  surface.json      # radius, elevation, spacing base unit
  assets.json       # index of logos / icons / images / tone of voice
  assets/
    logo/           # logo SVGs referenced by assets.json → logo[].file
    icons/          # icon SVGs referenced by assets.json → icons.files[]
    images/         # imagery referenced by assets.json → images[].file
```

> All asset paths in `assets.json` are **relative to `public/brand/`** (e.g.
> `assets/logo/primary.svg`). They are served at `/brand/<path>` and the viewer
> resolves that for you — just keep the file where the JSON says it is.

## Files

### `brand.json` → `BrandManifest`
| field | type | notes |
|-------|------|-------|
| `name` | string | Display name (top bar, overview). |
| `slug` | string | URL-safe id. |
| `description` | string | One line. |
| `version` | string | Free-form, e.g. `"1.0.0"`. |
| `defaultTheme` | `"light"` \| `"dark"` | The tone the brand **loads in**. The viewer boots already showing the brand in this mode; the toggle still lets a reviewer inspect the other tone. |

### `colors.json` → `BrandColorsFile`
| field | type | notes |
|-------|------|-------|
| `colors.primary` / `secondary` / `accent` / `neutral` | hex | 6-digit `#rrggbb`. Scales 50–950 are derived. |
| `lightnessRange.min` / `max` | number | Lightness of step 950 / step 50 (e.g. `0.05` / `0.98`). |
| `status.warning` / `error` / `success` / `info` | hex | Fixed status colors. |
| `surfaces` | object \| omit | **Optional.** Faithful neutral overrides — see below. |

#### `colors.json → surfaces` (optional — faithful theme import)

The engine normally *generates* the neutral surfaces (background, card, border,
muted, input) from the `neutral` seed. That approximates, but can't reproduce a
hand-designed theme (e.g. a tweakcn export), where these are chosen
independently. Supply `surfaces` to use the theme's exact values per tone; any
omitted field falls back to the generated one. The keys mirror shadcn roles, so
a theme export maps 1:1:

```jsonc
"surfaces": {
  "light": {
    "background": "#fbfcf8", "foreground": "#0f172a",
    "card": "#ffffff", "popover": "#ffffff",
    "muted": "#f1f5f9", "mutedForeground": "#64748b",
    "accent": "#f0fdf4", "border": "#e2e8f0", "input": "#e2e8f0"
  },
  "dark": { "...": "same keys for the dark tone" }
}
```

> The 4 brand colors (`primary`/`secondary`/`accent` seeds) are still generated
> into scales — `surfaces` only overrides the **neutral** system.

### `typography.json` → `BrandTypographyFile`
| field | type | notes |
|-------|------|-------|
| `headingFamily` / `bodyFamily` | string | **Declared only.** Connecting/hosting fonts is the agent's job (see `lib/font-loader.ts`). |
| `baseSize` | number | px. |
| `scaleRatio` | number | Modular scale ratio (e.g. `1.25`). |
| `headingWeight` / `bodyWeight` | number | Font weights. |

### `surface.json` → `BrandSurfaceFile`
| field | type | notes |
|-------|------|-------|
| `radius` | number | Base corner radius in px. |
| `elevation` | enum | `flat` \| `subtle` \| `elevated` \| `floating`. |
| `spacingBaseUnit` | number | px; the spacing scale is derived from it. |

### `assets.json` → `BrandAssetsFile`
| field | type | notes |
|-------|------|-------|
| `logo[]` | `{ id, label, file, variant }` | `variant`: `full` \| `mark` \| `mono` \| `inverse`. `file` must exist. |
| `icons.dir` | string | Directory under `public/brand/`, e.g. `assets/icons`. |
| `icons.style` | string | Free-form label, e.g. `outline`. |
| `icons.files[]` | string[] | File names inside `icons.dir`. Each must exist. |
| `images[]` | `{ id, label, file }` | `file` must exist. |
| `voice.summary` | string | One-paragraph tone summary. |
| `voice.principles[]` | `{ title, description }` | Voice principles. |
| `voice.dos[]` / `voice.donts[]` | string[] | Do/Don't lists. |

## How to add a new brand

1. Replace `brand.json`, `colors.json`, `typography.json`, `surface.json` with the brand's values.
2. Drop the logo / icon / image files into `assets/…`.
3. Point `assets.json` at those files and fill in the tone of voice.
4. Run the app — the loader validates on load and the viewer renders the brand.

The current contents are a **demo brand ("Lumen")**. Keep its shape, swap its values.
