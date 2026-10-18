---
title: Troubleshooting
description: Read anvil.log and find out why a plugin was skipped.
---

## Read the log

Every start writes `anvil/anvil.log` in the game folder; the previous start is kept as
`anvil/anvil.prev.log`. The log shows:

- the Anvil version,
- the detected game build, or `unknown` with the identity of `eu4.exe`,
- for each plugin: `loaded`, `skipped — <reason>`, or an error if its load failed (its
  patches are then rolled back),
- the patches each plugin applied, and how long loading took.

If there is no log at all, Anvil did not run. Check that `version.dll` and the `anvil`
folder are directly next to `eu4.exe`, not in a subfolder.

## Common reasons a plugin is skipped

A skipped plugin has a line `<plugin-id>: skipped — <reason>` in the log. The reason starts
with one of these:

| Log says | What to do |
| --- | --- |
| `game build … not supported` | EU4 was updated, or the plugin targets another build. Wait for a plugin update. |
| `game code differs from what the plugin expects` | The game code the plugin relies on has changed: EU4 was updated, or `eu4.exe` was modified. Wait for a plugin update, or use **Verify integrity of game files** in Steam. |
| `requires Anvil …` | The plugin needs a newer Anvil. [Update Anvil](../install/). |
| `built for plugin API …` | The plugin and Anvil use different plugin API versions. Update whichever is older. |
| `plugin.toml: …` | The manifest is broken. Reinstall the plugin. |
| `entry … not found` | The plugin folder is incomplete. Reinstall the plugin. |
| `requires plugin …` or `requires '…'` | Install the plugin it depends on, in a compatible version. |
| `duplicate id` | Two folders contain the same plugin, for example an old copy next to a new one. Delete one of them. |
| `dependency/load_after cycle` or `early plugin cannot depend on …` | The plugins' manifests contradict each other. Report it to the plugin authors. |
| `disabled in anvil.toml` | The plugin is listed in `disabled_plugins` in `anvil/anvil.toml`. |

## Start once without plugins

To check whether a problem comes from a plugin, start the game once with all plugins
disabled. Either set `enabled = false` in `anvil/anvil.toml`, or set the environment
variable `ANVIL_DISABLE=1` for that start. Anvil then only writes the log.

## Antivirus warnings

Anvil is a proxy `version.dll`, a pattern that antivirus heuristics sometimes flag.
Releases are built by GitHub Actions from public source, and each release publishes
SHA-256 checksums you can compare. Code signing is planned.

## Reporting a problem

Open an issue on [GitHub](https://github.com/happy-dwarf-team/anvil/issues) and attach
`anvil/anvil.log`.
