# Contract: `mise.toml`

**Date**: 2026-09-05 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

This is a **developer/agent config contract**, not a visitor API.

## Path

`mise.toml` at repository root.

## Required `[tools]`

```toml
[tools]
# Node major matches .nvmrc and GitHub Actions (check.yml / deploy.yml).
node = "24"
# Same version 016 declared in package.json (devDependency).
"npm:playwright" = "1.62.1"
```

Registry shorthand `playwright = "1.62.1"` is an acceptable equivalent
if the installed mise version resolves it to `npm:playwright`.

## Required `[tasks]`

```toml
[tasks."playwright:chromium"]
description = "Download Playwright Chromium (mise cannot do this alone)"
run = "playwright install --with-deps chromium"
```

Optional:

```toml
[tasks.setup]
description = "Project deps + Chromium after mise install"
run = "npm ci && playwright install --with-deps chromium"
```

## Commands

| Command | Effect |
|---------|--------|
| `mise install` | Install Node 24 + Playwright CLI |
| `mise run playwright:chromium` | Browser binary + OS libs (`--with-deps`) |
| `npm ci` | Lockfile deps including `playwright` module |
| `npm run verify:hud` | `016` harness (not owned by this file) |

## Forbidden

- Secrets, tokens, machine-local absolute paths
- Extra `[tools]` (python, firefox, webkit, …)
- Artist-guide instructions
- Changing visitor `src/`

## Consistency with 016

`scripts/verify-hud.mjs` missing-tool copy MUST keep naming:

- `mise install`
- `mise run playwright:chromium` (or `playwright install --with-deps chromium`)
