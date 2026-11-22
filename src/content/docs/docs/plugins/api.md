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
| `game` | The running game: `build_id` (`NULL` if unknown), `image_base`, `image_size`, and `sha256` once verified. Anvil sets `sha256` from another thread after the load, so in C++ read it with `host.game_sha256()` (SDK of Anvil 1.26), which reads it atomically and gives an empty string until then. |
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
5 declared bytes, is refused with `ANVIL_ERROR_UNSAFE_SITE`. From Anvil 1.26 so is a hook
whose relocated bytes hold a short branch (`Jcc rel8`, `JMP rel8`) before their last
instruction, whose overwritten bytes are all `??`, or which would copy bytes past the declared
ones ([anvil#535](https://github.com/happy-dwarf-team/anvil/issues/535),
[#536](https://github.com/happy-dwarf-team/anvil/issues/536)).

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
| `anvil-game.war` | `AnvilGameWarChange` | From Anvil 1.11: a war started or ended, compared once a game day. Not for the wars a session starts with: ask `war_ids` then. From Anvil 1.26 a war is told apart by its address, start date and original sides, so a new war the game puts at a gone war's address gives that war's end and then the new war's start. |
| `anvil-game.pending_event` | `AnvilGamePendingChange` | From Anvil 1.21: an event of the player's own country came (`ANVIL_GAME_PENDING_ADDED`) or left (`ANVIL_GAME_PENDING_REMOVED`: chosen by the player, a plugin or the game), after the outer frame, also while the game is paused. Not for the events a session starts with, nor when the player's country changes: ask `pending_events` then. |
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

#### Restart

From Anvil 1.23.0 the service also has `restart(self, flags)`: the game's own restart, the one the
panel's [**Restart game**](../../using-anvil/#restarting-the-game) uses
([ADR 0012](https://github.com/happy-dwarf-team/anvil/blob/main/docs/adr/0012-game-restart.md)).
Call it only on the player's request. It can be called from any thread and only queues the
request; `anvil-game` acts on it after the next frame of the main loop and checks it again then.

- In the menus the game quits and starts the same `eu4.exe` again, with the same command line
  (without `continue`) and the same mods.
- In a single-player campaign only with `ANVIL_GAME_RESTART_CLOSE_CAMPAIGN`, your word that the
  player accepted closing it. The game then runs its own **Exit to Menu**: an ironman campaign is
  saved, any other loses its progress since the last save.
- `ANVIL_ERROR_WRONG_PHASE` before the game is ready, in a multiplayer session, or in a campaign
  without the flag; `ANVIL_ERROR_UNSUPPORTED` on a game build without its addresses.

Check `ANVIL_GAME_HAS(service, restart)` or depend on `anvil-game` with `version = "^1.23.0"`. In
Rust it is `Game::restart(&host, close_campaign)` (`anvil-sdk` 0.1.11).

#### Speed, pause and the write folder

From Anvil 1.24.0 the service also reads the game's speed, its pause and its folder. All three
can be called from any thread and only read.

- `speed(&out)`: the speed as the speed bar shows it, 1 to 5. Nonzero while a session runs, also
  while it is paused; 0 in the menus. As of the last frame of the main loop, like `date`.
- `paused(&flags)`: nonzero while a session runs and is paused, with one reason:
  `ANVIL_GAME_PAUSE_PLAYER` while the player's own pause is on (the space bar, the pause button),
  else `ANVIL_GAME_PAUSE_GAME` when the game holds a pause of its own. After the player resumes,
  the game may stay paused, and `paused` says so from the next frame. A pause because the game
  went out of sync is [`out_of_sync`](#out-of-sync)'s `ANVIL_GAME_OOS_PAUSED`.
- `user_dir()`: the game's own write folder, where it keeps `save games`, `logs` and
  `settings.txt` (by default `Documents\Paradox Interactive\Europa Universalis IV`, or what
  `-userdir` and `userdir.txt` choose), as a wide string with backslashes and no trailing one.
  NULL until the game has set it at start-up, which it has by `anvil-game.ready`. The string
  does not change and stays valid until the process exits.

Check `ANVIL_GAME_HAS(service, speed)` or `ANVIL_GAME_HAS(service, user_dir)`, or depend on
`anvil-game` with `version = "^1.24.0"`. To change the speed, post
[`ANVIL_GAME_COMMAND_SPEED`](#commands). In Rust: `Game::speed`, `Game::paused` and
`Game::user_dir` (`anvil-sdk` 0.1.12).

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
| `monarch(tag, kind, &out)` | A country's ruler, heir or consort: id, skills, sex, regency, birth, an heir's claim, the leader they are (1.20) |
| `monarch_name`, `monarch_dynasty` | Their name, and the dynasty as the game shows it (1.20) |
| `flag_id(name, &id)`, `flag_name(id, ...)` | A flag's id from its name, and back (1.20) |
| `country_flags`, `province_flags`, `monarch_flags`, `global_flags` | The flags set now, each with the date it was set (1.20) |
| `country_variable(tag, name, &value)`, `province_variable` | A variable by its name (1.20) |
| `country_variable_names`, `province_variable_names` | The names of all of a country's or province's variables (1.20) |
| `pending_events(tag, ids, capacity, &count)` | The events waiting for a country's choice; `NULL` for the player's own country (1.21) |
| `pending_event(id, &out)` | Its country, province, number of options, whether it is hidden, and the date the game chooses for the player (1.21) |
| `pending_event_key`, `pending_event_title` | The event's key, such as `flavor_tur.203`, and its title's localisation key (1.21) |
| `country_statistics(tag, kind, points, capacity, &count)` | A country's yearly income, score, nation size or inflation, as the game's graphs show them (1.21) |
| `country_timed_modifiers(tag, list, capacity, &count)`, `province_timed_modifiers` | The named modifiers an effect gave for a time, with their end dates, hidden and ruler flags (1.21) |
| `country_timed_modifier_keys`, `province_timed_modifier_keys` | Their keys in the same order, such as `recently_annexed_other_religion_timer` (1.21) |
| `province_view(&id)` | The province the game's province view shows while that window is open (1.21) |
| `country_relations(tag, kind, out, capacity, &count)` | A country's alliances, royal marriages, guarantees, military access, subsidies, subjects or warnings (1.22) |
| `subject_type(overlord, subject, ...)` | A subject's type, such as `vassal` or `march` (1.22) |
| `diplomacy_status(from, to, &out)` | One country's opinion of another, its trust and favors, and whether they have a truce (1.22) |
| `country_rivals`, `country_overlord`, `country_subjects` | Its rivals, its overlord and its direct subjects (1.22) |
| `player_tags(&out)` | What `player` answers, with the player's own tag, the observed tag and whether the player is the observer (1.23) |
| `selected_province(&id)` | The province last selected on the map (a click, the outliner, a link), also after its view closed; 0 while none has been selected in the session (1.24) |
| `province_at(x, y, &id)` | The province under a point of the game window's client area, as the game's hover finds it, so it follows the camera; sea and wasteland count, 0 off the map (1.24) |
| `unit_at(x, y, &ref)` | The army or navy the map picks at that point, any country's, or `ANVIL_ERROR_NOT_FOUND` (1.24) |
| `exploration_regions(&fleet, explore, regions, capacity, &count)` | The sea regions (`ANVIL_GAME_EXPLORE_SEA`) or coasts (`ANVIL_GAME_EXPLORE_COAST`) a fleet's Explore dialog offers, in the game's order; a region is its index in the map's regions. Not whether the fleet may explore now (port, explorer, ships): the dialog's button checks that (1.25) |
| `region_name(region, ...)`, `region_key(region, ...)` | A region's name as the game shows it, and its script key such as `baltic_sea_region` (1.25) |
| `province_triggered_modifier_keys(province, keys, capacity, &length)` | The keys of the province triggered modifiers the province was given (`add_province_triggered_modifier`), in the game's order, whether or not their triggers hold now; with `province_timed_modifier_keys` they are every key `has_province_modifier` looks for (1.25) |
| `province_key(province, key, ...)`, `country_key(tag, key, ...)` | The script key of a province's religion, culture or trade goods, or of a country's state religion or primary culture (`ANVIL_GAME_KEY_RELIGION`, `_CULTURE`, `_TRADE_GOODS`), as the game's files write it, such as `orthodox` or `grain`; `ANVIL_ERROR_NOT_FOUND` when there is none (1.26) |

The calls marked 1.15, 1.20, 1.21, 1.22, 1.23, 1.24, 1.25 and 1.26 were added within version 1: depend on `anvil-game` with
`version = "^1.15.0"`, `"^1.20.0"`, `"^1.21.0"`, `"^1.22.0"`, `"^1.23.0"`, `"^1.24.0"`, `"^1.25.0"` or `"^1.26.0"`, or check `ANVIL_GAME_WORLD_HAS(world, selected_units)`,
`ANVIL_GAME_WORLD_HAS(world, province_variable_names)`, `ANVIL_GAME_WORLD_HAS(world, country_statistics)`
(`ANVIL_GAME_WORLD_HAS(world, province_view)` for the timed modifiers and the province view),
`ANVIL_GAME_WORLD_HAS(world, country_subjects)`, `ANVIL_GAME_WORLD_HAS(world, player_tags)` or
`ANVIL_GAME_WORLD_HAS(world, unit_at)`, `ANVIL_GAME_WORLD_HAS(world, region_key)` or
`ANVIL_GAME_WORLD_HAS(world, province_triggered_modifier_keys)` or `ANVIL_GAME_WORLD_HAS(world, country_key)`
before calling them. The three map calls of 1.24, the four calls of 1.25 and the two of 1.26 answer
`ANVIL_ERROR_NOT_DECLARED` on a game build whose port leaves them out.

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
- **Rulers, heirs and consorts:** `kind` is `ANVIL_GAME_MONARCH_RULER`, `_HEIR` or `_CONSORT`.
  A country without an heir or consort answers `ANVIL_ERROR_NOT_FOUND`. The game keeps a shared
  placeholder person there, which an effect on a missing heir can change; Anvil never reads it,
  so you never get its values. Skills and the name are the person's own, also under a regency
  council, and the dynasty is the one the game shows: a regency council shows its heir's. A
  country with no provinces left keeps its last ruler, as `country` keeps it.
- **Flags:** ask for a flag's id by its name once; `ANVIL_ERROR_NOT_FOUND` means no effect or
  save has set that name yet in this run of the game. Ids are the game's order of registration,
  which differs between game builds and runs, so never store them. `province_flags` gives what
  `has_province_flag` sees, the permanent flags included.
- **Variables:** a value is x 1000, so `set_variable = { which = my_var value = 2.5 }` reads
  2500. `ANVIL_ERROR_NOT_FOUND` means the scope has no such variable, which the game's triggers
  take as 0. The names come one after the other, each followed by a NUL.
- **Pending events:** the id is the one `ANVIL_GAME_COMMAND_EVENT_OPTION` takes, so a plugin
  can read an event and choose its option without addresses ([Commands](#commands)). The game
  keeps every country's events in one list, and an AI's choice or a hidden event leaves it at
  once, so Anvil counts an event only from its second frame: a real one shows up at most one
  frame late. The same event can wait twice, so keep the id, not the key. The title is a
  localisation key; the translated texts, and whether a button is enabled, stay the window's.
  `NULL` is the country the player commands, and in observe mode `ANVIL_ERROR_NOT_FOUND`.
  Right after a load the save's waiting events count at once, a hidden one included, so check
  `ANVIL_GAME_PENDING_HIDDEN` before you show one.
- **Statistics:** `kind` is `ANVIL_GAME_STATISTIC_INCOME`, `_SCORE`, `_NATION_SIZE` or
  `_INFLATION`. Unlike the rest of the world the values are **not x 1000**: income, score and
  inflation are whole numbers after the game's own division, and the nation size is a count of
  provinces. There is one point per year end, oldest first, written on 1 January, so the point
  for 1720 is the value at the end of 1719. The game keeps 0 for the years before the country had
  a value, which its save leaves out. The series only changes at `anvil-game.year`; for this
  year's value read the country.
- **Timed modifiers:** what `add_country_modifier`, `add_province_modifier` and `add_ruler_modifier`
  gave, which `has_country_modifier` and `has_province_modifier` look for, in the order of the save.
  Ask for the list and its keys in the same handler or work, since they come from two calls. A
  modifier given for good (`duration = -1`, `date=-1.1.1` in the save) has `ANVIL_GAME_TIMED_NO_END`.
  The list is the game's own, so it also holds a few the game sets up by itself and leaves out of
  the save, such as `world_port`. Triggered and static modifiers are not in it; their values come
  from `country_modifier`.
- **The province view:** `province_view` answers `ANVIL_ERROR_NOT_FOUND` while no province view is
  open, however the player or a plugin opened it.
- **Diplomacy:** a relation is one object both countries share, so an alliance shows up from
  either side with the same `first` and `second`; read who did what from those two, as the
  save writes them: the guarantor, the payer, the overlord and the one who warns are `first`.
  Military access alone has a list per side: `ANVIL_GAME_RELATION_MILITARY_ACCESS` lists where
  the country has access, `_GIVING_MILITARY_ACCESS` where it gives it. The opinion is the
  number of the diplomacy window as the game keeps it, refreshed at least monthly for a human's
  country and yearly for an AI's, so it can trail a change for a while; the tooltip works it out
  again. A country with no provinces, or one the game has not counted yet, answers
  `ANVIL_ERROR_NOT_FOUND` there. `timed_sum` is the sum of the timed opinion modifiers, which
  the game does not clamp, so it is not the opinion. A truce has no end date here, since the
  game works it out. In multiplayer every country's trust, favors and opinions can be read,
  which is more than a player sees, so a plugin that shows them does not enter the catalog.
- **Cost:** a province takes about 100 ns and a pass over the map about 0.6 ms. A modifier
  read takes about 40 ns and a unit about 0.7 µs (Steam 1.37.5, lab machine). A ruler takes
  about 80 ns, and a country's 110 flags about 3 µs (Steam 1.37.5 and GOG 1.37.5.2, lab machine,
  November 2026). A statistics series takes about 15 µs, since it walks every country's, and an
  empty list of pending events well under a microsecond. A country's 101 timed modifiers take
  about 6.5 µs and `province_view` about 30 ns. A `diplomacy_status` takes about 0.1 µs and a
  list of 13 relations about 0.6 µs (the same machine and builds).
- **Not on every build:** after a port some values may be missing. A country's `values` field
  says which it has, and the war, modifier, unit, ruler, flag, variable, pending event,
  statistics, timed modifier, province view and diplomacy calls answer
  `ANVIL_ERROR_NOT_DECLARED`.

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

```cpp
AnvilGameMonarch heir{};
heir.size = sizeof(heir);
if (ANVIL_GAME_WORLD_HAS(world, monarch) &&
    world->monarch("RUS", ANVIL_GAME_MONARCH_HEIR, &heir) == ANVIL_OK) {
    host.info("heir {}/{}/{}, claim {}", heir.adm, heir.dip, heir.mil, heir.claim / 1000);
}
```

```cpp
host.subscribe(ANVIL_GAME_EVENT_PENDING, [host, world](std::string_view, const void* payload) {
    const auto* change = static_cast<const AnvilGamePendingChange*>(payload);
    char key[128];
    uint32_t length = 0;
    if (change->change == ANVIL_GAME_PENDING_ADDED &&
        world->pending_event_key(change->pending_id, key, sizeof(key), &length) == ANVIL_OK) {
        host.info("{} waits for {}", key, change->country.text);
    }
});
```

It only reads, so it needs no `affects_gameplay = true`. It shows everything, also what fog of
war hides from a player, a rival's modifiers and units and another player's pending events in
multiplayer included; a plugin that shows such values in multiplayer does not enter the
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
- The player can close the window; its switch above the list of the panel's Plugins tab brings it back.
- Text is UTF-8 and yours to translate: `language()` gives the player's language. Chinese,
  Japanese and Korean come from the fonts Windows ships.
- From Anvil 1.26.0 a row of the kind `ANVIL_PANEL_SWATCH` draws a square of its `color`
  (`0x00RRGGBB`) before its label, as a map mode's legend does. `AnvilPanelRow` gains `color` and
  `reserved2` at its end. Pass `sizeof(AnvilPanelRow)` as the row size. Rows of the old size still
  work, and an older overlay refuses the kind with `ANVIL_ERROR_INVALID_ARGUMENT`.
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
  auto-repeat. `held(code)` is for keys polled every frame, such as a
  [camera](#the-map-camera) key.
- Nothing is delivered while the player types in the game (anvil-game's `keyboard()`, also 1.18)
  or uses Anvil's panel; `state()` says what holds keys back.
- The handler runs on the main thread after the next frame, so it may read the world.
- It only reads input, so it needs no `affects_gameplay = true`. Depend on `anvil-overlay` with
  `version = "^1.18.0"`, `optional = true` if the plugin also works without it.

### The map camera

From Anvil 1.25 the service `anvil-game.camera` (version 1, `AnvilGameCameraService` in
`anvil_game.h`) reads the game's map camera and pans it as the arrow keys do, with no game
addresses of your own. The camera is this client's view, not game state: only this game's view
moves, as with the player's own keys and mouse, and nothing goes to the game state or to the
other players in multiplayer.

| Call | Does what |
| --- | --- |
| `view(&out)` | Fills an `AnvilGameCameraView`: `position`, where the camera is, `look_at`, the point it looks at, and `flags`, with `ANVIL_GAME_CAMERA_LOCKED` while the game holds the camera still (a menu is open, or the graphics cannot draw) |
| `pan(right, up)` | Pans the camera for one frame as the arrow keys do: `right` and `up` from -1 to 1, so (1, 0) is the right arrow held for this frame and (0.5, 0) half that; a longer vector is shortened to length 1. (0, 0) does nothing |

- **When:** only on the main thread after a frame, in a handler of an `anvil-game` event or in
  `run_on_main_thread` work, while a session runs, as for [the world](#the-world). Anywhere else,
  in the main menu and during a load, a call answers `ANVIL_ERROR_WRONG_PHASE` and does nothing.
- **The view:** set `size` to `sizeof` the struct; a smaller struct gets the fields its size
  covers. Points are in map units: `[1]` is the height above the map's plane, `[0]` and `[2]` lie
  on it. After a pan the game moves both points towards their targets over the next frames, so a
  pan shows in `view` a frame or more later.
- **The pan:** its speed is the arrows' own, from the player's scroll speed setting, the camera's
  height and the frame's time, capped as the game caps it. Call it once a frame for as long as
  your input lasts, such as while [`held(code)`](#keys) says your key is down. The game's own keys
  and mouse still pan too, and a second call in the same frame pans twice. While the camera is
  locked the arrow keys and the mouse do not move it, and `pan` answers `ANVIL_ERROR_WRONG_PHASE`.
- **Errors:** `ANVIL_ERROR_INVALID_ARGUMENT` for a NULL struct, a size below `position`'s end or
  a value that is not finite; `ANVIL_ERROR_INTERNAL` when the game's memory is not what it should
  be, which costs that answer only.
- **Versions:** depend on `anvil-game` with `version = "^1.25.0"`. `get_service` gives NULL with
  an older `anvil-game` and on a game build whose port leaves the camera out. Calls added later
  within version 1 go at the end of the struct; check them with `ANVIL_GAME_CAMERA_HAS`.
- It moves only this client's view, so it needs no `affects_gameplay = true`.

```cpp
const auto* camera = host.service<AnvilGameCameraService>(ANVIL_GAME_CAMERA_SERVICE, ANVIL_GAME_CAMERA_SERVICE_VERSION);
const auto* input = host.service<AnvilInputService>(ANVIL_INPUT_SERVICE, ANVIL_INPUT_SERVICE_VERSION);

// pan_left, pan_right, pan_up and pan_down are settings of type key.
host.subscribe(ANVIL_GAME_EVENT_FRAME, [camera, input](std::string_view, const void*) {
    if (camera == nullptr || input == nullptr) return;
    auto down = [input](anvil::Key key) { return float(input->held(key.code)); };
    const float right = down(cfg::pan_right.get()) - down(cfg::pan_left.get());
    const float up = down(cfg::pan_up.get()) - down(cfg::pan_down.get());
    if (right != 0.0f || up != 0.0f) camera->pan(right, up);
});
```

Tested in the game on Steam 1.37.5 and GOG 1.37.5.2
([anvil#447](https://github.com/happy-dwarf-team/anvil/pull/447), November 2026): the view, a
camera locked by the Esc menu, and pans to the right, up, and down and to the left with a vector
shortened to length 1. Not tested yet: a pan next to a real arrow key held for as long, a pan while
the player drags the map, GOG 1.37.5.0 (where `anvil check` finds the camera's addresses) and
multiplayer.

### Commands

From Anvil 1.17 the service `anvil-game.commands` (versions 1 to 3, `AnvilGameCommandsService`
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
| `ANVIL_GAME_COMMAND_SPEED` | Version 3 (Anvil 1.22): sets the game speed (`speed`, 1 to 5) as clicks on the speed bar would; nothing while the in-game menu is open, and in multiplayer only the host can |
| `ANVIL_GAME_COMMAND_EXPLORE` | Version 3: armies explore the land, fleets circumnavigate, or units that explore stop (`explore`); an intent, as for drill. A fleet's sea or coast exploration is not posted yet; from 1.25 the world's `exploration_regions` lists the regions the game would offer |
| `ANVIL_GAME_COMMAND_MOVE` | Version 3: armies or fleets move to `province`, as a right-click's plain move; `ANVIL_GAME_COMMAND_QUEUE` adds to the path as Shift. A move the game does not allow now counts as `refused` |
| `ANVIL_GAME_COMMAND_SIEGE_AREA`, `_SUPPRESS_AREA` | Version 3: for each army, a click on the map area of `province` in the siege or rebel-suppression map mode: the area joins the army's autonomous siege or rebel hunt, or leaves it; the game checks it and posts the command, otherwise `refused` |

- Only a plugin with `affects_gameplay = true` that Anvil has not suspended, and only the
  player's own units (`AnvilGameUnitRef` from [the world](#the-world)).
- Call on the main thread after a frame, in a session; elsewhere, or during a hot-join, the
  answer is `ANVIL_ERROR_WRONG_PHASE`. At most 64 units a call and 256 commands a frame.
- `posted` means queued, not done: read the world a few frames later. An event option needs its
  button enabled now, so try again a frame later after `ANVIL_ERROR_WRONG_PHASE`.
- Ask for the newest version first (3, then 2, then 1). Depend on `anvil-game` with
  `version = "^1.17.0"`, or `"^1.22.0"` for the version 3 types. In Rust:
  `Commands::set_speed`, `explore`, `move_to`, `siege_area` and `suppress_area` (`anvil-sdk` 0.1.10).

### Map modes

From Anvil 1.16 the standard plugin `anvil-map` offers `anvil-map.modes` (version 1, in
[`anvil_map.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_map.h)):
a map mode of your own, with a button on the minimap's list, a colour for each province and lines
in the province's tooltip.

- `register_mode` with an id `<plugin-id>.<name>`, a label and a tab, from any thread and at any
  time, usually in the plugin's load; the button shows the next time the game builds the tab. The
  game's list is closed, so a mode borrows one of 13 numbers of the game's enum (unused and debug
  modes) for the process; know your mode by its id, not by the number.
- Colours are a buffer you hand over with `set_colors`, one `0x00RRGGBB` per province ID, or
  `ANVIL_MAP_NO_COLOR` for the political colour. Compute it in your own step, such as on the
  `anvil-map.shown` event or a monthly event, since the game paints also where the world cannot be
  read.
- A tooltip callback gives the mode's lines for a province. Text is UTF-8 and shows as written:
  `$` needs no escaping, and `§`, the game's colour code, which it cannot escape, shows as `?`.
  It goes to the game as UTF-8 when [Mei](../../../plugins/mei/) says it keeps the game's text in
  UTF-8 (its `mei.text` service, in Mei's next release after 0.6), otherwise in Windows-1252 with
  `?` for what does not fit. The tooltip lines of script effects follow the same rule from
  Anvil 1.19; Anvil 1.16 to 1.18 drop `$` and the `§` from them and keep the colour letter.
- From Anvil 1.24.0, `show(mode)` switches the map to your mode, as its button on the minimap
  does, after the next frame of the main loop; `anvil-map.shown` follows. It changes only what
  the map shows, and a request still waiting when the session ends is dropped. Check
  `ANVIL_MAP_HAS(service, show)` or depend on `anvil-map` with `version = "^1.24.0"`.
- From Anvil 1.26.0, `set_legend(mode, entries, count, sizeof(AnvilMapLegendEntry))` gives the
  mode a legend: up to 32 entries of a colour and a label. While the mode is shown, anvil-map shows
  the legend in a window of Anvil's overlay titled with the mode's label, and hides it with the
  mode. Check `ANVIL_MAP_HAS(service, set_legend)` or depend on `anvil-map` with
  `version = "^1.26.0"`.
- It changes nothing in the game, so it needs no `affects_gameplay = true`. Depend on `anvil-map`
  with `version = "^1"`. Example:
  [`player-cores`](https://github.com/happy-dwarf-team/anvil/tree/main/examples/player-cores).

#### Map modes from a mod's files

From Anvil 1.26 a mod can add a map mode with no plugin and no code: a text file in
`<mod>/anvil/map_modes/`, in the game's script syntax. Each block is a mode with a button on the
minimap's list. Its rules read a province's or its owner's flags, variables, modifiers and some of
the game's own numbers, who owns and controls it and whose cores it has, and the first rule a
province passes gives its colour, its line in the tooltip and its entry in the legend.

```
holy_sites = {
    label = "Holy sites"
    tab = 4
    rule = { flag = my_holy_site color = { 224 176 0 } label = "Holy site" }
    rule = { variable = my_faith at_least = 5 color = { 128 64 192 } label = "Faith 5 or more" }
    rule = { modifier = local_missionary_strength above = 0.01 color = { 64 128 255 } label = "Missionaries" }
}
development = {
    label = "Development"
    rule = { value = development above = 0 scale = { 3 30 } color = { 240 240 200 } high_color = { 160 0 0 } label = "Development" }
}
cores = {
    label = "Cores and occupation"
    rule = { occupied = yes color = { 200 40 40 } label = "Occupied" }
    rule = { core = no color = { 230 160 0 } label = "Owned without a core" }
    rule = { subject = yes owner = yes color = { 120 120 200 } label = "A subject's" }
}
```

- A rule reads one of `flag`, `variable`, `modifier` (the province's own value of it) or `value`:
  the province's `development`, `base_tax`, `base_production` or `base_manpower`.
- `owned_by = RUS` passes the provinces that country owns and `controlled_by = RUS` those it
  holds, `core = yes` or `no` whether the owner has a core there and `core = RUS` whether that
  country has one, and `occupied = yes` or `no` whether another country or rebels hold it.
- With `owner = yes` the rule reads the province's owner instead: its flag, variable or modifier,
  the `value` `treasury`, `stability`, `prestige`, `manpower`, `monthly_income` or `provinces`,
  `subject = yes` (the owner has an overlord) or `subject_of = RUS` (that overlord). A province
  without an owner does not pass it.
- `religion = orthodox`, `culture = swedish` and `trade_goods = grain` pass the provinces with that
  religion, culture or trade goods, and with `owner = yes` `religion` and `culture` read the
  owner's state religion and primary culture. Write the key from the game's files, which can
  differ from the name it shows: Moskva's culture in 1719 is `russian_new`.
- `scale = { low high }` with `high_color = { r g b }` colours from `color` at `low` to
  `high_color` at `high`, and the legend shows both ends.
- A province that passes no rule keeps its political colour; a last
  `rule = { always = yes ... }` colours the rest.
- The bounds are `at_least`, `at_most`, `above` and `below`, with at most three decimals. Without
  one, a `variable`, `modifier` or `value` rule passes when the value is not 0, so a scale that
  starts at 0 needs `at_least = 0`.
- The colours are computed when the player shows the mode and each month while it stays shown.
- Anvil reads the files of the playset's mods when the game has started. An edited file shows the
  next time the player picks the mode (or a month later): its rules and legend change without a
  restart. A mode's label, tab and icon, and a new mode, need a restart; `anvil/anvil.log` says
  so. A file with the same name in a later mod replaces an earlier one. The game does not read
  `anvil/`, so the files leave its checksum alone.
- A mistake leaves that mode out and writes the file and the line to `anvil/anvil.log`.
- A mode changes nothing in the game, so it works in ironman and multiplayer. It also colours
  provinces under terra incognita.
- The player needs Anvil 1.26 or newer. All the keys are in the
  [specification](https://github.com/happy-dwarf-team/anvil/blob/main/docs/spec/map-mode-files-v1.md).

### Script effects and the day end

The standard plugin `anvil-script`, in
[`anvil_script.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_script.h),
is for gameplay plugins (`affects_gameplay = true`), and from 1.20 it also tells mods which
plugins are on:

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
- **`has_dlc` for plugins** (from Anvil 1.20, for any plugin, with no code in it): a mod writes
  `has_dlc = "anvil:<id>"` with a plugin's id as its `plugin.toml` writes it, quoted and in
  lowercase. It is true in a single-player campaign when that plugin is loaded and not
  suspended, and false otherwise: in multiplayer, in the menu, while a save loads, and without
  Anvil, where the game takes it as a DLC it does not know and says nothing in `error.log`.
  Anvil changes no file and no DLC list, so the game's checksum stays the same. Before Anvil 1.26
  it kept the previous campaign's answer while a save loaded from a running campaign, so a save
  loaded into ironman could read yes for a plugin suspended there.

  ```
  if = {
      limit = { has_dlc = "anvil:my-plugin" }
      my_plugin_set_terrain = forest
  }
  ```

### The messages of the game's logs

The standard plugin `anvil-log-throttle`, in
[`anvil_log_throttle.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_log_throttle.h),
offers from Anvil 1.20 the table of the messages it throttles, `error.log` by default, with
their counts as they happen. Its own script errors panel reads the same table.

- **`anvil-log-throttle.messages`** v1: `keep` starts the table, at the plugin's load if the
  messages of the whole session are needed, or later from that moment on. `totals` gives the
  numbers of messages and lines, and `read` copies the messages from an index, or only those that
  changed after a given point, so a window can refresh cheaply.
- A message is its log, the game's C++ source file and line that wrote it (not a mod's file) and
  the text. Its count is the lines written to the log plus the lines the plugin only counted.
- It changes nothing in the game, so it needs no `affects_gameplay = true`. Depend on
  `anvil-log-throttle` with `version = "^1"`. Rust: `anvil::log_throttle::Messages` in
  `anvil-sdk` 0.1.8.

In multiplayer every machine runs the same effects and day ends, so the plugin must be on every
machine and give the same result. While Anvil suspends the plugin, its effects do nothing and its
callback is not called. Inside both, the world answers `ANVIL_ERROR_WRONG_PHASE`. Depend on
`anvil-script` with `version = "^1.16.0"` for effects and `"^1.18.0"` for the day end. A
plugin that only wants mods to see it needs no dependency: the player needs Anvil 1.20 or
newer, and with an older one the gate is false.

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
- `anvil::game`, `anvil::world`, `anvil::commands`, `anvil::camera` (from `anvil-sdk` 0.2:
  `Camera::view` and `Camera::pan`), `anvil::panel`, `anvil::input`,
  `anvil::map`, `anvil::script` (the day end, and from `anvil-sdk` 0.1.7 the script effects as
  `anvil::script::Effects`), `anvil::log_throttle` (from `anvil-sdk` 0.1.8) and `anvil::benchmark`
  wrap the services above; from `anvil-sdk`
  0.1.8 `anvil::world` also reads rulers, flags and variables (`World::monarch`,
  `World::country_flags`, `World::country_variable` and the rest), and from 0.1.9 pending events
  and statistics (`World::pending_events`, `World::country_statistics` and the event
  `game::PENDING_EVENT`), and from 0.1.10 diplomacy (`World::country_relations`,
  `World::diplomacy_status` and the rest), and from 0.1.11 the player's tags (`World::player_tags`);
  from 0.1.12 `anvil::game` reads the speed, the pause and the write folder (`Game::speed`,
  `Game::paused`, `Game::user_dir`), `anvil::world` the map's selection and what is under a point
  (`World::selected_province`, `World::province_at`, `World::unit_at`), and `anvil::map` shows a
  mode (`MapModes::show`); from 0.1.13 `anvil::world` lists a fleet's exploration regions and
  names them (`World::exploration_regions`, `World::region_name`, `World::region_key`), and from
  0.1.14 a province's triggered modifier keys (`World::province_triggered_modifiers`).
  From `anvil-sdk` 0.3 (Anvil 1.26), `anvil::map` sets a legend (`MapModes::set_legend`),
  `anvil::panel` has swatch rows (`Row::swatch`), and `anvil::world` reads religion, culture and
  trade goods keys (`World::province_religion`, `province_culture`, `province_trade_goods`,
  `country_religion`, `country_culture`). 0.3 changes one thing: `Row` is
  `#[non_exhaustive]`, so a `match` on it needs a `_` arm. Write `anvil-sdk = "0.3"` in
  `Cargo.toml`.
  A function the running service
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
