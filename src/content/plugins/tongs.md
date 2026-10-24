---
name: Tongs
summary: Control Europa Universalis IV from scripts and agents. A local command pipe that reads the state of a running game and, when you allow it, uses its keyboard and mouse and runs console commands.
tagline: 'Lets scripts and agents control a running game: read its state, take screenshots, use keyboard and mouse.'
repo: https://github.com/happy-dwarf-team/tongs
status: released
gameBuilds: ['eu4-1.37.5-steam-win64']
affectsGameplay: true
order: 20
---

Tongs lets test agents and scripts talk to a running game through a local named pipe,
instead of reading pixels from screenshots. Every command answers with the state read
from the game, so a script can check that its action took effect. Like a smith's tongs,
it holds the work from outside the forge.

## What it does

- Reads the game state: whether a game is loaded, the date, the speed and the pause.
- Times the game between two dates (`run_until`, `wait_until`), for measuring how fast
  the game runs, and reports whether and when the game was paused while waiting.
- Reports the game window, the game's worker threads and CPU masks, and writes
  screenshots of the window, also while it is covered.
- Reads the interface's widgets and the open events, and can stream notifications: state
  and date changes, events opening and closing, new `error.log` lines.
- When you allow it, presses keys, types text, moves the pointer, clicks and scrolls
  through the game's own SDL input, as a player would, and clicks widgets and event
  options by name. The game window does not need focus.
- When you allow it separately, runs console commands through the game's own code. These
  change game state.

Without console commands it never writes game state, but its keyboard and mouse input acts
on the game as a player's would, so Tongs declares that it affects gameplay.

## Safety

- **Off by default.** The pipe opens only with `enabled = true` in
  `anvil/data/tongs/settings.toml`. The keyboard and mouse commands also need
  `input = true`, and console commands `game_calls = true`.
- **Local only.** Only programs of the Windows user running the game can connect; remote
  clients are rejected and there is no network listener.
- **Changes to the game code.** With `enabled = true`, Tongs adds a mid hook that only
  counts the frames drawn inside a game update. Keys, text and mouse buttons go into the
  game's SDL event queue. With `input = true` it also hooks the interface's cursor query,
  so the game sees the pointer at the point set by the mouse commands; the real cursor
  does not move, and moving the real mouse hands the pointer back. Every game address it
  uses is declared in its `symbols.toml`, which Anvil checks against `eu4.exe` before
  loading it.
- **Console commands.** With `game_calls = true`, `console` runs the game's own console
  commands, which change the simulation. Some commands are always refused
  (`enable_all_commands`, the achievement and social commands), other dangerous ones
  unless `console_allow` lists them. Every call is logged and counted, so a measurement
  can reject a run with console commands in it.
- **Ironman and multiplayer.** Tongs affects gameplay, so in an ironman or multiplayer game
  Anvil suspends it: its hooks are taken out, input commands and console commands answer
  with an error, reads go on. You can allow it there in `anvil/anvil.toml`
  (`allow_ironman = ["tongs"]`, `allow_multiplayer = ["tongs"]`); console commands then
  also need Tongs' own `game_calls_ironman` or `game_calls_multiplayer`.
- Screenshots are written only to `anvil/data/tongs/screenshots/` (the newest 100 are
  kept).

## Commands

The pipe is `\\.\pipe\tongs`. A request is one line of text; the answer is one JSON object
on one line. Up to 8 clients can be connected at once, so one can wait in `run_until`
while another reads `state` or sends `cancel`.

| Command | Answer |
| --- | --- |
| `ping` | plugin version and game process id |
| `state` | whether a game is loaded; then the date, speed (1–5 as in the interface) and pause |
| `window` | size and position of the game window, focus, DPI |
| `threads` | worker threads in the game's two pools, CPU masks and priority of the main thread |
| `screenshot [NAME]` | writes a PNG of the game window and answers with its path |
| `frames` | frames per second of the game's main loop |
| `ui find SEL`, `ui tree [SEL]` | widgets of the interface, by their names in the game's `.gui` files |
| `event list` | the open events and their options |
| `wait_until DATE [timeout=S] [max_pause=S]` | waits, without touching the game, until the date is reached; answers with the timing |
| `cancel` | ends every `wait_until` / `run_until` in progress |
| `subscribe KINDS` | turns the connection into a stream of notifications |
| `help` | the commands, whether input commands are enabled and whether Anvil suspended Tongs |

With `input = true`, also:

| Command | What it does |
| --- | --- |
| `pause`, `resume` | press Space when needed and wait until the game is paused or running |
| `speed N` | presses keypad `+` / `-` until the speed is `N` (1–5); works while paused |
| `run_until DATE [speed=N] [timeout=S] [max_pause=S]` | sets the speed, resumes, waits for the date and pauses again |
| `key NAME` | presses one key (letters, digits, F-keys, arrows, Space, Esc, the console key, …) |
| `text STRING` | types into the focused text field |
| `move X Y`, `click X Y`, `scroll STEPS` | point, click (left, right, middle, double) and turn the wheel at window coordinates |
| `release` | hands the pointer back to the real mouse |
| `ui click SEL` | clicks the one widget the selector matches, after checking that nothing covers it |
| `event choose N` | chooses an option of an open event |

With `game_calls = true`, also `console LINE`, which runs one console command in the game
and **changes game state**.

`wait_until` and `run_until` wait at most 1 hour by default; `timeout=S` sets the limit,
up to 14 400 s. With `max_pause=S` (since 0.3.0) the wait ends with an error once the game has stayed
paused for `S` seconds, for example on an event with a choice, instead of running into the
timeout. Answers report `paused_ms` and, after a pause, `paused_date`, so a measurement
with a pause in it can be rejected.

Input commands answer once the game has reacted, or with an error after 10 s, and always
include the state. The full list of keys and answer fields is in the
[command reference](https://github.com/happy-dwarf-team/tongs/blob/main/docs/commands.md).

```powershell
.\tongs.ps1 state
# {"ok":true,"in_game":true,"date":"1719.3.17","speed":2,"paused":true,...}
.\tongs.ps1 'run_until 1719.6.1 speed=5'
# {"ok":true,"command":"run_until","reached":true,"game_days":76.000,"days_per_second":12.352,"wall_ms":6153,...}
```

## Clients

The repository has two small clients in
[`scripts/`](https://github.com/happy-dwarf-team/tongs/tree/main/scripts):

- `tongs.ps1` (PowerShell): sends one or more commands over one connection and prints one
  answer line per command.
- `tongs.py` (Python 3, standard library only): the same from the command line, or as a
  module:

  ```python
  from tongs import Tongs
  with Tongs() as game:
      result = game.call("run_until 1720.1.1 speed=5", check=True)
      print(result["days_per_second"])
  ```

Any program that can open a named pipe can be a client.

## Install

1. Install [Anvil](../../docs/install/) 1.0.0 or newer, with its standard plugin
   `anvil-game`, which is part of Anvil's package.
2. Download `tongs-windows-x64.zip` from the
   [latest release](https://github.com/happy-dwarf-team/tongs/releases/latest) and extract
   it into `<EU4>/anvil/plugins/`; it contains the `tongs` folder. `SHA256SUMS.txt` next
   to the archive holds its checksum.
3. Turn it on in `anvil/data/tongs/settings.toml`, one `name = value` per line:
   `enabled = true`, and `input = true` if scripts should use the keyboard and mouse. Then
   start the game. A `config.toml` from Tongs 0.12 or older is moved into this file on the
   first start.

Delete the `tongs` folder to uninstall.

## Tested

Checked in the game on EU4 1.37.5 (Steam) with Anvil 0.2.0, on one development machine
with a loaded save. A development build of Tongs for plugin API 2 then ran in the game with
an Anvil 1.0 release candidate (`ping`, `state`, `threads`, `frames`, `run_until`,
`ui find`, `ui click` and `screenshot`); the 0.13.0 release itself has not been run in the
game yet. `max_pause` was checked in a lab measurement series: a run that an
event paused ended after 5 s of pause instead of waiting for its 300 s timeout. Not
verified yet: input in the main menu and in event pop-ups, keyboard layouts other than US,
clicks on the map (only interface buttons were tried) and dragging, for which there is no
command yet. Details are in the [design
notes](https://github.com/happy-dwarf-team/tongs/blob/main/docs/design.md).
