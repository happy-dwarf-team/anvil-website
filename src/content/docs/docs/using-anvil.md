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
it. So while Mei loads, Anvil takes the language Steam is set to, or else the one Windows is set
to, when it is Chinese, Japanese or Korean.

To choose one of the eight yourself, use the setting **Language** (Anvil panel, **Settings**,
`anvil-overlay`). For a test, the environment variable `ANVIL_LANGUAGE` (`en`, `fr`, `de`, `es`,
`zh-Hans`, `zh-Hant`, `ja`, `ko`) wins over both.

`anvil.log` and `anvil check` stay in English, as do the names, descriptions and setting labels
a plugin brings. No native speaker has checked the translations yet. Corrections are welcome in
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
    plugins/<plugin-id>/         plugin manifest and DLL
    data/<plugin-id>/            files a plugin writes (caches, settings)
    data/anvil/                  approved plugins from mods, kept benchmark reports
    trust.toml                   your approvals of plugins from mods
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
```

`log_level` sets how much `anvil/anvil.log` records; `debug` helps when you report a problem.
[Multiplayer, ironman and achievements](../multiplayer-ironman/) explains the two `allow_` lists.
