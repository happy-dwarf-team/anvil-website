---
title: Your first plugin
description: Build, check, test and release an Anvil plugin from the template.
---

This guide starts from
[anvil-plugin-template](https://github.com/happy-dwarf-team/anvil-plugin-template), a C++
plugin for plugin API 2 that hooks a function (the game-speed object), hooks the middle
of another one (the return to the main menu) and has one setting. Its
[README](https://github.com/happy-dwarf-team/anvil-plugin-template#readme) is the same
guide in more detail.

You need Windows x64, Visual Studio 2022 (or its Build Tools) with **Desktop development
with C++** and its **C++ CMake tools for Windows** (CMake 3.25 or newer), Git, and EU4 1.37.5
with [Anvil 1.7 or newer installed](../../install/), the first that reads a `symbols.toml`
for several builds. Run the commands in **Developer PowerShell for VS 2022**: Visual Studio's
CMake is on the `PATH` there, not in a plain PowerShell.

A plugin that needs no game addresses is simpler still; see [Recipes](../recipes/).

## 1. Create the repository

On GitHub, open the template and choose **Use this template → Create a new repository**,
then clone it. You get:

| Path | What |
| --- | --- |
| `plugin.toml` | the manifest |
| `symbols.toml` | the game addresses the plugin uses |
| `symbols.lock` | the result of `anvil check --exe`; CI checks it is current |
| `settings.toml` | what the player can change |
| `src/plugin.cpp` | the plugin |
| `CMakeLists.txt` | fetches the Anvil SDK and calls `anvil_add_plugin` |
| `.github/` | CI, pull request titles and releases |

## 2. Name the plugin

| File | What to change |
| --- | --- |
| `plugin.toml` | `id`, `name`, `entry`, `authors`, `description`, `issues`, `repository`, `affects_gameplay` |
| `CMakeLists.txt` | `project(my_plugin …)`; the target follows it |
| `workshop/descriptor.mod` | `name`, the mod's name in the launcher and on the Workshop: `<Name> - <what it does>` |
| `workshop/description.md`, `workshop/thumbnail.png` | the Workshop page; see [Publish your plugin on the Steam Workshop](../workshop/#the-workshop-page) |

The id is lowercase letters, digits and `-`. The `my_plugin-check` and `my_plugin-deploy`
targets below follow the project name.

## 3. Declare the symbols

Every game address the plugin touches is a `[symbol.<name>]` in `symbols.toml`. The
template declares the Steam and GOG builds, so a symbol says where it is in each:

```toml
builds = ["eu4-1.37.5-steam-win64", "eu4-1.37.5.2-gog-win64"]

[symbol.speed_object]
memory = "code"
signature = "void* (void* session)"

[symbol.speed_object.build."eu4-1.37.5-steam-win64"]
rva = 0x8024D0
bytes = "48 8B 81 18 04 00 00 C3"      # mov rax, [rcx+0x418]; ret

[symbol.speed_object.build."eu4-1.37.5.2-gog-win64"]
rva = 0x801850
bytes = "48 8B 81 08 04 00 00 C3"      # mov rax, [rcx+0x408]; ret
```

At build time `anvil gen` turns it into `symbols.gen.hpp`, so the code says
`sym::speed_object`, and a detour that does not match the signature does not compile. The
[manifest reference](../manifest/#symbolstoml) lists every key. To support one build only,
write `build = "<id>"` instead of `builds`, and give `rva` and `bytes` in the symbol itself.

These two symbols are examples. For your own, you find the function and its bytes in `eu4.exe` with
a disassembler such as Ghidra; `anvil check` then verifies what you wrote. To read the campaign or
open a window you need no symbols at all: start from [Recipes](../recipes/) instead.

## 4. Build

Point `EU4_EXE` at the game's `eu4.exe` and `EU4_DIR` at its folder:

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64 -DEU4_EXE="C:/Program Files (x86)/Steam/steamapps/common/Europa Universalis IV/eu4.exe" -DEU4_DIR="C:/Program Files (x86)/Steam/steamapps/common/Europa Universalis IV"
cmake --build build --config Release
```

The first configure downloads the SDK archive pinned in `CMakeLists.txt`. The plugin lands
in `build/plugin/my-plugin/`.

## 5. Check it against the game

```powershell
cmake --build build --config Release --target my_plugin-check
```

This runs `anvil check --exe`: it verifies every symbol against `eu4.exe` (build, bytes,
memory kind, instruction boundaries) and rewrites `symbols.lock`, with one check per build.
Run it again with the other build's `eu4.exe`, or drop that build from `builds`:

```powershell
cmake -S . -B build -DEU4_EXE="C:/GOG Games/Europa Universalis IV/eu4.exe"
cmake --build build --config Release --target my_plugin-check
```

Commit `symbols.lock` with `symbols.toml`. CI has no game, so it fails when the lock does
not match `symbols.toml`, misses a declared build or records problems.

## 6. Deploy and run

Close the game, then:

```powershell
cmake --build build --config Release --target my_plugin-deploy
```

This copies the plugin to `<game folder>/anvil/plugins/my-plugin/`. Start EU4 as usual and
open `anvil/anvil.log`: it lists the plugin with its status and its changes, then the
plugin's own lines. If a symbol does not verify, the log names the symbol and the byte and
the plugin is skipped while the game runs on. See [Troubleshooting](../../troubleshooting/).

Now replace `src/plugin.cpp` with your own code. [Recipes](../recipes/) has a start without
game addresses, and the [Host API](../api/) page lists what the host offers, such as
[the game's events and date](../api/#anvil-game).

## 7. Release

The template's CI builds with warnings as errors, runs `anvil check . --format github` and
packages the plugin. Its release workflow uses
[release-please](https://github.com/googleapis/release-please): merging the release pull
request tags `vX.Y.Z` and attaches a zip of the plugin folder, a Workshop mod zip and
`SHA256SUMS.txt`, with build attestations. To publish the mod on the Steam Workshop from CI,
see [Publish your plugin on the Steam Workshop](../workshop/).

To be [listed on the Plugins page](../catalog/), the release needs an asset with a fixed name,
`<plugin-id>-windows-x64.zip`. The template's Package step writes it next to
`<id>-<version>.zip`. In a repository made before that, add a copy under the fixed name to
that step in `.github/workflows/build.yml`: the release workflow uploads every zip in
`dist/` and adds it to `SHA256SUMS.txt`.

## Next

- [Publish your plugin on the Steam Workshop](../workshop/)
- [List your plugin](../catalog/) on the Plugins page
- [Manifest reference](../manifest/) and [Host API](../api/)
