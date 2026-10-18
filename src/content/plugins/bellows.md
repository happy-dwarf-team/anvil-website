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
  before: 33.6 s
  after: 11.9 s
---

Bellows (formerly EU4 Startup Boost) shortens the time from launching the game to the main
menu. Game state, logs and loaded content stay identical to vanilla; only the time changes.
Like a smith's bellows, it gets the forge hot sooner.

Download the latest release from the
[releases page](https://github.com/happy-dwarf-team/bellows/releases).

## What it does

The plugin loads early, before the game's own code runs, and speeds up the work the game
repeats on every start. Each part is a module:

| Module | What it does | Default |
| --- | --- | --- |
| `mimalloc` | Replaces the game's memory allocator with a faster one, for the whole session | on |
| `verifypath_listing` | Answers the game's path checks from directory listings | on |
| `exists_index` | Answers "does this file exist?" for the modifier icon check | on |
| `metascript_subst` | Substitutes `$parameter$` placeholders in scripted effects and triggers in a single pass | on |
| `trigger_intern` | Interns the game's triggers at the end of loading with a faster index | on |
| `token_dict_cache` | Caches the script tokenizer's keyword lookups instead of walking a large tree character by character | on |
| `open_warmup` | Opens the files the game will need on parallel threads, so the slow first access after a reboot does not block the start | on |
| `ram_prefetch` | Reads and unpacks the DLC archive members the game will need into memory on background threads; uses up to 1 GB of extra RAM during start-up | on |
| `attr_cache` | Remembers "file not found" answers for game and mod files during start-up | off |

`open_warmup` and `ram_prefetch` learn which files to read per mod set. A module that fails
turns itself off while the game continues.

## Install

1. Install [Anvil](../../docs/install/) 0.2.0 or newer.
2. Download `bellows-windows-x64.zip` from the
   [latest release](https://github.com/happy-dwarf-team/bellows/releases/latest) and
   extract it into `<EU4>/anvil/plugins/`; it contains the `bellows` folder.
   `SHA256SUMS.txt` next to the archive holds its checksum.
3. Start the game as usual.

Delete the `bellows` folder to uninstall.

## Configuration

On its first start the plugin writes `anvil/data/bellows/config.toml` and never overwrites
it. Each module is `on`, `off` or `verify`; `verify` compares the module's answers with
the game's own code, for checking a module rather than for playing.

- `[ram_prefetch] budget_mb` sets the memory budget of `ram_prefetch` (64–8192, default
  1024).
- `token_dict_cache` is not listed in the file and is on for existing files too. Add
  `token_dict_cache = "off"` under `[modules]` to switch it off.
- When the game is ready, the plugin writes its counters to `anvil/anvil.log`.

### Upgrading

- From EU4 Startup Boost (0.5.0 or earlier): delete the `anvil/plugins/eu4-startup-boost/`
  folder and extract Bellows. On its first start Bellows moves your settings and learned
  profiles from `anvil/data/eu4-startup-boost/` to `anvil/data/bellows/`. While the old
  folder is still installed, Bellows changes nothing and says so in `anvil/anvil.log`.
- A `config.toml` written by 0.3.0 or earlier keeps `trigger_intern = "off"`. Set it to
  `"on"`, or delete the file to get the current defaults.

## Tested and measured

All measurements: EU4 1.37.5 (Steam, Windows 64-bit) with 10 UI, graphics and music mods,
on the development machine, warm starts (not the first after a reboot), from the game
process starting to the main menu. Details and run names are in the
[design notes](https://github.com/happy-dwarf-team/bellows/blob/main/docs/design.md).

| Case | Without the plugin | With the plugin | Starts |
| --- | ---: | ---: | --- |
| Started directly from the game folder | 33.6 s | 11.9 s (first start: 14.9 s) | 1 each |
| Started through the Paradox launcher | 30.9 s and 30.1 s | 14.8 s | 2 + 1, interleaved |

These starts ran with the plugin as of 0.3.0. Through the launcher the Steam overlay also
loads; it probably accounts for most of the difference to a direct start (not verified).

Single modules were measured on a copy of the game folder:

- `ram_prefetch`: median 12.24 s with it and 15.16 s without it, 3 + 3 interleaved starts.
- `token_dict_cache` (0.5.0): 0.38 s shorter on average over 16 pairs of starts with the
  cache on and off.

In every series the game's `setup.log`, `error.log` and `system.log` were identical with
and without the plugin. In a verification start, the modules compared their answers with
the game's own code: 0 differences over 3.6 million calls. Five in-game years were played
with the plugin without crashes or new errors, and an autosave from that session loaded
correctly.

Not measured yet: the first start after a reboot. The research build that the plugin's
techniques come from took it from ~61 s to ~15 s.

## Supported game build

EU4 1.37.5 (Steam, Windows 64-bit). On any other build Anvil skips the plugin and the
game starts normally.
