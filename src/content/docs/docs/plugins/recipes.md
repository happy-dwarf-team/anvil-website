---
title: Recipes
description: Small plugins to start from, including one that needs no game addresses and so no reverse engineering.
---

The [first plugin](../first-plugin/) hooks game code, which needs addresses you have to find
in `eu4.exe`. You can do a lot without that.

## A plugin with no game addresses

A plugin without `symbols.toml` uses no game addresses of its own, so it needs no porting: when
EU4 updates, it works again as soon as Anvil does. What it knows about the game comes from the
standard plugin [`anvil-game`](../api/#anvil-game): the date, the session, the main menu and
each frame. One that only reads, like this one, does not change the game, so it cannot put a
multiplayer game out of sync.

This one writes one line per game month to `anvil/data/month-log/months.txt` and logs each
session. From the [template](https://github.com/happy-dwarf-team/anvil-plugin-template):

1. In `plugin.toml`, remove `symbols` and `settings`, name the plugin as usual, and add the
   dependency. `^1.6.0` is the first `anvil-game` with the date:

   ```toml
   anvil = ">=1.7.0"

   [[dependencies]]
   id = "anvil-game"
   version = "^1.6.0"
   ```

2. Delete `symbols.toml`, `symbols.lock` and `settings.toml`.

3. Replace `src/plugin.cpp`:

   ```cpp
   #include <anvil/anvil.hpp>
   #include <anvil/anvil_game.h>

   #include <format>
   #include <fstream>

   namespace {

   struct MonthLog : anvil::Plugin {
       const AnvilGameService* game = nullptr;
       std::filesystem::path file;
       int last_year = 0;
       unsigned last_month = 0;

       void load(anvil::Host& host) override {
           game = host.service<AnvilGameService>(ANVIL_GAME_SERVICE, ANVIL_GAME_SERVICE_VERSION);
           file = host.data_dir() / "months.txt";

           host.subscribe(ANVIL_GAME_EVENT_SESSION, [host](std::string_view, const void* payload) {
               const auto* session = static_cast<const AnvilGameSession*>(payload);
               if (session->change != ANVIL_GAME_SESSION_STARTED) return;
               host.info("session {}: ironman {}, multiplayer {}", session->number, session->ironman != 0, session->multiplayer != 0);
           });

           // The frame event runs on the main thread, so keep it short.
           host.subscribe(ANVIL_GAME_EVENT_FRAME, [host, this](std::string_view, const void*) {
               AnvilGameDate date{};
               if (!game->date(&date)) return;  // the main menu
               if (date.year == last_year && date.month == last_month) return;
               last_year = date.year;
               last_month = date.month;
               std::ofstream(file, std::ios::app) << std::format("{}-{:02}\n", date.year, date.month);
               host.info("month {}-{:02}", date.year, date.month);
           });
       }
   };

   }  // namespace

   ANVIL_PLUGIN(MonthLog)
   ```

4. Build and deploy as in [your first plugin](../first-plugin/). `-check` then says
   `no symbols.toml (runs on every game build): OK`, and CI needs no `symbols.lock`. The
   dependency still ties it to the builds `anvil-game` knows; without `anvil-game`, a plugin
   that uses only the Windows API runs on every build.

`affects_gameplay` stays `false`, and Anvil leaves the plugin on in ironman and multiplayer.
The Windows API is yours to use too, for example to copy a file or watch a folder.

## Where to go next

| You want to | See |
| --- | --- |
| Know when the game is ready, or the main menu comes up | [`anvil-game` events](../api/#anvil-game) |
| Keep files between starts | `host.data_dir()`, `anvil/data/<plugin-id>/` |
| Let the player change something | [`settings.toml`](../manifest/#settingstoml); the Anvil panel shows it |
| Change what the game does | [Your first plugin](../first-plugin/) and the [Host API](../api/) |
| Find a function on Steam and GOG | [Steam and GOG](https://github.com/happy-dwarf-team/anvil-plugin-template#steam-and-gog) in the template |
| Say what your plugin does in multiplayer and ironman | [`affects_gameplay`](../manifest/#ironman-and-multiplayer) |
| Give it to players | [The catalog](../catalog/) and [the Steam Workshop](../workshop/) |
