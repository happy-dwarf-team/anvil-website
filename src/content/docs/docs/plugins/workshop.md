---
title: Publish your plugin on the Steam Workshop
description: Distribute an Anvil plugin as a Steam Workshop mod and publish every release from CI with paradox-workshop-publish.
---

From Anvil 1.3, a plugin can reach players as a Steam Workshop mod. Players subscribe to it,
enable it in the Paradox launcher and approve the plugin in Anvil; see
[Plugins from mods](../../plugins-from-mods/) for what they see. Players with an older Anvil
install the plugin zip from your release as before.

The mod holds only `descriptor.mod` and `anvil/<plugin-id>/`, the plugin folder. In Anvil's
lab tests on EU4 1.37.5
([design notes, §14](https://github.com/happy-dwarf-team/anvil/blob/main/docs/design.md#14-workshop-distribution-and-trust)),
such a mod kept the game's checksum and ironman achievements.

Publishing goes through
[paradox-workshop-publish](https://github.com/happy-dwarf-team/paradox-workshop-publish)
(`pdx-ws`), a command-line tool and GitHub Action: you create the Workshop item once from your
computer, and CI publishes every release after that.

## What the template already has

A repository made from
[anvil-plugin-template](https://github.com/happy-dwarf-team/anvil-plugin-template) is ready
for the Workshop:

| Path | What |
| --- | --- |
| `workshop/descriptor.mod` | the mod's `name`, the same on Steam and in the launcher: `<Name> - <what it does>`, for example `Bellows - Faster Game Start` |
| `workshop/description.md` | the Workshop description, in Markdown; every publish replaces the one on Steam with it |
| `workshop/thumbnail.png` | the preview image, a placeholder until you [generate yours](#the-workshop-page) |
| `workshop.toml` | the `pdx-ws` configuration, with `checksum = "keep"`: `pdx-ws` refuses a mod that would change the game's checksum |
| `.github/workflows/build.yml` | on every pull request, a dry run that shows in the job summary what a release would publish |
| `.github/workflows/release.yml` | release-please: merging its pull request creates a **draft** release with the zips |
| `.github/workflows/workshop-publish.yml` | publishes the mod when you publish a release; off until the variable `WORKSHOP_PUBLISH` is `true` |

The built plugin in `workshop/anvil/<plugin-id>/` is not in Git: CI copies it there. The
template's README section
[Publish to the Steam Workshop](https://github.com/happy-dwarf-team/anvil-plugin-template#publish-to-the-steam-workshop)
has the exact commands.

## Set it up once

You need Steam running and logged in to the account that owns EU4 and will own the item, and
the [GitHub CLI](https://cli.github.com/) (`gh`).

1. **Install `pdx-ws`** from its
   [releases](https://github.com/happy-dwarf-team/paradox-workshop-publish/releases), as the
   [setup guide](https://github.com/happy-dwarf-team/paradox-workshop-publish/blob/main/docs/guide/setup.md)
   describes. Keep the files of the archive together and put the folder on your `PATH`.
2. **Build the plugin and copy it into the mod**, then check what would be published:

   ```powershell
   cmake --build build --config Release
   New-Item -ItemType Directory workshop/anvil -Force
   Copy-Item build/plugin/my-plugin workshop/anvil -Recurse -Force
   pdx-ws plan
   ```

3. **Create the Workshop item** with `pdx-ws init`. It works through the Steam client
   (client mode): it creates a **private** item with the descriptor's name and tags and the
   preview, uploads the mod and writes the item's `remote_file_id` into
   `workshop/descriptor.mod`. Commit that line through a pull request; every later publish
   finds the item by it.
4. **Create the `steam-workshop` environment** in the repository:

   ```powershell
   gh api --method PUT repos/OWNER/REPO/environments/steam-workshop
   ```

   Then, in **Settings → Environments → steam-workshop**, add yourself as a required reviewer
   and allow only the tags `v*`.
5. **Save a Steam session** in the environment. Read the [security notes](#security) first.
   `session export` asks for your password and Steam Guard code once:

   ```powershell
   pdx-ws session export --user my_steam_name | gh secret set STEAM_SESSION --env steam-workshop
   gh secret set STEAM_USERNAME --env steam-workshop --body my_steam_name
   ```

6. **Turn publishing on:**

   ```powershell
   gh variable set WORKSHOP_PUBLISH --body true
   ```

## Publish a release

1. Merge the release pull request. `release.yml` tags `vX.Y.Z` and attaches the zips to a
   draft release.
2. Edit the release notes if you like and **publish the draft**. The notes become the
   Workshop change note.
3. Approve the `steam-workshop` deployment of the `workshop-publish` run.

The workflow downloads the release's plugin zip, checks its build attestation, so the
Workshop gets exactly the build GitHub serves, and publishes the mod in steamcmd mode with
the saved session. Publishing never changes the item's visibility: make it public on Steam
when you are ready. When the session has expired, the job fails with exit code 3; run
`pdx-ws session export` again to replace the secret.

Every published version is a new version for players: Anvil asks them to approve it, and the
version they approved keeps running until they do.

## The Workshop page

Happy Dwarf Team plugins follow the
[Workshop page convention](https://github.com/happy-dwarf-team/.github/blob/main/docs/workshop-pages.md):
the title, the tone, the sections of the description and the FAQ. Start
`workshop/description.md` from the template's skeleton.

Generate the thumbnail with
[tools/workshop-thumbnail](https://github.com/happy-dwarf-team/.github/tree/main/tools/workshop-thumbnail)
from your plugin's icon on this site, `src/assets/plugins/<plugin-id>.svg` in
[anvil-website](https://github.com/happy-dwarf-team/anvil-website), with the two parts of the
title. A plugin without an icon gets one here first, following the
[icon rules](https://github.com/happy-dwarf-team/anvil-website/blob/main/DESIGN.md#plugin-icons),
so the site and the Workshop show the same mark. Commit the result as `workshop/thumbnail.png`.

## Security

The Steam session lets whoever has it publish and update content for every Workshop item
your account can manage, not only this one. It does not contain your password or your Steam
Guard secret. The `pdx-ws`
[security notes](https://github.com/happy-dwarf-team/paradox-workshop-publish/blob/main/docs/guide/security.md)
explain what it allows, how to keep it safe and how to revoke it ("Deauthorize all devices"
in Steam Guard, or a new password).

## Example

[Bellows](https://github.com/happy-dwarf-team/bellows) is the reference plugin: it went from
the template through CI to the Workshop. See its
[`workshop/`](https://github.com/happy-dwarf-team/bellows/tree/main/workshop) folder,
`workshop.toml` and
[`workshop-publish.yml`](https://github.com/happy-dwarf-team/bellows/blob/main/.github/workflows/workshop-publish.yml).
