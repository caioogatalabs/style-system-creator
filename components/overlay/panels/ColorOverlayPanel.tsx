'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { useOverlay } from '@/context/OverlayContext';
import { generateColorScale } from '@/lib/token-engine';
import type { PrimitiveColors } from '@/types/tokens';

const COLOR_META: Record<keyof PrimitiveColors, { label: string; description: string }> = {
  primary: { label: 'Primary', description: 'CTAs, buttons, interactive elements' },
  secondary: { label: 'Secondary', description: 'Text, typography, readable content' },
  accent: { label: 'Accent', description: 'Highlights, badges, decorative elements' },
  neutral:   { label: 'Neutral',   description: 'Backgrounds, borders, surfaces' },
  tertiary:  { label: 'Tertiary',  description: 'Dim labels, captions, decorative text' },
};

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? 'oklch(0.10 0 0)' : 'oklch(0.96 0 0)';
}

interface ColorOverlayPanelProps {
  colorKey: keyof PrimitiveColors;
}

export function ColorOverlayPanel({ colorKey }: ColorOverlayPanelProps) {
  const { config, dispatch } = useTokenConfigContext();
  const { closeOverlay } = useOverlay();

  // Local draft — does NOT write to global config until Apply
  const [hex, setHex] = useState(config.colors[colorKey]);
  const [inputValue, setInputValue] = useState(config.colors[colorKey].toUpperCase());
  const [error, setError] = useState(false);

  useEffect(() => {
    setHex(config.colors[colorKey]);
    setInputValue(config.colors[colorKey].toUpperCase());
    setError(false);
  }, [colorKey, config.colors]);

  const scale = useMemo(() => {
    try {
      return generateColorScale(hex);
    } catch {
      return null;
    }
  }, [hex]);

  // Updates local draft only — no dispatch
  function applyHex(value: string) {
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      setHex(normalized);
      setInputValue(normalized.toUpperCase());
      setError(false);
    } else {
      setError(true);
    }
  }

  function handleApply() {
    if (!error) {
      dispatch({ type: 'SET_COLOR', key: colorKey, value: hex });
    }
    closeOverlay();
  }

  const meta = COLOR_META[colorKey];
  const contrastColor = getContrastColor(hex);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 57px)' }}>
      <div className="flex flex-1">
        {/* ── Left: color preview + picker ── */}
        <div
          className="flex flex-col justify-end p-16 border-r transition-colors duration-300"
          style={{
            flex: '4',
            backgroundColor: hex,
            borderColor: 'var(--color-border-primary)',
          }}
        >
          <div className="mb-6">
            <p
              className="text-[10px] tracking-[0.2em] uppercase mb-2"
              style={{ color: contrastColor, opacity: 0.6 }}
            >
              {meta.label}
            </p>
            <p
              className="font-light leading-none mb-3"
              style={{
                color: contrastColor,
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(40px, 5vw, 80px)',
              }}
            >
              {hex.toUpperCase()}
            </p>
            <p
              className="text-sm"
              style={{ color: contrastColor, opacity: 0.7 }}
            >
              {meta.description}
            </p>
          </div>

          {/* Picker row */}
          <div className="flex items-center gap-3">
            <div
              className="relative h-10 w-10 overflow-hidden border shrink-0"
              style={{
                borderColor: `oklch(1 0 0 / 0.25)`,
                borderRadius: 'var(--radius-component-sm)',
              }}
            >
              <input
                type="color"
                value={hex}
                onChange={(e) => applyHex(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div className="h-full w-full" style={{ backgroundColor: hex }} />
            </div>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => applyHex(inputValue)}
              onKeyDown={(e) => e.key === 'Enter' && applyHex(inputValue)}
              maxLength={7}
              className="flex-1 border px-4 py-2.5 font-mono text-sm outline-none"
              style={{
                backgroundColor: 'oklch(0 0 0 / 0.25)',
                borderColor: error ? 'var(--color-error)' : `oklch(1 0 0 / 0.25)`,
                color: contrastColor,
                borderRadius: 'var(--radius-component-sm)',
              }}
            />
          </div>
          {error && (
            <p className="mt-2 text-xs" style={{ color: 'var(--color-error)' }}>
              Invalid hex color
            </p>
          )}
        </div>

        {/* ── Right: live scale ── */}
        <div
          className="flex flex-col p-8 overflow-auto"
          style={{ flex: '6' }}
        >
          <p
            className="mb-6 text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Generated Scale — {meta.label}
          </p>

          {scale ? (
            <div className="flex gap-1.5 flex-1" style={{ minHeight: 320 }}>
              {scale.map((step) => {
                const textColor = getContrastColor(step.hex);
                return (
                  <div
                    key={step.step}
                    className="flex flex-col justify-end rounded-sm p-3 transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: step.hex,
                      flex: 1,
                      minHeight: '320px',
                    }}
                  >
                    <p
                      className="font-mono text-[9px] mb-0.5"
                      style={{ color: textColor, opacity: 0.7 }}
                    >
                      {step.step}
                    </p>
                    <p
                      className="font-mono text-[9px]"
                      style={{ color: textColor, opacity: 0.9 }}
                    >
                      {step.hex.toUpperCase()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Enter a valid hex color
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer: Apply / Cancel ── */}
      <div
        className="flex items-center justify-between border-t px-8 py-4 shrink-0"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <button
          type="button"
          onClick={closeOverlay}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={error}
          className="px-6 py-2 text-xs tracking-[0.1em] uppercase transition-colors"
          style={{
            backgroundColor: error ? 'var(--color-border-primary)' : 'var(--color-bg-fill-primary)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-component-sm)',
            opacity: error ? 0.5 : 1,
          }}
        >
          Apply →
        </button>
      </div>
    </div>
  );
}
