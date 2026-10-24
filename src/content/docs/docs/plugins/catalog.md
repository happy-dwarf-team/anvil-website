---
title: List your plugin
description: Add a plugin to the catalog on this website.
---

The [plugin catalog](../../../plugins/) lists plugins that have a public release. To add
yours, open a pull request on
[anvil-website](https://github.com/happy-dwarf-team/anvil-website) with one Markdown file;
the maintainer reviews it and decides on merging.

## What the page shows by itself

At build time the site reads your latest GitHub release and the `plugin.toml` of that
release. The page then shows the version and date, the Anvil version the plugin requires
(`anvil`), whether it changes gameplay (`affects_gameplay`), the game build (`build` from
the `symbols.toml` that `symbols` names, or every build without one), and a download button
with size and SHA-256. You do not repeat these in the Markdown.

This needs a release shaped like those of Bellows and Tongs:

- an asset with a fixed name, `<plugin-id>-windows-x64.zip`, that contains the folder
  `<plugin-id>/` with `plugin.toml`, the DLL and the other files of the plugin;
- `SHA256SUMS.txt` next to it, with the archive's SHA-256 in `sha256sum` format;
- `plugin.toml` in the repository at the release tag, by default at `plugin/plugin.toml`,
  and the `symbols.toml` it names, if any.

Other names can be set in the frontmatter. A repository made from the
[template](../first-plugin/#7-release) keeps `plugin.toml` at the root
(`manifestPath: plugin.toml`) and names its zips with the version, so it needs the extra
asset described there.

## The file

Add `src/content/plugins/<plugin-id>.md`. The file name is the page URL
(`/plugins/<plugin-id>/`) and must match the plugin id.

```markdown
---
name: My Plugin
summary: One or two sentences for the plugin card.
tagline: One sentence that says what the plugin does for the player.
repo: https://github.com/you/my-plugin
status: released
gameBuilds: ['eu4-1.37.5-steam-win64']
affectsGameplay: false
---

What the plugin does, how to install and configure it, and how it was tested.
```

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | yes | Display name. |
| `summary` | yes | Card text and page description. |
| `tagline` | yes | One sentence in a player's words, without jargon; shown where the plugin is listed outside this site. |
| `repo` | yes | GitHub repository URL. |
| `status` | yes | `planned`, `in-development` or `released`. |
| `gameBuilds` | yes | The `build` from the plugin's `symbols.toml`, or `['*']` if the plugin has none and runs on every build; used when GitHub cannot be reached. |
| `affectsGameplay` | yes | `affects_gameplay` from `plugin.toml`; used when GitHub cannot be reached. |
| `order` | no | Position in the catalog, lower first; default 100. |
| `highlight` | no | One measured result for the card: `label`, `before`, `after`. |
| `asset` | no | Release asset name, if not `<plugin-id>-windows-x64.zip`. |
| `manifestPath` | no | Path of `plugin.toml` in the repository, if not `plugin/plugin.toml`. |

The catalog is also published as data at [`plugins.json`](../../../plugins.json), with each
plugin's id, name, tagline, repository, status, order, page URL and icon.
[happydwarf.dev](https://happydwarf.dev/) reads it to list the team's plugins.

An icon is optional: `src/assets/plugins/<plugin-id>.svg`, following the icon rules in
[DESIGN.md](https://github.com/happy-dwarf-team/anvil-website/blob/main/DESIGN.md#plugin-icons).

## Content rules

- Write in English and start with what the plugin does for the player.
- Set `affectsGameplay` honestly. Players read it as a multiplayer and Ironman warning.
- Give every measurement its source and conditions: game build, mods, number of runs,
  plugin version. Mark what has not been verified.
- Do not imply affiliation with Paradox Interactive.
