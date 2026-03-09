import { TopBar } from './TopBar';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--color-surface)' }}>
      <TopBar />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
