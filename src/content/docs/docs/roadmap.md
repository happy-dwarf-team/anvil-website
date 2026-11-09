---
title: Roadmap
description: What Anvil has, what is still open, and what is not planned.
---

This page is a plan, not a promise, and has no dates. Each release is on
[What's new](../../whats-new/). The delivery plan is in Anvil's
[design notes](https://github.com/happy-dwarf-team/anvil/blob/main/docs/design.md#22-delivery).

## What Anvil has

| Anvil | What came |
| --- | --- |
| 1.0 | Plugin API 2: game addresses checked before a plugin loads, settings, crash reports and safe mode, suspension of gameplay plugins in ironman and multiplayer, `anvil-game`, the SDK and the [plugin template](https://github.com/happy-dwarf-team/anvil-plugin-template) |
| 1.1 | The panel in the game |
| 1.2 | Anvil Manager |
| 1.3 | [Plugins from mods](../plugins-from-mods/) |
| 1.4 | The benchmark service for plugins |
| 1.5 | The [Benchmark tab](../benchmark/) |
| 1.6 | The game date for plugins and a [shorter `error.log`](../using-anvil/#a-shorter-errorlog) |
| 1.7 | The panel and the Manager in [French, German and Spanish](../using-anvil/#language); the GOG build 1.37.5.2 |
| 1.8 | A [badge in the main menu](../install/#check-that-anvil-runs) |
| 1.9 | The [**Catalog** tab](../install-plugins/#from-the-catalog-tab); Chinese, Japanese and Korean with [Mei](../../plugins/mei/); a problem report to copy |
| 1.10 | The Manager finds and starts a GOG game and reads its own user folder; authors can [check symbols by digest](../plugins/manifest/#digests-instead-of-bytes) |
| 1.11 | Plugins can [read the campaign](../plugins/api/#the-world) and [open a window](../plugins/api/#windows) without game addresses; [`anvil port`](../plugins/manifest/#anvil-port) moves a plugin's addresses to a new game build; a clear notice [after an EU4 update](../using-anvil/#when-eu4-updates) |
| 1.12 | Once Anvil knows a new game build, [one notice names the plugins that wait for it](../using-anvil/#when-eu4-updates) and the badge comes back with an amber dot; [`anvil port`](../plugins/manifest/#anvil-port) takes the new build's id from Anvil's own list |
| 1.13 | The Manager can [add itself to the Start menu](../install/#install-with-anvil-manager) |
| 1.14 | The game [tells you about a newer Anvil](../using-anvil/#a-newer-anvil); the Manager says when [the game ran without Anvil](../troubleshooting/#if-anvil-does-not-run-at-all); the [Multiplayer notice](../multiplayer-ironman/#notices-in-the-game) can be closed; plugins can tell that a multiplayer game [went out of sync](../plugins/api/#out-of-sync) |

**Ports of older native patches** are out: EU4 Menu Patch as [Hamweard](../../plugins/hamweard/)
([#105](https://github.com/happy-dwarf-team/anvil/issues/105)) and EU4 Unicode Patch as
[Mei](../../plugins/mei/) ([#104](https://github.com/happy-dwarf-team/anvil/issues/104)).

## Still open

- **Game builds.** The GOG build 1.37.5.0 waits for a copy to check
  ([#187](https://github.com/happy-dwarf-team/anvil/issues/187)). Until then Anvil tells its
  players to update in GOG Galaxy. Other builds start without plugins that use game addresses.
- **Ironman and multiplayer.** Suspending gameplay plugins has been seen in a live ironman game,
  not yet in a live multiplayer session. One achievement has been earned in an ironman game with
  Anvil, none yet in a full campaign ([what was tested](../multiplayer-ironman/#what-has-not-been-tested)).
  The out-of-sync report of 1.14 has not seen a real desync yet, which takes two computers.
- **Bellows.** The first start after a reboot has not been measured with the plugin. The
  Benchmark tab shows the cold starts a series happens to contain, but cannot make one on demand.
- **Translations.** No native speaker has checked the French, German, Spanish, Chinese, Japanese
  and Korean texts of the panel and the Manager yet.
- **Tongs.** Input in text fields, keyboard layouts other than US and clicks on the map are not
  verified yet.

## Not scheduled

- A safe Rust crate on top of `anvil-sys`, and the Microsoft Store and Epic builds of EU4 1.37.5.
- Changing a province's terrain during a campaign, and the map's look with it, so that a mod
  no longer has to draw over the map or add modifiers that only imitate a new terrain
  ([#258](https://github.com/happy-dwarf-team/anvil/issues/258)). An idea, not researched yet.
  Such a plugin changes the game, so Anvil would suspend it in ironman and multiplayer like
  other gameplay plugins.

## Not planned

- Code signing. Releases keep SHA-256 checksums and a build attestation instead
  ([#157](https://github.com/happy-dwarf-team/anvil/issues/157)).
- The native Linux and macOS builds of EU4, 32-bit, other Paradox games, and EU4 versions other
  than 1.37.5. The Windows game on Linux with Proton is not tested
  ([FAQ](../faq/#does-it-work-on-the-microsoft-store-linux-or-macos)).
- Scripting languages inside plugins.

Ideas and requests go to the
[Anvil issues](https://github.com/happy-dwarf-team/anvil/issues/new/choose) or the issues of the
plugin.
