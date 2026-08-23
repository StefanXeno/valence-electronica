# Tasks: Artist Change Documentation

**Input**: Design documents from `/specs/008-artist-docs/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/artist-guide.md, quickstart.md

**Tests**: Not requested — manual validation via quickstart.md only (Phase 7).

**Organization**: Tasks grouped by user story. Docs-only feature; no application code changes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US4)
- Include exact file paths in descriptions

## Path Conventions

- **Hub guide**: `docs/artist-guide.md` (NEW)
- **Topic guide**: `docs/stage-schedule.md` (EXISTING — link only)
- **Entry point**: `README.md` (UPDATE — pointer, not duplicate inventory)
- **Contract**: `specs/008-artist-docs/contracts/artist-guide.md`
- **Validation**: `specs/008-artist-docs/quickstart.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the guide artifact and confirm inventory source of truth against the repo.

- [x] T001 Create `docs/artist-guide.md` with all required section headings from `specs/008-artist-docs/contracts/artist-guide.md` (Purpose through Maintainer note)
- [x] T002 [P] Audit current artist-editable surfaces under `src/content/`, `src/data/`, and `public/` against the contract inventory checklist in `specs/008-artist-docs/contracts/artist-guide.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core guide framing that all user-story sections build on.

**⚠️ CRITICAL**: No user story content work until T003–T004 are complete.

- [x] T003 Write Purpose section in `docs/artist-guide.md` (artist audience, safe-edit map, authoritative over README)
- [x] T004 [P] Extract complete `themeId` values from `src/lib/theme-packs.ts` and `src/styles/themes.css` for later Theme packs section in `docs/artist-guide.md`

**Checkpoint**: Guide skeleton and inventory audit ready — user story phases can begin.

---

## Phase 3: User Story 1 - Artist finds what he may safely edit (Priority: P1) 🎯 MVP

**Goal**: Artist opens the guide and finds every approved editable surface with path, effect, and rules.

**Independent Test**: Without README, a reader names the correct file for tagline, show, release, schedule, and jukebox lyrics (SC-001 / 5 of 5).

### Implementation for User Story 1

- [x] T005 [US1] Write "What you may change" entry for `src/data/site.json` in `docs/artist-guide.md` (name, path, site effect, channel/status rules)
- [x] T006 [P] [US1] Write inventory entries for `src/content/jukebox/`, `src/content/about/`, `src/content/releases/`, and `src/content/shows/` in `docs/artist-guide.md`
- [x] T007 [P] [US1] Write inventory entries for `src/content/ui/chrome.md`, `src/content/legal/` (include placeholder warning: replace Impressum/privacy with real information before public promotion — not legal advice), `src/data/stage-schedule.json` (with link to `docs/stage-schedule.md`), and `public/images/` / `public/videos/` (include media size/format guidance — oversized or wrong-format files hurt load time) in `docs/artist-guide.md`
- [x] T008 [US1] Verify 100% contract inventory coverage in `docs/artist-guide.md` against `specs/008-artist-docs/contracts/artist-guide.md` ship-time checklist (SC-004)

**Checkpoint**: User Story 1 complete — editable inventory is authoritative and complete.

---

## Phase 4: User Story 2 - Artist knows what he must not touch (Priority: P1)

**Goal**: Artist sees developer-owned surfaces, stable-id warnings, and theme selection boundary.

**Independent Test**: Reader correctly refuses to edit `src/styles/themes.css`, `src/lib/theme-packs.ts`, and `src/components/` (SC-002).

### Implementation for User Story 2

- [x] T009 [US2] Write "Theme packs (selection only)" section in `docs/artist-guide.md` listing complete `themeId` values from T004; state pack creation/editing is developer-only (also satisfies US1 acceptance scenario 4)
- [x] T010 [US2] Write "What you must not change" section in `docs/artist-guide.md` (layouts/components, styles, theme-pack registry/CSS, build config, CI workflows)
- [x] T011 [US2] Write "Stable ids" section in `docs/artist-guide.md` (do not rename jukebox slugs, `themeId`s, legal slugs without developer updating references)

**Checkpoint**: User Stories 1 and 2 both independently testable — safe edit boundary is explicit.

---

## Phase 5: User Story 3 - Artist edits on GitHub and publishes himself (Priority: P2)

**Goal**: Primary GitHub-web edit path, PR into `pre-release`, optional local preview, promote `pre-release` → `main`.

**Independent Test**: Reader restates GitHub edit → PR to `pre-release` → promote to `main` and failed-build behavior in under 2 minutes (SC-003).

### Implementation for User Story 3

- [x] T012 [US3] Write "How to edit (primary)" GitHub web editor steps in `docs/artist-guide.md`
- [x] T013 [US3] Write "How to publish (primary)" self-serve PR into `pre-release` steps in `docs/artist-guide.md` (must NOT make direct-to-`main` the normal path)
- [x] T014 [US3] Write "How to go live (secondary)" `pre-release` → `main` GitHub PR steps in `docs/artist-guide.md` (artist and/or developer; docs only — no automation; state explicitly that a failed build leaves the last good live site online and integration on `pre-release` is not public release)
- [x] T015 [P] [US3] Write "Optional: local preview" (`npm install`, `npm run dev`, `npm run check`) and "When to ask the developer" escalation sections in `docs/artist-guide.md`

**Checkpoint**: User Story 3 complete — full edit and publish flow documented.

---

## Phase 6: User Story 4 - Future features keep the guide accurate (Priority: P2)

**Goal**: Topic guides linked; maintainer note for Principle VII; README points to hub without duplicate inventory.

**Independent Test**: README links to guide; hub links to `docs/stage-schedule.md`; maintainer note present; no conflicting full inventories (SC-005 / FR-006–FR-010).

### Implementation for User Story 4

- [x] T016 [US4] Add Topic guides section in `docs/artist-guide.md` linking to `docs/stage-schedule.md` (hub one-liner + deep link; no duplicated schedule how-to)
- [x] T017 [US4] Add Maintainer note at end of `docs/artist-guide.md` (future features MUST update guide in same change set — Principle VII)
- [x] T018 [US4] Update `README.md` to link `docs/artist-guide.md` and shorten/remove duplicate full "Editing content" inventory per `specs/008-artist-docs/contracts/artist-guide.md` authority rules

**Checkpoint**: All four user stories complete and cross-linked.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation and link hygiene.

- [x] T019 Run full validation checklist in `specs/008-artist-docs/quickstart.md` against `docs/artist-guide.md` and `README.md` (SC-001 through SC-005, FR-005b scope check)
- [x] T020 [P] Verify relative links in `docs/artist-guide.md` and `README.md` resolve correctly (including `docs/stage-schedule.md`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories
- **User Stories (Phase 3–6)**: Depend on Phase 2
  - US1 and US2 are both P1; US1 should complete before US2 theme section references inventory
  - US3 depends on US1/US2 content existing in the same file (sequential sections)
  - US4 depends on US1–US3 sections being present before README trim and topic links
- **Polish (Phase 7)**: Depends on Phases 3–6 complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependency on other stories
- **US2 (P1)**: After US1 recommended (theme section references jukebox inventory)
- **US3 (P2)**: After US1/US2 (same file; boundary context helps publish section)
- **US4 (P2)**: After US1–US3 (README and maintainer note assume complete hub)

### Within Each User Story

- Inventory entries (T006, T007) can run in parallel after T005 sets the pattern
- Publish sections (T012–T14) are sequential; T015 can parallel once T012 exists
- US4 tasks T016–T17 can parallel; T018 should follow guide content stabilization

### Parallel Opportunities

- **Phase 1**: T002 parallel with T001 (after T001 creates the file, T002 can run alongside T003 in Phase 2)
- **Phase 2**: T004 parallel with T003
- **Phase 3**: T006 and T007 parallel after T005
- **Phase 5**: T015 parallel with T014 once edit section exists
- **Phase 7**: T020 parallel with final read-through of T019

---

## Parallel Example: User Story 1

```bash
# After T005 establishes inventory format:
Task T006: "Write inventory entries for jukebox, about, releases, shows in docs/artist-guide.md"
Task T007: "Write inventory entries for ui/chrome, legal, stage-schedule, media in docs/artist-guide.md"
# Then T008 verifies full coverage
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T004)
3. Complete Phase 3: User Story 1 (T005–T008)
4. **STOP and VALIDATE**: Run SC-001 / SC-004 scenarios from `specs/008-artist-docs/quickstart.md`
5. Artist can find editable files — minimum viable guide value delivered

### Incremental Delivery

1. Setup + Foundational → skeleton ready
2. US1 → editable inventory complete (MVP)
3. US2 → forbidden boundary explicit
4. US3 → publish flow documented
5. US4 → README + maintainer note + topic links
6. Polish → full quickstart pass

### Parallel Team Strategy

With two contributors after Foundational:

- **Developer A**: US1 inventory (T005–T008)
- **Developer B**: US2 forbidden/theme sections (T009–T011) — start after T005 pattern exists

Then single-thread US3–US4 on `docs/artist-guide.md` to avoid merge conflicts.

---

## Notes

- Docs-only: no changes to `src/components/`, CI workflows, or theme-pack code except reading `src/lib/theme-packs.ts` for the themeId list
- Do not add promote automation (FR-005b)
- `docs/stage-schedule.md` stays the deep schedule guide — link, do not duplicate
- Commit after each phase checkpoint or logical task group
