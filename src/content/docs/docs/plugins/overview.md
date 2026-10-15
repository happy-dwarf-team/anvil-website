---
title: Writing plugins
description: How Anvil plugins are built, loaded and distributed.
---

An Anvil plugin is a native Windows DLL (x64) with a `plugin.toml` manifest. Anvil loads it
into the game process, where it can patch game code in memory through the host API and
talk to other plugins through services and events.

## What you need

- The SDK: the single header
  [`include/anvil/anvil_plugin.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_plugin.h).
  It is a plain C ABI, so any compiler that produces x64 Windows DLLs works. Vendor a copy
  into your repository.
- The example plugin
  [`examples/hello`](https://github.com/happy-dwarf-team/anvil/tree/main/examples/hello):
  it logs, registers a service and waits for the game to be ready, without patching the
  game.

## Plugin layout

```
anvil/plugins/<plugin-id>/
  plugin.toml      manifest, see the manifest reference
  <entry>.dll      plugin binary
  ...              any read-only files the plugin needs
```

Treat the plugin folder as read-only. Write caches, learned data and settings to
`anvil/data/<plugin-id>/`; the host gives you that path.

## Entry point

Export one function:

```c
#include <anvil/anvil_plugin.h>

ANVIL_PLUGIN_EXPORT AnvilResult anvil_plugin_load(const AnvilHost *host, AnvilPlugin *self) {
    host->log(self, ANVIL_LOG_INFO, "hello from my plugin");
    return ANVIL_OK;
}
```

Return an error, or crash during load, and Anvil rolls back every patch your plugin made.
The game keeps starting.

## Phases

| Phase | When it runs | Use it for |
| --- | --- | --- |
| `early` | On the game's main thread at the executable entry point, before the game's C runtime starts. Loading DLLs and starting threads is allowed; there is no UI yet. | Patches that must be in place before the game runs its first line, such as allocator or file I/O changes. |
| `main` | On an Anvil thread right after the early phase, while the game starts up. | Everything else. |

## Game builds

Patches use addresses inside `eu4.exe`, so a plugin is tied to exact game builds. List
them in `game_builds`, for example `eu4-1.37.5-steam-win64`. Use `["*"]` only if your
plugin does not touch game code. On other builds Anvil skips the plugin with a clear log
line.

Every patch states the bytes it expects to replace. If the bytes differ, the patch is
refused, so a wrong build fails safely instead of corrupting the game.

## Next

- [Manifest reference](../manifest/)
- [Host API](../api/)
