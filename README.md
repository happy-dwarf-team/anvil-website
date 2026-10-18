# Anvil website

Source of the website for [Anvil](https://github.com/happy-dwarf-team/anvil), the plugin
loader for Europa Universalis IV, and its plugins. Built with
[Astro](https://astro.build) and [Starlight](https://starlight.astro.build), hosted on
GitHub Pages.

Design decisions (colours, fonts, motion, accessibility checklist):
[DESIGN.md](DESIGN.md).

## Develop

Requires Node.js 22 or newer.

```powershell
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run check     # type-check components and content collections
npm run check:links  # internal links and anchors in dist/ (after build)
npm run check:a11y   # axe-core accessibility rules on dist/ (after build)
npm run preview
```

## Content

| What | Where |
| --- | --- |
| Home page | `src/pages/index.astro` |
| Plugin catalog | one Markdown file per plugin in `src/content/plugins/` (schema in `src/content.config.ts`) |
| Docs | Markdown in `src/content/docs/docs/`, sidebar in `astro.config.mjs` |
| Theme | `src/styles/theme.css` |
| Social preview image | `public/og.png`, rendered by `node scripts/og-image.mjs` |

To add a plugin, copy `src/content/plugins/bellows.md`, change the frontmatter and
text. The file name becomes the URL (`/plugins/<file-name>/`). The page adds the facts box,
the download button and the "Supported game builds" section itself, so the Markdown starts
with what the plugin does.

## Download buttons and plugin facts

At build time the site reads the latest release of Anvil and of each plugin from the
GitHub API and shows its version, date, size and SHA-256 (from the release's
`SHA256SUMS.txt`). Buttons link to the asset of that exact release, so the file always
matches the checksum shown; Anvil and the plugins trigger a rebuild after each release,
and the site is also rebuilt daily. Without a release (or while a repository is private)
the button shows "First public release coming soon". Home and plugin pages also carry
schema.org `SoftwareApplication` data (`src/lib/structured-data.ts`).

For each plugin the site also reads `plugin.toml` at the released tag (`manifestPath`,
default `plugin/plugin.toml`) and shows the Anvil version it requires, its game builds and
whether it changes gameplay. When GitHub cannot be reached, the frontmatter values are used
instead. The release asset defaults to `<file-name>-windows-x64.zip` (`asset`).

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`,
on demand, daily, and when Anvil or a plugin sends the `anvil-release` or `plugin-release`
repository dispatch after a release (see their `release.yml`; it needs the
`WEBSITE_DISPATCH_TOKEN` secret in that repository).

Changes go through squash-merged pull requests whose titles follow
[Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `docs`,
`build`, `ci`, …), checked by `.github/workflows/pr-title.yml`; the conventions match
[Anvil's CONTRIBUTING.md](https://github.com/happy-dwarf-team/anvil/blob/main/CONTRIBUTING.md).
The site is not versioned or released; every merge to `main` deploys. Actions are
pinned to commit SHAs and, like npm packages, updated by Dependabot.

Custom domain: set the repository variable `CUSTOM_DOMAIN` (for example
`anvil.happydwarf.dev`), add the domain under Settings → Pages, and point a DNS `CNAME`
record at `happy-dwarf-team.github.io`. Without the variable the site is built for
`https://happy-dwarf-team.github.io/anvil-website/`.

## License

MIT, see [LICENSE](LICENSE). Unofficial community project, not affiliated with Paradox
Interactive.
