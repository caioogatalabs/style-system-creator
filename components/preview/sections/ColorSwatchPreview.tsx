'use client';

import { useMemo } from 'react';
import { useTokenConfig } from '@/hooks/useTokenConfig';
import { useOverlay } from '@/context/OverlayContext';
import { generateAllColorScales } from '@/lib/token-engine';
import type { ColorStep, PrimitiveColors } from '@/types/tokens';

const COLOR_NAMES = ['primary', 'secondary', 'accent', 'neutral', 'tertiary'] as const;
const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  neutral: 'Neutral',
  tertiary: 'Tertiary',
};

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'oklch(0.10 0 0)' : 'oklch(0.96 0 0)';
}

function SwatchCell({ step, index }: { step: ColorStep; index: number }) {
  const textColor = getContrastColor(step.hex);

  return (
    <div
      className="flex flex-col justify-end p-3 transition-transform hover:scale-[1.02]"
      style={{
        backgroundColor: step.hex,
        aspectRatio: index === 0 ? '1.6 / 1' : '1 / 1',
        flexGrow: index === 0 ? 2 : 1,
        minWidth: 0,
      }}
    >
      <p className="text-[9px] font-mono tracking-[0.1em] mb-0.5" style={{ color: textColor, opacity: 0.6 }}>
        {step.step}
      </p>
      <p className="text-[9px] font-mono" style={{ color: textColor, opacity: 0.8 }}>
        {step.hex.toUpperCase()}
      </p>
    </div>
  );
}

export function ColorSwatchPreview() {
  const config = useTokenConfig();
  const { openOverlay } = useOverlay();
  const scales = useMemo(() => generateAllColorScales(config.colors), [config.colors]);

  return (
    <section
      className="border-b px-6 py-16"
      style={{
        borderColor: 'var(--color-border-var)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Section header */}
      <div
        className="mb-12 flex items-start gap-6 border-b pb-6"
        style={{ borderColor: 'var(--color-border-var)' }}
      >
        <span
          className="font-mono text-7xl font-light leading-none select-none"
          style={{ color: 'var(--color-border-primary)' }}
        >
          B
        </span>
        <div className="flex items-center gap-3 pt-4">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-mono"
            style={{ borderColor: 'var(--color-fg-muted)', color: 'var(--color-fg-muted)' }}
          >
            1
          </span>
          <span
            className="text-xs tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            Colors
          </span>
        </div>
      </div>

      {/* Main color blocks (first 5 steps shown large) */}
      <div className="mb-8 flex gap-2">
        {COLOR_NAMES.map((name, colorIdx) => {
          const scale = scales[name];
          const midStep = scale[6]; // step 600
          const textColor = getContrastColor(midStep.hex);
          return (
            <div
              key={name}
              role="button"
              tabIndex={0}
              onClick={() => openOverlay('color', { colorKey: name as keyof PrimitiveColors })}
              onKeyDown={(e) => e.key === 'Enter' && openOverlay('color', { colorKey: name as keyof PrimitiveColors })}
              className="group relative flex flex-col justify-end rounded-sm p-5 cursor-pointer"
              style={{
                backgroundColor: midStep.hex,
                flex: colorIdx === 0 ? '2.5' : '1',
                minHeight: '160px',
              }}
            >
              <span
                className="absolute top-3 right-3 text-[9px] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-80 transition-opacity"
                style={{ color: textColor }}
              >
                Edit →
              </span>
              <p
                className="text-[9px] tracking-[0.2em] uppercase mb-1"
                style={{ color: textColor, opacity: 0.6 }}
              >
                K{colorIdx + 1}
              </p>
              <p
                className="text-sm font-medium mb-2"
                style={{ color: textColor, fontFamily: 'var(--font-heading)' }}
              >
                {COLOR_LABELS[name]}
              </p>
              <p
                className="font-mono text-xs"
                style={{ color: textColor, opacity: 0.8 }}
              >
                hex: {midStep.hex.toUpperCase()}
              </p>
              <p
                className="font-mono text-[10px]"
                style={{ color: textColor, opacity: 0.6 }}
              >
                rgba: {midStep.rgb.r}, {midStep.rgb.g}, {midStep.rgb.b}, 255
              </p>
            </div>
          );
        })}
      </div>

      {/* Full scale rows */}
      {COLOR_NAMES.map((name) => (
        <div key={name} className="mb-4">
          <p
            className="mb-2 text-[9px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-fg-muted)', opacity: 0.5 }}
          >
            {COLOR_LABELS[name]} scale
          </p>
          <div className="flex gap-0.5">
            {scales[name].map((step, i) => (
              <SwatchCell key={step.step} step={step} index={i} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
