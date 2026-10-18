---
title: Roadmap
description: What Anvil has, what comes next, and what is not planned.
---

Anvil grows in four stages. The first is done and the second is under way; the last two
are plans, not promises, and have no dates. Source: the stages in Anvil's
[design notes](https://github.com/happy-dwarf-team/anvil/blob/main/docs/design.md#12-stages).

## Stages

1. **Core loader. Done.** The `version.dll` proxy, local plugins in `anvil/plugins/`, the
   manifest, game build detection, the log, the patch API, services and events, and the
   `hello` example. First public release: Anvil 0.2.0.
2. **First real plugins. Under way.** [Bellows](../../plugins/bellows/) (faster
   start-up) and [Tongs](../../plugins/tongs/) (control from scripts) are released and
   still getting new versions.
3. **Plugins from mods. Planned.** Plugins that come with mods enabled in the Paradox
   launcher (Steam Workshop), each new version only after the player approves it.
4. **Overlay and signing. Planned.** An in-game overlay, an Anvil Manager, and code signing
   of releases.

## Open items now

- Supported game build: only EU4 1.37.5 (Steam, Windows 64-bit). Other builds start
  without plugins.
- Bellows: the first start after a reboot has not been measured with the plugin yet.
- Tongs: input in the main menu and in event pop-ups, keyboard layouts other than US and
  clicks on the map are not verified yet.
- The effect of plugins on Ironman and achievements has not been tested.

## Not planned for now

Linux and macOS builds of EU4, 32-bit, other Paradox games, and scripting languages inside
plugins.

Ideas and requests go to the
[Anvil issues](https://github.com/happy-dwarf-team/anvil/issues/new/choose) or the issues of
the plugin.
