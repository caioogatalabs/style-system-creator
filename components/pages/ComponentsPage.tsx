'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight,
  Download,
  Settings,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';

// ── Shared helpers ──────────────────────────────────────────────────────────

function SectionHeader({ letter, num, label, description }: {
  letter: string;
  num: string;
  label: string;
  description?: string;
}) {
  return (
    <div
      className="mb-10 flex items-start gap-6 border-b pb-6"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <span
        className="font-mono text-7xl font-light leading-none select-none"
        style={{ color: 'var(--color-border)' }}
      >
        {letter}
      </span>
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-1">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-mono"
            style={{ borderColor: 'var(--color-text-muted)', color: 'var(--color-text-muted)' }}
          >
            {num}
          </span>
          <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
            {label}
          </span>
        </div>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function TokenTag({ name }: { name: string }) {
  return (
    <code
      style={{
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '9px',
        color: 'var(--color-text-dim)',
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-1)',
        padding: '2px 6px',
        display: 'inline-block',
        marginRight: '4px',
        marginTop: '4px',
      }}
    >
      {name}
    </code>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
      {children}
    </p>
  );
}

function ComponentCard({ children, tokens }: { children: React.ReactNode; tokens: string[] }) {
  return (
    <div
      className="p-6"
      style={{
        backgroundColor: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-3)',
        border: '1px solid var(--color-border)',
      }}
    >
      {children}
      {tokens.length > 0 && (
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-[8px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--color-text-dim)', opacity: 0.6 }}>
            tokens used
          </p>
          <div className="flex flex-wrap">
            {tokens.map((t) => <TokenTag key={t} name={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export function ComponentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [switchOn, setSwitchOn] = useState(true);

  return (
    <div className="px-6 py-16" style={{ backgroundColor: 'var(--color-surface)', minHeight: '100vh' }}>
      {/* Page header */}
      <div
        className="mb-12 flex items-start gap-6 border-b pb-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span
          className="font-mono text-7xl font-light leading-none select-none"
          style={{ color: 'var(--color-border)' }}
        >
          L
        </span>
        <div className="pt-4">
          <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
            Component Library
          </span>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
            Interactive components consuming your semantic design tokens
          </p>
        </div>
      </div>

      {/* ── Grid layout: 3 columns ── */}
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>

        {/* Button Variants */}
        <ComponentCard tokens={['--color-primary', '--color-on-primary', '--color-surface-raised']}>
          <SubLabel>Button Variants</SubLabel>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="default" size="sm">Primary</Button>
            <Button variant="secondary" size="sm">Secondary</Button>
            <Button variant="outline" size="sm">Outline</Button>
            <Button variant="ghost" size="sm">Ghost</Button>
            <Button variant="destructive" size="sm">Destructive</Button>
          </div>
        </ComponentCard>

        {/* Button Sizes */}
        <ComponentCard tokens={['--radius-1', '--radius-2', '--radius-3']}>
          <SubLabel>Button Sizes</SubLabel>
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="ghost"><Settings size={16} /></Button>
          </div>
        </ComponentCard>

        {/* Button States */}
        <ComponentCard tokens={['--color-primary-hover', '--color-primary-active']}>
          <SubLabel>Button States</SubLabel>
          <div className="flex flex-wrap gap-2 items-center">
            <Button disabled size="sm">Disabled</Button>
            <Button size="sm">
              <Loader2 className="animate-spin" size={14} />
              Loading
            </Button>
            <Button size="sm">
              Continue
              <ArrowRight size={14} />
            </Button>
          </div>
        </ComponentCard>

        {/* Input Default */}
        <ComponentCard tokens={['--color-border-muted', '--color-text', '--color-primary']}>
          <SubLabel>Text Input</SubLabel>
          <div className="flex flex-col gap-2">
            <Label htmlFor="input-default">Email address</Label>
            <Input id="input-default" placeholder="name@example.com" />
          </div>
        </ComponentCard>

        {/* Input Error */}
        <ComponentCard tokens={['--color-danger', '--color-danger-muted']}>
          <SubLabel>Error State</SubLabel>
          <div className="flex flex-col gap-2">
            <Label htmlFor="input-error">Password</Label>
            <Input id="input-error" aria-invalid="true" defaultValue="wrong" type="password" />
            <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-danger)' }}>
              <AlertCircle size={12} />
              Must be at least 8 characters
            </p>
          </div>
        </ComponentCard>

        {/* Input Disabled */}
        <ComponentCard tokens={['--color-text-muted', '--color-border']}>
          <SubLabel>Disabled Input</SubLabel>
          <div className="flex flex-col gap-2">
            <Label htmlFor="input-disabled">Account ID</Label>
            <Input id="input-disabled" disabled defaultValue="usr_1234567890" />
          </div>
        </ComponentCard>

        {/* Textarea — spans 2 cols */}
        <div style={{ gridColumn: 'span 2' }}>
          <ComponentCard tokens={['--color-border-muted', '--color-text']}>
            <SubLabel>Textarea</SubLabel>
            <div className="flex flex-col gap-2">
              <Label htmlFor="textarea-demo">Message</Label>
              <Textarea id="textarea-demo" placeholder="Describe your design system goals..." rows={3} />
            </div>
          </ComponentCard>
        </div>

        {/* Select */}
        <ComponentCard tokens={['--color-surface-raised', '--color-border-muted', '--color-primary']}>
          <SubLabel>Select</SubLabel>
          <div className="flex flex-col gap-2">
            <Label>Design Category</Label>
            <Select defaultValue="design">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="design">Design Systems</SelectItem>
                  <SelectItem value="typography">Typography</SelectItem>
                  <SelectItem value="color">Color Theory</SelectItem>
                  <SelectItem value="motion">Motion Design</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </ComponentCard>

        {/* Switches */}
        <ComponentCard tokens={['--color-primary', '--color-border-muted', '--color-text']}>
          <SubLabel>Switch</SubLabel>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Switch id="switch-off" />
              <Label htmlFor="switch-off" style={{ color: 'var(--color-text-muted)' }}>Notifications</Label>
            </div>
            <div className="flex items-center gap-4">
              <Switch id="switch-on" checked={switchOn} onCheckedChange={setSwitchOn} />
              <Label htmlFor="switch-on" style={{ color: 'var(--color-text)' }}>
                Dark mode {switchOn ? 'on' : 'off'}
              </Label>
            </div>
            <div className="flex items-center gap-4">
              <Switch id="switch-disabled" disabled defaultChecked />
              <Label htmlFor="switch-disabled" style={{ color: 'var(--color-text-dim)' }}>Locked</Label>
            </div>
          </div>
        </ComponentCard>

        {/* Checkboxes */}
        <ComponentCard tokens={['--color-primary', '--color-on-primary', '--color-border-muted']}>
          <SubLabel>Checkbox</SubLabel>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Checkbox id="cb-unchecked" />
              <Label htmlFor="cb-unchecked" style={{ color: 'var(--color-text-muted)' }}>Accept terms</Label>
            </div>
            <div className="flex items-center gap-4">
              <Checkbox id="cb-checked" defaultChecked />
              <Label htmlFor="cb-checked" style={{ color: 'var(--color-text)' }}>Remember me</Label>
            </div>
            <div className="flex items-center gap-4">
              <Checkbox id="cb-disabled" disabled />
              <Label htmlFor="cb-disabled" style={{ color: 'var(--color-text-dim)' }}>Unavailable</Label>
            </div>
          </div>
        </ComponentCard>

        {/* Badges — spans full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <ComponentCard tokens={['--color-primary', '--color-surface-raised', '--color-danger', '--color-accent']}>
            <SubLabel>Badges</SubLabel>
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="ghost">Ghost</Badge>

              <div className="w-px h-5 mx-2" style={{ backgroundColor: 'var(--color-border)' }} />

              <span
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-on-primary)' }}
              >
                Accent
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
                style={{ backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                Active
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
                style={{ backgroundColor: 'var(--color-warning-muted)', color: 'var(--color-warning)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }} />
                Pending
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
                style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-danger)' }} />
                Error
              </span>
            </div>
          </ComponentCard>
        </div>

        {/* Calendar */}
        <ComponentCard tokens={['--color-primary', '--color-on-primary', '--color-surface-raised', '--radius-2']}>
          <SubLabel>Calendar</SubLabel>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        </ComponentCard>

        {/* Accordion — spans 2 cols */}
        <div style={{ gridColumn: 'span 2' }}>
          <ComponentCard tokens={['--color-border', '--color-text', '--color-text-muted']}>
            <SubLabel>Accordion</SubLabel>
            <Accordion>
              <AccordionItem value="item-1">
                <AccordionTrigger style={{ color: 'var(--color-text)' }}>
                  What are semantic tokens?
                </AccordionTrigger>
                <AccordionContent>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    Semantic tokens are named design decisions that carry meaning beyond raw values. Instead of{' '}
                    <code style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.85em' }}>#6366f1</code>, you use{' '}
                    <code style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.85em' }}>--color-primary</code>.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger style={{ color: 'var(--color-text)' }}>
                  How does the OKLCH color scale work?
                </AccordionTrigger>
                <AccordionContent>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    Each seed hex is converted to OKLCH. The hue is preserved while lightness and chroma follow
                    predefined curves across 11 steps (50-950), ensuring consistent perceptual contrast.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger style={{ color: 'var(--color-text)' }}>
                  Why does changing one color update everything?
                </AccordionTrigger>
                <AccordionContent>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    All components reference CSS custom properties on <code style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.85em' }}>:root</code>.
                    When you change a primitive, the token engine recomputes semantics and writes to the DOM. CSS vars cascade, so everything re-paints instantly.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ComponentCard>
        </div>

      </div>
    </div>
  );
}
