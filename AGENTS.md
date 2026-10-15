# Anvil website: repository rules

- Static site: Astro + Starlight, deployed to GitHub Pages. Keep it minimal: no UI
  framework, no Tailwind, no client-side JavaScript beyond Starlight's search.
- Follow [DESIGN.md](DESIGN.md). Use the `--forge-*` tokens from `src/styles/theme.css`
  instead of raw colours, keep text contrast at 4.5:1 or more, keep focus rings visible,
  and respect `prefers-reduced-motion`. Update DESIGN.md when a design decision changes.
- Internal links in components go through `url()` from `src/lib/url.ts`; in Markdown use
  relative links. The site must work both at the custom domain and under `/anvil-website/`.
- Content is English. State the source of every measurement and mark unverified claims.
  Do not imply affiliation with Paradox Interactive.
- Check `npm run build` before finishing a change. Do not commit, push or change
  repository settings without an explicit instruction.

## Development

`npm run dev` starts the dev server on http://localhost:4321. Astro docs:
https://docs.astro.build, Starlight docs: https://starlight.astro.build.
