---
title: Multiplayer, ironman and achievements
description: What each plugin does in multiplayer and ironman, what happens to the game's checksum, and what has and has not been tested.
---

Anvil and its plugins live outside the files the game's checksum covers. What a plugin does
in multiplayer and ironman depends on the plugin. Each one declares whether it changes
gameplay, and Anvil acts on that.

## Plugin by plugin

| Plugin | Declares gameplay changes | Multiplayer | Ironman |
| --- | --- | --- | --- |
| [Bellows](../../plugins/bellows/) | No | Stays on, tested on the host only | Stays on |
| [Mei](../../plugins/mei/) | No | Stays on, not tested | Stays on |
| [Hamweard](../../plugins/hamweard/) | No | Stays on, restarts as usual | Stays on |
| [Tongs](../../plugins/tongs/) | Yes | Off, unless you allow it | Off, unless you allow it |
| Standard plugins (`anvil-game`, `anvil-overlay`, `anvil-log-throttle`) | No | Stay on | Stay on |

- **Bellows in multiplayer:** the host ran Bellows, the other computer did not: 233 game days on
  0.17.0 and 231 on the code of 1.3.0, on one save. The second run was at speed 3, because the
  other computer could not keep up at 5. Both runs used the defaults of their code, so the four
  simulation modules that Bellows 1.4 turns on by default were off. On 9 November 2026 a build of
  1.4 with those modules on ran 203 days at speed 3 the same way. In all three runs the game's
  usual out-of-sync check, which compares the random-number count and seed, reported nothing.
  Bellows on another player's computer is not tested.
- **Mei in multiplayer:** every player needs the same mods anyway, and a player without Mei
  sees names written with it wrongly.
- **Hamweard in multiplayer:** Exit to Menu restarts the game as usual, by the plugin's own check.
  Tested on Steam on 6 November 2026 with Hamweard on both computers: in about four months of game
  the game's usual out-of-sync check reported nothing, a client rejoining the running campaign
  included.

None of these tests used `-hardoos`, which compares all 140 checksums of the game state, so they
do not show that the state stayed identical ([FAQ](../faq/)).

Each plugin's page has the details and the source of each test.

## How Anvil handles a plugin that changes gameplay

Anvil loads it, then takes its changes out of the game while an ironman or multiplayer session
runs, and puts them back afterwards. The log says
`[<plugin-id>] suspended: affects gameplay and …`. A host alone in a multiplayer game does not
count yet: the game's own check asks for other players, so suspension starts when the first one
joins. If the plugin offers it, you can allow it
there: tick it on the Manager's **Plugins** tab, or edit `anvil/anvil.toml`:

```toml
allow_ironman = ["tongs"]
allow_multiplayer = []
```

A session that is both ironman and multiplayer needs both.

## Notices in the game

During a session, a notice in the top right corner says what Anvil does there:

- **Multiplayer** shows in every multiplayer game. It names the plugins that change the game
  with a short hash of the set, which every player should see the same, or says that none acts.
  From Anvil 1.14 its **x** closes it until that session ends; the next session shows it again.
- **Ironman with gameplay plugins** shows while a plugin you allowed in ironman acts. It says
  that achievements stay enabled but such plugins may break Paradox's rules for them, and it
  cannot be closed.

## Checksum and achievements

A mod that holds only `descriptor.mod` and an `anvil/` folder does not change the game's
checksum. A mod that adds files the checksum covers changes it, with or without Anvil. The
team's plugin mods are published with a check that refuses such a change.

In one test (EU4 1.37.5 from Steam, Anvil 0.2 with a plugin in the game folder, and a mod that
holds only an `anvil/` folder), the checksum in the main menu stayed the vanilla one, and a new
ironman game did not name a modified game. On 4 November 2026, with Anvil 1.9 and Hamweard
in ironman, two new ironman games in a row showed that achievements can be earned.

## What has not been tested

- No achievement has been earned in a full ironman campaign with Anvil yet, or on GOG. One was
  earned on Steam on 6 November 2026, 6.5 months into a campaign started after a Hamweard return,
  with Tongs allowed in ironman.
- Anvil's suspension has been seen in a live ironman game (Hamweard 1.1.0, 4 November 2026), not
  yet in a live multiplayer session.
- Multiplayer has been tested with Bellows on the host (one vanilla save, the defaults of 1.4 at
  speed 3 only) and with Hamweard on both computers, always with the game's usual out-of-sync
  check, never with `-hardoos`.

If you play these and something goes wrong, or goes right where we say "not tested",
[tell us](https://github.com/happy-dwarf-team/anvil/issues/new/choose).
