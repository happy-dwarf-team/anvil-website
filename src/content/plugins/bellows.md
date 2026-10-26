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
| `mimalloc` | Replaces the memory allocator of the game's C runtime with a faster one, for the whole session | on |
| `verifypath_listing` | Answers the game's path checks from directory listings | on |
| `exists_index` | Answers "does this file exist?" for the modifier icon check | on |
| `trigger_intern` | Interns the game's triggers at the end of loading with a faster index | on |
| `metascript_subst` | Substitutes `$parameter$` placeholders in scripted effects and triggers in a single pass | on |
| `open_warmup` | Opens the files the game will need on parallel threads, so the slow first access after a reboot does not block the start | on |
| `ram_prefetch` | Reads and unpacks the DLC archive members the game will need into memory on background threads; uses up to 1 GB of extra RAM during start-up | on |
| `attr_cache` | Remembers "file not found" answers for game and mod files during start-up | off |
| `token_dict_cache` | Caches the script tokenizer's keyword lookups instead of walking a large tree character by character | on |
| `range_witness` | **Simulation, not start-up.** Answers the country range check (can a country still reach a province?) from the province that was in range last time, instead of walking all of the country's provinces again; same answers as the game's own code | on |

`open_warmup` and `ram_prefetch` learn which files to read per mod set, so they pay off from
the second start on a new mod set. `range_witness` keeps what it learns only for the current
session. A module that fails turns itself off while the game continues. The diagnostic
modules `zip_profile`, `token_dict_profile` and `range_profile` (off by default) only count
and are meant for development, not for playing.

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
playing. `ram_prefetch_budget_mb` sets the memory budget of `ram_prefetch` (64–8192, default
1024). The defaults, labels and descriptions are in the plugin's
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
