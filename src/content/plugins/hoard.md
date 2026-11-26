---
name: Hoard
summary: More autosaves than the game keeps. Keeps copies of your finished saves for each campaign, and the last save of each of your recent sittings, without changing the game.
tagline: Keeps your last ten saves of each campaign and the last save of each sitting, so a broken file or a bad decision doesn't cost you the evening.
repo: https://github.com/happy-dwarf-team/hoard
status: released
gameBuilds: ['eu4-1.37.5-steam-win64', 'eu4-1.37.5.2-gog-win64']
affectsGameplay: false
order: 50
manifestPath: plugin.toml
---

The game keeps three autosaves. Hoard keeps more: your last ten for each campaign, and the last
save of each of your last five sittings. It copies finished save files in the background and does
nothing in the game.

## What you get

- **Every save copied.** Each autosave and each save you make is copied a few seconds after the
  game writes it, in under 0.1 seconds for a 62 MB late-game save in the lab.
- **One folder per campaign,** each file named with the date in the game, so the save you want is
  easy to find.
- **The last save of a sitting** (one start of the game to its exit) stays, so a long evening of
  autosaves doesn't push out last week's save.
- **Safe when the game goes down.** An autosave the game wrote just before a crash is copied at
  the next start, and a copy cut short is never mistaken for a finished one.

## Install

Hoard needs [Anvil](../../docs/install/) 1.11 or newer.
[Install the plugin](../../docs/install-plugins/) any way you like, then just play.

## Getting a save back

1. Open the panel (`Ctrl+Shift+F12`), show the **Hoard** window from its status tab and click
   **Open the folder**. Or go to `<EU4>/anvil/data/hoard/` by hand.
2. Each campaign has a folder, such as `Russia fa0394e4`. Each file starts with the date in the
   game: `1822_01_01-autosave-20261106T053012.eu4`.
3. Copy the file into `Documents/Paradox Interactive/Europa Universalis IV/save games/` and load
   it like any other save.

Hoard never puts a save back by itself.

## Settings

In the Anvil panel, or in `anvil/data/hoard/settings.toml`. All of them apply at the next copy.

| Setting | Default | What it does |
| --- | --- | --- |
| Copies per campaign | 10 | The newest copies kept for each campaign. |
| Sittings to keep | 5 | Also keeps the last save of this many sittings. 0 turns this off. |
| Disk limit (GB) | 10 | All copies together. Past it, the oldest copies of any campaign go first, never the copy just made. |
| Also copy ironman saves | off | A copy of an ironman save lets you undo a decision, so it is your call. |

Hoard also skips a copy when it would leave less than 1 GB free on the disk.

## Limitations

- **It does not change the game.** It reads save files and writes copies, and calls nothing in
  the game.
- **Ironman: off by default.** The setting turns it on. Whether that fits the achievement you are
  after stays your call: the game knows nothing about it either way.
- **Multiplayer: not tested.** The host's `mp_autosave.eu4` is copied like any autosave, and Hoard
  does nothing in the game, so it cannot put a game out of sync. No multiplayer game ran with it
  yet.
- **Steam Cloud.** With autosaves going to the cloud, or a save sent to the cloud by hand, the
  file never reaches `save games/`, so Hoard does not see it. Its window and the log say so.
- **It copies saves, it does not make them.** There is no save at the moment you quit unless you
  made one.
- **Very frequent autosaves can be skipped.** A save has to rest for 2 seconds. With monthly
  autosaves at speed 5 early in a campaign the next one can come sooner, so Hoard may copy only
  every few of them. Any pause lets it catch up.
- **Disk space.** A late autosave can be 60 MB or more. Compressed autosaves in the game's
  settings make each one about eight times smaller.
- **A hard disk was not tried,** only an SSD.
- EU4 1.37.5 on Steam and the GOG build 1.37.5.2.

## Troubleshooting

Each copy writes a line starting with `[hoard]` to `anvil/anvil.log`.

| What you see | Why | What to do |
| --- | --- | --- |
| No copies at all | The plugin is not loaded, or autosaves go to Steam Cloud | Open the Anvil panel: is Hoard loaded and approved? Is there a note in its window? |
| The log says `ironman, not copied` | The setting is off | Expected. |
| `not enough free disk space` | The copy would leave under 1 GB | Free some space. Hoard tries again by itself. |
| `could not write to the hoard` | The game folder is read-only or the disk is full | Check the rights on `anvil/data/hoard/`. |
| A folder called `unknown` | A save Hoard could not read, likely damaged | It is kept on purpose. It may still load. |
| A file ending in `.part` | The game went down during a copy | Harmless. The next start removes it. |

## Tested

All runs were in the lab on one machine with an NVMe SSD, on 6 and 7 November 2026. The
[game test](https://github.com/happy-dwarf-team/hoard/blob/main/docs/game-test.md) has every run.

- **Single player on Steam:** autosaves, manual and compressed saves, ironman with the setting off
  and on, three sittings in a row, a copy put back and loaded. Every copy matched its save byte
  for byte, and the game showed no save error.
- **A 62 MB late-game save:** each autosave copied in 43 to 68 ms.
- **The game killed** during a copy and right after an autosave: at the next start the unfinished
  copy was removed and the autosave copied whole.
- **With Bellows** and compressed saves: copies of 4.7 MB in 4 to 17 ms, no save error.
- **GOG build 1.37.5.2:** one shorter run, a new campaign of four months and a manual save.

Not tested: multiplayer, Steam Cloud switched on, a hard disk, a save larger than 62 MB.

## The name

A dragon's hoard, and a dwarf's. The rest of the team's tools are named after the forge (Anvil,
Bellows, Tongs, Etch). This is what the forge paid for. Hoard builds with
[zlib](https://zlib.net/) to read compressed saves.
