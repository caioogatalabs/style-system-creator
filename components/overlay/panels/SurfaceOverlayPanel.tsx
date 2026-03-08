'use client';

import { useState } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import type { ElevationLevel } from '@/types/tokens';
import type { SurfaceTab } from '@/context/OverlayContext';

const RADIUS_OPTIONS: { value: number; label: string; preview: string }[] = [
  { value: 0, label: 'None', preview: '0px' },
  { value: 4, label: 'Small', preview: '4px' },
  { value: 8, label: 'Medium', preview: '8px' },
  { value: 16, label: 'Large', preview: '16px' },
  { value: 9999, label: 'Full', preview: '9999px' },
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
          borderRadius: 'var(--radius-component-lg)',
          boxShadow: 'var(--shadow-md)',
          backgroundColor: 'var(--color-bg-surface-primary)',
          width: 220,
        }}
      >
        <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Card
        </p>
        <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
          Card Title
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Surface preview with current tokens applied.
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-secondary)' }}>Input</p>
          <input
            type="text"
            placeholder="Input placeholder..."
            readOnly
            className="px-4 py-2.5 text-sm outline-none"
            style={{
              border: `${borderWidth} ${borderStyle} ${borderColor}`,
              borderRadius: 'var(--radius-component-md)',
              backgroundColor: 'var(--color-bg-surface-primary)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              width: 200,
              display: 'block',
            }}
          />
        </div>
        <div>
          <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-secondary)' }}>:focus</p>
          <input
            type="text"
            defaultValue="focus"
            readOnly
            className="px-4 py-2.5 text-sm outline-none"
            style={{
              border: `2px solid var(--color-bg-fill-primary)`,
              borderRadius: 'var(--radius-component-md)',
              backgroundColor: 'var(--color-bg-surface-primary)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              width: 200,
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>Buttons</p>
        <button
          className="px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-bg-fill-primary)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-component-md)',
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
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-component-md)',
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
  const [activeTab, setActiveTab] = useState<SurfaceTab>('radius');
  const [borderPresetIdx, setBorderPresetIdx] = useState(2);
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');

  const tabs: { id: SurfaceTab; label: string }[] = [
    { id: 'radius', label: 'Radius' },
    { id: 'elevation', label: 'Elevation' },
    { id: 'borders', label: 'Borders' },
    { id: 'card', label: 'Card' },
  ];

  const currentBorderPreset = BORDER_PRESETS[borderPresetIdx];

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 57px)' }}>
      {/* Tab bar */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'var(--color-border-primary)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="px-8 py-4 text-xs tracking-[0.15em] uppercase transition-colors border-b-2"
            style={{
              color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderBottomColor: activeTab === tab.id ? 'var(--color-bg-fill-primary)' : 'transparent',
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
          style={{ width: 380, borderColor: 'var(--color-border-primary)' }}
        >
          {activeTab === 'radius' && (
            <div className="flex flex-col gap-2">
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                Border Radius Preset
              </p>
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SURFACE', patch: { radius: opt.value } })}
                  className="flex items-center justify-between px-4 py-3 border transition-colors"
                  style={{
                    borderColor:
                      config.surface.radius === opt.value
                        ? 'var(--color-bg-fill-primary)'
                        : 'var(--color-border-primary)',
                    borderRadius: 'var(--radius-component-sm)',
                    backgroundColor:
                      config.surface.radius === opt.value
                        ? 'oklch(from var(--color-bg-fill-primary) l c h / 0.08)'
                        : 'transparent',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {opt.label}
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {opt.preview}
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'elevation' && (
            <div className="flex flex-col gap-2">
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                Shadow Level
              </p>
              {ELEVATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SURFACE', patch: { elevation: opt.value } })}
                  className="flex flex-col items-start px-4 py-3 border transition-colors text-left"
                  style={{
                    borderColor:
                      config.surface.elevation === opt.value
                        ? 'var(--color-bg-fill-primary)'
                        : 'var(--color-border-primary)',
                    borderRadius: 'var(--radius-component-sm)',
                    backgroundColor:
                      config.surface.elevation === opt.value
                        ? 'oklch(from var(--color-bg-fill-primary) l c h / 0.08)'
                        : 'transparent',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {opt.label}
                  </span>
                  <span className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'borders' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
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
                        borderPresetIdx === i ? 'var(--color-bg-fill-primary)' : 'var(--color-border-primary)',
                      color:
                        borderPresetIdx === i ? 'var(--color-bg-fill-primary)' : 'var(--color-text-secondary)',
                      borderRadius: 'var(--radius-component-sm)',
                      backgroundColor:
                        borderPresetIdx === i
                          ? 'oklch(from var(--color-bg-fill-primary) l c h / 0.08)'
                          : 'transparent',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <p className="mb-3 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
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
                        borderStyle === s ? 'var(--color-bg-fill-primary)' : 'var(--color-border-primary)',
                      color: borderStyle === s ? 'var(--color-bg-fill-primary)' : 'var(--color-text-secondary)',
                      borderRadius: 'var(--radius-component-sm)',
                      backgroundColor:
                        borderStyle === s
                          ? 'oklch(from var(--color-bg-fill-primary) l c h / 0.08)'
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
                  borderColor: 'var(--color-border-primary)',
                  borderRadius: 'var(--radius-component-sm)',
                }}
              >
                <p className="text-[9px] tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Current
                </p>
                <p className="font-mono text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {currentBorderPreset.width} {borderStyle}
                </p>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  opacity: {currentBorderPreset.opacity}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div>
              <p className="mb-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
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
                    className="flex items-center justify-between px-4 py-3 border text-left transition-colors hover:border-primary"
                    style={{
                      borderColor: 'var(--color-border-primary)',
                      borderRadius: 'var(--radius-component-sm)',
                    }}
                  >
                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {opt.label}
                    </span>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
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
              style={{ color: 'var(--color-text-secondary)' }}
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
    </div>
  );
}
