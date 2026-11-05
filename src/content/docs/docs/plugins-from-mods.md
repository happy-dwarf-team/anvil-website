---
title: Plugins from mods
description: Why Anvil asks you to approve a plugin that comes with a mod, what the approval covers, and the special cases.
---

A mod can carry Anvil plugins, on the Steam Workshop or in your mod folder. When you enable such
a mod, Anvil finds its plugins at the next start, but loads none of them until you approve it.

The steps are on [Install plugins](../install-plugins/#from-the-steam-workshop). This page says
why Anvil asks, and covers the special cases. Plugins in `anvil/plugins/` need no approval.

## Why approval

A plugin is native code that runs inside the game, with the same rights as the game. A mod can be
updated by its author at any time, so Anvil never loads plugin code you have not seen:

- An approval covers exactly the files you approved, by their SHA-256 hash.
- Anvil loads the plugin from its own copy of those files, and checks the hash again right before
  it loads the DLL. If the mod's files change, Anvil keeps the copy you approved.
- A new version waits for your approval. The version you approved keeps running until then, also
  when the new one is broken.

The prompt shows the plugin's name, authors, version, the mod it comes with, whether it changes
gameplay, how many game addresses it uses, its hash and its repository. The name, the authors and
the repository are what the mod says, and Anvil cannot check them. Only approve plugins from
authors you trust.

## Where to approve

- **In the game:** in the Anvil panel (`Ctrl+Shift+F12`), go to **Mods**, select the plugin and
  approve it with a second click. The game is never paused.
- **Before you play:** on the **Mods** tab of `AnvilManager.exe`. The Manager reads your playset
  again and approves the plugin only if the mod still has the version it showed you.

Either way the plugin loads at the next start.

## Revoke an approval

On the **Mods** tab, in the panel or the Manager, click **Revoke the approval**. From the next
start the plugin no longer loads, and Anvil removes its copy. Disabling the mod in the launcher
also stops its plugins, but keeps the approval for when you enable the mod again.

## Special cases

- **The same plugin in two mods:** neither loads until you approve one of them. That approval ties
  the id to that mod.
- **A plugin you installed yourself wins:** a plugin in `anvil/plugins/` with the same id is used
  instead of every mod's copy, and `anvil/anvil.log` names the mods it hides.
- **Local mods** (folders in `Documents/Paradox Interactive/Europa Universalis IV/mod`, or
  `Europa Universalis IV GOG/mod` for a GOG game) are approved the same way as Workshop mods.
- **Safe mode** loads no plugins from mods.
- **Zipped mods** cannot carry plugins.

Your approvals are listed in `anvil/trust.toml`. You do not need to edit it.

Writing a plugin? [Publish your plugin on the Steam Workshop](../plugins/workshop/) shows how it
gets into a mod.
