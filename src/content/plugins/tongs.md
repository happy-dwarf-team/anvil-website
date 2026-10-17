---
name: Tongs
summary: Control Europa Universalis IV from scripts and agents. A local command pipe that reads the state of a running game and, when you allow it, uses its keyboard and mouse.
repo: https://github.com/happy-dwarf-team/tongs
status: released
gameBuilds: ['eu4-1.37.5-steam-win64']
affectsGameplay: false
order: 20
---

Tongs lets test agents and scripts talk to a running game through a local named pipe,
instead of reading pixels from screenshots. Every command answers with the state read
from the game, so a script can check that its action took effect. Like a smith's tongs,
it holds the work from outside the forge.

Download the latest release from the
[releases page](https://github.com/happy-dwarf-team/tongs/releases).

## What it does

- Reads the game state: whether a game is loaded, the date, the speed and the pause.
- Times the game between two dates (`run_until`, `wait_until`), for measuring how fast
  the game runs, and reports whether the game was paused while waiting.
- Reports the game window, the game's worker threads and CPU masks, and writes
  screenshots of the window, also while it is covered.
- When you allow it, presses keys, types text, moves the pointer, clicks and scrolls
  through the game's own SDL input, as a player would. The game window does not need
  focus.

It never writes game state.

## Safety

- **Off by default.** The pipe opens only with `enabled = true` in
  `anvil/data/tongs/config.toml`, which the plugin creates on its first start. The
  keyboard and mouse commands also need `input = true`.
- **Local only.** Only programs of the Windows user running the game can connect; remote
  clients are rejected and there is no network listener.
- **One hook, only with input.** Keys, text and mouse buttons go into the game's SDL event
  queue. With `input = true` the plugin hooks one function, the interface's cursor query,
  so the game sees the pointer at the point set by the mouse commands; the real cursor
  does not move, and moving the real mouse hands the pointer back. Without
  `input = true`, no game code is patched.
- Screenshots are written only to `anvil/data/tongs/screenshots/` (the newest 100 are
  kept).

## Commands

The pipe is `\\.\pipe\tongs`. A request is one line of text; the answer is one JSON object
on one line. Up to 4 clients can be connected at once, so one can wait in `run_until`
while another reads `state` or sends `cancel`.

| Command | Answer |
| --- | --- |
| `ping` | plugin version and game process id |
| `state` | whether a game is loaded; then the date, speed (1–5 as in the interface) and pause |
| `window` | size and position of the game window, focus, DPI |
| `threads` | worker threads in the game's two pools, CPU masks and priority of the main thread |
| `screenshot [NAME]` | writes a PNG of the game window and answers with its path |
| `wait_until DATE` | waits, without touching the game, until the date is reached; answers with the timing |
| `cancel` | ends every `wait_until` / `run_until` in progress |
| `help` | the commands and whether input commands are enabled |

With `input = true`, also:

| Command | What it does |
| --- | --- |
| `pause`, `resume` | press Space when needed and wait until the game is paused or running |
| `speed N` | presses keypad `+` / `-` until the speed is `N` (1–5); works while paused |
| `run_until DATE [speed=N]` | sets the speed, resumes, waits for the date and pauses again |
| `key NAME` | presses one key (letters, digits, F-keys, arrows, Space, Esc, the console key, …) |
| `text STRING` | types into the focused text field |
| `move X Y`, `click X Y`, `scroll STEPS` | point, click (left, right, middle, double) and turn the wheel at window coordinates |
| `release` | hands the pointer back to the real mouse |

Input commands answer once the game has reacted, or with an error after 10 s, and always
include the state. The full list of keys and answer fields is in the
[README](https://github.com/happy-dwarf-team/tongs#commands).

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

1. Install [Anvil](../../docs/install/) 0.2.0 or newer.
2. Download `tongs-windows-x64.zip` from the
   [latest release](https://github.com/happy-dwarf-team/tongs/releases/latest) and extract
   it into `<EU4>/anvil/plugins/`; it contains the `tongs` folder. `SHA256SUMS.txt` next
   to the archive holds its checksum.
3. Start the game once, so the plugin creates `anvil/data/tongs/config.toml`. Set
   `enabled = true`, and `input = true` if scripts should use the keyboard and mouse, then
   start the game again.

Delete the `tongs` folder to uninstall.

## Tested

Checked in the game on EU4 1.37.5 (Steam) with Anvil 0.2.0, on one development machine
with a loaded save. Not verified yet: input in the main menu and in event pop-ups,
keyboard layouts other than US, clicks on the map (only interface buttons were tried) and
dragging, for which there is no command yet. Details are in the
[design notes](https://github.com/happy-dwarf-team/tongs/blob/main/docs/design.md).

## Supported game build

EU4 1.37.5 (Steam, Windows 64-bit). On any other build Anvil skips the plugin and the
game starts normally.
