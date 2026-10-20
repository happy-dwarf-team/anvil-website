---
title: Writing plugins
description: How Anvil plugins are built, loaded and distributed with plugin API 2.
---

An Anvil plugin is a native Windows DLL (x64) in a folder with a `plugin.toml` manifest.
Anvil loads it into the game process, where it changes game code through the host API and
talks to other plugins through services and events. This page describes Anvil 1.0 and
plugin API 2; plugins built for API 1 (Anvil 0.2) are skipped and must be ported.

## Start from the template

The fastest way in is
[anvil-plugin-template](https://github.com/happy-dwarf-team/anvil-plugin-template): a C++
plugin that hooks a function, hooks the middle of another one and has one setting, with CI
and release-please already set up. [Your first plugin](../first-plugin/) walks through it.

## The SDK

Every Anvil release has an asset `anvil-sdk-windows-x64.zip` with the headers, the
`anvil.exe` tool and a CMake package:

| Path | What |
| --- | --- |
| `include/anvil/anvil_plugin.h` | the plugin API, a plain C11 ABI |
| `include/anvil/anvil.hpp` | a header-only C++20 wrapper over it |
| `include/anvil/anvil_game.h` | the service and events of the standard plugin `anvil-game` |
| `bin/anvil.exe` | `anvil gen` and `anvil check` |
| `cmake/` | the `AnvilPlugin` CMake package with `anvil_add_plugin` |

A plugin repository fetches it in `CMakeLists.txt`, pinned by its hash:

```cmake
cmake_minimum_required(VERSION 3.25)
project(my_plugin LANGUAGES CXX)

include(FetchContent)
FetchContent_Declare(anvil_sdk
    URL https://github.com/happy-dwarf-team/anvil/releases/download/v1.0.0/anvil-sdk-windows-x64.zip
    URL_HASH SHA256=<the archive's line in the release's SHA256SUMS.txt>)
FetchContent_MakeAvailable(anvil_sdk)

anvil_add_plugin(my_plugin SOURCES src/plugin.cpp)
```

`anvil_add_plugin` reads `plugin.toml` next to `CMakeLists.txt`, runs `anvil gen` on
`symbols.toml` and `settings.toml`, builds the DLL with the static C runtime, and lays out
`build/plugin/<id>/`. It refuses a manifest whose `api` is not the SDK's. It also adds two
targets:

- `my_plugin-check` runs `anvil check` on the plugin folder; with `-DEU4_EXE=<eu4.exe>` it
  also verifies the symbols against the game and rewrites `symbols.lock`.
- `my_plugin-deploy`, with `-DEU4_DIR=<game folder>`, copies the plugin to
  `<game folder>/anvil/plugins/<id>/`.

With an unpacked archive, `find_package(AnvilPlugin REQUIRED)` and
`-DAnvilPlugin_DIR=<sdk>/cmake` do the same. A newer SDK of the same major version keeps
plugins working.

## C, C++ or Rust

- **C:** include `anvil_plugin.h` and the generated `symbols.gen.h`
  ([`examples/hello-c`](https://github.com/happy-dwarf-team/anvil/tree/v1.0.0/examples/hello-c)).
- **C++:** `anvil.hpp` with the generated `symbols.gen.hpp` and `settings.gen.hpp`. A
  detour whose signature does not match the declared one does not compile
  ([`examples/hello-cpp`](https://github.com/happy-dwarf-team/anvil/tree/v1.0.0/examples/hello-cpp)).
- **Rust:** a `cdylib` that depends on [`anvil-sys`](https://crates.io/crates/anvil-sys),
  the raw bindings (its version is Anvil's). `anvil gen --lang rust` writes
  `symbols.gen.rs`, usually from `build.rs`. Link the C runtime statically
  (`-C target-feature=+crt-static`) and catch panics in every function Anvil or the game
  calls: unwinding into them aborts the game
  ([`examples/hello-rust`](https://github.com/happy-dwarf-team/anvil/tree/v1.0.0/examples/hello-rust)).
  A safe `anvil` crate is planned, not released.

## Plugin layout

```
anvil/plugins/<plugin-id>/
  plugin.toml      manifest
  symbols.toml     the game addresses the plugin uses (optional)
  settings.toml    what the player can change (optional)
  <entry>.dll      plugin binary
  ...              any read-only files the plugin needs
```

Treat the plugin folder as read-only. Write caches, learned data and settings to
`anvil/data/<plugin-id>/`; `data_dir` gives you that path. The
[manifest reference](../manifest/) covers all three TOML files.

## Entry point

Export one function:

```c
#include <anvil/anvil_plugin.h>

ANVIL_PLUGIN_EXPORT AnvilResult anvil_plugin_load(const AnvilHost *host, AnvilPlugin *self) {
    host->log(self, ANVIL_LOG_INFO, "hello from my plugin");
    return ANVIL_OK;
}
```

In C++, derive from `anvil::Plugin`, override `load(anvil::Host&)` and write
`ANVIL_PLUGIN(MyPlugin)`. Changes requested in the load are enabled together when it
returns `ANVIL_OK`. Return an error, throw from `load()`, or crash, and Anvil rolls back
every change of the plugin while the game keeps starting.

## Phases

| Phase | When it runs | Use it for |
| --- | --- | --- |
| `early` | On the game's main thread at the executable entry point, before the game's C runtime starts. Loading DLLs and starting threads is allowed; there is no UI yet. | Changes that must be in place before the game runs its first line, such as allocator or file I/O changes. |
| `main` | On an Anvil thread right after the early phase, while the game starts up. | Everything else. |

## Game addresses

Every address a plugin uses in `eu4.exe` is declared once in `symbols.toml`, with the bytes
expected there. Before the plugin DLL is loaded, Anvil compares every symbol with the
running game; on a mismatch, or on another game build, it skips the plugin and logs the
symbol and the first differing byte. Host calls take these symbols, never raw addresses
inside `eu4.exe`. A plugin without `symbols.toml` uses no game addresses and loads on every
build.

`anvil check` runs the same verification offline, and CI checks a committed
`symbols.lock` without the game. See [symbols.toml](../manifest/#symbolstoml) and
[anvil check](../manifest/#anvil-check).

## Ironman and multiplayer

`affects_gameplay = true` marks a plugin that can change the simulation. Such a plugin
depends on the standard plugin `anvil-game`, which reports game sessions. In an ironman or
multiplayer session Anvil suspends all of its changes and puts them back afterwards,
unless the manifest offers an opt-in and the player allows it in `anvil/anvil.toml`. The
plugin hears `anvil.suspended` and `anvil.resumed`; see the [Host API](../api/#events).

## Crashes and safe mode

When the game crashes, Anvil writes a report to `anvil/crashes/` (`.json`, `.txt` and a
small minidump; the last 10 are kept). It attributes the crash at one of four levels: in a
plugin's code, in a plugin's change, a plugin on the stack, or no plugin involved. It never
says a plugin caused it. The report lists the plugins with their `issues` links, so set
`issues` in your manifest. Nothing is uploaded.

After two starts in a row that crashed before the game was ready, the next start is in
safe mode: in Anvil 1.0 it loads no plugins at all, and the log says why. The start after
that loads them again.

## Next

- [Your first plugin](../first-plugin/), from the template
- [Manifest reference](../manifest/): `plugin.toml`, `symbols.toml`, `settings.toml`
- [Host API](../api/): changes, chains, services and events
- [List your plugin](../catalog/) in the catalog
