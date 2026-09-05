# Research: Mise Project Toolchain

**Date**: 2026-09-05 | **Plan**: [plan.md](./plan.md)

Aligned with **what `016` actually installed** on 2026-09-05:

- `playwright@1.62.1` as a `package.json` **devDependency** (exact)
- `npx playwright install chromium` (Chrome for Testing 151 / Chromium
  build used by Playwright 1.62.1)
- **No** `--with-deps`
- **No** `mise.toml` yet (this feature owns it)
- Node from `.nvmrc` = **24** (CI deploy uses `node-version: 24`)

## R1 — Config filename

**Decision**: `mise.toml` at repo root.

**Rationale**: mise default; committed; visible to agents. `.mise.toml`
is for local overrides that should not be the project source of truth.

**Alternatives considered**: `.tool-versions` (asdf-style, weaker tasks);
`.mise.toml` only (easy to treat as local).

## R2 — What to pin (no unused tools)

**Decision**: Only

| Tool | Pin | Why |
|------|-----|-----|
| `node` | `24` | `.nvmrc`, CI check.yml `node-version-file`, deploy.yml `24` |
| `npm:playwright` (shorthand `playwright`) | `1.62.1` | Exact version `016` locked |

Do **not** pin: python, terraform, aqua chromium, firefox, webkit, bun,
pnpm, a separate npm major (use Node’s bundled npm).

**Rationale**: Operator: do not invent a pile of unused tools. Scan of
the repo: Astro/vitest via npm lockfile; Node via `.nvmrc`; Playwright
via `016`.

## R3 — Mise vs browser binaries

**Decision**: `mise install` installs Node + the Playwright **package/CLI**.
Chromium is **not** installed by mise alone. Remaining command:

```bash
mise run playwright:chromium
# = playwright install --with-deps chromium
```

**Rationale**: mise npm backend installs the npm package (embedded aube
or npm). Playwright browsers live in `~/.cache/ms-playwright`. Every
mise+Playwright project reviewed uses a second task or hook.

**Operator approval (2026-09-05)**: `--with-deps` is the durable default
in `mise.toml`. ⚠️ On Linux this may invoke **sudo/apt**.

## R4 — Dual pin with package.json

**Decision**: Keep `playwright` in `package.json` (already done by `016`)
**and** pin `npm:playwright` in `mise.toml`. Versions MUST match
**1.62.1**.

**Rationale**: `scripts/verify-hud.mjs` does `import { chromium } from
'playwright'`. That resolves from `node_modules` after `npm ci`. Mise
puts the CLI on PATH for `mise run playwright:chromium`.

## R5 — Clone sequence

**Decision**: Documented happy path:

```bash
mise install
npm ci
mise run playwright:chromium
npm run verify:hud   # 016
```

Optional convenience task `setup` MAY chain `npm ci` + Chromium. Do not
hide `npm ci` — lockfile remains the project-dep source of truth.

## R6 — CI

**Decision**: v1 does **not** migrate GitHub Actions to mise. Keep
`actions/setup-node` + `npm ci`. Local/agent is the target.

**Rationale**: Constitution II; Actions already work; browser CI is out
of `016` scope.

## R7 — Secrets and comments

**Decision**: English comments only. No tokens, no `~` user paths, no
`PLAYWRIGHT_BROWSERS_PATH` overrides in the committed file.

## R8 — Extra-tool gate

**Decision**: Adding anything else to `[tools]` is an operator-approval
gate (same as `016` US4).

---

All unknowns resolved. Implement is **out of scope** for this pass.
