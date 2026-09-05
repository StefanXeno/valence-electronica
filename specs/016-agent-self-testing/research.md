# Research: Agent Self-Testing

**Date**: 2026-09-05 | **Plan**: [plan.md](./plan.md)

## R1 — How the agent verifies the running HUD

**Decision**: Documented **`npm` script** (name `verify:hud`) that
(1) reuses existing `npm test` / `npm run check` as the optional logic/type
floor, (2) uses existing `astro preview` or `astro dev` for the running site,
(3) drives the page with **Playwright** and writes **pass/fail + artifacts**
the agent can read.

**Rationale**: Today `npm test` is vitest on `src/lib/*` only. It cannot see
pill height, mute centering, or playlist jump. The operator filming loop
exists because there is no second path. One named command matches FR-001.

**Alternatives considered**:

- **`npm test` only** — rejected; no running HUD.
- **curl / HTML dump only** — rejected; cannot assert vertical centering,
  overshoot, or flatten.
- **Operator video as happy path** — rejected; that is the status quo.
- **Cursor browser tools ad hoc** — useful fallback, not a documented
  repo command (FR-001 / FR-011).

## R2 — Agent-fit package: Playwright (approved)

**Decision**: Use the **`playwright` npm package** (library + CLI), pinned
at **1.62.1** (current stable as of 2026-09-05 research). **Chromium only.**
Do **not** add `@playwright/test` unless a later change wants a test-runner
tree. Do **not** add Puppeteer, jsdom, Firefox, or WebKit.

**Why this is agent-fit** (not “lightest possible”):

| Capability | Why the agent needs it |
|------------|------------------------|
| **Selectors** | Role / CSS / text locators against as-built HUD controls |
| **Screenshots** | Labeled PNGs the agent can open without a filmed recap |
| **Traces** | Optional `tracing.start` / zip per run when a flow fails |
| **Phone viewport** | `390×844` (and `1280×800` laptop) as first-class context options |
| **Tap / drag** | `tap()` + mouse/touch drag for tap-vs-drag height (SC-008) |
| **Labeled artifacts** | Flow-id filenames + `report.md` so SC-003 stays under 2 minutes |

**Rationale**: Operator: pick a package *fitting for an agent*, not the
lightest PATH-Chromium script. Playwright is the expected default. The
`playwright` library (not `@playwright/test`) matches a single
`scripts/verify-hud.mjs` command better than a runner + config tree.
mise registry shorthand `playwright` → `npm:playwright` (mise PR #12385).

**Alternatives considered**:

- **PATH Chromium + Node CDP / `--screenshot`** — previous default;
  rejected after operator feedback. Cannot reliably tap/drag/trace.
- **`@playwright/test`** — same browser API + HTML reporter. Heavier
  (runner, config, spec layout). Not clearly better for one agent command.
- **`@playwright/cli` / Playwright MCP** — agent chat tools, not a
  committed repo command with labeled flow artifacts.
- **Puppeteer** — backup only; not approved; weaker traces/device story.
- **Vitest browser mode** — extra packages (`@vitest/browser-playwright`);
  extra-tool gate.

## R3 — Mise-first install (ties to 017)

**Decision**: Playwright and Node are **mise-provided**. `016` verify
assumes they are available after the project toolchain is installed.

**What `mise install` can do**:

- Pin **Node 24** (matches `.nvmrc` and CI `node-version: 24`).
- Pin **`npm:playwright`** / registry shorthand `playwright` at **1.62.1**.
- Put the `playwright` CLI on PATH via mise shims.

**What `mise install` cannot do alone**:

- Playwright **browser binaries** (Chromium) live in
  `~/.cache/ms-playwright` (or `PLAYWRIGHT_BROWSERS_PATH`). The npm
  backend installs the *package*, not the browser.
- Linux **system libraries** (`libnss3`, etc.) are not a mise tool.

**Remaining documented path** (one command after `mise install`):

```bash
mise run playwright:chromium
# equivalent: playwright install chromium
```

`--with-deps` is the durable `017` mise task (approved 2026-09-05).
⚠️ On Linux it may invoke **sudo/apt** (needs an operator TTY).

**Dual pin**: also declare `playwright` as a **devDependency** in
`package.json` at the same version so `import { chromium } from
'playwright'` resolves from `node_modules`. Mise-only `NODE_PATH` is
fragile (Rationale above).

**Until `017` lands a committed `mise.toml`**: implementers still follow
this path. They MAY add the declared `playwright` dep and run
`playwright install chromium` so the harness works; `017` will pin the
same versions in `mise.toml`.

**Rationale**: Operator asked for mise-first. Research of mise npm
backend (2026): `mise use npm:playwright@1.62.1` writes `[tools]`.
Browser download is universally a second Playwright CLI step in mise
projects (e.g. `mise run playwright-install`).

**Alternatives considered**:

- **aqua / ubi Playwright** — no cleaner Chromium story than npm.
- **mise postinstall hook that always downloads Chromium** — hidden
  network + disk; prefer an explicit `mise run` task.
- **`--with-deps` in the happy path** — now the `017` default (⚠️ sudo/apt TTY).

## R4 — What “as-built 015” means for cases

**Decision**: Expected outcomes come from `015` **as-built 2026-09-05**,
not the 2026-09-01 mock and not the pre-sync spec text.

| Flow | Expected (as-built) |
|------|---------------------|
| Rest | Two bottom docks; **five** content icons; no socials bar; **no phone footer legal** |
| Expand | Handle tap **or** drag; pill grows from `bottom: 0`; **expand === V-Flip**; tap height === drag height; rubber-band then settle; full current **theme-track** card |
| Transport | shuffle + play/pause + playlist; **no vinyl, no loop, no phone slider** |
| Playlist | Current card stays; others add in; list scrolls; header → V-Flip aka. Jukebox; close must not jump |
| Collapse | Drag-down or handle tap **hides transport** |
| Mute | Floor row right; **vertically centered**; stays if `hasAudio: false` (when mounted) |
| Content | **Same pill grows** (~320ms); About / Discography / Tour / Socials / **Info**; exclusive-open |
| Legal | Info → English Imprint / Privacy pills → existing overlay |
| Pause | Video pauses; **soundwave flattens** (`eq-flatten.ts`); shuffle does not hop |
| Laptop | ≥1024px keeps `009`/`011` (slider after unmute allowed) |

`015` marks leftover overshoot / playlist-jump **polish as unspecified
work**. This feature still **detects** leftover overshoot and playlist
jump (operator filming reason). It does **not** fix HUD CSS.

**Rationale**: Operator: test the real HUD, not the old four-icon sheet.

## R5 — Artifact format

**Decision**: A short **markdown report** plus **PNG screenshots** (and
optional **trace.zip**) per named flow. Report lists each flow as
`pass` / `fail` / `skipped`.

**Rationale**: Agent must name the failed flow in under 2 minutes
(SC-003). Pictures + traces beat a filmed recap if they are labeled.

**Alternatives considered**:

- **Pixel-diff goldens** — optional later; v1 is labeled shots +
  measurable checks (`getBoundingClientRect`). Goldens add review noise.
- **Traces only** — screenshots stay primary; traces on fail.

## R6 — Unit tests vs running-site tests

**Decision**: Keep vitest for **pure** helpers (already the pattern).
Optional extra cases for exported constants / flatten class names **only
if no jsdom**. Do **not** import `player-dock.ts` into vitest if that
pulls `window` without a new package (jsdom = extra-tool gate).

**Rationale**: `player-dock.ts` and `eq-flatten.ts` are DOM-first.
Running-site Playwright checks own the HUD regressions.

## R7 — Preview, intro, and viewports

**Decision**: Harness uses **phone ~390×844** (width ≤1023) and **laptop
~1280×800** (width ≥1024). Dismiss or skip intro so docks paint
(`006` / `015`). Prefer `astro preview` after `astro build` when a
stable URL is needed; `astro dev` is acceptable if documented.

**Rationale**: Matches `015` review targets and SC-007 breakpoint
(1023 phone / 1024 laptop).

## R8 — Artist docs and production bundle

**Decision**: No artist-guide section. Optional README one-liner for
developers. `.gitignore` the artifact directory. Harness MUST NOT be
imported from `src/pages` or components.

**Rationale**: Constitution VII and IV.

## R9 — CI

**Decision**: **v1 is local / agent-driven.** Do not add a GitHub Actions
browser job or a paid runner.

**Rationale**: Constitution II; no browser guaranteed in CI. Playwright
download would also blow free-tier minutes.

## R10 — Extra-tool gate (revised)

**Decision**: Playwright is **not** a gate. The gate is **anything else
undeclared**: Puppeteer, jsdom, happy-dom, Firefox, WebKit, extra npm
CLIs. Fail closed; ask the operator.

**Rationale**: Operator granted Playwright 2026-09-05. Workspace rule
still forbids silent extras.

---

All Technical Context unknowns resolved. No remaining NEEDS CLARIFICATION.

**Decisions recorded without waiting**:

1. Package = `playwright` @ 1.62.1 (not `@playwright/test`).
2. Mise-first + one remaining command for Chromium.
3. Dual-pin in `package.json` so the ESM harness can import.
4. `--with-deps` is the `017` Chromium task (operator-approved; ⚠️ sudo/apt).
