---
title: Troubleshooting
description: Read anvil.log and find out why a plugin was skipped.
---

## Read the log

Every start writes `anvil/anvil.log` in the game folder; the previous start is kept as
`anvil/anvil.prev.log`. The log shows:

- the Anvil version,
- the detected game build, or `unknown` with the identity of `eu4.exe`,
- for each plugin: `loaded`, `skipped (reason)` or `failed (reason)`,
- the patches each plugin applied, and how long loading took.

If there is no log at all, Anvil did not run. Check that `version.dll` and the `anvil`
folder are directly next to `eu4.exe`, not in a subfolder.

## Common reasons a plugin is skipped

| Log says | What to do |
| --- | --- |
| Game build unknown / not supported | EU4 was updated, or the plugin targets another build. Wait for a plugin update. |
| Manifest error | `plugin.toml` is broken. Reinstall the plugin. |
| Entry DLL missing | The plugin folder is incomplete. Reinstall the plugin. |
| Missing dependency | Install the plugin it depends on, in a compatible version. |
| Disabled | The plugin is listed in `disabled_plugins` in `anvil/anvil.toml`. |

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
