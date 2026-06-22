'use client';

import { useMemo } from 'react';
import { useTokenConfig } from '@/hooks/useTokenConfig';
import { useOverlay } from '@/context/OverlayContext';
import { resolveTokens } from '@/lib/token-engine';

type ScaleKey = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'bodyLg' | 'body' | 'bodySm' | 'caption';

const SCALE_META: Record<ScaleKey, { role: string; usesHeading: boolean; label: string }> = {
  h1:      { role: 'Display / Hero',     usesHeading: true,  label: 'H1' },
  h2:      { role: 'Page Title',         usesHeading: true,  label: 'H2' },
  h3:      { role: 'Section Heading',    usesHeading: true,  label: 'H3' },
  h4:      { role: 'Card Title',         usesHeading: true,  label: 'H4' },
  h5:      { role: 'Subsection',         usesHeading: true,  label: 'H5' },
  h6:      { role: 'Small Heading',      usesHeading: true,  label: 'H6' },
  bodyLg:  { role: 'Large Body Text',    usesHeading: false, label: 'Body Lg' },
  body:    { role: 'Default Body',       usesHeading: false, label: 'Body' },
  bodySm:  { role: 'Small Body',         usesHeading: false, label: 'Body Sm' },
  caption: { role: 'Caption / Label',    usesHeading: false, label: 'Caption' },
};

const SCALE_ORDER: ScaleKey[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'bodyLg', 'body', 'bodySm', 'caption'];

const SCALE_RATIOS: Record<number, string> = {
  1.067: 'Minor Second',
  1.125: 'Major Second',
  1.25:  'Major Third',
  1.333: 'Perfect Fourth',
  1.5:   'Perfect Fifth',
  1.618: 'Golden Ratio',
};

export function TypographyPage() {
  const config = useTokenConfig();
  const { openOverlay } = useOverlay();
  const resolved = useMemo(() => resolveTokens(config), [config]);

  const ratioLabel = SCALE_RATIOS[config.typography.scaleRatio] ?? `×${config.typography.scaleRatio}`;

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', minHeight: '100vh' }}>

      {/* ── Section Header ──────────────────────────────────────────────── */}
      <div
        className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="mb-12 flex items-start justify-between border-b pb-6"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-mono"
                  style={{ borderColor: 'var(--color-text-muted)', color: 'var(--color-text-muted)' }}
                >
                  1
                </span>
                <span
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Typography
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
                Type scale, font families and semantic tokens
              </p>
            </div>
          </div>
        </div>

        {/* ── Font Specimens ───────────────────────────────────────────── */}
        <div className="grid gap-0" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Heading */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => openOverlay('typography')}
            onKeyDown={(e) => e.key === 'Enter' && openOverlay('typography')}
            className="group relative py-10 pr-10 border-r cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span
              className="text-[9px] tracking-[0.2em] uppercase block mb-6"
              style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
            >
              --font-heading
            </span>
            <p
              className="leading-none mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--font-weight-heading)',
                fontSize: 'clamp(40px, 5vw, 80px)',
                color: 'var(--color-text)',
                letterSpacing: '-0.02em',
              }}
            >
              {config.typography.headingFamily}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Headings · Display · Hero
              <span className="mx-3 opacity-30">·</span>
              Weight {config.typography.headingWeight}
            </p>
            <span
              className="absolute top-4 right-4 text-[9px] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-primary)' }}
            >
              Click to edit →
            </span>
          </div>

          {/* Body */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => openOverlay('typography')}
            onKeyDown={(e) => e.key === 'Enter' && openOverlay('typography')}
            className="group relative py-10 pl-10 cursor-pointer"
          >
            <span
              className="text-[9px] tracking-[0.2em] uppercase block mb-6"
              style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
            >
              --font-body
            </span>
            <p
              className="leading-none mb-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--font-weight-body)',
                fontSize: 'clamp(32px, 4vw, 64px)',
                color: 'var(--color-text)',
                letterSpacing: '-0.01em',
              }}
            >
              {config.typography.bodyFamily}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Body · Inputs · Labels
              <span className="mx-3 opacity-30">·</span>
              Weight {config.typography.bodyWeight}
            </p>
            <span
              className="absolute top-4 right-4 text-[9px] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-primary)' }}
            >
              Click to edit →
            </span>
          </div>
        </div>
      </div>

      {/* ── Type Scale Table ─────────────────────────────────────────────── */}
      <div
        className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Column headers */}
        <div
          className="grid mb-2 pb-3 border-b"
          style={{
            gridTemplateColumns: '120px 1fr 160px 80px',
            borderColor: 'var(--color-border)',
          }}
        >
          {['token', 'sample', 'semantic role', 'size'].map((h) => (
            <span
              key={h}
              className="text-[9px] tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-text-muted)', opacity: 0.5, fontFamily: 'var(--font-geist-mono)' }}
            >
              {h}
            </span>
          ))}
        </div>

        {SCALE_ORDER.map((key) => {
          const meta = SCALE_META[key];
          const value = resolved.typography[key];
          return (
            <div
              key={key}
              className="grid items-center border-b py-5"
              style={{
                gridTemplateColumns: '120px 1fr 160px 80px',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Token name */}
              <code
                className="text-[10px] self-center"
                style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
              >
                --text-{key}
              </code>

              {/* Live sample */}
              <div className="overflow-hidden pr-4">
                <p
                  style={{
                    fontFamily: meta.usesHeading ? 'var(--font-heading)' : 'var(--font-body)',
                    fontWeight: meta.usesHeading ? 'var(--font-weight-heading)' : 'var(--font-weight-body)',
                    fontSize: `var(--text-${key})`,
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                  }}
                >
                  The quick brown fox
                </p>
              </div>

              {/* Semantic role */}
              <span
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {meta.label}
                <span className="mx-2 opacity-30">·</span>
                {meta.role}
              </span>

              {/* Computed value */}
              <code
                className="text-[10px]"
                style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
              >
                {value}
              </code>
            </div>
          );
        })}
      </div>

      {/* ── Settings Reference ───────────────────────────────────────────── */}
      <div
        className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p
          className="text-[9px] tracking-[0.2em] uppercase mb-8"
          style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
        >
          Configuration Reference
        </p>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {/* Heading config */}
          <div
            className="p-6 border"
            style={{
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-3)',
              backgroundColor: 'var(--color-surface-raised)',
            }}
          >
            <code
              className="text-[9px] block mb-4"
              style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
            >
              --font-heading
            </code>
            <p
              className="text-xl mb-1"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)' }}
            >
              {config.typography.headingFamily}
            </p>
            <p className="text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
              Weight: <code style={{ fontFamily: 'var(--font-geist-mono)' }}>{config.typography.headingWeight}</code>
            </p>
            <code
              className="text-[9px] block mt-2"
              style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
            >
              --font-weight-heading
            </code>
          </div>

          {/* Body config */}
          <div
            className="p-6 border"
            style={{
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-3)',
              backgroundColor: 'var(--color-surface-raised)',
            }}
          >
            <code
              className="text-[9px] block mb-4"
              style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
            >
              --font-body
            </code>
            <p
              className="text-xl mb-1"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontWeight: 'var(--font-weight-body)' }}
            >
              {config.typography.bodyFamily}
            </p>
            <p className="text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
              Weight: <code style={{ fontFamily: 'var(--font-geist-mono)' }}>{config.typography.bodyWeight}</code>
            </p>
            <code
              className="text-[9px] block mt-2"
              style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
            >
              --font-weight-body
            </code>
          </div>

          {/* Scale config */}
          <div
            className="p-6 border"
            style={{
              borderColor: 'var(--color-border)',
              borderRadius: 'var(--radius-3)',
              backgroundColor: 'var(--color-surface-raised)',
            }}
          >
            <code
              className="text-[9px] block mb-4"
              style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
            >
              --text-{'{'}key{'}'}
            </code>
            <p
              className="text-xl mb-1"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)' }}
            >
              {ratioLabel}
            </p>
            <p className="text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
              Base: <code style={{ fontFamily: 'var(--font-geist-mono)' }}>{config.typography.baseSize}px</code>
              <span className="mx-2 opacity-30">·</span>
              Ratio: <code style={{ fontFamily: 'var(--font-geist-mono)' }}>×{config.typography.scaleRatio}</code>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
