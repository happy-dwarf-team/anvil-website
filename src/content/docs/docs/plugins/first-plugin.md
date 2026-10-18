---
title: Your first plugin
description: Build, test and release a minimal Anvil plugin, step by step.
---

This guide builds `my-plugin`, a plugin that only writes to the log, and releases it the
way Bellows and Tongs are released. It does not touch game code; the
[overview](../overview/) and the [Host API](../api/) cover patching.

You need Windows, Visual Studio 2022 (or its Build Tools) with the C++ workload, CMake 3.25
or newer, Git, and EU4 with [Anvil installed](../../install/).

## 1. Repository layout

```
my-plugin/
  CMakeLists.txt
  plugin/plugin.toml
  src/plugin.c
  third_party/anvil/anvil_plugin.h
```

Copy the SDK header
[`anvil_plugin.h`](https://github.com/happy-dwarf-team/anvil/blob/main/include/anvil/anvil_plugin.h)
into `third_party/anvil/`. It is the whole SDK: a plain C ABI, no library to link.

## 2. Manifest

`plugin/plugin.toml`:

```toml
id = "my-plugin"
name = "My Plugin"
version = "0.1.0"
authors = ["Your Name"]
description = "Writes a line to anvil.log."
api = 1
anvil = ">=0.2.0"
entry = "my-plugin.dll"
phase = "main"
affects_gameplay = false
game_builds = ["*"]
```

`game_builds = ["*"]` is right only while the plugin uses no game addresses. Once it
does, list the exact builds and declare the game code it relies on; see the
[manifest reference](../manifest/).

## 3. Code

`src/plugin.c`:

```c
#include <anvil/anvil_plugin.h>

#include <stdio.h>

ANVIL_PLUGIN_EXPORT AnvilResult anvil_plugin_load(const AnvilHost *host, AnvilPlugin *self) {
    char message[160];
    snprintf(message, sizeof(message), "hello from Anvil %s, game build %s", host->anvil_version,
             host->game->build_id ? host->game->build_id : "unknown");
    host->log(self, ANVIL_LOG_INFO, message);
    return ANVIL_OK;
}
```

Return an error, or crash, and Anvil rolls back the plugin's patches while the game keeps
starting. The
[`hello` example](https://github.com/happy-dwarf-team/anvil/blob/main/examples/hello/hello.c)
also registers a service and waits for the game to be ready.

## 4. Build

`CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.25)
project(my_plugin VERSION 0.1.0 LANGUAGES C)

# Static C runtime: players do not need a Visual C++ redistributable.
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")

add_library(my_plugin SHARED src/plugin.c)
target_include_directories(my_plugin PRIVATE third_party)
set_target_properties(my_plugin PROPERTIES OUTPUT_NAME my-plugin)

# Plugin folder layout: <prefix>/my-plugin/{plugin.toml, my-plugin.dll}
install(TARGETS my_plugin RUNTIME DESTINATION my-plugin)
install(FILES plugin/plugin.toml DESTINATION my-plugin)
```

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
cmake --install build --config Release --prefix dist
```

`dist/my-plugin/` now holds `plugin.toml` and `my-plugin.dll`.

## 5. Test in the game

1. Copy `dist/my-plugin/` into `<game folder>/anvil/plugins/`.
2. Start the game.
3. Open `anvil/anvil.log`. It should contain a line with `my-plugin 0.1.0: loaded (main, …)`
   and your message tagged with the plugin id.

If the plugin was skipped, the log says why; see
[Troubleshooting](../../troubleshooting/). Delete the folder when you are done.

## 6. Release

The catalog and players expect the same release shape as Bellows and Tongs:

- a GitHub release tagged `vX.Y.Z`,
- an asset `<plugin-id>-windows-x64.zip` that contains the folder `<plugin-id>/` with
  `plugin.toml` and the DLL,
- `SHA256SUMS.txt` next to it, with the archive's SHA-256 in `sha256sum` format.

Bellows and Tongs build on GitHub Actions and let
[release-please](https://github.com/googleapis/release-please) create the releases from
Conventional Commits, so the version in `plugin.toml` never drifts from the tag. Their
[`build.yml`](https://github.com/happy-dwarf-team/tongs/blob/main/.github/workflows/build.yml)
and
[`release.yml`](https://github.com/happy-dwarf-team/tongs/blob/main/.github/workflows/release.yml)
are a working template, including build provenance attestations.

## Next

- [List your plugin](../catalog/) in the catalog
- [Manifest reference](../manifest/) and [Host API](../api/) for patching game code
