'use client';

export function ComponentsPreview() {
  return (
    <section
      className="px-6 py-16"
      style={{
        borderColor: 'var(--color-border-primary)',
        backgroundColor: 'oklch(0.08 0 0)',
      }}
    >
      {/* Section header */}
      <div
        className="mb-12 flex items-start gap-6 border-b pb-6"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <span
          className="font-mono text-7xl font-light leading-none select-none"
          style={{ color: 'oklch(0.20 0 0)' }}
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
            Components
          </span>
        </div>
      </div>

      {/* Button variants */}
      <div className="mb-12">
        <p
          className="mb-4 text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
        >
          Buttons
        </p>
        <div className="flex flex-wrap gap-3">
          {/* Primary */}
          <button
            className="px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-bg-fill-primary)',
              color: 'var(--color-text-inverse)',
              borderRadius: 'var(--radius-token-md)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Primary
          </button>
          {/* Secondary */}
          <button
            className="px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-bg-fill-secondary)',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-token-md)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Secondary
          </button>
          {/* Outline */}
          <button
            className="border px-5 py-2.5 text-sm font-medium transition-colors"
            style={{
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-token-md)',
              fontFamily: 'var(--font-body)',
              backgroundColor: 'transparent',
            }}
          >
            Outline
          </button>
          {/* Ghost */}
          <button
            className="px-5 py-2.5 text-sm font-medium transition-colors hover:opacity-70"
            style={{
              color: 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-token-md)',
              fontFamily: 'var(--font-body)',
              backgroundColor: 'transparent',
            }}
          >
            Ghost
          </button>
          {/* Destructive */}
          <button
            className="px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-error)',
              color: 'oklch(0.97 0 0)',
              borderRadius: 'var(--radius-token-md)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Destructive
          </button>
        </div>
      </div>

      {/* Input + Badges */}
      <div className="mb-12 grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Input */}
        <div>
          <p
            className="mb-4 text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
          >
            Input
          </p>
          <input
            type="text"
            placeholder="Placeholder text..."
            className="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1"
            style={{
              borderColor: 'var(--color-border-primary)',
              backgroundColor: 'oklch(0.10 0 0)',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-token-md)',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        {/* Badges */}
        <div>
          <p
            className="mb-4 text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
          >
            Badges
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Default', bg: 'var(--color-bg-fill-primary)', fg: 'var(--color-text-inverse)' },
              { label: 'Secondary', bg: 'var(--color-bg-fill-secondary)', fg: 'var(--color-text-primary)' },
              { label: 'Outline', bg: 'transparent', fg: 'var(--color-text-primary)', border: true },
              { label: 'Success', bg: 'var(--color-success-bg)', fg: 'var(--color-success)' },
              { label: 'Warning', bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)' },
              { label: 'Error', bg: 'var(--color-error-bg)', fg: 'var(--color-error)' },
            ].map((badge) => (
              <span
                key={badge.label}
                className="border px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase"
                style={{
                  backgroundColor: badge.bg,
                  color: badge.fg,
                  borderColor: badge.border ? 'var(--color-border-primary)' : 'transparent',
                  borderRadius: 'var(--radius-token-full)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card */}
      <div>
        <p
          className="mb-4 text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
        >
          Card
        </p>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {['Outlined', 'Filled', 'Ghost'].map((style) => (
            <div
              key={style}
              className="border p-6"
              style={{
                borderColor: style === 'Ghost' ? 'transparent' : 'var(--color-border-primary)',
                backgroundColor: style === 'Filled' ? 'oklch(0.12 0 0)' : 'transparent',
                borderRadius: 'var(--radius-token-lg)',
                boxShadow: style === 'Outlined' ? 'var(--shadow-token-md)' : 'none',
              }}
            >
              <p
                className="mb-2 text-[10px] tracking-[0.15em] uppercase"
                style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
              >
                {style}
              </p>
              <p
                className="mb-2 text-base font-semibold"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
              >
                Card Title
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                A card component showing how surfaces and tokens work together in context.
              </p>
              <button
                className="mt-4 text-xs underline underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-bg-fill-primary)', fontFamily: 'var(--font-body)' }}
              >
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
