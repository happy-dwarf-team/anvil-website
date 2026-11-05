---
title: Manifest reference
description: plugin.toml, symbols.toml, symbols.lock and settings.toml for plugin API 2, and the anvil gen, anvil check and anvil port tools.
---

A plugin folder has up to three TOML files: `plugin.toml` (required), `symbols.toml` and
`settings.toml`. All three are strict: **an unknown key is an error** and the plugin is
skipped, with the file and line in the log. `anvil check` reports the same errors before
you ship.

Real files: the
[hello examples](https://github.com/happy-dwarf-team/anvil/tree/main/examples), the
[template](https://github.com/happy-dwarf-team/anvil-plugin-template) and the plugins in
the [Plugins page](../../../plugins/).

## plugin.toml

From Anvil 1.12, a `plugin.toml` over 1 MB, or a `symbols.toml` or `settings.toml` over 16 MB, is not read.

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
  one, Anvil skips the plugin. For several builds see below.
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

### Several builds

From Anvil 1.7, a file can declare more than one build, for example Steam and the GOG build
1.37.5.2. It lists them in `builds` instead of `build` and still declares each symbol once.
What a symbol is stays shared; only `rva`, `bytes` and `points_to` may differ, in a
`build."<id>"` table of the symbol:

```toml
builds = ["eu4-1.37.5-steam-win64", "eu4-1.37.5.2-gog-win64"]

[symbol.frame]                        # the same bytes, another address
bytes = "48 89 5C 24 08 48 89 6C 24 10"
memory = "code"
signature = "uintptr_t (void* app, uint8_t outer)"
build."eu4-1.37.5-steam-win64" = { rva = 0x14C25A0 }
build."eu4-1.37.5.2-gog-win64" = { rva = 0x14BC400 }

[symbol.speed_object]                 # other bytes: a table per build
memory = "code"
values.speed = { at = 3, size = 4 }   # 0x418 on Steam, 0x408 on GOG

[symbol.speed_object.build."eu4-1.37.5-steam-win64"]
rva = 0x8024D0
bytes = "48 8B 81 18 04 00 00 C3"

[symbol.speed_object.build."eu4-1.37.5.2-gog-win64"]
rva = 0x801850
bytes = "48 8B 81 08 04 00 00 C3"
```

- Each of `rva`, `bytes` and `points_to` is given either for every build or per build, not
  both. Each build must pass the rules above on its own; an error names the build.
- A symbol keeps its id in every build, so the plugin's code does not change. Anvil uses
  the running game's addresses, and a file that does not list the running build skips the
  plugin.
- `anvil gen` writes a value as a constant only when every build has the same one;
  otherwise the plugin reads it when the game loads (`symbol_value`).
- `anvil check --exe` checks the build of the `eu4.exe` it is given, so run it once per
  build. The lock then keeps one check per build.

### Absent symbols

From Anvil 1.9, a symbol may be missing from one of the builds a file lists, such as Steam
code the GOG build does not have. `absent` names those builds; the symbol's other keys
apply to the builds it is in:

```toml
[symbol.lobby_close]
rva = 0x1658D50
bytes = "40 53 48 83 EC 20"
memory = "code"
signature = "void (void* lobby)"
absent = ["eu4-1.37.5.2-gog-win64"]
```

- On an absent build the symbol is not checked and has no address: `address_of` returns
  `NULL`, and a hook or patch on it fails with `ANVIL_ERROR_NOT_DECLARED`. Check it before
  you use it: `host->address_of(self, SYM_LOBBY_CLOSE) != NULL` in C,
  `host.present(sym::lobby_close)` in C++.
- `absent` needs `builds`, cannot list every build, and an absent build gets no
  `build."<id>"` table. A `resume` must name a symbol that is in every build its block is
  in.
- Only the builds `absent` names are exempt: a symbol that does not verify on any other
  build still skips the plugin.
- `anvil check --exe` lists the symbols absent on the exe's build, and `anvil gen` names
  the absent builds in each symbol's comment.
- An older Anvil does not know the key and skips the plugin, so declare
  `anvil = ">=1.9.0"`.

### Digests instead of bytes

`bytes` puts short pieces of `eu4.exe` in your repository, zip and Workshop item. From Anvil
1.10 a symbol can state their SHA-256 instead, so these files hold no game code:

```toml
[symbol.speed_object]
rva = 0x8024D0
sha256 = "5F3A…"                                 # of the bytes at rva, with the `any` offsets set to 0
size = 8                                         # required with sha256
any = [3, 4]                                     # optional: offsets not compared, as ?? in bytes
memory = "code"
values.speed = { at = 3, size = 4, is = 0x418 }  # optional is: the value the bytes must give
```

- `sha256`, `size` and `any` are placement keys like `bytes`, shared or per build. `bytes` and
  `sha256` exclude each other per placement.
- A `value` with `is` keeps its `anvil gen` constant; without `is` it is read when the game
  loads.
- Write `bytes` while you work, then run
  [`tools/symbols-to-digest.py`](https://github.com/happy-dwarf-team/anvil/blob/main/tools/symbols-to-digest.py),
  which needs no game, and `anvil check --exe` once per build.
- A mismatch names both digests, not the first differing byte, and a port to another game build
  needs the old `eu4.exe`, because the repository no longer holds the pattern.
- An older Anvil does not know the keys and skips the plugin, so declare `anvil = ">=1.10.0"`.
  `bytes` stays valid for all of plugin API 2. The template uses it for readability.

[ADR 0003](https://github.com/happy-dwarf-team/anvil/blob/main/docs/adr/0003-symbol-digests.md)
has the reasons and the limits: a digest is not secrecy.

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

## anvil port

After a game update, `anvil port` places a plugin's symbols in the new build. It needs the old
`eu4.exe` as well as the new one, so keep a copy before the game updates:

```powershell
anvil port symbols.toml --from <old eu4.exe> --to <new eu4.exe> --build <new build id> --out symbols.toml
```

Add `--from-build <id>` when this Anvil does not know the old `eu4.exe`, and
`--format json` for a report you can feed to a generator. Without `--out` nothing is written.

It compares the code of both builds with the addresses the linker chose set aside, and adds a
`build."<id>"` entry to each symbol, keeping your comments and layout. Symbols with `sha256`
stay digests. The tool never touches `eu4.exe`.

A wrong address is worse than none, so a symbol stays for you to place when:

- its code has no match in the new build, or more than one;
- the only match is out of order with the functions around it, or refers to other code;
- an operand differs that no `values` entry declares, because your plugin may depend on it;
- it fails what `anvil check --exe` would report for the new build.

Each of those gets a comment in the file with the reason and, where one is known, an address to
look at. The file does not parse until you place the symbol or declare it `absent`. The entry of
a function whose operands changed is placed, with a warning to read it.

Exit codes: `0` every symbol placed, `1` some left for you, `2` cannot port. Then run
`anvil check --exe` for each build, which needs an Anvil that knows the new one.

On the two builds we have, Steam 1.37.5 and GOG 1.37.5.2, it placed 98.4% of the symbols in our
five plugin files with no wrong address, but those builds are close. Expect a longer list after a
real update, which it has not met yet.
