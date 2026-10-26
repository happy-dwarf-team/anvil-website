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

## Family

The site belongs to the dark-forge family, whose canonical source is the "Family" section of
[`happydwarf-website/DESIGN.md`](https://github.com/happy-dwarf-team/happydwarf-website/blob/main/DESIGN.md#family)
and its `src/styles/forge-family.css`
([#11](https://github.com/happy-dwarf-team/.github/issues/11)). The family started from this
site's "dark forge" design.

- `src/styles/forge-family.css` here is a **verbatim copy** with a header naming the source
  repository and commit. Do not edit it; change the source and copy it again. It holds the
  neutral tokens (`--forge-bg`, `--forge-surface`, `--forge-surface-raised`, `--forge-border`,
  `--forge-text`, `--forge-text-muted`), `--forge-radius`, `--forge-ease`, the font tokens and
  font imports, `color-scheme: dark`, the focus ring and the reduced-motion rule. Their values
  and contrast ratios are in the family table.
- `src/styles/theme.css` is Anvil's own stylesheet, loaded after the family one: the site
  accent, the Starlight mapping and Starlight tweaks.
- Signature effects are Anvil's own, not the family's: the sparks and ember glow of the
  download button (see Motion).

### Site accent: forge orange

Anvil uses the family colour, forge orange, as its accent (defined in `theme.css`):

| Token | Value | Use | Contrast |
| --- | --- | --- | --- |
| `--forge-accent` | `#f5922a` | buttons, focus ring, icons | 7.7:1 on bg, 7.0:1 on surface |
| `--forge-accent-strong` | `#ffad55` | hover, links | > 7.7:1 |
| `--forge-accent-soft` | `#3d2611` | step badges background | — |
| `--forge-on-accent` | `#16171a` | text on orange buttons | 7.7:1 on accent |

White text on the orange accent is only 2.3:1, so labels on orange are always dark.

### Starlight mapping

Starlight's `--sl-color-*` variables and fonts are mapped onto the `--forge-*` tokens in
`theme.css`; components use the `--forge-*` tokens, never raw hex values.

## Typography

- Body: **IBM Plex Sans**, 16 px, line height 1.6. Headings, site title, numbers and code:
  **JetBrains Mono**, tight tracking. Both come from the family (variable, self-hosted via
  Fontsource).
- No body text below 13 px.

## Plugin icons

- One icon per plugin in `src/assets/plugins/<plugin id>.svg`, named after the content file.
  `PluginIcon.astro` shows it on the plugin card (28 px) and in the fact box of the plugin
  page (40 px). A plugin without an icon file shows none.
- Each icon is a blacksmith tool matching the plugin name: Bellows (side view, two boards and
  the accordion) and Tongs (thick arms, oval jaws). The anvil mark stays the Anvil placeholder.
- Style, same as the anvil mark: 32 × 32 viewBox, flat shapes, no gradients. The accent is
  `currentColor`, set to `--forge-accent` by the component, plus at most one dark accent in
  `#16171a` (`--forge-bg`) at opacity .35 over the orange.
- Must read at 16 px: no detail thinner than about 1.5 units of the grid.
- Inlined and decorative (`aria-hidden="true"`); the plugin name next to it is the label.

## Plugin pages

- The download button (orange) stays the one primary action. A plugin with a Steam Workshop
  item (`workshop` in the frontmatter) gets a secondary link below it: raised surface, grey
  border, light text, orange border and text on hover or focus, at least 44 px high, with an
  external-link icon and a short note that it needs Anvil 1.3 and an approval.
- On the plugin card the Workshop link is a plain text link below the summary, lifted above
  the card's whole-card link so it stays a link of its own.

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
- CI runs axe-core on every page (`npm run check:a11y`). It cannot see colours or sizes,
  so contrast and target sizes stay a manual check against the tables above.
- Symbols that carry meaning (such as "→" between two numbers) are `aria-hidden` and have
  a `sr-only` text next to them; `aria-label` is not used on plain `span`s.
- Images through `astro:assets`. The team logo is an SVG (`src/assets/happy-dwarf.svg`), traced
  from the original PNG; its transparent highlights and teeth are filled white.

## Content rules

- Measurements are labelled with their source (research build vs. released plugin).
- Claims that are not verified yet (for example Ironman/achievements) say so.
- The footer of every page, 404 included, carries the family **disclaimer** as its own muted
  paragraph, apart from the licence line
  ([#14](https://github.com/happy-dwarf-team/.github/issues/14), hub
  [spec](https://github.com/happy-dwarf-team/happydwarf-website/blob/main/docs/spec.md)
  section 6): the non-affiliation line ("Anvil and its plugins are an unofficial community
  project, not affiliated with or endorsed by Paradox Interactive.") and the trademark line.
  The site shows no game art, so there is no game-art line; add it, with "Anvil" in place of
  "Etch", if the site ever shows EU4 screenshots. The FAQ answer "Who makes Anvil?" uses the
  non-affiliation line.

## Open items

- Anvil logo: the site uses a placeholder anvil mark (`src/assets/anvil-mark.svg`, also the
  favicon) and a text wordmark until the real logo exists.
- Social preview image: `public/og.png` (1200 × 630, rendered by `scripts/og-image.mjs`)
  uses the placeholder mark and a monospace wordmark. Render it again when the logo exists.
