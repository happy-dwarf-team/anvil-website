---
title: Host API
description: What the Anvil host offers to plugins in plugin API 2.
---

`anvil_plugin_load` receives an `AnvilHost`, a table of functions. The full reference is
the SDK header
[`anvil_plugin.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_plugin.h);
the C++ wrapper
[`anvil.hpp`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil.hpp)
offers the same calls as methods of `anvil::Host`, throwing `anvil::Error` on failure.
Most calls return an `AnvilResult`: `ANVIL_OK` or an `ANVIL_ERROR_*` code.

## Basics

| Function | Purpose |
| --- | --- |
| `log` | Write a UTF-8 line to `anvil/anvil.log`, tagged with your plugin id. |
| `plugin_dir` | Your read-only plugin folder. |
| `data_dir` | Your writable folder, `anvil/data/<plugin-id>/`. |
| `game` | The running game: `build_id` (`NULL` if unknown), `image_base`, `image_size`, and `sha256` once verified. |
| `api_version`, `anvil_version` | The host's plugin API version (2) and Anvil version. |

## Changes

Every call that touches `eu4.exe` takes a declared symbol (`SYM_<NAME>` in C,
`sym::<name>` in C++), never a raw address. The expected bytes come from `symbols.toml`
and were verified before your DLL was loaded. There are seven kinds of change:

| Kind | C call | Notes |
| --- | --- | --- |
| Function hook | `hook_function(self, fn, detour, &next, &out)` | Your detour replaces the function; call `next` to run the rest of the chain. |
| Mid hook | `mid_hook(self, site, callback, user, &out)` | `callback(cpu, user)` runs before the code at the site, with the registers in `AnvilCpuContext`; the original code runs afterwards. |
| Block replacement | `replace_block(self, block, callback, user, &out)` | The declared bytes never run: the callback runs instead, and the game resumes at the symbol's `resume` or at the end of the block. |
| Call redirect | `redirect_call(self, call_site, target, &next, &out)` | Points a `call rel32` at your function; `next` is the previous target. |
| Byte patch | `patch_bytes(self, site, bytes, size, &out)` | Writes bytes within the symbol's declared bytes. |
| Pointer swap | `swap_pointer(self, slot, value, &previous, &out)` | Stores a pointer in a slot symbol atomically, also in read-only memory. |
| Import replacement | `replace_import(self, module, function, replacement, &next, &out)` | Replaces an import of `eu4.exe`, for example `"KERNEL32.dll"`. |

`hook_function_at` and `mid_hook_at` take raw addresses, but only **outside** the
`eu4.exe` image, for example Direct3D 9 vtables, with an optional prologue check. Inside
it they return `ANVIL_ERROR_NOT_DECLARED`.

In C++ the same calls are `host.hook`, `host.mid_hook`, `host.replace_block`,
`host.redirect`, `host.patch`, `host.swap`, `host.replace_import`, `host.hook_at` and
`host.mid_hook_at`. An `anvil::HookOf<sym::x>` holds a function hook and its `next`; a
detour whose signature differs from the declared one fails with a `static_assert`.

### Staging, removal and groups

- Changes requested inside `anvil_plugin_load` are staged and enabled together when it
  returns `ANVIL_OK`; on failure none are enabled and everything is rolled back.
- Later changes are enabled one by one, or together between `begin_group` and
  `commit_group` (`abort_group` drops them; in C++, `host.group([&] { … })`). Inside the
  load, the load itself is the group, so `begin_group` returns `ANVIL_ERROR_WRONG_PHASE`.
- `out` (may be `NULL`) receives a handle; `remove(self, change)` takes the change out. In
  C++ an `anvil::Change` removes it when destroyed, unless you `release()` it.
- Detours, callbacks and `user` data must stay valid while the change lives.

### Chains

Several plugins may change the same address. Anvil owns one hook per address and chains
the plugins in load order, the earlier plugin outermost, without priorities. Each link
has its own `next` (or `previous` for a pointer swap) and must pass on through it. Links
can be removed in any order.

At one address, mid hooks run first, then a block replacement, the function-hook chain or
the redirected call. A mid hook that writes `cpu->rip` ends the chain there.

A change whose bytes overlap another plugin's change at a different address is refused
with `ANVIL_ERROR_CONFLICT`, and the log names both plugins. Identical byte patches share
ownership. A hook whose relocated bytes contain `JRCXZ` or `LOOP*`, or that has fewer than
5 declared bytes, is refused with `ANVIL_ERROR_UNSAFE_SITE`.

### Reading the game

| Function | Purpose |
| --- | --- |
| `address_of(self, symbol)` | The verified address of a symbol, to call a function or read data. C++: `host.call(sym::x, …)`, `host.function`, `host.data`. |
| `symbol_value(self, symbol, name, &out)` | A value from `values` in `symbols.toml`; a `rip_relative` value is an RVA. C++: `host.value`. |

## Settings

Values from [`settings.toml`](../manifest/#settingstoml) are read once before the plugin
loads and are always valid.

| Function | Reads |
| --- | --- |
| `setting_bool` | a bool |
| `setting_int` | an int, a bool (0/1), an enum's option index (`CFG_<NAME>_<OPTION>`) or a key code |
| `setting_float` | a float or an int |
| `setting_string` | a string, an enum's option name, or a key such as `"Ctrl+F12"` |
| `subscribe_setting` | a callback when a `restart = false` setting changes |

In C++: `cfg::<name>.get()` and `host.subscribe_setting(cfg::<name>, handler)`, which does
not compile for a `restart = true` setting.

## Services

A plugin can offer a service to other plugins: a C struct of function pointers whose first
field is `uint32_t size`.

```c
host->register_service(self, "my-plugin.math", 1, &g_math);        // provider
const MyMath *math = host->get_service(self, "my-plugin.math", 1);  // consumer
```

Names are `<plugin-id>.<service>`, and a service lives for the whole session. Add new
functions at the end of the struct (consumers check `size`); a breaking change gets a new
major version. Publish the struct in a header of your plugin.

## Events

`subscribe(self, event, callback, context)` and `publish(self, event, payload)` deliver
events synchronously on the publishing thread. A plugin publishes only events named
`<plugin-id>.<name>`, and may subscribe to any name. `anvil.` names are Anvil's:

| Event | When |
| --- | --- |
| `anvil.plugins_loaded` | Every plugin has been processed. |
| `anvil.suspended` | To the plugin itself: its changes are out of the game (an ironman or multiplayer session). Stop its threads. |
| `anvil.resumed` | To the plugin itself: its changes are back. |

### anvil-game

The game's own events come from `anvil-game`, a standard plugin shipped with Anvil.
Depend on it in `plugin.toml` (`id = "anvil-game"`, `version = "^1"`) and include
[`anvil_game.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_game.h).
All its events are published on the game's main thread:

| Event | Payload | When |
| --- | --- | --- |
| `anvil-game.ready` | none | Once, when the game has finished starting (the main menu is up). |
| `anvil-game.frame` | `AnvilGameFrame` | After every frame of the main loop. Keep the handler short. |
| `anvil-game.session` | `AnvilGameSession` | A game session started or ended, with its `ironman` and `multiplayer` flags. |
| `anvil-game.main_menu` | none | From Anvil 1.8: the main menu came up or went away. Ask the service's `main_menu`. |
| `anvil-game.day`, `.month`, `.year` | `AnvilGameDateChange` | From Anvil 1.11: the date moved on, after the outer frame. `date`, `previous` and `days` say by how much, and the monthly and yearly updates are done by then. At most one of each per frame. Not for the first date of a session or across a load. |
| `anvil-game.player` | `AnvilGamePlayerChange` | From Anvil 1.11: the player's country changed within a session. Not for the first country of a session. |
| `anvil-game.war` | `AnvilGameWarChange` | From Anvil 1.11: a war started or ended, compared once a game day. Not for the wars a session starts with: ask `war_ids` then. |
| `anvil-game.oos` | `AnvilGameOosChange` | From Anvil 1.14: the session's [out-of-sync flags](#out-of-sync) changed, after the outer frame. `flags` and `previous` hold them now and before, `session` is the session's number. |

Its service `anvil-game.game` (version 1, `AnvilGameService`) has `ready`,
`main_thread_id`, `frame_number`, `session` and `run_on_main_thread(work, context)`, which
runs work on the main thread after the next frame. A plugin that subscribes after the game
is ready asks `ready()`. Queued work never runs once the game quits, and frames stop while
a save loads, so never wait for it without a limit.

From Anvil 1.6.0 the service also has `date(&out)`: while a session runs it fills an
`AnvilGameDate` (`year`, `month`, `day` and the `session` number that `session()` reports)
and returns nonzero; in the main menu it returns 0. It can be called from any thread and
shows the date as of the last frame of the main loop. It was added within service version
1, so check `ANVIL_GAME_HAS(service, date)` before calling it, or depend on `anvil-game`
with `version = "^1.6.0"`.

In C++, `host.service` looks the service up and `host.subscribe` takes a handler with the
event's name and its payload:

```cpp
#include <anvil/anvil_game.h>

const AnvilGameService* game = nullptr;

void load(anvil::Host& host) override {
    game = host.service<AnvilGameService>(ANVIL_GAME_SERVICE, ANVIL_GAME_SERVICE_VERSION);
    host.subscribe(ANVIL_GAME_EVENT_SESSION, [host, this](std::string_view, const void* payload) {
        const auto* session = static_cast<const AnvilGameSession*>(payload);
        if (session->change != ANVIL_GAME_SESSION_STARTED) return;
        AnvilGameDate date{};
        if (game->date(&date)) host.info("session {}: {}-{:02}-{:02}", session->number, date.year, date.month, date.day);
    });
}
```

#### Out of sync

From Anvil 1.14.0 the service also has `out_of_sync()`, which tells a plugin that the
machines of a multiplayer game no longer agree. It only reads. It returns the session's
`ANVIL_GAME_OOS_*` flags as of the last frame of the main loop, and 0 when the game is in
sync, when no session runs, or on a game build without the addresses it reads. It can be
called from any thread.

| Flag | Meaning |
| --- | --- |
| `ANVIL_GAME_OOS_DETECTED` | This game's checksums differed from the host's. Only a client compares them, so the host never has this flag. |
| `ANVIL_GAME_OOS_PAUSED` | The game is paused because a machine went out of sync. |

`anvil-game.oos` comes after the outer frame in which the flags changed, while a session
runs. A session starts from 0, and its end publishes nothing: `anvil-game.session` says
that. The function was added within service version 1, so check
`ANVIL_GAME_HAS(service, out_of_sync)` before calling it, or depend on `anvil-game` with
`version = "^1.14.0"`.

Unverified: the flags have not yet been seen set in a real desync, which takes two
computers. [Anvil's design notes](https://github.com/happy-dwarf-team/anvil/blob/main/docs/design.md#131-anvil-game)
say where they are read.

### The world

From Anvil 1.11 the service `anvil-game.world` (version 1, `AnvilGameWorldService`) reads the
running campaign, with no game addresses of your own. Depend on `anvil-game` with
`version = "^1.11.0"`, and treat a NULL service as "not on this build": a port of `anvil-game` to
a new game build may leave the world out.

| Call | Gives |
| --- | --- |
| `player(&tag)` | The country the game treats as the player's |
| `province_limit()` | Valid province IDs are 1 up to this, exclusive |
| `province(id, &out)` | Owner, controller, base tax, production and manpower, land and wasteland |
| `province_name(id, buffer, capacity, &length)` | The name the game shows, in UTF-8 |
| `province_cores(id, tags, capacity, &count)` | The countries with a core |
| `country(tag, &out)` | Capital, province count, treasury, stability, prestige, manpower, income |
| `country_provinces(tag, ids, capacity, &count)` | The provinces it owns |
| `war_ids(ids, capacity, &count)` | The running wars |
| `war(id, &out)`, `war_name`, `war_side` | Who started it, its name, and who is on each side |
| `modifier_id(key, &id)` | The id of a modifier from its script key, such as `"land_morale"` (1.15) |
| `country_modifier(tag, id, &value)` | A country's total of that modifier, as the game uses it (1.15) |
| `province_modifier(id, modifier, &value)` | What the province has of it itself, without its owner's (1.15) |
| `country_units(tag, ids, capacity, &count)` | The ids of a country's armies and navies (1.15) |
| `unit(tag, id, &out)` | Army or navy, province, mission, regiments or ships, strength, leader (1.15) |
| `unit_name`, `unit_leader_name` | The name the game shows, and its leader's (1.15) |
| `selected_units(refs, capacity, &count)` | The armies and navies the player has selected (1.15) |

The calls marked 1.15 were added within version 1: depend on `anvil-game` with
`version = "^1.15.0"`, or check `ANVIL_GAME_WORLD_HAS(world, modifier_id)` and
`ANVIL_GAME_WORLD_HAS(world, selected_units)` before calling them.

- **When:** only on the main thread after a frame, in a handler of an `anvil-game` event or in
  `run_on_main_thread` work, while a session runs. Anywhere else a call answers
  `ANVIL_ERROR_WRONG_PHASE` and reads nothing.
- **Structs:** set `size` to `sizeof` the struct before a call. Values marked x 1000 in the
  header are as the game stores them, so 4500 is 4.5.
- **Lists and names:** the buffers are yours. They are filled as far as they fit and the count
  or length gets the whole size, so a capacity of 0 asks for it.
- **Modifiers:** ask for an id once, at the start of a session or the first time you need it; it
  holds as long as the game runs, while `modifier_id` walks every definition. A value is x 1000
  and already has the game's adjustment for a DLC that is off, so it is what the game's windows
  use: `discipline` 50 is +5%, and a yes-or-no modifier is 1000 or 0.
- **Units:** a unit is read by its country and its id. `ANVIL_ERROR_NOT_FOUND` means it is gone
  (disbanded, merged or destroyed), and `unit_leader_name` answers it also for a unit without a
  leader. `strength` is x 1000, so for an army it is the number of men. The selection can hold
  units of other countries, since the game lets a player select them to look.
- **Cost:** a province takes about 100 ns and a pass over the map about 0.6 ms. A modifier
  read takes about 40 ns and a unit about 0.7 µs (Steam 1.37.5, lab machine).
- **Not on every build:** after a port some values may be missing. A country's `values` field
  says which it has, and the war, modifier and unit calls answer `ANVIL_ERROR_NOT_DECLARED`.

```cpp
const auto* world = host.service<AnvilGameWorldService>(ANVIL_GAME_WORLD_SERVICE, ANVIL_GAME_WORLD_SERVICE_VERSION);

host.subscribe(ANVIL_GAME_EVENT_MONTH, [host, world](std::string_view, const void*) {
    AnvilGameTag me{};
    AnvilGameCountry country{};
    country.size = sizeof(country);
    if (world->player(&me) == ANVIL_OK && world->country(me.text, &country) == ANVIL_OK) {
        host.info("{}: {} ducats", me.text, country.treasury / 1000);
    }
});
```

```cpp
AnvilGameUnitRef selected[64];
uint32_t count = 0;
if (ANVIL_GAME_WORLD_HAS(world, selected_units) &&
    world->selected_units(selected, 64, &count) == ANVIL_OK) {
    for (uint32_t i = 0; i < count && i < 64; ++i) {
        AnvilGameUnit unit{};
        unit.size = sizeof(unit);
        if (world->unit(selected[i].country.text, selected[i].id, &unit) == ANVIL_OK) {
            host.info("{}: {} men in province {}", selected[i].country.text, unit.strength, unit.location);
        }
    }
}
```

It only reads, so it needs no `affects_gameplay = true`. It shows everything, also what fog of
war hides from a player, a rival's modifiers and units in multiplayer included; a plugin that shows such values in multiplayer does not enter the
[Plugins page](../catalog/).

### Windows

From Anvil 1.11 the service `anvil-overlay.panel` (version 1, `AnvilPanelService`, in
[`anvil_panel.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_panel.h))
shows a window of yours in Anvil's overlay, with no game addresses, mod or ImGui context of your
own. You hand over rows and the overlay draws them:

```cpp
const auto* panels = host.service<AnvilPanelService>(ANVIL_PANEL_SERVICE, ANVIL_PANEL_SERVICE_VERSION);
AnvilPanel* panel = nullptr;
panels->create("My window", &panel);

const AnvilPanelRow rows[] = {{ANVIL_PANEL_TEXT, 0, "Treasury", "100.0", 0},
                              {ANVIL_PANEL_SEPARATOR, 0, nullptr, nullptr, 0},
                              {ANVIL_PANEL_BUTTON, 0, "Refresh", nullptr, 1}};
panels->set_rows(panel, rows, 3, sizeof(AnvilPanelRow));
panels->on_click(panel, [](void* context, uint64_t id) { /* a button */ }, nullptr);
panels->show(panel, 1);
```

- Depend on `anvil-overlay` with `version = "^1.11.0"`, and with `optional = true` if the plugin
  also works without a window.
- A window changes nothing in the game, so it needs no `affects_gameplay = true`.
- Every call may come from any thread, and rows are copied.
- A click runs on the main thread after a frame, so the handler may read the world. Without
  `anvil-game` no click arrives.
- The player can close the window; the switch in the panel's status tab brings it back.
- Text is UTF-8 and yours to translate: `language()` gives the player's language. Chinese,
  Japanese and Korean come from the fonts Windows ships.
- The overlay runs on Direct3D 9: on the OpenGL renderer the calls work and nothing is drawn.

For a window in the game's own interface you need your own addresses; there is no service for
that yet.

### Keys

From Anvil 1.18 the service `anvil-overlay.input` (version 1, `AnvilInputService`, in
[`anvil_input.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_input.h))
calls a plugin back when the player presses a key or a mouse button, with no hook on the game
window of your own.

- A code is what a setting of type `key` holds (the Windows virtual key, with
  `ANVIL_INPUT_SHIFT`, `_CTRL` and `_ALT` above it); mouse buttons are their virtual keys. Declare
  the key as a setting, `bind` its value, and call `set_code` from the setting's callback, so the
  player picks the key in the panel.
- The first binding of a code keeps it. A second one, or the panel key, answers
  `ANVIL_ERROR_CONFLICT` and stays inert until it gets a free code.
- `ANVIL_INPUT_CONSUME` keeps the press from the game, `ANVIL_INPUT_REPEAT` also delivers the
  auto-repeat. `held(code)` is for keys polled every frame, such as a camera key.
- Nothing is delivered while the player types in the game (anvil-game's `keyboard()`, also 1.18)
  or uses Anvil's panel; `state()` says what holds keys back.
- The handler runs on the main thread after the next frame, so it may read the world.
- It only reads input, so it needs no `affects_gameplay = true`. Depend on `anvil-overlay` with
  `version = "^1.18.0"`, `optional = true` if the plugin also works without it.

### Commands

From Anvil 1.17 the service `anvil-game.commands` (versions 1 and 2, `AnvilGameCommandsService`
in `anvil_game.h`) posts the commands a player's click would post, built by the game's own
constructors and queued as the buttons queue them. In multiplayer a command goes to the host like
a click; that every machine then runs it alike has not been tested in a live multiplayer game yet
([anvil#256](https://github.com/happy-dwarf-team/anvil/issues/256)).

| Type | Does what |
| --- | --- |
| `ANVIL_GAME_COMMAND_DRILL` | Armies start or stop drilling: an intent, so armies already in that state are skipped |
| `ANVIL_GAME_COMMAND_MERGE` | Two or more armies, or navies, in one province merge into the first |
| `ANVIL_GAME_COMMAND_SPLIT` | One army or navy splits in half, rounded up, as the button does |
| `ANVIL_GAME_COMMAND_EVENT_OPTION` | Version 2: chooses an option of the local player's pending event, as its button does |

- Only a plugin with `affects_gameplay = true` that Anvil has not suspended, and only the
  player's own units (`AnvilGameUnitRef` from [the world](#the-world)).
- Call on the main thread after a frame, in a session; elsewhere, or during a hot-join, the
  answer is `ANVIL_ERROR_WRONG_PHASE`. At most 64 units a call and 256 commands a frame.
- `posted` means queued, not done: read the world a few frames later. An event option needs its
  button enabled now, so try again a frame later after `ANVIL_ERROR_WRONG_PHASE`.
- Ask for version 2 first and fall back to version 1. Depend on `anvil-game` with
  `version = "^1.17.0"`.

### Map modes

From Anvil 1.16 the standard plugin `anvil-map` offers `anvil-map.modes` (version 1, in
[`anvil_map.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_map.h)):
a map mode of your own, with a button on the minimap's list, a colour for each province and lines
in the province's tooltip.

- `register_mode` in the plugin's load, with an id `<plugin-id>.<name>`, a label and a tab. The
  game's list is closed, so a mode borrows one of 13 numbers of the game's enum (unused and debug
  modes) for the process; know your mode by its id, not by the number.
- Colours are a buffer you hand over with `set_colors`, one `0x00RRGGBB` per province ID, or
  `ANVIL_MAP_NO_COLOR` for the political colour. Compute it in your own step, such as on the
  `anvil-map.shown` event or a monthly event, since the game paints also where the world cannot be
  read.
- A tooltip callback gives the mode's lines for a province. Text is UTF-8; it goes to the game
  as UTF-8 when [Mei](../../../plugins/mei/) says it keeps the game's text in UTF-8 (its
  `mei.text` service, in Mei's next release after 0.6), otherwise in Windows-1252 with `?` for
  what does not fit. The tooltip lines of script effects follow the same rule.
- It changes nothing in the game, so it needs no `affects_gameplay = true`. Depend on `anvil-map`
  with `version = "^1"`. Example:
  [`player-cores`](https://github.com/happy-dwarf-team/anvil/tree/main/examples/player-cores).

### Script effects and the day end

The standard plugin `anvil-script`, in
[`anvil_script.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_script.h),
is for gameplay plugins (`affects_gameplay = true`):

- **Script effects** (from Anvil 1.16, `anvil-script.effects`): a plugin with `phase = "early"`
  registers keys such as `my_plugin_set_terrain` in its load, and a mod writes
  `my_plugin_set_terrain = mountain` in an event option, a decision or a scripted effect. The
  game parses it as one of its own effects and calls the plugin's `execute` with the value and the
  scope, and `describe` for the tooltip line. A key is the plugin's id with `-` as `_`, then
  `_<name>`. Example:
  [`hello-script`](https://github.com/happy-dwarf-team/anvil/tree/main/examples/hello-script).
- **The day end** (from Anvil 1.18, `anvil-script.day_end`): a callback once a game day, on the
  main thread after the game has finished the day, before it compares checksums in multiplayer,
  with flags for a new month and a new year. Subscribe in the plugin's load.

In multiplayer every machine runs the same effects and day ends, so the plugin must be on every
machine and give the same result. While Anvil suspends the plugin, its effects do nothing and its
callback is not called. Inside both, the world answers `ANVIL_ERROR_WRONG_PHASE`. Depend on
`anvil-script` with `version = "^1.16.0"` for effects and `"^1.18.0"` for the day end.

## Start-up benchmark

From Anvil 1.4 the core offers the service `anvil.benchmark` (version 1), through which a
plugin joins the [start-up benchmark](../../benchmark/) of Anvil Manager and adds its own
fields to the report. Include
[`anvil_benchmark.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_benchmark.h)
(C++: `anvil_benchmark.hpp`) and look it up with `get_service`; an older Anvil returns
`NULL` and the plugin works on without it. No manifest key is involved.

- **Join:** declare the fields inside `anvil_plugin_load`. Declaring, even zero fields,
  makes the plugin a participant, which promises one `done()` call. The kinds are `int`,
  `number`, `enum` and `flag`, with an optional unit (`ms`, `count`, `bytes`, `mb`,
  `percent`); there is no string kind, so no paths or text reach a report. Names are
  `group.field` or `field` from `[a-z0-9_]`.
- **During a start:** `active()` says whether this is a benchmark start; outside one every
  call checks its arguments and records nothing. `set(field, value)` works from any thread.
  `done()` says the plugin's work after the game is ready is finished; the game quits once
  every participant is done, at most 30 s after ready. `learning(reason)` discards a start
  that is not representative for the plugin, and `open_cost(files, ms)` reports files the
  plugin opened ahead of the game, which tells warm starts from cold ones.

Bellows 0.10.0 is the first participant. The full contract is §5 of the
[benchmark specification](https://github.com/happy-dwarf-team/anvil/blob/main/docs/spec/benchmark-v1.md#5-anvilbenchmark-v1).

## Rust

The safe crate [`anvil-sdk`](https://crates.io/crates/anvil-sdk) (library `anvil`,
[documentation on docs.rs](https://docs.rs/anvil-sdk)) offers the calls above to a Rust
plugin. It sits on the raw bindings of
[`anvil-sys`](https://crates.io/crates/anvil-sys), which also bind the service headers.

```rust
use anvil::{Host, Plugin};
use anvil::game::{self, SessionChange};
use anvil::world::World;

struct Hello;

impl Plugin for Hello {
    fn load(host: &mut Host) -> anvil::Result<Self> {
        let world = World::get(host);
        let log = *host;
        host.subscribe(game::SESSION, move |session| {
            if session.change == SessionChange::Started {
                if let Some(tag) = world.and_then(|w| w.player().ok().flatten()) {
                    log.info(format_args!("playing {tag}"));
                }
            }
        })?;
        Ok(Hello)
    }
}

anvil::plugin!(Hello);
```

- `anvil::plugin!(Type)` exports `anvil_plugin_load`. `load` returns the plugin or an
  `anvil::Error`, and Anvil rolls back what the plugin staged when it fails or panics.
- A panic in a mid hook, an event, a setting or a panel click is logged once and the game
  carries on. A function-hook detour is called by the game directly, so wrap its work in
  `anvil::catch_panic`.
- A `Change` removes its change when it is dropped. A `FunctionHook` lives in a `static`,
  where Anvil writes the rest of the chain.
- `anvil::game`, `anvil::world`, `anvil::commands`, `anvil::panel`, `anvil::input`,
  `anvil::map`, `anvil::script` (the day end) and `anvil::benchmark` wrap the services above;
  script effects have only their raw types in `anvil::sys` so far. A function the running service
  is too old to have answers `Unsupported`.
- Host and service calls are safe Rust. What touches the game's memory by address stays
  `unsafe`: calling the rest of a hook's chain or a game function, reading game data,
  writing the registers in a mid hook, byte patches, pointer swaps and raw addresses.

Examples:
[`hello-rust`](https://github.com/happy-dwarf-team/anvil/tree/main/examples/hello-rust)
(hooks on declared symbols) and
[`panel-rust`](https://github.com/happy-dwarf-team/anvil/tree/main/examples/panel-rust)
(the player's country from the world service in a panel, with no game addresses). The crate
has its own 0.x versions; Anvil's compatibility promise covers it from 1.0.

## Versions

Within API 2, fields are only appended to `AnvilHost`, after the line "end of API 2.0".
Check one added later with `ANVIL_HOST_HAS(host, field)` before calling it, or require the
Anvil version that added it in the manifest's `anvil` range. Nothing has been added after
that line yet (Anvil 1.18); the start-up benchmark is a service, not a host field. A breaking
change increases `ANVIL_API_VERSION`.
