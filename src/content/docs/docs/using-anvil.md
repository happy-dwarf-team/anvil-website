---
title: Using Anvil
description: Anvil Manager, the panel in the game, language, the shorter error.log, where Anvil keeps its files and its settings file.
---

You meet Anvil in two places: **Anvil Manager** outside the game and the **Anvil panel** inside
it. This page describes both, and where Anvil keeps its files.

## Anvil Manager

Start `AnvilManager.exe` from the game folder.

| Tab | What it does |
| --- | --- |
| **Anvil** | Installs, updates, repairs and uninstalls Anvil. |
| **Catalog** | Installs and updates the team's plugins with a click. |
| **Plugins** | Shows which plugins will load, in which order, and why one is skipped. Turns them on and off, allows the ones that offer it in ironman or multiplayer, removes them, and installs a zip. |
| **Mods** | Approves plugins that come with a mod, such as a Steam Workshop item. |
| **Settings** | Edits plugin settings. |
| **Benchmark** | Measures how much faster a plugin makes the game start; see [Start-up benchmark](../benchmark/). |
| **Crashes** | Shows crash reports. |
| **Log** | Shows `anvil.log`, and copies a [problem report](../troubleshooting/#reporting-a-problem) for an issue. |
| **About** | Shows the versions, and lets you turn the check for a newer Anvil on or off (for the Manager and the game). |

While the game runs, the Manager only shows the state and changes nothing. From Anvil 1.14 it
also says when the game runs from another folder than the one Anvil is installed in, and when a
game ran without loading Anvil; both lead to
[If Anvil does not run at all](../troubleshooting/#if-anvil-does-not-run-at-all). It downloads only
what you click. It asks once whether it may check GitHub for new releases when the Manager or
the game starts. If you say yes, it shows a link to a newer Anvil, and from Anvil 1.15 it also
reads the list of the team's plugins and marks the ones with an update; it downloads none of
them by itself.

## A newer Anvil

If you agree, the game tells you when a newer Anvil is out. When the game reaches its main menu,
the panel asks GitHub once for Anvil's latest release, in the background. If it is newer than
your Anvil, a notice in the top right corner names it, with **Open its page** and **Copy link**.
To update, download `AnvilManager.exe` from that page and run it. Nothing is downloaded by the
game.

- **Your answer.** If you already answered the Manager's question, the game follows it.
  Otherwise the main menu asks once: **Yes, check for releases** or **No**. One answer counts for
  the Manager and the game.
- **Turning it off.** Set **Check for new Anvil releases** on the panel's **Settings** tab
  (plugin `anvil-overlay`) to **Off**. **On** checks without asking; **Ask** follows the Manager.
- **How often.** The notice comes back at each start until you close it with **x** or open the
  release page. After that it stays away until the next release.

## The Anvil panel

Press `Ctrl+Shift+F12`, also during a game, or click the Anvil badge in the main menu. The panel
shows the plugins' status, their settings, approvals of plugins from mods, the crash report and
the log.

The panel and the badge draw on the game's Direct3D 9 renderer. With OpenGL there is neither;
Anvil Manager shows the same information outside the game.

To hide the badge, turn off **Show Anvil in the main menu** on the panel's **Settings** tab
(plugin `anvil-overlay`). The badge is only in the main menu, never in a game.

## Language

The Manager and the panel use the language EU4 is set to: English, French, German or Spanish.
Any other language shows English.

They also speak Simplified Chinese, Traditional Chinese, Japanese and Korean. EU4 has none of
these itself: a translation mod replaces its English text and [Mei](../../plugins/mei/) shows
it. So while Mei loads, the panel takes the language Steam is set to, or else the one Windows is
set to, when it is Chinese, Japanese or Korean. From Anvil 1.16 the Manager does so from its first
start, before Mei or Anvil is installed, so the install and the
[replacement of EU4DLL](../install/#if-eu4dll-or-eu4-unicode-patch-is-installed) are in your
language.

From Anvil 1.16 they also speak Polish when Steam is set to Polish. EU4 has no Polish of its own,
so this follows Steam, not the game.

To choose one of the nine yourself, use the setting **Language** (Anvil panel, **Settings**,
`anvil-overlay`). For a test, the environment variable `ANVIL_LANGUAGE` (`en`, `fr`, `de`, `es`,
`zh-Hans`, `zh-Hant`, `ja`, `ko`, `pl`) wins over both.

`anvil.log` and `anvil check` stay in English, as do a plugin's name and, before Anvil 1.20,
its description and setting labels. From 1.20 a plugin can bring them in these languages
([translations](../plugins/manifest/#translations)); Anvil's own plugins and the Catalog tab
do. No native speaker has checked the translations yet. Corrections are welcome in
an [Anvil issue](https://github.com/happy-dwarf-team/anvil/issues/new/choose).

## A shorter error.log

The standard plugin `anvil-log-throttle` keeps the game's `error.log` short. A line that repeats
is written 10 times and after that only counted. Every minute, and when the game closes the log,
a line gives the count:

```
[anvil-log-throttle] repeated <n> more times in the last <s> s: <text>
```

To get every line, for example while you debug a mod, turn on **Write every line** (`full_log`)
in the panel, or disable the plugin.

In a [lab test](https://github.com/happy-dwarf-team/anvil/issues/172) with script errors in
bursts of about 125,000 lines, `error.log` stayed at 161 KB after 12.6 minutes, against 61.9 MB
in 11.3 minutes without the plugin.

### The script errors panel

From Anvil 1.20 the same plugin can show the game's script errors in a window while you play,
for modders. Turn on **Script errors panel** (`panel`, off by default) in the overlay's settings
tab or in Anvil Manager. The window then opens with the main menu at each start, and once closed
it comes back from the **Status** tab.

It groups the messages by kind with their counts as they happen, not a minute later as in the
file. First come the few that name a file and line, which **Open in VS Code** and **Copy** take
you to. An undefined event target is one row, and **Find** looks for it, or for an unknown tag,
in the playset's files. The start-up noise of missing files comes last, folded into one item per
kind: in Anbennar that was 18,740 of 18,831 messages. **Show only new** and **Mark all seen**
help after you change a file and reload it.

In the lab on Steam 1.37.5 its counts matched `error.log` for all 159 messages of a base-game
campaign and all 18,760 of Anbennar's start-up. Not tried in the game yet: the buttons that open,
copy or find, turning the setting on while the game runs, and OpenGL, where nothing is drawn.
The panel's texts in languages other than English are drafts that native speakers have not
checked yet.

## The inspector

From Anvil 1.21 the standard plugin `anvil-inspector` shows modders what the game holds for the
province on screen, its owner and your country. Turn on **Inspector window** (`window`, off by
default) in the overlay's settings tab or in Anvil Manager. The window then opens at each start,
and once closed it comes back from the **Status** tab.

Open a province's view and the window lists, for the province, its owner and your country:

- the **flags** with the date each was set, a province's permanent ones included;
- the **variables** with their values, as scripts write them (`2.5`);
- the **timed modifiers** that `add_country_modifier` and its kin gave, by key, with their end
  date or *no end date*, and marked *hidden* or *ruler modifier*;
- for a country, the **ruler, heir and consort** with their skills and flags.

Each heading folds. The window reads the game when it opens, at a new date (at most once a
second), at another province view and with **Refresh**, and from scratch after you load a save.
It only reads, and with the setting off it does nothing at all.

In the lab on Steam 1.37.5 and GOG 1.37.5.2, every timed modifier, flag and variable it read
matched the save, for Russia in 1719 and for Verne in Anbennar. The game also keeps a few
modifiers it sets up itself, such as `world_port`, which the save leaves out; the window shows
them as the game holds them. Not tried in the game yet: the **Refresh** button and folding a
heading. The window's texts in languages other than English are drafts that native speakers
have not checked yet.

## The script profiler

From Anvil 1.22 the standard plugin `anvil-script-profiler` shows modders which triggers and
effects cost the game its time. It is installed with Anvil and does nothing until you start a
measurement: open **Script profiler** from the **Status** tab of the Anvil panel, load a game and
press **Start** (then **Stop**) or **Measure 30 days** (the number of days is the **Days to
measure** setting). The game runs slower while it measures: in the lab, 1.7% fewer days per
second on a base-game campaign and 1% on Anbennar at most, within the spread of the runs.

When the measurement ends the window lists the longest **triggers** and **effects**, each row an
event, event option (`#2`), decision, on_action, casus belli, triggered modifier, mission, church
aspect or scripted trigger with
the block's role there, such as `trigger`, `mean_time_to_happen`, `potential`, `allow`,
`ai_will_do` or `effect`. A row shows the total time, the calls, the mean and the longest single
run, which catches a rare option that takes tens of milliseconds at once. Blocks it cannot place,
such as the AI's own decision checks, are one row **No owner found**: on Anbennar 30% of the
trigger time, on a base-game campaign 23%. A third list, **Scripted triggers**, times every call
of a scripted trigger by its name, also inside an event's or a decision's trigger.

Every measurement is also written to `logs/script_profile_<date>_<time>.csv` in the game's user
folder, with every row. Loading a save, leaving to the menu or quitting the game ends a
measurement early; the file is still written and marked interrupted (on a quit only when the game
exits normally). It works in ironman and multiplayer, where it warns that it slows your game and
every player waits for the slowest.

In the lab on Steam 1.37.5 and GOG 1.37.5.2 and 1.37.5.0 it named the same events, decisions and casus belli
as the prototype did, for Russia in 1719 and for Verne in Anbennar, and a load and the menu's
**Exit Game** wrote their files marked interrupted. The scripted triggers list and the church
aspects were tried on all three builds (on Anbennar only on Steam), and the cost of the third hook
was again within the spread of the runs. Not tried yet: ironman and multiplayer. The window's texts in languages other than English are drafts that
native speakers have not checked yet.

## When EU4 updates

Plugins declare the game code they rely on, and Anvil checks it against the running game before
it loads them. After an EU4 update, plugins whose code no longer matches are skipped and the game
starts normally until they are updated. Steam updates and **Verify integrity of game files** are
not affected, because `eu4.exe` is never modified.

The game tells you: one notice names the plugins that were not loaded and stays until you close
it, and the Manager shows the same warning. The badge in the main menu is gone until Anvil knows
the new build, because telling the menu apart needs game addresses too.

Anvil comes first, and each plugin follows with its own update. From Anvil 1.12, once Anvil knows
the build and a plugin does not yet, one notice names the plugins that wait for this game version,
and the badge is back with an amber dot. A plugin that needs one of them waits with it.

## Where things are

```
<game folder>/
  eu4.exe
  version.dll                    Anvil
  AnvilManager.exe               installer and plugin manager
  anvil/
    anvil.toml                   optional settings
    anvil.log                    log of the last start
    crashes/                     crash reports of the last 10 crashes
    plugins/anvil-game/          standard plugins that ship with Anvil
    plugins/anvil-overlay/
    plugins/anvil-log-throttle/
    plugins/anvil-map/           (from 1.16) map modes of other plugins
    plugins/anvil-script/        (from 1.16) script effects and the day end of other plugins
    plugins/anvil-inspector/     (from 1.21) the inspector for modders
    plugins/anvil-script-profiler/ (from 1.22) the script profiler for modders
    plugins/<plugin-id>/         plugin manifest and DLL
    data/<plugin-id>/            files a plugin writes (caches, settings)
    data/anvil/                  approved plugins from mods, kept benchmark reports
    trust.toml                   your approvals of plugins from mods
  anvil-legacy-backup/           EU4DLL or another version.dll the Manager replaced (from 1.16)
```

Keep `anvil-game` installed and enabled. It tells other plugins when the game is ready and when
a game session starts, and plugins that depend on it are skipped without it.

## Anvil's settings file

`anvil/anvil.toml` is optional. The Manager's **Plugins** tab edits it for you.

```toml
enabled = true                # false starts the game without plugins
disabled_plugins = ["bellows"]
log_level = "info"            # "debug", "info", "warning" or "error"
allow_ironman = ["tongs"]     # plugins you allow in ironman
allow_multiplayer = []        # plugins you allow in multiplayer
disabled_modules = []         # from 1.22: modules you turned off, as "<plugin>.<module>"
enabled_modules = []          # from 1.22: modules that are off by default and you turned on
```

`log_level` sets how much `anvil/anvil.log` records; `debug` helps when you report a problem.
[Multiplayer, ironman and achievements](../multiplayer-ironman/) explains the two `allow_` lists.
From Anvil 1.22 a plugin can have modules: on the Manager's **Plugins** tab each has a switch
under its plugin, and a module that changes the game has its own ironman and multiplayer
boxes. A change applies at the next start; the panel's **Status** tab shows each module's state.
