---
title: Host API
description: What the Anvil host offers to plugins.
---

`anvil_plugin_load` receives an `AnvilHost`, a table of functions. It has a `size`, an
`api_version` and an `anvil_version` field: new functions are appended in minor updates,
and a breaking change increases the API major version. The full reference is the SDK header
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

## Checking game bytes

`expect_bytes(self, rva, expected, mask, size)` checks, without writing anything, that game
code or data the plugin relies on is what it was written for: functions it calls, vtables,
globals. It compares `actual & mask` with `expected & mask`; a `NULL` mask compares every
bit, and a `0x00` mask byte skips that byte. Bytes already patched by other plugins are
compared in their original form. One call compares at most `ANVIL_MAX_EXPECT_BYTES`
(64 KiB).

Check every dependency before the first patch. Once the plugin has patches of its own, the
call returns `ANVIL_ERROR_WRONG_PHASE`, so a plugin never leaves the running game
half-patched. Dependencies known in advance are better declared as
[`[[expect]]`](../manifest/#expected-game-bytes) in `plugin.toml`: Anvil checks those
before the plugin DLL is loaded.

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

## Functions added after API 1.0

Functions appended after API 1.0 are only present on newer hosts. Check for one with
`ANVIL_HOST_HAS` before calling it:

```c
if (ANVIL_HOST_HAS(host, expect_bytes)) {
    /* the host provides expect_bytes */
}
```

Or require the Anvil version that added it with `anvil = ">=0.2.0"` in the
[manifest](../manifest/#anvil-version); an older Anvil then skips the plugin.

| Function | Added in |
| --- | --- |
| `expect_bytes` | Anvil 0.2.0 |
