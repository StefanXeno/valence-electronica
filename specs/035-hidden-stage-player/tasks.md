# Tasks: Hidden Stage Player with Song Selection

**Input**: Design documents from `specs/035-hidden-stage-player/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/stage-player-ui.md, quickstart.md

**Tests**: Unit tests for the new pure modules are included (plan R10; project convention:
colocated `*.test.ts`). Browser checks are operator-run via `quickstart.md`.

**Organization**: Grouped by user story. Story order follows dependencies: US2/US3 (core
player, MVP) → US1 (discovery) → US5 (keyboard) → US4 (discography).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label from spec.md

---

## Phase 1: Setup

**Purpose**: Content fields and small shared modules every story uses.

- [x] T001 Add optional chrome fields `playerShowLabel`, `playerOpenLabel`, `playerCloseLabel`, `playerAchievementTitle`, `playerAchievementSub` to the `ui` schema in `src/content.config.ts` and fallbacks in `getChrome()` in `src/lib/stage.ts`
- [x] T002 Add the five new strings (defaults from data-model.md) to `src/content/ui/chrome.md`
- [x] T003 [P] Create `src/lib/viewport.ts` exporting `PHONE_MQ = '(max-width: 1023px)'` and `prefersReducedMotion()`

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: Pure logic and shared gesture filtering. No UI yet.

- [x] T004 [P] Implement pure reducer `src/lib/player-state.ts` (states `hidden|hint|minimal|full`, events and transitions exactly as the table in data-model.md; returns next state + side-effect flags `{ markDiscovered, startHintTimer, extendHintTimer, focusVinyl }`)
- [x] T005 [P] Unit tests for every transition and no-op in `src/lib/player-state.test.ts`
- [x] T006 [P] Implement pure tap counter `src/lib/tap-hint.ts` (`createTapHint({ windowMs: 1500, taps: 3, slopPx: 10 })` with `down(x,y,t)`, `up(x,y,t) → boolean`, `reset()`)
- [x] T007 [P] Unit tests (3 taps in window → true; slow taps; moved pointer; reset after success) in `src/lib/tap-hint.test.ts`
- [x] T008 [P] Implement `src/lib/player-discovery.ts` (`isPlayerDiscovered()` → false when storage throws; `markPlayerDiscovered()` swallow errors; key `ve-player-discovered`)
- [x] T009 [P] Unit tests with a stubbed/throwing `localStorage` in `src/lib/player-discovery.test.ts`
- [x] T010 [P] Create `src/lib/gesture-ignore.ts` (base selector per contracts/stage-player-ui.md + `isGestureIgnored(target, extra?)`) and tests in `src/lib/gesture-ignore.test.ts` (selector string composition only)
- [x] T011 Switch `src/lib/track-rub.ts` and `src/lib/infinite-spin.ts` to `gesture-ignore.ts` (keep their module-specific extras); replace the duplicated `prefersReducedMotion` in `src/lib/achievement-toast.ts` with the one from `viewport.ts`

**Checkpoint**: `npm test` green with new suites.

---

## Phase 3: User Story 2 + 3 — Full player with song selection, minimal vinyl (Priority: P1) 🎯 MVP

**Goal**: One player for phone and laptop with `minimal` (vinyl) and `full` (title, stage
song list, shuffle, play/pause, mute, close). Old player stack removed.

**Independent Test**: quickstart Scenarios 4, 5, 7 (temporarily booting in `minimal`).

- [x] T012 [US2] Create `src/components/StagePlayer.astro`: root per contract (`data-stage-player`, `data-player-state`, catalog/schedule/fallback/shuffle/loop data attributes copied from `Jukebox.astro`), vinyl button (`HudIcon token="jukebox"`, `aria-label` = `playerOpenLabel`), panel region with now-playing title, song list from `getBackgroundConfig().videos` (cover → poster fallback, newest first then label, `button[data-jukebox-option]`, EQ marker), shuffle, play/pause, `MuteControl inJukebox` in `[data-jukebox-mute-slot]`, close button; scoped CSS driven only by `[data-player-state]` (bottom-left; laptop panel ~20rem; phone bottom panel with insets, max-height 60vh, scrolling list); vinyl spin while playing (not paused / reduced motion)
- [x] T013 [US2] Create `src/lib/stage-player.ts`: boot `initStageSwitch` from root data (port the JSON-parse + defaults logic from `Jukebox.astro` script), `syncNowPlayingLabel` (moved from `player-dock.ts`), background play/pause toggle (`initBgVideoToggle` moved from `player-dock.ts`), `initEqFlatten`, state wiring through `player-state.ts` (vinyl → full; close button / Escape / outside pointerdown → minimal + focus vinyl; emit `player-state-change`); temporary boot state `minimal`
- [x] T014 [US2] Update imports: `src/lib/stage-switch.ts` (`syncNowPlayingLabel` from `stage-player.ts`), `src/lib/label-reveal.ts` and `src/components/MuteControl.astro` (`PHONE_MQ` from `viewport.ts`)
- [x] T015 [US2] Mount `StagePlayer` instead of `Jukebox` in `src/pages/index.astro` (inside `StageDock`) and `src/pages/[slug].astro`; simplify `src/components/StageDock.astro` to a plain bottom-left wrapper
- [x] T016 [US2] Delete `src/components/Jukebox.astro`, `src/components/TrackInfoPanel.astro`, `src/lib/player-dock.ts`, `src/lib/player-sheet.ts`, `src/lib/player-sheet.test.ts`, `src/lib/playlist-window.ts`, `src/lib/playlist-window.test.ts`, `src/lib/player-handle-tap.ts`, `src/lib/player-handle-tap.test.ts`
- [x] T017 [US2] Remove phone player/dock rules (`.stage-dock` hide, `data-player-dock-*`, `--phone-player-*` dock geometry) from `src/styles/global.css`; keep `.stage__socials` phone hide
- [x] T018 [US2] Drop the `themeTracksOnly` branch from `src/components/Discography.astro` and remove `getThemeTrackDiscography` / `filterThemeTracks` / `isThemeTrack` from `src/lib/catalog-tracks.ts` if no callers remain (update `catalog-tracks.test.ts` accordingly)
- [x] T019 [US3] Update glitch wiring: add `glitch-hit` to vinyl, song buttons, close; update selector lists in `src/components/GlitchPress.astro` (`[data-player-vinyl]`, `[data-player-close]`) and remove `[data-stage-panel]`/`[data-loop-toggle]` references that no longer exist
- [x] T020 [US2] Run `npm run check && npm test && npm run build`; fix all type errors and dangling references (`git grep -n "player-dock\|data-jukebox-drawer\|is-theme-tracks"`)

**Checkpoint**: MVP usable — vinyl opens the player, songs can be picked, sound works on phone and laptop. **Operator browser review #1** (quickstart 4, 5, 7, 12).

---

## Phase 4: User Story 1 — Discovery: hidden → hint → full (Priority: P1)

**Goal**: Clean stage on first visit; 3 taps peek the vinyl; tap on it reveals; remembered
per browser; one-time achievement.

**Independent Test**: quickstart Scenarios 1, 2, 3, 6, 11.

- [ ] T021 [US1] Boot state from `isPlayerDiscovered()` in `src/lib/stage-player.ts` (`minimal` if true, else `hidden`); remove the temporary `minimal` boot
- [ ] T022 [US1] Tap listener in `src/lib/stage-player.ts`: document `pointerdown`/`pointerup` → `tap-hint.ts`; skip when `isGestureIgnored`, intro active (`isIntroActive()`), legal overlay or nav menu open, rub/spin session active; on success dispatch `TAP_HINT`; manage 4 s hint timer (`HINT_TIMEOUT`, single extension)
- [ ] T023 [US1] Hint visuals in `src/components/StagePlayer.astro`: `[data-player-state="hint"]` vinyl half below the bottom edge with a nudge keyframe; slide-away on return to hidden; `touch-action: manipulation` on the stage area to avoid double-tap zoom
- [ ] T024 [US1] On first `full` from hint: `markPlayerDiscovered()` and `maybeUnlockAchievement({ storageKey: 've-achievement-player-found', title: playerAchievementTitle, sub: playerAchievementSub, glyph: 'rub' })` with copy read from root data attributes in `src/lib/stage-player.ts` (add `data-achievement-title`/`-sub` in `StagePlayer.astro`)
- [ ] T025 [US1] Collapse `full` → `minimal` when a legal/content overlay or the phone menu opens (`OVERLAY_OPENED`; observe `#legal-overlay` panels and `[data-site-nav-menu]` hidden state) in `src/lib/stage-player.ts`

**Checkpoint**: **Operator browser review #2** (quickstart 1, 2, 3, 6, 11).

---

## Phase 5: User Story 5 — Keyboard and assistive tech (Priority: P2)

**Goal**: Player reachable without gestures.

**Independent Test**: quickstart Scenario 9.

- [ ] T026 [US5] Add `[data-player-reveal]` button (label `playerShowLabel`) to `src/components/StagePlayer.astro`, visually hidden until `:focus-visible`, rendered/active only in `hidden` state; dispatch `KEYBOARD_REVEAL` (also marks discovered + achievement) in `src/lib/stage-player.ts`
- [ ] T027 [US5] Focus management in `src/lib/stage-player.ts`: on `full` focus the current song button; on close focus the vinyl; `aria-expanded` on vinyl reflects `full`; Escape only acts when focus/pointer context is the player or no overlay is open

---

## Phase 6: User Story 4 — Discography play buttons (Priority: P2)

**Goal**: Play only for stage songs; play closes overlay (laptop) / menu (phone).

**Independent Test**: quickstart Scenario 8.

- [ ] T028 [P] [US4] `src/components/DiscographyTrackRow.astro`: render play only when `release.jukeboxId` (card and nested variants) as `button.discog__play[data-stage-button={jukeboxId}]` plus `[data-discog-playing={jukeboxId}]` EQ marker; remove `data-discog-play`
- [ ] T029 [P] [US4] `src/components/DiscographyCollectionCard.astro`: remove the collection-level play slot
- [ ] T030 [P] [US4] `src/components/SiteNav.astro` discography portal: add the same stage-only play button + EQ marker for singles and nested rows; reuse `.discog__play` styling or a small portal variant
- [ ] T031 [US4] Emit `stage-overlay-close` from `src/lib/stage-player.ts` when a `[data-stage-button]` click originates inside `#legal-overlay` or `[data-site-nav-menu]`; listen in `src/components/LegalOverlay.astro` (`closePanel({ historyMode: 'push' })`) and in `src/components/SiteNav.astro` (`setMenuOpen(false)`)
- [ ] T032 [US4] Update `src/components/Discography.astro` click handler and the ignore extras in `src/lib/track-rub.ts` / `src/lib/infinite-spin.ts` for the removed `data-discog-play`

---

## Phase 7: Polish & Cross-Cutting

- [ ] T033 [P] Reduced-motion pass in `src/components/StagePlayer.astro` (no peek slide, nudge, spin, panel animation) — quickstart 10
- [ ] T034 [P] Remove now-unused chrome lines from `src/content/ui/chrome.md` (list in data-model.md; keep schema fields optional) and unused exports in `src/lib/panel-motion.ts`
- [ ] T035 [P] Rewrite flows in `scripts/verify-hud.mjs` for the new states (`fresh-hidden`, `tap-hint`, `hint-reveal`, `pick-song`, `close-minimal`, `keyboard-reveal`, `discog-play-close`) at 390 and 1280 — operator runs it
- [ ] T036 [P] Artist guide: short "Hidden player" paragraph + new chrome fields; remove V-Flip/Track info wording in `docs/artist-guide.md`
- [ ] T037 Fold behavior back into living specs: update `specs/026-stage-player/spec.md` (+ plan source map), `specs/028-music-catalog/spec.md` (FR-008, Known Gaps), `specs/032-easter-eggs/spec.md` (player achievement); update `specs/README.md`; then delete `specs/035-hidden-stage-player/`
- [ ] T038 Final `npm run check && npm test && npm run build`; operator completes `quickstart.md` 1–12

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → Phase 3 (MVP)** are sequential.
- **Phase 4 (US1)** depends on Phase 3 (needs the player).
- **Phase 5 (US5)** depends on Phase 4 (needs the `hidden` state).
- **Phase 6 (US4)** depends only on Phase 3 (T031 needs `stage-player.ts`); can run in
  parallel with Phases 4–5.
- **Phase 7** after all stories; T037 last before T038.

### Parallel opportunities

- Phase 2: T004–T010 are independent files (pairs: T004/T005, T006/T007, T008/T009, T010).
- Phase 6: T028, T029, T030 in parallel; T031/T032 after.
- Phase 7: T033–T036 in parallel.

## Implementation Strategy

1. **MVP** = Phases 1–3: the song-selection gap from `026` is closed (vinyl visible as
   minimal state). Operator review #1.
2. Add discovery (Phase 4) → review #2. This is the "clean stage" the artist asked for.
3. Keyboard path (Phase 5) and discography play (Phase 6).
4. Polish, docs, spec fold-back (Phase 7).
