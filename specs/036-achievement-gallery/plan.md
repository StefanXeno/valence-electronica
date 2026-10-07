# Implementation Plan: Achievement Gallery

**Branch**: `036-achievement-gallery` (work happens on `pre-release`) | **Date**: 2026-10-07 |
**Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/036-achievement-gallery/spec.md`

## Summary

Add an on-stage achievement gallery: a trophy button bottom-right (hidden until the first
unlock) opens a dialog with a "{found} / {total} found" counter and one tile per achievement
(unlocked, locked with hint, or secret). All achievement copy moves into one artist-editable
registry, `src/data/achievements.json`, which both the toast and the gallery read; trigger
modules unlock by id. The toast becomes clickable. Storage "unavailable" is separated from
"unlocked" so blocked storage never shows false unlocks. A newcomer reset exists only on dev
and preview builds. Secret achievements are kept out of the HTML and obfuscated in the
delivered files, with a neutral id and a one-time storage-key migration; a build check
fails if secret copy leaks into `dist/`. A fifth achievement, "Coder", unlocks when a
source reader follows a comment hidden mid-document (type `coder`); typed combos also fire
from URL hashes (`#coder`, `#666`) so phones can trigger them. Design decisions:
[research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 6 (strict), Astro 7 components, CSS

**Primary Dependencies**: Astro (existing). No new packages.

**Storage**: Browser `localStorage`, first-party keys `ve-achievement-{id}` and
`ve-player-discovered`; the secret rub key is migrated once from
`ve-achievement-why-are-you-rubbing` to `ve-achievement-rub`.

**Testing**: Vitest (`npm test`) for pure logic; `astro check`; manual browser checks by the
operator per [quickstart.md](./quickstart.md).

**Target Platform**: Static site on GitHub Pages; modern evergreen browsers, phone (≥320px)
and laptop.

**Project Type**: Static web site (Astro, single project).

**Performance Goals**: No extra network requests; gallery JS + registry adds only a few KB
to the existing client bundle; open/close feels instant.

**Constraints**: Constitution I (static), IV (JS justified, 320px, reduced motion), V (no
tracking), III/VII (content separation + artist guide).

**Scale/Scope**: 5 achievements at launch; ~8 source files changed, ~6 added.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
| --------- | ------ | ----- |
| I. Static-first | ✅ | Gallery prerendered; state read client-side from first-party storage. No backend. |
| II. Zero-cost publishing | ✅ | No CI or hosting change. |
| III. Content-code separation | ✅ | All achievement copy in `src/data/achievements.json`; gallery labels in `chrome.md`. Removes hard-coded copy from 3 TS modules (fixes a `032` Known Gap). |
| IV. Lightweight by default | ✅ justified | Client JS is required: unlock state only exists in `localStorage`, and the toast/icon react to in-page unlocks. Without JS nothing renders visibly (icon stays `hidden`). 320px and reduced motion covered by FR-014/SC-005. |
| V. Privacy & legal | ✅ | No tracking, no requests, no new storage keys; legal links untouched. |
| VI. Simplicity & spec-driven | ✅ | Reuses existing exclusivity signals and glitch helpers; no central surface manager; array order instead of an `order` field. |
| VII. Artist documentation | ✅ | Artist guide gets an "Achievements" section; chrome section lists new fields; "Stable ids" lists achievement ids. Same change set. |
| English / Conventional Commits | ✅ | — |
| Branch naming `NNN-short-name` | ⚠️ deviation | Operator directs work on `pre-release`. Recorded in spec Assumptions; no code impact. |

**Post-design re-check**: unchanged — all gates pass; the branch deviation is
operator-approved.

## Project Structure

### Documentation (this feature)

```text
specs/036-achievement-gallery/
├── spec.md
├── plan.md              # this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── achievements-module.md
│   └── gallery-ui.md
├── checklists/requirements.md
└── tasks.md             # next: /speckit-tasks
```

### Source Code

```text
src/
├── data/
│   └── achievements.json            # NEW  registry (order = tile order)
├── lib/
│   ├── achievements.ts              # NEW  validation, obfuscation, payload, state, migration, tiles, counter, reset (pure; no JSON import)
│   ├── achievements.test.ts         # NEW
│   ├── achievements-registry.ts     # NEW  build-only: imports + validates achievements.json
│   ├── achievement-gallery.ts       # NEW  gallery + trophy DOM wiring
│   ├── achievement-toast.ts         # CHG  unlockAchievement(id), clickable card, hold on hover/focus
│   ├── track-rub.ts                 # CHG  unlockAchievement('rub')
│   ├── infinite-spin.ts             # CHG  unlockAchievement('infinite-spin'); state guard
│   ├── demonic-combo.ts             # CHG  unlockAchievement('demonic-combo'); uses key-combo.ts; adds #666
│   ├── key-combo.ts                 # NEW  typed-word buffer (extracted from demonic-combo) + URL-hash trigger
│   ├── key-combo.test.ts            # NEW
│   ├── coder-combo.ts               # NEW  type "coder" or #coder → unlockAchievement('coder')
│   ├── stage-player.ts              # CHG  unlockAchievement('player-found'); gallery counts as overlay
│   ├── gesture-ignore.ts            # CHG  gallery + toggle in CHROME_SELECTOR (+ test)
│   ├── hud-icons.ts                 # CHG  'trophy' token
│   ├── stage.ts                     # CHG  chrome fields + fallbacks (add 9, remove 2)
│   └── url.ts                       # CHG  isPreviewBuild() extracted from Base.astro
├── components/
│   ├── AchievementGallery.astro     # NEW  trophy toggle + dialog + tiles (+ reset in dev/preview)
│   ├── AchievementGlyph.astro       # NEW  vinyl / infinite / demonic / code glyphs (shared)
│   ├── SourceNote.astro             # NEW  mid-document HTML comment for source readers
│   ├── TrackRubOverlay.astro        # CHG  toast card → button, live region split, uses AchievementGlyph + chrome eyebrow
│   ├── StagePlayer.astro            # CHG  drop data-achievement-title/sub
│   └── HudIcon.astro                # CHG  trophy SVG
├── content/ui/chrome.md             # CHG  new gallery labels; remove playerAchievement*
├── content.config.ts                # CHG  ui schema fields
└── layouts/Base.astro               # CHG  render AchievementGallery + SourceNote, init scripts, use isPreviewBuild()
scripts/
└── check-secrets.mjs                # NEW  fails build if secret copy appears in dist/ (SC-007)
package.json                         # CHG  build: … && node scripts/check-secrets.mjs (no new deps)
docs/
├── artist-guide.md                  # CHG  Achievements section, chrome fields, stable ids
└── ideas.md                         # CHG  IDEA-026 → promoted
```

**Structure Decision**: Single Astro project. Pure logic in `src/lib/achievements.ts`
(testable with an injected `Storage`, like `player-discovery.ts`); DOM wiring in
`achievement-gallery.ts`; markup in body-level components rendered from `Base.astro` so the
gallery works on the landing and every overlay route.

## Implementation Notes

1. **Registry first** (`achievements.json`, `achievements.ts`, `achievements-registry.ts`,
   tests). Validation throws with index + id; `.astro` frontmatter calls
   `loadAchievementRegistry()` at build so a bad registry fails `npm run build` (FR-010).
   The toast root carries the client payload (`toClientPayload`) with secret copy
   obfuscated (research R11); client code reads it via `getAchievements()`, never the JSON.
2. **Migrate triggers** to `unlockAchievement(id)`; delete the four key constants and inline
   copy; remove `playerAchievementTitle/Sub` from schema, chrome, `stage.ts`, and
   `StagePlayer.astro`. Rename glyph token `rub` → `vinyl`. Rename the secret id to `rub`
   and run `migrateLegacyKeys()` first thing on boot (FR-011).
3. **Toast**: button card, live region on the SR span only, hold timers on
   hover/focus, activation → hide + `achievement-gallery-open`. Eyebrow from chrome. No
   default copy in the shell.
4. **Gallery**: build-time tiles (non-secret: two variants; secret: placeholder only, filled
   from a template on unlock), client sets `data-tile-kind`, counter, icon visibility;
   exclusivity per research R4; pulse per R6; locked-tile ambient glitch per R10.
4b. **Secret check**: `scripts/check-secrets.mjs` chained after `astro build` (SC-007).
4c. **Coder**: extract `key-combo.ts` from `demonic-combo.ts`, add `coder-combo.ts` and
   `SourceNote.astro` (research R12); verify the comment survives in `dist/`.
4d. **Hash triggers** `#coder` and `#666` (research R13), bound after `initStagePlayer()`.
   Fold into `032` on ship: remove the "666 is keyboard-only" Known Gap.
5. **Reset**: only rendered when `import.meta.env.DEV || isPreviewBuild()`.
6. **Docs**: artist guide (fields, `secret`, ids must not be renamed, new achievements need a
   developer), chrome field list, stable-ids list; `ideas.md` IDEA-026 → promoted.
7. **On ship**: fold behavior into `032-easter-eggs` (FRs, Known Gaps: remove "no overview
   page" and "copy hard-coded" for achievements) and `026` (bottom-right trophy at rest),
   update `032/plan.md` source map, delete this folder (`specs/README.md` workflow).

## Risks

- **Bottom-right collisions on phones** (footer, phone menu, player panel in `full`):
  verify at 320px / 390px (quickstart #13). Gallery and player are exclusive, so only the
  resting vinyl matters.
- **Toast as button inside a fixed, pointer-events-none layer**: make sure it does not
  swallow stage taps beyond its card (counted taps for the player hint ignore buttons
  already).
- **Obfuscation is not secrecy**: anyone reading `track-rub.ts` or decoding the payload
  learns the secret. Accepted by the operator (spec Clarifications).
- **A future client import of `achievements.json`** would silently leak secret copy into
  the bundle; `check-secrets.mjs` catches it at build.
- **Rub tagline** (`You know how to rub ^^`) stays hard-coded — out of scope; remains a
  `032` Known Gap.

## Complexity Tracking

No constitution violations requiring justification beyond the operator-directed branch
deviation noted above.
