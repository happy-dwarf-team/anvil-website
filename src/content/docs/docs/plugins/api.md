---
title: Host API
description: What the Anvil host offers to plugins.
---

`anvil_plugin_load` receives an `AnvilHost`, a table of functions. It has a `size` and an
`api_version` field: new functions are appended in minor updates (check `size`), and a
breaking change increases the API major version. The full reference is the SDK header
[`anvil_plugin.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_plugin.h).

## Basics

| Function | Purpose |
| --- | --- |
| `log` | Write to `anvil/anvil.log`, tagged with your plugin id. |
| `plugin_dir` | Your read-only plugin folder. |
| `data_dir` | Your writable folder, `anvil/data/<plugin-id>/`. |
| `game` | Information about the running game: build id (or `NULL` if unknown), image base and size. |

## Patching the game

All addresses are RVAs inside `eu4.exe`. Before writing, the host checks the expected bytes,
call target or import, and refuses a patch that overlaps another plugin's patch; both
plugin ids are logged.

| Function | Purpose |
| --- | --- |
| `patch_bytes` | Replace bytes at an address. |
| `redirect_call` | Point an existing `call` instruction at your function. |
| `hook_function` | Detour a whole function, with a trampoline to call the original. |
| `replace_import` | Replace an entry in the game's import table. |
| `alloc_near_image` | Allocate executable memory within ±2 GB of the game image, for your own stubs. |

If your plugin's load fails, all its patches are rolled back.

## Services

A plugin can offer a service to other plugins: a C struct of function pointers whose first
field is `uint32_t size`.

```c
host->register_service(self, "my-plugin.math", 1, &g_math);   // provider
const MyMath *math = host->get_service(self, "my-plugin.math", 1);  // consumer
```

Services are registered under your own id prefix and live for the whole session. Add new
functions at the end of the struct (consumers check `size`); a breaking change gets a new
major version, and both majors can be registered at the same time. Publish the struct in
a header of your plugin.

## Events

`subscribe(self, event, callback, context)` and `publish(self, event, payload)` deliver
events synchronously on the publishing thread, in subscription order. Built-in events:

| Event | When |
| --- | --- |
| `anvil.plugins_loaded` | After the main phase has loaded all plugins. |
| `anvil.game_ready` | When the game has finished starting. Only on known builds; check `game->ready_signal_known`. |

The `anvil.` prefix is reserved for the host.
