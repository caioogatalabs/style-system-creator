'use client';

import { useOverlay } from '@/context/OverlayContext';
import { useTokenConfig } from '@/hooks/useTokenConfig';

export function SurfacePreview() {
  const config = useTokenConfig();
  const { openOverlay } = useOverlay();

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={() => openOverlay('surface')}
      onKeyDown={(e) => e.key === 'Enter' && openOverlay('surface')}
      className="px-6 py-16 cursor-pointer group"
      style={{
        borderColor: 'var(--color-border-primary)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Section header */}
      <div
        className="mb-12 flex items-start justify-between gap-6 border-b pb-6"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <div className="flex items-start gap-6">
          <span
            className="font-mono text-7xl font-light leading-none select-none"
            style={{ color: 'var(--color-border-primary)' }}
          >
            C
          </span>
          <div className="flex items-center gap-3 pt-4">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-mono"
              style={{ borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-secondary)' }}
            >
              3
            </span>
            <span
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Surfaces
            </span>
          </div>
        </div>
        <span
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] tracking-[0.15em] uppercase pt-4 shrink-0"
          style={{ color: 'var(--color-bg-fill-primary)' }}
        >
          Click to configure →
        </span>
      </div>

      {/* Quick-view cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Radius */}
        <div
          className="border p-6"
          style={{
            borderColor: 'var(--color-border-primary)',
            borderRadius: 'var(--radius-component-lg)',
          }}
        >
          <p
            className="mb-3 text-[9px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Radius
          </p>
          <p
            className="text-2xl font-semibold capitalize"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            {config.surface.radius >= 9999 ? 'Full' : `${config.surface.radius}px`}
          </p>
          <div
            className="mt-4 h-8 w-8 border"
            style={{
              borderColor: 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-component-md)',
            }}
          />
        </div>

        {/* Elevation */}
        <div
          className="border p-6"
          style={{
            borderColor: 'var(--color-border-primary)',
            borderRadius: 'var(--radius-component-lg)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <p
            className="mb-3 text-[9px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Elevation
          </p>
          <p
            className="text-2xl font-semibold capitalize"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            {config.surface.elevation}
          </p>
        </div>

        {/* Borders */}
        <div
          className="border-2 p-6"
          style={{
            borderColor: 'var(--color-border-primary)',
            borderRadius: 'var(--radius-component-lg)',
          }}
        >
          <p
            className="mb-3 text-[9px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Borders
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Solid
          </p>
        </div>

        {/* Card */}
        <div
          className="p-6"
          style={{
            backgroundColor: 'var(--color-bg-surface-primary)',
            borderRadius: 'var(--radius-component-lg)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <p
            className="mb-3 text-[9px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Card
          </p>
          <p
            className="text-base font-semibold"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Card Title
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Surfaces preview
          </p>
        </div>
      </div>
    </section>
  );
}
