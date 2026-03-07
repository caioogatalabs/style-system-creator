'use client';

import { useTokenConfig } from '@/hooks/useTokenConfig';
import { useOverlay } from '@/context/OverlayContext';

export function TypographyPreview() {
  const config = useTokenConfig();
  const { openOverlay } = useOverlay();

  return (
    <section
      className="border-b px-6 py-16"
      style={{
        borderColor: 'var(--color-border-primary)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Section header */}
      <div
        className="mb-12 flex items-start justify-between border-b pb-6"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <div className="flex items-center gap-6">
          {/* Section number */}
          <span
            className="font-mono text-7xl font-light leading-none select-none"
            style={{ color: 'var(--color-border-primary)' }}
          >
            A
          </span>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-mono"
                style={{ borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-secondary)' }}
              >
                1
              </span>
              <span
                className="text-xs tracking-[0.2em] uppercase"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Typography
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="mb-6 grid border-b pb-3"
        style={{
          gridTemplateColumns: '1fr 1fr 1fr',
          borderColor: 'var(--color-border-primary)',
        }}
      >
        {['font:', 'for:', 'specification:'].map((label) => (
          <span
            key={label}
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Heading font row */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => openOverlay('typography')}
        onKeyDown={(e) => e.key === 'Enter' && openOverlay('typography')}
        className="grid border-b py-10 cursor-pointer group relative"
        style={{
          gridTemplateColumns: '1fr 1fr 1fr',
          borderColor: 'var(--color-border-primary)',
          alignItems: 'end',
        }}
      >
        <span
          className="absolute top-4 right-0 text-[9px] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-bg-fill-primary)' }}
        >
          Click to edit →
        </span>
        {/* Specimen */}
        <div className="col-span-1">
          <span
            className="text-[10px] tracking-[0.15em] uppercase block mb-4"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            font:
          </span>
          <p
            className="leading-none"
            style={{
              fontFamily: `"${config.typography.headingFamily}", sans-serif`,
              fontWeight: config.typography.headingWeight,
              fontSize: 'clamp(48px, 6vw, 96px)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {config.typography.headingFamily}
          </p>
        </div>

        {/* Use cases */}
        <div className="flex flex-col justify-end gap-1 pl-8">
          <span
            className="text-[10px] tracking-[0.15em] uppercase block mb-4"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            for:
          </span>
          {['For Headings', 'Display Text', 'Hero sections'].map((use) => (
            <p
              key={use}
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {use}
            </p>
          ))}
        </div>

        {/* Specs */}
        <div className="flex flex-col justify-end gap-1 pl-8">
          <span
            className="text-[10px] tracking-[0.15em] uppercase block mb-4"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            specification:
          </span>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Letter Spacing −2%
            <span className="mx-3 opacity-30">·</span>
            Weight {config.typography.headingWeight}
          </p>
        </div>
      </div>

      {/* Body font row */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => openOverlay('typography')}
        onKeyDown={(e) => e.key === 'Enter' && openOverlay('typography')}
        className="grid border-b py-10 cursor-pointer group relative"
        style={{
          gridTemplateColumns: '1fr 1fr 1fr',
          borderColor: 'var(--color-border-primary)',
          alignItems: 'end',
        }}
      >
        <span
          className="absolute top-4 right-0 text-[9px] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-bg-fill-primary)' }}
        >
          Click to edit →
        </span>
        {/* Specimen */}
        <div className="col-span-1">
          <p
            className="leading-none"
            style={{
              fontFamily: `"${config.typography.bodyFamily}", sans-serif`,
              fontWeight: config.typography.bodyWeight,
              fontSize: 'clamp(36px, 4vw, 64px)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {config.typography.bodyFamily}
          </p>
        </div>

        {/* Use cases */}
        <div className="flex flex-col justify-end gap-1 pl-8">
          {['For Body Text', 'Input from user', 'Small caps'].map((use) => (
            <p
              key={use}
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {use}
            </p>
          ))}
        </div>

        {/* Specs */}
        <div className="flex flex-col justify-end gap-1 pl-8">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Letter Spacing 1.5%
            <span className="mx-3 opacity-30">·</span>
            Weight 700
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Letter Spacing 1.5%
            <span className="mx-3 opacity-30">·</span>
            Weight 500
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Letter Spacing 1.5%
            <span className="mx-3 opacity-30">·</span>
            Weight {config.typography.bodyWeight}
          </p>
        </div>
      </div>
    </section>
  );
}
