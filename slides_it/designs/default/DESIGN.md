---
name: default
description: Clean modern dark theme — works for any topic
author: slides-it
version: 1.0.0
preview: https://raw.githubusercontent.com/slides-it/slides-it/main/slides_it/designs/default/preview.png
---

## Visual Style — Aurora Theme

Apply this visual style when generating all slides in this session.

### Color Palette

```css
:root {
    --bg-primary:    #030712;      /* deep night sky */
    --bg-secondary:  #0f172a;      /* slightly lighter */
    --bg-card:       rgba(30, 41, 59, 0.6);  /* translucent card */
    --text-primary:  #f8fafc;
    --text-secondary:#94a3b8;
    --accent:        #22d3ee;       /* cyan aurora */
    --accent-2:      #a78bfa;      /* violet aurora */
    --accent-3:      #34d399;      /* emerald highlight */
    --border:        rgba(34, 211, 238, 0.15);
    --glow:          rgba(34, 211, 238, 0.25);
}
```

### Typography

- **Display font**: `Clash Display` (headings) — load from Fontshare
- **Body font**: `Satoshi` (body, captions) — load from Fontshare
- Font link tag:
  ```html
  <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500&display=swap">
  ```
- Title size (h1): `80px`, weight 700
- Section heading (h2): `38px`, weight 600
- Subtitle size: `24px`
- Body size: `16px`
- Label: `11px`, letter-spacing `0.12em`, uppercase
- Card title: `19px`, weight 600
- Card body: `14px`
- Stat number: `64px`, weight 700
- Stat label: `14px`, uppercase
- Text shadow on titles: `0 0 40px rgba(34, 211, 238, 0.3)` (subtle glow)

All sizes are fixed `px` — designed for the 1920×1080 canvas. JS `transform: scale()`
handles viewport adaptation. **Never use `clamp()` or viewport-relative units.**

### Background Layers (Order: back to front)

**Layer 1 — Base gradient:**
```css
body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 120% 80% at 50% 0%, #1e1b4b 0%, #030712 60%);
    z-index: -3;
}
```

**Layer 2 — Noise texture:**
```css
body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.03;
    z-index: -2;
    pointer-events: none;
}
```

**Layer 3 — Aurora ribbons (3 layers, different colors/speeds):**
```css
.aurora-1, .aurora-2, .aurora-3 {
    position: fixed;
    width: 150%;
    height: 60%;
    filter: blur(80px);
    opacity: 0.6;
    animation: aurora-drift 25s ease-in-out infinite alternate;
    z-index: -1;
    pointer-events: none;
}
.aurora-1 {
    top: -10%;
    left: -25%;
    background: linear-gradient(135deg, #22d3ee 0%, transparent 60%);
    animation-duration: 28s;
}
.aurora-2 {
    top: 20%;
    right: -30%;
    background: linear-gradient(225deg, #a78bfa 0%, transparent 50%);
    animation-duration: 35s;
    animation-delay: -10s;
}
.aurora-3 {
    top: 40%;
    left: 10%;
    background: linear-gradient(90deg, #34d399 0%, transparent 40%);
    animation-duration: 22s;
    animation-delay: -5s;
    opacity: 0.4;
}
@keyframes aurora-drift {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -20px) scale(1.1); }
    100% { transform: translate(-20px, 20px) scale(0.95); }
}
```

**Layer 4 — Stars (optional, sparse):**
```css
.stars {
    position: fixed;
    inset: 0;
    background-image: radial-gradient(1px 1px at 20% 30%, white 50%, transparent),
                      radial-gradient(1px 1px at 40% 70%, white 50%, transparent),
                      radial-gradient(1.5px 1.5px at 60% 20%, white 50%, transparent),
                      radial-gradient(1px 1px at 80% 60%, white 50%, transparent);
    opacity: 0.7;
    z-index: -1;
    pointer-events: none;
}
```

### Slide Layout

- **1920×1080 fixed canvas** — each slide uses a `.slide-canvas` (1920×1080px),
  scaled to fit the viewport via JS `transform: scale()`. See SKILL.md CSS Rules.
- Content width tiers (inside canvas, via `max-width` + `margin: 0 auto`):
  - Default (`1200px`): Cover, Quote, Closing
  - Wide (`1600px`): Feature Cards, Stats Row, Two-Column, Step Flow
- Canvas padding: `60px 80px`
- Title slide: large centered heading + glowing accent line beneath
- Content slides: heading top-left, content below with glassmorphism cards

### Cards & Glassmorphism

```css
.card {
    background: var(--bg-card);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--glow);
    border-color: var(--glow);
}
```

### Accent Elements

- Left border accent on callouts: `border-left: 3px solid var(--accent)`
- Gradient text for key phrases:
  ```css
  .gradient-text {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
  }
  ```
- Section dividers: `1px` horizontal rule with `var(--border)`
- Glowing underline on important terms: `box-shadow: 0 2px 0 var(--accent)`

### Animations

- **Entrance (default)**: `opacity: 0 → 1` + `translateY(24px → 0)`, duration `0.6s`, easing `cubic-bezier(0.16, 1, 0.3, 1)`
- **Stagger delay**: `0.1s` increments — delays: `0s, 0.1s, 0.1s, 0.2s, 0.3s, 0.4s` (3rd child shares 2nd child's delay)
- **Card hover**: smooth `transform` + `box-shadow` transition (0.3s)
- **Progress bar**: thin `3px` line at top, gradient from `var(--accent)` to `var(--accent-2)`
- Trigger all entrance animations via `.visible` class added via `IntersectionObserver`
- Cover slide title: combine `translateY` + subtle `scale(0.97 → 1)` for a weight-drop feel
- Numeric data (percentages, dollar amounts, counts): JS counter animation counting from 0 to target on slide enter
- List items must stagger — never reveal all items simultaneously

### Icons & Graphic Elements

- Load Lucide icons via CDN: `<script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js"></script>`
- Icon color: `var(--accent)`, size: `2rem`, hover: `scale(1.15)` transition
- Every content slide must include at least one of:
  - A Lucide icon relevant to the slide topic
  - A decorative accent line, left border stripe, or geometric shape using the accent color
  - Numbered circle badges for step/process slides
  - A subtle background shape (low opacity, does not interfere with readability)

### Slide Layout Variants

Use these layout patterns based on content type. All use glassmorphism cards with
`backdrop-filter: blur(12px)` and the aurora color palette.

**Stats Row** — 3-column grid of glassmorphism stat cards, large numbers in
`var(--accent)` with glow shadow, counter animation on slide enter.

**Two-Column** — left: heading + body text, right: glassmorphism card with
supporting evidence. Gap: `64px`.

**Step Flow** — horizontal process with numbered circles in gradient
(`var(--accent)` → `var(--accent-2)`), connector lines with subtle glow.

**Feature Cards** — 2×2 grid of glassmorphism cards, each with Lucide icon in
`var(--accent)`, accent top border using gradient.

**Quote Block** — large text with `border-left: 3px solid var(--accent)`,
subtle text glow, on a dark transparent card.

**Full-bleed Dark Callout** — single powerful statement, `--bg-primary` background
with aurora ribbons more visible, large gradient text. Use max once per deck.

### Code Blocks (if any)

```css
pre, code {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 14px;
    color: var(--accent);
}
```

### Do & Don't

- **Do** use the layered aurora background — it creates depth and atmosphere
- **Do** use glassmorphism cards with `backdrop-filter`
- **Do** keep accent colors to cyan/violet/emerald — stay in the aurora palette
- **Do** add subtle glow effects to titles and key elements
- **Don't** use bright white or pure black backgrounds
- **Don't** use more than 3 accent colors on a single slide
- **Don't** clutter slides — max 5 bullet points per slide
- **Don't** disable `prefers-reduced-motion` — provide smoother alternatives

### Reduced Motion

Respect users who prefer reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
    .aurora-1, .aurora-2, .aurora-3 {
        animation: none;
        opacity: 0.3;
    }
    .reveal {
        transition: opacity 0.4s ease;
        transform: none !important;
    }
}
```
