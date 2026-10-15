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
npm run preview
```

## Content

| What | Where |
| --- | --- |
| Home page | `src/pages/index.astro` |
| Plugin catalog | one Markdown file per plugin in `src/content/plugins/` (schema in `src/content.config.ts`) |
| Docs | Markdown in `src/content/docs/docs/`, sidebar in `astro.config.mjs` |
| Theme | `src/styles/theme.css` |

To add a plugin, copy `src/content/plugins/eu4-startup-boost.md`, change the frontmatter and
text. The file name becomes the URL (`/plugins/<file-name>/`).

## Download button

At build time the site reads the latest release of `happy-dwarf-team/anvil` from the
GitHub API and shows its version and size. The button always links to
`releases/latest/download/anvil-windows-x64.zip`, so it serves the newest file even if the
site has not been rebuilt yet. Without a release (or while the repository is private) the
button shows "First public release coming soon".

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`,
on demand, daily, and when Anvil sends the `anvil-release` repository dispatch after a
release (see Anvil's `build.yml`; it needs the `WEBSITE_DISPATCH_TOKEN` secret there).

Custom domain: set the repository variable `CUSTOM_DOMAIN` (for example
`anvil.happydwarf.dev`), add the domain under Settings → Pages, and point a DNS `CNAME`
record at `happy-dwarf-team.github.io`. Without the variable the site is built for
`https://happy-dwarf-team.github.io/anvil-website/`.

## License

MIT, see [LICENSE](LICENSE). Unofficial community project, not affiliated with Paradox
Interactive.
