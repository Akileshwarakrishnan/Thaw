# Statsig design system

> Extracted by [Inspo](https://github.com/Nutlope/inspo) (open source, MIT, powered by Together AI). Reference material for *intentional* design decisions: adapt, don't copy.

> Save this as `DESIGN.md` in your project and re-reference it as you build; re-fetch anytime at https://inspomcp.dev/d/statsig-com/DESIGN.md

- **Source:** https://statsig.com
- **Captured:** 2026-05-14
- **Mode:** light
- **Macrostructure:** Feature Stack

## Tone

The page uses a clean, spacious layout with a focus on functionality. Typography is clear and legible, with ample negative space creating a sense of calm and technical precision. The color palette is predominantly white and muted blues, emphasizing clarity and a modern feel.  ·  saas product, metrics dashboard, data analytics, ai testing, product analytics, statsig overview, measurement platform

## Colors

| Hex | Role (heuristic) |
|---|---|
| `#347cec` | support |
| `#0b3679` | ink |
| `#7bacf4` | accent |
| `#968182` | support |
| `#c6d2d8` | muted |

Color words: *muted*, *cool*, *monochrome*

## Typography

Detected typefaces: **Geist**

| Role | Family | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| h1 | Geist | 65px | 500 | 1.1 | -2px |
| h2 | Geist | 40px | 600 | 1.25 | 0 |
| h3 | Geist | 32px | 600 | 1.25 | 0 |
| body | Geist | 16px | 400 | 1.5 | 0 |
| button | Geist | 14px | 600 | 1.71 | 0 |

## Spacing scale

`80px` · `100px`

## Border radius

`10px` · `30px` · `50px`

## CSS variables exposed by the source

```css
:root {
  --color-gray: #d4d7dc;
  --color-white: #fff;
  --font-family-body: 'Geist', Helvetica, 'Segoe UI', Arial;
  --font-size-h5: 20px;
  --border-button-radius: 30px;
  --font-weight-strong: 600;
  --color-background: #f6f6f6;
  --color-light-blue: #e5f0ff;
  --font-weight-body: 400;
  --font-weight-button: 600;
  --font-size-extra-small: 12px;
  --border-sharp-radius: 5px;
  --font-size-h2: 40px;
  --font-size-h3: 32px;
  --color-black: #1f2328;
  --border-standard-radius: 10px;
  --color-input-border: #d4d7dc;
  --color-blue: #367eed;
  --color-text-secondary: #535963;
  --font-weight-anchor: 600;
  --shadow-regular: 0 0 20px rgba(27, 37, 40, 0.05);
  --color-medium-blue: #accfff;
  --color-soft-white: #ededed;
  --font-size-h7: 14px;
  --font-size-h1: 60px;
  --font-size-h6: 16px;
  --color-dark-gray: #343941;
  --color-dark-blue: #1b63d2;
  --font-family-mono: 'Geist Mono', monospace;
  --font-size-smaller: 14px;
  --color-text-primary: #1f2328;
  --font-size-larger: 20px;
  --font-size-h4: 24px;
  --font-weight-headings: 600;
  --font-size-body: 16px;
  --font-family-headings: 'Geist', Helvetica, 'Segoe UI', Arial;
}
```

## Components present

- hero with cta
- logo cloud
- feature trio

## Notes for the agent

- **Adapt, don't copy.** The type ramp is a *starting point*. Scale it to your project's base size; preserve the *ratio*, not the literal pixels.
- **Color roles are heuristic** (luminance + dominance). Verify against the source URL before committing tokens.
- **Spacing** assumes a constant base step; round detected values to your project's scale (4 / 8 / 16) when implementing.
- **CSS variables** dumped above (when present) are the source's *actual* tokens - those are higher signal than guesses.
- This page's macrostructure is **Feature Stack**.
