---
title: Manifest reference
description: Fields of plugin.toml, the Anvil plugin manifest.
---

Every plugin folder contains a `plugin.toml`. Unknown keys are logged and ignored, so new
fields can be added without breaking older Anvil versions.

```toml
id = "bellows"                    # [a-z0-9-]+, max 64 characters, unique
name = "Bellows"
version = "0.1.0"                 # SemVer
authors = ["Happy Dwarf Team"]
description = "Faster game start-up."
api = 1                           # Anvil plugin API major version
entry = "bellows.dll"             # DLL file name inside the plugin folder
phase = "early"                   # "early" or "main"
affects_gameplay = false          # true if the plugin may change the simulation
load_after = []                   # ordering only, not a dependency
game_builds = ["eu4-1.37.5-steam-win64"]   # or ["*"] when no game addresses are used

[[dependencies]]                  # zero or more
id = "anvil-ui"
version = ">=1.2.0, <2"
optional = false
```

## Fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Unique id, lowercase letters, digits and `-`, up to 64 characters. Also the folder name under `anvil/data/`. |
| `name` | yes | Display name. |
| `version` | yes | Plugin version, [SemVer](https://semver.org/). |
| `authors` | no | List of authors. |
| `description` | no | One sentence about the plugin. |
| `api` | yes | Major version of the Anvil plugin API the plugin was built against. Currently `1`. |
| `entry` | yes | File name of the plugin DLL inside the plugin folder. |
| `phase` | yes | `early` or `main`; see [Writing plugins](../overview/#phases). |
| `affects_gameplay` | yes | `true` if the plugin may change the game simulation. Players see this as a multiplayer and Ironman warning. |
| `load_after` | no | Plugin ids to load before this one, if present. Ordering only. |
| `game_builds` | yes | Supported game builds, or `["*"]` if the plugin does not use game addresses. |
| `dependencies` | no | Plugins this one needs. |

## Dependencies

Each `[[dependencies]]` entry has an `id`, a SemVer `version` range and an `optional`
flag. Ranges are comparators joined by commas; `^`, `~`, `=`, `>`, `>=`, `<`, `<=` and `*`
are supported.

- A required dependency that is missing or out of range skips the plugin, and every
  plugin that depends on it.
- An optional dependency is loaded first when present and is never required.
- Plugins are ordered by dependencies within each phase, then by id. A dependency cycle,
  or an `early` plugin depending on a `main` plugin, skips the plugins involved.
