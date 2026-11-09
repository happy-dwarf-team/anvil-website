---
title: Is it safe?
description: What Anvil and its plugins can do on your computer, how to check a download yourself, and what to do when Windows or an antivirus objects.
---

Anvil loads native plugins into EU4, so this is a fair question. This page says what runs on
your computer, how you can check each file yourself, and what to do when Windows or an
antivirus objects.

## What runs on your computer

- **Anvil** is a `version.dll` next to `eu4.exe`. Windows loads it with the game; it forwards
  every call to the system `version.dll` and loads plugins. `eu4.exe` and the game files are
  never changed, and [uninstalling](../install/#uninstall) puts the game back at once.
- **A plugin** is native code that runs inside the game with the same rights as the game,
  like any program you install. Anvil is not a sandbox: it does not limit what a plugin can
  do on your computer. Only install plugins from authors you trust.

## What keeps you in control

- **Nothing runs from a mod without your approval.** A plugin that comes with a mod loads only
  after you approve it, and the approval covers exactly those files by their SHA-256 hash. A
  new version waits for you. See [Plugins from mods](../plugins-from-mods/).
- **You see a plugin before it is installed.** The Manager shows its name, authors, whether it
  changes gameplay, and whether it fits your game build.
- **The Manager's catalog pins each file.** A plugin from the **Catalog** tab is installed only
  if its SHA-256 equals the one in the list, and each release in the list had its size, hash
  and build attestation checked when it was added.
- **Nothing happens on the network by itself.** Anvil never downloads anything. The Manager
  downloads only what you click. The Manager and the game check GitHub for a newer Anvil only
  if you say yes when one of them asks, and then only show a link.
  A [benchmark report](../benchmark-privacy/) leaves your computer only when you click **Send**
  after seeing it.

## Check a download yourself

You can check any Anvil or plugin file from GitHub in two ways. Neither needs our word.

**1. Compare the SHA-256.** It shows that you have the same file as the release. The hash is
under each download button and in `SHA256SUMS.txt` of the release. In PowerShell:

```powershell
Get-FileHash .\AnvilManager.exe -Algorithm SHA256
```

**2. Verify the build attestation.** It shows that GitHub Actions built this file in the
project's public repository, and from which commit. It needs the
[GitHub CLI](https://cli.github.com/):

```powershell
gh attestation verify .\AnvilManager.exe -R happy-dwarf-team/anvil
```

| Project | `-R` | File |
| --- | --- | --- |
| Anvil | `happy-dwarf-team/anvil` | `AnvilManager.exe`, `anvil-windows-x64.zip` |
| Bellows | `happy-dwarf-team/bellows` | `bellows-windows-x64.zip` |
| Hamweard | `happy-dwarf-team/hamweard` | `hamweard-windows-x64.zip` |
| Hoard | `happy-dwarf-team/hoard` | `hoard-windows-x64.zip` |
| Mei | `happy-dwarf-team/mei` | `mei-windows-x64.zip` |
| Tongs | `happy-dwarf-team/tongs` | `tongs-windows-x64.zip` |

A file that passes came from that repository's release workflow, and you can read the source
of that commit. It does not prove that the code is free of bugs.

A Workshop item has no attestation of its own. The release workflows of Bellows, Hamweard,
Hoard and Tongs upload the checked release zip to it; to check by hand, take the zip from GitHub instead.

## Why Windows warns

Anvil's files are not code-signed, and this is not planned
([#157](https://github.com/happy-dwarf-team/anvil/issues/157)). Your browser or SmartScreen may
therefore warn about `AnvilManager.exe` the first time; see
[If Windows warns about the file](../install/#if-windows-warns-about-the-file).

## If your antivirus objects

Anvil is a proxy `version.dll`, and plugins change game code in memory. Both are patterns that
antivirus heuristics can flag.

1. **Check the file first.** Download it again from the
   [release](https://github.com/happy-dwarf-team/anvil/releases/latest) and compare the
   SHA-256, or verify the attestation. If it does not match, do not run it, and
   [tell us](https://github.com/happy-dwarf-team/anvil/security/advisories/new).
2. **If it matches,** it is the file we published. Restore that one file in your antivirus and
   allow only that file. In Microsoft Defender this is in **Protection history**.
3. **Report the false positive,** which helps the next player. For Microsoft Defender use the
   [WDSI submission page](https://www.microsoft.com/wdsi/filesubmission) (it needs a Microsoft
   account): send the file, choose *incorrectly detected as malware*, and give the detection
   name. Other vendors have a form of their own.
4. **Tell us** in an [Anvil issue](https://github.com/happy-dwarf-team/anvil/issues/new/choose)
   with the antivirus, its version and the detection name, so we can see when it happens.

## Report a security problem

Please do not open a public issue. Report it privately on the project's **Security** tab; each
project's `SECURITY.md` says what it covers. Anvil's is
[here](https://github.com/happy-dwarf-team/anvil/blob/main/SECURITY.md).
