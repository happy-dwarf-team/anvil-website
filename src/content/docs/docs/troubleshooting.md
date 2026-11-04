---
title: Troubleshooting
description: What to do when a plugin does not work, and how to report a problem.
---

## Start here

1. Open `AnvilManager.exe` in the game folder. The **Plugins** tab shows which plugins will
   load and why one is skipped, without starting the game.
2. Look for what you see in the table below.
3. Still stuck? [Report it](#reporting-a-problem); the Manager puts what we need on your
   clipboard.

| What you see | What to do |
| --- | --- |
| Windows warns about `AnvilManager.exe` | The file is not code-signed. See [If Windows warns about the file](../install/#if-windows-warns-about-the-file). |
| No Anvil badge in the main menu | Check that `version.dll` and the `anvil` folder are next to `eu4.exe`, or click **Install Anvil** in the Manager. If your antivirus removed `version.dll`, see [Antivirus warnings](#antivirus-warnings). With OpenGL there is no badge; the Manager shows the same information. |
| A Workshop plugin does nothing | The Workshop cannot install Anvil, so [install Anvil](../install/) first. Enable the mod in your playset in the Paradox launcher, approve the plugin on the Manager's **Mods** tab, and start the game again: it loads from the next start. |
| A Workshop plugin stayed on an old version | Anvil asks again after every update of a mod. Approve the new version on the **Mods** tab. |
| A plugin is skipped | The reason is on the **Plugins** tab and in the log; see [Common reasons a plugin is skipped](#common-reasons-a-plugin-is-skipped). |
| The game crashes or does not start | [Start once without plugins](#start-once-without-plugins), then turn them back on one by one. See also [Safe mode and crash reports](#safe-mode-and-crash-reports). |
| You want the game back as it was | [Turn plugins off](../install/#turn-plugins-off) or [uninstall Anvil](../install/#uninstall). Both take effect at the next start, and `eu4.exe` was never changed. |

## Read the log

Every start writes `anvil/anvil.log` in the game folder; the previous start is kept as
`anvil/anvil.prev.log`. The log shows:

- the Anvil version,
- the detected game build, or `unknown` with the identity of `eu4.exe`,
- for each plugin: `loaded`, `skipped — <reason>`, or an error if its load failed (its
  changes are then rolled back),
- how many changes each plugin made, and how long loading took.

If there is no log at all, Anvil did not run. Check that `version.dll` and the `anvil`
folder are directly next to `eu4.exe`, not in a subfolder.

## Common reasons a plugin is skipped

A skipped plugin has a line `<plugin-id>: skipped — <reason>` in the log (the folder name
if `plugin.toml` could not be read). The reason starts with one of these, as written by
Anvil 1.0:

| Log says | What to do |
| --- | --- |
| `plugin API 1: update the plugin` | The plugin was built for Anvil 0.x. Install a version of the plugin for Anvil 1.0. |
| `plugin.toml: plugin API … is newer than this Anvil supports` | The plugin needs a newer Anvil. [Update Anvil](../install/). |
| `requires Anvil …, this is Anvil …` | The plugin needs another Anvil version, usually a newer one. [Update Anvil](../install/). |
| `game build unknown (EU4 updated?)` | Anvil does not know this `eu4.exe`, usually after an EU4 update. Plugins that use game addresses wait for an update of Anvil and the plugin. |
| `symbols.toml is for build …, the game is …` | The plugin targets another game build. Wait for a plugin update for your build. |
| `symbol …: … (EU4 updated or eu4.exe modified?)` | The game code the plugin relies on has changed, for example `symbol …: byte +0x… (rva 0x…) expected 0x…, found 0x…`: EU4 was updated, or `eu4.exe` was modified. Wait for a plugin update, or use **Verify integrity of game files** in Steam. |
| `plugin.toml: …`, `symbols.toml: …`, `settings.toml: …` or `cannot read …` | A file of the plugin is broken or missing. Reinstall the plugin. |
| `entry … not found` | The plugin folder is incomplete. Reinstall the plugin. |
| `safe mode` | The last starts ended before the game was ready; see [Safe mode and crash reports](#safe-mode-and-crash-reports). |
| `affects gameplay, so it needs plugin 'anvil-game', which is not loaded` | The plugin changes gameplay, and only the standard plugin `anvil-game` lets Anvil suspend it in ironman and multiplayer. Reinstall Anvil, which brings `anvil/plugins/anvil-game/`, and do not disable it. |
| `requires plugin '…' (…), which is not loaded` or `requires '…' …, found …` | Install the plugin it depends on, in a compatible version. |
| `conflicts with … …; disable one of them` | The plugin declares that it cannot run together with another installed plugin. Disable one of them in `disabled_plugins`. |
| `duplicate id; already provided by …` | Two folders contain the same plugin, for example an old copy next to a new one. Delete one of them. |
| `dependency/load_after cycle in … phase` or `early plugin cannot depend on main-phase plugin '…'` | The plugins' manifests contradict each other. Report it to the plugin authors. |
| `disabled in anvil.toml` | The plugin is listed in `disabled_plugins` in `anvil/anvil.toml`. |

A plugin that was not skipped but failed while loading has an error line instead, for
example `<plugin-id> <version>: anvil_plugin_load returned …` or `… crashed with
exception …`; its changes are rolled back and the game starts without it. Report it to the
plugin's authors with the log.

## Ironman and multiplayer

A plugin that changes gameplay is loaded, but Anvil suspends it in an ironman or
multiplayer game: the log then has `[<plugin-id>] suspended: affects gameplay and …`. If
the plugin offers it, you can allow it there in `anvil/anvil.toml`; see
[Multiplayer, ironman and achievements](../multiplayer-ironman/).

## Safe mode and crash reports

When the game crashes, Anvil writes a report to `anvil/crashes/`: a `.txt` to read, a
`.json` and a small minidump, named by date and time; the last 10 are kept. The log gets
a line `crash … at …; report crashes\<name>.txt`. The report says whether a plugin
was involved and links to that plugin's issue tracker. Nothing is uploaded.

After two starts in a row that ended before the game was ready (a crash, a hang or a killed
process), the next start is in safe mode. The log says
`safe mode: the last … starts ended before the game was ready`, Anvil 1.0 loads no plugins
on that start, and each one is listed as `skipped — safe mode`. The start after that loads
them again. If the crashes come back, start once without plugins (below) and disable the
plugins one by one.

## Start once without plugins

To check whether a problem comes from a plugin, start the game once with all plugins
disabled. Either set `enabled = false` in `anvil/anvil.toml`, or set the environment
variable `ANVIL_DISABLE=1` for that start. Anvil then only writes the log.

## Antivirus warnings

Anvil is a proxy `version.dll`, a pattern that antivirus heuristics sometimes flag. If your
antivirus removes it, check the file, allow only that file and report the false positive:
[If your antivirus objects](../safety/#if-your-antivirus-objects) has the steps.

## Reporting a problem

Open an issue on [GitHub](https://github.com/happy-dwarf-team/anvil/issues/new/choose) and
attach `anvil/anvil.log`, and after a crash the `.txt` report from `anvil/crashes/`.

From Anvil 1.9, **Copy a problem report** on the Manager's **Log** tab puts what the issue form
asks for on the clipboard and shows it there: the Anvil and game versions, the game build, each
plugin with its version and why it is skipped, the newest crash report, and the end of
`anvil.log`. The game folder, your user folder and your Windows user name are left out of it,
and nothing is uploaded; **Open an Anvil issue** opens the form to paste it into. The
**Crashes** tab copies a whole crash report and opens the issue tracker of the plugin it names. If the log or the report names a plugin,
report it to that plugin's issue tracker instead; a plugin's page links its repository.
Before posting, check the log for anything you do not want to share, such as your Windows
user name in paths.
