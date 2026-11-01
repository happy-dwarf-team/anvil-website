---
name: Bellows
summary: Faster Europa Universalis IV start-up and simulation. Makes the game start and run faster without changing game files or game behaviour.
tagline: Makes the game start faster, without changing game files or how it plays.
repo: https://github.com/happy-dwarf-team/bellows
status: released
gameBuilds: ['eu4-1.37.5-steam-win64']
affectsGameplay: false
order: 10
workshop: '3823747170'
highlight:
  label: Warm start to the main menu
  before: 38.68 s
  after: 12.28 s
---

Bellows (formerly EU4 Startup Boost) shortens the time from launching the game to the main
menu, and since 0.7.0 it also speeds up the running game: a simulated year takes about a
quarter less time. Game state, logs and loaded content stay identical to vanilla; only the
time changes. Like a smith's bellows, it gets the forge hot sooner.

## What it does

The plugin loads early, before the game's own code runs, and speeds up the work the game
repeats on every start, and one check the game repeats every day. Each part is a module:

| Module | What it does | Default |
| --- | --- | --- |
| `mimalloc` | Replaces the memory allocator of the game's C runtime with a faster one until the main menu; later allocations use the Windows heap. `on` keeps it for the whole session, which made the simulation about 5% slower in the lab | start-up only |
| `verifypath_listing` | Answers the game's path checks from directory listings | on |
| `exists_index` | Answers "does this file exist?" for the modifier icon check | on |
| `trigger_intern` | Interns the game's triggers at the end of loading with a faster index | on |
| `metascript_subst` | Substitutes `$parameter$` placeholders in scripted effects and triggers in a single pass | on |
| `metascript_blocks` | Resolves the `[[parameter] ...]` blocks of scripted effects and triggers in a single pass (matters for mods with large scripted effects, such as Anbennar) | on |
| `open_warmup` | Opens the files the game will need on parallel threads, so the slow first access after a reboot does not block the start | on |
| `ram_prefetch` | Reads and unpacks the DLC archive members the game will need into memory on background threads; uses up to 1 GB of extra RAM during start-up | on |
| `attr_cache` | Remembers "file not found" answers for game and mod files during start-up | off |
| `token_dict_cache` | Caches the script tokenizer's keyword lookups instead of walking a large tree character by character | on |
| `range_witness` | **Simulation, not start-up.** Answers the country range check (can a country still reach a province?) from the province that was in range last time, instead of walking all of the country's provinces again; same answers as the game's own code | on |
| `frame_pacing` | **Simulation.** At the fastest speed, draws frames from inside the daily tick every 100 ms instead of the game's 50 ms while you do nothing, and at once when you press a key, click or turn the wheel. The simulation is the same; while you just watch, the map is drawn about 16 instead of 22 times a second | on |
| `modifier_merge` | **Simulation.** In the monthly update the game adds every country's modifiers (about 700) to each of its units by scanning a list entry by entry; Bellows does the same with an index. The lists come out exactly as the game's own, and the module checks every 1,024th merge against the game's code while you play | on |
| `province_modifier_view` | **Simulation, experimental.** Every day each country looks up one value in the modifiers of every province it owns, and the game first copies the province's whole modifier list for that; Bellows reads the value in place. The same value as the game's own code; `verify` compares every call. Off until its effect on the AI is checked (below) | off |

`open_warmup` and `ram_prefetch` learn which files to read per mod set, so they pay off from
the second start on a new mod set. `range_witness` keeps what it learns only for the current
session. A module that fails turns itself off while the game continues. The diagnostic
modules `zip_profile`, `token_dict_profile`, `range_profile`, `tick_profile`,
`army_search_profile`, `score_probe` and `monthly_probe` (off by default) only count and are meant for
development, not for playing.

Bellows needs Anvil's standard plugin `anvil-game`, which is part of Anvil's package.

## Install

Bellows 0.8.0 and newer needs [Anvil](../../docs/install/) 1.0 or newer.

### From the Steam Workshop

With Anvil 1.3 or newer:

1. Subscribe to [Bellows on the Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3823747170)
   and enable it in your playset in the Paradox launcher.
2. Start the game. A notice says that a plugin waits for your approval: open the Anvil panel
   (`Ctrl+Shift+F12`), go to **Mods** and approve Bellows. You can also approve it before
   playing, on the **Mods** tab of Anvil Manager.
3. Bellows loads from the next start.

Anvil asks again after every update of the mod; until then the version you approved keeps
working. See [Plugins from mods](../../docs/plugins-from-mods/). Unsubscribe, or revoke the
approval, to remove it.

### From the release zip

1. Download `bellows-windows-x64.zip` with the button above, or from the
   [latest release](https://github.com/happy-dwarf-team/bellows/releases/latest).
   `SHA256SUMS.txt` next to the archive holds its checksum.
2. Install it on the **Plugins** tab of Anvil Manager, or extract it into
   `<EU4>/anvil/plugins/` by hand; it contains the `bellows` folder.
3. Start the game as usual.

Remove it on the Manager's **Plugins** tab, or delete the `bellows` folder.

## Settings

Each module is a setting `on`, `off` or, where the module has it, `verify`; `verify` also
runs the game's own code and compares the answers, for checking a module rather than for
playing. `mimalloc` also takes `startup`, its default. `ram_prefetch_budget_mb` sets the
memory budget of `ram_prefetch` (64–8192, default 1024), and `frame_pacing_interval_ms` the
interval of `frame_pacing` (0–1000, default 100; 0 keeps the game's own).
`frame_pacing_input` says what `frame_pacing` does with a key press or click: `draw` (the
default since 0.13.0) draws a frame at once, `wait` waits for the interval as 0.12.0 did.
The defaults, labels and descriptions are in the plugin's
[`settings.toml`](https://github.com/happy-dwarf-team/bellows/blob/main/plugin/settings.toml).

Change them on the **Settings** tab of Anvil Manager or in the Anvil panel in the game, or by
hand in `anvil/data/bellows/settings.toml`, one line per value that differs from the default:

```toml
attr_cache = "on"
ram_prefetch_budget_mb = 2048
```

Every setting applies at the next start. For one start, an environment variable overrides
it: `ANVIL_BELLOWS_<NAME>`, for example `ANVIL_BELLOWS_EXISTS_INDEX=verify` (Anvil logs each
override). When the game is ready, the plugin writes its counters to `anvil/anvil.log`.

### Upgrading

- **From 0.7.0 or earlier:** on its first start Bellows moves your
  `anvil/data/bellows/config.toml` into `settings.toml` (only the values that differ from the
  defaults; `[ram_prefetch] budget_mb` becomes `ram_prefetch_budget_mb`) and keeps the old file
  as `config.toml.migrated`; `anvil/anvil.log` says what was moved or left out. The
  `EU4SB_<NAME>` variables are no longer read: use `ANVIL_BELLOWS_<NAME>`.
- A `config.toml` written by 0.3.0 or earlier said `trigger_intern = "off"`, and the migration
  keeps that: delete the line from `settings.toml` to use the default `"on"`.
- **From EU4 Startup Boost (0.5.0 or earlier):** delete the `anvil/plugins/eu4-startup-boost/`
  folder and install Bellows. On its first start Bellows moves your settings and learned
  profiles from `anvil/data/eu4-startup-boost/` to `anvil/data/bellows/`. Anvil 1.0 does not
  load the old plugin; Bellows mentions the leftover folder in `anvil/anvil.log`.

## Tested and measured

### Start-up

Source: the [Bellows README](https://github.com/happy-dwarf-team/bellows#measured). EU4
1.37.5 (Steam, Windows 64-bit) with 10 UI, graphics and music mods, on the development
machine; warm starts (not the first after a reboot) from the game process starting to the
main menu (`Running application` in `system.log`); the original `eu4.exe`, Anvil 1.5.0 and
Bellows 0.10.0 from the release files, Bellows with default settings and the profiles it
learned on an earlier start; 3 interleaved starts each, every start only after no other
program had used the processor for 15 seconds:

| Setup | Starts | Median |
| --- | --- | ---: |
| Anvil without plugins | 39.24 / 38.68 / 38.44 s | 38.68 s |
| Anvil + `anvil-game` | 39.74 / 39.22 / 39.51 s | 39.51 s |
| Anvil + `anvil-game` + Bellows 0.10.0 | 12.79 / 12.24 / 12.28 s | **12.28 s** |

`anvil-game` on its own made no clear difference (the ranges overlap). The very first start,
with the profile shipped in the release, took 12.80 s. Starts on the same day while other
programs were busy took 40–46 s without Bellows and 12.8–13.6 s with it; they are left out
of the table.

The game's `setup.log`, `error.log` and `system.log` were byte for byte the same in all 31
starts of that day, with and without Bellows. With default settings the modules also compare a
sample of their answers with the game's own code (about 45,700 comparisons per start): 0
differences.

Not measured with the plugin yet: the first start after a reboot (a cold start). The research
build that the plugin's techniques come from took it from about 61 s to about 15 s in the lab
([design notes](https://github.com/happy-dwarf-team/bellows/blob/main/docs/design.md)).

### A big mod set: Anbennar

Source: the [Bellows README](https://github.com/happy-dwarf-team/bellows#a-big-mod-set-anbennar).
Anbennar with Proper 2K UI Enhanced and P2KE Patch - Anbennar (the Workshop items as of 26
October 2026), warm starts to the main menu, the original `eu4.exe`, Anvil 1.5.2 and Bellows
0.14.0 from the release files, Bellows with default settings and the profiles it learned on
earlier starts; 5 interleaved starts each, in a separate game profile with no other game
running:

| Setup | Starts | Median |
| --- | --- | ---: |
| Without Anvil | 85.32 / 87.19 / 84.64 / 85.29 / 86.01 s | 85.32 s |
| Anvil + `anvil-game` + Bellows 0.14.0 | 22.42 / 21.81 / 21.83 / 22.47 / 23.01 s | **22.42 s** |

About 10 s of that gain comes from `metascript_blocks` (0.14.0), which matters for Anbennar's
large scripted effects and makes no difference on the 10-mod set above. The game's logs were
the same in all five pairs of starts. The first start after a reboot was not measured on this
mod set.

### Measure your own

Anvil 1.5 or newer has a **Benchmark** tab in Anvil Manager. It starts the game again and
again, without Bellows and with it in turn; each start quits by itself once the game is
ready, and nothing in your saves, mods or `anvil.toml` changes. The tab shows the median and
spread per setup, and separately the cold starts that the series happened to contain. You
can then send the report to the Anvil project, after seeing exactly what is sent, or copy it
into a
[performance report](https://github.com/happy-dwarf-team/bellows/issues/new?template=performance_report.yml).
Bellows 0.10.0 and newer adds its module states and counters to the report.

Benchmark times run to the end of start-up (`anvil-game.ready`), so they are about 1.5 s
longer than the times above, which stop at `Running application`. See
[Start-up benchmark](../../docs/benchmark/) and
[what a report contains](../../docs/benchmark-privacy/).

### Simulation

`range_witness` was measured in the lab on EU4 1.37.5 (Steam) with a save from 17 March
1719 (Russia), 8 worker threads in each of the game's two pools and only this module on.
[Tongs](../tongs/) ran the game through the year 1720 at speed 5 and timed it, one game
launch per trial, interleaved:

| Simulated year 1720 | Without `range_witness` | With `range_witness` |
| --- | ---: | ---: |
| Trials | 27.29 / 27.58 / 27.91 s | 20.68 / 20.48 / 21.02 / 20.05 s |
| Average | 27.6 s | **20.6 s** (−25.5%) |

One trial without the module was rejected because an event paused the game during the
measured year. The game's main thread used 19.1 s of CPU time per year instead of 25.5 s;
92% of the range checks were answered from the remembered province.

In `verify` sessions the module compared its answers with the game's own code: 0
differences over more than 1.4 million compared answers, including one session driven
year by year from 17 March 1719 to 1 January 1727. Details are in the
[design notes](https://github.com/happy-dwarf-team/bellows/blob/main/docs/design.md#range_witness-simulation).

Not verified yet: other saves, mod sets and much later dates.

`frame_pacing` (on by default since 0.15.0) was measured the same way, with Bellows'
defaults in both arms and the module at 100 ms against counting only: a year at speed 5
took 20.8 s instead of 23.4 s (medians of 4 and 6 interleaved trials), and a key press at
speed 5 was handled after 21 ms instead of 51.5 ms in the median (120 presses through
Tongs each; a real key press sent to the game window, 53 each: 21.6 ms instead of 56.8 ms),
so the game reacts sooner than without the module. While nothing is pressed, the map was
drawn 16.4 instead of 22.5 times a second at speed 5 (15.8 instead of 22.7 on a save from
1821), with the same longest gap between frames. 0.12.0, which also waited for the interval
when a key was pressed, handled it after 73 ms (see the
[README](https://github.com/happy-dwarf-team/bellows#modules)).

`modifier_merge` (on by default since 0.16.0) was measured the same way, with Bellows'
defaults in both arms and the module on or off: the year 1720 took 19.45 s instead of
20.64 s (medians of 5 and 6 interleaved trials). On a save from 1821 the year was shorter
too (26.2 s against 30.2 s, 6 trials each), but late-game years vary by about 3 s between
runs, so that comparison is not conclusive. In the lab 1.52 million merges were compared
with the game's own code, and all gave the same list (see the
[design notes](https://github.com/happy-dwarf-team/bellows/blob/main/docs/design.md#modifier_merge-simulation)).

`province_modifier_view` (0.17.0, off by default) has not been timed by game year yet. In lab
game sessions (the save of 1719 and an autosave of 1821, 300 s each) it compared 12.17
million values with the game's own code, with 0 differences. By the module's own clocks the
game's copy and read took 0.80–0.83 µs a call and the view 0.07–0.11 µs; with about 0.6
million calls a game year in 1720 and 1.4 million in 1821, that would be roughly 0.4 s (about
2%) and 1 s (about 4%) less a year. This is an estimate, not a measured year: the clocks
count every thread, and some calls may run on the AI's worker threads, where they do not
lengthen the year directly. The module stays off because without the copy the game
allocates less memory on this path, which changes how its memory is laid out, and the lab
suspects that the AI breaks some ties by memory address
([bellows#79](https://github.com/happy-dwarf-team/bellows/issues/79)): a single-player game
could then take another course even though every value is right. It will be turned on only
after a determinism check and a timed series (see the
[design notes](https://github.com/happy-dwarf-team/bellows/blob/main/docs/design.md#province_modifier_view-simulation)).
