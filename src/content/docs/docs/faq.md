---
title: FAQ
description: Short answers to common questions about Anvil and EU4 plugins.
---

## Does Anvil change the game?

No. `eu4.exe` and the game files are never changed. Windows loads Anvil's `version.dll` together
with the game. Plugins change code in memory only, for the current session.

## Is it safe?

A plugin is native code with the same rights as the game, so install only plugins you trust. You
can check every file yourself. The whole answer is on [Is it safe?](../safety/).

## Does it work with mods?

Yes. Anvil works with the mods you enable in the launcher. A mod can also bring plugins, which
load only after you approve them; see [Plugins from mods](../plugins-from-mods/).

## Does it work with ironman, multiplayer and achievements?

It depends on the plugin. One that changes gameplay is off there, unless it offers a choice and
you allow it. In a test a new ironman game kept the vanilla checksum and could earn achievements,
but no achievement has been earned in a full ironman campaign with Anvil yet.
[Multiplayer, ironman and achievements](../multiplayer-ironman/) has the table.

## How much faster does a plugin make my game?

Each plugin's page says how it was measured. To measure on your own computer, use the
[Benchmark tab](../benchmark/).

## What happens when EU4 updates?

Plugins whose code no longer matches are skipped, and the game starts as usual. They work again
once they are updated. See [When EU4 updates](../using-anvil/#when-eu4-updates).

## Which game versions are supported?

EU4 1.37.5 on Windows, 64-bit, from Steam, and the GOG build 1.37.5.2. Each plugin's page lists
its builds. The `game build:` line in `anvil/anvil.log` shows which build Anvil detected.

## Does it work on GOG?

Yes, on the build 1.37.5.2; see [On GOG](../install/#on-gog). Plugins need a recent version:
Bellows 0.19.0, Tongs 0.26.0, Hamweard 1.1.0 and Mei 0.2.0 or newer. On older versions Anvil
skips them.

## Does it work on the Microsoft Store, Linux or macOS?

- **Microsoft Store (Game Pass):** not tested. Its `eu4.exe` is a different build, so Anvil would
  report it as `unknown` and skip every plugin that uses game addresses. The game starts normally.
- **Linux with Proton:** not tested. Proton runs the Windows game, but Anvil has not been tried
  there.
- **macOS and the native Linux build of EU4:** not supported, and not a goal for now.

## What else is built on Anvil?

[Etch](https://etch.happydwarf.dev/), a preview for EU4 interface mods in Visual Studio Code. Its
live game comes with its own pinned builds of Anvil and the plugins it needs, so you do not need
to install anything here for it.

## Who makes Anvil?

Happy Dwarf Team, under the MIT license. Anvil and its plugins are an unofficial community
project, not affiliated with or endorsed by Paradox Interactive.
