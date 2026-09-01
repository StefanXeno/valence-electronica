# Tasks: Mobile Stage HUD

**Input**: Design documents from `/specs/015-mobile-stage-hud/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: None requested in spec. CI: `astro check`, `astro build`. Manual
validation in `quickstart.md` (320 / 390 / 1023 / 1024).

**Organization**: User stories US1–US5 from spec.md. No new npm packages.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: US1–US5 from spec.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align implementer with the phone HUD contract before CSS/JS

- [ ] T001 Review `specs/015-mobile-stage-hud/contracts/mobile-hud-ui.md` and `specs/015-mobile-stage-hud/research.md` against current `src/pages/index.astro`, `src/components/StageDock.astro`, `src/components/Jukebox.astro`, `src/components/StagePanels.astro`, `src/components/Channels.astro`, `src/components/Footer.astro`, and `src/styles/global.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Chrome fields, breakpoint token, player-dock module shell — blocks all stories

**⚠️ CRITICAL**: No user story work until this phase is complete

- [ ] T002 Extend `ui` collection schema in `src/content.config.ts` with `playerExpandLabel`, `playerCollapseLabel`, and `socialsIcon` per `specs/015-mobile-stage-hud/data-model.md`
- [ ] T003 [P] Add `playerExpandLabel`, `playerCollapseLabel`, and optional `socialsIcon` to `src/content/ui/chrome.md` (defaults: Show player controls / Hide player controls)
- [ ] T004 Extend `UiChrome` and `getChrome()` in `src/lib/stage.ts` with handle labels and `socialsIcon` fallbacks
- [ ] T005 Add `@media (max-width: 1023px)` in `src/styles/global.css`: set `--hud-scale: 1`, keep overflow-x clip, leave a documented phone stage-grid hook (`.stage` / dock bottom stack) without finishing visual chrome
- [ ] T006 Create `src/lib/player-dock.ts` with `PHONE_MQ = '(max-width: 1023px)'`, `prefersReducedMotion()`, and empty `initPlayerDock()` export (no swipe yet)

**Checkpoint**: `npm run check` passes; chrome fields resolve; 1023px uses `--hud-scale: 1`

---

## Phase 3: User Story 1 - The phone stage feels open and clean (Priority: P1) 🎯 MVP

**Goal**: Below 1024px the landing is a bottom-stacked HUD: player dock, content dock above it, identity on top, no permanent socials row, no horizontal scroll

**Independent Test**: quickstart.md Scenario 1 **US1 checkpoint** at ~390×844 and 320px — free center, two stacked docks, no top socials bar, no sideways scroll. Player may still look like today’s jukebox until US2. At 1024px laptop HUD still present.

### Implementation for User Story 1

- [ ] T007 [US1] Refactor phone layout in `src/components/StageDock.astro` so below 1024px the left (jukebox) cluster sits at the bottom and the right (panels) cluster sits immediately above it as a horizontal stack, not laptop left/right rails
- [ ] T008 [US1] At `max-width: 1023px`, hide the **laptop top-right placement** of the existing `.stage__socials` wrapper in `src/styles/global.css`. Do **not** add a second `<Channels />`. One channel list lives in `src/pages/index.astro`; US4 CSS-moves that same node into the tray.
- [ ] T009 [US1] Offset `src/components/Footer.astro` above the phone dock stack (`bottom` + `env(safe-area-inset-bottom)`) so copyright and legal links are not covered
- [ ] T010 [P] [US1] Compact identity on phone in `src/components/Hero.astro` (stay top; do not move into docks)
- [ ] T011 [US1] Adjust `.stage` grid / inset variables in `src/styles/global.css` so 320px has no horizontal page scroll and dock controls stay on-screen
- [ ] T012 [US1] Manually walk `specs/015-mobile-stage-hud/quickstart.md` Scenario 1 US1 checkpoint (390 and 320): stacked docks, no top socials, no sideways scroll. Confirm 1024px still shows `009`/`011` corner HUD. Do **not** fail this task if the player still looks like today’s jukebox.

**Checkpoint**: Phone composition exists; laptop ≥1024px unchanged in placement

---

## Phase 4: User Story 2 - Player dock expand / collapse / now-playing (Priority: P1)

**Goal**: Collapsed pill = handle (up) + soundwave + track label + mute toggle (no slider). Expanded = pill moves up, handle down, V-Flip / shuffle / loop visible. Swipe + handle; 3×/60s nod; no-JS transport visible

**Independent Test**: quickstart.md Scenarios 2–4 (handle/swipe, mute no slider, hint, vinyl opens a **player-dock sheet**)

### Implementation for User Story 2

- [ ] T013 [US2] Restructure markup in `src/components/Jukebox.astro`: handle button (not wrapping mute), `.player-dock__now-playing` (soundwave + `[data-now-playing]` + mute slot), `.player-dock__transport` (vinyl, shuffle, loop). Mute MUST NOT sit inside the handle
- [ ] T014 [US2] Add collapsed/expanded CSS for the player pill in `src/components/Jukebox.astro` (or phone block in `src/styles/global.css`): arrow up/down in a fixed top slot with hit target ≥ **44×24px**; pill translates up when expanded; transport hidden when collapsed **only if** `html[data-player-dock-js]` is set so no-JS stays expanded
- [ ] T015 [US2] Implement five-bar soundwave in `src/components/Jukebox.astro` (`aria-hidden`); CSS animation off under `prefers-reduced-motion`
- [ ] T016 [US2] Hide volume slider and unmute-expand-shell below 1024px in `src/components/MuteControl.astro`; keep laptop slider ≥1024px; keep `011` mute eligibility
- [ ] T017 [US2] Implement handle toggle + `aria-expanded` + chrome `playerExpandLabel` / `playerCollapseLabel` in `src/lib/player-dock.ts`; set collapsed default
- [ ] T018 [US2] Add swipe-up expand / swipe-down collapse on the player dock shell in `src/lib/player-dock.ts` (threshold ~40px; ignore when `!matchMedia(PHONE_MQ)`; do not toggle on mute clicks)
- [ ] T019 [US2] Add handle idle hint in `src/lib/player-dock.ts`: after intro gone, while collapsed, phone MQ, motion allowed — 3 nods, repeat every 60s; stop on expand / reduced motion / ≥1024px
- [ ] T020 [US2] Sync now-playing center text from active jukebox `label` in `src/lib/player-dock.ts` / `src/lib/stage-switch.ts` (never show `themeId`; ellipsis + accessible full name)
- [ ] T021 [US2] Boot `initPlayerDock()` from `src/components/Jukebox.astro` script (or `src/pages/index.astro`) after existing jukebox boot; set `html[data-player-dock-js]`
- [ ] T044 [US2] Restyle the open V-Flip list (`[data-jukebox]` drawer) below 1024px in `src/components/Jukebox.astro` as a dock-anchored sheet (full width minus insets, ~50svh max, internal scroll; player dock stays visible). Do **not** reuse the laptop side-panel composition as-is.
- [ ] T022 [US2] Manually walk `specs/015-mobile-stage-hud/quickstart.md` Scenarios 2, 3, and 4 (hint ±5s; reduced-motion = 0 nods; vinyl list is a player-dock sheet)

**Checkpoint**: Player pill matches collapsed/expanded contract; playback toggles still `011`

---

## Phase 5: User Story 3 - Content dock boxed cluster + sheets (Priority: P1)

**Goal**: About / Discography / Tour / socials trigger in one box; About/Discography/Tour open as sheets from that dock

**Independent Test**: quickstart.md Scenario 5 steps 1–2 (sheet from content dock; empty About hide rule)

### Implementation for User Story 3

- [ ] T023 [US3] Add `socials` to `HudIconToken` / `KNOWN` in `src/lib/hud-icons.ts`
- [ ] T024 [P] [US3] Add connected-nodes / share SVG for token `socials` in `src/components/HudIcon.astro` (not a chevron)
- [ ] T025 [US3] Box the on-demand triggers in `src/components/StagePanels.astro` (one pill/box, matching circular buttons including a socials trigger using `socialsLabel` / `socialsIcon`)
- [ ] T026 [US3] Restyle open About / Discography / Tour bodies below 1024px in `src/components/StagePanels.astro` as dock-anchored sheets (full width minus insets, ~50svh max, internal scroll; docks stay visible)
- [ ] T027 [US3] Confirm missing About still hides that control in `src/components/StagePanels.astro`; remaining buttons stay boxed
- [ ] T028 [US3] Manually open About, Discography, and Tour at 390px per `specs/015-mobile-stage-hud/quickstart.md` Scenario 5 (sheet from content dock, not laptop side panel)

**Checkpoint**: Content dock looks like the mockup cluster; panels are sheets

---

## Phase 6: User Story 4 - Socials tray (Priority: P2)

**Goal**: Socials trigger flips a boxed channel row above the content dock; closed at rest; existing `site.json` channels

**Independent Test**: quickstart.md Scenario 5 steps 3–6

### Implementation for User Story 4

- [ ] T029 [US4] CSS-place the **same** `.stage__socials` / `Channels` instance from `src/pages/index.astro` into the socials tray slot above the content dock below 1024px (`src/styles/global.css` / `src/components/StagePanels.astro`). MUST NOT mount a second `Channels.astro`.
- [ ] T030 [US4] Implement tray open/close from the socials trigger in `src/components/StagePanels.astro` + `src/lib/player-dock.ts` (or a small hook in the same module): boxed row **above** the content dock; `aria-expanded`; coming-soon not dead links
- [ ] T031 [US4] Tray overflow wraps or scrolls inside the box in `src/components/StagePanels.astro` / `src/components/Channels.astro` — no page sideways scroll at 320px
- [ ] T032 [US4] Manually walk socials open/close and outbound links per `specs/015-mobile-stage-hud/quickstart.md` Scenario 5

**Checkpoint**: No permanent phone socials bar; tray is on-demand

---

## Phase 7: User Story 5 - One sheet at a time; rest of site still works (Priority: P2)

**Goal**: Phone exclusive-open across About / Discography / Tour / V-Flip list / socials. Pill expand is not a sheet. Identity, legal, intro, discography stage button, laptop HUD unchanged

**Independent Test**: quickstart.md Scenarios 6–9 (legal, intro, 1023 vs 1024, keyboard, reduced motion)

### Implementation for User Story 5

- [ ] T033 [US5] Extend exclusive-open in `src/lib/player-dock.ts` / `src/components/StagePanels.astro` so below 1024px opening one of About, Discography, Tour, V-Flip list (`[data-jukebox]` open), or socials closes the others; pill expand/collapse does not count
- [ ] T034 [US5] Keep ≥1024px exclusive-open as `011` (panels among themselves; V-Flip may stay open) in `src/components/StagePanels.astro`
- [ ] T035 [US5] Hide phone player dock, content dock, and socials tray during intro in `src/styles/intro.css` (`data-intro-pending` / `data-intro-active`); do not run handle hint until intro is gone (`src/lib/player-dock.ts`)
- [ ] T036 [US5] Verify discography “Play on V-Flip” still switches stage from a phone sheet in `src/components/Discography.astro` (no playback-rule changes)
- [ ] T037 [US5] Manually walk `specs/015-mobile-stage-hud/quickstart.md` Scenarios 6, 7, 8, and 9 (1023 phone HUD, 1024 laptop slider, keyboard, reduced motion)
- [ ] T045 [US5] Bind `matchMedia(PHONE_MQ)` in `src/lib/player-dock.ts`: on resize to ≥1024px stop swipe/hint (do not require collapsing); on resize back to phone restore collapsed unless the handle was left expanded this visit; tear down listeners on teardown

**Checkpoint**: Sheets don’t stack; laptop and intro behave

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Docs, contract pointers, glitch, CI

- [ ] T038 Document handle labels, `socials` icon token, and phone vs laptop HUD in `docs/artist-guide.md` (**constitution VII**: same merge as T002–T004 chrome fields; do not ship HUD without this)
- [ ] T039 [P] Amend phone-polish pointer from IDEA-013 to `015` in `specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md`
- [ ] T040 [P] Amend `<1024px` chrome pointer to `015` in `specs/011-vflip-now-playing/contracts/vflip-player-ui.md`
- [ ] T041 Confirm glitch hit boxes still cover full dock controls in `src/styles/glitch.css` / `src/components/Jukebox.astro` / `src/components/StagePanels.astro` (`009` FR-008)
- [ ] T042 Run `npm run check` and `npm run build`; fix regressions in touched files. Confirm no new cookies/embeds/routes (FR-020) and no second atmosphere stack or extra font files. Manual: landing still usable under constitution IV’s 2s mobile bar (same bar as `001`; no new load-test harness).
- [ ] T043 Full manual pass of `specs/015-mobile-stage-hud/quickstart.md` (all scenarios)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: start immediately
- **Foundational (Phase 2)**: after Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: after Foundational — MVP layout
- **US2 (Phase 4)**: after US1 (needs phone dock slot for the pill)
- **US3 (Phase 5)**: after US1 (needs content dock slot); can overlap late US2 if staffed
- **US4 (Phase 6)**: after US3 (needs socials trigger in the box)
- **US5 (Phase 7)**: after US2–US4 (exclusive-open across all sheets)
- **Polish (Phase 8)**: after desired stories

### User Story Dependencies

- **US1**: after Phase 2 only
- **US2**: after US1 (player sits in the phone stack)
- **US3**: after US1 (content dock stack)
- **US4**: after US3
- **US5**: after US2 + US3 + US4

### Parallel Opportunities

- T003 with T002 once schema shape is agreed
- T010 with T007–T009
- T023 / T024 before T025
- T039 / T040 in polish (T038 is sequential with chrome — same merge)
- T044 after T013/T014 markup+CSS (V-Flip sheet)
- T045 with T033 exclusive-open / T006 module

### Parallel Example: User Story 1

```bash
# After T007 dock stack exists:
Task: "Compact identity on phone in src/components/Hero.astro"
# Footer offset and socials hide can proceed once the dock stack height is known
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2
2. Phase 3 US1
3. **STOP**: quickstart Scenario 1 — stacked docks, no top socials, 320px no sideways scroll

### Incremental Delivery

1. US1 → phone composition
2. US2 → real player pill + V-Flip list as player-dock sheet
3. US3 → boxed sheets
4. US4 → socials tray
5. US5 → exclusive-open + laptop/intro/a11y
6. Polish → artist guide + contract amends + CI

### Notes

- Do **not** add npm packages
- Do **not** change `011` shuffle/loop/dwell rules
- Mute must not live inside the handle
- No-JS: transport remains visible (always expanded)
- One `<Channels />` only — CSS moves it; never duplicate the list
- Handle hit target ≥ 44×24px; `html[data-player-dock-js]` is the collapsed-transport hook
