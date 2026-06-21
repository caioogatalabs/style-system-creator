'use client';

import { useMemo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { resolveTokens } from '@/lib/token-engine';
import { computeTokenVars } from '@/lib/compute-token-vars';

/*
 * Semantic roles panel (tweakcn-inspired): each role shown as a background +
 * foreground pair with its resolved OKLCH values, plus a local theme toggle so
 * a reviewer can flip tone without leaving the section. Read-only — the toggle
 * only previews; it never writes back to the brand.
 */

interface Role {
  label: string;
  bg: string; // CSS var name
  fg: string; // CSS var name
}

const ROLES: Role[] = [
  { label: 'Surface', bg: '--color-surface', fg: '--color-text' },
  { label: 'Surface raised', bg: '--color-surface-raised', fg: '--color-text' },
  { label: 'Muted text', bg: '--color-surface', fg: '--color-text-muted' },
  { label: 'Primary', bg: '--color-primary', fg: '--color-on-primary' },
  { label: 'Secondary', bg: '--color-secondary', fg: '--color-on-secondary' },
  { label: 'Accent', bg: '--color-accent', fg: '--color-on-accent' },
  { label: 'Danger', bg: '--color-danger', fg: '--color-on-primary' },
  { label: 'Success', bg: '--color-success', fg: '--color-on-primary' },
  { label: 'Warning', bg: '--color-warning', fg: '--color-on-primary' },
  { label: 'Info', bg: '--color-info', fg: '--color-on-primary' },
];

function RoleCard({ role, vars }: { role: Role; vars: Record<string, string> }) {
  const bgVal = vars[role.bg] ?? '';
  const fgVal = vars[role.fg] ?? '';
  return (
    <div className="flex flex-col rounded-2 overflow-hidden border border-border">
      <div
        className="flex items-center justify-between px-4"
        style={{ backgroundColor: `var(${role.bg})`, height: 84 }}
      >
        <span style={{ color: `var(${role.fg})` }} className="text-lg font-heading">Aa</span>
        <span style={{ color: `var(${role.fg})` }} className="text-[10px] font-mono opacity-70">{role.label}</span>
      </div>
      <div className="bg-surface px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: `var(${role.bg})` }} />
          <span className="text-[9px] font-mono text-text-muted truncate">{bgVal}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: `var(${role.fg})` }} />
          <span className="text-[9px] font-mono text-text-muted truncate">{fgVal}</span>
        </div>
      </div>
    </div>
  );
}

export function SemanticRolesPanel() {
  const { config, dispatch } = useTokenConfigContext();
  const vars = useMemo(() => computeTokenVars(resolveTokens(config), config), [config]);

  return (
    <section className="px-6 py-16 border-b border-border bg-surface">
      <div className="mb-10 flex items-start justify-between gap-6 border-b border-border pb-6">
        <div className="flex items-start gap-6">
          <span className="font-mono text-7xl font-light leading-none select-none text-border">R</span>
          <div className="pt-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-text-muted text-[9px] font-mono text-text-muted">
                0
              </span>
              <span className="text-xs tracking-[0.2em] uppercase text-text-muted">Semantic Roles</span>
            </div>
            <p className="text-sm mt-1 text-text-dim">Background / foreground pairs with resolved OKLCH — flip the tone to inspect.</p>
          </div>
        </div>

        {/* Local theme toggle (preview only) */}
        <button
          onClick={() => dispatch({ type: 'SET_THEME', theme: config.theme === 'dark' ? 'light' : 'dark' })}
          className="flex items-center gap-2 rounded px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase border border-border text-text-muted hover:text-text transition-colors"
          title={config.theme === 'dark' ? 'Preview light' : 'Preview dark'}
        >
          {config.theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          {config.theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {ROLES.map((role) => (
          <RoleCard key={role.label} role={role} vars={vars} />
        ))}
      </div>
    </section>
  );
}
