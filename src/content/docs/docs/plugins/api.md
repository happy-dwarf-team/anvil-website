---
title: Host API
description: What the Anvil host offers to plugins in plugin API 2.
---

`anvil_plugin_load` receives an `AnvilHost`, a table of functions. The full reference is
the SDK header
[`anvil_plugin.h`](https://github.com/happy-dwarf-team/anvil/blob/v1.0.0/include/anvil/anvil_plugin.h);
the C++ wrapper
[`anvil.hpp`](https://github.com/happy-dwarf-team/anvil/blob/v1.0.0/include/anvil/anvil.hpp)
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
[`anvil_game.h`](https://github.com/happy-dwarf-team/anvil/blob/v1.0.0/include/anvil/anvil_game.h).
All its events are published on the game's main thread:

| Event | Payload | When |
| --- | --- | --- |
| `anvil-game.ready` | none | Once, when the game has finished starting (the main menu is up). |
| `anvil-game.frame` | `AnvilGameFrame` | After every frame of the main loop. Keep the handler short. |
| `anvil-game.session` | `AnvilGameSession` | A game session started or ended, with its `ironman` and `multiplayer` flags. |

Its service `anvil-game.game` (version 1, `AnvilGameService`) has `ready`,
`main_thread_id`, `frame_number`, `session` and `run_on_main_thread(work, context)`, which
runs work on the main thread after the next frame. A plugin that subscribes after the game
is ready asks `ready()`. Queued work never runs once the game quits, and frames stop while
a save loads, so never wait for it without a limit.

## Versions

Within API 2, fields are only appended to `AnvilHost`, after the line "end of API 2.0".
Check one added later with `ANVIL_HOST_HAS(host, field)` before calling it, or require the
Anvil version that added it in the manifest's `anvil` range. Anvil 1.0.0 has nothing
after that line yet. A breaking change increases `ANVIL_API_VERSION`.
