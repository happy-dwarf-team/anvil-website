---
title: Manifest reference
description: plugin.toml, symbols.toml, symbols.lock and settings.toml for plugin API 2, and the anvil gen and anvil check tools.
---

A plugin folder has up to three TOML files: `plugin.toml` (required), `symbols.toml` and
`settings.toml`. All three are strict: **an unknown key is an error** and the plugin is
skipped, with the file and line in the log. `anvil check` reports the same errors before
you ship.

Real files: the
[hello examples](https://github.com/happy-dwarf-team/anvil/tree/v1.0.0/examples), the
[template](https://github.com/happy-dwarf-team/anvil-plugin-template) and the plugins in
the [catalog](../../../plugins/).

## plugin.toml

```toml
id = "my-plugin"                  # [a-z0-9-]+, max 64 characters, unique
name = "My Plugin"
version = "1.0.0"                 # SemVer
authors = ["Your Name"]
description = "One sentence about the plugin."
api = 2                           # plugin API major version
anvil = ">=1.0.0"                 # Anvil versions the plugin needs
entry = "my_plugin.dll"           # DLL file name inside the plugin folder
phase = "main"                    # "early" or "main"
symbols = "symbols.toml"          # game addresses; its build limits the plugin to it
settings = "settings.toml"        # what the player can change
affects_gameplay = false          # required: true if the plugin may change the simulation
allow_ironman = false             # false or "opt-in"
allow_multiplayer = false         # false or "opt-in"
load_after = []                   # ordering only, not a dependency
issues = "https://github.com/you/my-plugin/issues"   # shown in crash reports
repository = "https://github.com/you/my-plugin"

[[dependencies]]                  # zero or more
id = "anvil-game"
version = "^1"
optional = false

[[conflicts]]                     # zero or more: this plugin is skipped while one is enabled
id = "other-plugin"
version = "<2"
```

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Unique id, lowercase letters, digits and `-`, up to 64 characters. Also the folder name under `anvil/data/`. |
| `name` | yes | Display name. |
| `version` | yes | Plugin version, [SemVer](https://semver.org/). |
| `authors` | no | List of authors. |
| `description` | no | One sentence about the plugin. |
| `api` | yes | Plugin API major version: `2`. Anvil 1.0 skips `api = 1` plugins with `plugin API 1: update the plugin`. |
| `anvil` | no | SemVer range of Anvil versions, for example `">=1.0.0"`. An older Anvil skips the plugin with a log line. |
| `entry` | yes | File name of the plugin DLL inside the plugin folder. |
| `phase` | no | `early` or `main` (default); see [Writing plugins](../overview/#phases). |
| `symbols` | no | The plugin's `symbols.toml`. Without it the plugin uses no game addresses and loads on every game build. |
| `settings` | no | The plugin's `settings.toml`. |
| `affects_gameplay` | yes | `true` if the plugin can change the state or results of the simulation. See [Ironman and multiplayer](#ironman-and-multiplayer). |
| `allow_ironman`, `allow_multiplayer` | no | `false` (default) or `"opt-in"`: the player may allow the plugin in that mode. |
| `load_after` | no | Plugin ids to load before this one, if present. Ordering only. |
| `issues` | no | Where to report problems; shown with crash reports. |
| `repository` | no | The plugin's source. |
| `dependencies` | no | Plugins this one needs; see [Dependencies and conflicts](#dependencies-and-conflicts). |
| `conflicts` | no | Plugins this one cannot run with. |

`game_builds` and `[[expect]]` from API 1 are gone: `symbols.toml` replaces both.

### Dependencies and conflicts

Each `[[dependencies]]` entry has an `id`, a SemVer `version` range and an `optional`
flag. Ranges are comparators joined by commas; `^`, `~`, `=`, `>`, `>=`, `<`, `<=` and `*`
are supported.

- A required dependency that is missing or out of range skips the plugin, and every
  plugin that depends on it.
- An optional dependency is loaded first when present and is never required.
- Plugins load in dependency order within each phase. A cycle, or an `early` plugin
  depending on a `main` plugin, skips the plugins involved.

A `[[conflicts]]` entry (`id`, `version`) skips the declaring plugin while a plugin with
that id and a version in the range is enabled; the other one loads normally. The log says
`conflicts with <id> <version>; disable one of them`.

### Ironman and multiplayer

A plugin with `affects_gameplay = true` depends on the standard plugin `anvil-game`
without declaring it: only `anvil-game` tells Anvil about ironman and multiplayer
sessions. In such a session Anvil suspends all changes of the plugin and puts them back
when the session ends. The player can allow a plugin that offers `"opt-in"` in
`anvil/anvil.toml`:

```toml
allow_ironman = ["my-plugin"]
allow_multiplayer = []
```

A session that is both ironman and multiplayer needs both.

## symbols.toml

Every address in `eu4.exe` that the plugin uses, declared once:

```toml
build = "eu4-1.37.5-steam-win64"

[symbol.speed_object]                 # a function
rva = 0x8024D0
bytes = "48 8B 81 18 04 00 00 C3"     # hex pairs, ?? = any byte
memory = "code"                       # code, read or write
signature = "void* (void* session)"   # typed in C, C++ and Rust
note = "session vtable slot 0x100: returns the game-speed object"

[symbol.frontend_tick_slot]           # a pointer slot, for swap_pointer
rva = 0x1D5A8E8
memory = "read"
points_to = 0x10D2E80

[symbol.root_and_date]                # values read from the verified bytes
rva = 0x14321FC
bytes = "48 8B 05 75 DC F0 00 8B 98 D0 1D 00 00"
memory = "code"
values.root        = { at = 3, rip_relative = 7, type = "Root" }
values.date_offset = { at = 9, size = 4 }

[symbol.physfs_get_write_dir]         # by export name instead of RVA
export = "PHYSFS_getWriteDir"
signature = "const char* ()"
```

- `build` is the one game build the plugin runs on. On any other build, or an unknown
  one, Anvil skips the plugin.
- A symbol is a **function** (`signature`), a **pointer slot** (`points_to`), **data**
  (`type`) or a **site** (none of them). `signature`, `points_to` and `type` exclude each
  other.
- A symbol has exactly one of `rva` and `export`. One at an `rva` needs `memory`, and
  `bytes` or `points_to` (a data symbol may have neither). For an `export`, `bytes` are
  optional and check the prologue.
- A block for `replace_block` may name `resume`, another symbol where the game continues;
  the default is the end of the block.
- A value has `at` (its offset in `bytes`) and either `size` (1, 2, 4 or 8) or
  `rip_relative`, the offset of the instruction's end, which yields an RVA.
- Names match `[a-z][a-z0-9_]*`; they become identifiers in the generated headers.

Before loading the DLL, Anvil compares every symbol with the running game:
`bytes` (`??` skipped), the memory kind against the section, and `points_to` against the
stored pointer. Bytes already changed by other plugins are compared in their original
form, so two plugins can rely on the same function. On a mismatch the plugin is skipped
with the symbol, the RVA and the first differing byte in the log.

### symbols.lock

`anvil check --exe` writes `symbols.lock` next to `plugin.toml`: the SHA-256 of `eu4.exe`,
a digest of `symbols.toml`, the build and the result. Commit it. Without the game,
`anvil check` fails when the lock is missing, does not match `symbols.toml`, or says
`result = "problems"`, so CI catches a symbol that was never checked against the game.

## settings.toml

What the player can change:

```toml
[setting.log_menu_returns]
type = "bool"              # bool, int, float, enum, string or key
default = true
label = "Log each return to the menu"
description = "Writes a line to anvil.log whenever the game returns to the main menu."
restart = false            # false: applies at once; default true: at the next start

[setting.mode]
type = "enum"
values = [{ name = "off", label = "Off" }, { name = "on", label = "On" }]
default = "off"
label = "Mode"

[setting.panel_key]
type = "key"
default = "Ctrl+Shift+F12"
label = "Panel key"
```

- `type`, `default` and `label` are required; `description`, `group` and `restart` are
  optional.
- `int` and `float` take optional `min`, `max` and `step`; `enum` takes `values`.
- A `key` is a binding such as `"Ctrl+Shift+F12"`, or `""` for none.

The player's values live in `anvil/data/<plugin-id>/settings.toml`, only those that differ
from the default, as `name = value`. The file can be edited by hand while the game is
closed. An invalid value falls back to the default with a warning in the log. For a test,
an environment variable `ANVIL_<ID>_<NAME>` (upper case, `-` as `_`) overrides a value for
one session.

The plugin reads validated values through the generated headers: `cfg::<name>.get()` in
C++, `host->setting_bool(self, CFG_<NAME>)` and its siblings in C. See
[Settings](../api/#settings) in the Host API.

## anvil gen

`anvil gen` (in the SDK's `bin/`) writes headers from `symbols.toml` and `settings.toml`.
`anvil_add_plugin` runs it at build time; call it yourself for other build systems:

```powershell
anvil gen [--lang c|cpp|rust] [--settings <settings.toml>] <symbols.toml|settings.toml>... <out-dir>
```

| File | Contents |
| --- | --- |
| `symbols.gen.h` | `SYM_<NAME>` ids, `sym_<name>_fn` function pointer types, `SYMVAL_<SYMBOL>_<VALUE>` values |
| `symbols.gen.hpp` | namespace `sym`: one typed constant per symbol, for example `sym::speed_object` |
| `settings.gen.h` | `CFG_<NAME>` ids and `CFG_<NAME>_<OPTION>` enum indices |
| `settings.gen.hpp` | namespace `cfg`: `cfg::<name>.get()` |
| `symbols.gen.rs`, `settings.gen.rs` | the same ids, function types and values for Rust (`--lang rust` only) |

Without `--lang` it writes the C and C++ headers. Declare the types named in `signature`
and `type` before including the header.

## anvil check

`anvil check` validates a plugin without starting the game:

```powershell
anvil check <plugin folder> [--exe <eu4.exe>] [--format text|json|github]
anvil check --game <game folder> [--format text|json|github]
```

- **Without `--exe`:** the schemas of the three files, names that `anvil gen` would refuse,
  and the `symbols.lock` check. This is what CI runs.
- **With `--exe`:** also the build, every symbol's bytes, memory kind, pointers, exports
  and values, and instruction boundaries: the declared bytes of a function or site must be
  whole instructions, and a hook must not relocate `JRCXZ`, `JECXZ` or `LOOP*`. It
  rewrites `symbols.lock`.
- **With `--game`:** checks every plugin in the game's `anvil/plugins/` and resolves them as
  the loader would: what loads in which order, what is skipped and why, and warnings for
  plugins whose code symbols overlap.
- **`--format github`** prints `::error file=…,line=…` annotations, so run it from the
  repository root in GitHub Actions.

Exit codes: `0` OK, `1` problems, `2` cannot check.
