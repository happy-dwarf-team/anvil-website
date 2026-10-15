---
name: EU4 Startup Boost
summary: Makes Europa Universalis IV start faster without changing game files or game behaviour.
repo: https://github.com/happy-dwarf-team/eu4-startup-boost
status: in-development
gameBuilds: ['eu4-1.37.5-steam-win64']
affectsGameplay: false
order: 10
highlight:
  label: Warm start to the main menu
  before: ~31 s
  after: ~10 s
---

EU4 Startup Boost shortens the time from launching the game to the main menu. Game state,
logs and loaded content stay identical to vanilla; only the time changes.

## What it does

The plugin loads early, before the game's own code runs, and speeds up the work the game
repeats on every start:

- reads the files the game is about to need into memory on background threads,
- answers repeated "does this file exist?" checks from directory listings,
- replaces the game's memory allocator with a faster one,
- removes redundant work at the end of loading,
- after a reboot, opens the files the game will need in parallel, so the slow first
  access does not block the start.

Every module can be switched off on its own, and a module that fails turns itself off
while the game continues.

## Measurements

Measured on the development machine (EU4 1.37.5, Steam, 10 UI/graphics mods) with the
same techniques in a research build:

| Case | Vanilla | With the techniques |
| --- | ---: | ---: |
| Warm start (to the main menu) | ~31 s | ~10 s |
| First start after a reboot | ~61 s | ~15 s |

These numbers come from the research build. The plugin itself will be measured again
before its first release.

## Supported game build

EU4 1.37.5 (Steam, Windows 64-bit). On any other build Anvil skips the plugin and the
game starts normally.
