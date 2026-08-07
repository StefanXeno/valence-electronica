# Tasks: Website Skeleton for Valence

**Input**: Design documents from `/specs/001-website-skeleton/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/content-schema.md, quickstart.md

**Tests**: Not requested for this feature. CI quality gates (`astro check`, `astro build`) serve as the automated safety net (see research.md R8).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Astro project so it builds locally

- [x] T001 Initialize Astro 7 project at repository root: `package.json` (scripts: `dev`, `build`, `preview`, `check`), `astro.config.mjs` with `site`/`base` for GitHub Pages (see research.md R3), `tsconfig.json` (strict), `.gitignore`
- [x] T002 [P] Add placeholder assets in `public/`: `favicon.svg` and `og-image.png` (deliberate placeholder design, swappable later)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Content source of truth and page shell that every story renders through

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create `src/data/site.json` exactly per contracts/content-schema.md (artist profile "Valence", `seo.indexable: false`, channels: Bandcamp active + Spotify/SoundCloud/Instagram placeholders)
- [x] T004 [P] Create design tokens and base styles in `src/styles/global.css` (dark theme custom properties, typography scale, responsive defaults from 320px)
- [x] T005 Create `src/layouts/Base.astro`: HTML shell reading `site.json` for `<title>`, meta description, Open Graph tags, conditional `noindex` robots meta; imports `global.css`; header/main/footer landmarks (depends on T003, T004)

**Checkpoint**: `npm run build` succeeds with an empty page rendered through the layout

---

## Phase 3: User Story 1 - Visitor gets to know the artist (Priority: P1) 🎯 MVP

**Goal**: Landing page shows artist name, tagline, and genre-appropriate visual identity, responsive on all devices

**Independent Test**: Open dev/preview URL on desktop and at 320px width; artist name and tagline visible without scrolling, no horizontal scrollbar; page source contains title/description/OG tags (quickstart.md scenarios 1–2)

### Implementation for User Story 1

- [x] T006 [P] [US1] Create `src/components/Hero.astro` rendering `artist.name`, `artist.tagline`, `artist.description` from `src/data/site.json` with placeholder visual treatment
- [x] T007 [US1] Create `src/pages/index.astro` rendering Hero inside `Base.astro` (depends on T006)

**Checkpoint**: MVP — the page is live-able and shareable

---

## Phase 4: User Story 2 - Visitor finds music and social channels (Priority: P2)

**Goal**: Channel section with active links (new tab) and visible "coming soon" placeholders

**Independent Test**: Bandcamp link opens `https://valenceelectronica.bandcamp.com/` in a new tab; placeholder entries render without links (quickstart.md scenario 3)

### Implementation for User Story 2

- [x] T008 [P] [US2] Create `src/components/Channels.astro`: renders `channels` from `site.json`; `status: "active"` → `<a target="_blank" rel="noopener noreferrer">`; `status: "placeholder"` → non-linked "coming soon" entry; section hides itself when list is empty
- [x] T009 [US2] Integrate Channels section into `src/pages/index.astro` (depends on T008)

**Checkpoint**: Landing page leads visitors to the music

---

## Phase 5: User Story 3 - Operator publishes without infrastructure work (Priority: P2)

**Goal**: Push to `main` automatically checks, builds, and deploys to GitHub Pages; failures never touch the live site

**Independent Test**: Content edit merged to `main` is live within 10 minutes; a build-breaking edit fails CI and leaves the previous version online (quickstart.md scenarios 4–5)

### Implementation for User Story 3

- [x] T010 [US3] Create `.github/workflows/deploy.yml`: trigger on push to `main`; job 1 runs `astro check` + build via `withastro/action@v5`; job 2 deploys via `actions/deploy-pages`; correct `permissions` and `concurrency` blocks
- [x] T011 [P] [US3] Document one-time GitHub Pages setup (Settings → Pages → Source: GitHub Actions) and the `<owner>` placeholder in `astro.config.mjs` in `README.md`

**Checkpoint**: Zero-ops publishing pipeline complete (verifiable once the GitHub repo exists)

---

## Phase 6: User Story 4 - Visitor finds legally required information (Priority: P3)

**Goal**: Impressum and Datenschutzerklärung reachable from every page as marked placeholders

**Independent Test**: Footer links open `/legal/imprint` and `/legal/privacy`; both render placeholder legal text (quickstart.md scenario 6)

### Implementation for User Story 4

- [x] T012 [P] [US4] Define `legal` content collection schema in `src/content/config.ts` (frontmatter: required `title`)
- [x] T013 [P] [US4] Create placeholder legal pages `src/content/legal/imprint.md` and `src/content/legal/privacy.md` (German titles, clearly marked placeholder bodies)
- [x] T014 [US4] Create `src/pages/legal/[slug].astro` rendering legal collection entries through `Base.astro` (depends on T012, T013)
- [x] T015 [US4] Create `src/components/Footer.astro` with links to all legal pages and integrate it into `src/layouts/Base.astro` so it appears on every page (depends on T014)

**Checkpoint**: All user stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation

- [x] T016 [P] Extend `README.md` with content editing guide: how to change `site.json`, legal pages, and preview locally (FR-011)
- [x] T017 Run quickstart.md validation scenarios 1–3, 6, 7 locally (`npm run check`, `npm run build`, `npm run preview`, weight budget, no third-party requests); scenarios 4–5 require the GitHub repo and are handed to the owner

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Stories (Phases 3–6)**: All depend only on Phase 2; independent of each other
- **Polish (Phase 7)**: Depends on all user stories

### Parallel Opportunities

- T002 parallel to T001 finishing touches; T003 ∥ T004 within Phase 2
- After Phase 2: US1 (T006–T007), US2 (T008–T009), US3 (T010–T011), US4 (T012–T015) are mutually independent; only their integration touches shared files (`index.astro`, `Base.astro`) and must be serialized per file
- T006 ∥ T008 ∥ T010 ∥ T012/T013 can all start together

## Implementation Strategy

MVP first: Phases 1–3 produce a shareable landing page. Then US2 (channels), US3
(pipeline), US4 (legal) as independent increments, polish last. Commit after each phase
checkpoint at minimum.

## Implementation Notes (2026-08-07)

- All tasks completed. Deviations from the original task descriptions:
  - T002: `og-image.png` deferred until real artwork exists; the `og:image` tag is omitted
    (FR-010 only requires title + description). `favicon.svg` created.
  - T012: collection schema lives at `src/content.config.ts` (current Astro convention)
    instead of `src/content/config.ts`.
  - Astro telemetry disabled in CI (`ASTRO_TELEMETRY_DISABLED=1`), in line with
    constitution principle V.
- T017 validation results: `astro check` 0 errors/warnings/hints; build outputs 3 pages;
  total `dist/` 264 KB (fonts split per unicode-range subset, a browser loads only the
  latin subset ≈ 52 KB); zero JavaScript shipped; no third-party requests; browser
  screenshots at 1280px and 375px confirmed no horizontal scrolling and no visual defects.
  Scenarios 4–5 (deploy pipeline) require the GitHub repository and remain with the owner.
