---
title: Install, update and remove plugins
description: Add plugins to Anvil, check that they loaded, update and remove them.
---

Plugins are folders in `anvil/plugins/`, one per plugin. Anvil loads them when the game
starts; nothing else is installed or registered.

## Before you start

- [Install Anvil](../install/) first.
- On the plugin's page in the [catalog](../../plugins/), check **Requires** (the Anvil
  version the plugin needs) and **Game builds**. On another game build Anvil skips the
  plugin and the game starts normally.

## Install a plugin

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
bellows 0.7.0: loaded (early, …)
```

A plugin that was not loaded has `skipped —` and the reason, or an error from
`anvil_plugin_load`; see [Troubleshooting](../troubleshooting/).

The same log shows which game build Anvil detected, in the line that starts with
`game build:`. Compare it with the plugin's **Game builds**; `unknown` means a build that
no plugin knows yet, for example after an EU4 update.

## Settings

A plugin keeps its settings and other files it writes in `anvil/data/<plugin-id>/`, for
example `anvil/data/bellows/config.toml`. The plugin's page describes them. Many plugins
create their settings file on the first start.

## Update a plugin

1. Delete the plugin's folder in `anvil/plugins/`, so no files of the old version remain.
2. Extract the new archive as above.

`anvil/data/<plugin-id>/` stays, so your settings are kept. Read the plugin's page before
updating: it lists the rare cases that need more, such as a renamed plugin.

## Turn a plugin off or remove it

- **Off for now:** add its id to `disabled_plugins` in `anvil/anvil.toml`, for example
  `disabled_plugins = ["bellows"]`. The log then says `disabled in anvil.toml`.
- **Remove:** delete its folder in `anvil/plugins/`. Delete `anvil/data/<plugin-id>/` too
  if you do not want to keep its settings.
