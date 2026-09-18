# Tasks: Site Nav & Fan-First Chrome

**Input**: Design documents from `/specs/020-site-nav-chrome/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: None requested in spec. CI: `astro check`, `astro build`. Manual
validation in [quickstart.md](./quickstart.md) (320 / 390 / 1023 / 1024 / 1280).

**Organization**: User stories US1–US4 from spec.md. No new npm packages.
Player / V-Flip / dual-video work stays in `021` / `022`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: US1–US4 from spec.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align implementer with contract and supersession notes

- [x] T001 Review `specs/020-site-nav-chrome/contracts/site-nav-chrome-ui.md` and `specs/020-site-nav-chrome/research.md` against current `src/pages/index.astro`, `src/components/Hero.astro`, `src/components/Channels.astro`, `src/components/StagePanels.astro`, `src/components/StageDock.astro`, `src/components/TourDates.astro`, `src/styles/global.css`, and sibling notes in `specs/015-mobile-stage-hud/` + `specs/019-desktop-chrome-polish/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Content schema + nav data helpers — blocks all user stories

**⚠️ CRITICAL**: No user story work until this phase is complete

- [x] T002 Extend `ui` collection schema in `src/content.config.ts` with `homeTitle`, `shopTitle`, `contactTitle`, `shopComingSoonTitle`, `shopComingSoonBody`, and `contactEmpty` per `specs/020-site-nav-chrome/data-model.md` (reuse existing `tourTitle`)
- [x] T003 [P] Add the new chrome fields with English defaults to `src/content/ui/chrome.md`; set `socialsLabel` default to **`Links`** (field name stays `socialsLabel`)
- [x] T004 Add optional `shopUrl` and a `contact` object (`headline`, `body`, `email`, `links`) to `src/data/site.json` (and TypeScript types) per data-model — leave `shopUrl` unset so Coming soon path is testable; do **not** create `src/content/contact/`
- [x] T005 Extend `getChrome()` / site loaders in `src/lib/stage.ts` to expose primary-nav labels, shop URL, and contact payload from `site.json` with safe defaults (fallback `socialsLabel` → `Links`)
- [x] T006 [P] Create stub `src/components/SiteNav.astro` that renders brand slot + four text items from chrome (no final styling yet) and mount it from `src/pages/index.astro` without removing old chrome yet

**Checkpoint**: `npm run check` passes; chrome/site fields resolve; SiteNav stub visible in DOM

---

## Phase 3: User Story 1 - Fan finds Shop and Tour in one glance (Priority: P1) 🎯 MVP

**Goal**: Top band presents Home / Shop / Tour / Contact; Shop and Tour reach merch/shows paths (or honest empty states)

**Independent Test**: quickstart.md Scenario 1 at ~390 and ~1280 — locate Shop/Tour in top chrome within 5s; Tour opens shows; Shop Coming soon when URL unset

### Implementation for User Story 1

- [x] T007 [US1] Style the top band in `src/components/SiteNav.astro` + `src/styles/global.css` (near-black panel, text-forward menu, no decorative circles around items) per contract
- [x] T008 [US1] Wire **Tour** activation to open the existing tour/shows surface (`TourDates.astro` / stage panel open path) from `src/components/SiteNav.astro` without requiring circular `StagePanels` buttons
- [x] T009 [US1] Implement Shop behavior in `src/components/SiteNav.astro` (+ small `src/components/ShopComingSoon.astro` if needed): outbound `shopUrl` when set; Coming soon panel when unset; item always visible
- [x] T010 [P] [US1] Ensure Tour empty state still uses chrome `emptyShows` when `src/content/shows/` has no upcoming entries
- [x] T011 [US1] Make primary nav work without JS via real `<a href>` / in-page anchors in `src/components/SiteNav.astro` (progressive enhancement for panel open)
- [ ] T012 [US1] Manually walk `specs/020-site-nav-chrome/quickstart.md` Scenario 1 (390 + 1280)

**Checkpoint**: Shop/Tour discoverable from top nav on phone and laptop

---

## Phase 4: User Story 2 - New visitor understands whose stage this is (Priority: P1)

**Goal**: Brand/logo is hero-level in the top band; Home returns to stage; Contact opens a clear path

**Independent Test**: quickstart.md Scenario 2 — brand vs menu cover test; Home stays on stage; Contact opens

### Implementation for User Story 2

- [x] T013 [US2] Integrate brand/logo from `src/components/Hero.astro` into the SiteNav brand slot so logo weight dominates menu text (avoid tiny nav-mark-only treatment)
- [x] T014 [US2] Implement **Home** → landing stage (close trapping panels / scroll-to-stage) in `src/components/SiteNav.astro` + any small helper in `src/lib/`
- [x] T015 [US2] Create `src/components/ContactPanel.astro` (or equivalent) fed by `site.json` → `contact`; honest empty/incomplete state using chrome `contactEmpty`
- [x] T016 [US2] Wire **Contact** nav item to open ContactPanel from `src/components/SiteNav.astro`
- [ ] T017 [US2] Manually walk `specs/020-site-nav-chrome/quickstart.md` Scenario 2

**Checkpoint**: Calling-card top band + working Home/Contact

---

## Phase 5: User Story 3 - Socials stay findable without circular side docks (Priority: P2)

**Goal**: Laptop side socials; phone Links pattern retained; one Channels tree

**Independent Test**: quickstart.md Scenario 3

### Implementation for User Story 3

- [x] T018 [US3] Relocate laptop placement of `.stage__socials` / `Channels.astro` to a side peripheral zone in `src/styles/global.css` (+ markup hooks in `src/pages/index.astro` if needed) — do not mount a second Channels list
- [x] T019 [US3] Preserve phone Links pattern (park/reuse Channels; label from chrome `socialsLabel`, default Links) in `src/lib/player-dock.ts` and related phone CSS so Links remains usable after top-nav changes
- [x] T020 [US3] Restyle side/Links chrome to match simplified language without reintroducing circular dock-as-only-path in `src/components/Channels.astro` / `src/styles/global.css`
- [ ] T021 [US3] Manually walk `specs/020-site-nav-chrome/quickstart.md` Scenario 3

**Checkpoint**: Side socials on laptop; Links on phone

---

## Phase 6: User Story 4 - Side circular button chrome is gone (Priority: P2)

**Goal**: Remove primary circular side/content-dock stacks; secondary About/Discography/legal still reachable

**Independent Test**: quickstart.md Scenario 4 — rest screenshot has no circular side column; About/Discography/legal reachable

### Implementation for User Story 4

- [x] T022 [US4] **Remove** circular primary chrome from resting UI in `src/components/StagePanels.astro` (and callers) — StagePanels MUST NOT remain a primary circular dock / corporate primary IA; secondary brand content may still open via non-circular secondary entries if needed
- [x] T023 [US4] Add quieter **secondary text links under the top band** for About and Discography in `src/components/SiteNav.astro` (not primary top-bar items; not Contact-area-only dual placement) without restoring circular stacks
- [x] T024 [US4] Ensure Impressum / Privacy remain reachable in ≤2 actions via Contact, Info, or explicit legal entry near the secondary row using `src/components/LegalSheet.astro` / `LegalOverlay.astro` (constitution V)
- [x] T025 [US4] Update phone exclusive-open / content-dock assumptions in `src/lib/player-dock.ts` so removed circular triggers do not leave dead controllers
- [ ] T026 [US4] Manually walk `specs/020-site-nav-chrome/quickstart.md` Scenario 4 (+ Scenario 5 narrow/no-JS)

**Checkpoint**: Simplified rest chrome; legal still reachable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Docs, supersession callouts, CI, sibling non-regression

- [x] T027 [P] Update `docs/artist-guide.md` for top nav labels, `shopUrl`, contact fields, and secondary entry edit surfaces (constitution VII)
- [x] T028 [P] Add supersession callouts in `specs/015-mobile-stage-hud/contracts/mobile-hud-ui.md` and `specs/019-desktop-chrome-polish/contracts/desktop-chrome-polish.md` pointing primary nav/side-circle authority to `020`
- [x] T029 [P] Cross-link `specs/021-jukebox-easter-egg/spec.md` and `specs/022-stage-artist-polish/spec.md` from plan/contract notes if implementer docs need a single “chrome ownership” pointer (FR-013)
- [x] T030 Run `npm run check` and `npm run build`; smoke quickstart Scenario 6 (player still present; no V-Flip in top menu)
- [ ] T031 Verify 320px: no horizontal page scroll caused by top nav (`src/styles/global.css` / SiteNav)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **blocks** all user stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After Foundational; integrates with SiteNav from US1
- **US3 (Phase 5)**: After Foundational; best after US1 top band exists
- **US4 (Phase 6)**: After US1 (Tour must not depend on circles); ideally after US3 so socials already have a non-circle home
- **Polish (Phase 7)**: After desired stories complete

### User Story Dependencies

- **US1 (P1)**: Foundation only — MVP
- **US2 (P1)**: Needs SiteNav shell from US1 for brand/Home/Contact slots
- **US3 (P2)**: Independent of Contact copy; needs layout space cleared by top band
- **US4 (P2)**: Depends on Tour/Shop no longer requiring StagePanels circles (US1)

### Parallel Opportunities

- T003 ∥ T004 after T002 schema direction is clear
- T010 ∥ T009 within US1
- T027 ∥ T028 ∥ T029 in Polish

## Parallel Example: User Story 1

```bash
# After T007–T008 land:
Task: "Implement Shop Coming soon vs shopUrl in SiteNav + ShopComingSoon.astro"
Task: "Confirm emptyShows still surfaces for Tour with no upcoming shows"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1–2
2. Complete Phase 3 (US1)
3. **STOP and VALIDATE** quickstart Scenario 1
4. Demo Shop/Tour findability before secondary chrome removal

### Incremental Delivery

1. Setup + Foundational
2. US1 → validate Shop/Tour
3. US2 → brand + Contact
4. US3 → side socials + Links
5. US4 → remove StagePanels from primary chrome + secondary About/Discography under top band + legal path
6. Polish → artist guide + supersession notes

### Suggested sequence vs siblings

1. **020** (this feature) first — unlocks IA
2. **021** jukebox/vinyl — designs player against new chrome
3. **022** stage polish + dual videos

## Locked decisions (analyze caveats)

| Topic | Decision |
| ----- | -------- |
| Contact storage | `src/data/site.json` → `contact` only |
| About / Discography | Secondary text row under top band — not primary top nav |
| StagePanels | Remove from primary chrome (no ambiguous demote) |
| Phone socials label | Chrome field `socialsLabel`, visitor default **Links** |

## Notes

- No new npm packages; no browser automation installs without operator approval
- Do not implement selection-first player or dual videos here
- Commit after each story checkpoint when implementing

## Implement session notes (2026-09-18)

- Code + check/build/test green for T001–T011, T013–T016, T018–T020, T022–T025, T027–T030.
- **Operator manual:** T012, T017, T021, T026, T031 (quickstart visual / 320px / no-JS) — not browser-automated.
