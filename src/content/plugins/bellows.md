---
name: Bellows
summary: Faster Europa Universalis IV start-up, simulation and saves. Makes the game start and run faster without changing game files or rules.
tagline: Makes the game start faster and the years pass sooner, without changing game files or the rules of the game.
repo: https://github.com/happy-dwarf-team/bellows
status: released
gameBuilds: ['eu4-1.37.5-steam-win64', 'eu4-1.37.5.2-gog-win64']
affectsGameplay: false
order: 10
workshop: '3823747170'
highlight:
  label: Warm start to the main menu
  before: 40.80 s
  after: 12.76 s
---

Bellows makes Europa Universalis IV start faster and the years pass sooner. It changes no game
files and no rule of the game: it does the same work with less waiting. Formerly EU4 Startup Boost.

## What you get

All numbers are from the lab, on one computer; yours will differ.
[Tested and measured](#tested-and-measured) has the details, and you can
[measure your own](#measure-your-own).

- **A faster start.** About 13 seconds instead of 41 with 10 mods, and 22 instead of 85 with
  Anbennar, on warm starts (not the first after a reboot).
- **Years pass sooner at speed 5.** With all default settings the year 1720 took about 17 seconds
  instead of 27.
- **Faster loading.** "Continue" of a large text save took about 9 seconds instead of 11 with
  Bellows 1.1, and 1.2 takes off about 2 more.
- **Slightly faster autosaves** with compressed saves.
- **The same rules.** The game's logs and loaded content stay the same. The AI can still
  [play out differently](#ai-ties-and-multiplayer).

## Install

Bellows needs [Anvil](../../docs/install/) 1.7 or newer. Its one dependency, the standard plugin
`anvil-game`, comes with Anvil.

[Install the plugin](../../docs/install-plugins/) any way you like. There is nothing to set up. The
first start on a new mod set learns which files that set needs, so the full gain comes from the
second start.

## Settings

You do not need to change anything. The numbers above are with the default settings. Change a
setting on the **Settings** tab of Anvil Manager or in the Anvil panel. It applies at the next
start, except `frame_pacing_interval_ms` and `frame_pacing_input`: changed in the Anvil panel while
`frame_pacing` is on, they apply at once (since Bellows 1.4.0).

| Setting | Default | What it does |
| --- | --- | --- |
| Each [module](#modules) | see the table | `on` or `off`. Most also take `verify`, which is for checking a module, not for playing |
| `mimalloc` | `startup` | `startup` keeps the faster allocator until the main menu, `on` for the whole session, which made the simulation about 5% slower |
| `ram_prefetch_budget_mb` | 1024 | Memory for reading ahead during start-up, 64–8192 |
| `frame_pacing_interval_ms` | 100 | Time between frames drawn at speed 5, 0–1000; 0 keeps the game's own |
| `frame_pacing_input` | `draw` | `draw` shows a frame at once when you press a key or click; `wait` waits for the interval |
| `save_compress_parallel` | `off` | `on` compresses large saves on several threads. The save is valid, but its compressed bytes differ from the game's |
| `verifypath_session` | `on` | Keeps `verifypath_listing` answering after the main menu is up, so loading a save finds its textures sooner. A listing is read again once it is 30 s old |

By hand, put one line per changed value in `anvil/data/bellows/settings.toml`:

```toml
attr_cache = "on"
ram_prefetch_budget_mb = 2048
```

For one start, an environment variable overrides a setting, for example
`ANVIL_BELLOWS_EXISTS_INDEX=verify`. Every 1.x release keeps these settings and what they mean; see
[Compatibility](https://github.com/happy-dwarf-team/bellows#compatibility) in the README.
[`settings.toml`](https://github.com/happy-dwarf-team/bellows/blob/main/plugin/settings.toml) lists
all of them.

## Limitations

- **The first start after a reboot has not been measured** with the plugin, so Bellows makes no
  claim for it.
- **It uses up to 1 GB of extra memory** during start-up, and at most a quarter of the memory free
  at that moment.
- **The map redraws less often at speed 5:** about 16 instead of 22 times a second while you do
  nothing. A key press or click still gets a frame at once.
- **The simulation numbers come from two vanilla saves,** of 1719 and of a late game in 1821, on one
  computer. Mod sets are not verified yet, apart from one year of Anbennar with `frame_pacing`.
- **Online-service messages can arrive up to half a second later** in single player at speed 5:
  `pops_pacing` runs the game's Paradox callbacks (account, friends and chat, the news feed) every
  500 ms. Achievements, mods and multiplayer are not affected.
- **Files must not change while the game starts.** A file that a tool writes into the game or mod
  folders during start-up may be missed until the next start. This matters [to mod
  authors](#for-mod-authors).
- **Not tested yet:** a save written with `save_compress_parallel` in multiplayer, ironman and cloud
  saves, `transfer_skip` on a real multiplayer host, in ironman and with cloud saves, in
  multiplayer Bellows on a computer other than the host's, and the defaults of 1.4 in multiplayer
  at speed 5 or with mods.

### AI ties and multiplayer

Bellows changes no rule, but a game can still come out differently in single player, and not all
of it is explained yet. The known cause is a tie. When the AI chooses between options with exactly the same score, for example two
leaders with the same pips, the game breaks the tie by where the two objects lie in memory. Bellows
changes where they end up, so such a tie can go the other way than without it. The choice is as
valid as the game's own, and from then on that game takes its own course. Two computers without
Bellows differ in the same way.

Ties do not explain everything. In the lab, runs of one vanilla save of 1444 sometimes became a
different game with the same seed, also with no Bellows at all. In every case we traced, one AI
command landed on the other side of the game's daily tick, so the order depends on timing. Bellows
makes that happen more often: in a planned series at speed 2, 11 of 30 runs with the default settings of 1.2
went the other way, against 1 of 30 without Bellows (sign test over paired blocks, p = 0.002), each
time at the same point of that save. That is one save, one speed and one computer, and we don't know
how often it happens over a whole campaign. Both orders are normal games.

In multiplayer the known ties cannot put games out of sync: the host's AI makes these choices and
sends them to every player. In the lab the host ran Bellows and the other computer ran none: 233
game days on 0.17.0 ([bellows#79](https://github.com/happy-dwarf-team/bellows/issues/79)) and 231 on
the code of 1.3.0, the second run at speed 3 because the other computer could not keep up at 5. On
9 November 2026 a build of 1.4 with its defaults, the four simulation modules on, ran 203 game days
the same way at speed 3. In all three runs the game's usual out-of-sync check, the one players get,
which compares the random-number count and seed, reported nothing. They did not use `-hardoos`,
which compares all 140 checksums of the game state, so they do not show that the whole state stayed
the same. Those are the only multiplayer tests so far: one vanilla save, Bellows on the host only.

## Troubleshooting

- **Was Bellows loaded?** `anvil/anvil.log` has one line per start with every module and its mode,
  for example `modules: mimalloc=startup, open_warmup=on, …`. A module shown as `FAILED` turned
  itself off, and the line above it says why.
- **Turn one module off** to see whether it causes a problem, for example `range_witness = "off"`.
- **A module you turned off before 1.4 is on again?** Anvil saves only values that differ from the
  default. If you set `port_table`, `province_modifier_view`, `army_search_memo` or `pops_pacing`
  to `off` while that was the default, there is no line for it, and 1.4 turns it on. Set it to `off`
  again; it applies at the next start.
- **Not faster?** `open_warmup` and `ram_prefetch` pay off from the second start on a mod set. Each
  set has its profile in `anvil/data/bellows/profiles/`; deleting that folder makes Bellows learn
  again. The [Benchmark tab](#measure-your-own) gives a fair number.
- **A module counted `mismatches` above 0** in the log or in its `.tsv` file in
  `anvil/data/bellows/`: one of its answers differed from the game's. Modules that compare a sample
  then go back to the game's code for the session. Please report it with the log and the `.tsv` file.
- **Reporting a problem:** a
  [bug report](https://github.com/happy-dwarf-team/bellows/issues/new?template=bug_report.yml) with
  `anvil/anvil.log` of that start, your `settings.toml`, the mods of the playset, and whether it
  happens with Bellows removed.

## For mod authors

- **You have nothing to do.** Bellows reads your mod as the game does. `setup.log`, `error.log` and
  `system.log` are the same with and without it, so a script error shows up as it would without
  Bellows.
- **Files must not change while the game starts.** `verifypath_listing` and `exists_index` answer
  path checks from listings read once during start-up, and `attr_cache` remembers "not found". A
  file written during loading may be missed, and a deleted one may still be found, until the next
  start. Edit your files between starts, or turn those modules off while you develop. Once the main
  menu is up, only `verifypath_session` remains: a file added or deleted in the game or mod folders
  counts after at most 30 s. Turn it off if you need new files to count at once. Mods in the game's
  user folder (Documents) are not affected.
- **Profiles are per mod set,** not per mod version. After an update of your mod the first start
  may gain a little less.
- **Large scripted effects** with `$parameter$` and `[[parameter]]` blocks are where
  `metascript_subst` and `metascript_blocks` save the most: about 10 s of Anbennar's start-up.

## Modules

Each part of Bellows is a module with its own setting.

| Module | What it does | Default |
| --- | --- | --- |
| `mimalloc` | A faster memory allocator for the game's C runtime | until the main menu |
| `verifypath_listing` | Answers the game's path checks from directory listings. With `verifypath_session` it goes on after the main menu is up | on |
| `exists_index` | Answers "does this file exist?" for the modifier icon check | on |
| `trigger_intern` | Looks each trigger up in the game's trigger profile at the end of loading, through a faster index | on |
| `metascript_subst` | Substitutes `$parameter$` placeholders in a single pass | on |
| `metascript_blocks` | Resolves `[[parameter] ...]` blocks in a single pass; matters for mods such as Anbennar | on |
| `open_warmup` | Opens the files the game will need on parallel threads | on |
| `ram_prefetch` | Reads and unpacks the DLC archive members the game will need into memory | on |
| `attr_cache` | Remembers "file not found" answers during start-up | off |
| `token_dict_cache` | Caches the script tokenizer's keyword lookups | on |
| `range_witness` | **Simulation.** Answers the country range check from the province that was in range last time | on |
| `frame_pacing` | **Simulation.** At the fastest speed, draws frames every 100 ms instead of 50 ms while you do nothing | on |
| `modifier_merge` | **Simulation.** Adds each country's modifiers to its units with an index instead of a scan; checks every 1,024th merge against the game's code | on |
| `port_table` | **Simulation, since 1.4 on by default.** Rebuilds a country's table of the nearest port from one list of its ports instead of walking its provinces and relations again for every province of the map; checks every 32nd rebuild against the game's code | on |
| `province_modifier_view` | **Simulation, since 1.4 on by default.** Reads one value in place instead of copying a province's whole modifier list | on |
| `pops_pacing` | **Simulation, since 1.4 on by default.** At the fastest speed, runs the game's Paradox online-service callbacks every 500 ms instead of twice a frame | on |
| `army_search_memo` | **Simulation, since 1.4 on by default.** In the AI's daily search for each army, in a path search and when a unit's moves are listed, works out once whether a modifier lets the army ignore forts' zones of control and what its speed modifier is | on |
| `save_compress` | **Saving.** For compressed saves, computes the checksum eight bytes at a time; the file is byte for byte the game's | on |
| `transfer_skip` | **Loading.** In single player, "Continue" of a text save no longer compresses the file for a multiplayer transfer nobody receives | on |
| `history_add` | **Loading.** Adds an entry the game just read to a dated list without first walking the whole list. The list comes out the same, and the gain depends on the mods | on |

The diagnostic modules `zip_profile`, `token_dict_profile`, `range_profile`, `tick_profile`,
`army_search_profile`, `score_probe` and `monthly_probe` only count, and are for development.
The [README](https://github.com/happy-dwarf-team/bellows#modules) describes each module in full.

## Tested and measured

### Start-up

Source: the [Bellows README](https://github.com/happy-dwarf-team/bellows#measured). EU4 1.37.5
(Steam), 10 UI, graphics and music mods, warm starts to the main menu, the original `eu4.exe`,
Anvil 1.8.0 and Bellows 0.19.0 with default settings; 5 interleaved starts each, 3 November 2026:

| Setup | Starts | Median |
| --- | --- | ---: |
| Anvil without plugins | 40.99 / 39.73 / 40.81 / 47.69 s | 40.90 s |
| Anvil + `anvil-game` | 41.36 / 40.63 / 40.48 / 40.80 / 46.91 s | 40.80 s |
| Anvil + `anvil-game` + Bellows 0.19.0 | 12.76 / 12.49 / 12.47 / 13.31 / 12.81 s | **12.76 s** |

One start without plugins (55.05 s) ran while a build used the same processor and is left out. The
game's logs were the same in every round, apart from times and counts. The modules also compared
about 45,700 answers per start with the game's own code: 0 differences.

### A big mod set: Anbennar

Source: the [Bellows README](https://github.com/happy-dwarf-team/bellows#a-big-mod-set-anbennar).
Anbennar with Proper 2K UI Enhanced and P2KE Patch - Anbennar, warm starts, Anvil 1.5.2 and Bellows
0.14.0; 5 interleaved starts each:

| Setup | Starts | Median |
| --- | --- | ---: |
| Without Anvil | 85.32 / 87.19 / 84.64 / 85.29 / 86.01 s | 85.32 s |
| Anvil + `anvil-game` + Bellows 0.14.0 | 22.42 / 21.81 / 21.83 / 22.47 / 23.01 s | **22.42 s** |

### Measure your own

The [Benchmark tab](../../docs/benchmark/) of Anvil Manager runs the game again and again, without
Bellows and with it, and shows the result. Its times are about 1.5 s longer than those above,
because they run to the end of start-up. You can then send a report, or copy it into a
[performance report](https://github.com/happy-dwarf-team/bellows/issues/new?template=performance_report.yml).

### A year at speed 5

Source: the [Bellows README](https://github.com/happy-dwarf-team/bellows#a-year-at-speed-5). All
default settings together against the same game without Bellows, with the main thread on one
processor and 8 workers in both pools. Two years at speed 5: 1720, from the save of Russia of
17 March 1719 warmed up to 1 January 1720, and the year from 1 March 1821 on an autosave of a late
game, in observer mode. Anvil 1.13.0, `anvil-game` and Tongs in all three setups. One game per run,
interleaved, after a check that the processor was idle, 7 November 2026. Bellows 1.3.0 ran once
with its own defaults and once with the four modules that 1.4 turns on:

| Setup | Year 1720, median | Year from March 1821, median |
| --- | ---: | ---: |
| Without Bellows | 27.27 s (24.95–30.86, 6 games) | 34.05 s (33.79–36.81, 3 games) |
| With Bellows, the defaults of 1.3 | 19.41 s (18.41–20.27, 6 games) | 24.94 s (22.21–25.30, 4 games) |
| With Bellows, the defaults of 1.4 | **16.86 s** (16.16–17.35, 6 games) | **21.09 s** (19.06–22.19, 4 games) |

More than a third less in both years. The four modules together took 13.1% off 1720 and 15.4% off
1821 against the defaults of 1.3; that is for the four together and says nothing about each of
them. All modules reported 0 differences from the game's own answers. Two games of 1720 in which an
event held the game paused were thrown out. One machine and two saves: your years will differ.

### Single modules

`range_witness` alone, on the save of Russia from 17 March 1719: the year 1720 at speed 5, one game
per trial, interleaved.

| Simulated year 1720 | Without `range_witness` | With `range_witness` |
| --- | ---: | ---: |
| Trials | 27.29 / 27.58 / 27.91 s | 20.68 / 20.48 / 21.02 / 20.05 s |
| Average | 27.6 s | **20.6 s** (−25.5%) |

More than 1.4 million answers compared with the game's own code: 0 differences.

- `frame_pacing`: a year in 20.8 s instead of 23.4 s, and a key press at speed 5 handled after 21 ms
  instead of 51.5 ms (medians). On Anbennar (a save of Verne from 1444, the year 1445 at speed 5,
  four games each, interleaved, with the defaults of 1.4): 48.42 s instead of 55.42 s
  (medians, one computer, one save; see
  [A year of Anbennar at speed 5](https://github.com/happy-dwarf-team/bellows#a-year-of-anbennar-at-speed-5)).
- `modifier_merge`: the year 1720 in 19.45 s instead of 20.64 s (medians). A save from 1821 took
  26.2 s against 30.2 s, but late-game years vary by about 3 s, so that is not conclusive.
- `province_modifier_view` has not been timed alone by game year; it is part of the set above. It
  compared 12.17 million values with 0 differences.

### Saving

`save_compress`, the save of 1719 with `compress_autosave = yes`, 6 autosaves each:

| Autosave of a 62 MB gamestate | Median | Range |
| --- | ---: | --- |
| `save_compress` off | 0.873 s | 0.871–0.900 s |
| `save_compress` on | 0.831 s | 0.823–0.842 s |
| on, with `save_compress_parallel` | **0.612 s** | 0.575–0.637 s |

With `"verify"`, every member of the compressed autosaves was byte for byte what the game's code
gives (0 differences in 10 members of the save of 1719). A save written with
`save_compress_parallel` loaded in a game without Bellows, and other tools read it.

### Loading

`transfer_skip`, Anvil 1.9.0, five interleaved runs per setting, from the click on "Continue" to the
game ready:

| Save | No Bellows | `transfer_skip` off | `transfer_skip` on |
| --- | --- | --- | --- |
| 1821, text, 64.5 MB, 10 mods | 11.26 s (10.84–11.69) | 10.91 s (10.78–11.06) | **8.95 s** (8.55–9.23) |
| Vanilla 1450, text, 40.2 MB | 6.11 s (5.70–6.17) | 5.84 s (5.70–6.14) | **4.47 s** (4.35–4.99) |

Logs and the state read after the load are the same with the module on and off. Compressed saves do
not change.

`verifypath_session` and `history_add` were measured the same way, with Bellows' defaults otherwise,
4 November 2026:

| Save | Setup | Runs | Median (range) |
| --- | --- | ---: | --- |
| 1821, text, 64.5 MB, 10 mods | Bellows 1.1 defaults | 5 | 8.55 s (8.32–8.88) |
| | + `verifypath_session` | 5 | 6.79 s (6.72–7.09) |
| | + `history_add` as well | 5 | **6.27 s** (6.13–6.92) |
| Vanilla 1450, text, 40.2 MB | Bellows 1.1 defaults | 3 | 4.43 s (4.28–4.86) |
| | + both | 3 | **4.22 s** (4.15–4.40) |

Compared with the game's own code in `verify`: 0 differences in about 650,000 path answers on each
of the saves of 1719 and 1821, and in 154 million list steps on the save of 1821. Not tested: compressed saves, a
first load after a reboot, multiplayer.

The [design notes](https://github.com/happy-dwarf-team/bellows/blob/main/docs/design.md)
have every method.

## Upgrading

- **From EU4 Startup Boost:** delete the `anvil/plugins/eu4-startup-boost/` folder and install
  Bellows. It moves your settings and learned profiles on its first start.
- **From 0.7.0 or earlier:** Bellows moves `config.toml` into `settings.toml` and keeps the old file
  as `config.toml.migrated`. The `EU4SB_<NAME>` variables are no longer read; use
  `ANVIL_BELLOWS_<NAME>`.
- A `config.toml` written by 0.3.0 or earlier said `trigger_intern = "off"`, and the migration keeps
  that. Delete the line to use the default `"on"`.

## The name

Like a smith's bellows, it gets the forge hot sooner.
