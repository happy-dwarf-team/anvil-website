---
title: Plugins from mods
description: How Anvil loads plugins that come with mods from the Steam Workshop or the mod folder, and how you approve them.
---

From Anvil 1.3, a mod can carry Anvil plugins. When you enable such a mod in the Paradox
launcher, Anvil finds its plugins at the next start, but loads none of them until you approve
it. Plugins in `anvil/plugins/` work as before and need no approval.

## Why approval

A plugin is native code that runs inside the game, with the same rights as the game. A mod
can be updated by its author at any time, so Anvil never loads plugin code you have not seen:

- an approval covers exactly the files you approved, by their SHA-256 hash;
- Anvil loads the plugin from its own copy of those files, in
  `anvil/data/anvil/approved/<plugin-id>/<hash>/`, and checks the hash again right before it
  loads the DLL. If the mod's files change, Anvil keeps the copy you approved;
- a new version of the plugin waits for your approval, and the version you approved keeps
  running until then.

Only approve plugins from authors you trust. The approval prompt shows the plugin's name,
authors, version, the mod it comes with, whether it changes gameplay, how many game addresses
it uses, its hash and its repository.

## Approve a plugin

**In the game:** a notice lists the plugins that wait for you. Open the Anvil panel
(`Ctrl+Shift+F12`), go to the **Mods** tab, select the plugin and approve it with a second
click. The game is never paused. The plugin loads from the next start.

**Before you play:** in `AnvilManager.exe`, open the **Mods** tab and approve the plugin. The
Manager reads your playset again and only approves the plugin if the mod still has the version
it showed you. The plugin loads at the next start.

## Updates

When a mod brings a new version of its plugin, the **Mods** tab shows *update pending*. The
version you approved keeps loading until you approve the new one, also when the new one is
broken.

## Revoke an approval

In the overlay's or the Manager's **Mods** tab, click **Revoke the approval**. From the next start the
plugin no longer loads, and Anvil removes its copy. Disabling the mod in the launcher also
stops its plugins, but keeps the approval for when you enable the mod again.

## Special cases

- **The same plugin in two mods:** when two enabled mods have a plugin with the same id,
  neither loads until you approve one of them. That approval ties the id to that mod.
- **A plugin you installed yourself wins:** a plugin in `anvil/plugins/` with the same id is
  used instead of every mod's copy, and `anvil/anvil.log` names the mods it hides.
- **Local mods** (folders in `Documents/Paradox Interactive/Europa Universalis IV/mod`) are
  approved the same way as Workshop mods.
- **Safe mode** loads no plugins from mods.
- Zipped mods cannot carry plugins.

Your approvals are listed in `anvil/trust.toml`. You do not need to edit it; the Manager and
the overlay do that for you.

## For mod and plugin authors

Put each plugin folder (`plugin.toml`, `symbols.toml`, the DLL and the rest of the folder as
`anvil_add_plugin` lays it out) in `anvil/<plugin-id>/` inside your mod, next to
`descriptor.mod`. A mod can carry several plugins. The
[plugin template](https://github.com/happy-dwarf-team/anvil-plugin-template) releases such a
mod as `<id>-<version>-workshop.zip`. In Anvil's lab tests on EU4 1.37.5 (experiments E1
and E2 in Anvil's
[design notes, §14](https://github.com/happy-dwarf-team/anvil/blob/main/docs/design.md#14-workshop-distribution-and-trust)),
a mod that only has `descriptor.mod` and `anvil/` kept the game's checksum and ironman
achievements, and a private Workshop upload delivered the DLL byte for byte.
Every change to any file in the plugin folder is a new version that players have to
approve.
