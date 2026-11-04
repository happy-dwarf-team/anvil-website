---
name: Hamweard
summary: Back to the main menu without restarting the game. Exit to Menu in a campaign and Back on the country selection screen return to the main menu in the same process. A port of EU4 Menu Patch by VulonLok.
tagline: Takes you from a campaign back to the main menu in seconds, without restarting the game.
repo: https://github.com/happy-dwarf-team/hamweard
status: released
gameBuilds: ['eu4-1.37.5-steam-win64', 'eu4-1.37.5.2-gog-win64']
affectsGameplay: true
order: 30
workshop: '3832650792'
manifestPath: plugin.toml
---

Without Hamweard, **Exit to Menu** in a campaign and **Back** on the country selection
screen close Europa Universalis IV and start it again. With it, both return to the main menu
in the same process, in about 4 seconds in the lab, and **Continue game** points at the
latest save, as after a restart.

Hamweard is a port of [EU4 Menu Patch](https://github.com/YozoraTempest/EU4-Menu-Patch) by
VulonLok (MIT), which needs a separate EU4DLL-style loader. The research is the original's:
where the game restarts and what it leaves behind (the Steam lobby, the minimap controller,
pending diplomatic notifications, the Continue game record). The port runs on Anvil and also
destroys the windows each campaign leaves in the interface, which made a later campaign
crash in the lab.

The name is Old English *hāmweard*, "homeward": back from a campaign to the main menu as if
back home. The team's other tools are named after the forge (Anvil, Bellows, Tongs, Etch).

## Limitations

- **Affects gameplay.** The next campaign starts in the same process instead of a fresh
  one, so anything the game's world reset leaves behind could change it; the plugin also
  writes the world's multiplayer restriction. `affects_gameplay = true`. In the lab a save
  made after three returns matched one from a fresh process, apart from the campaign id and
  the random seed. A canal changes the map, so after a save with one both buttons
  restart the game as usual.
- **Multiplayer: sessions not tested.** Every real multiplayer session leaves by the game's
  own restart; that comes from reading the game's code, not from a live session. After a
  return the Game Browser opens, and online the game asks for a restart before multiplayer.
  No lobby was hosted or joined, so the Steam lobby clean-up from the original has never run.
- **Ironman: off unless allowed** in Anvil (opt-in). With the opt-in it worked on Steam and
  GOG, the save on leaving included; without it Exit to Menu restarts the game. An ironman
  save does not update Continue game, so load it from the Single Player list.
- **Mods: tested, not all of them.** The plugin changes no game files, so the checksum stays
  the same. Anbennar with Proper 2K UI, a playset of ten interface and graphics mods, and
  Bellows 0.19 with the Anvil overlay ran without trouble.
- Not seen in a test: some message popups (an heir to name, a new colonial nation), the
  window of a lost game, custom nations and Random New World. Naval battles, new games and
  saves after a return, and changing country were tested. About eight windows per campaign
  still stay behind, about 15 MB of memory per return in 23 returns in a row (lab, 4 November
  2026).
- EU4 1.37.5 on Steam and the GOG build 1.37.5.2 (from Hamweard 1.1). On any other build
  Anvil does not load the plugin. The GOG build has no Steam lobby, so there is nothing to
  clean up there.

## Install

Hamweard 1.1 needs [Anvil](../../docs/install/) 1.9 or newer (1.0 needed 1.5). If you use the original EU4 Menu
Patch, remove its DLL first: both change the same code.

### From the Steam Workshop

With Anvil 1.9 or newer (Steam only; on GOG use the **Catalog** tab of Anvil Manager or the release zip):

1. Subscribe to [Hamweard on the Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3832650792)
   and enable it in your playset in the Paradox launcher.
2. Start the game. A notice says that a plugin waits for your approval: open the Anvil panel
   (`Ctrl+Shift+F12`), go to **Mods** and approve Hamweard. You can also approve it before
   playing, on the **Mods** tab of Anvil Manager.
3. Hamweard loads from the next start.

Anvil asks again after every update of the mod; until then the version you approved keeps
working. See [Plugins from mods](../../docs/plugins-from-mods/). Unsubscribe, or revoke the
approval, to remove it.

### From the release zip

1. Download `hamweard-windows-x64.zip` with the button above, or from the
   [latest release](https://github.com/happy-dwarf-team/hamweard/releases/latest).
   `SHA256SUMS.txt` next to the archive holds its checksum.
2. Install it on the **Plugins** tab of Anvil Manager, or extract it into
   `<EU4>/anvil/plugins/` by hand; it contains the `hamweard` folder.
3. Start the game as usual.

Remove it on the Manager's **Plugins** tab, or delete the `hamweard` folder.

## Tested

Source: the plugin's [README](https://github.com/happy-dwarf-team/hamweard#what-was-tested)
and the lab's test notes. All runs were single player on EU4 1.37.5 (Steam) with a vanilla
profile, on one development machine (1 and 2 November 2026):

- Back from the country selection, Exit to Menu, loading the same save again and Continue
  game with the refreshed record reach the main menu without a restart.
- Seven campaigns in a row (30 days each, seven Exit to Menu and two Back) in one process:
  no crash and no message popup left in the interface after any return.
- Five more campaigns in a fresh process, four with a war, a battle and a peace, three of
  them about two years long and one three years long without a war: the same result. The
  return to the main menu took 3.5 to 4 seconds after each.
- On the GOG build 1.37.5.2 (3 November 2026, Hamweard 1.1's code with Anvil 1.9's): five
  campaigns of 30 days in one process, five Exit to Menu and two Back, each return in 4.0
  to 4.5 seconds, no crash.

Before the plugin destroyed the windows of the last campaign, the game crashed in the
second to fourth campaign of such a series.
