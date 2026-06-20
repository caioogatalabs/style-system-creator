'use client';

import { useState, type ReactNode } from 'react';
import { Sun, Moon, ArrowUpRight, Minus, Plus, TrendingUp, Users, CreditCard, Activity } from 'lucide-react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

/*
 * "In Context" — the brand's tokens applied to realistic, composed product UIs
 * (tweakcn's idea), built from the project's shadcn components. Everything is
 * driven by tokens through the shadcn bridge, so it always shows the loaded
 * client brand. Read-only, with a local theme toggle to preview the other tone.
 */

const SCENES = ['Cards', 'Dashboard', 'Marketing'] as const;
type Scene = (typeof SCENES)[number];

// ── Shared card shell (uses the shadcn `card` token = surface-raised) ─────────

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-2 p-6 ${className}`}>
      {children}
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 200 48" className="w-full h-12" fill="none" preserveAspectRatio="none">
      <path
        d="M0 38 C20 36 30 30 50 32 S90 40 110 30 150 8 200 6"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MiniBars() {
  const heights = [40, 55, 35, 70, 50, 80, 45, 65, 75, 60, 85, 50];
  return (
    <div className="flex items-end gap-1 h-16">
      {heights.map((h, i) => (
        <span key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: 'var(--color-primary)' }} />
      ))}
    </div>
  );
}

// ── Scene: Cards ──────────────────────────────────────────────────────────────

function CardsScene() {
  const [goal, setGoal] = useState(350);
  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      <Card>
        <p className="text-sm text-text-muted">Total Revenue</p>
        <p className="text-3xl font-heading mt-1 text-text">$15,231.89</p>
        <p className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp size={12} /> +20.1% from last month</p>
        <div className="mt-4"><Sparkline /></div>
      </Card>

      <Card>
        <p className="text-base font-heading text-text">Upgrade your plan</p>
        <p className="text-sm text-text-muted mt-1 mb-4">Unlock every brand surface.</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ctx-name">Name</Label>
            <Input id="ctx-name" placeholder="Evil Rabbit" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ctx-email">Email</Label>
            <Input id="ctx-email" type="email" placeholder="you@acme.com" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Checkbox id="ctx-terms" defaultChecked />
            <Label htmlFor="ctx-terms" className="text-text-muted">I agree to the terms</Label>
          </div>
          <div className="flex gap-2 mt-2">
            <Button className="flex-1">Upgrade</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-sm text-text-muted">Move goal</p>
        <div className="flex items-center justify-center gap-6 my-4">
          <Button variant="outline" size="icon" onClick={() => setGoal((g) => Math.max(0, g - 10))}><Minus size={14} /></Button>
          <div className="text-center">
            <p className="text-4xl font-heading text-text">{goal}</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-text-muted">cal / day</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setGoal((g) => g + 10)}><Plus size={14} /></Button>
        </div>
        <MiniBars />
        <Button variant="secondary" className="w-full mt-4">Set goal</Button>
      </Card>
    </div>
  );
}

// ── Scene: Dashboard ──────────────────────────────────────────────────────────

const KPIS = [
  { label: 'Revenue', value: '$45,231', delta: '+20.1%', icon: CreditCard },
  { label: 'Users', value: '2,350', delta: '+180.1%', icon: Users },
  { label: 'Active', value: '12,234', delta: '+19%', icon: Activity },
  { label: 'Growth', value: '+573', delta: '+201', icon: TrendingUp },
];

const ACTIVITY = [
  { name: 'Olivia Martin', email: 'olivia@email.com', amount: '+$1,999.00' },
  { name: 'Jackson Lee', email: 'jackson@email.com', amount: '+$39.00' },
  { name: 'Isabella Nguyen', email: 'isabella@email.com', amount: '+$299.00' },
  { name: 'William Kim', email: 'will@email.com', amount: '+$99.00' },
];

function DashboardScene() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {KPIS.map(({ label, value, delta, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">{label}</p>
              <Icon size={15} className="text-text-dim" />
            </div>
            <p className="text-2xl font-heading mt-2 text-text">{value}</p>
            <p className="text-xs text-success mt-1">{delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <Card>
          <p className="text-base font-heading text-text mb-1">Overview</p>
          <p className="text-sm text-text-muted mb-4">Monthly performance</p>
          <div className="flex items-end gap-2 h-48">
            {[60, 80, 45, 90, 70, 100, 55, 75, 85, 65, 95, 50].map((h, i) => (
              <span key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, backgroundColor: 'var(--color-primary)' }} />
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-base font-heading text-text mb-1">Recent sales</p>
          <p className="text-sm text-text-muted mb-4">265 sales this month</p>
          <div className="flex flex-col gap-4">
            {ACTIVITY.map((a) => (
              <div key={a.email} className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-brand-secondary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text truncate">{a.name}</p>
                  <p className="text-xs text-text-muted truncate">{a.email}</p>
                </div>
                <span className="text-sm font-mono text-text">{a.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Scene: Marketing ──────────────────────────────────────────────────────────

function MarketingScene() {
  return (
    <div className="flex flex-col gap-8">
      <Card className="p-12 text-center">
        <Badge className="mb-4">New · v2</Badge>
        <h2 className="text-4xl font-heading text-text max-w-2xl mx-auto leading-tight">
          A brand system your whole team can sign off on.
        </h2>
        <p className="text-base text-text-muted mt-4 max-w-xl mx-auto">
          Every token, in context, in the client&apos;s own tone — ready for approval.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button>Get started <ArrowUpRight size={14} /></Button>
          <Button variant="outline">View docs</Button>
        </div>
      </Card>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[
          { t: 'Tokens', d: 'Color, type, surface and assets — one contract.' },
          { t: 'In context', d: 'Real product surfaces, not just swatches.' },
          { t: 'Themed', d: 'Loads in the brand’s own light or dark tone.' },
        ].map((f) => (
          <Card key={f.t}>
            <p className="text-sm font-heading text-text">{f.t}</p>
            <Separator className="my-3" />
            <p className="text-sm text-text-muted">{f.d}</p>
          </Card>
        ))}
      </div>

      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-heading text-text">Notifications</p>
          <p className="text-xs text-text-muted">Get notified when a brand is ready to review.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="ctx-notify" className="text-text-muted">Email me</Label>
          <Switch id="ctx-notify" defaultChecked />
        </div>
      </Card>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ContextPage() {
  const { config, dispatch } = useTokenConfigContext();
  const [scene, setScene] = useState<Scene>('Cards');

  return (
    <div className="bg-surface min-h-screen px-6 py-12">
      {/* Toolbar: scene tabs + theme toggle */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div className="flex items-center gap-1">
          {SCENES.map((s) => (
            <button
              key={s}
              onClick={() => setScene(s)}
              className={`px-4 py-2 text-xs tracking-[0.12em] uppercase rounded transition-colors ${
                scene === s ? 'text-text bg-surface-raised' : 'text-text-muted hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_THEME', theme: config.theme === 'dark' ? 'light' : 'dark' })}
          className="flex items-center gap-2 rounded px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase border border-border text-text-muted hover:text-text transition-colors"
          title={config.theme === 'dark' ? 'Preview light' : 'Preview dark'}
        >
          {config.theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          {config.theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      {scene === 'Cards' && <CardsScene />}
      {scene === 'Dashboard' && <DashboardScene />}
      {scene === 'Marketing' && <MarketingScene />}
    </div>
  );
}
