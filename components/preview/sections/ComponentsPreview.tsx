'use client';

export function ComponentsPreview() {
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
        className="mb-12 flex items-start gap-6 border-b pb-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
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
            Components
          </span>
        </div>
      </div>

      {/* Button variants */}
      <div className="mb-12">
        <p
          className="mb-4 text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
        >
          Buttons
        </p>
        <div className="flex flex-wrap gap-3">
          {/* Primary */}
          <button
            className="px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              borderRadius: 'var(--radius-2)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Primary
          </button>
          {/* Secondary */}
          <button
            className="px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-2)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Secondary
          </button>
          {/* Outline */}
          <button
            className="border px-5 py-2.5 text-sm font-medium transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-2)',
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
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-2)',
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
              backgroundColor: 'var(--color-danger)',
              color: 'var(--color-on-primary)',
              borderRadius: 'var(--radius-2)',
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
            style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
          >
            Input
          </p>
          <input
            type="text"
            placeholder="Placeholder text..."
            className="w-full border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-1"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-2)',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        {/* Badges */}
        <div>
          <p
            className="mb-4 text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
          >
            Badges
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Default', bg: 'var(--color-primary)', fg: 'var(--color-on-primary)' },
              { label: 'Secondary', bg: 'var(--color-secondary)', fg: 'var(--color-text)' },
              { label: 'Outline', bg: 'transparent', fg: 'var(--color-text)', border: true },
              { label: 'Success', bg: 'var(--color-success-muted)', fg: 'var(--color-success)' },
              { label: 'Warning', bg: 'var(--color-warning-muted)', fg: 'var(--color-warning)' },
              { label: 'Error', bg: 'var(--color-danger-muted)', fg: 'var(--color-danger)' },
            ].map((badge) => (
              <span
                key={badge.label}
                className="border px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase"
                style={{
                  backgroundColor: badge.bg,
                  color: badge.fg,
                  borderColor: badge.border ? 'var(--color-border)' : 'transparent',
                  borderRadius: 'var(--radius-full)',
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
          style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
        >
          Card
        </p>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {['Outlined', 'Filled', 'Ghost'].map((style) => (
            <div
              key={style}
              className="border p-6"
              style={{
                borderColor: style === 'Ghost' ? 'transparent' : 'var(--color-border)',
                backgroundColor: style === 'Filled' ? 'var(--color-surface-raised)' : 'transparent',
                borderRadius: 'var(--radius-3)',
                boxShadow: style === 'Outlined' ? 'var(--shadow-2)' : 'none',
              }}
            >
              <p
                className="mb-2 text-[10px] tracking-[0.15em] uppercase"
                style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
              >
                {style}
              </p>
              <p
                className="mb-2 text-base font-semibold"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
              >
                Card Title
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                A card component showing how surfaces and tokens work together in context.
              </p>
              <button
                className="mt-4 text-xs underline underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
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
