---
title: Troubleshooting
description: What to do when a plugin does not work, and how to report a problem.
---

## Start here

1. Open `AnvilManager.exe` in the game folder. The **Plugins** page shows which plugins will load
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
| No badge and no `anvil/anvil.log`, although the files are there | Windows did not load Anvil's `version.dll`. See [If Anvil does not run at all](#if-anvil-does-not-run-at-all). |
| On Linux, the game starts without Anvil | Proton used its own `version.dll`. Add the launch option `WINEDLLOVERRIDES="version=n,b" %command%`: see [On Linux with Proton](../install/#on-linux-with-proton). |
| On Linux, the Manager's **Start the game** only flashes a console window | Under Proton the Manager cannot start the game yet ([anvil#494](https://github.com/happy-dwarf-team/anvil/issues/494)). Start it from Steam. |
| A Workshop plugin does nothing | The Workshop cannot install Anvil, so [install Anvil](../install/) first. Enable the mod in your playset, approve the plugin on the Manager's **Plugins** page (under **From mods**), and start the game again. |
| A Workshop plugin stayed on an old version | Anvil asks again after every update of a mod. Approve the new version in the panel or the Manager. |
| **Play EU4** on GOG seems to do nothing | It opens the Paradox launcher: press **Play** there. On its first start the launcher shows Paradox's EULA before **Play**, also without Anvil, and only you can accept it. |
| **Play EU4** on Steam is greyed out | From Anvil 1.24, Steam would start EU4 from another folder than the one the Manager shows. See step 1 of [If Anvil does not run at all](#if-anvil-does-not-run-at-all). |
| Orange lines on the **Plugins** page: `code range of symbol … overlaps symbol …` | They mean nothing: the catalog's plugins declare the same function. Anvil 1.10.1 no longer shows them. |
| A **Multiplayer** notice covers the top right corner | It shows the plugins that change the game, for players to compare. From Anvil 1.14 click its **x**; it stays closed until that session ends. See [Notices in the game](../multiplayer-ironman/#notices-in-the-game). |
| A plugin is skipped | The reason is on the Manager's **Plugins** page and in the log; see [Why a plugin is skipped](#why-a-plugin-is-skipped). |
| A plugin does nothing in ironman or multiplayer | One that changes gameplay is suspended there; the log says `[<plugin-id>] suspended: affects gameplay and …`. See [Multiplayer, ironman and achievements](../multiplayer-ironman/). |
| The game crashes or does not start | [Start once without plugins](#start-once-without-plugins), then turn them back on one by one. See also [Crash reports and safe mode](#crash-reports-and-safe-mode). With DXVK (Proton, or installed on Windows) in EU4's **Fullscreen** mode, choose **Windowed (Fullscreen)**: see [DXVK and Fullscreen](../faq/#dxvk-and-fullscreen). |
| A modded game crashes each time the same event or decision runs, also with plugins off | A mod may name a province the map does not have. See [A mod's script names a province the map does not have](#a-mods-script-names-a-province-the-map-does-not-have). |
| A save crashes the game once it runs on, also with plugins off | The save may hold more ideas in a group than the group has now. See [A save has more ideas in a group than the group has](#a-save-has-more-ideas-in-a-group-than-the-group-has). |
| No plugin loads after you edited `anvil/anvil.toml` | From Anvil 1.26 a file that does not parse loads no plugin until it is fixed, so a plugin you turned off does not load by mistake. The log says `anvil.toml cannot be read (line …)`. Fix that line, or delete the file to go back to the defaults; the Manager's **Plugins** page writes a new one when you change something. |
| You want the game back as it was | [Turn plugins off](../install-plugins/#turn-a-plugin-off-or-remove-it) or [uninstall Anvil](../install/#uninstall). Both take effect at the next start, and `eu4.exe` was never changed. |

## Read the log

Every start writes `anvil/anvil.log` in the game folder. The previous start is kept as
`anvil/anvil.prev.log`. The log shows:

- the Anvil version,
- the detected game build, or `unknown` with the identity of `eu4.exe`,
- for each plugin: `loaded`, `skipped — <reason>`, or an error if its load failed,
- how many changes each plugin made, and how long loading took.

If there is no log at all, Anvil did not run: see the next section.

## If Anvil does not run at all

Anvil writes `anvil/anvil.log` on every start, even with all plugins off. No log after a start
means Windows did not load Anvil's `version.dll`. From Anvil 1.14, the Manager notices this:
after a game from its folder ends without a fresh log, it says **The game ran, but Anvil did not
load.**, and **What to check** opens this section. Check, in this order:

1. **The game runs from the Manager's folder.** With more than one copy of EU4 (several Steam
   libraries, a moved install, a backup copy), Steam may start a copy other than the one Anvil is
   installed in. On Steam, **Play EU4** in the Manager starts Steam's copy, whatever folder the
   Manager shows. From Anvil 1.14, the Manager names the folder the game runs from when it is
   another one, and **Switch to that folder** moves the Manager there; then install Anvil in it.
   From Anvil 1.24 the Manager also checks before you play: when Steam lists EU4 in another
   folder, **Play EU4** is off, its tooltip says why, and a note names the folder Steam starts,
   with **Switch to that folder**.
   With an older Manager, find the folder of the `eu4.exe` that runs (Task Manager: right-click
   `eu4.exe`, **Open file location**) and, if it is another one, click **Change...** in the
   Manager and install Anvil there.
2. **The files are in the right place.** `version.dll` and the `anvil` folder sit directly next
   to `eu4.exe`, not in a subfolder. With file extensions hidden, check that the file is not
   named `version.dll.dll`.
3. **The file is still there after a start.** If `version.dll` is gone, your antivirus removed
   it; see [If your antivirus objects](../safety/#if-your-antivirus-objects).
4. **What the game loaded.** In [Process Explorer](https://learn.microsoft.com/sysinternals/downloads/process-explorer),
   select `eu4.exe` (not the Paradox launcher) and open its DLL list. One `version.dll` from
   `C:\Windows\System32` is always there: Anvil loads it and passes calls on to it. With Anvil
   running there is a second one, from the game folder. If only the System32 one is there,
   Windows chose not to use the file next to `eu4.exe`. One setting that does this, untested
   with Anvil, is the exploit-protection option `PreferSystem32`:
   `Get-ProcessMitigation -Name eu4.exe` in PowerShell shows it under `ImageLoad`.

Anvil needs no Visual C++ runtime. Still stuck? Post in `#help-and-bugs` with the path of
`eu4.exe`, the path of each `version.dll` in its DLL list, the folder the Manager shows and where
the game comes from (Steam, GOG, another store). Anvil supports EU4 1.37.5 from Steam and the
GOG builds 1.37.5.2 and 1.37.5.0 ([Install](../install/)).

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

From Anvil 1.25 a report also ends with **Notes from plugins** (`notes` in the `.json`), which
Anvil's own plugins add. The [script profiler](../using-anvil/#the-script-profiler) lists the
events, decisions and other script it finds on the crashed game's stack, innermost first, such as
`event flavor_rus.12: option 2 effect`. You do not need to start a measurement for this. It is a
scan of the stack, so it can also name script that ran just before. For a crash in a modded game,
it points to the mod whose script was running.

From Anvil 1.26 `anvil-game` adds a note for two crashes that are the game's own, which a report
used to blame on a plugin ([anvil#426](https://github.com/happy-dwarf-team/anvil/issues/426)):

- **A province the map does not have.** The note names the number, for example "where the entry
  of province 5075 would be …, but this map has provinces 1 to 4941". See
  [A mod's script names a province the map does not have](#a-mods-script-names-a-province-the-map-does-not-have).
- **Too many ideas in a group.** The note says that the game was adding up a country's idea
  modifiers. See [A save has more ideas in a group than the group has](#a-save-has-more-ideas-in-a-group-than-the-group-has).

After two starts in a row that ended before the game was ready (a crash, a hang or a killed
process), the next start is in safe mode. It loads only `anvil-game` and `anvil-overlay`, so the
panel can tell you why, and the other plugins are listed as `skipped — safe mode`. The start
after that loads them again. If the crashes come back, start once without plugins (below) and
turn them back on one by one.

### A mod's script names a province the map does not have

The game does not check the province numbers in scripts. A mod that says `owns = 5075` on a map
of 4941 provinces gets no line in `error.log`, and the game reads memory past its province table.
Usually that gives a wrong answer, but it can crash the game whenever the event or decision runs,
also with every plugin off. Before [Bellows](../../plugins/bellows/) 2.0.1 its memory allocator
made this crash more likely.

To find the mod:

- In [Etch](https://etch.happydwarf.dev/) 2.13 or newer, open your playset and run **Etch: Check
  Province IDs and Names in the Playset**. Problems lists every such number with its mod, file and line.
- Or search your mods' `events`, `decisions`, `missions` and `common` folders for the number.
- The notes of a crash report (above) name the event or decision that was running, and from
  Anvil 1.26 the province number.

Tell the mod's author; the fix is in their script.

### A save has more ideas in a group than the group has

The game checks how many ideas a country takes in a group while you play, but not when it loads
a save. If a save has more ideas taken in a group than the group has now, for example after a mod
update removed an idea from it, the game reads past the group's end on the daily update. That
crashes the game once it runs on from that save, also with every plugin off. From Anvil 1.26 the
crash report's notes say so.

To find the country, open an uncompressed copy of the save in a text editor and search for
`active_idea_groups={`. Each country has one, with lines such as `SWE_ideas=7`; a number larger
than that group's idea count (7 for most groups) is the one. Load the save with the mod version
it was made with, or tell the authors of the mod that changed the group.

## Start once without plugins

To check whether a problem comes from a plugin, start the game once with all plugins disabled.
Set `enabled = false` in `anvil/anvil.toml`, or set the environment variable `ANVIL_DISABLE=1` for
that start. Anvil then only writes the log.

## Reporting a problem

On the Manager's **Log** page, click **Copy a problem report**. It puts on the clipboard what the
issue form asks for: the versions, the game build, each plugin and why it is skipped, the newest
crash report and the end of `anvil.log`. From Anvil 1.14 it also says how many game folders
Steam and GOG have, which one the Manager uses, whether `eu4.exe` runs from another one, and
whether the last game from this folder ran without Anvil. It leaves out the game folder, your user folder and your
Windows user name, and nothing is uploaded. **Open an Anvil issue** opens the form to paste it
into.

If the log or the report names a plugin, report it to that plugin's issue tracker instead. A
plugin's page links its repository, and the **Crashes** page opens its tracker.

Without the Manager, open an [issue](https://github.com/happy-dwarf-team/anvil/issues/new/choose)
and attach `anvil/anvil.log`, and after a crash the `.txt` report from `anvil/crashes/`. Check the
log first for anything you do not want to share, such as your Windows user name in paths.

Not sure it is a bug, or want to ask first? Post in the `#help-and-bugs` forum on the team's
[Discord server](https://discord.happydwarf.dev/), tag the project, and paste the same problem
report. The team tracks confirmed problems in GitHub issues, so a bug found on Discord ends up in
an issue. Report a security problem privately, never on Discord or in a public issue: see
[Report a security problem](../safety/#report-a-security-problem).
