'use client';

import { useMemo } from 'react';
import { useTokenConfig } from '@/hooks/useTokenConfig';
import { useOverlay } from '@/context/OverlayContext';
import { resolveTokens } from '@/lib/token-engine';
import { hexToOklch, oklchToHex } from '@/lib/color-utils';
import type { ColorStep, PrimitiveColors } from '@/types/tokens';

// ── WCAG Contrast ───────────────────────────────────────────────────────────

function relativeLuminance(hex: string): number {
  const linearize = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'oklch(0.10 0 0)' : 'oklch(0.96 0 0)';
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ letter, num, label }: { letter: string; num: string; label: string }) {
  return (
    <div
      className="mb-10 flex items-start gap-6 border-b pb-6"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <span
        className="font-mono text-7xl font-light leading-none select-none"
        style={{ color: 'var(--color-border)' }}
      >
        {letter}
      </span>
      <div className="flex items-center gap-3 pt-4">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-mono"
          style={{ borderColor: 'var(--color-text-muted)', color: 'var(--color-text-muted)' }}
        >
          {num}
        </span>
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function TokenTag({ name }: { name: string }) {
  return (
    <code
      style={{
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '9px',
        color: 'var(--color-text-dim)',
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-1)',
        padding: '2px 6px',
        display: 'inline-block',
      }}
    >
      {name}
    </code>
  );
}

function SwatchCell({ step, isSeed }: { step: ColorStep; isSeed: boolean }) {
  const textColor = getContrastColor(step.hex);
  return (
    <div
      className="flex flex-col justify-end p-2 flex-1 min-w-0 transition-transform hover:scale-[1.03]"
      style={{
        backgroundColor: step.hex,
        aspectRatio: '1 / 1.4',
        outline: isSeed ? `2px solid ${textColor}` : 'none',
        outlineOffset: isSeed ? '-2px' : '0',
      }}
    >
      <p className="text-[8px] font-mono mb-0.5" style={{ color: textColor, opacity: 0.7 }}>
        {step.step}
      </p>
      <p className="text-[7px] font-mono" style={{ color: textColor, opacity: 0.5 }}>
        {step.hex.toUpperCase()}
      </p>
    </div>
  );
}

const COLOR_NAMES = ['primary', 'secondary', 'accent', 'neutral'] as const;
const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  neutral: 'Neutral',
};
const COLOR_DESC: Record<string, string> = {
  primary:   'CTAs, buttons, interactive fills',
  secondary: 'Typography, text color hue source',
  accent:    'Highlights, badges, attention',
  neutral:   'Backgrounds, borders, surfaces',
};

// ── Main Page ───────────────────────────────────────────────────────────────

export function ColorsPage() {
  const config = useTokenConfig();
  const { openOverlay } = useOverlay();
  const resolved = useMemo(() => resolveTokens(config), [config]);
  const scales = resolved.colorScales;

  // Derive hex values for semantic colors (mirrors computeTokenVars math)
  const { h: neutralH, c: neutralC } = hexToOklch(config.colors.neutral);
  const { h: secondaryH, c: secondaryC } = hexToOklch(config.colors.secondary);
  const { h: primaryH } = hexToOklch(config.colors.primary);
  const bgChroma = Math.min(neutralC * 0.30, 0.008);
  const bgHex         = oklchToHex(0.08, bgChroma, neutralH);
  const bgSurfaceHex  = oklchToHex(0.12, bgChroma, neutralH);
  const textPrimaryHex   = oklchToHex(0.95, Math.min(secondaryC * 0.08, 0.012), secondaryH);
  const textSecondaryHex = oklchToHex(0.55, Math.min(secondaryC * 0.10, 0.015), secondaryH);
  const textInverseHex   = oklchToHex(0.97, 0.01, primaryH);
  const fillPrimaryHex   = config.colors.primary;

  const contrastPairs = [
    { label: 'text-primary on bg',           fg: textPrimaryHex,   bg: bgHex          },
    { label: 'text-secondary on bg',         fg: textSecondaryHex, bg: bgHex          },
    { label: 'text-inverse on fill-primary', fg: textInverseHex,   bg: fillPrimaryHex },
    { label: 'text-primary on surface',      fg: textPrimaryHex,   bg: bgSurfaceHex   },
  ];

  const STATE_COLORS = [
    { key: 'danger',  label: 'Danger',  hex: resolved.semanticColors.error   },
    { key: 'warning', label: 'Warning', hex: resolved.semanticColors.warning },
    { key: 'success', label: 'Success', hex: resolved.semanticColors.success },
    { key: 'info',    label: 'Info',    hex: resolved.semanticColors.info    },
  ] as const;

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', minHeight: '100vh' }}>

      {/* ── 1. Primitive Scales ─────────────────────────────────────────── */}
      <section
        className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <SectionHeader letter="E" num="1" label="Primitive Color Scales" />

        <div className="flex flex-col gap-10">
          {COLOR_NAMES.map((name) => {
            const scale = scales[name];
            const seedHex = config.colors[name as keyof PrimitiveColors].toLowerCase();
            return (
              <div
                key={name}
                role="button"
                tabIndex={0}
                onClick={() => openOverlay('color', { colorKey: name as keyof PrimitiveColors })}
                onKeyDown={(e) => e.key === 'Enter' && openOverlay('color', { colorKey: name as keyof PrimitiveColors })}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: config.colors[name as keyof PrimitiveColors] }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                    >
                      {COLOR_LABELS[name]}
                    </span>
                    <code
                      className="text-[10px]"
                      style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {seedHex.toUpperCase()}
                    </code>
                    <span
                      className="text-xs hidden group-hover:inline"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      · {COLOR_DESC[name]}
                    </span>
                  </div>
                  <span
                    className="text-[9px] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-geist-mono)' }}
                  >
                    Edit →
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {scale.map((step) => {
                    const isSeed = step.hex.toLowerCase() === seedHex;
                    return <SwatchCell key={step.step} step={step} isSeed={isSeed} />;
                  })}
                </div>
                <div className="flex gap-0.5 mt-1">
                  {scale.map((step) => (
                    <div key={step.step} className="flex-1 text-center">
                      <code
                        className="text-[7px]"
                        style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
                      >
                        --color-{name}-{step.step}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2. Semantic Surface ─────────────────────────────────────────── */}
      <section
        className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <SectionHeader letter="F" num="2" label="Semantic Surfaces" />
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { varName: '--color-surface',             label: 'Page Background',   hex: bgHex        },
            { varName: '--color-surface-raised', label: 'Surface / Card',    hex: bgSurfaceHex },
          ].map(({ varName, label, hex }) => (
            <div key={varName}>
              <div
                className="mb-2"
                style={{
                  backgroundColor: hex,
                  height: '120px',
                  borderRadius: 'var(--radius-2)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <TokenTag name={varName} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <code
                className="text-[10px]"
                style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}
              >
                {hex.toUpperCase()}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Semantic Text ────────────────────────────────────────────── */}
      <section
        className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <SectionHeader letter="G" num="3" label="Semantic Text Colors" />
        <div
          className="p-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-3)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex flex-col gap-8">
            {[
              { varName: '--color-text',   label: 'Primary Text',   sample: 'The quick brown fox jumps over the lazy dog' },
              { varName: '--color-text-muted',  label: 'Secondary Text', sample: 'Used for subtitles, descriptions, and supporting copy' },
              { varName: '--color-text-dim',   label: 'Dim Text',       sample: 'Dim labels, captions, and decorative elements' },
            ].map(({ varName, label, sample }) => (
              <div key={varName} className="flex items-baseline gap-6">
                <div className="w-48 shrink-0">
                  <TokenTag name={varName} />
                  <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-dim)' }}>{label}</p>
                </div>
                <p
                  className="text-lg"
                  style={{ color: `var(${varName})`, fontFamily: 'var(--font-body)', fontWeight: 'var(--font-weight-body)' }}
                >
                  {sample}
                </p>
              </div>
            ))}

            {/* Inverse on fill */}
            <div className="flex items-baseline gap-6">
              <div className="w-48 shrink-0">
                <TokenTag name="--color-on-primary" />
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-dim)' }}>Inverse Text</p>
              </div>
              <div
                className="px-4 py-2"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: 'var(--radius-2)',
                }}
              >
                <p
                  className="text-lg"
                  style={{ color: 'var(--color-on-primary)', fontFamily: 'var(--font-body)' }}
                >
                  White text on primary fill
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Semantic Fills ───────────────────────────────────────────── */}
      <section
        className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <SectionHeader letter="H" num="4" label="Semantic Fill Colors" />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {[
            { varName: '--color-primary',         label: 'Primary',         hex: scales.primary[5].hex   },
            { varName: '--color-primary-hover',   label: 'Primary Hover',   hex: scales.primary[6].hex   },
            { varName: '--color-primary-active',  label: 'Primary Active',  hex: scales.primary[7].hex   },
            { varName: '--color-secondary',       label: 'Secondary',       hex: scales.secondary[5].hex },
            { varName: '--color-secondary-hover', label: 'Secondary Hover', hex: scales.secondary[6].hex },
            { varName: '--color-accent',          label: 'Accent',          hex: scales.accent[5].hex    },
            { varName: '--color-accent-hover',    label: 'Accent Hover',    hex: scales.accent[6].hex    },
          ].map(({ varName, label, hex }) => {
            const textColor = getContrastColor(hex);
            return (
              <div key={varName}>
                <div
                  className="mb-2 flex items-end p-3"
                  style={{
                    backgroundColor: `var(${varName})`,
                    height: '80px',
                    borderRadius: 'var(--radius-2)',
                  }}
                >
                  <code className="text-[8px] font-mono" style={{ color: textColor, opacity: 0.8 }}>
                    {hex.toUpperCase()}
                  </code>
                </div>
                <TokenTag name={varName} />
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. Semantic Borders ─────────────────────────────────────────── */}
      <section
        className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <SectionHeader letter="I" num="5" label="Semantic Borders" />
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[
            { varName: '--color-border',   label: 'Primary Border',   desc: 'Dividers, section separators' },
            { varName: '--color-border-muted',  label: 'Secondary Border', desc: 'Subtle outlines, input borders' },
          ].map(({ varName, label, desc }) => (
            <div key={varName}>
              <div
                className="p-6 mb-3"
                style={{
                  border: `2px solid var(${varName})`,
                  borderRadius: 'var(--radius-3)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Border example
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
                  Inner content with {label.toLowerCase()}
                </p>
              </div>
              <TokenTag name={varName} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. State Colors ─────────────────────────────────────────────── */}
      <section
        className="px-6 py-16 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <SectionHeader letter="J" num="6" label="State Colors" />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATE_COLORS.map(({ key, label, hex }) => (
            <div
              key={key}
              className="p-5"
              style={{
                backgroundColor: `var(--color-${key}-muted)`,
                borderRadius: 'var(--radius-3)',
                border: `1px solid color-mix(in oklch, var(--color-${key}) 30%, transparent)`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: hex }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: `var(--color-${key})`, fontFamily: 'var(--font-heading)' }}
                >
                  {label}
                </span>
              </div>
              <p
                className="text-xs mb-4"
                style={{ color: `var(--color-${key})`, opacity: 0.8 }}
              >
                {label === 'Danger'  && 'Action cannot be undone or has failed'}
                {label === 'Warning' && 'Proceed with caution, review required'}
                {label === 'Success' && 'Operation completed successfully'}
                {label === 'Info'    && 'Informational message or notice'}
              </p>
              <div className="flex flex-col gap-1">
                <TokenTag name={`--color-${key}`} />
                {key !== 'info' && <TokenTag name={`--color-${key}-muted`} />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Accessibility Checker ─────────────────────────────────────── */}
      <section
        className="px-6 py-16"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <SectionHeader letter="K" num="7" label="WCAG Contrast Checker" />
        <div className="flex flex-col gap-3">
          {contrastPairs.map(({ label, fg, bg }) => {
            const ratio = contrastRatio(fg, bg);
            const aaPass  = ratio >= 4.5;
            const aaaPass = ratio >= 7.0;
            const aaLarge = ratio >= 3.0;

            return (
              <div
                key={label}
                className="flex items-center gap-6 p-5"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-2)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* Color preview */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: bg,
                    width: '120px',
                    height: '48px',
                    borderRadius: 'var(--radius-1)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: fg }}>
                    Aa
                  </span>
                </div>

                {/* Label */}
                <div className="flex-1">
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>{label}</p>
                  <div className="flex gap-2 mt-1">
                    <code className="text-[9px]" style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}>{fg.toUpperCase()}</code>
                    <span className="text-[9px]" style={{ color: 'var(--color-text-dim)' }}>on</span>
                    <code className="text-[9px]" style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-geist-mono)' }}>{bg.toUpperCase()}</code>
                  </div>
                </div>

                {/* Ratio */}
                <div className="text-center shrink-0">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {ratio.toFixed(1)}:1
                  </p>
                </div>

                {/* Badges */}
                <div className="flex gap-2 shrink-0">
                  <span
                    className="text-[9px] font-mono px-2 py-1 rounded"
                    style={{
                      backgroundColor: aaPass ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
                      color: aaPass ? 'var(--color-success)' : 'var(--color-danger)',
                    }}
                  >
                    AA {aaPass ? 'PASS' : 'FAIL'}
                  </span>
                  <span
                    className="text-[9px] font-mono px-2 py-1 rounded"
                    style={{
                      backgroundColor: aaaPass ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
                      color: aaaPass ? 'var(--color-success)' : 'var(--color-danger)',
                    }}
                  >
                    AAA {aaaPass ? 'PASS' : 'FAIL'}
                  </span>
                  <span
                    className="text-[9px] font-mono px-2 py-1 rounded"
                    style={{
                      backgroundColor: aaLarge ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
                      color: aaLarge ? 'var(--color-success)' : 'var(--color-danger)',
                    }}
                  >
                    AA Large {aaLarge ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p
          className="text-xs mt-4"
          style={{ color: 'var(--color-text-dim)' }}
        >
          WCAG 2.1 — AA requires ≥4.5:1 for normal text, ≥3:1 for large text. AAA requires ≥7:1 for normal text.
        </p>
      </section>

    </div>
  );
}
