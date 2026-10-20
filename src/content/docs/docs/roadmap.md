---
title: Roadmap
description: What Anvil has, what comes next, and what is not planned.
---

Anvil 1.0 with plugin API 2 is released. The next releases are plans, not promises, and
have no dates. Source: the delivery plan in Anvil's
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

## Planned

- **Anvil 1.1: in-game overlay.** Notifications for skipped plugins, crashes and safe
  mode, and a panel with the plugins' status and a settings editor.
- **Anvil 1.2: Anvil Manager.** A program that installs Anvil, enables plugins and shows
  what will load and why, before the game starts.
- **Anvil 1.3: plugins from mods.** Plugins that come with mods enabled in the Paradox
  launcher (Steam Workshop), each new version only after the player approves it.

Not scheduled: code signing of releases, a safe Rust crate on top of `anvil-sys`, and other
storefront builds of EU4 1.37.5.

## Open items now

- Supported game build: only EU4 1.37.5 (Steam, Windows 64-bit). Other builds start
  without plugins that use game addresses.
- Suspending gameplay plugins in ironman and multiplayer is implemented, but has not been
  checked in a live ironman or multiplayer game yet. The effect of plugins on achievements
  has not been tested.
- Bellows: the first start after a reboot has not been measured with the plugin yet.
- Tongs: input in the main menu and in event pop-ups, keyboard layouts other than US and
  clicks on the map are not verified yet.

## Not planned for now

Linux and macOS builds of EU4, 32-bit, other Paradox games, other EU4 versions than 1.37.5,
and scripting languages inside plugins.

Ideas and requests go to the
[Anvil issues](https://github.com/happy-dwarf-team/anvil/issues/new/choose) or the issues of
the plugin.
