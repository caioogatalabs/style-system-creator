'use client';

import { useState, type ReactNode } from 'react';
import { Sun, Moon, Minus, Plus, TrendingUp, Github, MoreHorizontal } from 'lucide-react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

/*
 * "In Context" — every shadcn component on one page (tweakcn's Cards demo),
 * driven entirely by the loaded brand's tokens via the shadcn bridge. Read-only,
 * with a local theme toggle to preview the other tone. Masonry layout via CSS
 * columns so cards flow like the reference.
 */

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-2 p-6 mb-6 break-inside-avoid ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-4">
      <p className="text-base font-heading text-text">{title}</p>
      {desc && <p className="text-sm text-text-muted mt-0.5">{desc}</p>}
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 200 48" className="w-full h-12" fill="none" preserveAspectRatio="none">
      <path d="M0 38 C20 36 30 30 50 32 S90 40 110 30 150 8 200 6" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
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

export function ContextPage() {
  const { config, dispatch } = useTokenConfigContext();
  const [goal, setGoal] = useState(350);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <div className="bg-surface min-h-screen px-6 py-12">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading text-text">In Context</h1>
          <p className="text-sm text-text-muted mt-1">Every component, on the loaded brand.</p>
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

      {/* Masonry of every component */}
      <div className="[column-fill:_balance] gap-6 columns-1 md:columns-2 xl:columns-3">

        {/* Buttons & badges */}
        <Card>
          <CardTitle title="Buttons & badges" />
          <div className="flex flex-wrap gap-2 mb-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </Card>

        {/* Total revenue */}
        <Card>
          <p className="text-sm text-text-muted">Total Revenue</p>
          <p className="text-3xl font-heading mt-1 text-text">$15,231.89</p>
          <p className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp size={12} /> +20.1% from last month</p>
          <div className="mt-4"><Sparkline /></div>
        </Card>

        {/* Create account */}
        <Card>
          <CardTitle title="Create an account" desc="Enter your email below to get started." />
          <div className="flex gap-2 mb-4">
            <Button variant="outline" className="flex-1"><Github size={14} /> GitHub</Button>
            <Button variant="outline" className="flex-1">Google</Button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Separator className="flex-1" />
            <span className="text-[10px] tracking-[0.15em] uppercase text-text-muted">or</span>
            <Separator className="flex-1" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctx-email">Email</Label>
              <Input id="ctx-email" type="email" placeholder="you@acme.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctx-pw">Password</Label>
              <Input id="ctx-pw" type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full mt-1">Create account</Button>
          </div>
        </Card>

        {/* Move goal */}
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

        {/* Calendar */}
        <Card>
          <CardTitle title="Calendar" />
          <Calendar mode="single" selected={date} onSelect={setDate} className="w-full" />
        </Card>

        {/* Cookie settings */}
        <Card>
          <CardTitle title="Cookie settings" desc="Manage your cookie preferences." />
          <div className="flex flex-col gap-4">
            {[
              { id: 'nec', label: 'Strictly necessary', on: true },
              { id: 'fun', label: 'Functional', on: false },
              { id: 'perf', label: 'Performance', on: true },
            ].map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor={row.id} className="text-text">{row.label}</Label>
                  <p className="text-xs text-text-muted">These cookies help us improve the experience.</p>
                </div>
                <Switch id={row.id} defaultChecked={row.on} />
              </div>
            ))}
            <Button variant="outline" className="w-full">Save preferences</Button>
          </div>
        </Card>

        {/* Report an issue */}
        <Card>
          <CardTitle title="Report an issue" desc="What area is affected?" />
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <Label>Area</Label>
                <Select defaultValue="Billing">
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="Login">Login</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <Label>Severity</Label>
                <Select defaultValue="Medium">
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctx-subject">Subject</Label>
              <Input id="ctx-subject" placeholder="I need help with…" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ctx-desc">Description</Label>
              <Textarea id="ctx-desc" placeholder="Describe the issue…" rows={3} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Cancel</Button>
              <Button className="flex-1">Submit</Button>
            </div>
          </div>
        </Card>

        {/* Team member with popover */}
        <Card>
          <CardTitle title="Team member" />
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-brand-secondary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text truncate">Sofia Davis</p>
              <p className="text-xs text-text-muted truncate">sofia@acme.com</p>
            </div>
            <Popover>
              <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm text-text hover:bg-muted transition-colors">
                Member <MoreHorizontal size={14} />
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1">
                {['Viewer', 'Developer', 'Billing', 'Owner'].map((role) => (
                  <button key={role} className="w-full text-left rounded-md px-2.5 py-1.5 text-sm text-text hover:bg-muted transition-colors">
                    {role}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardTitle title="Notifications" desc="Choose what you want to hear about." />
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="ntf-email" className="text-text">Email</Label>
              <Switch id="ntf-email" defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="ntf-push" className="text-text">Push</Label>
              <Switch id="ntf-push" />
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Checkbox id="ntf-terms" defaultChecked />
              <Label htmlFor="ntf-terms" className="text-text-muted">Use different settings for mobile</Label>
            </div>
          </div>
        </Card>

        {/* Payments table */}
        <Card>
          <CardTitle title="Payments" desc="Recent transactions." />
          <div className="flex flex-col">
            <div className="grid grid-cols-3 gap-2 text-[10px] tracking-[0.12em] uppercase text-text-muted pb-2 border-b border-border">
              <span>Status</span><span>Email</span><span className="text-right">Amount</span>
            </div>
            {[
              { s: 'Success', v: 'default', e: 'ken@email.com', a: '$316.00' },
              { s: 'Processing', v: 'secondary', e: 'abe@email.com', a: '$242.00' },
              { s: 'Failed', v: 'destructive', e: 'mon@email.com', a: '$837.00' },
            ].map((row) => (
              <div key={row.e} className="grid grid-cols-3 gap-2 items-center py-2.5 border-b border-border last:border-0">
                <span><Badge variant={row.v as 'default' | 'secondary' | 'destructive'}>{row.s}</Badge></span>
                <span className="text-sm text-text-muted truncate">{row.e}</span>
                <span className="text-sm font-mono text-text text-right">{row.a}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ accordion */}
        <Card>
          <CardTitle title="FAQ" />
          <Accordion defaultValue={['item-1']}>
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent><p className="text-text-muted">Yes. It follows WAI-ARIA patterns.</p></AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it themed by the brand?</AccordionTrigger>
              <AccordionContent><p className="text-text-muted">Every surface here reads from the loaded brand tokens.</p></AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I switch tones?</AccordionTrigger>
              <AccordionContent><p className="text-text-muted">Use the toggle up top to preview light or dark.</p></AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

      </div>
    </div>
  );
}
