# Design

Decisions for the Anvil website. Change them here first, then in code.

## Direction

- **Audience:** EU4 players (install, troubleshooting) and plugin authors (SDK, manifest).
- **Style:** "dark forge". Dark only, minimal, developer-tool look (dark mode + minimalism).
  The only strong colour is the orange of the Happy Dwarf Team beard; greys from the helmet
  are used for borders.
- **Language:** English only.
- **Layout of the home page:** centred hero with one primary action (download) → three
  features → plugin cards → install in three steps → footer. No carousels, no testimonials.

## Colour tokens (`src/styles/theme.css`)

| Token | Value | Use | Contrast on `--forge-bg` |
| --- | --- | --- | --- |
| `--forge-bg` | `#16171a` | page background | — |
| `--forge-surface` | `#1f2024` | cards, fact boxes | — |
| `--forge-surface-raised` | `#26272c` | pending button | — |
| `--forge-border` | `#34363c` | borders, dividers (decorative) | 1.6:1 |
| `--forge-text` | `#e8e6e3` | body text | 14.4:1 |
| `--forge-text-muted` | `#a8a29e` | secondary text | 7.1:1 (6.5:1 on surface) |
| `--forge-accent` | `#f5922a` | buttons, focus ring, icons | 7.7:1 (7.0:1 on surface) |
| `--forge-accent-strong` | `#ffad55` | hover, links | > 7.7:1 |
| `--forge-accent-soft` | `#3d2611` | step badges background | — |
| `--forge-on-accent` | `#16171a` | text on orange buttons | 7.7:1 on accent |

White text on the orange accent is only 2.3:1, so labels on orange are always dark.
Starlight's `--sl-color-*` variables are mapped onto these tokens; components use the
`--forge-*` tokens, never raw hex values.

## Typography

- Body: **IBM Plex Sans** (variable, self-hosted via Fontsource), 16 px, line height 1.6.
- Headings, site title, numbers and code: **JetBrains Mono** (variable), tight tracking.
- No body text below 13 px.

## Motion

- Hover/focus transitions of 150–220 ms with one easing curve (`--forge-ease`).
- Cards lift 2 px on hover; the border turns orange.
- Download button: a one-time "ember" glow on page load, and sparks flying up on hover or
  keyboard focus.
- `prefers-reduced-motion: reduce` turns all of it off.

## Accessibility and quality checklist

- Text contrast at least 4.5:1 (all pairs above pass AA; most pass AAA).
- Visible focus ring: 2 px orange outline on every focusable element.
- Click targets at least 44 × 44 px for navigation and buttons.
- SVG icons only (no emoji), decorative icons have `aria-hidden`.
- No horizontal scroll at 375 px; checked on all pages.
- No client-side JavaScript except Starlight's search.
- Images through `astro:assets` (the team logo is converted to WebP).

## Content rules

- Measurements are labelled with their source (research build vs. released plugin).
- Claims that are not verified yet (for example Ironman/achievements) say so.
- "Unofficial, not affiliated with Paradox Interactive" stays in the footer.

## Open items

- Anvil logo: the site uses a placeholder anvil mark (`src/assets/anvil-mark.svg`, also the
  favicon) and a text wordmark until the real logo exists.
- Social preview image (Open Graph) once the logo exists.
