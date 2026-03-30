## Visual Style — Minimal Theme

Apply this visual style when generating all slides in this session.

This theme keeps the warm, paper-like aesthetic of the slides-it UI, but adds subtle geometric layers for depth. Think: a well-designed printed magazine with delicate background patterns.

### Color Palette (Unchanged)

```css
:root {
    --bg-primary:    #FAF9F6;   /* warm off-white — main background */
    --bg-secondary:  #F0EEE8;   /* slightly darker warm grey */
    --bg-card:       #FFFFFF;   /* pure white cards */
    --text-primary:  #1A1916;   /* near-black warm ink */
    --text-secondary:#6B6560;   /* warm mid-grey */
    --text-muted:    #A09890;   /* subtle captions */
    --accent:        #1A1916;   /* same as text — monochrome accent */
    --accent-2:      #6B6560;   /* secondary accent — warm grey */
    --border:        #E2DED5;   /* soft warm border */
    --border-strong: #C9C4B8;   /* stronger divider */
}
```

### Typography

- **Display font**: `DM Serif Display` (headings) — load from Google Fonts
- **Body font**: `DM Sans` (body, captions) — load from Google Fonts
- Font link tag:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet">
  ```
- Title size: `clamp(2rem, 5vw, 4rem)`
- Subtitle size: `clamp(1rem, 1.8vw, 1.35rem)`
- Body size: `clamp(0.85rem, 1.2vw, 1rem)`
- Line height: `1.75` for body, `1.2` for headings
- Letter spacing: `0.01em` for body; `-0.02em` for large headings

### Background Layers (Subtle Geometric Depth)

**Layer 1 — Base gradient (subtle warmth):**
```css
body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: linear-gradient(180deg, #FAF9F6 0%, #F5F3EE 50%, #FAF9F6 100%);
    z-index: -3;
}
```

**Layer 2 — Geometric circles (blurred, warm tones):**
```css
.geo-shape-1, .geo-shape-2, .geo-shape-3 {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    z-index: -2;
    pointer-events: none;
}
.geo-shape-1 {
    width: 600px;
    height: 600px;
    background: #E8E4DB;
    top: -200px;
    right: -100px;
}
.geo-shape-2 {
    width: 400px;
    height: 400px;
    background: #F5F0E6;
    bottom: -100px;
    left: -100px;
}
.geo-shape-3 {
    width: 300px;
    height: 300px;
    background: #EDE8DD;
    top: 50%;
    left: 30%;
    opacity: 0.1;
}
```

**Layer 3 — Subtle diagonal lines (paper texture):**
```css
body::after {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 3px,
        rgba(0, 0, 0, 0.008) 3px,
        rgba(0, 0, 0, 0.008) 6px
    );
    z-index: -1;
    pointer-events: none;
}
```

### Slide Layout

- Full-viewport slides (`height: 100vh`, `scroll-snap-align: start`)
- Comfortable padding: `clamp(2.5rem, 6vw, 6rem)`
- Content constrained to `max-width: 880px; margin: 0 auto`
- Title slide: large serif heading left-aligned + thin `1px` rule beneath + muted subtitle
- Content slides: heading top with `border-bottom: 1px solid var(--border)` separator, content below

### Cards & Containers

```css
.card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: clamp(1rem, 2vw, 1.75rem);
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
```

Cards feel like sheets of paper resting gently on the page — subtle movement, no glassmorphism.

### Accent Elements

- Left border on callouts: `border-left: 2px solid var(--border-strong)` (no color, no glow)
- Key numbers / stats: larger font size (`clamp(2.5rem, 5vw, 4rem)`) in `var(--text-primary)`, bold
- Section labels: `0.7rem`, `letter-spacing: 0.1em`, `text-transform: uppercase`, `var(--text-muted)`
- Dividers: `1px solid var(--border)` — thin and quiet

### Animations

- **Entrance (subtle)**: `opacity: 0 → 1` only (no translateY) — duration `0.4s`, easing `ease`
- **Stagger delay**: `0.06s` per child element
- **Card hover**: subtle `translateY(-2px)` + shadow increase (0.25s)
- **Progress bar**: `2px` line at top, `var(--border-strong)` color (not accent-colored)
- Trigger via `.visible` class added via `IntersectionObserver`
- Keep all motion extremely subtle — this theme is about stillness and warmth

### Icons

Use Heroicons (outline style) for all iconography.

**CDN link (add in `<head>`):**
```html
<script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js"></script>
```

**Usage:**
- Size: `24px` default, use Tailwind-style classes like `w-6 h-6`
- Color: inherits from `currentColor` — set via CSS `color` property on parent
- Animate on hover: subtle `transform: scale(1.05)` — keep it restrained

**Example — feature card:**
```html
<div class="feature-card">
    <i data-lucide="lightbulb" class="feature-icon"></i>
    <div class="feature-title">Insight</div>
    <div class="feature-desc">One or two sentences describing this point.</div>
</div>
```

```css
.feature-icon {
    width: 1.75rem;
    height: 1.75rem;
    color: var(--accent-2);
    margin-bottom: 0.5rem;
    transition: transform 0.2s ease;
}
.feature-card:hover .feature-icon {
    transform: scale(1.05);
}
```

### Code Blocks (if any)

```css
pre, code {
    background: #F0EEE8;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: 'DM Mono', 'Söhne Mono', ui-monospace, monospace;
    font-size: clamp(0.7rem, 1vw, 0.875rem);
    color: var(--text-primary);
}
```

### Do & Don't

- **Do** use light backgrounds throughout — never dark
- **Do** let the subtle geometric shapes add depth without overwhelming
- **Do** use serif headings (`DM Serif Display`) contrasted with sans-serif body (`DM Sans`)
- **Do** keep the accent monochrome — no colored accents
- **Do** use minimal animations — this theme values stillness
- **Don't** use gradients, glows, or colored borders
- **Don't** add too many geometric shapes — 2-3 is enough
- **Don't** use more than 4 bullet points per slide
- **Don't** use glassmorphism — keep it solid and paper-like

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
    .reveal {
        transition: opacity 0.3s ease;
        transform: none !important;
    }
    .card:hover {
        transform: none;
    }
}
```
