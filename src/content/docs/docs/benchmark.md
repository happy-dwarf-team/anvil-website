---
title: Start-up benchmark
description: Measure on your own computer how much faster a plugin makes Europa Universalis IV start, with the Benchmark tab of Anvil Manager.
---

From Anvil 1.5, Anvil Manager has a **Benchmark** tab. It measures on your computer how
long the game takes to start without a plugin and with it, for example
[Bellows](../../plugins/bellows/). The game starts again and again, each start quits by
itself once the game is ready, and nothing in your saves, mods or `anvil/anvil.toml`
changes. When the series ends you see the result and may send an anonymous report to the
Anvil maintainers, copy it, or do neither.

Source: the
[start-up benchmark specification](https://github.com/happy-dwarf-team/anvil/blob/main/docs/spec/benchmark-v1.md)
in the Anvil repository.

## Before you start

- Anvil 1.5 or newer, installed with [Anvil Manager](../install/). Start the Manager from the
  game folder (`AnvilManager.exe` next to `eu4.exe`).
- The plugin you compare must be enabled and, if it comes from a mod, approved, with no
  update waiting for approval. It must also take part in the benchmark: Bellows does from
  0.10.0. Older plugins stop the series with a note to update them.
- Steam running, and the game not running.
- Time: with 5 warm starts per setup the series has at least ten game starts, each of them a
  full start to the main menu; the tab shows how long to expect. Leave the computer alone
  while it runs.

The Manager checks these conditions before the series and lists each one with what to do
when it fails. Running on battery only gives a warning. No administrator rights are needed.

## Run a series

1. Open the **Benchmark** tab.
2. Under **Compare**, choose the plugin.
3. Choose how many valid warm starts each setup needs: 3, 5 (the default) or 10. The tab
   shows how many starts and minutes to expect.
4. Click **Start the series**.

The Manager then starts `eu4.exe` directly from the game folder, alternating between the
two setups (without, with, with, without, …). Each start ends by itself, the way the menu's
**Quit** ends the game, and the next one follows after a short pause. The tab shows which
start runs, its phase and every finished start. While a series runs, **Play EU4** and the
other tabs are locked.

**Stop** lets the running start finish and quit cleanly, then ends the series. Keyboard
and mouse use during a start does not discard it, but is noted next to it.

## Read the result

- **Warm starts:** for each setup the median time, the fastest and slowest start (min–max),
  the number of starts and every time, with a dot per start on a shared axis.
- **Difference:** the median with the plugin minus the median without it, in seconds and
  percent. When the min–max ranges of the two setups overlap, the tab says that the
  difference is uncertain instead of colouring it.
- **Cold starts:** listed one by one; a cold difference is shown only when both setups had a
  cold start.
- **Starts that do not count**, with their reasons, and a line that says what was not
  measured.

A start's time runs from the creation of the game process to the end of start-up
(`anvil-game.ready`). That is about 1.5 s later than the `Running application` line in the
game's `system.log`, so benchmark times are a little longer than the measurements on the
plugin pages.

### Warm and cold starts

The first start after a reboot, or after an antivirus update, is much slower: Windows has
to read the game's files from the drive again. Such a start is **cold**. The Manager cannot
make cold starts on demand without administrator rights, so it shows the cold starts that a
series happens to contain.

It tells them apart by how long the first opening of each game file took in that start. A
start in between is **unclear** and joins neither group. Cold starts do not count towards the
target of warm starts; the labels "first start since boot" and "definitions changed" only
describe a start.

### Starts that do not count

A start is replaced when the plugin was still learning (Bellows learns which files a new mod
set needs on its first start), when the game crashed before it was ready, or when it ended
without a record. At most 4 extra starts are added per series. The series stops when, for
example, the plugin was not loaded, the game crashed twice, a start did not end by itself,
Steam, the mod set or the plugin changed during the series, or too many starts did not count.
The result then names the reason.

## Send or copy the report

**Review the report and send…** opens a preview of the report, exactly as it would be sent:
your computer, your mods, the versions, the plugin's state and fields in each start, and the
JSON itself. One switch leaves out the Steam Workshop ids of your mods.

- **Send** uploads it once to the Anvil maintainers. Nothing is sent without this click.
- **Copy** puts the same JSON on your clipboard, for example for a
  [Bellows performance report](https://github.com/happy-dwarf-team/bellows/issues/new?template=performance_report.yml).

What a report contains, where it goes, how long it is kept and how to have it deleted:
[Benchmark reports and your privacy](../benchmark-privacy/).

The Manager keeps the last ten reports in `anvil/data/anvil/benchmarks/` in the game folder;
**Kept reports** on the tab opens them.

## For plugin authors

A plugin takes part through the core service `anvil.benchmark` (Anvil 1.4 and newer): it
reports its own numbers, options and flags, says when its work after the game is ready is
done, and marks starts that are not representative for it. See
[Host API](../plugins/api/#start-up-benchmark).
