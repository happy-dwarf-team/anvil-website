---
title: Roadmap
description: What Anvil has, what comes next, and what is not planned.
---

Anvil 1.5 is released: plugin API 2, the in-game overlay, Anvil Manager, plugins from mods
and the start-up benchmark. Further work is a plan, not a promise, and has no dates. Source: the delivery plan in Anvil's
[design notes](https://github.com/happy-dwarf-team/anvil/blob/main/docs/design.md#22-delivery).

## Done

1. **Core loader: Anvil 0.2.** The `version.dll` proxy, local plugins in `anvil/plugins/`,
   the manifest, game build detection, the log, services and events. Plugin API 1.
2. **Plugin API 2: Anvil 1.0.** Game addresses declared and verified in `symbols.toml`;
   seven kinds of change that chain between plugins; settings; crash reports and safe
   mode; suspension of gameplay plugins in ironman and multiplayer; the standard plugin
   `anvil-game`; the `anvil gen` and `anvil check` tools; the SDK archive; `anvil-sys`
   for Rust; and the [plugin template](https://github.com/happy-dwarf-team/anvil-plugin-template).
   [Bellows](../../plugins/bellows/) and [Tongs](../../plugins/tongs/) moved to API 2 with
   it.
3. **In-game overlay: Anvil 1.1.** Notifications for skipped plugins, crashes and safe
   mode, and a panel with the plugins' status and a settings editor.
4. **Anvil Manager: Anvil 1.2.** `AnvilManager.exe` installs, repairs and uninstalls Anvil,
   installs plugins from zips and shows what will load and why, before the game starts.
5. **Plugins from mods: Anvil 1.3.** Plugins that come with mods enabled in the Paradox
   launcher (Steam Workshop or local mods), each version only after the player approves it.
   See [Plugins from mods](../plugins-from-mods/). Bellows and Tongs are published on the
   Steam Workshop this way.
6. **Benchmark service for plugins: Anvil 1.4.** The core service `anvil.benchmark`, through
   which plugins report their own fields for a start-up benchmark, and benchmark starts that
   leave the compared plugin out or quit by themselves once the game is ready. Nothing a
   player sees. Bellows 0.10.0 takes part.
7. **Benchmark tab: Anvil 1.5.** Anvil Manager runs a series of game starts without a plugin
   and with it, shows the result with warm and cold starts apart, and lets the player send an
   anonymous report to the maintainers or copy it. See
   [Start-up benchmark](../benchmark/) and
   [Benchmark reports and your privacy](../benchmark-privacy/).

## Planned

- **Ports of older native patches.** EU4 Menu Patch and EU4 Unicode Patch as Anvil plugins
  are being researched with their author
  ([#105](https://github.com/happy-dwarf-team/anvil/issues/105),
  [#104](https://github.com/happy-dwarf-team/anvil/issues/104)).

Not scheduled: code signing of releases, a safe Rust crate on top of `anvil-sys`, and other
storefront builds of EU4 1.37.5.

## Open items now

- Supported game build: only EU4 1.37.5 (Steam, Windows 64-bit). Other builds start
  without plugins that use game addresses.
- Suspending gameplay plugins in ironman and multiplayer is implemented, but has not been
  checked in a live ironman or multiplayer game yet. The effect of plugins on achievements
  has not been tested.
- Bellows: the first start after a reboot has not been measured with the plugin yet. The
  Benchmark tab shows the cold starts a series happens to contain, but cannot make one on
  demand.
- Tongs: input in text fields, keyboard layouts other than US and clicks on the map are not
  verified yet.

## Not planned for now

Linux and macOS builds of EU4, 32-bit, other Paradox games, other EU4 versions than 1.37.5,
and scripting languages inside plugins.

Ideas and requests go to the
[Anvil issues](https://github.com/happy-dwarf-team/anvil/issues/new/choose) or the issues of
the plugin.
