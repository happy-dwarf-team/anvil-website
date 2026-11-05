---
title: Recipes
description: Small plugins to start from, including one that needs no game addresses and so no reverse engineering.
---

The [first plugin](../first-plugin/) hooks game code, which needs addresses you have to find
in `eu4.exe`. You can do a lot without that.

## A plugin with no game addresses

A plugin without `symbols.toml` uses no game addresses of its own, so it needs no porting: when
EU4 updates, it works again as soon as Anvil does. What it knows about the game comes from the
standard plugin [`anvil-game`](../api/#anvil-game): the date, the session, the main menu,
each frame and, from Anvil 1.11, [provinces, countries and wars](../api/#the-world). One that
only reads, like this one, does not change the game, so it cannot put a multiplayer game out of
sync.

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

## A window with your country in it

From Anvil 1.11 a plugin with no game addresses can read the campaign and show a window. This
one shows the player's country, refreshes each month and notes the latest war. It needs no mod
and no `symbols.toml`, and the game's checksum stays the same.

The whole plugin is in the template, in
[`examples/campaign-panel`](https://github.com/happy-dwarf-team/anvil-plugin-template/tree/main/examples/campaign-panel):

1. Copy its `plugin.toml` over the template's and delete `symbols.toml`, `symbols.lock` and
   `settings.toml`. It depends on both standard plugins:

   ```toml
   anvil = ">=1.11.0"

   [[dependencies]]
   id = "anvil-game"
   version = "^1.11.0"

   [[dependencies]]
   id = "anvil-overlay"
   version = "^1.11.0"
   ```

2. Copy its `src/plugin.cpp`:

   ```cpp
   // The player's country in a window, with no game addresses: no symbols.toml, so
   // nothing to port when the game updates. It reads the campaign through
   // anvil-game, hears the month and the wars, and hands rows to the overlay.
   #include <anvil/anvil.hpp>
   #include <anvil/anvil_game.h>
   #include <anvil/anvil_panel.h>

   #include <format>
   #include <iterator>
   #include <string>

   namespace {

   struct CampaignPanel : anvil::Plugin {
       const AnvilGameWorldService* world = nullptr;
       const AnvilPanelService* panels = nullptr;
       AnvilPanel* panel = nullptr;
       std::string last_war = "none";

       // In a handler of an anvil-game event, or in a click: the only moments the
       // world answers.
       void refresh() {
           AnvilGameTag me{};
           AnvilGameCountry country{};
           country.size = sizeof(country);
           if (world->player(&me) != ANVIL_OK || world->country(me.text, &country) != ANVIL_OK) return;
           uint32_t wars = 0;
           world->war_ids(nullptr, 0, &wars);

           const std::string treasury = std::format("{:.1f}", country.treasury / 1000.0);
           const std::string income = std::format("{:.1f}", country.monthly_income / 1000.0);
           const std::string stability = std::format("{:+}", country.stability / 1000);
           const std::string provinces = std::to_string(country.province_count);
           const std::string running = std::to_string(wars);
           const AnvilPanelRow rows[] = {
               {ANVIL_PANEL_TEXT, 0, "Country", me.text, 0},
               {ANVIL_PANEL_TEXT, 0, "Treasury", treasury.c_str(), 0},
               {ANVIL_PANEL_TEXT, 0, "Income", income.c_str(), 0},
               {ANVIL_PANEL_TEXT, 0, "Stability", stability.c_str(), 0},
               {ANVIL_PANEL_TEXT, 0, "Provinces", provinces.c_str(), 0},
               {ANVIL_PANEL_SEPARATOR, 0, nullptr, nullptr, 0},
               {ANVIL_PANEL_TEXT, 0, "Wars in the world", running.c_str(), 0},
               {ANVIL_PANEL_TEXT, 0, "Latest", last_war.c_str(), 0},
               {ANVIL_PANEL_BUTTON, 0, "Refresh", nullptr, 1},
           };
           panels->set_rows(panel, rows, static_cast<uint32_t>(std::size(rows)), sizeof(AnvilPanelRow));
       }

       void load(anvil::Host& host) override {
           world = host.service<AnvilGameWorldService>(ANVIL_GAME_WORLD_SERVICE, ANVIL_GAME_WORLD_SERVICE_VERSION);
           panels = host.service<AnvilPanelService>(ANVIL_PANEL_SERVICE, ANVIL_PANEL_SERVICE_VERSION);
           if (world == nullptr || panels == nullptr) {
               host.warn("needs anvil-game.world and anvil-overlay.panel: Anvil 1.11 or newer");
               return;
           }
           if (panels->create("My country", &panel) != ANVIL_OK) return;
           // A click runs after an outer frame, so it may read the world.
           panels->on_click(panel, [](void* self, uint64_t) { static_cast<CampaignPanel*>(self)->refresh(); }, this);
           panels->show(panel, 1);

           host.subscribe(ANVIL_GAME_EVENT_SESSION, [this](std::string_view, const void* payload) {
               if (static_cast<const AnvilGameSession*>(payload)->change == ANVIL_GAME_SESSION_STARTED) refresh();
           });
           host.subscribe(ANVIL_GAME_EVENT_MONTH, [this](std::string_view, const void*) { refresh(); });
           host.subscribe(ANVIL_GAME_EVENT_WAR, [this](std::string_view, const void* payload) {
               const auto* war = static_cast<const AnvilGameWarChange*>(payload);
               last_war = std::format("{} {}", war->change == ANVIL_GAME_WAR_STARTED ? "began:" : "ended:", war->name);
               refresh();
           });
       }
   };

   }  // namespace

   ANVIL_PLUGIN(CampaignPanel)
   ```

3. Set the SDK in `CMakeLists.txt` to Anvil 1.11 or newer, then build and deploy as in
   [your first plugin](../first-plugin/).

Three rules keep it safe:

- **The world answers only in the right moment:** in a handler of an `anvil-game` event, or in
  a panel's click. Anywhere else it answers `ANVIL_ERROR_WRONG_PHASE`. The game is in the middle
  of a day on any other thread.
- **Frames differ between the machines of a multiplayer game.** These events are for showing
  and logging. They are not a clock for anything that must match between players.
- **The service shows everything:** provinces under terra incognita, and any country. In
  multiplayer that is more than a player sees, so a plugin that shows such values there does not
  enter the [Plugins page](../catalog/).

The panel is drawn in Anvil's overlay, not in the game's own interface, so it looks like Anvil
and not like EU4, and it is not drawn on the OpenGL renderer. Text is UTF-8 in any language;
Chinese, Japanese and Korean come from the fonts Windows ships.

## Where to go next

| You want to | See |
| --- | --- |
| Know when the game is ready, or the main menu comes up | [`anvil-game` events](../api/#anvil-game) |
| Read provinces, countries and wars | [The world](../api/#the-world) |
| Show a window | [Windows](../api/#windows) |
| Keep files between starts | `host.data_dir()`, `anvil/data/<plugin-id>/` |
| Let the player change something | [`settings.toml`](../manifest/#settingstoml); the Anvil panel shows it |
| Change what the game does | [Your first plugin](../first-plugin/) and the [Host API](../api/) |
| Find a function on Steam and GOG | [Steam and GOG](https://github.com/happy-dwarf-team/anvil-plugin-template#steam-and-gog) in the template |
| Say what your plugin does in multiplayer and ironman | [`affects_gameplay`](../manifest/#ironman-and-multiplayer) |
| Give it to players | [The Plugins page](../catalog/) and [the Steam Workshop](../workshop/) |
