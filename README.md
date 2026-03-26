# slides-it

**Describe your presentation. Get a beautiful HTML slide deck. No design skills required.**

> Work in progress — actively being updated.

![slides-it](img/image.png)

---

## The idea

Presentation tools have always been GUI-first: click a template, drag a text box, fight with alignment, pick fonts, nudge spacing. It's tedious — even for people who do it every day.

HTML has always been a better format for slides. Smooth animations, pixel-perfect layout, runs in any browser, no software required. But nobody wants to write HTML by hand. So people use PowerPoint instead.

**slides-it removes that barrier entirely.**

You describe what you want in plain language. The AI handles all the design — layout, typography, animations, color palette, content structure. You never touch HTML, CSS, or JavaScript. The result is a single self-contained `.html` file: beautiful, keyboard-navigable, and shareable with anyone.

The interaction model for presentations has changed. The GUI is no longer the interface — your words are.

### HTML is the native format for the agent era

There's a deeper reason why HTML is the right output format here — one that goes beyond "it looks good in a browser."

An AI agent doesn't see the world the way a human does. It doesn't click through menus or drag elements around a canvas. What it does exceptionally well is read and write structured text. HTML is structured text. A complete slide deck — every layout decision, every animation, every color — can be expressed as a single file that an agent can write from scratch, revise precisely, and reason about in full. There are no hidden state layers, no binary formats, no GUI intermediaries between the agent's intent and the output.

PowerPoint and Keynote were designed for humans operating GUIs. Their file formats reflect that: opaque, proprietary, built around the assumption that a person is dragging things around. Asking an AI to work with them is fighting the format. HTML, by contrast, is transparent all the way down. The agent reads your instruction, writes the file, and the result is immediately inspectable, runnable, and shareable — no export step, no conversion, no application required to open it.

This is why slides-it doesn't wrap an existing presentation tool. It skips the GUI entirely and goes straight to the output format that agents are naturally good at producing.

slides-it is powered by [OpenCode](https://opencode.ai) — an open-source AI coding agent that runs locally and drives everything under the hood.

---

## How to use

**1. Install**

```bash
curl -fsSL https://slides-it.dev/install.sh | sh
```

**2. Run**

```bash
slides-it
```

This opens the slides-it UI in your browser.

**3. Describe your presentation**

Type what you want in the chat panel. For example:

> "A 8-slide deck about our Q1 product roadmap, for an all-hands meeting, in English. Keep it punchy."

The AI will ask a few quick questions if needed (audience, slide count, language), then generate the complete slide deck.

**4. Get your file**

A self-contained `.html` file is written to your working directory. Open it in any browser — navigate with arrow keys or swipe.

**5. Iterate in plain language**

Want changes? Just say so:

> "Make the title slide bolder. Add a slide about pricing. Switch to a lighter color scheme."

The AI regenerates the whole deck with your changes applied. No manual editing required.
