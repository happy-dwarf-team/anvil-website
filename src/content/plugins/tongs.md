---
name: Tongs
summary: Control Europa Universalis IV from scripts and agents. A local command pipe that reads the state of a running game and, when you allow it, uses its keyboard and mouse and runs console commands.
tagline: 'Lets scripts and agents control a running game: read its state, take screenshots, use keyboard and mouse.'
repo: https://github.com/happy-dwarf-team/tongs
status: released
gameBuilds: ['eu4-1.37.5-steam-win64']
affectsGameplay: true
order: 20
workshop: '3826695093'
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
- Offers the widget tree to other Anvil plugins in the game's process through the service
  `tongs.ui` (since 0.17.0; see [For other plugins](#for-other-plugins-tongsui)).
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
  `input = true`, and console commands `game_calls = true`. The read-only service
  `tongs.ui` for other plugins is registered also with `enabled = false`.
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

## MCP server

For agents such as Claude Code, the repository's
[`mcp/`](https://github.com/happy-dwarf-team/tongs/blob/main/mcp/README.md) folder has an
[MCP](https://modelcontextprotocol.io) server with one typed tool per command family
(`tongs_state`, `tongs_run_until`, `tongs_ui_click`, `tongs_screenshot` and others). It
speaks MCP over stdio only, runs on the same Windows machine as the game, and adds nothing
the pipe does not have: every tool sends one Tongs command and returns the plugin's answer
unchanged, and Tongs' own settings still decide what is allowed.

It needs [uv](https://docs.astral.sh/uv/) (or Python 3.11 or newer with pip) and a clone of
the repository:

```powershell
git clone https://github.com/happy-dwarf-team/tongs
cd tongs\mcp
uv sync --frozen
claude mcp add --transport stdio --scope user tongs -- uv run --frozen --directory C:\path\to\tongs\mcp tongs-mcp
```

Other MCP clients take the same command. Long waits report the game days done as MCP
progress, so a `run_until` over many game years stays within the client's timeouts. Tool
annotations say which tools only read and which act as the player or change game state. The
[MCP README](https://github.com/happy-dwarf-team/tongs/blob/main/mcp/README.md) has the tool
list, the timeouts of common clients and its live checks.

## For other plugins: `tongs.ui`

Since 0.17.0, another Anvil plugin in the game's process can read the widget tree without
the pipe, through the service `tongs.ui` version 1:

- `find` takes a selector, with the same syntax as the pipe's `ui find`, and visits the
  matching widgets and their ancestors: the same matches in the same order, with the same
  paths, rectangles and text.
- `hovered` visits the widget under the game's pointer and its ancestors. Without widget
  paths it reads only that chain, cheap enough to call every frame; with paths
  (`TONGS_UI_PATHS`) it reads the whole tree, as `find` does.
- Each widget carries `definition_file`, the game path of the `.gui` file it was defined in,
  such as `interface/topbar.gui` (NULL for a stale widget, built from a definition that a
  reload freed).

The contract is the plain C11 header
[`include/tongs/tongs_ui.h`](https://github.com/happy-dwarf-team/tongs/blob/main/include/tongs/tongs_ui.h),
which the release zip also carries in `tongs/include/`. Vendor it, declare a dependency on
`tongs`, look the service up with `get_service` and call it on the game's main thread, from a
handler of `anvil-game.frame`; a call from another thread answers `ANVIL_ERROR_WRONG_PHASE`
and reads nothing. Tongs registers the service on every load, also with `enabled = false`
(no pipe then). The service only reads: it sends no input and makes no game calls, so
`input` and `game_calls` do not apply, and Anvil's suspension in ironman or multiplayer
does not stop it. See
[For other plugins: `tongs.ui`](https://github.com/happy-dwarf-team/tongs#for-other-plugins-tongsui)
in the Tongs README and the
[design notes](https://github.com/happy-dwarf-team/tongs/blob/main/docs/design.md#the-tongsui-service-0170).

## Install

Tongs needs [Anvil](../../docs/install/) 1.0.0 or newer, with its standard plugin
`anvil-game`, which is part of Anvil's package. Get the plugin in one of two ways:

- **From the Steam Workshop** (Anvil 1.3 or newer): subscribe to
  [Tongs on the Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3826695093)
  and enable it in your playset. Anvil loads it once you approve that version in its panel
  (`Ctrl+Shift+F12`, **Mods**) or on the **Mods** tab of Anvil Manager, and asks again after
  every update; see [Plugins from mods](../../docs/plugins-from-mods/). The item is unlisted:
  it does not show up in Workshop searches, only through this link.
- **From the release zip:** download `tongs-windows-x64.zip` with the button above, or from
  the [latest release](https://github.com/happy-dwarf-team/tongs/releases/latest)
  (`SHA256SUMS.txt` next to it holds its checksum), and install it on the **Plugins** tab of
  Anvil Manager, or extract it into `<EU4>/anvil/plugins/`; it contains the `tongs` folder.

Then turn it on: in `anvil/data/tongs/settings.toml`, one `name = value` per line, set
`enabled = true`, and `input = true` if scripts should use the keyboard and mouse, or use the
**Settings** tab of Anvil Manager. Start the game. `ANVIL_TONGS_<NAME>` environment variables
(for example `ANVIL_TONGS_ENABLED=true`) override a value for one start. A `config.toml` from
Tongs 0.12 or older is moved into `settings.toml` on the first start.

Unsubscribe from the mod, or remove the plugin on the Manager's **Plugins** tab (or delete the
`tongs` folder), to uninstall.

## Tested

Source: the live checks in Tongs'
[design notes](https://github.com/happy-dwarf-team/tongs/blob/main/docs/design.md) and its
[MCP README](https://github.com/happy-dwarf-team/tongs/blob/main/mcp/README.md). All ran in
the lab on EU4 1.37.5 (Steam) with the original `eu4.exe`, on one development machine, with
development builds of Tongs from the branch of each change:

- **Plugin API 2:** with Anvil 1.0.0 and `anvil-game` (20 and 21 October 2026), Tongs
  loaded with its game addresses verified, read the interface's widget tree before and after
  reloading interface files with `console reload`, and ran console commands; the game did not
  crash, and the save was unchanged afterwards.
- **Anvil 1.3.0** (25 October 2026): widget trees in the lobby, in a battle pop-up and in
  hidden grid boxes, `ui click` in the lobby, `click` on country shields, `event choose` and
  the `chosen` notifications for events chosen by Tongs, by the player and by the game's
  deadline.
- **Agents** (19 October 2026, before plugin API 2): a Claude Code session drove the game through the MCP server with dozens of
  `ui click`s, keys, text, speed changes, `run_until`, `event choose` and `console`; input
  in the main menu and with event pop-ups works.
- `max_pause` was checked in a lab measurement series: a run that an event paused ended
  after 5 s of pause instead of waiting for its 300 s timeout.
- **`tongs.ui`** (27 October 2026, with Anvil 1.5.2,
  [tongs#87](https://github.com/happy-dwarf-team/tongs/issues/87)): a test consumer plugin
  in the lab's Russia save, paused, about 16 200 widgets. `find` gave the same matches as the
  pipe's `ui find` in the same frame (count, order, paths, rectangles, text and flags; the
  first 5 000 where there were more), in the main menu, in the game and after
  `console reload outliner.gui`. The cheap `hovered` chain over buttons, list rows and a
  scroll bar equalled the chain read from the whole tree. Calls from another thread answered
  `ANVIL_ERROR_WRONG_PHASE`; with `enabled = false` the pipe did not exist and the service
  answered. Cost per call: the cheap `hovered` a median of 48 µs (p99 116 µs), and
  3.2–3.6 ms once on the first call and after a reload; `find` over the visible widgets of
  the whole tree 12–14 ms.

Not verified yet: the release files of 0.16.0 and 0.17.0 and the Workshop mod in the game
(the checks above used builds of the branches), suspension in a live ironman or multiplayer
game, input in text fields, keyboard layouts other than US, right, middle and double clicks,
clicks on the map (only interface widgets were tried), dragging, for which there is no
command yet, and a minimized game window.
