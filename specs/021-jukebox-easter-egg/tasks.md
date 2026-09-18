# Tasks: Jukebox Easter Egg & Song-Select First

**Input**: Design documents from `/specs/021-jukebox-easter-egg/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: None requested in spec. CI: `astro check`, `astro build`. Manual
[quickstart.md](./quickstart.md).

**Organization**: User stories US1–US3 from spec.md. Prefer `020` chrome
landed first. No new npm packages. Shuffle **look** / dual video / tap-vs-swipe
owned by `022`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable
- **[Story]**: US1–US3 from spec.md

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Review `specs/021-jukebox-easter-egg/contracts/jukebox-selection-first-ui.md` and `research.md` against `src/components/Jukebox.astro`, `src/components/Discography.astro`, `src/components/TrackInfoPanel.astro`, `src/lib/player-dock.ts`, `src/lib/stage-switch.ts`, and supersession notes vs `015`/`018`/`019`/`011`

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Blocks all user stories

- [x] T002 Add chrome fields `songsTitle`, `nowPlayingOpenLabel`, and `vinylLabel` in `src/content.config.ts` + `src/content/ui/chrome.md` per locked `data-model.md` (do not dual-option retarget `jukeboxPanelTitle` / `playlistLabel` as primary names)
- [x] T003 [P] Update `getChrome()` / fallbacks in `src/lib/stage.ts` for `songsTitle`, `nowPlayingOpenLabel`, `vinylLabel` (fallback `jukeboxLabel` → vinyl only if `vinylLabel` unset)
- [x] T004 Document visit-only surface defaults (`selectionVisible=true`, `nowPlayingVisible=false`, `vflipEasterEggOpen=false`) as comments or helpers near `src/lib/player-dock.ts` / Jukebox boot — no persistence
- [x] T005 [P] Confirm `src/lib/stage-switch.ts` track selection path does not hardcode single-video UX assumptions that would block `022` (opaque `sources` / future resolver)

**Checkpoint**: `npm run check` passes; chrome resolves; no dual-video hardcoding introduced

---

## Phase 3: User Story 1 - Casual listener switches songs with minimal effort (Priority: P1) 🎯 MVP

**Goal**: Default player surface is song selection on laptop and phone; one primary action to change tracks without V-Flip

**Independent Test**: quickstart Scenario 1 — selection-first rest; ≤2 activations; casual path without vinyl

### Implementation for User Story 1

- [x] T006 [US1] Boot / CSS-first rest in `src/components/Jukebox.astro` so desktop (≥1024px) default body shows theme-track **selection** (not solo Currently playing card)
- [x] T007 [US1] Change phone useful-open default in `src/lib/player-dock.ts` + `src/components/Jukebox.astro` so expanded/open body lands on **selection**, not solo Currently playing
- [x] T008 [US1] Invert or retarget playlist/`is-theme-tracks` semantics so visitors are not forced through currently-playing-first → playlist to change songs
- [x] T009 [US1] Ensure selecting another catalog track from the visible list activates it without an extra obligatory “open playlist” step (`src/lib/stage-switch.ts` + Discography cards in `src/components/Discography.astro`)
- [x] T010 [US1] Update default headers to selection-oriented chrome strings (not `currentlyPlayingLabel` as rest title) in `src/components/Jukebox.astro`
- [ ] T011 [US1] Manually walk `specs/021-jukebox-easter-egg/quickstart.md` Scenario 1 (390 + 1280)

**Checkpoint**: Selection-first MVP on phone and laptop

---

## Phase 4: User Story 2 - V-Flip opens from a discoverable vinyl (Priority: P1)

**Goal**: Quiet vinyl click/tap opens V-Flip easter egg; not required for song changes; not in top nav

**Independent Test**: quickstart Scenario 2

### Implementation for User Story 2

- [x] T012 [US2] Unhide and/or relocate the vinyl control as a quiet brand object in `src/components/Jukebox.astro` + `src/styles/global.css` (not a labeled primary CTA; not covered by `020` top nav)
- [x] T013 [US2] Wire vinyl **click/tap** to open the V-Flip easter egg — **must** enable `.jukebox__section--list` / `TrackInfoPanel.astro` drawer (locked DOM target; not optional alternate) in `src/components/Jukebox.astro`
- [x] T014 [US2] Ensure song selection remains usable without ever activating vinyl; easter egg does not trap the visitor (close path back to selection)
- [x] T015 [P] [US2] Verify no “V-Flip” item is added to `020` SiteNav / top menu (guard in review of `src/components/SiteNav.astro` if present)
- [x] T016 [US2] Forbidden discovery check: no unmarked-corner-only, konami, or long-press-only path required in `src/components/Jukebox.astro` / `player-dock.ts`
- [ ] T017 [US2] Manually walk `specs/021-jukebox-easter-egg/quickstart.md` Scenario 2

**Checkpoint**: Vinyl easter egg discoverable; casual path intact

---

## Phase 5: User Story 3 - Now-playing remains available without being default (Priority: P2)

**Goal**: Opt-in now-playing detail; default remains selection after close/reload

**Independent Test**: quickstart Scenario 3

### Implementation for User Story 3

- [ ] T018 [US3] Add/use control to open NowPlayingSurface from selection in `src/components/Jukebox.astro` labeled with chrome `nowPlayingOpenLabel`
- [ ] T019 [US3] Show active track identity in the optional now-playing view without making it the boot default
- [ ] T020 [US3] On close now-playing or full reload, restore selection as default surface in `src/components/Jukebox.astro` + `src/lib/player-dock.ts`
- [ ] T021 [US3] Manually walk `specs/021-jukebox-easter-egg/quickstart.md` Scenario 3 (+ Scenario 4 edge smoke)

**Checkpoint**: Optional now-playing works; selection remains home

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T022 [P] Update `docs/artist-guide.md` for any new/retargeted player chrome fields (constitution VII)
- [ ] T023 [P] Add supersession callouts on default-surface authority in `specs/015-mobile-stage-hud/contracts/mobile-hud-ui.md` and `specs/019-desktop-chrome-polish/contracts/desktop-chrome-polish.md` pointing to `021`
- [ ] T024 Preserve shuffle/mute/hop meanings while leaving shuffle **glyph** changes to `022` (smoke in `src/components/Jukebox.astro`)
- [ ] T025 Run `npm run check` and `npm run build`; confirm reduced-motion still allows selection + vinyl open
- [ ] T026 Confirm FR-010: no circular side docks reintroduced while changing player chrome

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational → US1 (MVP) → US2 → US3 → Polish
- **External (ordered dependency)**: Complete `020` before US2 vinyl
  placement / overlap QA (T012–T017). US1 selection-first may proceed
  without SiteNav if needed, but vinyl QA waits on `020`.

### User Story Dependencies

- **US1**: Foundation only — MVP
- **US2**: After US1 (selection must work without vinyl); vinyl QA after `020`
- **US3**: After US1 (needs selection home to return to)

### Parallel Opportunities

- T002 schema work ∥ T005 opacity review after T001
- T015 ∥ T012–T014 review
- T022 ∥ T023 in Polish

## Parallel Example: User Story 1

```bash
Task: "Desktop selection-first rest CSS/boot in Jukebox.astro"
Task: "Phone open → selection in player-dock.ts"
```

## Implementation Strategy

### MVP First

1. Phases 1–2
2. US1 only → validate quickstart Scenario 1
3. Then vinyl (US2), then optional now-playing (US3)

### Incremental vs siblings

1. `020` chrome
2. **021** (this) selection + vinyl
3. `022` shuffle look, tap-first, dual videos, track polish

## Locked decisions (analyze caveats)

| Topic | Decision |
| ----- | -------- |
| Easter-egg DOM | Vinyl click/tap → `.jukebox__section--list` / TrackInfoPanel |
| Chrome fields | `songsTitle`, `nowPlayingOpenLabel`, `vinylLabel` |
| Vinyl QA vs 020 | Ordered dependency — QA after 020; not ambiguity |

## Notes

- No new npm packages
- Do not implement dual-video schema here — only avoid blocking it
- Do not put V-Flip in top nav

## Implement session notes (2026-09-18)

- Foundation + selection-first boot (desktop `is-theme-tracks`, phone expand → selection).
- Vinyl unhidden; click opens `.jukebox__section--list` / TrackInfoPanel (locked).
- Chrome: `songsTitle`, `nowPlayingOpenLabel`, `vinylLabel`.
- **Remaining:** T011/T017/T021 manual QA; US3 polish (T018–T020); T022–T026 polish.
- Operator must verify vinyl placement vs 020 top nav visually.
