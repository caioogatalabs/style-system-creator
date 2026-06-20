# Token Redesign Study — Color System Comparison

## Date: 2026-03-09

## Context
Comparative study of Material Design 3, Geist (Vercel), Nord (Nordhealth), Radix, and our system.
Goal: make token naming unambiguous and the theme builder intuitive.

---

## Decision: 4 Key Colors + Error/Status

### Key Colors (user input)
| Key Color | Role | Generates |
|---|---|---|
| **primary** | CTAs, filled buttons, FABs, active indicators | fill, hover, active, text, on |
| **secondary** | Less prominent actions: outlined buttons, chips, toggles | fill, hover, text, on |
| **accent** | Stand-out elements: badges, notifications, highlights | fill, hover, text, on |
| **neutral** | Surfaces, text hierarchy, borders | surface, text, border |

### Removed
- **tertiary** as "dim text color" — text hierarchy comes from neutral (like M3)

---

## Token Naming Rules

1. **"primary/secondary/accent" = always color identity**, never importance hierarchy
2. **Text hierarchy uses visual vocabulary**: text → text-muted → (no dim)
3. **"on-X" = text on top of fill X** (from M3)
4. **Non-color tokens = numeric scale**: shadow-1/2/3, radius-1/2/3, outline-1/2/3

---

## Complete Token Map

### Per-color tokens (primary, secondary, accent)
| Token | Dark (step) | Light (step) | Use |
|---|---|---|---|
| `--color-{name}` | 500 | 500 | Fill |
| `--color-{name}-hover` | 400 | 600 | Hover state |
| `--color-{name}-active` | 300 | 700 | Pressed state |
| `--color-{name}-text` | 300 | 700 | Colored text (links, labels) |
| `--color-on-{name}` | 950 | 50 | Text on top of fill |

### Neutral-derived tokens
| Token | Dark (step) | Light (step) | Use |
|---|---|---|---|
| `--color-surface` | 900 | 50 | Page background |
| `--color-surface-raised` | 800 | 100 | Cards, panels, dialogs |
| `--color-text` | 100 | 900 | Body text, headings |
| `--color-text-muted` | 400 | 600 | Labels, placeholders, timestamps |
| `--color-border` | 700 | 300 | Input borders, card borders |
| `--color-border-muted` | 800 | 200 | Decorative dividers |

### Status tokens (user-configurable)
| Token | Use |
|---|---|
| `--color-danger` | Errors, destructive actions |
| `--color-warning` | Caution states |
| `--color-success` | Completion, approval |
| `--color-info` | Neutral information |

### Non-color (numeric scale)
```
--shadow-1 / --shadow-2 / --shadow-3
--radius-1 / --radius-2 / --radius-3 / --radius-full
--outline-1 / --outline-2 / --outline-3
--space-1 / --space-2 / --space-3 / ...
```

---

## Theme Inversion Logic

Symmetric mirroring around step 500 (seed):
- Dark mode: text/hover pull toward lighter steps (left on scale)
- Light mode: text/hover pull toward darker steps (right on scale)
- Fill stays at 500 in both themes

```
Scale:  50  100  200  300  400  500  600  700  800  900  950
Dark:   on                text/hover [seed] hover         surface
Light:  surface           hover [seed] text/hover         on
```

---

## User-Facing Descriptions (for theme builder UI)

### Primary
- `--color-primary`: The main color for key actions: filled buttons, FABs, and active indicators
- `--color-primary-hover`: Applied when the user hovers over a primary element
- `--color-primary-active`: Applied when a primary element is being pressed
- `--color-primary-text`: Used for text and icons that carry the primary color: links, highlighted labels
- `--color-on-primary`: Applied to text and icons sitting on top of a primary fill

### Secondary
- `--color-secondary`: Used for less prominent actions: outlined buttons, chips, toggles
- `--color-secondary-hover`: Hover state for secondary elements
- `--color-secondary-text`: Text and icons in the secondary color: tags, category labels
- `--color-on-secondary`: Text and icons on top of a secondary fill

### Accent
- `--color-accent`: For elements that stand out from both primary and secondary: badges, notifications, highlights
- `--color-accent-hover`: Hover state for accent elements
- `--color-accent-text`: Text in the accent color: counters, price highlights, attention markers
- `--color-on-accent`: Text and icons on top of an accent fill

### Neutral
- `--color-surface`: The background color for the app — the lowest layer in the visual hierarchy
- `--color-surface-raised`: Background for components above the surface: cards, sheets, dialogs
- `--color-text`: Default text color for body copy, headings, and high-emphasis content
- `--color-text-muted`: Medium-emphasis text: secondary labels, placeholders, timestamps
- `--color-border`: Default border color for inputs, cards, and dividers
- `--color-border-muted`: Subtle borders for decorative dividers and low-emphasis separators

### Status
- `--color-danger`: Communicates errors, destructive actions, and critical states
- `--color-warning`: Communicates caution — actions that need attention but aren't destructive
- `--color-success`: Communicates completion, approval, or positive outcomes
- `--color-info`: Communicates neutral information and helpful context

---

## Theme Builder UX Ideas

### Color picker with descriptions
Each color input shows: description + generated tokens + mini component previews

### Scale with active indicators
On the primitive scale (50-950), show which steps are mapped to semantic tokens.
Example: on the neutral scale, mark which step is `surface`, which is `text`, which is `border`.

### Status colors should be user-configurable
User picks hue/saturation for danger/warning/success/info to match their aesthetic (pastel, vivid, etc.)

### Component preview
- Grid layout (2-3 columns), not stacked vertically
- Interactive components, not static state displays
- Reference: Azion Console Kit component page (see screenshot)

---

## Reference Systems Studied
- Material Design 3 (m3.material.io) — primary/on-primary/container pattern
- Geist (Vercel) — color+scale, no primary/secondary naming
- Nord (Nordhealth) — use-based naming (accent, text-on-accent)
- Radix Themes — color+scale with fixed semantic bands
- shadcn/ui — primary/foreground pattern
