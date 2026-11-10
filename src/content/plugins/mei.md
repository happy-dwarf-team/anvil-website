---
name: Mei
summary: Chinese, Japanese and Korean text for a translation mod, without the old DLL patch. UTF-8 and EU4DLL encodings, fonts, line breaks, pinyin search and typing. A port of EU4 Unicode Patch by VulonLok.
tagline: Shows, wraps, searches and types the text of a Chinese, Japanese or Korean translation mod.
repo: https://github.com/happy-dwarf-team/mei
status: released
gameBuilds: ['eu4-1.37.5-steam-win64', 'eu4-1.37.5.2-gog-win64', 'eu4-1.37.5.0-gog-win64']
affectsGameplay: false
order: 40
workshop: '3832685486'
manifestPath: plugin.toml
---

Mei lets EU4 show the text of a Chinese, Japanese or Korean translation mod. **It does not
translate the game:** you need a translation mod as well.

For years this took a "double-byte" DLL patch (EU4DLL) in the game folder, which cannot be there
together with Anvil. Mei does the same job as an Anvil plugin.

## What you get

- **The text shows** in menus, tooltips, events and on the map. Translation packs made for EU4DLL
  work as they are. Names that a supplementary pack keeps in scripts show too, and saves keep them.
- **Long lines wrap.** Chinese and Japanese have no spaces, so the game had nowhere to break a
  line, and a long paragraph crashed it.
- **Fonts.** A translation mod's own fonts stay. Where the game would use its own fonts, Mei brings
  fonts made from Source Han Sans, with about 13,000 characters.
- **Search.** The province finder matches Chinese characters, full pinyin, initials and mixed
  input. The diplomacy country list uses the same search, but was not checked in the game.
- **Typing.** Finished text reaches text fields, as an IME commits it. Backspace, the arrow keys,
  selecting, undo and paste work by character.
- **Save names** (from Mei 0.5). A save keeps the country's name and the name you type, such as
  `奥斯曼1444_11_11.eu4`, instead of Latin letters (`aaa1444_11_11.eu4`).
- **Steam status** (from Mei 0.4). The Rich Presence text that Steam friends see reaches Steam in
  UTF-8, so a Chinese country name reads as it should (Steam only).

## Install

Mei needs [Anvil](../../docs/install/) 1.9 or newer. Mei 0.1 needed 1.8.

1. Remove an old double-byte patch first: the `version.dll`, `d3d9.dll` and `plugins` folder it put
   in the game folder. It and Anvil both use `version.dll`. From Anvil 1.16 the Manager does this
   for you with **Replace EU4DLL** and keeps the files in `anvil-legacy-backup`
   ([how](../../docs/install/#if-eu4dll-or-eu4-unicode-patch-is-installed)).
2. On Steam, subscribe to [Mei on the Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3832685486)
   and to your translation mod, and enable both in your playset. The Workshop item carries the
   plugin and its fonts. Then [approve it](../../docs/install-plugins/#from-the-steam-workshop).
3. On GOG, or [from a zip](../../docs/install-plugins/#from-a-zip), the plugin comes without its
   fonts. The game reads them only from a mod, so make a small local mod. Without it, a translation
   mod's own fonts still work.
   1. Download `mei-fonts.zip` from the same
      [release](https://github.com/happy-dwarf-team/mei/releases/latest).
   2. Open `Documents/Paradox Interactive/Europa Universalis IV GOG/mod` (without ` GOG` on Steam).
      Extract the zip into a new folder there, `mei-fonts/gfx/fonts/mei/`.
   3. Next to the `mei-fonts` folder, make a text file `mei-fonts.mod` with these lines:

      ```
      name="Mei fonts"
      path="mod/mei-fonts"
      supported_version="1.37.*"
      ```

   4. Enable **Mei fonts** in your playset in the Paradox launcher.

## Settings

The defaults are set for translation mods, so nothing needs configuring. All are on except fuzzy
pinyin, and each applies at the next start.

| Setting | What it does |
| --- | --- |
| `utf8_localization` | Keeps the game's text in UTF-8 and draws it. Keep `search` on with it: the game's own search misses accented names |
| `utf8_scripts` | Reads script files and saves in UTF-8, so names from a supplementary translation mod show |
| `bundled_fonts` | Uses Mei's fonts where the game would use its own |
| `utf8_input` | Lets finished Chinese, Japanese and Korean text reach text fields |
| `utf8_save_names` | From Mei 0.5: saves keep the country's name and the name you type instead of Latin letters. Needs `utf8_localization` |
| `search` | Chinese and pinyin search |
| `typo_tolerance` | Full pinyin of 5 or more letters still matches with one typo |
| `fuzzy_pinyin` | zh/z, ch/c, sh/s, n/l, en/eng and in/ing match each other. Off by default |

## Limitations

- **IME:** no real IME was used. The tests sent finished text to the window, so the candidate window
  and the text being composed were not checked.
- **Japanese kanji** in Mei's own fonts take their Simplified Chinese shapes.
- **No Japanese translation** for 1.37 was found on the Workshop. Only test text was drawn.
- **Not checked yet:** the diplomacy country list in the game, a text field of several rows, and
  selecting with a mouse drag.
- **Not ported yet:** the original's own font atlases, which draw from your system's fonts, and its
  dates.
- EU4 1.37.5 on Steam and the GOG builds 1.37.5.2 (from Mei 0.2) and 1.37.5.0 (from Mei 0.4). On
  any other build Anvil does not load the plugin.

## Tested

Source: the plugin's
[README](https://github.com/happy-dwarf-team/mei#in-game-test-with-translation-mods) and the lab's
test notes. EU4 1.37.5 (Steam) with Anvil 1.8.0, Mei's default settings and one translation mod
from the Workshop at a time, on one development machine (2 and 3 November 2026):

- [Chinese Language Mod for 1.37](https://steamcommunity.com/sharedfiles/filedetails/?id=2976470733)
  (Simplified Chinese): the main menu, the country selection, the map and messages in Chinese,
  wrapped; a year of play without a crash; the pinyin `falanxi` finds 法兰西. The same on the GOG
  build (3 November 2026, Mei 0.2's code, Anvil 1.9's). Without Mei's line breaks the game crashed
  when the country selection opened.
- [Chinese Language Supplementary Mod for 1.37](https://steamcommunity.com/sharedfiles/filedetails/?id=1999055990),
  on top of the mod above (4 November 2026, Mei 0.3's code, Anvil 1.9, Steam and GOG): 229,719
  script tokens decoded, none rejected; a binary ironman save with the old escapes loads; two
  seeded games with and without the conversion differ in names only.
- [Traditional Chinese for 1.37.5](https://steamcommunity.com/sharedfiles/filedetails/?id=2437805432):
  the menu, the country selection and the map; `yinggelan` finds 英格蘭.
- [Korean Language Mod - stability](https://steamcommunity.com/sharedfiles/filedetails/?id=2714934430):
  the menu and the country selection in Korean.

## Credits and the name

Mei is a port of [EU4 Unicode Patch](https://github.com/YozoraTempest/EU4-Unicode-Patch) by VulonLok
(MIT). The text, search and input logic is the original's, built unchanged from its source.

銘 (*mei* in Japanese) is the signature a swordsmith cuts into the tang of a blade. 铭 (*míng*) in
Chinese and 銘 (*myeong*) in Korean mean "inscription", one character that all three languages
share.
