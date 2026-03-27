# slides-it

**Describe a presentation. Get the HTML. Ship it. And Say Goodbye to your GUI**

<p align="center">
  <a href="https://github.com/mengdigao1988/slides-it/releases"><img src="https://img.shields.io/github/v/release/mengdigao1988/slides-it?color=green&label=version" alt="version" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
  <a href="https://opencode.ai"><img src="https://img.shields.io/badge/powered%20by-OpenCode-black.svg" alt="powered by OpenCode" /></a>
</p>

<p align="center">
  <img src="img/welcome-page.png" width="600" alt="slides-it — chat panel with AI Q&A on the left, generated slide preview on the right" />
</p>

---

# Quick Start

## Install

**1. Install OpenCode** (required — slides-it runs on top of it):

```bash
curl -fsSL https://opencode.ai/install | sh
```

**2. Install slides-it:**

```bash
curl -fsSL https://raw.githubusercontent.com/mengdigao1988/slides-it/main/install.sh | bash
```

**3. Launch:**

```bash
slides-it
```

A browser window opens automatically.

---

## Workspace

slides-it asks you to pick a **workspace folder** — the directory where your slides will be saved.

<p align="center">
  <img src="img/workspace.png" width="460" alt="Workspace folder picker" />
</p>

- Generated slides land in `slides/` inside that folder (e.g. `slides/q1-roadmap.html`)
- A `.slides-it/` directory is created automatically to store your conversation history
- Reopen slides-it in the same folder tomorrow — your chat history is right where you left it

Pick any folder. Your code project, a `presentations/` folder, anywhere.

---

## Provider Config

slides-it works with all major AI providers. Configure in the **⚙ settings panel** inside the UI, or set an environment variable before launching.

<p align="center">
  <img src="img/provider-config.png" width="500" alt="slides-it — chat panel with AI Q&A on the left, generated slide preview on the right" />
</p>

| Provider | Env var |
|----------|---------|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| OpenRouter | `OPENROUTER_API_KEY` |
| DeepSeek | `DEEPSEEK_API_KEY` |
| Custom base URL | configure in ⚙ settings |

```bash
export ANTHROPIC_API_KEY=sk-ant-...
slides-it
```

For proxies, local models, or any OpenAI-compatible endpoint — open ⚙ settings and set a custom base URL there. No env var needed.

---

# What it looks like

<p align="center">
  <img src="img/title-page.png" width="780" alt="slides-it — chat panel with AI Q&A on the left, generated slide preview on the right" />
</p>

You type one sentence. The AI asks a few quick questions — audience, slide count, language. Then it writes the whole deck.

> "8 slides on our Q1 roadmap. Audience is the whole company. Punchy, confident tone."

Thirty seconds. One `.html` file in your workspace. Arrow keys to navigate, swipe on mobile, share with anyone — no app required, no account needed.

Made a mistake? Just say so.

> "Make the opening slide more dramatic. Add a slide on pricing. Lighter color scheme."

The whole deck regenerates in place. You never touched HTML.

---

# Idea

Presentation tools haven't changed in 30 years. You still drag boxes. You still fight templates. You still export to PDF to share something that was always just a list of text and images.

The AI era makes this embarrassing.

An AI agent reads and writes HTML natively. Every layout decision, every animation curve, every color relationship is text — written in one shot, revised with surgical precision. The result is immediately runnable and shareable, no export step required.

The opaque binary formats that GUI slide tools produce were designed for humans dragging things around a canvas. Asking an AI to work with them is fighting the format. slides-it skips the GUI entirely.

Your words go in. A beautiful file comes out.

Powered by [OpenCode](https://opencode.ai) — an open-source AI coding agent that runs locally and handles everything under the hood.

---

# Features

## Templates that actually mean something

Most "templates" are just color schemes slapped on the same layout. slides-it templates are different — each one is a complete **visual brief** that tells the AI exactly how to design: which fonts carry authority, how much whitespace breathes, what animation style fits the mood, how color creates hierarchy.

Switch templates mid-conversation with one click. The AI is immediately re-briefed and applies the new aesthetic to everything going forward.

<p align="center">
  <img src="img/template-change-with-one-click.png" width="620" alt="Switch templates with one click — the AI instantly acknowledges the new style" />
</p>

Ships with two built-in templates:

| Template | Vibe |
|----------|------|
| `default` | Dark, modern, cinematic. Works for anything. |
| `minimal` | Warm off-white, typographic, paper-like. Lets the content breathe. |

Install community templates from anywhere:

```bash
slides-it template install dark-neon          # official registry
slides-it template install github:user/repo   # any GitHub repo
slides-it template install ./my-template      # local directory
```

## A chat input that gets out of your way

The input box is the whole interface. Type naturally — describe what you want, ask for changes, reference files with `@`, or switch templates from the pill selector built right in. No menus, no toolbars, no mode switching.

<p align="center">
  <img src="img/ez-file-ref.png" width="380" alt="@ file reference — search and attach any file from your workspace" />
</p>

Keyboard shortcuts coming soon.

## See it the moment it's done

Every generated deck opens immediately in the right-hand preview panel. Fully interactive: keyboard navigation, swipe, progress bar. The preview updates the moment the file is rewritten. Download with one click.

## Pick up where you left off

Your conversation is saved to `.slides-it/` in your workspace automatically. Close the app, come back tomorrow, reopen the same folder — history is right where you left it, and the last preview reloads automatically.

---

# Build your own template

Templates are how slides-it gets its personality. The built-in ones are just a starting point — the best themes will come from the community.

A template is a directory with two files. Here's how to build and share one.

### Step 1 — Create the directory

```
my-theme/
├── TEMPLATE.md
└── SKILL.md
```

### Step 2 — Write `TEMPLATE.md`

Metadata. Copy this and fill in your details:

```markdown
---
name: my-theme
description: One line description of the visual style
author: your-name
version: 1.0.0
preview: https://example.com/preview.png   # optional
---
```

### Step 3 — Write `SKILL.md`

This is the important file. It's a **visual brief for the AI** — not documentation for humans. The AI reads it before every generation and follows it precisely.

```markdown
## Visual Style — My Theme

Apply this visual style when generating all slides in this session.

### Color Palette
\`\`\`css
:root {
    --bg-primary:   #your-color;
    --text-primary: #your-color;
    --accent:       #your-color;
    --border:       #your-color;
}
\`\`\`

### Typography
- Display font: `Font Name` — load from Google Fonts / Fontshare
- Body font: `Font Name`
- Title size: `clamp(2rem, 5vw, 4rem)`

### Slide Layout
- Padding, max-width, alignment preferences

### Animations
- Entrance style, duration, easing

### Do & Don't
- **Do** use [specific things]
- **Don't** use [specific things]
```

The more precise and opinionated your `SKILL.md`, the more consistent the output. See [`slides_it/templates/default/SKILL.md`](slides_it/templates/default/SKILL.md) and [`slides_it/templates/minimal/SKILL.md`](slides_it/templates/minimal/SKILL.md) for real examples.

### Step 4 — Install and test locally

```bash
slides-it template install ./my-theme
```

Launch slides-it, select your theme from the template pill below the input box, ask for a slide deck. Iterate on `SKILL.md` until the output matches your vision.

### Step 5 — Share it

Publish your template as a GitHub repo. Anyone can install it with:

```bash
slides-it template install github:yourname/my-theme
```

Or submit a PR adding your template to [`registry.json`](registry.json) to list it in the official registry.

---

## Development setup

Requires [uv](https://docs.astral.sh/uv/) and Node.js 22+.

```bash
git clone https://github.com/mengdigao1988/slides-it.git
cd slides-it

# Backend — FastAPI on port 3000
uv run python -c "from slides_it.server import run; run(port=3000)"

# Frontend — dev server on port 5173
cd frontend && npm install && npm run dev

# Production build
cd frontend && npm run build

# Standalone binary
bash build.sh
```

### CLI

```
slides-it                          launch the web UI
slides-it --version                show version
slides-it stop                     stop everything

slides-it template list            list installed templates
slides-it template search          search the official registry
slides-it template install <src>   install a template
slides-it template remove <name>   remove a template
slides-it template activate <name> set the active template
```

---

# License

MIT
