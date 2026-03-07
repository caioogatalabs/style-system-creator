'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Share2 } from 'lucide-react';
import { useTokenConfig } from '@/hooks/useTokenConfig';
import { serializeConfig } from '@/lib/url-serializer';

const NAV_ITEMS = [
  { href: '/', label: 'Overview' },
  { href: '/typography', label: 'Typography' },
  { href: '/colors', label: 'Colors' },
  { href: '/components', label: 'Components' },
];

export function TopBar() {
  const pathname = usePathname();
  const config = useTokenConfig();

  function handleShare() {
    const params = serializeConfig(config);
    const url = `${window.location.origin}/?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      // Could show a toast here
    });
  }

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="flex h-14 w-full items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-mono tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Style System
          </span>
          <span style={{ color: 'var(--color-border-primary)' }}>·</span>
          <span
            className="text-xs font-mono tracking-[0.2em] uppercase"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Creator
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors duration-150"
                style={{
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-4 right-4 h-px"
                    style={{ backgroundColor: 'var(--color-text-primary)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded px-3 py-1.5 text-xs tracking-[0.08em] uppercase transition-colors"
            style={{
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-primary)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
            }}
          >
            <Share2 size={12} />
            Share
          </button>
        </div>
      </div>
    </header>
  );
}
