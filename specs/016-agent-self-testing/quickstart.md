# Quickstart & Validation: Agent Self-Testing

**Date**: 2026-09-05 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 24 (`.nvmrc`; `engines` allows ≥22)
- Branch `016-agent-self-testing` with implementation complete
- **Playwright 1.62.1** via the mise-first toolchain (`017`) plus the
  remaining Chromium command
- [contracts/agent-verify.md](./contracts/agent-verify.md)
- Expected phone HUD: as-built `015` (five-icon growing pill, expand ===
  V-Flip, Info legal)

## Toolchain (mise-first)

```bash
mise install
mise run playwright:chromium   # playwright install chromium
npm ci                         # existing Astro/vitest lockfile + playwright
```

Until `017` commits `mise.toml`, the equivalent is: Node 24 on PATH,
`playwright` declared in `package.json`, then `npx playwright install
chromium`.

## Logic / type floor (already in the repo)

```bash
npm test
npm run check
```

These MUST stay green. They do **not** replace HUD verification.

## Primary command (after implementation)

```bash
npm run verify:hud
```

Expected:

- stdout lists each flow id with `pass` / `fail` / `skipped`
- `report.md` + labeled PNGs under `.verify-hud/`
- optional `trace.zip` on fail
- exit `0` if no `fail`

If Playwright or Chromium is missing: the command exits non-zero and
names the mise-first / `playwright install chromium` step.

## Validation scenarios (016)

### US1 — Phone flows without a filmed recap

1. Run `npm run verify:hud` (or start `npm run preview` first if docs say so).
2. Confirm artifacts or checks exist for: rest, tap-open, **drag-open**,
   playlist, collapse, mute center, content/Info, pause flatten.
3. Confirm expected meaning is **five icons**, **expand === V-Flip**,
   **Info legal** — not a four-icon detached sheet.
4. Drag-open MUST be a real drag result. Never a fake pass from tap-open.

### US2 — Readable command output

5. Break a covered flow on purpose (or inspect a stored fail fixture if
   one exists). Confirm the flow **id** appears in stdout and the PNG
   name.
6. Confirm docs point to **one** primary command, not “film this”.

### US3 — Cheap laptop

7. Open the laptop artifact (~1280×800). Confirm `019` HUD (always-open
   player, no vinyl toggle), not phone docks.

### US4 — Declared tools only

8. `package.json` / lockfile: Playwright is the **only** new package.
   No Puppeteer, jsdom, or extra browsers.
9. Harness is not imported from `src/pages` or components.
10. `docs/artist-guide.md` has **no** “run the HUD harness” section.

## Out of scope for this quickstart

- Installing undeclared extra packages
- Changing phone HUD CSS
- Editing `specs/015-mobile-stage-hud/`
- Implementing `017` (`mise.toml`) — this feature consumes that toolchain
