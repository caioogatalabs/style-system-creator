'use client';

import { useState, useEffect } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { preloadAllFonts } from '@/lib/font-loader';
import type { FontTarget } from '@/context/OverlayContext';

const FONT_LIST = [
  // Sans Serif
  'Inter', 'DM Sans', 'Plus Jakarta Sans', 'Outfit', 'Nunito', 'Lato', 'Roboto',
  'IBM Plex Sans', 'Manrope', 'Space Grotesk', 'Syne', 'Epilogue', 'Raleway',
  'Josefin Sans', 'Satoshi', 'General Sans', 'Switzer', 'Cabinet Grotesk', 'Supreme', 'Clash Display',
  // Serif
  'Source Serif 4', 'Playfair Display', 'DM Serif Display', 'Cormorant', 'Fraunces',
  'Libre Baskerville', 'Merriweather', 'Crimson Text',
  // Display
  'Bebas Neue',
];

const SCALE_RATIOS = [
  { label: 'Minor Second', value: 1.067 },
  { label: 'Major Second', value: 1.125 },
  { label: 'Minor Third', value: 1.200 },
  { label: 'Major Third', value: 1.250 },
  { label: 'Perfect Fourth', value: 1.333 },
  { label: 'Golden Ratio', value: 1.618 },
];

export function TypographyOverlayPanel() {
  const { config, dispatch } = useTokenConfigContext();
  const [activeTarget, setActiveTarget] = useState<FontTarget>('heading');
  const [search, setSearch] = useState('');

  useEffect(() => {
    preloadAllFonts();
  }, []);

  const activeFont =
    activeTarget === 'heading'
      ? config.typography.headingFamily
      : config.typography.bodyFamily;

  const filteredFonts = FONT_LIST.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  function selectFont(family: string) {
    if (activeTarget === 'heading') {
      dispatch({ type: 'SET_TYPOGRAPHY', patch: { headingFamily: family } });
    } else {
      dispatch({ type: 'SET_TYPOGRAPHY', patch: { bodyFamily: family } });
    }
  }

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 57px)' }}>
      {/* ── Left: specimen (70%) ── */}
      <div
        className="flex flex-col justify-end p-16 border-r"
        style={{ flex: '7', borderColor: 'var(--color-border-primary)' }}
      >
        {/* Target toggle */}
        <div className="mb-8 flex gap-1">
          {(['heading', 'body'] as FontTarget[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTarget(t)}
              className="px-4 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors"
              style={{
                backgroundColor: activeTarget === t ? 'var(--color-bg-fill-primary)' : 'transparent',
                color: activeTarget === t ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                borderRadius: 'var(--radius-component-sm)',
              }}
            >
              {t === 'heading' ? 'Heading' : 'Body'}
            </button>
          ))}
        </div>

        {/* Large specimen */}
        <p
          className="leading-none select-none mb-6"
          style={{
            fontFamily: `"${activeFont}", sans-serif`,
            fontWeight: activeTarget === 'heading'
              ? config.typography.headingWeight
              : config.typography.bodyWeight,
            fontSize: 'clamp(48px, 8vw, 140px)',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {activeFont}
        </p>

        {/* Alphabet */}
        <p
          className="mb-4 text-xl tracking-widest select-none"
          style={{
            fontFamily: `"${activeFont}", sans-serif`,
            color: 'var(--color-text-secondary)',
          }}
        >
          Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm
        </p>

        {/* Sentence */}
        <p
          className="text-lg leading-relaxed max-w-prose"
          style={{
            fontFamily: `"${activeFont}", sans-serif`,
            color: 'var(--color-text-secondary)',
          }}
        >
          The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
        </p>
      </div>

      {/* ── Right: controls (30%) ── */}
      <div
        className="flex flex-col overflow-auto p-8"
        style={{ flex: '3', minWidth: 0 }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search fonts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full border px-4 py-2.5 text-sm outline-none"
          style={{
            backgroundColor: 'var(--color-bg-surface-primary)',
            borderColor: 'var(--color-border-primary)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-component-sm)',
            fontFamily: 'var(--font-body)',
          }}
        />

        {/* Font list */}
        <div className="flex-1 overflow-auto mb-8">
          {filteredFonts.map((family) => (
            <button
              key={family}
              type="button"
              onClick={() => selectFont(family)}
              className="flex w-full items-center justify-between border-b py-3 text-left transition-opacity hover:opacity-100"
              style={{
                borderColor: 'var(--color-border-primary)',
                opacity: family === activeFont ? 1 : 0.5,
              }}
            >
              <span
                style={{
                  fontFamily: `"${family}", sans-serif`,
                  fontSize: '1.125rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                {family}
              </span>
              {family === activeFont && (
                <span
                  className="text-[9px] tracking-[0.15em] uppercase shrink-0"
                  style={{ color: 'var(--color-bg-fill-primary)' }}
                >
                  Active
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scale Ratio */}
        <div className="mb-6 shrink-0">
          <p className="mb-3 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
            Scale Ratio
          </p>
          <div className="flex flex-col gap-1">
            {SCALE_RATIOS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => dispatch({ type: 'SET_TYPOGRAPHY', patch: { scaleRatio: r.value } })}
                className="flex items-center justify-between px-3 py-2 text-left transition-colors"
                style={{
                  backgroundColor:
                    config.typography.scaleRatio === r.value
                      ? 'var(--color-bg-surface-primary)'
                      : 'transparent',
                  borderRadius: 'var(--radius-component-sm)',
                }}
              >
                <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {r.label}
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {r.value}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Base size */}
        <div className="shrink-0">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
              Base Size
            </p>
            <span className="font-mono text-xs" style={{ color: 'var(--color-text-primary)' }}>
              {config.typography.baseSize}px
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={24}
            step={1}
            value={config.typography.baseSize}
            onChange={(e) =>
              dispatch({ type: 'SET_TYPOGRAPHY', patch: { baseSize: Number(e.target.value) } })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
