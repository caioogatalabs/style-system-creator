'use client';

import { useOverlay } from '@/context/OverlayContext';
import { useTokenConfig } from '@/hooks/useTokenConfig';
import type { SurfaceTab } from '@/context/OverlayContext';

function SurfaceCard({
  tab,
  children,
}: {
  tab: SurfaceTab;
  children: React.ReactNode;
}) {
  const { openOverlay } = useOverlay();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openOverlay('surface', { tab });
      }}
      className="border p-6 text-left cursor-pointer group/card transition-colors hover:border-[var(--color-border-muted)]"
      style={{
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-3)',
      }}
    >
      {children}
      <span
        className="block mt-3 opacity-0 group-hover/card:opacity-100 transition-opacity text-[9px] tracking-[0.15em] uppercase"
        style={{ color: 'var(--color-primary)' }}
      >
        Configure →
      </span>
    </button>
  );
}

export function SurfacePreview() {
  const config = useTokenConfig();

  return (
    <section
      className="px-6 py-16"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Section header */}
      <div
        className="mb-12 flex items-start justify-between gap-6 border-b pb-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start gap-6">
          <span
            className="font-mono text-7xl font-light leading-none select-none"
            style={{ color: 'var(--color-border)' }}
          >
            C
          </span>
          <div className="flex items-center gap-3 pt-4">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-mono"
              style={{ borderColor: 'var(--color-text-muted)', color: 'var(--color-text-muted)' }}
            >
              3
            </span>
            <span
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Surfaces
            </span>
          </div>
        </div>
      </div>

      {/* Quick-view cards — each opens its own tab */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Radius */}
        <SurfaceCard tab="radius">
          <p
            className="mb-3 text-[9px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Radius
          </p>
          <p
            className="text-2xl font-semibold capitalize"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            {config.surface.radius >= 9999 ? 'Full' : `${config.surface.radius}px`}
          </p>
          <div
            className="mt-4 h-8 w-8 border"
            style={{
              borderColor: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-2)',
            }}
          />
        </SurfaceCard>

        {/* Elevation */}
        <SurfaceCard tab="elevation">
          <div
            style={{ boxShadow: 'var(--shadow-2)' }}
          >
            <p
              className="mb-3 text-[9px] tracking-[0.15em] uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Elevation
            </p>
            <p
              className="text-2xl font-semibold capitalize"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              {config.surface.elevation}
            </p>
          </div>
        </SurfaceCard>

        {/* Borders */}
        <SurfaceCard tab="borders">
          <p
            className="mb-3 text-[9px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Borders
          </p>
          <p
            className="text-2xl font-semibold capitalize"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            1px Solid
          </p>
        </SurfaceCard>

        {/* Card */}
        <SurfaceCard tab="card">
          <div
            className="p-4"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-2)',
              boxShadow: 'var(--shadow-3)',
            }}
          >
            <p
              className="mb-3 text-[9px] tracking-[0.15em] uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Card
            </p>
            <p
              className="text-base font-semibold"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Card Title
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Surfaces preview
            </p>
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}
