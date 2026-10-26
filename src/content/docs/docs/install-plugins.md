---
title: Install, update and remove plugins
description: Add plugins to Anvil, check that they loaded, update and remove them.
---

Plugins are folders in `anvil/plugins/`, one per plugin. Anvil loads them when the game
starts; nothing else is installed or registered. From Anvil 1.3 a plugin can also come with
a mod, for example from the Steam Workshop; see [below](#install-a-plugin-from-the-steam-workshop).

## Before you start

- [Install Anvil](../install/) first.
- On the plugin's page in the [catalog](../../plugins/), check **Requires** (the Anvil
  version the plugin needs) and **Game builds**. On another game build Anvil skips the
  plugin and the game starts normally.

## Install a plugin with Anvil Manager

1. Download the plugin's archive, for example `bellows-windows-x64.zip`.
2. In `AnvilManager.exe`, open the **Plugins** tab and click **Install a plugin from a
   zip…**, or drop the zip on the window.
3. Before anything is copied, the Manager checks the plugin the way `anvil check` does:
   its manifest, and its game addresses against your `eu4.exe`. It shows the name,
   version, authors, whether the plugin changes gameplay, any problems, and whether Anvil
   would skip it on your game build.
4. Click **Install**. The plugin goes to `anvil/plugins/<plugin-id>/` and replaces an
   older version there; `anvil/data/<plugin-id>/` with its settings stays.

A plugin is native code that runs inside the game with your rights, like any program:
install plugins only from authors you trust. Files next to the plugin's folder in the zip,
such as `SHA256SUMS.txt`, are not installed.

The **Plugins** tab also shows which plugins will load, in which order, and why one is
skipped, without starting the game. It turns plugins on and off, allows the ones that
offer it in ironman or multiplayer, and removes them; **Settings** edits a plugin's
settings.

## Install a plugin from the Steam Workshop

From Anvil 1.3, a plugin can come with a mod that you enable in the Paradox launcher.
[Bellows](../../plugins/bellows/) and [Tongs](../../plugins/tongs/) are on the Steam
Workshop; a plugin's page links its Workshop item when it has one.

1. Subscribe to the plugin's Workshop item and enable the mod in your playset.
2. Start the game. A notice lists the plugins that wait for your approval: open the Anvil
   panel (`Ctrl+Shift+F12`), go to **Mods** and approve the plugin. Or approve it before
   playing, on the **Mods** tab of `AnvilManager.exe`.
3. The plugin loads from the next start.

Anvil installs nothing into `anvil/plugins/` for a mod: it loads the approved version from
its own copy, and asks again after every update of the mod. A plugin with the same id in
`anvil/plugins/` wins over the mod's copy. Details: [Plugins from mods](../plugins-from-mods/).
The Workshop cannot install Anvil itself; [install Anvil](../install/) first.

## Install a plugin by hand

1. Download the plugin's archive, for example `bellows-windows-x64.zip`, with the download
   button on its page.
2. Optional: compare the archive's SHA-256 with the one shown under the button. In
   PowerShell:

   ```powershell
   Get-FileHash .\bellows-windows-x64.zip -Algorithm SHA256
   ```

3. Extract the archive into `anvil/plugins/` in the game folder. It contains one folder
   named after the plugin, so you get:

   ```
   <game folder>/anvil/plugins/bellows/
     plugin.toml
     bellows.dll
   ```

4. Start the game as usual.

## Check that it loaded

Open `anvil/anvil.log` after the start. A loaded plugin has a line with its id, version
and `loaded`, for example:

```
bellows 0.10.0: loaded (early, …)
```

A plugin that was not loaded has `skipped —` and the reason, or an error from
`anvil_plugin_load`; see [Troubleshooting](../troubleshooting/).

The same log shows which game build Anvil detected, in the line that starts with
`game build:`. Compare it with the plugin's **Game builds**; `unknown` means a build that
no plugin knows yet, for example after an EU4 update.

## Settings

A plugin keeps its settings and other files it writes in `anvil/data/<plugin-id>/`, for
example `anvil/data/bellows/settings.toml`. That file holds only the values you changed;
the defaults come from the plugin's own `settings.toml`. Change them on the **Settings** tab
of Anvil Manager, in the Anvil panel in the game, or by hand; the plugin's page describes
them.

## Update a plugin

A plugin from the Steam Workshop updates with its mod; approve the new version in the
**Mods** tab. A plugin from a zip: install the new zip with the Manager, which replaces the
old version, or by hand:

1. Delete the plugin's folder in `anvil/plugins/`, so no files of the old version remain.
2. Extract the new archive as above.

`anvil/data/<plugin-id>/` stays, so your settings are kept. Read the plugin's page before
updating: it lists the rare cases that need more, such as a renamed plugin.

## Turn a plugin off or remove it

A plugin from a mod stops when you disable or unsubscribe from the mod, or revoke its
approval in the **Mods** tab.

With the Manager, untick the plugin on the **Plugins** tab, or click **Remove** (its
settings in `anvil/data/<plugin-id>/` stay). By hand:

- **Off for now:** add its id to `disabled_plugins` in `anvil/anvil.toml`, for example
  `disabled_plugins = ["bellows"]`. The log then says `disabled in anvil.toml`.
- **Remove:** delete its folder in `anvil/plugins/`. Delete `anvil/data/<plugin-id>/` too
  if you do not want to keep its settings.
