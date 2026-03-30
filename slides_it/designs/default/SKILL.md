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
- Title size: `clamp(2.5rem, 6vw, 5rem)`
- Subtitle size: `clamp(1rem, 2vw, 1.5rem)`
- Body size: `clamp(0.85rem, 1.2vw, 1rem)`
- Text shadow on titles: `0 0 40px rgba(34, 211, 238, 0.3)` (subtle glow)

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
    filter: blur(100px);
    opacity: 0.4;
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
    opacity: 0.25;
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
    opacity: 0.4;
    z-index: -1;
    pointer-events: none;
}
```

### Slide Layout

- Full-viewport slides (`height: 100vh`, `scroll-snap-align: start`)
- Generous padding: `clamp(2rem, 5vw, 5rem)`
- Content centered with `max-width: 960px; margin: 0 auto`
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
    padding: clamp(1.25rem, 2vw, 2rem);
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
- **Stagger delay**: `0.1s` per child element
- **Card hover**: smooth `transform` + `box-shadow` transition (0.3s)
- **Progress bar**: thin `3px` line at top, gradient from `var(--accent)` to `var(--accent-2)`
- Trigger all entrance animations via `.visible` class added via `IntersectionObserver`

### Icons

Use Heroicons (outline style) for all iconography.

**CDN link (add in `<head>`):**
```html
<script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js"></script>
```

**Usage:**
- Size: `24px` default, use Tailwind-style classes like `w-8 h-8`
- Color: inherits from `currentColor` — set via CSS `color` property on parent
- Animate on hover: `transform: scale(1.1)` + `transition: transform 0.2s ease`

**Example — feature card:**
```html
<div class="feature-card">
    <i data-lucide="rocket-launch" class="feature-icon"></i>
    <div class="feature-title">Fast Launch</div>
    <div class="feature-desc">Deploy in seconds, scale automatically.</div>
</div>
```

```css
.feature-icon {
    width: 2rem;
    height: 2rem;
    color: var(--accent);
    margin-bottom: 0.75rem;
    transition: transform 0.2s ease;
}
.feature-card:hover .feature-icon {
    transform: scale(1.15);
}
```

### Code Blocks (if any)

```css
pre, code {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: clamp(0.7rem, 1vw, 0.875rem);
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
