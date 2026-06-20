# Architecture — Brand Output Viewer

One picture of how a brand becomes pixels.

```
                         public/brand/                 ← the input contract (agent fills this)
                         ├── brand.json
                         ├── colors.json
                         ├── typography.json
                         ├── surface.json
                         ├── assets.json
                         └── assets/{logo,icons,images}
                                 │
                                 ▼
                       lib/brand-loader.ts             ← reads + validates (server-side, fs)
                                 │  throws [brand] … on bad input
                                 ▼
              ┌──────────────────┴───────────────────┐
              ▼                                       ▼
        config: TokenConfig                   { manifest, assets }
              │                                       │
              ▼                                       ▼
   lib/token-engine.ts                       context/BrandContext.tsx
   (resolveTokens)                           (BrandProvider — static)
              │                                       │
              ▼                                       ├─→ components/layout/TopBar.tsx (brand name)
   lib/compute-token-vars.ts                          └─→ components/pages/AssetsPage.tsx (/assets)
   (STEP_MAP lookups → CSS custom props)
              │
              ▼
   :root { --color-*, --font-*, --radius-*, --shadow-*, --space-* }
   (injected server-side in app/layout.tsx — no first-paint flash)
              │
              ▼
   All screens style from CSS vars only
   /  ·  /typography  ·  /colors  ·  /components  ·  /assets
```

## Layers

| Layer | Files | Responsibility |
|-------|-------|----------------|
| Contract | `public/brand/*`, `types/brand.ts` | The brand, as plain files + their types. |
| Loader | `lib/brand-loader.ts` | The **only** reader/validator of the contract → `LoadedBrand`. |
| Engine | `lib/token-engine.ts`, `lib/compute-token-vars.ts` | Derive scales + semantic tokens → CSS vars. **Brand-agnostic.** |
| SSR inject | `lib/token-css-server.ts`, `app/layout.tsx` | Emit `:root` vars server-side. |
| State | `context/BrandContext.tsx` (static), `context/TokenConfigContext.tsx` (playground) | Hand brand to the client; allow ephemeral playground edits. |
| Screens | `app/*/page.tsx` → `components/pages/*Page.tsx`, `components/preview/*` | Render from CSS vars + assets. Read-only. |

## Two kinds of state

- **`BrandContext`** — static identity (manifest + assets). Loaded once
  server-side, never changes at runtime.
- **`TokenConfig`** (via `TokenConfigContext`) — starts from the brand's config
  but the overlays/playground can tweak it for review. These tweaks are
  **ephemeral**; they never write back to `public/brand/`.

## Why the brand lives under `public/`

Putting the whole contract in `public/brand/` keeps it in **one place** the
external agent populates, and lets asset files (logos, icons, images) be served
directly at `/brand/<path>` with no extra bundling step. The loader reads the
JSON from the same folder via `fs` on the server.

See [`AGENTS.md`](../AGENTS.md) for conventions and
[`public/brand/README.md`](../public/brand/README.md) for the field reference.
