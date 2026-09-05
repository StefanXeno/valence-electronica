# Implementation Plan: Agent Self-Testing

**Branch**: `016-agent-self-testing` | **Date**: 2026-09-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-agent-self-testing/spec.md`

## Summary

Give the coding agent a **documented, operator-approved** way to verify the
**running** landing HUD after CSS/HUD changes — without the operator filming
every animation.

**Default approach (operator approved 2026-09-05)**: **Playwright** (`playwright`
npm package) as the agent-fit tool — selectors, screenshots, traces, phone
viewport, tap/drag, labeled artifacts. Install **mise-first** (toolchain owned
by `017`). Existing `npm test` / `npm run check` remain the logic/type floor.
A **dev-only** harness starts (or uses) `astro preview`/`dev` and drives
**phone (≤1023px)** and **laptop (≥1024px)** flows.

**Extra-tool gate**: Puppeteer, jsdom, Firefox/WebKit, or any other new package
— **do not install** unless the operator explicitly approves that named extra.

Coverage follows **as-built `015`** (five-icon growing content pill, expand ===
V-Flip, Info legal, theme-track playlist, pause flatten). This plan does **not**
change visitor HUD and does **not** overwrite `specs/015-mobile-stage-hud/`.

## Technical Context

**Language/Version**: TypeScript (strict) for site libs; Node.js **24** (matches
`.nvmrc` and CI) for the dev-only harness (plain ESM JS)

**Primary Dependencies**: Existing Astro 7 scripts (`dev`, `preview`, `check`,
`build`); existing vitest 4 for `src/lib/*` unit tests; **Playwright 1.62.1**
(`playwright` npm package — library + CLI). Installed mise-first; also declared
as a project **devDependency** so `scripts/verify-hud.mjs` can `import` it.
Chromium only (not Firefox/WebKit).

**Storage**: Artifact files written under a gitignored output dir
(`.verify-hud/`). No visitor data store.

**Testing**: `npm test` + `npm run check` remain the logic/type gates. The new
command is the HUD evidence path (Playwright actions + screenshots / traces /
short report). Browser CI is **not** required for v1.

**Target Platform**: Local WSL/Linux developer machine (primary). Published
GitHub Pages site is unchanged.

**Project Type**: Static Astro site + **dev-only** Playwright verification
script

**Performance Goals**: Full local verify pass **under 10 minutes** (SC-004),
including preview start if needed

**Constraints**:
- Workspace rule: no *extra undeclared* packages; Playwright is approved
- Mise-first: Node + Playwright CLI come from the project toolchain (`017`);
  browsers are **not** fully installed by `mise install` alone — remaining
  command is `mise run playwright:chromium` / `playwright install chromium`
- Constitution I–II: no production runtime, no paid CI
- Constitution IV–V: no new published JS, no tracking
- Phone viewport `max-width: 1023px`; laptop from `1024px`
- Do not edit `specs/015-mobile-stage-hud/`

**Scale/Scope**: One documented npm/mise script, one harness file under
`scripts/`, optional vitest cases for pure helpers already in
`src/lib/eq-flatten.ts` / `src/lib/player-dock.ts` **only if they stay
jsdom-free**. Six phone flow families + cheap laptop rest.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Harness is local/dev-only; published site stays prerendered static files | PASS |
| II. Zero-Cost, Zero-Ops Publishing | No new hosting, no paid browser CI, no extra GitHub account | PASS |
| III. Content-Code Separation | No new artist content files; chrome/data stay the single edit surface | PASS |
| IV. Lightweight by Default | **No new published client JS.** Node/Playwright script is never shipped to visitors. Existing HUD JS is not expanded by this feature. | PASS |
| V. Privacy & Legal Compliance | No tracking, cookies, analytics, or new embeds | PASS |
| VI. Simplicity & Spec-Driven Change | One approved package (Playwright) + Chromium only. Extra tools stay gated. PATH-Chromium-only was rejected as not agent-fit. | PASS |
| VII. Artist-Facing Change Documentation | No new artist-editable surface. Do **not** add a harness how-to to `docs/artist-guide.md`. Optional one-line developer README only. | PASS |

**Post-design re-check**: PASS — contracts describe a CLI + artifact report,
not a visitor API. Complexity stays in `scripts/`; production bundle unchanged.
Playwright is a **devDependency** and never imported from `src/pages` or
components.

## Project Structure

### Documentation (this feature)

```text
specs/016-agent-self-testing/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── agent-verify.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
package.json                      # UPDATE — verify:hud script + playwright devDependency
package-lock.json                 # UPDATE — lock playwright only
scripts/
└── verify-hud.mjs                # NEW — Playwright harness
src/lib/
├── eq-flatten.ts                 # READ — pause flatten (optional unit tests if pure)
├── player-dock.ts                # READ — phone HUD controller (no jsdom)
└── *.test.ts                     # EXISTING vitest; extend only if jsdom-free
docs/artist-guide.md              # DO NOT add harness instructions
README.md                         # OPTIONAL one-line developer pointer
.verify-hud/                      # RUNTIME artifacts (gitignore)
```

**Structure Decision**: Single Astro repo. Verification lives as
`scripts/verify-hud.mjs`, invoked from `package.json` (`verify:hud`). Do **not**
add a `tests/e2e/` Playwright Test tree unless a later change asks for
`@playwright/test`. The committed `mise.toml` is owned by `017`; this feature
consumes it.

## Complexity Tracking

> No constitution violations. Playwright is the **approved default**, not a
> gated alternative. Noted here because it is a new declared dependency.

| Topic | Why noted | Simpler alternative |
|-------|-----------|---------------------|
| Playwright + Chromium | Agent needs tap/drag, traces, phone viewport, labeled shots | PATH Chromium + CDP rejected: not agent-fit; operator approved Playwright |
| Dual pin (mise + package.json) | mise puts CLI on PATH; package.json lets the ESM harness `import { chromium } from 'playwright'` | mise-only import via NODE_PATH is fragile |
