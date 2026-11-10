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
you allow it. In a test a new ironman game kept the vanilla checksum and could earn achievements.
One achievement has been earned for real in an ironman game with Anvil, none yet in a full campaign.
[Multiplayer, ironman and achievements](../multiplayer-ironman/) has the table.

## How much faster does a plugin make my game?

Each plugin's page says how it was measured. To measure on your own computer, use the
[Benchmark tab](../benchmark/).

## What happens when EU4 updates?

Plugins whose code no longer matches are skipped, and the game starts as usual. They work again
once they are updated. See [When EU4 updates](../using-anvil/#when-eu4-updates).

## Which game versions are supported?

EU4 1.37.5 on Windows, 64-bit, from Steam, and the GOG builds 1.37.5.2 and 1.37.5.0. Each plugin's page lists
its builds. The `game build:` line in `anvil/anvil.log` shows which build Anvil detected.

## Does it work on GOG?

Yes, on the builds 1.37.5.2 and 1.37.5.0; see [On GOG](../install/#on-gog). Plugins need a recent
version: on 1.37.5.2 Bellows 0.19.0, Tongs 0.26.0, Hamweard 1.1.0 and Mei 0.2.0 or newer; on
1.37.5.0 Anvil 1.15.0, Bellows 1.5.0, Tongs 0.28.0, Hamweard 1.3.0 and Mei 0.4.0 or newer. On older
versions Anvil skips them.

## Does it work on the Microsoft Store, Linux or macOS?

- **Microsoft Store (Game Pass):** not tested. Its `eu4.exe` is a different build, so Anvil would
  report it as `unknown` and skip every plugin that uses game addresses. The game starts normally.
- **Linux with Proton:** not tested. Proton runs the Windows game, but Anvil has not been tried
  there.
- **macOS and the native Linux build of EU4:** not supported, and not planned
  ([roadmap](../roadmap/#not-planned)).

## Known limits

What Anvil and its plugins do not do yet, or have not been tested on. Each item links to the
longer answer.

### Game version

Only EU4 1.37.5 for 64-bit Windows. After an EU4 update, plugins whose code no longer matches are
skipped until they are updated, and the game starts as usual
([When EU4 updates](../using-anvil/#when-eu4-updates)).

### GOG

Anvil runs on the GOG builds that [Does it work on GOG?](#does-it-work-on-gog) lists. On another
GOG build the game starts, but plugins that use game addresses are skipped and Anvil tells you to
update ([On GOG](../install/#on-gog)).

### Linux and Steam Deck

Not tested yet, so there are no install steps for Proton here. Reports are welcome: if you try it,
[tell us](https://github.com/happy-dwarf-team/anvil/issues/new/choose) what worked, with your
Proton version and `anvil/anvil.log`. The native Linux and macOS builds of EU4 are not planned
([roadmap](../roadmap/#not-planned)).

#### DXVK and Fullscreen

DXVK is the Direct3D 9 layer that Proton uses, and some players install it on Windows too.

- **Anvil 1.17.0 and later:** the overlay is no longer part of a crash at start with DXVK in EU4's
  **Fullscreen** display mode. Before 1.17.0 it could be
  ([release notes](https://github.com/happy-dwarf-team/anvil/releases/tag/v1.17.0)).
- **EU4 itself:** on Windows, EU4 with DXVK in Fullscreen still crashed at start in our test, also
  without Anvil. That crash is between DXVK and the system's OpenGL driver, not Anvil.
- **What to use:** with DXVK, choose **Windowed (Fullscreen)**, EU4's borderless mode. It started
  without a crash in the same test.
- **Proton and the Steam Deck:** not tested yet, in either mode.

The test ran on Windows 11 with DXVK 2.7.1 from its official release, EU4 1.37.5 (Steam) and an
NVIDIA RTX 4090. With Microsoft's own Direct3D 9, both Fullscreen and Windowed (Fullscreen) worked.

### EU4DLL

The double-byte patch EU4DLL, which many Chinese, Japanese and Korean translation mods ask for,
puts its own `version.dll` in the game folder. Anvil is also a `version.dll`, so the two cannot be
installed together: unpacking EU4DLL over Anvil replaces it, and the game then runs without Anvil
and its plugins. From Anvil 1.16 the Manager recognizes EU4DLL and EU4 Unicode Patch and
[replaces them](../install/#if-eu4dll-or-eu4-unicode-patch-is-installed), keeping their files in
`anvil-legacy-backup`. [Mei](../../plugins/mei/) shows the text of these translation mods as an
Anvil plugin; its page says what to remove first.

### Multiplayer

Give every player the same plugins, at the same versions. Plugins that change gameplay are off in
multiplayer unless you allow them. During a multiplayer game, Anvil's notice names the active ones
with a short hash of that set, which every player should see the same. Plugins that declare no
gameplay change, such as Bellows and Mei, are not in the hash, so compare them by hand.

Our multiplayer tests ran with the game's usual out-of-sync check, the one players get by default,
which compares the random-number count and seed. We did not run them with `-hardoos`, which compares
all 140 checksums of the game state, so they do not show that the state stayed identical.
[Multiplayer, ironman and achievements](../multiplayer-ironman/) has what was tested.

### Where to report a problem

Bugs go to the GitHub issues of the plugin, or of [Anvil](https://github.com/happy-dwarf-team/anvil/issues/new/choose)
when you are not sure which; each plugin's page links to its repository, and the issue forms ask
for what we need ([Reporting a problem](../troubleshooting/#reporting-a-problem)). Questions go to
`#help-and-bugs` on the team's [Discord server](https://discord.happydwarf.dev/).

## What else is built on Anvil?

[Etch](https://etch.happydwarf.dev/), a preview for EU4 interface mods in Visual Studio Code. Its
live game comes with its own pinned builds of Anvil and the plugins it needs, so you do not need
to install anything here for it.

## Where can I ask a question?

On the team's [Discord server](https://discord.happydwarf.dev/): `#help-and-bugs` for problems
and questions (tag the project), `#ideas` for suggestions. Bugs are tracked in GitHub issues;
[Reporting a problem](../troubleshooting/#reporting-a-problem) says what to include.

## Who makes Anvil?

Happy Dwarf Team, under the MIT license. Anvil and its plugins are an unofficial community
project, not affiliated with or endorsed by Paradox Interactive.
