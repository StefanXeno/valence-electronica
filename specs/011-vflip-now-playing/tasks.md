# Tasks: V-Flip Now Playing

**Input**: Design documents from `/specs/011-vflip-now-playing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Vitest for `playback.ts` dwell classifier + `pickOtherId` per plan.md.
CI: `astro check`, `astro build`, `npm test`. Manual validation in `quickstart.md`.

**Organization**: P1 stories first (US1 name/info → US2 lyrics → US3 mute-in-box →
US5 shuffle → US6 loop). US4 is sync/regression on switch. US7 is stage regression.
Foundational schema/lib/atmosphere shell blocks all stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: User story label (US1–US7)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align implementer with contracts before code changes

- [ ] T001 Review `specs/011-vflip-now-playing/contracts/vflip-player-ui.md` and `specs/011-vflip-now-playing/contracts/vflip-playback.md` against current `src/components/Jukebox.astro`, `src/components/StageDock.astro`, `src/components/StagePanels.astro`, and `src/components/MuteControl.astro`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, chrome, icons, playback helpers, dual-video shell — blocks all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Extend `ui` collection schema in `src/content.config.ts` with `shuffleLabel`, `loopLabel`, `shuffleIcon`, `loopIcon`, `shuffleDefault`, `loopDefault` per `specs/011-vflip-now-playing/data-model.md`
- [ ] T003 [P] Extend `ui` collection schema in `src/content.config.ts` with `unmuteTooltip`, `muteTooltip`, `volumeSliderTooltip` (can land with T002 in one schema edit)
- [ ] T004 Extend `HudIconToken` and `KNOWN` in `src/lib/hud-icons.ts` with `shuffle` and `loop` tokens
- [ ] T005 [P] Add SVG paths for `shuffle` and `loop` tokens in `src/components/HudIcon.astro`
- [ ] T006 Extend `UiChrome` interface and `getChrome()` in `src/lib/stage.ts` for shuffle/loop labels, icons, and boolean defaults (fallback shuffle on / loop off)
- [ ] T007 [P] Add shuffle/loop chrome fields to `src/content/ui/chrome.md` (`shuffleLabel`, `loopLabel`, icons, `shuffleDefault: true`, `loopDefault: false`)
- [ ] T008 Create `src/lib/playback.ts` — `dwellSeconds(entry, videoDurationSec?)`, `pickOtherId(ids, current)`, PlaybackMode state API (get/set shuffle/loop), intro-gated timer start/clear/restart, video `loadedmetadata` hook per `specs/011-vflip-now-playing/contracts/vflip-playback.md`
- [ ] T009 [P] Add `src/lib/playback.test.ts` — dwell: `hasAudio` + known duration → duration; `hasAudio` + no duration → 45; `!hasAudio` → 45; `pickOtherId` never returns current; empty filter stays undefined
- [ ] T010 Pass `hasAudio` through stage catalog JSON in `src/components/Jukebox.astro` / `src/lib/stage-switch.ts` `StageCatalogEntry` type; wire atmosphere video duration into playback on `loadedmetadata`
- [ ] T011 Add incoming video layer (`data-bg-video-next`) to `src/components/BackgroundAtmosphere.astro` and CSS opacity stacking so crossfade can run later (idle layer unloaded/paused)

**Checkpoint**: `npm run check` and `npm test` pass; dual video exists; playback helpers green; chrome fields resolve

---

## Phase 3: User Story 1 - Open V-Flip and see what is playing (Priority: P1) 🎯 MVP

**Goal**: Open V-Flip shows active track name + track info; Track info dock icon is gone

**Independent Test**: quickstart.md Scenario 1 — open V-Flip, see active title and info; right dock has no Track info icon

### Implementation for User Story 1

- [ ] T012 [US1] Widen open jukebox shell CSS in `src/components/Jukebox.astro` to `min(22rem × --hud-scale, …)` and taller scroll body per `specs/011-vflip-now-playing/contracts/vflip-player-ui.md`
- [ ] T013 [US1] Add open-header `[data-now-playing-title]` in `src/components/Jukebox.astro` showing active track `label` (ellipsis); keep vinyl accessible name as `jukeboxLabel`
- [ ] T014 [US1] Mount `TrackInfoPanel` inside open jukebox body in `src/components/Jukebox.astro` (section heading from `trackInfoTitle`); sync still via `[data-track-info-for]`
- [ ] T015 [US1] Remove Track info panel entry from `src/components/StagePanels.astro` right-dock list
- [ ] T016 [US1] Update `syncStageUi` / active-id path in `src/lib/stage-switch.ts` so `[data-now-playing-title]` text updates on stage select
- [ ] T017 [US1] Manually walk quickstart.md Scenario 1 (name + info only; lyrics may still be dock until US2)

**Checkpoint**: MVP — visitor opens V-Flip once and sees what is playing + track info

---

## Phase 4: User Story 2 - Read lyrics inside V-Flip (Priority: P1)

**Goal**: Lyrics for the active track live in V-Flip; Lyrics dock icon removed

**Independent Test**: quickstart.md Scenario 1 lyrics section + dock scan — no Lyrics icon; lyrics follow active entry

### Implementation for User Story 2

- [ ] T018 [US2] Mount `LyricsPanel` inside open jukebox body in `src/components/Jukebox.astro` (section heading from `lyricsTitle`; empty state unchanged)
- [ ] T019 [US2] Remove Lyrics panel entry from `src/components/StagePanels.astro` (right dock: About → Discography → Tour only)
- [ ] T020 [US2] Confirm body scroll order in `src/components/Jukebox.astro`: track info → lyrics → song list; long lyrics scroll inside player only
- [ ] T021 [US2] Manually verify lyrics switch with jukebox options and empty-lyrics message; right dock has no Lyrics icon

**Checkpoint**: Lyrics + info + list are one open player; right dock cleaned

---

## Phase 5: User Story 3 - Mute and volume live in the V-Flip box (Priority: P1)

**Goal**: Collapsed and open V-Flip share one mute/volume control inside the same shell

**Independent Test**: quickstart.md Scenario 2 — unmute expands same box; no sibling mute on dock; button + slider tooltips show

### Implementation for User Story 3

- [ ] T022 [US3] Mount `MuteControl` inside `[data-jukebox]` in `src/components/Jukebox.astro` (collapsed cluster: vinyl + mute; open: header row with mute)
- [ ] T023 [US3] Remove mute slot from `src/components/StageDock.astro` and stop passing mute sibling from `src/pages/index.astro`
- [ ] T024 [US3] Adjust `src/components/MuteControl.astro` styles so muted/unmuted pill expands the **shared** jukebox shell (no second border circle; vinyl anchor does not jump)
- [ ] T024a [US3] Add mute-button + volume-slider tooltips in `src/components/MuteControl.astro` via HUD label-reveal (`data-hud-label` / `data-hud-label-anchor="above"`); button label swaps mute/unmute from chrome; slider uses `volumeSliderTooltip`
- [ ] T024b [P] [US3] Extend `src/content.config.ts`, `src/lib/stage.ts`, and `src/content/ui/chrome.md` with `unmuteTooltip`, `muteTooltip`, `volumeSliderTooltip` (defaults: Unmute / Mute / Drag to adjust volume)
- [ ] T025 [US3] Update `src/styles/intro.css` if needed so intro still hides mute-inside-dock (stage-dock rules cover jukebox shell)
- [ ] T026 [US3] Manually walk quickstart.md Scenario 2 (including tooltip checks); confirm mute hide rules (no audio / fallback / reduced motion) still apply

**Checkpoint**: One V-Flip box owns vinyl + mute/volume

---

## Phase 6: User Story 5 - Visitor turns shuffle on or off (Priority: P1)

**Goal**: Shuffle toggle; when on and loop off, hop to different random entry with smooth crossfade

**Independent Test**: quickstart.md Scenarios 3, 5, 7 — shuffle off = no hop; shuffle on + short mp4 file = smooth hop; intro gates clock

### Implementation for User Story 5

- [ ] T027 [US5] Add shuffle transport button in open `src/components/Jukebox.astro` (`aria-pressed`, chrome `shuffleLabel`/`shuffleIcon`, `glitch-hit` as appropriate)
- [ ] T028 [US5] Wire shuffle toggle to `src/lib/playback.ts` from jukebox boot; initialize from `shuffleDefault`; clear/restart timer on toggle
- [ ] T029 [US5] Implement intro-gated advance timer in `src/lib/playback.ts` / `src/lib/stage-switch.ts` — no fire while `data-intro-pending` or `data-intro-active`; start after clear when shuffle && !loop
- [ ] T030 [US5] Implement hop path in `src/lib/stage-switch.ts` — on timer fire call `pickOtherId`, then crossfade `applyStageEntry` (700ms dual-video + `data-stage-crossfade` theme token transition per playback contract)
- [ ] T031 [US5] Add `html[data-stage-crossfade]` color/surface/border transitions in `src/styles/themes.css` (or `global.css`); reduced-motion = instant swap
- [ ] T032 [US5] Ensure hop preserves mute/volume and never auto-unmutes; restart clock after hop when shuffle still on
- [ ] T033 [US5] Manually walk quickstart.md Scenarios 3, 5, and 7 (hop timing follows active mp4 file length; note duration in devtools if needed)

**Checkpoint**: Shuffle is optional radio; hops are smooth and intro-safe

---

## Phase 7: User Story 6 - Visitor loops the current track (Priority: P1)

**Goal**: Loop toggle pins current track; loop wins over shuffle

**Independent Test**: quickstart.md Scenario 4 — loop on = no hop even if shuffle on; manual pick keeps loop on

### Implementation for User Story 6

- [ ] T034 [US6] Add loop transport button in open `src/components/Jukebox.astro` (`aria-pressed`, chrome `loopLabel`/`loopIcon`)
- [ ] T035 [US6] Wire loop toggle to `src/lib/playback.ts`; on → clear timer; off + shuffle on → restart clock; do **not** flip HTML `video.loop` attribute
- [ ] T036 [US6] Confirm manual pick / discography stage button resets advance clock but does **not** reset shuffle/loop flags in `src/lib/stage-switch.ts`
- [ ] T037 [US6] Manually walk quickstart.md Scenario 4 (and Scenario 6 toggles-survive-pick)

**Checkpoint**: Loop pins track; shuffle only hops when loop is off

---

## Phase 8: User Story 4 - Switching songs updates the player (Priority: P2)

**Goal**: Manual pick updates name, info, lyrics, theme, mute visibility without reload; unmute survives

**Independent Test**: quickstart.md Scenario 6 + switch regression — all in-player surfaces follow new id

### Implementation for User Story 4

- [ ] T038 [US4] Use the same crossfade handoff for manual jukebox/discography picks that change id in `src/lib/stage-switch.ts` (not hard cut)
- [ ] T039 [US4] Verify `syncStageUi` updates title, `[data-lyrics-for]`, `[data-track-info-for]`, list `aria-pressed`, mute visibility on every select/hop
- [ ] T040 [US4] Manually confirm unmute preference survives audio→audio switch and mute hides on no-audio target; reload restores scheduled/static default + chrome shuffle/loop defaults

**Checkpoint**: One player, no stale panels after switch

---

## Phase 9: User Story 7 - Rest of the stage stays as it is (Priority: P3)

**Goal**: About, Discography, Tour, socials, legal, intro, panel exclusive-open unchanged, center-free rest

**Independent Test**: quickstart.md Scenarios 9 and 11

### Implementation for User Story 7

- [ ] T041 [US7] Confirm on-demand panel exclusive-open among About/Discography/Tour is unchanged; V-Flip **may stay open** while a panel is open (owner Q3:C — no new mutual-close rule)
- [ ] T042 [US7] Keyboard pass per UI contract — vinyl → mute → shuffle → loop → links → list → right dock → footer
- [ ] T043 [US7] Manually walk quickstart.md Scenario 11 (regression) and Scenario 9 (keyboard); fix any dock/footer overlap from wider open player

**Checkpoint**: V-Flip change did not trash the rest of the stage

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Docs, contract amendments, full validation

- [ ] T044 [P] Update `docs/artist-guide.md` — lyrics/track info live in V-Flip; shuffle/loop controls; shuffle timing follows stage video file length (45s no-audio); chrome keys; Track info is not a separate HUD button
- [ ] T045 [P] Amend `specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md` — left cluster is jukebox shell containing mute; point to `011` player UI contract
- [ ] T046 [P] Amend `specs/010-track-catalog/contracts/track-catalog-ui.md` — Track info / now-playing placement superseded by in-V-Flip display on desktop
- [ ] T047 Run `npm run check`, `npm run build`, and `npm test`; fix regressions
- [ ] T048 Manually complete remaining `specs/011-vflip-now-playing/quickstart.md` scenarios (8 reduced motion, 10 content-only labels, 12–13 docs/build)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 → US2 → US3**: Sequential shell/content composition (same `Jukebox.astro`)
- **US5 → US6**: Shuffle before loop (loop gates shuffle timer)
- **US4**: After US1–US3 (and ideally after US5 crossfade) so sync + handoff are real
- **US7**: After player stories
- **Polish**: After desired stories complete

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 | Phase 2 | MVP — name + info in open V-Flip |
| US2 | US1 | Same open body; remove Lyrics icon |
| US3 | Phase 2 (can follow US1 shell) | Mute into shared box |
| US5 | US3 recommended | Transport + timer + crossfade |
| US6 | US5 | Loop clears/restarts same timer |
| US4 | US1–US3 (+ US5 handoff) | Switch sync + crossfade picks |
| US7 | US1–US6 | Regression |

### Parallel Opportunities

- T003 / T004–T007 chrome+icons while T002 schema lands
- T005 + T007 + T009 after T004/T008 interfaces exist
- T044 / T045 / T046 docs in parallel during polish

### Parallel Example: Foundational icons + chrome

```bash
# After T002 schema stub exists:
Task: "Add SVG paths for shuffle and loop in src/components/HudIcon.astro"
Task: "Add shuffle/loop fields to src/content/ui/chrome.md"
Task: "Add src/lib/playback.test.ts for dwell + pickOtherId"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 (foundation)
2. Phase 3 US1 — open player with name + track info; Track info icon gone
3. **STOP** — validate Scenario 1
4. Then US2 (lyrics) → US3 (mute-in-box) for a complete static player before playback modes

### Incremental Delivery

1. Foundation → US1 (MVP now-playing) → US2 (lyrics) → US3 (mute box)
2. US5 (shuffle) → US6 (loop) → US4 (switch polish) → US7 (regression)
3. Polish: artist guide + `009`/`010` contract pointers + full quickstart

### Suggested MVP Scope

**US1 only**: visitor opens V-Flip and sees active track name + track info; Track info
removed from right dock. (Mute may still be a dock sibling until US3.)

---

## Notes

- Do **not** set `video.loop = false` when visitor loop is off (research R6)
- Do **not** use `video.ended` for dwell on current short loop assets
- Visit-only shuffle/loop — no `localStorage`
- Shuffle hop timing for audio tracks follows **mp4 file duration** until full-length stage videos ship
- Commit after each phase or logical group; Conventional Commits
- Mobile HUD polish remains IDEA-013 — only ensure 320px still loads
