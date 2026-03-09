'use client';

import { useState, useEffect, useRef } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { useOverlay } from '@/context/OverlayContext';
import type { TypographyOverlayPayload, FontTarget } from '@/context/OverlayContext';
import { preloadAllFonts } from '@/lib/font-loader';

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

const SCALE_STEPS = [
  { key: 'H1', exp: 7 },
  { key: 'H2', exp: 6 },
  { key: 'H3', exp: 5 },
  { key: 'H4', exp: 4 },
  { key: 'H5', exp: 3 },
  { key: 'H6', exp: 2 },
  { key: 'Body LG', exp: 1 },
  { key: 'Body', exp: 0 },
  { key: 'Body SM', exp: -1 },
  { key: 'Caption', exp: -2 },
];

export function TypographyOverlayPanel() {
  const { config, dispatch } = useTokenConfigContext();
  const { overlay, closeOverlay } = useOverlay();

  const typographyPayload = overlay.payload as TypographyOverlayPayload | undefined;
  const [activeTarget, setActiveTarget] = useState<FontTarget>(typographyPayload?.target ?? 'heading');
  const [search, setSearch] = useState('');

  // Local draft — does NOT write to global config until Apply
  const [draft, setDraft] = useState({
    headingFamily: config.typography.headingFamily,
    bodyFamily: config.typography.bodyFamily,
    headingWeight: config.typography.headingWeight,
    bodyWeight: config.typography.bodyWeight,
    baseSize: config.typography.baseSize,
    scaleRatio: config.typography.scaleRatio,
  });

  useEffect(() => {
    preloadAllFonts();
  }, []);

  const activeFont = activeTarget === 'heading' ? draft.headingFamily : draft.bodyFamily;
  const activeFontRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeFontRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeFont]);

  const filteredFonts = FONT_LIST.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  function selectFont(family: string) {
    if (activeTarget === 'heading') {
      setDraft((d) => ({ ...d, headingFamily: family }));
    } else {
      setDraft((d) => ({ ...d, bodyFamily: family }));
    }
  }

  // Compute scale table inline from draft values
  const scaleTable = SCALE_STEPS.map(({ key, exp }) => ({
    key,
    size: Math.round(draft.baseSize * Math.pow(draft.scaleRatio, exp)),
  }));

  function handleApply() {
    dispatch({ type: 'SET_TYPOGRAPHY', patch: draft });
    closeOverlay();
  }

  // Specimen size reacts to the scale — H1 for headings, Body for body
  const specimenSize = activeTarget === 'heading'
    ? scaleTable.find((s) => s.key === 'H1')!.size
    : scaleTable.find((s) => s.key === 'Body')!.size;

  return (
    <div className="flex flex-col h-full">
      {/* Main content — left specimen (fixed) + right controls (scrollable) */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left: specimen (70%) — no scroll ── */}
        <div
          className="flex flex-col justify-end p-16 border-r shrink-0"
          style={{ flex: '7', borderColor: 'var(--color-border)' }}
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
                  backgroundColor: activeTarget === t ? 'var(--color-primary)' : 'transparent',
                  color: activeTarget === t ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                  borderRadius: 'var(--radius-1)',
                }}
              >
                {t === 'heading' ? 'Heading' : 'Body'}
              </button>
            ))}
          </div>

          {/* Large specimen — size reacts to base size + scale ratio */}
          <p
            className="leading-none select-none mb-6 transition-all duration-200"
            style={{
              fontFamily: `"${activeFont}", sans-serif`,
              fontWeight: activeTarget === 'heading' ? draft.headingWeight : draft.bodyWeight,
              fontSize: `clamp(48px, ${specimenSize}px, 140px)`,
              color: 'var(--color-text)',
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
              color: 'var(--color-text-muted)',
            }}
          >
            Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm
          </p>

          {/* Sentence — uses derived Body size */}
          <p
            className="leading-relaxed max-w-prose"
            style={{
              fontFamily: `"${activeFont}", sans-serif`,
              fontSize: `${scaleTable.find((s) => s.key === 'Body')!.size}px`,
              color: 'var(--color-text-muted)',
            }}
          >
            The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
          </p>
        </div>

        {/* ── Right: controls (30%) — internal scroll ── */}
        <div
          className="flex flex-col min-h-0"
          style={{ flex: '3', minWidth: 0 }}
        >
          {/* Search — sticky top */}
          <div className="shrink-0 p-8 pb-0">
            <input
              type="text"
              placeholder="Search fonts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 w-full border px-4 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-1)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Font list — only this scrolls */}
          <div className="flex-1 overflow-auto px-8">
            {filteredFonts.map((family) => (
              <button
                key={family}
                ref={family === activeFont ? activeFontRef : undefined}
                type="button"
                onClick={() => selectFont(family)}
                className="flex w-full items-center justify-between border-b py-3 text-left transition-opacity hover:opacity-100"
                style={{
                  borderColor: 'var(--color-border)',
                  opacity: family === activeFont ? 1 : 0.5,
                }}
              >
                <span
                  style={{
                    fontFamily: `"${family}", sans-serif`,
                    fontSize: '1.125rem',
                    color: 'var(--color-text)',
                  }}
                >
                  {family}
                </span>
                {family === activeFont && (
                  <span
                    className="text-[9px] tracking-[0.15em] uppercase shrink-0"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Scale controls — fixed at bottom of right panel */}
          <div className="shrink-0 px-8 py-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {/* Scale Ratio */}
            <div className="mb-5">
              <p className="mb-2 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                Scale Ratio
              </p>
              <div className="flex flex-wrap gap-1">
                {SCALE_RATIOS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, scaleRatio: r.value }))}
                    className="px-3 py-1.5 text-left transition-colors"
                    style={{
                      backgroundColor:
                        draft.scaleRatio === r.value
                          ? 'var(--color-surface-raised)'
                          : 'transparent',
                      borderRadius: 'var(--radius-1)',
                    }}
                  >
                    <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                      {r.label}
                    </span>
                    <span className="font-mono text-[10px] ml-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      {r.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Base size slider */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  Base Size
                </p>
                <span className="font-mono text-xs" style={{ color: 'var(--color-text)' }}>
                  {draft.baseSize}px
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={24}
                step={1}
                value={draft.baseSize}
                onChange={(e) => setDraft((d) => ({ ...d, baseSize: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer: Apply / Cancel — always visible ── */}
      <div
        className="flex items-center justify-between border-t px-8 py-4 shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          type="button"
          onClick={closeOverlay}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            borderRadius: 'var(--radius-1)',
          }}
        >
          Apply →
        </button>
      </div>
    </div>
  );
}
