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
with C++**, which brings CMake 3.25 or newer, Git, and EU4 1.37.5 with
[Anvil 1.0 or newer installed](../../install/).

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
| `CMakeLists.txt` | `project(my_plugin …)` and the target in `anvil_add_plugin(my_plugin …)` |
| `workshop/descriptor.mod` | `name`, the mod's name in the launcher |

The id is lowercase letters, digits and `-`. The `my_plugin-check` and `my_plugin-deploy`
targets below follow the target name.

## 3. Declare the symbols

Every game address the plugin touches is a `[symbol.<name>]` in `symbols.toml`:

```toml
build = "eu4-1.37.5-steam-win64"

[symbol.speed_object]
rva = 0x8024D0
bytes = "48 8B 81 18 04 00 00 C3"      # mov rax, [rcx+0x418]; ret
memory = "code"
signature = "void* (void* session)"
```

At build time `anvil gen` turns it into `symbols.gen.hpp`, so the code says
`sym::speed_object`, and a detour that does not match the signature does not compile. The
[manifest reference](../manifest/#symbolstoml) lists every key.

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
memory kind, instruction boundaries) and rewrites `symbols.lock`. Commit `symbols.lock`
with `symbols.toml`. CI has no game, so it fails when the lock does not match
`symbols.toml` or records problems.

## 6. Deploy and run

Close the game, then:

```powershell
cmake --build build --config Release --target my_plugin-deploy
```

This copies the plugin to `<game folder>/anvil/plugins/my-plugin/`. Start EU4 as usual and
open `anvil/anvil.log`: it lists the plugin with its status and its changes, then the
plugin's own lines. If a symbol does not verify, the log names the symbol and the byte and
the plugin is skipped while the game runs on. See [Troubleshooting](../../troubleshooting/).

Now replace `src/plugin.cpp` with your own code. The [Host API](../api/) page lists what
the host offers.

## 7. Release

The template's CI builds with warnings as errors, runs `anvil check . --format github` and
packages the plugin. Its release workflow uses
[release-please](https://github.com/googleapis/release-please): merging the release pull
request tags `vX.Y.Z` and attaches a zip of the plugin folder, a Workshop mod zip and
`SHA256SUMS.txt`, with build attestations. Anvil 1.0 loads plugins only from
`anvil/plugins/`; loading plugins from Workshop mods is planned for Anvil 1.3.

To be listed in the [catalog](../catalog/), the release also needs an asset with a fixed
name, `<plugin-id>-windows-x64.zip`, as Bellows and Tongs have. The template names its
zips with the version (`<id>-<version>.zip`), so let the Package step in
`.github/workflows/build.yml` also write a copy under the fixed name. The release workflow
uploads every zip in `dist/` and adds it to `SHA256SUMS.txt`.

## Next

- [List your plugin](../catalog/) in the catalog
- [Manifest reference](../manifest/) and [Host API](../api/)
