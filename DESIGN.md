---
name: poundcake-os-dashboard
description: Visual dashboard for Joe's personal agentic OS. A workshop bench.
inherits-from: ~/Desktop/PB/internal/projects/jspro/DESIGN.md
colors:
  ink: "#111410"
  wall: "#1A1E1A"
  shelf: "#222722"
  cream: "#E8E4DF"
  pencil: "#8A8580"
  bookplate: "#9A9590"
  sage: "#8BA888"
  terracotta: "#C47D5A"
  lavender: "#B0A0C8"
  brass: "#D4A855"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
  italic-accent:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontStyle: italic
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
  label:
    fontFamily: "JetBrains Mono"
    fontSize: "0.6875rem"
    letterSpacing: "0.1em"
    textTransform: uppercase
    color: "{colors.pencil}"
---

# Design System: POUNDCAKE OS Dashboard

This dashboard inherits the workshop language from `anotherjoescott.com` (full reference at `~/Desktop/PB/internal/projects/jspro/DESIGN.md`). This file documents the project-specific deviations and decisions.

## 1. Inheritance

The dashboard adopts wholesale from jspro:

- **Colors** — same palette, same role assignments. Workshop Ink → Wall → Shelf neutral ramp. Page Cream / Pencil Lead / Bookplate Gray text colors. Reading-lamp Sage as room color, three Tertiary markers (Terracotta, Lavender, Brass).
- **Typography character** — IBM Plex Sans body, Instrument Serif italic, JetBrains Mono labels.
- **Workshop rules** — Sage Walls Rule, One-Marker Rule, No-Pure-Black Rule, Flat-By-Default Rule, Tonal-Layer Rule, Mono Label Rule, Italic-Sparingly Rule.
- **Anti-patterns** — same forbidden list (gradient text, decorative shadows, hero metrics, identical card grids, em dashes).

## 2. Project-Specific Deviations

The dashboard differs from jspro in three documented places:

### 2.1 Display Font: Inter Replaces Source Serif 4

The dashboard's headline display font is **Inter** at weights 700-800, not Source Serif 4. Rationale: the dashboard is a tool surface (product register), not editorial content (brand register). Inter's tighter geometric letterforms read better at small sizes, in dense informational layouts, and on screen-only contexts. Body and labels are unchanged from the jspro spec.

### 2.2 The Waves Are A Frame, Not A Field

The signature `<Waves />` canvas is ported from jspro at `src/components/Waves.tsx`. In jspro it sits behind the home page only. In the dashboard, it sits behind the entire app at fixed `z-0`.

Critical rule: **chrome surfaces are solid**, not translucent. Header, sidebar, result panel, and tile bodies use solid `#111410` (ink) or `#1A1E1A` (wall). The waves are visible only in the gaps between tiles. This is the opposite of glassmorphism: the waves are the room, the surfaces are the things on the workbench.

Backdrop-blur is forbidden on chrome. If a surface needs to overlap the waves, it does so opaquely.

### 2.3 Domain Tile Asymmetry

The seven domain tiles use a 12-column grid at `xl` breakpoint with explicit per-domain spans:

- `coaching`, `account`, `sales`, `pod`, `eng` → `xl:col-span-4` (standard, 3 per row)
- `strategy`, `brand` → `xl:col-span-8` (featured, half-row each)

Featured tiles render their inner skills in `lg:grid-cols-2`, standard tiles stack single-column. This breaks the "identical card grids" anti-pattern: the tiles vary in width, header type-size, and internal density.

Below `xl`, the grid falls back to `lg:grid-cols-3` / `sm:grid-cols-2` / `grid-cols-1` and tiles are uniform. The asymmetry is xl+ only.

## 3. Marker Treatment

Each domain carries one marker color from the One-Marker Rule rotation:

| Domain | Marker | Hex |
|---|---|---|
| Coaching | Sage | `#8BA888` |
| Account | Terracotta | `#C47D5A` |
| Strategy & Insights | Lavender | `#B0A0C8` |
| AI Pod | Brass | `#D4A855` |
| Sales | Sage | `#8BA888` |
| Personal Brand | Terracotta | `#C47D5A` |
| Engineering | Lavender | `#B0A0C8` |

Markers appear in **two** places per tile, never more:

1. The full tile border at 18% opacity. Subtle frame.
2. The skill-count badge in the tile header (mono, full saturation).
3. The header bottom-rule at 25% opacity.

That last one technically makes three. Acceptable: the rule and the border are the same gesture (a frame). The count is the only "loud" marker per tile.

**Forbidden:** side-stripe borders (`border-left` > 1px). The audit caught this in v1; the corrective is the full-border treatment above.

## 4. Components

### 4.1 Workshop Card (`workshop-card`)

```css
background-color: #1A1E1A;       /* solid wall */
border: 1px solid <marker-18%>;
border-radius: 0.75rem;
transition: all 200ms ease-out-quart;
```

Hover: background → `#222722` (shelf). No shadow, no blur, no glow.

### 4.2 Skill Button (`skill-button`)

```css
background-color: transparent;
border: 1px solid rgba(139, 168, 136, 0.08);
border-radius: 0.5rem;
padding: 0.75rem 0.875rem;
min-height: 44px;
```

Hover: background → `#222722`, border → sage at 30%. Focus-visible: 2px sage outline at 2px offset.

### 4.3 Send Button (chat input)

Per the inherited `button-warm` spec:

```css
background-color: #C47D5A;       /* Terracotta */
color: #111410;                  /* Workshop Ink — required for WCAG AA */
border: 1px solid #C47D5A;
padding: 0.625rem 1rem;
min-height: 44px;
```

The text MUST be ink, not cream. Cream on terracotta fails WCAG AA (3.7:1). Ink on terracotta passes (5.7:1). The audit caught this in v1.

### 4.4 Run Skill Button (per-tile)

Same shape as the send button, but the background uses the tile's marker color rather than always Terracotta. Text remains ink. Disabled state: transparent background, marker-color text.

### 4.5 Inputs

```css
background-color: #111410;       /* ink */
border: 1px solid rgba(139, 168, 136, 0.10);
border-radius: 0.25rem;
padding: 0.5rem 0.625rem;
font-family: JetBrains Mono;
color: #9A9590;                  /* bookplate at rest */
```

Focus: border → `#8BA888` (sage), text → `#E8E4DF` (cream).

Placeholder: `#9A9590` (bookplate). Not pencil at 60%. The audit caught the contrast failure.

### 4.6 Mono Labels

`.label-mono` — used for category headers, file metadata, status states, and command names. JetBrains Mono uppercase 0.6875rem with 0.1em letter-spacing in Pencil Lead.

## 5. Layout

### 5.1 Three-Column Chrome (`xl+`)

```
[ Sidebar 240/256 ] [ Main grid (flex-1) ] [ Result panel 400/460 ]
```

All three are solid Ink. Internal padding varies for rhythm.

### 5.2 Responsive Strategy

The dashboard is laptop-first. Below xl (1280px) the result panel hides. Below lg (1024px) the sidebar hides. Below sm the domain grid falls to single column. Joe uses skills from terminal on smaller screens.

### 5.3 Result Panel Layout

The chat output and input are stacked in a flex column:

- Output (no fixed flex; sizes to content; `overflow-y-auto` with `min-h-0`)
- Input (flex-none, sits directly below output)

Empty space falls below the input until output grows enough to push it down. When output exceeds available space, the output area scrolls internally and input pins. This creates the "input drifts down with the conversation" behavior.

## 6. Motion

- Transitions: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quart) at 180-200ms
- No bounce, no elastic, no spring
- The Waves canvas runs at 60fps via simplex noise; respects `prefers-reduced-motion`
- No animated layout properties (no animated width/height/top/left)

## 7. Accessibility Floor

- All text meets WCAG AA (4.5:1 normal, 3:1 large)
- All interactive elements have visible focus indicators (2px sage outline)
- Form inputs have associated `<label htmlFor>`
- The output stream uses `aria-live="polite" aria-relevant="additions"`
- Status changes have `aria-live` announcers (visually hidden)
- All buttons are `<button>`, not divs

## 8. Anti-Patterns Specific To This Project

In addition to the inherited workshop rules:

- **Don't blur chrome.** Glassmorphism is the easy AI tell when waves are present. Solid surfaces only.
- **Don't make the tile grid uniform at xl.** The asymmetric layout is a corrective; converging back to a 3x3 grid is regression.
- **Don't surface live metrics as hero numbers.** No "X skills run today" big-number cards. The sidebar shows compact stats with mono labels; that's the ceiling.
- **Don't add empty-state illustrations.** The italic Instrument Serif quote is the empty state.
