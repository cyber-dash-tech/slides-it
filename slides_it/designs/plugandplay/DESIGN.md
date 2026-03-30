---
name: plugandplay
description: Plug and Play brand style — off-white canvas, deep navy sections, violet accent, Inter typography
author: slides-it
version: 1.0.0
preview: bundled
---

## Visual Style — Plug and Play Theme

Apply this visual style when generating all slides in this session.

This theme faithfully reproduces the Plug and Play Tech Center brand identity:
off-white canvas for content pages, deep navy for cover and closing pages,
a vivid violet-indigo accent, and Inter as the single typeface across all weights.

---

### Color Palette

```css
:root {
    /* Backgrounds */
    --bg-primary:    #f5f5f5;          /* off-white canvas — content slides */
    --bg-secondary:  #ffffff;          /* white card surface */
    --bg-dark:       #070e34;          /* deep navy — cover + closing slides */
    --bg-surface:    #18203f;          /* dark navy panel / overlay */
    --bg-tint:       #edecfc;          /* soft violet tint — highlighted cards */
    --bg-tint-blue:  #ebf6ff;          /* soft sky tint — secondary highlights */

    /* Text */
    --text-primary:  #070e34;          /* near-black navy on light slides */
    --text-secondary:#788098;          /* muted grey for subtext */
    --text-muted:    #a5aaba;          /* captions, metadata */
    --text-on-dark:  #ffffff;          /* white on dark-navy slides */
    --text-on-dark-2:#b5c2e1;          /* muted blue-grey on dark slides */

    /* Accent */
    --accent:        #5748f5;          /* brand violet-indigo — primary CTA, highlights */
    --accent-hover:  #3a2be0;          /* darker violet — hover state */
    --accent-active: #3024b1;          /* deep indigo — pressed state */
    --accent-light:  #a59ef4;          /* lavender — secondary text on dark */
    --accent-lighter:#edecfc;          /* near-white violet tint */
    --accent-2:      #348aed;          /* brand sky-blue — secondary accent */
    --accent-2-light:#c8e2fc;          /* pale blue tint */

    /* Borders */
    --border:        #e4e9f5;          /* light blue-grey border */
    --border-strong: #dfe1eb;          /* slightly darker border */

    /* Gradients */
    --gradient-hero: linear-gradient(256deg, #edecfe -4.2%, #ebf6ff 82.53%);
    --gradient-cta:  linear-gradient(45deg, #5547f5, #5aa3f8 90.1%);
    --gradient-tint: linear-gradient(90deg, #edf3fe, #ededfd);

    /* Shadows — brand-signature colored bloom */
    --shadow-card:   0 1px 3px rgba(7,14,52,0.08), 0 4px 16px rgba(7,14,52,0.05);
    --shadow-accent: 0 20px 28px -20px rgba(58,43,224,0.75);
    --shadow-soft:   0 20px 20px -19px rgba(128,119,240,0.6);
}
```

---

### Typography

- **Single typeface**: `Inter` — all headings, body, captions, labels
- Load from Google Fonts across all weights used:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  ```
- Title size (cover): `clamp(2.8rem, 6vw, 5rem)`, weight `700`
- Section heading: `clamp(1.8rem, 3.5vw, 3rem)`, weight `600`
- Sub-heading: `clamp(1.2rem, 2vw, 1.75rem)`, weight `600`
- Body: `clamp(0.9rem, 1.2vw, 1.1rem)`, weight `400`, line-height `1.65`
- Large stat numbers: `clamp(2.5rem, 5vw, 4rem)`, weight `800`
- Label / caption: `clamp(0.7rem, 0.9vw, 0.85rem)`, weight `500`, `letter-spacing: 0.04em`, `text-transform: uppercase`
- Letter spacing on headings: `-0.01em` (subtle tightening at large sizes)
- **Never** use system fonts, serif fonts, or any typeface other than Inter

---

### Slide Layout

- Full-viewport slides: `height: 100vh`, `scroll-snap-type: y mandatory`
- Content slide padding: `clamp(2.5rem, 5vw, 5rem)` — generous and airy
- Content constrained to `max-width: 1000px; margin: 0 auto`
- Default content alignment: left-aligned (not centered)
- All content slides use `--bg-primary` (`#f5f5f5`) background

**Cover slide** (`.title-slide`):
- Background: `--bg-dark` (`#070e34`) full-bleed
- Main title: white, weight 700, large
- Subtitle/tagline: `--text-on-dark-2` (`#b5c2e1`), weight 400
- Decorative element: a 4px horizontal rule below the title using `--gradient-cta`
- Optional: `--gradient-hero` as a subtle radial overlay at bottom-right (15% opacity)
- Event/date label: small uppercase label in `--accent-light`

**Closing slide** (`.closing-slide`):
- Background: `--bg-dark` (`#070e34`) full-bleed
- CTA button: `--gradient-cta` fill (`linear-gradient(45deg, #5547f5, #5aa3f8)`), white text, `border-radius: 8px`, `var(--shadow-accent)`
- Secondary text: `--text-on-dark-2`

---

### Cards & Containers

```css
.card {
    background: var(--bg-secondary);      /* white */
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: clamp(1.25rem, 2vw, 2rem);
    box-shadow: var(--shadow-card);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

/* Highlighted / featured card */
.card-accent {
    background: var(--bg-tint);           /* soft violet tint */
    border-color: rgba(87, 72, 245, 0.2);
    box-shadow: var(--shadow-soft);
}

/* Stat card — used for big number displays */
.card-stat {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: clamp(1.5rem, 2.5vw, 2.5rem);
    box-shadow: var(--shadow-accent);     /* colored bloom */
    text-align: center;
}
```

No heavy outer borders. Cards feel clean and elevated via the colored bloom shadow, not a thick outline.

---

### Accent Elements

- **Top slide accent line**: every content slide gets a `4px` top border using `--gradient-cta` — a subtle brand stripe that grounds each page
  ```css
  .slide:not(.title-slide):not(.closing-slide)::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: var(--gradient-cta);
  }
  ```
- **Left border callout**: `border-left: 3px solid var(--accent)` — for key assertions or pull quotes on content slides
- **Accent text**: `color: var(--accent)` — use for inline emphasis, never gradient-text (gradient is for backgrounds/CTAs only)
- **Section label**: uppercase, `0.75rem`, `letter-spacing: 0.08em`, `color: var(--accent)` — placed above headings like a category tag
- **Dividers**: `1px solid var(--border)` — thin, cool-toned, quiet

---

### Slide Layout Variants

Use the appropriate layout variant based on content type. Do not default to bullet lists.

**1. Stats Row** — for key metrics / data highlights:
- 3 columns of `.card-stat`, each with a large number (weight 800) + unit + label below
- Numbers animate from 0 to target value via JS counter animation on slide enter
- Example: `34%` growth, `$2.4B` portfolio, `500+` partners

**2. Two-Column** — for side-by-side comparison or text + supporting evidence:
- Left column: main point / assertion (weight 600 heading + body text)
- Right column: `.card` with supporting data, list, or visual
- Gap: `clamp(2rem, 4vw, 4rem)`

**3. Step Flow** — for process / methodology (3–5 steps):
- Horizontal row of numbered circles (filled `--accent`, white number, weight 700)
- Each step: circle → title → one-line description
- Connector lines between circles: `1px solid var(--border)`

**4. Feature Cards Grid** — for portfolio / program showcase:
- 2×2 or 3-column grid of `.card`
- Each card: accent-colored top micro-line + heading + 1–2 lines of text

**5. Quote / Assertion** — for key insight or pull quote:
- Large type (`clamp(1.5rem, 3vw, 2.5rem)`, weight 500, `--text-primary`)
- Left border: `4px solid var(--accent)`
- Attribution below: small, muted, weight 400

**6. Full-bleed Dark Callout** — for a single powerful statement mid-deck:
- Slide background: `--bg-dark`
- Single large headline in white
- Accent subtitle in `--accent-light`
- Use sparingly — max 1 per deck for dramatic effect

---

### Animations

- **Entrance**: `opacity: 0 → 1` + `translateY(16px → 0)`, duration `0.5s`, easing `cubic-bezier(0.16, 1, 0.3, 1)`
- **Stagger**: `0.07s` per child element (`.reveal:nth-child(n)`)
- **Triggered by**: `.visible` class added via `IntersectionObserver`
- **Cover title**: add `scale(0.97 → 1)` alongside translateY for a subtle weight-drop feel
- **Stat counter**: on slide enter, numbers count up from 0 to target in 800ms using `requestAnimationFrame`
- **Progress bar**: `3px` top bar, background `var(--gradient-cta)`
- Keep animations purposeful — entry motion only, no looping or hover distraction

```css
@media (prefers-reduced-motion: reduce) {
    .reveal { transition: none; opacity: 1; transform: none; }
}
```

---

### Do & Don't

- **Do** use `--bg-primary` (#f5f5f5) for content slides and `--bg-dark` (#070e34) only for cover + closing
- **Do** use Inter across all weights — weight contrast (400 body vs 800 stat numbers) creates visual hierarchy without multiple typefaces
- **Do** apply the brand bloom shadow (`--shadow-accent`) on stat cards and primary CTA buttons — this is the most distinctive brand detail
- **Do** add the 4px `--gradient-cta` top stripe on every content slide
- **Do** use the section label (uppercase, `--accent` color) above headings to establish context
- **Do** choose a layout variant (Stats Row, Two-Column, Step Flow, etc.) appropriate to the content — avoid generic bullet lists
- **Don't** use serif fonts, display fonts, or system fonts — Inter only
- **Don't** use gradient text (text with background-clip) — gradients belong on backgrounds and buttons only
- **Don't** mix `--accent` (#5748f5) and `--accent-2` (#348aed) on the same slide unless intentional (e.g. a gradient CTA)
- **Don't** use `border-radius` larger than `8px` on rectangular elements (use `9999px` only for pill/chip tags)
- **Don't** use heavy drop shadows in grey — always use the colored bloom shadows (`--shadow-accent` / `--shadow-soft`)
- **Don't** center-align body text — left-aligned throughout, except stat numbers and cover headlines
