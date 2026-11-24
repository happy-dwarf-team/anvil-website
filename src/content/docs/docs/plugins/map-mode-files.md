---
title: Map modes from mod files
description: Add a map mode to EU4 from a text file in your mod, with no plugin and no code, from Anvil 1.26.
---

From Anvil 1.26 a mod can add a map mode with no plugin and no code: a text file in
`<mod>/anvil/map_modes/`, in the game's script syntax. Each block in it is a mode with a button on
the minimap's list. Its rules read a province or its owner, and the first rule a province passes
gives its colour, its line in the province's tooltip and its entry in a legend beside the map.

The player needs Anvil 1.26 or newer; without Anvil the folder does nothing, since the game does
not read `anvil/`. The files leave the game's checksum alone, and the folder is not a plugin, so it
needs no [approval](../../plugins-from-mods/#special-cases).

## A first mode

Put this in `<mod>/anvil/map_modes/my_modes.txt`, enable the mod in the playset and start the game:

```
holy_sites = {
    label = "Holy sites"
    description = "Where the faith is strong"
    tab = 4
    rule = { flag = my_holy_site color = { 224 176 0 } label = "Holy site" }
    rule = { variable = my_faith at_least = 5 color = { 128 64 192 } label = "Faith 5 or more" }
    rule = { modifier = local_missionary_strength above = 0.01 color = { 64 128 255 } label = "Missionaries" }
}
```

The button **Holy sites** is on the minimap's fourth tab. Pick it: a province with the flag
`my_holy_site` is gold, one with the variable `my_faith` at 5 or more is purple, and one where
missionaries are stronger is blue. A province that passes no rule keeps its political colour. A
mistake leaves the mode out and writes the file and the line to `anvil/anvil.log` in the game's
folder, such as `map mode file My mod/anvil/map_modes/holy.txt:7: a rule needs color = { r g b }`;
the file's other modes are still read.

## A mode

| Key | Value |
| --- | --- |
| the block's name | `[a-z0-9_-]`, 1 to 32 characters, unique in the playset: when two files use one name, the first file read keeps it |
| `label` | required: the button's name and the legend's title, 1 to 64 bytes |
| `description` | the button's tooltip, at most 512 bytes |
| `tab` | the minimap's tab, 1 to 4; 4 when left out |
| `sprite` | the button's icon, a sprite name such as `GFX_mapmode_religion`; the game's empty button frame when left out |
| `legend` | `no` shows no legend; `yes` when left out |
| `rule` | 1 to 64 rules, in order |

Texts are shown as written: there are no localisation keys.

## Rules

Each rule has a `color = { r g b }` (0 to 255), a `label` (the tooltip's line and the legend's
entry) and exactly one test:

| Test | Passes a province |
| --- | --- |
| `always = yes` | every province: a last rule for "everything else" |
| `flag = name` | with that province flag (what `has_province_flag` sees) |
| `variable = name` | with that province variable, within the bounds |
| `modifier = key` | with the province's own value of that modifier within the bounds, such as `local_missionary_strength` |
| `value = development` | with its development within the bounds; also `base_tax`, `base_production` and `base_manpower`, and from Anvil 1.27 `local_autonomy` (as the game shows it), `devastation` and `trade_power` (its trade power in its trade node, as of the game's last update) |
| `owned_by = RUS` | that country owns |
| `controlled_by = RUS` | that country holds, as owner or occupier |
| `core = yes` or `no` | where the owner has a core, or has none |
| `core = RUS` | where that country has a core, owner or not |
| `occupied = yes` or `no` | that another country or rebels hold, or its owner does |
| `religion = orthodox`, `culture = swedish` | with that religion or culture |
| `religion_group = muslim`, `culture_group = scandinavian` | whose religion or culture is in that group |
| `trade_goods = grain` | that produces those trade goods |
| `area`, `region`, `superregion`, `continent` | in that place, such as `area = uppland_area` or `continent = europe`, with the keys of the game's `map/area.txt`, `region.txt`, `superregion.txt` and `continent.txt` |
| `trade_node = baltic_sea` | in that trade node, with the keys of `common/tradenodes` |
| `capital = yes` or `no` | that is its owner's capital, or is not |
| `hre = yes` or `no` | that is part of the Holy Roman Empire, or is not |
| `city = yes` or `no` | that is a city, or still a colony |
| `coastal = yes` or `no` | land the game counts as coastal, or other land, owned or not; the sea, lakes and wasteland pass neither |
| `state = yes` or `no` | from Anvil 1.27: that is in one of its owner's states, or is a territory |

Write a key as the game's files write it, which can differ from the name the game shows: in 1719
Moskva's culture is `russian_new`, in the `slavic` group, not `russian` and `east_slavic`. The
game's `common/religions`, `common/cultures` and `common/tradegoods` list them. A province with
no owner passes no rule on the owner's core, its occupation, its capital, the empire, a city or a
state.

### The owner

With `owner = yes` a rule reads the province's owner instead, and a province without an owner does
not pass it:

- `flag`, `variable` and `modifier` read the country's flag (`has_country_flag`), variable and
  modifier value; a modifier such as `global_tax_modifier` colours every province of a country
  alike.
- `value` reads the owner's `treasury`, `stability`, `prestige`, `manpower` (in thousands, as the
  game shows it), `monthly_income` (before expenses, as of the last monthly update) or `provinces`
  (how many it owns).
- `religion` and `culture` read its state religion and primary culture, and `religion_group` and
  `culture_group` their groups.
- `subject = yes` or `no` passes when the owner has an overlord, of any kind, or has none, and
  `subject_of = RUS` when that country is its overlord.
- `always = yes owner = yes` passes every owned province.

The other tests are the province's, and refuse `owner = yes`.

### Bounds and scales

`variable`, `modifier` and `value` take the bounds `at_least`, `at_most`, `above` and `below`,
with at most three decimals; all of a rule's bounds hold together (`at_least = 1 below = 5` is 1
up to but not including 5). Without a bound such a rule passes when the value is not 0, and a
variable the province or country does not have is 0, as for the game's triggers. Write
`at_least = 5`, not `>= 5`: the comparison signs are refused, with a hint in the log.

A scale colours a rule from `color` at its low end to `high_color` at its high end:

```
development = {
    label = "Development"
    rule = { value = development above = 0 scale = { 3 30 } color = { 240 240 200 } high_color = { 160 0 0 } label = "Development" }
}
prosperity = {
    label = "Prosperity"
    rule = { variable = my_prosperity owner = yes at_least = 0 scale = { 0 100 } color = { 60 30 30 } high_color = { 40 200 80 } label = "Prosperity" }
}
```

A scale does not change whether a rule passes, so one that starts at 0 needs `at_least = 0`.

## The tooltip and the legend

- A province's tooltip gives the label of the rule it passes, and for a `variable` or `value` rule
  and a rule with a scale also the value, as `Faith 5 or more (my_faith 7.5)`.
- While the mode is shown, the legend is a window of Anvil's overlay titled with the mode's label:
  each rule's colour and label once, in rule order, at most 32 entries. A scale gives two entries,
  its label with the low end and with the high end (`Prosperity 0`, `Prosperity 100`).

## When the colours change

The colours are computed when the player picks the mode and each month while it stays shown, so a
mode nobody looks at costs nothing. A flag an event sets shows by the next month.

You can edit a file while the game runs: pick another mode and then yours again (or wait a month),
and its rules and legend change, with the line `map mode files changed: the rules of N mode(s) read
again` in `anvil.log`. A mode's
`label`, `description`, `tab` and `sprite`, a new mode and a removed one wait for a restart, and
the log says so.

## More examples

```
cores = {
    label = "Cores and occupation"
    rule = { occupied = yes color = { 200 40 40 } label = "Occupied" }
    rule = { core = no color = { 230 160 0 } label = "Owned without a core" }
    rule = { subject = yes owner = yes color = { 120 120 200 } label = "A subject's" }
}
russian_sphere = {
    label = "Russia's sphere"
    rule = { owned_by = RUS color = { 40 160 40 } label = "Russia's" }
    rule = { subject_of = RUS owner = yes color = { 120 200 120 } label = "Russia's subjects'" }
    rule = { controlled_by = RUS color = { 200 40 40 } label = "Held by Russia" }
    rule = { core = RUS color = { 230 160 0 } label = "Russia's claims" }
}
coasts = {
    label = "Coasts and colonies"
    rule = { city = no color = { 230 160 0 } label = "Colony" }
    rule = { coastal = yes color = { 40 120 220 } label = "Coast" }
}
forts = {
    label = "Forts"
    rule = { modifier = fort_level at_least = 1 scale = { 1 8 } color = { 230 200 120 } high_color = { 120 40 20 } label = "Fort level" }
    rule = { always = yes owner = yes color = { 200 200 200 } label = "No fort" }
}
war_damage = {
    label = "War damage"
    rule = { value = devastation above = 0 scale = { 0 50 } color = { 240 210 80 } high_color = { 110 0 0 } label = "Devastation" }
    rule = { state = no color = { 230 160 30 } label = "Territory" }
}
```

A province takes the first rule it passes, so in `coasts` a coastal colony is a colony, and
coastal land with no owner is coast. In `forts`, the modifier `fort_level` is the fort level the
game counts for the province, the one its province view shows. `war_damage` needs Anvil 1.27; in
it a devastated territory shows its devastation.

## Limits

- A mode changes nothing in the game, so it works in ironman and multiplayer. It also colours
  provinces under terra incognita.
- The minimap has room for 13 modes of plugins and files together; a mode past them is not added,
  and `anvil.log` says so.
- A file with the same name in a later mod of the playset replaces an earlier one. A zipped mod is
  skipped, and a file larger than 1 MiB is not read. A file that is not UTF-8 is read as
  Windows-1252, like the game's own files.
- A mode reads only the province and its owner: not the overlord's own values, not scripted
  triggers. A mode that needs more is a plugin on [`anvil-map.modes`](../api/#map-modes).

All the keys are in the
[specification](https://github.com/happy-dwarf-team/anvil/blob/main/docs/spec/map-mode-files-v1.md).
