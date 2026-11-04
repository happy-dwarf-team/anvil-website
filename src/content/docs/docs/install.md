---
title: Install Anvil
description: Install and uninstall Anvil, the plugin loader for Europa Universalis IV.
---

Anvil needs **Europa Universalis IV 1.37.5 for Windows, 64-bit, from Steam**, or the
**GOG build 1.37.5.2** ([On GOG](#on-gog)). It does not change `eu4.exe`, and
[uninstalling](#uninstall) puts the game back at once.

## Install with Anvil Manager

`AnvilManager.exe` is one program that installs Anvil and manages its plugins.

1. Download `AnvilManager.exe` with the button on the [home page](../../), or from the
   [latest release](https://github.com/happy-dwarf-team/anvil/releases/latest).
2. Run it. If your browser or Windows warns about the file, see
   [If Windows warns about the file](#if-windows-warns-about-the-file).
3. The Manager finds the game through Steam and, from Anvil 1.10, through GOG. If it asks,
   click **Use** next to the game, or **Choose the folder...** and pick the folder that
   contains `eu4.exe`.
4. Click **Install Anvil**. It copies `version.dll`, the `anvil` folder with the standard
   plugins, and itself (`AnvilManager.exe`) next to `eu4.exe`. From then on, start the
   Manager from the game folder; you can delete the file you downloaded.
5. Add plugins. The **Catalog** tab installs them with a click. You can also subscribe to
   them on the Steam Workshop and approve them on the **Mods** tab, or install a zip on the
   **Plugins** tab; see [Install plugins](../install-plugins/).
6. Start the game with **Play EU4**, or from Steam, GOG Galaxy or the Paradox launcher as
   usual.
   [Check that Anvil runs](#check-that-anvil-runs).

The Manager runs without administrator rights; Steam's library folders do not need them.
If Windows refuses access to the game folder, it offers to start again as administrator.
While the game runs, it only shows the state and changes nothing. It downloads only what
you click, and it can check GitHub for a newer Anvil release when it starts: it asks once
whether you want this, and then only shows a link.

### If Windows warns about the file

Anvil's files are not code-signed, and this is not planned
([#157](https://github.com/happy-dwarf-team/anvil/issues/157)), so Windows does not know
them yet:

- **Your browser** may say that the file is not commonly downloaded. Choose to keep it.
- **Windows SmartScreen** may say "Windows protected your PC" on the first start. Choose
  **More info**, then **Run anyway**.

To check the file first, compare its SHA-256 with the one under the download button, or in
`SHA256SUMS.txt` of the same release. In PowerShell:

```powershell
Get-FileHash .\AnvilManager.exe -Algorithm SHA256
```

Each release is built by GitHub Actions from public source, and has a build attestation
(`gh attestation verify AnvilManager.exe -R happy-dwarf-team/anvil`). If your antivirus
removes a file, see [Antivirus warnings](../troubleshooting/#antivirus-warnings).

### The Manager's tabs

| Tab | What it does |
| --- | --- |
| **Anvil** | Installs, updates, repairs and uninstalls Anvil. |
| **Catalog** | Installs and updates the team's plugins with a click (Anvil 1.9 and later). |
| **Plugins** | Shows which plugins will load and why one is skipped, turns them on and off, removes them, and installs a zip. |
| **Mods** | Approves plugins that come with a mod, such as a Steam Workshop item. |
| **Settings** | Edits plugin settings. |
| **Benchmark** | Measures how much faster a plugin makes the game start; see [Start-up benchmark](../benchmark/). |
| **Crashes** | Shows crash reports. |
| **Log** | Shows `anvil.log`, and copies a [problem report](../troubleshooting/#reporting-a-problem) for an issue. |

## On GOG

Anvil runs on the GOG build 1.37.5.2, and so do the catalog's plugins: Bellows, Tongs,
Hamweard and Mei.

1. Update the game to 1.37.5.2 in GOG Galaxy. The other GOG build of 1.37.5 (1.37.5.0) is
   not known yet ([#187](https://github.com/happy-dwarf-team/anvil/issues/187)): the game
   starts, but plugins that use game addresses are skipped, and from Anvil 1.10 the Manager,
   the overlay and `anvil/anvil.log` tell you to update.
2. Follow [Install with Anvil Manager](#install-with-anvil-manager). From Anvil 1.10 the
   Manager finds the game. Before that, in step 3 click **Choose the folder...** and pick
   the folder that contains `eu4.exe`. To find it in GOG Galaxy: **Manage installation** →
   **Show folder**.
3. Get plugins from the **Catalog** tab. The Steam Workshop does not reach a GOG game. For
   Mei's own fonts see [its page](../../plugins/mei/).
4. Start the game from GOG Galaxy or the Paradox launcher. From Anvil 1.10, **Play EU4**
   starts it through GOG's launcher; in Anvil 1.9 it starts Steam, so do not use it there.

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
6. Start the game as usual, from Steam, GOG Galaxy or the Paradox launcher.

After the first start, `anvil/anvil.log` lists what was loaded. See
[Troubleshooting](../troubleshooting/) if something looks wrong.

## Check that Anvil runs

From Anvil 1.8, the game's main menu shows a small **Anvil** badge with its version on the
left edge. Point at it to see how many plugins loaded; click it to open the Anvil panel
with the plugins' status, their settings, the crash report and the log (the key
`Ctrl+Shift+F12` opens the same panel, also during a game). The badge is only in the main
menu, never in a game. To hide it, turn off **Show Anvil in the main menu** on the panel's
**Settings** tab (plugin `anvil-overlay`).

![The Anvil badge on the left edge of the game's main menu, with its tooltip: Anvil 1.8.0, 5 loaded, 0 failed, 0 skipped; click to open the Anvil panel, or press Ctrl+Shift+F12.](../../../assets/menu-badge.png)

The overlay draws on the game's Direct3D 9 renderer; with OpenGL there is no badge and no
panel, and Anvil Manager shows the same information outside the game.

## Language

From Anvil 1.7, the Manager and the in-game overlay use the language EU4 is set to: English,
French, German or Spanish; any other language shows English. From Anvil 1.9 they also speak
Simplified Chinese, Traditional Chinese, Japanese and Korean. EU4 has none of these itself:
a translation mod replaces its English text and [Mei](../../plugins/mei/) shows it. So while
Mei loads, Anvil takes the language Steam is set to, or else the one Windows is set to, when
it is Chinese, Japanese or Korean. The overlay's setting **Language** (Anvil panel,
Settings, anvil-overlay) picks one of the eight for the overlay and the Manager; for a test,
the environment variable `ANVIL_LANGUAGE` (`en`, `fr`, `de`, `es`, `zh-Hans`, `zh-Hant`,
`ja`, `ko`) wins over both. `anvil.log` and `anvil check` stay in English, as do the names,
descriptions and setting labels a plugin brings. The translations have not been checked by
a native speaker yet; corrections are welcome in
[issue #158](https://github.com/happy-dwarf-team/anvil/issues/158).

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

## Turn plugins off

To turn plugins off without uninstalling, untick them on the Manager's **Plugins** tab, or
set `enabled = false` in `anvil/anvil.toml`, or list single plugins in `disabled_plugins`:

```toml
enabled = true
disabled_plugins = ["bellows"]
log_level = "info"            # "debug", "info", "warning" or "error"
```

`log_level` sets how much `anvil/anvil.log` records; `debug` helps when reporting a problem.

To start once without plugins, see [Troubleshooting](../troubleshooting/#start-once-without-plugins).

## Uninstall

With the Manager: on the **Anvil** tab, **Uninstall Anvil** removes `version.dll`, the
standard plugins and `AnvilManager.exe`. The game is vanilla at once. Your plugins, their
settings and data in `anvil/data/`, crash reports, logs and `anvil/anvil.toml` stay, so
installing again brings everything back. Tick **Also remove my plugins…** to remove the
whole `anvil` folder too.

By hand: delete `version.dll`, `AnvilManager.exe` (if there) and the `anvil` folder.
Nothing else was changed, so the game is back to vanilla.

A plugin from the Steam Workshop does nothing without Anvil. To remove it too, unsubscribe
from it on the Workshop.

## Game updates

Plugins declare the game code they rely on, and Anvil checks it against the running game
before it loads them. After an EU4 update, plugins whose code no longer matches are skipped
and the game starts normally until they are updated.
Steam updates and **Verify integrity of game files** are not affected, because
`eu4.exe` is never modified.
