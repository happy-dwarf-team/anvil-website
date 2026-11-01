---
title: Install Anvil
description: Install and uninstall Anvil, the plugin loader for Europa Universalis IV.
---

Anvil works with **Europa Universalis IV for Windows, 64-bit, from Steam**.

## Install with Anvil Manager

From Anvil 1.2, each release has `AnvilManager.exe`, a single program that installs Anvil
and manages its plugins. It carries the Anvil of its own release; nothing else is
downloaded.

1. Download `AnvilManager.exe` from the
   [latest release](https://github.com/happy-dwarf-team/anvil/releases/latest). Optional:
   compare its SHA-256 with `SHA256SUMS.txt` from the same release, as below.
2. Run it. It finds the game through Steam; otherwise choose the folder that contains
   `eu4.exe`.
3. Click **Install Anvil**. It copies `version.dll`, the `anvil` folder with the standard
   plugins, and itself (`AnvilManager.exe`) next to `eu4.exe`. From then on, start the
   Manager from the game folder.
4. Add plugins on the **Plugins** tab, or approve plugins from Steam Workshop mods on the
   **Mods** tab; see [Install plugins](../install-plugins/).
5. Start the game with **Play EU4**, or from Steam or the Paradox launcher as usual.

The Manager runs without administrator rights; Steam's library folders do not need them.
If Windows refuses access to the game folder, it offers to start again as administrator.
While the game runs, it only shows the state and changes nothing.

Windows SmartScreen may warn about `AnvilManager.exe` on the first start, because the
program is not code-signed: choose **More info** → **Run anyway**. The release page lists
its SHA-256 and a build attestation (`gh attestation verify AnvilManager.exe -R
happy-dwarf-team/anvil`).

The Manager's other tabs edit plugin settings (**Settings**), measure how much faster a plugin
makes the game start (**Benchmark**, from Anvil 1.5; see [Start-up benchmark](../benchmark/)),
and show crash reports and the log.

The Manager can also check GitHub for a newer Anvil release when it starts. It asks once
whether you want this; it only shows a link and downloads nothing.

## Install by hand

1. Download `anvil-windows-x64.zip` from the
   [latest release](https://github.com/happy-dwarf-team/anvil/releases/latest).
2. Optional: compare the archive's SHA-256 with `SHA256SUMS.txt` from the same release.
   In PowerShell:

   ```powershell
   Get-FileHash .\anvil-windows-x64.zip -Algorithm SHA256
   ```

3. Find the game folder. In Steam, right-click Europa Universalis IV →
   **Manage** → **Browse local files**. It is the folder that contains `eu4.exe`.
4. Extract the archive into that folder. You should now see `version.dll` and an `anvil`
   folder next to `eu4.exe` (from Anvil 1.2 also `AnvilManager.exe`).
5. Put plugins into `anvil/plugins/`, one folder per plugin, for example
   `anvil/plugins/bellows/`; see [Install plugins](../install-plugins/).
6. Start the game as usual, from Steam or the Paradox launcher.

After the first start, `anvil/anvil.log` lists what was loaded. See
[Troubleshooting](../troubleshooting/) if something looks wrong.

## Folder layout

```
<game folder>/
  eu4.exe
  version.dll                    Anvil
  AnvilManager.exe               installer and plugin manager (Anvil 1.2 and later)
  anvil/
    anvil.toml                   optional settings
    anvil.log                    log of the last start
    crashes/                     crash reports of the last 10 crashes
    plugins/anvil-game/          standard plugins that ship with Anvil
    plugins/anvil-overlay/
    plugins/anvil-log-throttle/  (Anvil 1.6 and later)
    plugins/<plugin-id>/         plugin manifest and DLL
    data/<plugin-id>/            files a plugin writes (caches, settings)
    data/anvil/                  approved plugins from mods, kept benchmark reports
    trust.toml                   your approvals of plugins from mods (Anvil 1.3 and later)
```

Keep `anvil-game` installed and enabled: it tells other plugins when the game is ready
and when a game session starts, and plugins that depend on it are skipped without it.

From Anvil 1.6, `anvil-log-throttle` keeps the game's `error.log` short. A line that
repeats is written 10 times, and after that only counted: a line
`[anvil-log-throttle] repeated <n> more times in the last <s> s: <text>` gives the count
every minute and when the game closes the log. To get every line, for example while
debugging a mod, turn on **Write every line** (`full_log`) in the overlay's panel, or
disable the plugin.

## Update Anvil

Run `AnvilManager.exe` of the newer release and click **Install Anvil**: it replaces
Anvil's own files and the Manager in the game folder, and keeps `anvil/anvil.toml`, your
plugins and their settings. By hand, extract the newer archive over the old one.

**Repair** on the Manager's **Anvil** tab puts back Anvil's own files if one is missing or
changed.

## Uninstall

With the Manager: **Uninstall Anvil** removes `version.dll`, the standard plugins and
`AnvilManager.exe`. The game is vanilla at once. Your plugins, their settings and data in
`anvil/data/`, crash reports, logs and `anvil/anvil.toml` stay, so installing again brings
everything back. Tick **Also remove my plugins…** to remove the whole `anvil` folder too.

By hand: delete `version.dll`, `AnvilManager.exe` (if there) and the `anvil` folder.
Nothing else was changed, so the game is back to vanilla.

To turn plugins off without uninstalling, untick them on the Manager's **Plugins** tab, or
set `enabled = false` in `anvil/anvil.toml`, or list single plugins in `disabled_plugins`:

```toml
enabled = true
disabled_plugins = ["bellows"]
log_level = "info"            # "debug", "info", "warning" or "error"
```

`log_level` sets how much `anvil/anvil.log` records; `debug` helps when reporting a problem.

## Game updates

Plugins declare the game code they rely on, and Anvil checks it against the running game
before it loads them. After an EU4 update, plugins whose code no longer matches are skipped
and the game starts normally until they are updated.
Steam updates and **Verify integrity of game files** are not affected, because
`eu4.exe` is never modified.
