---
title: Multiplayer, ironman and achievements
description: What each plugin does in multiplayer and ironman, what happens to the game's checksum, and what has and has not been tested.
---

Anvil and its plugins live outside the files the game's checksum covers. What a plugin does
in multiplayer and ironman depends on the plugin. Each one declares whether it changes
gameplay, and Anvil acts on that.

## Plugin by plugin

| Plugin | Changes gameplay | Multiplayer | Ironman |
| --- | --- | --- | --- |
| [Bellows](../../plugins/bellows/) | No | Stays on, tested | Stays on |
| [Mei](../../plugins/mei/) | No | Stays on, not tested | Stays on |
| [Hamweard](../../plugins/hamweard/) | Yes | Off | Off, unless you allow it |
| [Tongs](../../plugins/tongs/) | Yes | Off, unless you allow it | Off, unless you allow it |
| Standard plugins (`anvil-game`, `anvil-overlay`, `anvil-log-throttle`) | No | Stay on | Stay on |

- **Bellows in multiplayer:** the host ran Bellows, the other computer did not: 233 game days
  without an out-of-sync.
- **Mei in multiplayer:** every player needs the same mods anyway, and a player without Mei
  sees names written with it wrongly.
- **Hamweard in multiplayer:** Exit to Menu restarts the game as usual.

Each plugin's page has the details and the source of each test.

## How Anvil handles a plugin that changes gameplay

Anvil loads it, then takes its changes out of the game while an ironman or multiplayer session
runs, and puts them back afterwards. The log says
`[<plugin-id>] suspended: affects gameplay and …`. If the plugin offers it, you can allow it
there: tick it on the Manager's **Plugins** tab, or edit `anvil/anvil.toml`:

```toml
allow_ironman = ["hamweard"]
allow_multiplayer = []
```

A session that is both ironman and multiplayer needs both.

## Checksum and achievements

A mod that holds only `descriptor.mod` and an `anvil/` folder does not change the game's
checksum. A mod that adds files the checksum covers changes it, with or without Anvil. The
team's plugin mods are published with a check that refuses such a change.

In one test (EU4 1.37.5 from Steam, Anvil 0.2 with a plugin in the game folder, and a mod that
holds only an `anvil/` folder), the checksum in the main menu stayed the vanilla one, and a new
ironman game did not name a modified game. On 4 November 2026, with Anvil 1.9 and Hamweard
allowed in ironman, two new ironman games in a row showed that achievements can be earned.

## What has not been tested

- No achievement has been earned in a full ironman campaign with Anvil yet.
- Anvil's suspension has been seen in a live ironman game (Hamweard, 4 November 2026), not yet
  in a live multiplayer session.
- Multiplayer has been tested with Bellows only.

If you play these and something goes wrong, or goes right where we say "not tested",
[tell us](https://github.com/happy-dwarf-team/anvil/issues/new/choose).
