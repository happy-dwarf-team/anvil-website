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
program you install, so only install plugins you trust. Anvil's files are not code-signed;
each release is built from public source, and you can check every file yourself with its
SHA-256 and build attestation. Nothing is downloaded or uploaded unless you click. The whole
answer, including what to do when an antivirus objects, is on [Is it safe?](../safety/).

## Does it work with mods, Ironman and achievements?

Anvil works with the mods you enable in the launcher. From Anvil 1.3 a mod can also bring
Anvil plugins, which load only after you approve them; see
[Plugins from mods](../plugins-from-mods/).

Anvil and its plugins live outside the files the game's checksum covers. Each plugin declares
whether it changes gameplay. One that does is suspended by Anvil in ironman and multiplayer
games, unless the plugin offers an opt-in and you allow it in `anvil/anvil.toml`. In a test a
new ironman game kept the vanilla checksum and could earn achievements, but no achievement has
been earned in a full ironman campaign with Anvil yet.
[Multiplayer, ironman and achievements](../multiplayer-ironman/) has a table of the plugins,
what each does there and what has not been tested.

## How much faster does a plugin make my game?

Each plugin page says how it was measured. To measure on your own computer, use the
**Benchmark** tab of Anvil Manager (Anvil 1.5 or newer); see
[Start-up benchmark](../benchmark/).

## What happens when EU4 updates?

Plugins that do not support the new build are skipped automatically, and the game starts
as usual. Updated plugins will support the new build.

## Which game versions are supported?

Anvil runs on Windows, 64-bit: EU4 1.37.5 from Steam, and from Anvil 1.7 the GOG build
1.37.5.2. Supported builds depend on each plugin; see the
plugin pages. The `game build:` line in `anvil/anvil.log` shows which build Anvil
detected.

## Does it work with GOG, the Microsoft Store, Linux or macOS?

GOG partly; the others are not supported:

- **GOG:** from Anvil 1.7, Anvil knows the GOG build 1.37.5.2 (`eu4-1.37.5.2-gog-win64`),
  and `anvil-game` runs on it, and so do Bellows from 0.19.0, Tongs from 0.26.0, Hamweard
  from 1.1.0 and Mei from 0.2.0; older versions declare only the Steam build, so on GOG
  they are skipped and the game starts without them. From Anvil 1.10 the Manager finds a
  GOG game by itself, starts it through GOG's launcher, and reads the mods of the GOG
  game's own folder, `Documents/Paradox Interactive/Europa Universalis IV GOG`; before
  1.10, [choose the folder](../install/#on-gog) that contains `eu4.exe`, and Anvil reads Steam's mods. The other
  GOG build of 1.37.5 (1.37.5.0) is not known yet
  ([#187](https://github.com/happy-dwarf-team/anvil/issues/187)): plugins that use game
  addresses are skipped there, and from Anvil 1.10 the Manager, the overlay and
  `anvil/anvil.log` tell you to update the game to 1.37.5.2 in GOG Galaxy.
- **Microsoft Store (Game Pass):** not tested. Its `eu4.exe` is a different build, so Anvil
  would report it as `unknown` and skip every plugin that uses game addresses; the game
  starts normally.
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
