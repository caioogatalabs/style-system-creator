'use client';

import { useState } from 'react';
import { useBrand } from '@/context/BrandContext';
import { useTokenConfig } from '@/hooks/useTokenConfig';
import { Check, X } from 'lucide-react';

/*
 * Reference implementation for the Tailwind v4 token utilities.
 * Static design-token styling uses utilities (bg-surface, text-text-muted,
 * border-border, font-heading, text-success…); only genuinely dynamic values
 * (the selected background, icon size, grid template counts) stay inline.
 */

// ── Section header (matches the other pages' editorial style) ─────────────────

function SectionHeader({ num, label, desc }: { num: string; label: string; desc?: string }) {
  return (
    <div className="mb-10 border-b border-border pb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-text-muted text-[9px] font-mono text-text-muted">
          {num}
        </span>
        <span className="text-xs tracking-[0.2em] uppercase text-text-muted">{label}</span>
      </div>
      {desc && <p className="text-sm mt-1 text-text-dim">{desc}</p>}
    </div>
  );
}

// ── Background swatches used by the logo playground ───────────────────────────

const LOGO_BACKGROUNDS = [
  { id: 'surface', label: 'Surface', value: 'var(--color-surface)' },
  { id: 'raised', label: 'Raised', value: 'var(--color-surface-raised)' },
  { id: 'primary', label: 'Primary', value: 'var(--color-primary)' },
  { id: 'light', label: 'Light', value: '#ffffff' },
] as const;

const ICON_SIZES = [20, 24, 32, 48] as const;

// Brand palette swatches shown next to imagery (utility classes for tinting).
const PALETTE_SWATCHES = ['bg-primary', 'bg-brand-secondary', 'bg-brand-accent', 'bg-text-muted'];

/** A small selectable pill used by the playground toolbars. */
function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase rounded transition-colors border ${
        active ? 'text-text border-text' : 'text-text-muted border-border'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Renders a monochrome SVG tinted to the current text color via CSS mask.
 * SVGs loaded through <img> render their own `currentColor` as black, which
 * vanishes on dark surfaces — masking makes them adopt the text color.
 */
function MaskedSvg({ url, width, height }: { url: string; width: number | string; height: number | string }) {
  return (
    <span
      aria-hidden
      className="inline-block bg-text"
      style={{
        width,
        height,
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

export function AssetsPage() {
  const { manifest, assets } = useBrand();
  // Subscribing keeps the page reactive to theme/token changes from the playground.
  useTokenConfig();

  const [logoBg, setLogoBg] = useState<(typeof LOGO_BACKGROUNDS)[number]['id']>('surface');
  const [iconSize, setIconSize] = useState<number>(24);

  const activeBg = LOGO_BACKGROUNDS.find((b) => b.id === logoBg) ?? LOGO_BACKGROUNDS[0];

  return (
    <div className="bg-surface min-h-screen">

      {/* ── 1. Logo ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 border-b border-border">
        <SectionHeader num="1" label="Logo" desc={`${assets.logo.length} variants — test on different backgrounds.`} />

        {/* Background playground */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[10px] tracking-[0.15em] uppercase mr-2 text-text-muted">Background</span>
          {LOGO_BACKGROUNDS.map((bg) => (
            <ToggleButton key={bg.id} active={logoBg === bg.id} onClick={() => setLogoBg(bg.id)}>
              {bg.label}
            </ToggleButton>
          ))}
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(assets.logo.length, 3)}, 1fr)` }}>
          {assets.logo.map((logo) => (
            <div key={logo.id} className="flex flex-col">
              <div
                className="flex items-center justify-center rounded p-10 border border-border"
                style={{ backgroundColor: activeBg.value, minHeight: 160 }}
              >
                {logo.variant === 'mono' ? (
                  <MaskedSvg url={`/brand/${logo.file}`} width={180} height={48} />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={`/brand/${logo.file}`} alt={logo.label} style={{ maxHeight: 64, maxWidth: '100%' }} />
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text">{logo.label}</span>
                <span className="text-[9px] font-mono tracking-[0.1em] uppercase text-text-muted">{logo.variant}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Icons ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 border-b border-border">
        <SectionHeader num="2" label="Icons" desc={`${assets.icons.files.length} icons · ${assets.icons.style} style.`} />

        <div className="flex items-center gap-2 mb-8">
          <span className="text-[10px] tracking-[0.15em] uppercase mr-2 text-text-muted">Size</span>
          {ICON_SIZES.map((s) => (
            <ToggleButton key={s} active={iconSize === s} onClick={() => setIconSize(s)}>
              {s}px
            </ToggleButton>
          ))}
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
          {assets.icons.files.map((icon) => (
            <div key={icon.name} className="flex flex-col items-center justify-center gap-3 rounded py-8 border border-border">
              <MaskedSvg url={icon.url} width={iconSize} height={iconSize} />
              <span className="text-[9px] font-mono text-text-muted">{icon.name.replace('.svg', '')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Images ────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 border-b border-border">
        <SectionHeader num="3" label="Imagery" desc="Key images checked against the brand palette." />

        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {assets.images.map((img) => (
            <div key={img.id} className="flex flex-col">
              <div className="overflow-hidden rounded border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/brand/${img.file}`} alt={img.label} style={{ width: '100%', display: 'block' }} />
              </div>
              <div className="flex items-center gap-2 mt-3">
                {PALETTE_SWATCHES.map((cls) => (
                  <span key={cls} className={`h-4 w-4 rounded-full border border-border ${cls}`} />
                ))}
                <span className="text-xs ml-2 text-text">{img.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Tone of voice ─────────────────────────────────────────────── */}
      <section className="px-6 py-16 text-text">
        <SectionHeader num="4" label="Tone of Voice" desc={manifest.name + ' speaks like this.'} />

        <p className="text-xl leading-relaxed mb-12 max-w-2xl text-text font-heading">
          {assets.voice.summary}
        </p>

        <div className="grid gap-8 mb-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {assets.voice.principles.map((p) => (
            <div key={p.title} className="rounded p-6 border border-border">
              <h3 className="text-sm mb-2 text-text">{p.title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{p.description}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase mb-4 flex items-center gap-2 text-success">
              <Check size={12} /> Do
            </p>
            <ul className="flex flex-col gap-2">
              {assets.voice.dos.map((d, i) => (
                <li key={i} className="text-sm text-text-muted">{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase mb-4 flex items-center gap-2 text-danger">
              <X size={12} /> Don't
            </p>
            <ul className="flex flex-col gap-2">
              {assets.voice.donts.map((d, i) => (
                <li key={i} className="text-sm text-text-muted">{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
