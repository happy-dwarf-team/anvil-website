# Security policy

This repository builds the static website at
[anvil.happydwarf.dev](https://anvil.happydwarf.dev). The site runs no code
for visitors beyond Starlight's search, but its download buttons point people
at native code. Please report security problems privately, not in public
issues.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting:
[Report a vulnerability](https://github.com/happy-dwarf-team/anvil-website/security/advisories/new).
Include the page, what you found and what an attacker gains.

This is a volunteer project; reports are handled on a best-effort basis. We
will confirm the report, agree on a fix and a disclosure date with you, and
credit you in the advisory unless you prefer otherwise.

## In scope

- Download links, checksums or install instructions that lead to a file other
  than the release asset of the named repository.
- Content injected into the site, for example through the build, a dependency
  or the release data read from the GitHub API.
- The build and deploy workflows: secrets exposed to pull requests, or a
  pull request able to change the deployed site.

## Out of scope

- Anvil and its plugins: report to the repository of
  [Anvil](https://github.com/happy-dwarf-team/anvil/security/advisories/new)
  or of the plugin.
- Missing HTTP security headers: GitHub Pages does not let the site set them.
