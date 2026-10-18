---
title: Manifest reference
description: Fields of plugin.toml, the Anvil plugin manifest.
---

Every plugin folder contains a `plugin.toml`. Unknown keys are logged and ignored, so new
fields can be added without breaking older Anvil versions.

The example below is a made-up plugin that uses every field:

```toml
id = "my-plugin"                  # [a-z0-9-]+, max 64 characters, unique
name = "My Plugin"
version = "1.0.0"                 # SemVer
authors = ["Your Name"]
description = "One sentence about the plugin."
api = 1                           # Anvil plugin API major version
anvil = ">=0.2.0"                 # Anvil versions the plugin needs
entry = "my-plugin.dll"           # DLL file name inside the plugin folder
phase = "main"                    # "early" or "main"
affects_gameplay = false          # true if the plugin may change the simulation
load_after = []                   # ordering only, not a dependency
game_builds = ["eu4-1.37.5-steam-win64"]   # or ["*"] when no game addresses are used

[[dependencies]]                  # zero or more
id = "my-library"
version = ">=1.2.0, <2"
optional = false

[[expect]]                        # zero or more: game bytes the plugin relies on
build = "eu4-1.37.5-steam-win64"
rva = 0x210000
bytes = "48 89 5C 24 08 ?? ?? 57"
name = "function the plugin calls"
```

For real manifests, see the
[`hello` example](https://github.com/happy-dwarf-team/anvil/blob/main/examples/hello/plugin.toml)
and the plugins in the [catalog](../../../plugins/).

## Fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Unique id, lowercase letters, digits and `-`, up to 64 characters. Also the folder name under `anvil/data/`. |
| `name` | yes | Display name. |
| `version` | yes | Plugin version, [SemVer](https://semver.org/). |
| `authors` | no | List of authors. |
| `description` | no | One sentence about the plugin. |
| `api` | yes | Major version of the Anvil plugin API the plugin was built against. Currently `1`. |
| `anvil` | no | SemVer range of Anvil versions the plugin needs, for example `">=0.2.0"`; see [Anvil version](#anvil-version). |
| `entry` | yes | File name of the plugin DLL inside the plugin folder. |
| `phase` | no | `early` or `main` (default); see [Writing plugins](../overview/#phases). |
| `affects_gameplay` | no | `true` if the plugin may change the game simulation; default `false`. Players see this as a multiplayer and Ironman warning, so set it explicitly. |
| `load_after` | no | Plugin ids to load before this one, if present. Ordering only. |
| `game_builds` | yes | Supported game builds, or `["*"]` if the plugin does not use game addresses. |
| `dependencies` | no | Plugins this one needs; see [Dependencies](#dependencies). |
| `expect` | no | Game bytes the plugin relies on; see [Expected game bytes](#expected-game-bytes). |

## Anvil version

Within API 1, new host functions and manifest keys are only added, never changed. A plugin
that needs something added later states the Anvil versions it needs in `anvil`. An older
Anvil then skips it with a log line such as
`requires Anvil >=0.2.0, this is Anvil 0.1.0`, instead of loading it without the feature.

Set `anvil = ">=0.2.0"` or higher when the plugin uses `[[expect]]` or `expect_bytes`: an
Anvil before 0.2.0 does not know `[[expect]]` and would only log it as an unknown key.

## Dependencies

Each `[[dependencies]]` entry has an `id`, a SemVer `version` range and an `optional`
flag. Ranges are comparators joined by commas; `^`, `~`, `=`, `>`, `>=`, `<`, `<=` and `*`
are supported.

- A required dependency that is missing or out of range skips the plugin, and every
  plugin that depends on it.
- An optional dependency is loaded first when present and is never required.
- Plugins are ordered by dependencies within each phase, then by id. A dependency cycle,
  or an `early` plugin depending on a `main` plugin, skips the plugins involved.

## Expected game bytes

Patches already check the bytes they overwrite. A plugin usually also relies on game code
it does not patch: functions it calls, vtables, globals and the struct layouts it reads.
Each `[[expect]]` entry declares one such range.

| Key | Required | Meaning |
| --- | --- | --- |
| `build` | yes | The game build the RVA belongs to. It must be listed in `game_builds`, unless that contains `"*"`. `"*"` means the bytes are the same in every build. |
| `rva` | yes | Address inside `eu4.exe`, as a TOML integer (hex such as `0x210000` is allowed). |
| `bytes` | yes | Hex byte pairs; whitespace is ignored, so a multi-line string works. `??` matches any byte, for example a relocated address. At least one byte must not be `??`, and one entry compares at most 64 KiB. |
| `name` | no | Label for the log. |

Anvil compares the entries for the running build, plus all `"*"` entries, before it loads
any plugin DLL and before any plugin has patched the game. Bytes already patched by other
plugins are compared in their original form. On a mismatch Anvil skips the plugin, and every
plugin that depends on it, with the RVA and the first differing byte in the log.

Addresses known only at run time are checked with the host function
[`expect_bytes`](../api/#checking-game-bytes).
