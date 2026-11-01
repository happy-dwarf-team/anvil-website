---
title: FAQ
description: Common questions about Anvil and EU4 plugins.
---

## Does Anvil modify the game?

No. `eu4.exe` and the game files are never changed. Windows loads Anvil's `version.dll`
together with the game; it forwards every call to the system `version.dll` and also loads
plugins. Plugins change code in memory only, for the current session.

## Is it safe?

Plugins are native code and run with the same permissions as the game, like any other
program you install. Only install plugins you trust. Anvil itself never downloads
anything, and its releases come with SHA-256 checksums. Nothing is uploaded either, with one
exception you control: a [start-up benchmark](../benchmark/) report leaves your computer only
when you click **Send** after seeing it (see
[Benchmark reports and your privacy](../benchmark-privacy/)).

## Does it work with mods, Ironman and achievements?

Anvil works with the mods you enable in the launcher. From Anvil 1.3 a mod can also bring
Anvil plugins, which load only after you approve them; see
[Plugins from mods](../plugins-from-mods/). Whether a plugin affects
Ironman, achievements or multiplayer depends on the plugin: each one declares whether it
changes gameplay, and the plugin page shows it. Plugins that do not change gameplay, such
as Bellows, only change how fast or how smoothly the game runs. A plugin that changes
gameplay, such as Tongs (its keyboard, mouse and console commands act on the game), is
suspended by Anvil in ironman and multiplayer games, unless the plugin offers an opt-in
and you allow it in `anvil/anvil.toml`.

The effect on Ironman and achievements has not been verified yet. This answer will be
updated once it has been tested.

## How much faster does a plugin make my game?

Each plugin page says how it was measured. To measure on your own computer, use the
**Benchmark** tab of Anvil Manager (Anvil 1.5 or newer); see
[Start-up benchmark](../benchmark/).

## What happens when EU4 updates?

Plugins that do not support the new build are skipped automatically, and the game starts
as usual. Updated plugins will support the new build.

## Which game versions are supported?

Anvil runs on Windows, 64-bit, Steam. Supported builds depend on each plugin; see the
plugin pages. The `game build:` line in `anvil/anvil.log` shows which build Anvil
detected.

## Does it work with GOG, the Microsoft Store, Linux or macOS?

Not supported. Anvil and the current plugins are built for the Steam release of EU4 on
Windows:

- **GOG or Microsoft Store (Game Pass):** not tested. Their `eu4.exe` is a different build,
  so Anvil would report it as `unknown` and skip every plugin that uses game addresses;
  the game starts normally.
- **Linux with Proton:** not tested. Proton runs the Windows game, but Anvil has not been
  tried there.
- **macOS and the native Linux build of EU4:** not supported, and not a goal for now.

## What else is built on Anvil?

[Etch](https://etch.happydwarf.dev/), a preview for EU4 interface mods in Visual Studio
Code, is built on Anvil. Its live game, a private copy of the game played beside the editor
that reloads each saved file into the game's own window, runs with pinned builds of Anvil,
`anvil-game`, Bellows, Tongs and Etch's own Anvil plugin, which come with Etch. Etch is not a
plugin from this catalog, and you do not need to install anything here for it.

## Who makes Anvil?

Happy Dwarf Team, under the MIT license. Anvil and its plugins are an unofficial community
project, not affiliated with or endorsed by Paradox Interactive.
