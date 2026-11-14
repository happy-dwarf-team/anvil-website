---
name: Tongs
summary: Control Europa Universalis IV from scripts and agents. A local command pipe that reads the state of a running game and, when you allow it, uses its keyboard and mouse and runs console commands.
tagline: 'Lets scripts and agents control a running game: read its state, take screenshots, use keyboard and mouse.'
repo: https://github.com/happy-dwarf-team/tongs
status: released
gameBuilds: ['eu4-1.37.5-steam-win64', 'eu4-1.37.5.2-gog-win64', 'eu4-1.37.5.0-gog-win64']
affectsGameplay: true
order: 20
workshop: '3826695093'
---

Tongs lets scripts and AI agents control a running game through a local named pipe, instead of
reading pixels from screenshots. Every command answers with the state read from the game, so a
script can check that its action worked. It is a tool for testing and measuring. You do not need
it to play.

## What you get

- **Read the game:** the date, speed and pause, the window, the worker threads, the interface's
  widgets, open events, provinces, countries and a country's armies and navies.
- **Take screenshots** of the window, also while it is covered.
- **Time the game** between two dates, to measure how fast it runs.
- **Use the keyboard and mouse** as a player would, and click widgets and event options by name.
  The window does not need focus. This is off until you allow it.
- **Drill, split and merge units** as the unit panel's buttons do, from Tongs 0.31 with Anvil
  1.17 or newer. These are inputs too, off until you allow them.
- **Run console commands and load saves.** These change the game, and they are off until you
  allow them separately.
- **An MCP server** for agents such as Claude Code.

## Install

Tongs 0.35 needs [Anvil](../../docs/install/) 1.23 or newer (Tongs 0.34 and older: 1.7 or newer),
and the standard plugin `anvil-game`, which comes with it. Tongs 0.25 and older ran on Steam only. The unit reads need Anvil 1.15 and the unit
commands Anvil 1.17; with an older Anvil they answer `unavailable` and the rest works.

1. [Install the plugin](../../docs/install-plugins/) any way you like.
2. Turn it on: set `enabled = true` under [Settings](#settings). It does nothing until you do.
3. Start the game and send a command with one of the [clients](#clients):

```powershell
.\tongs.ps1 state
# {"ok":true,"in_game":true,"date":"1719.3.17","speed":2,"paused":true,...}
.\tongs.ps1 'run_until 1719.6.1 speed=5'
# {"ok":true,"command":"run_until","reached":true,"game_days":76.000,"days_per_second":12.352,"wall_ms":6153,...}
```

## Settings

Everything but the journal is off by default. Change a setting on the **Settings** tab of Anvil Manager, or in
`anvil/data/tongs/settings.toml`, one `name = value` per line.

| Setting | What it allows |
| --- | --- |
| `enabled` | Opens the pipe, so that scripts can read the game |
| `input` | Keyboard and mouse commands, unit commands, and moving the camera and opening province views |
| `console_allow` | Under **Game calls**: danger commands that game calls may run, for example `"leak"` |
| `journal` | On by default: writes every command sent on the pipe, with its outcome and the game date, to `anvil/data/tongs/journal/` |

Settings apply at the next start. For one start, a variable such as `ANVIL_TONGS_ENABLED=true`
overrides a value. A `config.toml` from Tongs 0.12 or older is moved into `settings.toml` on the
first start.

Console commands and loading saves are the module **Game calls**, off by default. They **change
game state**. Turn it on under Tongs in Anvil Manager or the Anvil panel, or with
`enabled_modules = ["tongs.game_calls"]` in `anvil/anvil.toml`. Its ironman and multiplayer switches
are Anvil's own opt-ins for it. Tongs 0.34 and older had the settings `game_calls`,
`game_calls_ironman` and `game_calls_multiplayer` instead; the first start with Tongs 0.35 moves
your choices to the module, so game calls stay as you had them.

## Limitations

- **Marked as changing gameplay.** Keyboard and mouse input acts on the game as a player's would.
  So in an ironman or multiplayer game Anvil suspends Tongs: input and console commands answer
  with an error, and reads go on. You can [allow it there](../../docs/multiplayer-ironman/);
  console commands then also need the Game calls module allowed there
  (`allow_ironman = ["tongs", "tongs.game_calls"]`, likewise for multiplayer). From Tongs 0.35
  `save load` loads an ironman save only from an ironman game that allows game calls.
- **Not verified yet:** suspension in a live multiplayer game, pause and speed with a second
  player, keyboard layouts with an IME, the game's copy and paste keys, and the Workshop mod in
  the game. Text fields, the French, German and Polish layouts, clicks on the map and a minimized
  window were tried in the game.
- **Text fields are the game's own.** Home and End select to the start or the end of the text;
  the game has no Shift+arrow selection and no Ctrl+A.
- **A minimized window** takes no keys or clicks: those commands answer an error and send
  nothing. Reads, the speed buttons and opening a province go on.
- **No dragging.** There is no command for it yet.
- After a load from the in-game menu, that menu stays open and the speed keys do nothing until
  it is closed.
- Waits end after 1 hour by default. `timeout=S` raises that to at most 14,400 s.

## Safety

- **Local only.** Only programs of the Windows user running the game can connect. There is no
  network listener.
- **Without the Game calls module it never writes game state.** Keys, text and mouse buttons go into the
  game's own SDL input queue, as a player's would.
- **Console commands are limited.** `enable_all_commands` and the achievement and social commands
  are always refused, other dangerous ones unless `console_allow` lists them. Every call is logged
  and counted, so a measurement can reject a run with one in it.
- **Screenshots** are written only to `anvil/data/tongs/screenshots/`. The newest 100 are kept.
- **The command journal** is written only to `anvil/data/tongs/journal/`, a file per game start,
  the newest 20 kept. Nothing of it goes into the game, its saves or multiplayer.
- **Changes to game code.** With `enabled = true`, Tongs adds a hook that only counts the frames
  drawn inside a game update. With `input = true` it also hooks the interface's cursor query, so
  the game sees the pointer where the mouse commands set it; the real cursor does not move.
  Anvil checks every address Tongs uses before it loads the plugin.

## Commands

The pipe is `\\.\pipe\tongs`. A request is one line of text, and the answer is one JSON object on
one line. Up to 8 clients can connect at once, so one can wait in `run_until` while another reads
`state` or sends `cancel`.

| Needs | Commands |
| --- | --- |
| `enabled` | `ping`, `state`, `window`, `threads`, `screenshot`, `frames`, `ui find`, `ui tree`, `event list`, `province`, `country`, `player`, `selection`, `units`, `cursor`, `journal`, `wait_until`, `cancel`, `subscribe`, `unsubscribe`, `help` |
| `input` | `pause`, `resume`, `speed`, `run_until`, `key`, `text`, `move`, `click`, `scroll`, `release`, `ui click`, `event choose`, `unit drill`, `unit split`, `unit merge`, `province open`, `province goto`, `map_mode` |
| the Game calls module | `console`, `save load` |

`wait_until` and `run_until` count the input and console commands of every client meanwhile, and
report pauses, so a measurement can reject a touched run. `max_pause=S` ends a wait that the game
keeps paused, for example on an event with a choice. `save load` discards the running game
without saving. Since 0.32.0 it also loads from the main menu the game starts to, through the
menu's own Continue, so a test can run several saves on one start of the game.

`units` lists the armies and navies of the player's country, or of another country by tag, with
their ids. `unit drill start|stop`, `unit split` and `unit merge` take those ids, or `selected` for
what the player has selected, and post the command the unit panel's button posts, through Anvil's
`anvil-game` plugin. The answer says how many commands were posted; the game checks each one again
when it runs it, so read `units` a moment later to see the result. A drill while the country is at
war, for example, is posted and then dropped, because the game does not offer drilling during a war.

`cursor` says what the game has under its pointer: the widget, the province and the army or navy
there, read from the game itself rather than from a screenshot. `key` holds Shift, Ctrl and Alt
too (`key shift+left`, `key ctrl+a`). `journal` says where this start's command journal is: one
line per command, so a test can be followed and repeated.

From Tongs 0.33 with Anvil 1.20 or newer, `country` and `province` also list the country's or
province's flags, with the date each was set, and its variables, as the game's triggers see them.
Tongs reads them through Anvil's `anvil-game` plugin. With an older Anvil the answer says the lists
are missing instead of showing them empty.

From Tongs 0.34 with Anvil 1.21 or newer, `country` also lists the events waiting for that country's
choice: each event's id (the one `event choose` and the event window use), key, title key, province,
number of options, whether it is hidden, and the date the game chooses for the player.

The [command reference](https://github.com/happy-dwarf-team/tongs/blob/main/docs/commands.md) has
every command, key and answer field.

## Clients

Any program that can open a named pipe can be a client. The repository has two small ones in
[`scripts/`](https://github.com/happy-dwarf-team/tongs/tree/main/scripts):

- `tongs.ps1` (PowerShell) sends commands and prints one answer line per command.
- `tongs.py` (Python 3, standard library only) works from the command line or as a module. It has
  read timeouts, cancels a wait that is interrupted, refuses answers from another game process,
  and `ready()` waits until a started or loaded game takes input:

  ```python
  import tongs
  tongs.ready(session=1, speed=5)  # after starting the game with a save
  with tongs.Tongs() as game:
      print(game.province(295)["owner"])  # the owner's tag, e.g. "RUS"
      result = game.run_until("1720.1.1")
      print(result["days_per_second"])
  ```

## MCP server

For agents such as Claude Code, the repository's
[`mcp/`](https://github.com/happy-dwarf-team/tongs/blob/main/mcp/README.md) folder has an
[MCP](https://modelcontextprotocol.io) server with typed tools, such as `tongs_state`,
`tongs_run_until` and `tongs_ui_click`. It runs on the same Windows machine as the game and adds
nothing the pipe does not have: Tongs' own settings still decide what is allowed.

It needs [uv](https://docs.astral.sh/uv/) (or Python 3.11 or newer with pip) and a clone of the
repository:

```powershell
git clone https://github.com/happy-dwarf-team/tongs
cd tongs\mcp
uv sync --frozen
claude mcp add --transport stdio --scope user tongs -- uv run --frozen --directory C:\path\to\tongs\mcp tongs-mcp
```

Other MCP clients take the same command. The
[MCP README](https://github.com/happy-dwarf-team/tongs/blob/main/mcp/README.md) lists the tools
and the timeouts of common clients.

## For other plugins

Another Anvil plugin in the game's process can use Tongs without the pipe. `tongs.ui` reads the
widget tree, and `tongs.navigation` selects a province. See
[For other plugins](https://github.com/happy-dwarf-team/tongs#for-other-plugins-tongsui) in the
README.

## Tested

All checks ran in the lab on one development machine, on EU4 1.37.5 (Steam) with the original
`eu4.exe` unless a line says otherwise. Details are in the
[design notes](https://github.com/happy-dwarf-team/tongs/blob/main/docs/design.md) and the
[MCP README](https://github.com/happy-dwarf-team/tongs/blob/main/mcp/README.md).

- **Agents:** a Claude Code session drove the game through the MCP server with dozens of clicks,
  keys, speed changes, event choices and console commands (19 October 2026).
- **Plugin API 2:** with Anvil 1.0, Tongs read the widget tree before and after reloading interface
  files, and ran console commands. The game did not crash, and the save was unchanged afterwards
  (20 and 21 October 2026).
- **Widgets and events:** widget trees in the lobby, in a battle pop-up and in hidden grid boxes;
  clicks in the lobby and on country shields; event choices (25 October 2026, Anvil 1.3).
- **`tongs.ui`:** `find` gave the same matches as the pipe's `ui find` over about 16,200 widgets.
  A cheap `hovered` call took a median of 48 µs (27 October 2026, Anvil 1.5.2,
  [tongs#87](https://github.com/happy-dwarf-team/tongs/issues/87)).
- **Sessions:** `session` counted two loads through the in-game menu, and a wait across a load
  ended with an error (28 October 2026, Anvil 1.5.2,
  [tongs#115](https://github.com/happy-dwarf-team/tongs/pull/115)).
- **`max_pause`:** a run that an event paused ended after 5 s of pause instead of waiting for its
  300 s timeout.
- **GOG build 1.37.5.2:** one game loaded a save through the interface, ran to a date and read the
  game; console commands and events were not tried there (2 November 2026).
- **Ironman:** Anvil suspended Tongs in a live ironman game and reads went on (4 November 2026,
  Tongs 0.26.0, Anvil 1.9.0).
- **Units:** in a save of Russia at war, `units` read 62 armies and navies; `unit split` and
  `unit merge` changed an army as the panel's buttons do; an unknown id, a navy for a drill and units in two provinces were refused; a posted command counted as one input of a
  wait. Drilling at peace and `selected` with a real selection were not tried in this test
  (10 November 2026, Tongs 0.31.0 before its release, Anvil 1.18.0,
  [tongs#180](https://github.com/happy-dwarf-team/tongs/pull/180)).
- **Input, round 2:** in text fields typing, Backspace, Delete, the arrows, Ctrl+Backspace and a
  click worked, and Home and End selected as the game's fields do; the German and Polish (214)
  layouts typed the same characters with `key` and `text`; on land a click selected the
  province `cursor` named at that point, also right after zooming, and `cursor` named an army
  that a click then selected; with the window minimized every command answered within 0.2 s.
  Each start wrote its own command journal (11 November 2026, Tongs 0.32.0 before its release,
  Anvil 1.19.0, [tongs#183](https://github.com/happy-dwarf-team/tongs/pull/183),
  [tongs#184](https://github.com/happy-dwarf-team/tongs/pull/184),
  [tongs#185](https://github.com/happy-dwarf-team/tongs/pull/185)).
- **Flags and variables:** in a save of Russia in 1719, `country` and `province` gave the same
  flags, dates and variables as the save the game wrote, for all 3,299 countries and provinces
  that have any, on Steam and on the GOG builds 1.37.5.2 and 1.37.5.0. With Anvil 1.19 the answer
  said the lists need Anvil 1.20 (11 and 12 November 2026, Tongs 0.33.0 before its release,
  Anvil 1.20.0 on GOG and Anvil built from its code just before the release on Steam,
  [tongs#188](https://github.com/happy-dwarf-team/tongs/pull/188)).
- **Pending events:** in the same save, with Anvil 1.21.0 on Steam and GOG 1.37.5.2, `country RUS`
  listed the two events a lab event opened for the player with the same ids as their windows, never the
  hidden one or the one it fired for an AI; with Anvil built from its code after 1.21.0 it dropped an
  event once `event choose` chose it. With
  Anvil 1.20 the answer said the list needs Anvil 1.21 (12 November 2026, Tongs before its release,
  [tongs#192](https://github.com/happy-dwarf-team/tongs/pull/192)).

## The name

Like a smith's tongs, it holds the work from outside the forge.
