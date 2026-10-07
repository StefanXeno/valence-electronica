---

description: "Task list for 036 Achievement Gallery"
---

# Tasks: Achievement Gallery

**Input**: Design documents from `specs/036-achievement-gallery/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit tests for the pure module are included because plan.md lists
`src/lib/achievements.test.ts`; browser checks are manual by the operator (quickstart.md,
`.claude/rules/operator-workflow.md` — no browser automation).

**Organization**: Grouped by user story (spec.md). Work happens on `pre-release`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US4 from spec.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Small shared helpers that later phases import.

- [X] T001 [P] Extract `isPreviewBuild()` (BASE_URL ends with `/pre-release`) into `src/lib/url.ts` and use it in `src/layouts/Base.astro` instead of the inline `isPreview` expression (behavior unchanged)
- [X] T002 [P] Add `trophy` to `HudIconToken` and `KNOWN` in `src/lib/hud-icons.ts` and a first-party 24×24 `currentColor` trophy SVG branch in `src/components/HudIcon.astro` (research R7)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Registry, pure achievement logic, and one unlock API. All stories depend on it.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Create `src/data/achievements.json` with the five entries in the order and copy from data-model.md ("Initial content"); the first entry has id `rub`, `secret: true`, no hint; `player-found` copy taken from current `playerAchievementTitle`/`playerAchievementSub` in `src/content/ui/chrome.md`
- [X] T004 Implement `src/lib/achievements.ts` per contracts/achievements-module.md (MUST NOT import the JSON): `KNOWN_ACHIEVEMENT_IDS`, types, `achievementStorageKey`, `validateAchievementRegistry` (throws naming index + id for: unknown id, duplicate, missing known id, empty title/subtitle, bad glyph, non-secret without hint), `encodeObfuscated`/`decodeObfuscated` (reverse of Base64 of UTF-8, via `btoa`/`atob` + `TextEncoder`/`TextDecoder`), `toClientPayload` (secret entries: obfuscated title/subtitle, `enc: 1`, no hint), cached `getAchievements(root)` reading and decoding `data-achievement-registry`, `getAchievement`, `migrateLegacyKeys` (legacy key literal stored as an obfuscated constant; copy `"1"` to `ve-achievement-rub`, remove legacy; no-op on blocked storage), `readAchievementState` (`{available:false}` when storage missing or throws), `markUnlocked`, `shouldToast` (false when unlocked or unavailable), `resetProgress` (all `ve-achievement-{id}` + `ve-player-discovered` via `PLAYER_DISCOVERED_STORAGE_KEY` from `src/lib/player-discovery.ts`), `tileViews`, `formatCounter`; storage injected with `globalThis.localStorage` default
- [X] T005 [P] Implement build-only `src/lib/achievements-registry.ts`: `loadAchievementRegistry()` imports `src/data/achievements.json`, runs `validateAchievementRegistry`, caches; doc comment states it may only be imported from `.astro` frontmatter
- [X] T006 [P] Write `src/lib/achievements.test.ts` covering every validation failure, the shipped `achievements.json` passing, obfuscation round trip incl. non-ASCII (`ü`, emoji), `toClientPayload` containing no plain secret title/subtitle and no secret hint, `getAchievements` decoding a payload, `migrateLegacyKeys` (legacy set → moved; nothing set → no-op; both set → legacy removed; blocked storage → no throw), state with available/blocked/unknown keys, `shouldToast` on blocked storage, `markUnlocked` first-vs-repeat, `resetProgress` clearing exactly the six keys (five achievements + player discovery), `tileViews` for unlocked/locked/secret, and `formatCounter`
- [X] T007 [P] Add `AchievementGlyph.astro` in `src/components/` rendering `vinyl` (HudIcon `jukebox`), `infinite` (∞ SVG moved from the toast), `demonic` (`666` text), and `code` (`</>` mark, new first-party SVG) by prop (research R8)
- [X] T008 Rewrite `src/lib/achievement-toast.ts`: replace `maybeUnlockAchievement`/`hasAchievement`/`markAchievement` with `unlockAchievement(id)` that checks `shouldToast`, calls `markUnlocked`, shows the toast with copy from `getAchievement(id)`, and dispatches `achievement-unlocked` (`detail: { id }`) on `document`; glyph switching uses `vinyl|infinite|demonic|code`
- [X] T009 Update the toast shell in `src/components/TrackRubOverlay.astro`: set `data-achievement-registry={toClientPayload(loadAchievementRegistry())}` on the toast root, render one `AchievementGlyph` per glyph token via `data-ve-achievement-glyph` (token `rub` → `vinyl`), drop the inline ∞/666 markup and all default title/sub text
- [X] T010 [P] Migrate `src/lib/track-rub.ts` to `unlockAchievement('rub')`; delete `ACHIEVEMENT_RUB_STORAGE_KEY` and inline copy
- [X] T011 [P] Migrate `src/lib/infinite-spin.ts` to `unlockAchievement('infinite-spin')`; replace the `hasAchievement` early-exit with `!shouldToast('infinite-spin')`; delete the key constant and inline copy
- [X] T012 [P] Migrate `src/lib/demonic-combo.ts` to `unlockAchievement('demonic-combo')`; delete the key constant and inline copy (keep `appendDemonicDigit` and its test unchanged)
- [X] T013 Migrate `src/lib/stage-player.ts` to `unlockAchievement('player-found')`; delete `ACHIEVEMENT_PLAYER_FOUND_STORAGE_KEY` and the `dataset.achievementTitle/Sub` reads; remove `data-achievement-title`/`data-achievement-sub` from `src/components/StagePlayer.astro`
- [X] T014 Call `migrateLegacyKeys()` first in the boot script of `src/layouts/Base.astro`, before `initTrackRub()` and the other inits, so no module reads the old key
- [X] T015 Remove `playerAchievementTitle`/`playerAchievementSub` from the `ui` schema in `src/content.config.ts`, from `UiChrome`/`CHROME_FALLBACK`/`getChrome` in `src/lib/stage.ts`, and from `src/content/ui/chrome.md`
- [X] T016 Run `npm test` and `npm run check`; fix all references to removed symbols (`grep -rn "maybeUnlockAchievement\|hasAchievement\|ACHIEVEMENT_.*_STORAGE_KEY\|playerAchievement\|why-are-you-rubbing" src` returns nothing; `grep -rn "achievements.json" src` only hits `achievements-registry.ts` and the test)

**Checkpoint**: All four eggs still toast exactly as before, now from the registry; a visitor
with the old rub key keeps it.

---

## Phase 3: User Story 1 - Fan opens the gallery and sees their progress (Priority: P1) 🎯 MVP

**Goal**: Trophy button (visible when ≥1 unlock on load) opens a dialog with counter and tiles; secret copy never ships in plain text.

**Independent Test**: With two achievements unlocked, open via the icon; counter, unlocked/locked/secret tiles correct; closes via X, Escape, outside click; exclusive with player and overlays; `npm run build` passes the secret check (quickstart #7–#9, #18).

- [X] T017 [US1] Add gallery chrome fields `achievementsLabel`, `achievementsIcon`, `achievementsTitle`, `achievementsCounter`, `achievementLockedTitle`, `achievementSecretTitle`, `achievementUnlockedLabel`, `achievementsCloseLabel`, `achievementsResetLabel` to the `ui` schema in `src/content.config.ts`, to `UiChrome`, `CHROME_FALLBACK` (defaults from data-model.md), and `getChrome` in `src/lib/stage.ts`, and set them in `src/content/ui/chrome.md`
- [X] T018 [US1] Create `src/components/AchievementGallery.astro` per contracts/gallery-ui.md using `loadAchievementRegistry()`: `hidden` trophy toggle (`resolveHudIcon(chrome.achievementsIcon, 'trophy')`), dialog with close button, title, `aria-live` counter, `<ol>` of tiles — non-secret tiles with unlocked (`AchievementGlyph` + title + subtitle) and locked (`achievementLockedTitle` + hint) variants; secret tiles with only the `achievementSecretTitle` placeholder; plus `<template data-achievement-unlocked-template>` and one `<template data-achievement-glyph="{token}">` per glyph
- [X] T019 [US1] Style `src/components/AchievementGallery.astro`: toggle fixed bottom-right mirroring the vinyl's offsets/size from `src/components/StagePlayer.astro`, hidden under `html[data-intro-pending]`/`html[data-intro-active]`; dialog frame reusing the rub panel look (dark rounded, theme tokens), internal scroll, no horizontal scroll at 320px; tile variants shown by `data-tile-kind`; reduced-motion removes entrance motion
- [X] T020 [US1] Implement `src/lib/achievement-gallery.ts` `initAchievementGallery()`: on boot read `readAchievementState`, unhide toggle when available with ≥1 unlock, apply `tileViews` to `data-tile-kind`, fill unlocked secret tiles from the template with decoded copy from `getAchievement`, fill counter via `formatCounter`; open (focus close button, set `aria-expanded`, add `html.achievement-gallery-open`, dispatch `stage-overlay-close`, close any visible `[data-track-rub-panel]`), close on X / Escape / outside pointerdown with focus restore; also open on `achievement-gallery-open` event
- [X] T021 [US1] Exclusivity in `src/lib/achievement-gallery.ts`: close on `player-state-change` with `state === 'full'`, on `#legal-overlay [data-legal-panel]` becoming visible (MutationObserver), and on `html.site-nav-menu-open`
- [X] T022 [P] [US1] In `src/lib/stage-player.ts`, treat `html.achievement-gallery-open` as an open overlay in `isOverlayOpen()` and `collapseForOverlay()` so the full player collapses when the gallery opens
- [X] T023 [P] [US1] Add `[data-achievement-gallery]` and `[data-achievement-toggle]` to `CHROME_SELECTOR` in `src/lib/gesture-ignore.ts` and cover them in `src/lib/gesture-ignore.test.ts`
- [X] T024 [US1] Render `<AchievementGallery />` in `src/layouts/Base.astro` next to `TrackRubOverlay` and call `initAchievementGallery()` in the boot script (after `migrateLegacyKeys()`)
- [X] T025 [P] [US1] Create `scripts/check-secrets.mjs` (Node built-ins only) per contracts/achievements-module.md and chain it in `package.json` as `"build": "astro check && astro build && node scripts/check-secrets.mjs"`

**Checkpoint**: US1 works for visitors who already have unlocks (MVP); the build fails if secret copy leaks.

---

## Phase 4: User Story 2 - The icon appears with the first find (Priority: P1)

**Goal**: Icon appears/pulses on unlock; toast is clickable and holds on hover/focus.

**Independent Test**: Fresh browser → no icon; trigger an egg → icon appears with pulse; hover holds toast; click or Tab+Enter on toast opens gallery; no focus jump (quickstart #1–#6, #11).

- [X] T026 [US2] In `src/lib/achievement-gallery.ts`, listen for `achievement-unlocked`: unhide the toggle, refresh tiles (incl. filling a secret tile) and counter in place, and play a one-shot pulse with `playElementGlitch` only when `prefersGlitchMotion()` (no pulse under reduced motion)
- [X] T027 [US2] Turn the toast card in `src/components/TrackRubOverlay.astro` into `<button type="button" data-ve-achievement-open>` with `pointer-events: auto`; move `role="status"`/`aria-live` from the root to the `data-ve-achievement-announce` span; eyebrow text from `chrome.achievementUnlockedLabel` (via `getChrome()`), also exposed as `data-achievement-unlocked-label` on the root; visible focus style
- [X] T028 [US2] In `src/lib/achievement-toast.ts`, pause hide timers on `pointerenter`/`focusin` and restart the hold on `pointerleave`/`focusout`; on card activation hide the toast immediately and dispatch `achievement-gallery-open`; never call `focus()`; SR announcement prefix from `data-achievement-unlocked-label`

**Checkpoint**: Newcomer flow complete (US1 + US2).

---

## Phase 5: User Story 3 - Artist edits achievement copy in one place (Priority: P2)

**Goal**: One documented file controls all copy, order, and secret flags; bad edits fail the build.

**Independent Test**: Change title, hint, secret flag, order in `src/data/achievements.json`; rebuild; toast and gallery reflect all; removing a required hint fails `npm run build` naming the entry (quickstart #16 + registry failure check).

- [X] T029 [US3] Verify the build-time failure path: temporarily break `src/data/achievements.json` (remove `infinite-spin` hint), confirm `npm run build` fails with a message naming `infinite-spin`, then revert
- [X] T030 [P] [US3] Add an "Achievements (easter eggs)" section to `docs/artist-guide.md`: file path, fields (`id`, `title`, `subtitle`, `glyph`, `secret`, `hint`), array order = tile order, secret behavior (write plain text; the site hides it automatically; ids must not hint at a secret), new achievements need a developer, run `npm run check` after edits
- [X] T031 [P] [US3] In `docs/artist-guide.md`, list the new gallery fields (and `achievementsIcon` override) in the UI chrome section, drop `playerAchievementTitle/Sub` mentions if any, and add achievement `id`s to "Stable ids — do not rename casually" (renaming resets visitors' progress)

**Checkpoint**: Copy is fully artist-owned (Constitution III + VII).

---

## Phase 6: User Story 4 - Operator resets progress while testing (Priority: P3)

**Goal**: Newcomer reset on dev/preview only.

**Independent Test**: On dev, reset → reload → newcomer state; live build HTML has no reset control (quickstart #14–#15).

- [X] T032 [US4] In `src/components/AchievementGallery.astro`, render `<button data-achievement-reset>{achievementsResetLabel}</button>` only when `import.meta.env.DEV || isPreviewBuild()`
- [X] T033 [US4] In `src/lib/achievement-gallery.ts`, wire the reset button: `resetProgress()`, close the gallery, hide the toggle, reset tiles to locked/secret (remove filled secret content) and the counter

**Checkpoint**: US1–US4 functional.

---

## Phase 7: User Story 5 - A curious coder reads the source (Priority: P3)

**Goal**: A comment hidden mid-document leads source readers to the "Coder" achievement; `#coder` and `#666` work on phones.

**Independent Test**: View source → comment mid-body mentioning `coder` and `#coder`; typing `coder` or opening `…/#coder` unlocks Coder; `…/#666` runs the demonic combo; the hash disappears without a history entry (quickstart #19–#20).

- [X] T034 [P] [US5] Create `src/lib/key-combo.ts` per contracts/achievements-module.md (`appendComboKey`, `isComboKeyEvent`, `bindKeyCombo`, `hashMatches`, `bindHashCombo` with initial check after DOMContentLoaded and on `hashchange`, stripping via `history.replaceState(history.state, '', location.pathname + location.search)`) and refactor `src/lib/demonic-combo.ts` onto it, keeping `appendDemonicDigit` as a thin wrapper so `src/lib/demonic-combo.test.ts` still passes
- [X] T035 [P] [US5] Write `src/lib/key-combo.test.ts`: word buffer (letters case-insensitive, digits, reset on other keys), separate buffers for `666` and `coder` do not reset each other, `hashMatches` for `#coder`, `#CODER`, `#%36%36%36`, `#666`, and non-matches (`#6666`, `#coderx`, empty)
- [X] T036 [US5] Create `src/lib/coder-combo.ts`: export `CODER_WORD = 'coder'`; `initCoderCombo()` registers `bindKeyCombo` and `bindHashCombo` with one handler calling `unlockAchievement('coder')`
- [X] T037 [US5] In `src/lib/demonic-combo.ts`, register `bindHashCombo('666', …)` with the same handler as the keyboard combo (Nightmare + achievement + wild glitch)
- [X] T038 [US5] Create `src/components/SourceNote.astro` emitting the comment from contracts/achievements-module.md (word from `CODER_WORD`, mentions `#coder` for phones) and render it in `src/layouts/Base.astro` between `</main>` and `<Footer />`
- [X] T039 [US5] Call `initCoderCombo()` in the boot script of `src/layouts/Base.astro` next to `initDemonicCombo()`
- [X] T040 [US5] After `npm run build`, confirm the comment is present in `dist/index.html` and a content route (e.g. `dist/tour/index.html`), inside `<body>` after the stage markup and not in `<head>`; if the compiler stripped it, switch `SourceNote.astro` to `set:html`

**Checkpoint**: All stories functional.

---

## Phase 7b: User Story 6 - Fan controls the ultra glitch mode (Priority: P3)

- [X] T046 [US6] Add chrome field `achievementWildToggleLabel` (default "Ultra glitch") to `src/content.config.ts`, `src/lib/stage.ts`, `src/content/ui/chrome.md`, and the artist guide's gallery chrome list
- [X] T047 [US6] In `src/lib/demonic-combo.ts`, export `disableWildGlitch()` and `switchToNightmare()`
- [X] T048 [US6] In `src/components/AchievementGallery.astro`, render a `role="switch"` button (`data-wild-toggle`) inside the unlocked variant of the `demonic-combo` tile, styled as an on/off pill
- [X] T049 [US6] In `src/lib/achievement-gallery.ts`, sync the switch's `aria-checked` from `isWildGlitchActive()` on render and on `data-glitch-wild` changes; on click turn on (wild + Nightmare) or off (wild only)
- [X] T050 [US6] Run `npm test` and `npm run build`; add quickstart check #21

---

### Operator review: photosensitivity

- [X] T051 [US6] `src/lib/demonic-combo.ts`: 666 / `#666` no longer call `enableWildGlitch()` (opt-in only)
- [X] T052 [US6] `src/lib/glitch.ts`: wild mode excludes the `blink` family and keeps base preset speed; `src/lib/glitch-ambient.ts`: per-surface 1 s cooldown, burst ≤ 2, slower wild tick
- [X] T053 [US6] `src/components/AchievementGallery.astro` + `src/lib/achievement-gallery.ts`: expandable Demonic tile with warning (`achievementWildWarning`) above a styled switch; tiles list `overflow-x: hidden`
- [ ] T054 Operator: record Nightmare (normal and ultra glitch) and run a flash analysis (e.g. PEAT); tone down base presets if it fails

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T041 [P] Ambient glitch on locked/secret tiles while the gallery is open, only when `prefersGlitchMotion()`, using the existing `createContinuousGlitch` pattern from `src/lib/glitch.ts`; stopped on close (research R10)
- [X] T042 [P] Mark IDEA-026 `promoted` in `docs/ideas.md` with **Promoted to** `specs/036-achievement-gallery/`
- [X] T043 Run `npm test`, `npm run check`, `npm run build` (incl. `check-secrets.mjs`); confirm `dist/index.html` has no `data-achievement-reset` (SC-006) and `grep -ri "rubbing" dist/` returns nothing (SC-007)
- [X] T044 Hand quickstart.md manual checks (#1–#20) to the operator for browser verification (do not run browser automation)
- [ ] T045 After operator sign-off: fold behavior into `specs/032-easter-eggs/spec.md` (FRs for gallery, registry, toast, secret obfuscation, rub key migration; remove the "copy hard-coded" achievements gap, the "No achievements overview page" gap, and the "demonic combo is keyboard-only" gap; add Coder and the hash triggers), note the bottom-right trophy in `specs/026-stage-player/spec.md`, update `specs/032-easter-eggs/plan.md` source map, add the `036` row to the mapping in `specs/README.md`, and delete `specs/036-achievement-gallery/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none — T001 and T002 in parallel.
- **Foundational (Phase 2)**: after Setup. T003 → T004 → (T005 ∥ T006 ∥ T007) → T008 → T009 → (T010 ∥ T011 ∥ T012) → T013 → T014 → T015 → T016. Blocks all stories.
- **US1 (Phase 3)**: after Foundational. T017 → T018 → T019; T020 after T018; T021 after T020; T022, T023, T025 independent; T024 after T018/T020.
- **US2 (Phase 4)**: after US1 (needs the gallery to open and the toggle to reveal).
- **US3 (Phase 5)**: T029 after T018 (build-time validation runs in the components). Docs tasks T030/T031 can start right after Phase 2.
- **US4 (Phase 6)**: after US1.
- **US5 (Phase 7)**: after Foundational (needs `unlockAchievement` and the `coder` registry entry). T034 → T036/T037; T035 with T034; T038 → T040; T039 after T036.
- **Polish (Phase 8)**: after all desired stories; T045 only after operator sign-off.

### Parallel Opportunities

- Phase 1: T001 ∥ T002
- Phase 2: T005 ∥ T006 ∥ T007 (after T004); T010 ∥ T011 ∥ T012 (after T008)
- Phase 3: T022 ∥ T023 ∥ T025 alongside T018–T021
- Phase 5: T030 ∥ T031 (any time after Phase 2)
- Phase 7: T034 ∥ T035; T036 ∥ T037 ∥ T038 (after T034)
- Phase 8: T041 ∥ T042

### Parallel Example: Foundational migration

```text
After T008:
  T010 track-rub.ts → unlockAchievement('rub')
  T011 infinite-spin.ts → unlockAchievement('infinite-spin')
  T012 demonic-combo.ts → unlockAchievement('demonic-combo')
```

---

## Implementation Strategy

### MVP First

1. Phase 1 + Phase 2 (eggs unchanged for visitors, copy now in the registry).
2. Phase 3 (US1) → operator checks quickstart #7–#9 with existing unlocks.
3. Phase 4 (US2) → newcomer flow; this completes the P1 scope.

### Incremental Delivery

- P1 (US1 + US2) is the shippable unit; US3 docs ride along in the same change set
  (Constitution VII requires the artist guide in the same change as the new content file).
- US4 and polish follow; T045 folds the spec back after sign-off.

## Notes

- Commit per phase with Conventional Commits (e.g. `feat(achievements): …`, `refactor(achievements): …`, `docs(artist-guide): …`).
- No new packages (operator-workflow rule); `check-secrets.mjs` uses Node built-ins only.
