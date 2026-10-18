---
title: Install Anvil
description: Install and uninstall Anvil, the plugin loader for Europa Universalis IV.
---

Anvil works with **Europa Universalis IV for Windows, 64-bit, from Steam**.

## Install

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
   folder next to `eu4.exe`.
5. Put plugins into `anvil/plugins/`, one folder per plugin, for example
   `anvil/plugins/bellows/`.
6. Start the game as usual, from Steam or the Paradox launcher.

After the first start, `anvil/anvil.log` lists what was loaded. See
[Troubleshooting](../troubleshooting/) if something looks wrong.

## Folder layout

```
<game folder>/
  eu4.exe
  version.dll              Anvil
  anvil/
    anvil.toml             optional settings
    anvil.log              log of the last start
    plugins/<plugin-id>/   plugin manifest and DLL
    data/<plugin-id>/      files a plugin writes (caches, settings)
```

## Uninstall

Delete `version.dll` and the `anvil` folder. Nothing else was changed, so the game is back
to vanilla.

To turn plugins off without uninstalling, set `enabled = false` in `anvil/anvil.toml`, or
list single plugins in `disabled_plugins`:

```toml
enabled = true
disabled_plugins = ["bellows"]
log_level = "info"            # "debug", "info", "warning" or "error"
```

`log_level` sets how much `anvil/anvil.log` records; `debug` helps when reporting a problem.

## Game updates

Plugins declare which game builds they support. After an EU4 update, plugins that do not
know the new build are skipped and the game starts normally until they are updated.
Steam updates and **Verify integrity of game files** are not affected, because
`eu4.exe` is never modified.
