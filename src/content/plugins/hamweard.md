---
name: Hamweard
summary: Back to the main menu without restarting the game. Exit to Menu in a campaign and Back on the country selection screen return to the main menu in the same process. A port of EU4 Menu Patch by VulonLok.
tagline: Takes you from a campaign back to the main menu in seconds, without restarting the game.
repo: https://github.com/happy-dwarf-team/hamweard
status: released
gameBuilds: ['eu4-1.37.5-steam-win64', 'eu4-1.37.5.2-gog-win64', 'eu4-1.37.5.0-gog-win64']
affectsGameplay: false
order: 30
workshop: '3832650792'
manifestPath: plugin.toml
---

Without Hamweard, **Exit to Menu** in a campaign and **Back** on the country selection screen close
Europa Universalis IV and start it again. With it, both take you back to the main menu without a
restart.

## What you get

- **Exit to Menu** returns to the main menu in about 4 seconds in the lab: click it, confirm, then
  click **Quit** on the end-of-game screen.
- **Back** on the country selection screen does the same.
- **Continue game** points at your latest save, as after a restart.

## Install

Hamweard needs [Anvil](../../docs/install/) 1.9 or newer. Hamweard 1.0 needed 1.5.

1. If you use the original EU4 Menu Patch, remove its DLL first. Both change the same code.
2. [Install the plugin](../../docs/install-plugins/) any way you like.

## Settings

Hamweard has no settings of its own. It works in ironman with nothing to allow. An
`allow_ironman` entry for it in [`anvil/anvil.toml`](../../docs/using-anvil/#anvils-settings-file)
no longer does anything.

## Limitations

- **A return does not change the simulation.** The next campaign starts in the same process
  instead of a fresh one, and in the lab a save made after three returns matched one from a fresh
  process, apart from the campaign id and the random seed. A new campaign after a return matched a
  fresh one with Anbennar too, and after a save with canals. That is a comparison of the campaigns
  and mods tested, not a proof for every mod. With Anbennar a campaign after a return can drift
  from a fresh one after some days: in the lab, after 2 returns, it differed after 10 days, first
  in its rebel factions, with Hamweard 1.3.1 as with 1.3.2. The cause is not known yet. Without
  mods a campaign after 5 returns was still the same after 30 days.
- **Canals.** A canal changes the map itself, and the map outlives the campaign. The plugin copies
  the map before the first canal and puts it back on a return. If it cannot be put back, that
  return restarts the game, as it does without the plugin.
- **Random New World restarts.** After a Random New World map, from a new campaign or a loaded
  save, Exit to Menu and Back restart the game, as they do without the plugin. The game's own
  restore of the map misses part of it: in the lab Tortuga was no longer in the Caribbean colonial
  region, and the next campaign's missions differed.
- **Multiplayer: no return, and one test with a second player.** Exit to Menu and Back restart the game in
  any multiplayer session, as they do without the plugin. The plugin checks that itself and stays
  loaded. Tested on Steam with a host and a client, both with Hamweard: the game's usual
  out-of-sync check, which compares the random-number count and seed, reported nothing in about
  four months of game, a client who left and came back into the running campaign included. The
  test did not use `-hardoos`, which compares all 140 checksums of the game state.
- **Multiplayer after a campaign needs a restart.** A process that has played is not meant to go
  on to multiplayer. After a return the Multiplayer button does nothing, and its tooltip says why.
  Restart the game once.
- **Ironman: on, with nothing to allow.** It works on Steam and GOG, the save on leaving included,
  and a new ironman campaign after a return says achievements can be earned. One achievement was
  earned for real on Steam in a campaign after a return, so the proof is one case and the game's own state. An ironman
  save does not update Continue game, so load it from the Single Player list.
- **Mods: tested, not all of them.** The plugin changes no game files, so the checksum stays the
  same. Anbennar with Proper 2K UI and a playset of ten interface and graphics mods ran without
  trouble. A mod that does something unusual when a campaign ends may behave differently.
- **Memory still grows with each return, more with a big mod.** The game's reset does not free
  all it read. From 1.3.1 Hamweard frees what the lab found in the history and the country files,
  which with Anbennar was about 60 MB per **Back** and per campaign. What stays is mostly the last
  campaign's world and interface: in the lab a **Back** left about 5 MB with Anbennar and 8 MB
  without mods, and in a row of returns the game grew by about 45 MB per return with Anbennar and
  20 MB without mods. A return took as long after 40 in a row as at the start. When less than 1 GB
  of the system's commit limit is left, a return restarts the game instead.
- **A long campaign kept memory it no longer used, until 1.3.2.** Each time the game recalculated
  an overlord's modifiers it made one per subject and never freed the old ones: about 2 MB a year
  without mods and 4.8 MB with Anbennar, in the lab's heap trace. From 1.3.2 Hamweard frees them,
  with or without a return; a year of the base game then lost 0.16 MB.
- **Not seen in a test:** some message popups (an heir to name, a new colonial nation) and the
  window of a lost game.
- EU4 1.37.5 on Steam and the GOG builds 1.37.5.2 and 1.37.5.0 (from Hamweard 1.3). On any other
  build Anvil does not load the plugin.

A game bug to know about: click a save in the Single Player list and start a new campaign from the
same screen, and all province triggered modifiers are gone, with or without Hamweard. Press **Back**
first and the new campaign is clean.

## Troubleshooting

Every return writes lines that start with `[hamweard]` to `anvil/anvil.log`. The log says when the
plugin chose a restart, and why.

| What you see | Why | What to do |
| --- | --- | --- |
| Exit to Menu or Back restarts the game | The plugin is not loaded | Check in the Anvil panel that Hamweard is loaded and approved. |
| The same, and the log says `the map could not be put back` | A canal changed the map and the saved copy no longer fits it | Nothing to fix: a campaign does not start on the changed map, so the plugin restarts the game. |
| The same, and the log says `multiplayer` | A multiplayer session ends with a restart | Expected. |
| The same, and the log says `Random New World` | Such a map changes more than a return can put back | Expected. |
| The same, and the log says `too little memory` | Less than 1 GB of the system's commit limit was left | Expected: the restart gives the memory back. |
| Anvil refuses to load Hamweard | Another game build, or the original EU4 Menu Patch changed the same code | Use a supported build, and remove the Menu Patch DLL. |

A crash or anything odd after a return: open an
[issue](https://github.com/happy-dwarf-team/hamweard/issues) with `anvil.log` and `error.log` from
that sitting.

## Tested

All runs were in the lab on one development machine. The
[README](https://github.com/happy-dwarf-team/hamweard#what-was-tested) has every run.

- **Single player on Steam** (1 and 2 November 2026): 12 campaigns in two processes, up to three
  years long, with wars, battles and peace deals. No crash, and each return took 3.5 to 4 seconds.
- **GOG build 1.37.5.2** (3 November 2026): five campaigns in one process, seven returns in 4.0 to
  4.5 seconds each, no crash.
- **Hard return test** (6 November 2026): 40 returns in one process on Steam, 16 on GOG, 7 with
  Anbennar, 3 in ironman with Anbennar, 4 with Warhammer Fantasy Universalis, and the end of the
  game in 1821 from a 64.5 MB save. A new campaign after them matched a fresh one, apart from the
  campaign id. The same test found the Random New World and custom nation bugs, both fixed.
- **Hamweard 1.1.0 from the release** (4 November 2026): 66 returns in eight game runs, no crash.
  They covered new games, saves and loads after a return, changing country, naval battles, the
  Game Browser, ironman, on Steam and GOG, and Anbennar (returns in 5.5 to 6.6 seconds).
- **The same seed** gave the same new campaign byte by byte, the campaign id apart, in a fresh
  process and after returns, without Anbennar (4 November 2026), and with Anbennar and after a save
  with canals, on Steam and GOG (5 November 2026).
- **The achievement list** (4 November 2026): 27 returns in one process, no restart and no crash.
  After a return the list stayed empty. An ironman save loaded afterwards had its 52 achievements,
  and a new ironman campaign said achievements can be earned.
- **Ironman by default** (5 November 2026): no `anvil.toml` entry, no warning, achievements can be
  earned and a return needs no restart, on Steam and GOG. On GOG a month of play after a return ran
  the game's achievement check on all 175 achievements, as in a fresh process.

- **The memory fixes of 1.3.1** (9 November 2026): with a heap tracer, and 33 returns in a row on
  Steam with Anbennar and 33 on GOG 1.37.5.2 without mods (22 of each before the fix for loaded
  saves), with new and loaded campaigns. No crash, and the save of a new campaign after the returns
  was the same as one from a fresh start with the same seed.
- **The long-campaign fix of 1.3.2** (10 November 2026): a heap trace of one year of the base game
  and of Anbennar, and saves compared line by line with saves made without Hamweard, at day 0 and
  after 10 and 30 days, on Steam. No crash, and `error.log` had the same lines as without it.

Before the plugin destroyed the windows of the last campaign, the game crashed in the second to
fourth campaign of such a series.

## Credits and the name

Hamweard is a port of [EU4 Menu Patch](https://github.com/YozoraTempest/EU4-Menu-Patch) by VulonLok
(MIT), which needs a separate EU4DLL-style loader. The research is the original's. The port runs on
Anvil and also destroys the windows each campaign leaves in the interface, which made a later
campaign crash in the lab.

*Hāmweard* is Old English for "homeward": back from a campaign to the main menu as if back home.
