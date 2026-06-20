# AGENTS.md — Brand Output Viewer

This project is a **replicable template, one deploy per brand**. It takes a
brand whose design tokens already exist and renders them as a read-only,
human-approval surface (with an interactive playground for sizes, scales, and
theme). It does **not** create tokens, and it does **not** scaffold itself —
an external agent copies this template per brand and fills in `public/brand/`.

> Previously this was a "Style System Creator". The v2 pivot (branch
> `v2-brand-output`) makes it a brand **viewer**. Design spec:
> [`docs/superpowers/specs/2026-06-20-v2-brand-output-design.md`](docs/superpowers/specs/2026-06-20-v2-brand-output-design.md).
> Architecture overview: [`docs/architecture.md`](docs/architecture.md).

## The one thing an agent changes: `public/brand/`

To configure a new brand, **only `public/brand/` changes**. It is the entire
input contract. See [`public/brand/README.md`](public/brand/README.md) for the
field-by-field reference and [`types/brand.ts`](types/brand.ts) for the types.

Do **not** edit `lib/default-config.ts`, the token engine, or the screens to set
up a brand — they are brand-agnostic and consume the contract.

## Data flow

```
public/brand/*.json  →  lib/brand-loader.ts  →  { manifest, assets, config:TokenConfig }
                                              │
   config ─→ token-engine ─→ compute-token-vars ─→ CSS vars ─→ all screens
   manifest, assets ─→ context/BrandContext ─→ TopBar + /assets screen
```

- `lib/brand-loader.ts` is the **only** reader of the contract. It validates and
  throws legible `[brand] …` errors. Add a contract field here, in
  `types/brand.ts`, and in `public/brand/README.md` together.
- The brand is loaded **server-side** in `app/layout.tsx` (no first-paint flash)
  and handed to the client via `BrandProvider` (static) + `TokenConfigProvider`
  (playground-mutable).

## Screens (`app/<route>/page.tsx` → `components/pages/<Name>Page.tsx`)

| Route | Page component | Content |
|-------|----------------|---------|
| `/` | `OverviewPreview` | Brand overview |
| `/typography` | `TypographyPage` | Type specimen + size/scale playground |
| `/colors` | `ColorsPage` | Color scales + semantic tokens |
| `/components` | `ComponentsPage` | Components on semantic tokens |
| `/assets` | `AssetsPage` | Logo / icons / imagery / tone of voice |

To add a screen, follow this pair pattern and add a `NAV_ITEMS` entry in
`components/layout/TopBar.tsx`. Use CSS vars (`var(--color-…)`, `var(--font-…)`)
for all styling — never hardcode brand values in a screen.

## Conventions

- **Tokens are the source of truth.** Screens read CSS vars produced by the
  engine; they never hardcode colors/sizes from a specific brand.
- **Playground is ephemeral.** The overlays let a reviewer test sizes/scales/
  theme; they never write back to `public/brand/`.
- **Fonts:** the contract only *declares* families. Connecting/hosting them is
  the agent's job (`lib/font-loader.ts` resolves known families and no-ops on
  unknown ones).
- **Read-only:** there is no approve/reject state or export gate — approval
  happens outside the app.

## Run

```
npm run dev -- -p 3002      # http://localhost:3002
```

## Known follow-ups

- `colors.json → status` is part of the contract but the engine still renders
  fixed status colors; wiring configurable status into `compute-token-vars.ts`
  is a pending follow-up.
- Fine visual polish of the pre-existing screens can continue independently.
