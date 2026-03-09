'use client';

import { useState } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { useOverlay } from '@/context/OverlayContext';
import type { SurfaceOverlayPayload, SurfaceTab } from '@/context/OverlayContext';
import type { ElevationLevel } from '@/types/tokens';

const RADIUS_PRESETS: { label: string; value: number }[] = [
  { label: 'None', value: 0 },
  { label: 'Small', value: 4 },
  { label: 'Med', value: 8 },
  { label: 'Large', value: 16 },
  { label: 'Full', value: 9999 },
];

const ELEVATION_OPTIONS: { value: ElevationLevel; label: string; description: string }[] = [
  { value: 'flat', label: 'Flat', description: 'No shadows' },
  { value: 'subtle', label: 'Subtle', description: 'Soft, minimal depth' },
  { value: 'elevated', label: 'Elevated', description: 'Visible depth' },
  { value: 'floating', label: 'Floating', description: 'Strong depth, modals' },
];

const BORDER_PRESETS = [
  { label: 'None', width: '0px', opacity: 0 },
  { label: 'Whisper', width: '1px', opacity: 0.04 },
  { label: 'Subtle', width: '1px', opacity: 0.08 },
  { label: 'Visible', width: '1px', opacity: 0.14 },
  { label: 'Medium', width: '2px', opacity: 0.14 },
  { label: 'Strong', width: '2px', opacity: 0.22 },
];

const BORDER_STYLES = ['solid', 'dashed', 'dotted'] as const;

function LivePreview({
  borderWidth = '1px',
  borderStyle = 'solid',
  borderOpacity = 0.14,
}: {
  borderWidth?: string;
  borderStyle?: string;
  borderOpacity?: number;
}) {
  const borderColor = `oklch(0.60 0 0 / ${borderOpacity})`;
  return (
    <div className="flex gap-8 items-start flex-wrap">
      {/* Card */}
      <div
        className="p-6"
        style={{
          border: `${borderWidth} ${borderStyle} ${borderColor}`,
          borderRadius: 'var(--radius-3)',
          boxShadow: 'var(--shadow-2)',
          backgroundColor: 'var(--color-surface-raised)',
          width: 220,
        }}
      >
        <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Card
        </p>
        <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
          Card Title
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Surface preview with current tokens applied.
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>Input</p>
          <input
            type="text"
            placeholder="Input placeholder..."
            readOnly
            className="px-4 py-2.5 text-sm outline-none"
            style={{
              border: `${borderWidth} ${borderStyle} ${borderColor}`,
              borderRadius: 'var(--radius-2)',
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              width: 200,
              display: 'block',
            }}
          />
        </div>
        <div>
          <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>:focus</p>
          <input
            type="text"
            defaultValue="focus"
            readOnly
            className="px-4 py-2.5 text-sm outline-none"
            style={{
              border: `2px solid var(--color-primary)`,
              borderRadius: 'var(--radius-2)',
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              width: 200,
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Buttons</p>
        <button
          className="px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            borderRadius: 'var(--radius-2)',
            border: 'none',
            fontFamily: 'var(--font-body)',
          }}
        >
          Primary
        </button>
        <button
          className="px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius-2)',
            border: `${borderWidth} ${borderStyle} ${borderColor}`,
            fontFamily: 'var(--font-body)',
          }}
        >
          Outline
        </button>
      </div>
    </div>
  );
}

export function SurfaceOverlayPanel() {
  const { config, dispatch } = useTokenConfigContext();
  const { overlay, closeOverlay } = useOverlay();

  const surfacePayload = overlay.payload as SurfaceOverlayPayload | undefined;
  const [activeTab, setActiveTab] = useState<SurfaceTab>(surfacePayload?.tab ?? 'radius');

  // Local draft — does NOT write to global config until Apply
  const [localSurface, setLocalSurface] = useState({
    radius: config.surface.radius,
    elevation: config.surface.elevation,
  });

  const [borderPresetIdx, setBorderPresetIdx] = useState(2);
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');

  const tabs: { id: SurfaceTab; label: string }[] = [
    { id: 'radius', label: 'Radius' },
    { id: 'elevation', label: 'Elevation' },
    { id: 'borders', label: 'Borders' },
    { id: 'card', label: 'Card' },
  ];

  const currentBorderPreset = BORDER_PRESETS[borderPresetIdx];

  function handleApply() {
    dispatch({ type: 'SET_SURFACE', patch: { radius: localSurface.radius, elevation: localSurface.elevation } });
    closeOverlay();
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 57px)' }}>
      {/* Tab bar */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="px-8 py-4 text-xs tracking-[0.15em] uppercase transition-colors border-b-2"
            style={{
              color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
              borderBottomColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex flex-1">
        {/* Options panel */}
        <div
          className="p-8 border-r overflow-auto shrink-0"
          style={{ width: 380, borderColor: 'var(--color-border)' }}
        >
          {activeTab === 'radius' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                Border Radius
              </p>

              {/* Chip presets */}
              <div className="flex flex-wrap gap-2 mb-6">
                {RADIUS_PRESETS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setLocalSurface((s) => ({ ...s, radius: opt.value }))}
                    className="px-4 py-2 text-sm border transition-colors"
                    style={{
                      borderColor:
                        localSurface.radius === opt.value
                          ? 'var(--color-primary)'
                          : 'var(--color-border)',
                      color:
                        localSurface.radius === opt.value
                          ? 'var(--color-primary)'
                          : 'var(--color-text-muted)',
                      borderRadius: 'var(--radius-1)',
                      backgroundColor:
                        localSurface.radius === opt.value
                          ? 'oklch(from var(--color-primary) l c h / 0.08)'
                          : 'transparent',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Slider — hidden when Full (9999) */}
              {localSurface.radius < 9999 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                      Custom
                    </p>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text)' }}>
                      {localSurface.radius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={32}
                    step={1}
                    value={localSurface.radius}
                    onChange={(e) =>
                      setLocalSurface((s) => ({ ...s, radius: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'elevation' && (
            <div className="flex flex-col gap-2">
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                Shadow Level
              </p>
              {ELEVATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLocalSurface((s) => ({ ...s, elevation: opt.value }))}
                  className="flex flex-col items-start px-4 py-3 border transition-colors text-left"
                  style={{
                    borderColor:
                      localSurface.elevation === opt.value
                        ? 'var(--color-primary)'
                        : 'var(--color-border)',
                    borderRadius: 'var(--radius-1)',
                    backgroundColor:
                      localSurface.elevation === opt.value
                        ? 'oklch(from var(--color-primary) l c h / 0.08)'
                        : 'transparent',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {opt.label}
                  </span>
                  <span className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'borders' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                Intensity
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {BORDER_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBorderPresetIdx(i)}
                    className="px-4 py-2 text-sm border transition-colors"
                    style={{
                      borderColor:
                        borderPresetIdx === i ? 'var(--color-primary)' : 'var(--color-border)',
                      color:
                        borderPresetIdx === i ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      borderRadius: 'var(--radius-1)',
                      backgroundColor:
                        borderPresetIdx === i
                          ? 'oklch(from var(--color-primary) l c h / 0.08)'
                          : 'transparent',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <p className="mb-3 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                Style
              </p>
              <div className="flex gap-2 mb-6">
                {BORDER_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBorderStyle(s)}
                    className="px-4 py-2 text-sm border transition-colors"
                    style={{
                      borderColor:
                        borderStyle === s ? 'var(--color-primary)' : 'var(--color-border)',
                      color: borderStyle === s ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      borderRadius: 'var(--radius-1)',
                      backgroundColor:
                        borderStyle === s
                          ? 'oklch(from var(--color-primary) l c h / 0.08)'
                          : 'transparent',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div
                className="p-3 border"
                style={{
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-1)',
                }}
              >
                <p className="text-[9px] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Current
                </p>
                <p className="font-mono text-sm" style={{ color: 'var(--color-text)' }}>
                  {currentBorderPreset.width} {borderStyle}
                </p>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  opacity: {currentBorderPreset.opacity}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                Card Padding
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Compact', value: 12 },
                  { label: 'Default', value: 16 },
                  { label: 'Comfortable', value: 24 },
                  { label: 'Spacious', value: 32 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="flex items-center justify-between px-4 py-3 border text-left transition-colors"
                    style={{
                      borderColor: 'var(--color-border)',
                      borderRadius: 'var(--radius-1)',
                    }}
                  >
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                      {opt.label}
                    </span>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {opt.value}px
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div className="flex-1 p-12 flex items-start">
          <div>
            <p
              className="mb-8 text-[10px] tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Live Preview
            </p>
            <LivePreview
              borderWidth={currentBorderPreset.width}
              borderStyle={borderStyle}
              borderOpacity={currentBorderPreset.opacity}
            />
          </div>
        </div>
      </div>

      {/* Footer: Apply / Cancel */}
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
