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
- Check `npm run check`, `npm run build`, `npm run check:links` and `npm run check:a11y`
  before finishing a change; CI runs all four.
- The agent owns the pull request flow: it works on a branch with Conventional Commits,
  pushes it and opens the PR as a draft. Once ready (green CI, build checked, no blocking
  review findings, not put on hold by the user) it marks the PR ready and squash-merges
  it; GitHub does not allow auto-merge on a draft. Pull requests from other contributors
  get a review and a recommendation; the maintainer decides on merging them. Do not
  bypass CI or branch protection, and do not change repository settings beyond what
  auto-merge needs.

## Development

`npm run dev` starts the dev server on http://localhost:4321. Astro docs:
https://docs.astro.build, Starlight docs: https://starlight.astro.build.
