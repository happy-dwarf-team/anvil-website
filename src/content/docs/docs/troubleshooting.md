---
title: Troubleshooting
description: What to do when a plugin does not work, and how to report a problem.
---

## Start here

1. Open `AnvilManager.exe` in the game folder. The **Plugins** tab shows which plugins will load
   and why one is skipped, without starting the game.
2. Look for what you see in the table below.
3. Still stuck? [Report it](#reporting-a-problem). The Manager puts what we need on your
   clipboard. To ask first, post in `#help-and-bugs` on the team's
   [Discord server](https://discord.happydwarf.dev/).

| What you see | What to do |
| --- | --- |
| Windows warns about `AnvilManager.exe` | The file is not code-signed. See [If Windows warns about the file](../install/#if-windows-warns-about-the-file). |
| Your antivirus removed a file | Check the file and allow only that file. See [If your antivirus objects](../safety/#if-your-antivirus-objects). |
| No Anvil badge in the main menu | Check that `version.dll` and the `anvil` folder are next to `eu4.exe`, or click **Install Anvil** in the Manager. With OpenGL there is no badge; the Manager shows the same information. |
| A Workshop plugin does nothing | The Workshop cannot install Anvil, so [install Anvil](../install/) first. Enable the mod in your playset, approve the plugin on the Manager's **Mods** tab, and start the game again. |
| A Workshop plugin stayed on an old version | Anvil asks again after every update of a mod. Approve the new version on the **Mods** tab. |
| **Play EU4** on GOG seems to do nothing | It opens the Paradox launcher: press **Play** there. On its first start the launcher shows Paradox's EULA before **Play**, also without Anvil, and only you can accept it. |
| Orange lines on the **Plugins** tab: `code range of symbol … overlaps symbol …` | They mean nothing: the catalog's plugins declare the same function. Anvil 1.10.1 no longer shows them. |
| A plugin is skipped | The reason is on the **Plugins** tab and in the log; see [Why a plugin is skipped](#why-a-plugin-is-skipped). |
| A plugin does nothing in ironman or multiplayer | One that changes gameplay is suspended there; the log says `[<plugin-id>] suspended: affects gameplay and …`. See [Multiplayer, ironman and achievements](../multiplayer-ironman/). |
| The game crashes or does not start | [Start once without plugins](#start-once-without-plugins), then turn them back on one by one. See also [Crash reports and safe mode](#crash-reports-and-safe-mode). |
| You want the game back as it was | [Turn plugins off](../install-plugins/#turn-a-plugin-off-or-remove-it) or [uninstall Anvil](../install/#uninstall). Both take effect at the next start, and `eu4.exe` was never changed. |

## Read the log

Every start writes `anvil/anvil.log` in the game folder. The previous start is kept as
`anvil/anvil.prev.log`. The log shows:

- the Anvil version,
- the detected game build, or `unknown` with the identity of `eu4.exe`,
- for each plugin: `loaded`, `skipped — <reason>`, or an error if its load failed,
- how many changes each plugin made, and how long loading took.

If there is no log at all, Anvil did not run. Check that `version.dll` and the `anvil` folder are
directly next to `eu4.exe`, not in a subfolder.

## Why a plugin is skipped

A skipped plugin has a line `<plugin-id>: skipped — <reason>` in the log. The reason starts with
one of these:

| Log says | What to do |
| --- | --- |
| `plugin API 1: update the plugin` | The plugin was built for Anvil 0.x. Install a newer version of it. |
| `plugin.toml: plugin API … is newer than this Anvil supports` | The plugin needs a newer Anvil. [Update Anvil](../install/#update-anvil). |
| `requires Anvil …, this is Anvil …` | The plugin needs another Anvil version, usually a newer one. [Update Anvil](../install/#update-anvil). |
| `game build unknown (EU4 updated?)` | Anvil does not know this `eu4.exe`, usually after an EU4 update. Plugins that use game addresses wait for an update of Anvil and the plugin. |
| `symbols.toml is for build …, the game is …` | The plugin targets another game build. Wait for a plugin update for your build. |
| `symbol …: … (EU4 updated or eu4.exe modified?)` | The game code the plugin relies on has changed: EU4 was updated, or `eu4.exe` was modified. Wait for a plugin update, or use **Verify integrity of game files** in Steam. |
| `plugin.toml: …`, `symbols.toml: …`, `settings.toml: …` or `cannot read …` | A file of the plugin is broken or missing. Reinstall the plugin. |
| `entry … not found` | The plugin folder is incomplete. Reinstall the plugin. |
| `safe mode` | The last starts ended before the game was ready; see [Crash reports and safe mode](#crash-reports-and-safe-mode). |
| `affects gameplay, so it needs plugin 'anvil-game', which is not loaded` | Only `anvil-game` lets Anvil suspend a gameplay plugin in ironman and multiplayer. Reinstall Anvil, and do not disable `anvil-game`. |
| `requires plugin '…' (…), which is not loaded` or `requires '…' …, found …` | Install the plugin it depends on, in a compatible version. |
| `conflicts with … …; disable one of them` | The plugin cannot run together with another installed plugin. Disable one of them. |
| `duplicate id; already provided by …` | Two folders contain the same plugin, for example an old copy next to a new one. Delete one of them. |
| `dependency/load_after cycle in … phase` or `early plugin cannot depend on main-phase plugin '…'` | The plugins' manifests contradict each other. Report it to the plugin authors. |
| `disabled in anvil.toml` | The plugin is listed in `disabled_plugins` in `anvil/anvil.toml`. |

A plugin that was not skipped but failed while loading has an error line instead, for example
`<plugin-id> <version>: anvil_plugin_load returned …` or `… crashed with exception …`. Its changes
are rolled back and the game starts without it. Report it to the plugin's authors with the log.

## Crash reports and safe mode

When the game crashes, Anvil writes a report to `anvil/crashes/`: a `.txt` to read, a `.json` and
a small minidump. The last 10 are kept. The report says whether a plugin was involved and links
to that plugin's issue tracker. Nothing is uploaded.

After two starts in a row that ended before the game was ready (a crash, a hang or a killed
process), the next start is in safe mode. It loads only `anvil-game` and `anvil-overlay`, so the
panel can tell you why, and the other plugins are listed as `skipped — safe mode`. The start
after that loads them again. If the crashes come back, start once without plugins (below) and
turn them back on one by one.

## Start once without plugins

To check whether a problem comes from a plugin, start the game once with all plugins disabled.
Set `enabled = false` in `anvil/anvil.toml`, or set the environment variable `ANVIL_DISABLE=1` for
that start. Anvil then only writes the log.

## Reporting a problem

On the Manager's **Log** tab, click **Copy a problem report**. It puts on the clipboard what the
issue form asks for: the versions, the game build, each plugin and why it is skipped, the newest
crash report and the end of `anvil.log`. It leaves out the game folder, your user folder and your
Windows user name, and nothing is uploaded. **Open an Anvil issue** opens the form to paste it
into.

If the log or the report names a plugin, report it to that plugin's issue tracker instead. A
plugin's page links its repository, and the **Crashes** tab opens its tracker.

Without the Manager, open an [issue](https://github.com/happy-dwarf-team/anvil/issues/new/choose)
and attach `anvil/anvil.log`, and after a crash the `.txt` report from `anvil/crashes/`. Check the
log first for anything you do not want to share, such as your Windows user name in paths.

Not sure it is a bug, or want to ask first? Post in the `#help-and-bugs` forum on the team's
[Discord server](https://discord.happydwarf.dev/), tag the project, and paste the same problem
report. The team tracks confirmed problems in GitHub issues, so a bug found on Discord ends up in
an issue. Report a security problem privately, never on Discord or in a public issue: see
[Report a security problem](../safety/#report-a-security-problem).
