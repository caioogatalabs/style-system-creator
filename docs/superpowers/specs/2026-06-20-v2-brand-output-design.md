# v2 — Brand Output Viewer (design)

**Date:** 2026-06-20
**Branch:** `v2-brand-output` (from `main` @ `7182841`)
**Status:** Approved design — pending implementation plan

## 1. Purpose & pivot

The project stops being a **Style System Creator** (a tool that *generates* token systems)
and becomes the **Brand Output Viewer**: a read-only presentation + approval surface for a
brand whose tokens already exist.

When a new brand is configured inside the company, this project is the interface that makes
**all the brand's tokens and assets visible** so a human can review and approve them.

### Key facts driving the design

- **Distribution:** this repo is a **replicable template, one project per brand**. Each brand
  lives as an isolated project/deploy.
- **Scaffolding is out of scope.** An existing external agent already scaffolds new brand
  projects from this template. Our job is to make this project the *cleanest, best-documented
  mold* so that agent can replicate it following the project's patterns.
- **Source of truth = files in a `brand/` folder** populated by the external agent. The viewer
  **incorporates and displays** these tokens; it does **not** edit the source of truth.
- **Approval = read-only visualization with an interactive playground** (test font sizes, change
  the size scale, toggle light/dark themes). Approval itself happens outside the app — no
  persisted approval state, no approve/reject workflow.
- **Fonts are connected by the external agent.** The viewer only reads the declared font family
  from the contract; it does not fetch/load fonts.
- **Brand model categories:** color (scales + semantic), typography, surface/shape, and **brand
  assets** (logo, icons, images, tone of voice). The assets layer is the main net-new work.

### Non-goals (YAGNI)

- No folder/project scaffolding logic (the external agent owns this).
- No approve/reject state, comments, or export gate.
- No font fetching/connection (external agent owns this).
- No editing of the canonical brand tokens from the UI (playground tweaks are ephemeral).
- No multi-brand gallery/switcher (one project = one brand).

## 2. Architecture

The `brand/` folder is the **only interface** between the scaffold agent and the viewer. A loader
converts it into the existing `TokenConfig` shape, so the current engine and previews are unchanged.

```
brand/*.json  →  lib/brand-loader.ts  →  TokenConfig (current shape)  →  token-engine  →  CSS vars  →  screens
                                       →  BrandAssets (new)            →  /assets screen
```

### Brand contract — folder shape

```
brand/
  brand.json          # manifest: name, slug, description, version
  colors.json         # 4 key colors (hex) + lightnessRange + status colors
  typography.json     # declared font families (agent connects) + type scale + weights
  surface.json        # radius, shadow, spacing, borders
  assets.json         # declarative index/metadata for assets (points into assets/*)
  assets/
    logo/             # variants (full, symbol, mono, ...)
    icons/
    images/
    voice.md          # tone of voice (markdown)
```

`lib/default-config.ts` is repurposed as the **demo brand / fallback** shipped with the template,
so the project runs out of the box and the contract has a worked example.

### Assets contract (`assets.json`)

```jsonc
{
  "logo": [
    { "id": "primary", "label": "Logo principal", "file": "assets/logo/primary.svg", "variant": "full" },
    { "id": "symbol",  "label": "Símbolo",        "file": "assets/logo/symbol.svg",  "variant": "mark" },
    { "id": "mono",    "label": "Monocromático",  "file": "assets/logo/mono.svg",    "variant": "mono" }
  ],
  "icons":  { "dir": "assets/icons", "style": "outline" },
  "images": [ { "id": "hero", "file": "assets/images/hero.jpg", "label": "Imagem-chave" } ],
  "voice":  { "file": "assets/voice.md" }
}
```

The assets layer is intentionally **extensible** — new asset types (patterns/textures, motion,
application colors) can be added to the contract and the `/assets` screen over time.

## 3. Screens

Existing screens are preserved and lightly polished. One new screen mirrors their pattern.

| Route | Status | Content |
|-------|--------|---------|
| `/` | preserved | Brand overview |
| `/colors` | preserved | Color scales + semantic tokens |
| `/typography` | preserved | Type specimen + size/scale playground |
| `/components` | preserved | Components using semantic tokens |
| `/assets` | **new** | Logo / icons / images / tone of voice |

### `/assets` screen

Read-only with playground (background swap, size, theme), consistent with the other screens.
New components follow existing patterns (`components/preview/sections/*` + optional overlay).

- **Logo:** each variant on light/dark/brand-color backgrounds, with clear space and min-size test.
- **Icons:** grid read from `assets/icons`, with search and a size toggle.
- **Images:** gallery alongside the brand palette to check harmony.
- **Tone of voice:** rendered `voice.md` (markdown) as a reading panel.

## 4. What changes vs. what is preserved

**Preserved (already evolved — do not rebuild):**
`token-engine.ts`, `compute-token-vars.ts`, scales, theme inversion, the 4-key-color model,
color/typography/surface previews, the overlays-as-playground, routes `/colors`, `/typography`,
`/components`.

**Changes:**
- Source of truth: `default-config.ts` → `lib/brand-loader.ts` reading `brand/` (`default-config`
  becomes the demo/fallback brand).
- `font-loader.ts`: stops fetching fonts — only reads the declared family; real connection is the
  external agent's job.
- Product reframe: "create system" → "visualize/approve brand" (copy, titles, remove anything
  implying edits to the source of truth).
- Net-new: `/assets` route + assets section.

## 5. Documentation for agents (first-class requirement)

Everything must be clear and documented so other agents can understand the project and evolve it.

- `brand/README.md` — the contract explained field by field, with a filled example (the demo brand).
- `types/brand.ts` — the contract types, commented, as the canonical source.
- `AGENTS.md` (repo root) — how the project is organized, what the contract is, where to add things,
  patterns to follow — for the scaffold agent and future agents.
- `docs/architecture.md` — the `brand/ → loader → engine → screens` flow on one page.

## 6. Components & boundaries

- `lib/brand-loader.ts` — reads/validates `brand/*.json`, returns `{ config: TokenConfig, assets: BrandAssets }`.
  Single responsibility: parse + validate the contract. Depends on `types/brand.ts` only.
- `types/brand.ts` — canonical contract types (brand manifest, assets). Independent, no deps.
- `components/preview/sections/AssetsPreview*.tsx` — render assets; depend on `BrandAssets` + tokens.
- Existing engine/previews — unchanged consumers of `TokenConfig`.

## 7. Testing

- `brand-loader` validates the demo brand and rejects malformed contracts (missing files/fields)
  with clear errors — this is the surface the external agent depends on, so its errors must be legible.
- Each preview section renders from the demo brand without runtime errors (smoke).
- Theme toggle and size/scale playground operate without mutating the source `brand/` files.

## 8. Scope of this sub-project

Deliver: `brand/` contract + `lib/brand-loader.ts` + `types/brand.ts` + `/assets` route & section +
product reframe + agent documentation (`brand/README.md`, `AGENTS.md`, `docs/architecture.md`).
Fine polish of the existing screens can follow later.

## 9. Implementation refinements (as built)

Refinements made during implementation, kept consistent across code + docs:

- **Contract lives at `public/brand/`** (not repo root). One folder for the agent to populate,
  and asset files are served directly at `/brand/<path>` with no bundling step. The loader reads
  the JSON from there via `fs` server-side.
- **Tone of voice is structured JSON** in `assets.json` (`voice.summary` / `principles` / `dos` /
  `donts`), not a `voice.md` file — zero-dependency, deterministic to render, easier for the agent
  to fill.
- **`colors.json → status`** is part of the contract and validated, but the engine still renders
  fixed status colors today; wiring configurable status into `compute-token-vars.ts` is a noted
  follow-up (see `AGENTS.md`).
- **No test runner is installed**; rather than add one (out of scope), `brand-loader` validates at
  runtime and throws path-prefixed `[brand] …` errors — the surface the scaffolding agent depends on.
- Monochrome assets (icons, `mono` logo) render via CSS mask tinted to `var(--color-text)` so they
  stay visible on dark surfaces.
