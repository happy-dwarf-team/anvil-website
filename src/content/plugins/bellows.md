---
name: Bellows
summary: Faster Europa Universalis IV start-up. Makes the game start faster without changing game files or game behaviour.
repo: https://github.com/happy-dwarf-team/bellows
status: released
gameBuilds: ['eu4-1.37.5-steam-win64']
affectsGameplay: false
order: 10
highlight:
  label: Warm start to the main menu
  before: ~31 s
  after: ~12 s
---

Bellows (formerly EU4 Startup Boost) shortens the time from launching the game to the main menu. Game state,
logs and loaded content stay identical to vanilla; only the time changes.

Download the latest release from the
[releases page](https://github.com/happy-dwarf-team/bellows/releases).

## What it does

The plugin loads early, before the game's own code runs, and speeds up the work the game
repeats on every start:

- reads the files the game is about to need into memory on background threads,
- answers repeated "does this file exist?" checks from directory listings,
- replaces the game's memory allocator with a faster one,
- substitutes `$parameter$` placeholders in scripted effects and triggers in a single pass,
- interns the game's triggers at the end of loading with a faster index (on by default
  since 0.4.0),
- caches the script tokenizer's keyword lookups instead of walking a large tree character
  by character for every word (since 0.5.0),
- after a reboot, opens the files the game will need in parallel, so the slow first
  access does not block the start.

Every module can be switched off on its own in `anvil/data/bellows/config.toml`,
and a module that fails turns itself off while the game continues.

### Upgrading

The plugin writes its `config.toml` on the first start and never overwrites it:

- From EU4 Startup Boost (0.5.0 or earlier): delete the `anvil/plugins/eu4-startup-boost/`
  folder and extract Bellows. On its first start Bellows moves your settings and learned
  profiles from `anvil/data/eu4-startup-boost/` to `anvil/data/bellows/`. While the old
  folder is still installed, Bellows changes nothing and says so in `anvil/anvil.log`.
- From 0.3.0 or earlier, the file keeps `trigger_intern = "off"`. Set it to `"on"`, or
  delete the file to get the new defaults.
- The keyword cache (0.5.0) is not listed in the file and is on for existing files too.
  Add `token_dict_cache = "off"` under `[modules]` to switch it off.

## Measurements

Measured with the plugin on the development machine (EU4 1.37.5, Steam, 10 UI/graphics
mods), warm starts, time from the game process starting to the main menu:

| Case | Vanilla | With the plugin |
| --- | ---: | ---: |
| Started directly from the game folder | ~31–34 s | ~12 s |
| Started through the Paradox launcher | ~30 s | ~14 s |

Through the launcher the Steam overlay and the launcher itself also load; they probably
account for the ~2 s difference to a direct start (not verified).

These starts were measured before 0.5.0. In two interleaved series on a copy of the game
folder, the 0.5.0 keyword cache shortened the start by a further ~0.4 s on average
(16 pairs of starts with the cache on and off).

The first start after a reboot has not been measured with the plugin yet. The research
build that the plugin's techniques come from took it from ~61 s to ~15 s.

## Supported game build

EU4 1.37.5 (Steam, Windows 64-bit). On any other build Anvil skips the plugin and the
game starts normally.
