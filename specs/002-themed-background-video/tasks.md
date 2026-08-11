# Tasks: Themed Background Video

**Input**: Design documents from `/specs/002-themed-background-video/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/background-content.md, quickstart.md

**Tests**: Not requested for this feature. CI gates (`astro check`, `astro build`) plus manual walks in `quickstart.md` are the validation path.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Asset directories and placeholder media so atmosphere work is not blocked

- [x] T001 Create media directories `public/videos/` and `public/images/posters/`
- [x] T002 [P] Add a short placeholder loop MP4 at `public/videos/placeholder-loop.mp4` and a matching still at `public/images/posters/placeholder-loop.jpg`, sized for mobile-friendly weight per plan/research (temp: first 30s of Valence *NIGHTMARE* YouTube download, with audio)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Content contract, typed resolver, and theme/layout hooks every story uses

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create `src/data/background.json` per `contracts/background-content.md` (`defaultVideoId`, one `videos[]` entry with `sources`, `poster`, `themeId`, `hasAudio`)
- [x] T004 [P] Create `src/lib/background.ts` that loads `background.json`, resolves the default `BackgroundVideo`, and fails fast if `defaultVideoId` is missing/invalid
- [x] T005 [P] Create `src/styles/themes.css` with a `default` pack and at least one named pack (e.g. `violet-night`) overriding color/surface tokens (`--color-*`, `--bg-scrim`) for `[data-theme="…"]`
- [x] T006 Update `src/layouts/Base.astro` to import `themes.css`, set `data-theme` on `<html>` from the default video’s `themeId` via `src/lib/background.ts`, and reserve a full-viewport slot/region for the shared atmosphere layer (depends on T003–T005)

**Checkpoint**: `npm run check` passes; HTML root carries `data-theme` from `background.json` even before video UI lands

---

## Phase 3: User Story 1 - Visitor experiences atmosphere through background motion (Priority: P1) 🎯 MVP

**Goal**: Full-bleed muted looping background video behind landing content; readable identity/channels

**Independent Test**: Motion allowed → looping muted full-bleed video on landing; name/tagline/channels readable; usable at ~320px (quickstart.md scenario 1)

### Implementation for User Story 1

- [x] T007 [US1] Create `src/components/BackgroundAtmosphere.astro` rendering full-bleed `<video autoplay muted loop playsinline>` from the default entry’s `sources` (honor `base` via `src/lib/url.ts`), with poster `<img>` sibling and a content scrim using `--bg-scrim` (depends on T004, T002)
- [x] T008 [US1] Integrate `BackgroundAtmosphere.astro` into `src/layouts/Base.astro` (or landing shell) so the landing page shows the atmosphere behind `<main>` content without covering footer/legal link reachability (depends on T006, T007)
- [x] T009 [P] [US1] Adjust `src/components/Hero.astro` and `src/styles/global.css` so hero/text contrast remains readable over video (reduce opaque hero gradients that fight the atmosphere; keep 320px layout)
- [x] T010 [US1] Ensure `src/pages/index.astro` composition (Hero + Channels) sits cleanly above the atmosphere with no horizontal scroll (depends on T008, T009)

**Checkpoint**: MVP — muted atmospheric landing is demoable

---

## Phase 4: User Story 2 - Visitor can unmute and mute the background audio (Priority: P1)

**Goal**: Explicit mute/unmute only when the configured clip has audio and video is playing

**Independent Test**: `hasAudio: true` → control present, starts muted, unmute/mute works with accessible name; `hasAudio: false` → control absent (quickstart.md scenario 2)

### Implementation for User Story 2

- [x] T011 [US2] Create `src/components/MuteControl.astro` that renders only when default video `hasAudio` is true; button toggles the atmosphere `<video>` `muted` state; updates accessible name / pressed state; includes the justified minimal client `<script>` (depends on T007)
- [x] T012 [US2] Mount `MuteControl.astro` on the landing atmosphere in `src/layouts/Base.astro` or `src/components/BackgroundAtmosphere.astro` so it does not block primary content, channels, or legal links (FR-009) (depends on T011, T008)
- [x] T013 [US2] Wire playback-failure handling in the MuteControl/atmosphere script: on `error` or rejected `play()`, set fallback state, hide/disable mute control, keep poster visible (FR-003/FR-008) (depends on T011)

**Checkpoint**: Audio control matches clarify rules; silent clips stay control-free

---

## Phase 5: User Story 3 - Default video sets a matching visual theme (Priority: P2)

**Goal**: Color/surface mood follows default video `themeId` for playback and static fallback

**Independent Test**: Change `themeId` in `background.json` → mood updates on landing without component edits; same theme with static fallback (quickstart.md scenario 3)

### Implementation for User Story 3

- [x] T014 [P] [US3] Expand `src/styles/themes.css` with a second distinct basic pack and document token expectations in a short comment block at the top of the file
- [x] T015 [US3] Verify/adjust `src/lib/background.ts` + `src/layouts/Base.astro` so unknown `themeId` falls back to the `default` pack and the active theme remains applied when atmosphere is in poster/fallback mode (depends on T004, T006, T007)
- [x] T016 [US3] Manually confirm content-only theme switch: edit only `src/data/background.json` `themeId`, refresh — no component changes required (SC-006) (depends on T014, T015)

**Checkpoint**: Basic theme binding is operator-maintainable

---

## Phase 6: User Story 4 - Reduced-motion visitors get a calm static fallback (Priority: P2)

**Goal**: No looping video when reduced motion is preferred; poster/static fallback; mute hidden

**Independent Test**: OS/browser reduce-motion on → no looping video, poster visible, mute hidden (quickstart.md scenario 4)

### Implementation for User Story 4

- [x] T017 [US4] Add `@media (prefers-reduced-motion: reduce)` rules in `src/components/BackgroundAtmosphere.astro` (and/or `src/styles/global.css`) to hide/stop the looping video presentation and show the poster/still only
- [x] T018 [US4] Ensure reduced-motion path keeps `data-theme` and readable content, and that `MuteControl` stays hidden/disabled when video is not playing (depends on T011, T017)
- [x] T019 [US4] Confirm load/autoplay failure path from T013 still yields themed static fallback with no blank hero (depends on T013, T017)

**Checkpoint**: Motion preferences and failures never force video

---

## Phase 7: User Story 5 - Visitor opens legal content in a dismissible panel (Priority: P2)

**Goal**: Impressum/privacy as near-fullscreen panel over atmosphere, margins, top Exit, CSS motion

**Independent Test**: Footer and direct `/legal/*` URLs show panel with margins + Exit to `/`; reduced motion skips/minimizes animation (quickstart.md scenario 5)

### Implementation for User Story 5

- [x] T020 [US5] Create `src/components/LegalPanel.astro`: near-fullscreen panel with margin on all sides, scrollable body slot, top Exit control linking to `/` via `withBase`, CSS open animation skipped under `prefers-reduced-motion`
- [x] T021 [US5] Refactor `src/pages/legal/[slug].astro` to render collection content inside `LegalPanel.astro` over the shared atmosphere from `Base.astro` (remove plain full-page-only legal layout that hides the atmosphere) (depends on T008, T020)
- [x] T022 [P] [US5] Adjust `src/components/Footer.astro` styles if needed so legal links remain obvious on the atmospheric landing page
- [x] T023 [US5] Verify focus is not trapped without Exit: keyboard can activate Exit; panel does not require video playback to read legal text (depends on T021)

**Checkpoint**: Legal UX matches clarify panel decision; direct URLs work

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Docs, readability pass, and full quickstart validation

- [x] T024 [P] Document editing `src/data/background.json` and swapping video/poster/theme assets in `README.md` (content-editing section)
- [x] T025 [P] Tune `src/components/Channels.astro` / footer contrast over video if quickstart readability checks fail
- [x] T026 Run full `quickstart.md` validation scenarios 1–8 locally (`npm run check`, `npm run build`, `npm run preview`) and fix any gaps
- [x] T027 Confirm no third-party media hosts and no new npm UI dependencies were introduced (constitution IV/V/VI)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: Depends on Setup (T002 media paths referenced by T003) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — MVP
- **US2 (Phase 4)**: Depends on US1 atmosphere component (T007/T008)
- **US3 (Phase 5)**: Depends on Foundational theme wiring; should be validated with US1 atmosphere present
- **US4 (Phase 6)**: Depends on US1 atmosphere (+ US2 control hiding rules)
- **US5 (Phase 7)**: Depends on shared atmosphere in Base (T008)
- **Polish (Phase 8)**: After desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies — **MVP**
- **US2 (P1)**: After US1 atmosphere exists
- **US3 (P2)**: After Foundational; best validated with US1/US4 fallback visible
- **US4 (P2)**: After US1 (and US2 if mute hiding is asserted)
- **US5 (P2)**: After atmosphere is on Base (US1 integration)

### Parallel Opportunities

- T002 parallel with early Foundational drafting once T001 dirs exist
- T004 and T005 parallel after T003 shape is known
- T009 parallel with T008 once atmosphere API is stable
- T014 parallel with T015 prep
- T022 parallel with T021
- T024 / T025 parallel during polish

---

## Parallel Example: Foundational + US1 prep

```bash
# After T001–T003:
Task: "Create src/lib/background.ts …"
Task: "Create src/styles/themes.css …"

# After Foundational checkpoint:
Task: "Adjust Hero.astro / global.css for contrast …"
Task: "Create BackgroundAtmosphere.astro …"  # then integrate in Base
```

---

## Parallel Example: User Story 5

```bash
Task: "Create LegalPanel.astro …"
Task: "Adjust Footer.astro contrast …"
# Then:
Task: "Refactor legal/[slug].astro to use LegalPanel …"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (dirs + placeholder media)
2. Phase 2: Foundational (`background.json`, helper, themes, Base `data-theme`)
3. Phase 3: US1 atmosphere on landing
4. **STOP and VALIDATE** quickstart scenario 1
5. Demo muted atmospheric site

### Incremental Delivery

1. Setup + Foundational → theme-aware shell
2. US1 → muted video MVP
3. US2 → mute control for audio clips
4. US3 → richer/verified theme packs
5. US4 → reduced-motion + failure hardening
6. US5 → legal panel over atmosphere
7. Polish → README + full quickstart

### Suggested sequence for a solo implementer

US1 → US2 → US4 → US3 → US5 → Polish (theme can be lightly present from Foundational; US3 deepens it)

---

## Notes

- [P] = different files, no blocking dependency on incomplete sibling tasks
- No automated browser test tasks (not requested)
- Sample/placeholder media is explicitly allowed by the spec
- Do not implement video switcher, schedule, deep theme packs, or track-info panel (FR-011)
- Commit after each task or logical group; keep `main` deployable via PR when ready
