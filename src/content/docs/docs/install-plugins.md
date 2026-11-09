---
title: Install, update and remove plugins
description: Add plugins to Anvil, check that they loaded, change their settings, update and remove them.
---

[Install Anvil](../install/) first. Then pick one of these ways. If you are not sure, use the
**Catalog** tab.

| Way | Works on | To update |
| --- | --- | --- |
| [**Catalog** tab of the Manager](#from-the-catalog-tab) | Steam, GOG | Click **Update** |
| [Steam Workshop](#from-the-steam-workshop) | Steam | Comes with the mod; approve each new version |
| [A zip, with the Manager](#from-a-zip) | Steam, GOG | Install the newer zip |
| [By hand](#by-hand) | Steam, GOG | Replace the folder |

A plugin is native code that runs inside the game with your rights, like any program. Install
plugins only from authors you trust.

Each [plugin's page](../../plugins/) shows **Requires** (the Anvil version it needs) and **Game
builds**. On another game build Anvil skips the plugin and the game starts normally.

## From the Catalog tab

The **Catalog** tab of `AnvilManager.exe` lists the team's plugins:
[Bellows](../../plugins/bellows/), [Tongs](../../plugins/tongs/),
[Hamweard](../../plugins/hamweard/), [Mei](../../plugins/mei/) and [Hoard](../../plugins/hoard/).
It needs Anvil 1.9 or newer.

1. Click **Install** next to the plugin. The Manager names the file, its size and the GitHub
   repository it comes from.
2. Click **Download**. The Manager installs nothing unless the file's SHA-256 equals the one in
   the list.
3. It shows the plugin's details. Click **Install** again.

When a newer release is listed than the one you have, the button says **Update**. The list comes
with the Manager; **Get the current list** fetches the newest one from GitHub. Nothing goes to
the network before you click.

## From the Steam Workshop

1. Subscribe to the plugin's Workshop item, and enable the mod in your playset in the Paradox
   launcher. A plugin's page links its item.
2. Start the game. A notice says that a plugin waits for your approval. Open the Anvil panel
   (`Ctrl+Shift+F12`), go to **Mods** and approve it. You can also do this before playing, on
   the **Mods** tab of `AnvilManager.exe`.
3. Start the game again: the plugin loads from then on.

Anvil asks again after every update of the mod. Until then the version you approved keeps
working. [Plugins from mods](../plugins-from-mods/) says why.

The Workshop cannot install Anvil itself, so install Anvil first. It does not reach a GOG game
either; there, use the **Catalog** tab.

## From a zip

1. Download the plugin's archive, for example `bellows-windows-x64.zip`, with the button on its
   page.
2. In `AnvilManager.exe`, open the **Plugins** tab and click **Install a plugin from a zip…**, or
   drop the zip on the window.
3. The Manager checks the plugin against your game. It shows the name, version, authors, whether
   the plugin changes gameplay, any problems, and whether Anvil would skip it.
4. Click **Install**. The plugin goes to `anvil/plugins/<plugin-id>/`.

## By hand

1. Download the plugin's archive, for example `bellows-windows-x64.zip`, with the button on its
   page.
2. Extract it into `anvil/plugins/` in the game folder. It contains one folder named after the
   plugin, so you get:

   ```
   <game folder>/anvil/plugins/bellows/
     plugin.toml
     bellows.dll
   ```

3. Start the game as usual.

To check a file before you install it, see
[Check a download yourself](../safety/#check-a-download-yourself).

## Check that it loaded

In the game's main menu, point at the **Anvil** badge to see how many plugins loaded. The
Manager's **Plugins** tab shows the same without starting the game, and why a plugin is skipped.

For details, open `anvil/anvil.log` after the start. A loaded plugin has a line with its id,
version and `loaded`:

```
bellows 1.2.0: loaded (early, …)
```

A plugin that was not loaded has `skipped —` and the reason; see
[Troubleshooting](../troubleshooting/).

The line that starts with `game build:` shows which game build Anvil detected. `unknown` means a
build no plugin knows yet, for example after an EU4 update.

## Settings

Change a plugin's settings on the **Settings** tab of the Manager, or in the Anvil panel in the
game. The plugin's page describes them.

By hand: `anvil/data/<plugin-id>/settings.toml` holds only the values you changed. The defaults
come from the plugin itself.

## Update a plugin

- **From the Catalog tab:** click **Get the current list**, then **Update**.
- **From the Workshop:** the mod updates by itself. Approve the new version on the **Mods** tab.
- **From a zip:** install the new zip with the Manager. It replaces the old version.
- **By hand:** delete the plugin's folder in `anvil/plugins/`, then extract the new archive.

Your settings in `anvil/data/<plugin-id>/` stay. Read the plugin's page first: it lists the rare
cases that need more, such as a renamed plugin.

## Turn a plugin off or remove it

- **Off for now:** untick it on the Manager's **Plugins** tab. By hand, add its id to
  `disabled_plugins` in [`anvil/anvil.toml`](../using-anvil/#anvils-settings-file).
- **Remove:** click **Remove** on the **Plugins** tab, or delete its folder in `anvil/plugins/`.
  Its settings in `anvil/data/<plugin-id>/` stay; delete that folder too if you do not want them.
- **From a mod:** disable the mod in the launcher, unsubscribe from it, or revoke its approval on
  the **Mods** tab.
