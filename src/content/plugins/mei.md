---
name: Mei
summary: Chinese, Japanese and Korean text for a translation mod, without the old DLL patch. UTF-8 and EU4DLL encodings, fonts, line breaks, pinyin search and typing. A port of EU4 Unicode Patch by VulonLok.
tagline: Shows, wraps, searches and types the text of a Chinese, Japanese or Korean translation mod.
repo: https://github.com/happy-dwarf-team/mei
status: released
gameBuilds: ['eu4-1.37.5-steam-win64']
affectsGameplay: false
order: 40
workshop: '3832685486'
manifestPath: plugin.toml
---

EU4 keeps its text in Windows-1252, so a Chinese, Japanese or Korean translation can't show
without help. For years that help was a "double-byte" DLL patch (EU4DLL) in the game
folder, which cannot be there together with Anvil. Mei does the same job as an Anvil
plugin. **It does not translate the game:** you need a translation mod as well.

- **Encoding.** The game keeps its text in UTF-8 and draws it in menus, tooltips, events
  and on the map. Translation packs made for EU4DLL are converted as they load, so they
  work as they are.
- **Line breaks.** Chinese and Japanese have no spaces, so the game had nowhere to break a
  line, and a long paragraph crashed it. Mei breaks lines between characters by Unicode's
  rules (UAX #14).
- **Fonts.** A translation mod's own fonts stay. Where the game would use its own fonts,
  which have no CJK glyphs, Mei brings fonts made from Source Han Sans (about 13,000
  characters).
- **Search.** The diplomacy country list and the province finder match Chinese
  characters, full pinyin, initials and mixed input.
- **Typing.** Typed and IME-committed text reaches text fields as UTF-8; Backspace,
  Delete and the arrow keys step by character.

Mei is a port of [EU4 Unicode Patch](https://github.com/YozoraTempest/EU4-Unicode-Patch) by
VulonLok (MIT): the text, search and input logic is the original's, built unchanged from
its source. 銘 (*mei* in Japanese) is the signature a swordsmith cuts into the tang of a
blade; 铭 (*míng*) in Chinese and 銘 (*myeong*) in Korean mean "inscription", one
character that all three languages share. The team's other tools are named after the
forge too.

## Limitations

- **IME candidate window:** typing through an IME was checked with committed text only;
  the candidate window and the text being composed were not.
- **Selecting text and undo** in text fields are not ported yet.
- **Script files and saves are not converted:** packs whose names live in scripts (such as
  the Chinese supplementary pack with its dynamic province names) show those names wrong.
- **Japanese kanji** in Mei's own fonts take their Simplified Chinese shapes.
- The Anvil panel itself shows Latin text only
  ([#158](https://github.com/happy-dwarf-team/anvil/issues/158)).
- EU4 1.37.5 Steam only. On any other build Anvil does not load the plugin.

## Install

Mei needs [Anvil](../../docs/install/) 1.8 or newer. Remove an old double-byte patch first
(`version.dll`, `d3d9.dll` and the `plugins` folder it put in the game folder): it and
Anvil both use `version.dll`.

### From the Steam Workshop

With Anvil 1.8 or newer:

1. Subscribe to [Mei on the Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3832685486)
   and to your translation mod, and enable both in your playset in the Paradox launcher.
2. Start the game. A notice says that a plugin waits for your approval: open the Anvil panel
   (`Ctrl+Shift+F12`), go to **Mods** and approve Mei. You can also approve it before
   playing, on the **Mods** tab of Anvil Manager.
3. Mei loads from the next start. Its settings are already set for translation mods.

Anvil asks again after every update of the mod; until then the version you approved keeps
working. See [Plugins from mods](../../docs/plugins-from-mods/).

### From the release zip

1. Download `mei-windows-x64.zip` with the button above, or from the
   [latest release](https://github.com/happy-dwarf-team/mei/releases/latest).
   `SHA256SUMS.txt` next to the archive holds its checksum.
2. Install it on the **Plugins** tab of Anvil Manager, or extract it into
   `<EU4>/anvil/plugins/` by hand; it contains the `mei` folder.
3. Mei's own fonts are in `mei-fonts.zip` of the same release; the game reads them only
   from a mod's `gfx/fonts/mei/` folder. Without them a translation mod's fonts still work.

## Tested

Source: the plugin's [README](https://github.com/happy-dwarf-team/mei#in-game-test-with-translation-mods)
and the lab's test notes. EU4 1.37.5 (Steam) with Anvil 1.8.0, Mei's default settings and
one translation mod from the Workshop at a time, on one development machine (2 and 3
November 2026):

- [Chinese Language Mod for 1.37](https://steamcommunity.com/sharedfiles/filedetails/?id=2976470733)
  (Simplified Chinese): the main menu, the country selection, the map, the bookmark text,
  the 1444 introduction and messages in Chinese, wrapped; a year of play without a crash;
  the pinyin `falanxi` finds 法兰西. Without Mei's line breaks the game crashed when the
  country selection opened, also with Mei turned off.
- [Traditional Chinese for 1.37.5](https://steamcommunity.com/sharedfiles/filedetails/?id=2437805432):
  the menu, the country selection and the map in Traditional Chinese; `yinggelan` finds
  英格蘭.
- [Korean Language Mod - stability](https://steamcommunity.com/sharedfiles/filedetails/?id=2714934430):
  the menu and the country selection in Korean, as without Mei.

No Japanese translation for 1.37 was found on the Workshop; Japanese test text drew right
with Mei's fonts.
