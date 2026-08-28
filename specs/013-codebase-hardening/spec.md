# Feature Specification: Codebase Hardening & Quality Pass

**Feature Branch**: `013-codebase-hardening`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Take a look at the current code and create a spec that fixes
bugs or makes the code better."

**Triggered by**: Post-`012` codebase review (build/check/tests green; gaps in shipped
behavior, dead code, incomplete spec coverage, and playback edge cases).

## Clarifications

### Session 2026-08-28

- Q: Restore lyrics UI in V-Flip? → A: **No.** `011` explicitly deferred in-drawer lyrics.
  This feature **removes dead lyrics UI code** and documents that lyrics remain in jukebox
  content for a future spec — it does not re-expose them to visitors.
- Q: Restore the separate track-catalog panel from `010` US2? → A: **No.** V-Flip inline
  track list (`TrackInfoPanel` in the jukebox drawer) is the accepted replacement per `011`.
  This feature completes the **metadata gap** (credits, mentions, blurb) in that surface only.
- Q: Include legal pages, SEO launch, mobile HUD, media re-encode, Prettier/ESLint, glitch
  CSS split? → A: **Out of scope** — tracked as IDEA-009, IDEA-013, IDEA-015, IDEA-016,
  IDEA-017, IDEA-018 respectively.

### Session 2026-08-28 (operator)

- Q: Crossfade while another is in progress? → A: **Latest-wins** — increment generation
  token on each `select()`; stale async handoffs exit before video swap, theme writes, or
  `restartClock()`.
- Q: Long tagline at 320px? → A: **Wrap to two lines** (`-webkit-line-clamp: 2` or
  equivalent); no horizontal scroll; not single-line ellipsis.
- Q: Orphan `releases` collection? → A: **Remove** from `src/content.config.ts` (discography
  stays jukebox-derived); do not add empty `src/content/releases/`.
- Q: Lyrics chrome fields while UI deferred? → A: **Remove** `lyricsTitle` and `emptyLyrics`
  from ui schema, `chrome.md`, `UiChrome`, and artist guide references.
- Q: Canonical artist location? → A: **Berlin** — update `src/data/site.json` to match
  `src/content/about/me.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor sees full track context in the V-Flip drawer (Priority: P1)

A visitor opens the jukebox drawer and selects a track. The inline track detail beside the
list shows everything the artist configured: release date, outbound listen links, optional
short blurb, credits (role + name), and honorable mentions. Sections with no content are
omitted — no empty placeholder blocks.

**Why this priority**: `010` FR-009 shipped in schema and content but never rendered after
the `011` V-Flip migration. This is the largest user-visible regression from the review.

**Independent Test**: Add credits and mentions to one jukebox file only; open the drawer,
select that track, and confirm all configured fields appear. Select a track without credits;
confirm no credits section renders.

**Acceptance Scenarios**:

1. **Given** a jukebox entry has `credits` in content, **When** the visitor views that
   track’s detail in the open jukebox drawer, **Then** each credit row shows role and name
   in readable order.
2. **Given** a jukebox entry has `mentions` in content, **When** the visitor views that
   track’s detail, **Then** mentions appear as short prose below credits (or alone when
   credits are absent).
3. **Given** a jukebox entry has an optional `blurb`, **When** the visitor views that
   track’s detail, **Then** the blurb appears above release date / listen links.
4. **Given** a jukebox entry has none of blurb, credits, or mentions, **When** the visitor
   views that track’s detail, **Then** only release date and listen links (or their empty
   states) appear — no “empty credits” chrome.
5. **Given** the visitor switches tracks in the drawer, **When** the new track is active,
   **Then** the visible detail panel updates to the new track within one interaction beat.

---

### User Story 2 - Stage playback stays correct under stress (Priority: P1)

A visitor (or operator testing) rapidly switches jukebox tracks, toggles shuffle/loop, or
lets a track end while shuffle is on. The active track, atmosphere video, theme, mute rules,
and inline track detail stay in sync. No overlapping crossfades leave the stage in a wrong
visual state. Shuffle advance timing does not reset spuriously from background video buffer
reloads.

**Why this priority**: Review found a race on `loadedmetadata` after video layer swap and
no guard against overlapping async crossfades — both can cause wrong-track or glitchy stage
states during normal use.

**Independent Test**: Rapid-click three different jukebox entries within two seconds; confirm
one stable active track and matching theme. With shuffle on, let a short clip end; confirm
advance fires once and timing is not reset by idle-buffer reload.

**Acceptance Scenarios**:

1. **Given** a crossfade is in progress, **When** the visitor selects another jukebox entry
   before it completes, **Then** the stage ends on exactly one active track (**latest-wins**:
   stale handoff exits before video swap or theme writes) without stacked scrims or
   mismatched `data-theme`.
2. **Given** shuffle mode is on and the active video ends, **When** dwell timing elapses,
   **Then** advance to the next track happens once (no double-hop from duplicate timers).
3. **Given** the atmosphere uses dual video layers for crossfade, **When** the idle layer
   reloads metadata, **Then** shuffle/loop dwell timers on the **active** track are not
   restarted unless the active track’s media actually changed.
4. **Given** malformed jukebox catalog JSON in the page (corrupt deploy artifact), **When**
   the stage script boots, **Then** the page remains usable (scheduled/static default
   atmosphere, legal links reachable) and a clear console error is logged — not a hard
   script crash.

---

### User Story 3 - Identity and tagline stay readable on narrow viewports (Priority: P2)

A visitor loads the landing on a 320px-wide phone. The rotating tagline under the wordmark
does not cause horizontal scrolling and is not silently clipped off-screen. Long pool lines
remain readable via **two-line wrap** (not single-line ellipsis).

**Why this priority**: Constitution Principle IV requires no horizontal scroll at 320px.
`Hero` tagline uses `white-space: nowrap` while `overflow-x: clip` hides overflow — a
review finding.

**Independent Test**: Load `/` at 320px width with the longest tagline pool entry active;
confirm no horizontal scrollbar and tagline text is partially or fully visible per chosen
treatment.

**Acceptance Scenarios**:

1. **Given** a tagline line longer than the identity column width at 320px, **When** the
   page renders, **Then** there is no horizontal page scroll.
2. **Given** the same long line, **When** the visitor views the tagline, **Then** up to two
   lines of the message are visible (wrap/clamp — not fully invisible clip).
3. **Given** `prefers-reduced-motion`, **When** tagline rotation runs, **Then** narrow-width
   behavior matches reduced-motion path (no new motion beyond copy change).

---

### User Story 4 - Maintainer trusts docs and content boundaries (Priority: P2)

The operator reviews artist-facing documentation after recent features (`010`, `011`, `012`)
and finds accurate guidance: which jukebox fields render in the V-Flip drawer, that lyrics
are content-only until a future feature, and that intro replay is dev-only. Public-facing
copy does not contradict itself on artist location. Build emits no recurring warnings for
orphan content collections.

**Why this priority**: Constitution Principle VII; reduces support burden and prevents
artist edits in dead surfaces.

**Independent Test**: Read `docs/artist-guide.md` and README intro section; confirm credits,
mentions, blurb, and lyrics status match implementation. Run `npm run build` — no warning
about missing `src/content/releases/` unless that collection is intentionally retained.

**Acceptance Scenarios**:

1. **Given** the artist guide jukebox section, **When** the operator reads editable fields,
   **Then** `blurb`, `credits`, `mentions`, and `listenLinks` are documented with examples.
2. **Given** lyrics in jukebox markdown bodies, **When** the operator reads the guide,
   **Then** it states lyrics are **not shown on the live site** in v1 (deferred per `011`).
3. **Given** README landing-intro section, **When** an operator reads replay instructions,
   **Then** `?replay-intro` and `/dev/intro` are marked **development-only** per `006`.
4. **Given** `site.json` artist location and about copy, **When** both are read on the live
   site, **Then** location is consistent (operator picks canonical city in content edit —
   no code-side invention of personal data).
5. **Given** a clean build, **When** `npm run build` runs, **Then** no recurring warning
   about an empty/missing `releases` content directory (`releases` collection removed from
   `src/content.config.ts`).

---

### User Story 5 - Operator signs off V-Flip playback QA (Priority: P2)

The operator executes the remaining manual validation checklist for `011-vflip-now-playing`
and records pass/fail. Any failures found become fix tasks within this feature before close.

**Why this priority**: `011` implementation tasks are complete but nine manual quickstart
scenarios remain unchecked — playback UX is unverified in production-like conditions.

**Independent Test**: Walk `specs/011-vflip-now-playing/quickstart.md` scenarios 1–13 (and
6b); all marked pass or linked to filed fixes.

**Acceptance Scenarios**:

1. **Given** the quickstart checklist, **When** the operator completes keyboard navigation
   (vinyl → shuffle → loop → mute → list → dock → footer), **Then** focus order is logical
   and no control is unreachable.
2. **Given** shuffle and loop toggles, **When** tested per quickstart, **Then** behavior
   matches `011` contracts (timing vs. mp4 duration, toggles survive track pick, mute rules).
3. **Given** reduced-motion enabled, **When** crossfade and jukebox interactions run,
   **Then** no constitution violations beyond existing `011` reduced-motion rules.
4. **Given** all scenarios pass, **When** `011` tasks are updated, **Then** open manual
   validation tasks (T017, T021, T026, T033, T037, T040, T042, T043, T048) are checked off
   or superseded by this feature’s close-out task.

---

### User Story 6 - Pure library behavior has regression tests (Priority: P3)

A developer changes theme resolution or show-date filtering and CI catches regressions in
unit tests — the same pattern already used for `stage-schedule` and `tagline-pool`.

**Why this priority**: `theme-packs.ts` and `stage.ts` hold critical fallback logic with
zero tests today (IDEA-017 flagged).

**Independent Test**: `npm test` includes new cases for unknown `themeId` fallback, HUD glitch
flag resolution, and Berlin-date show filtering; all pass in CI.

**Acceptance Scenarios**:

1. **Given** an unknown `themeId` on a jukebox entry, **When** theme pack is resolved,
   **Then** tests assert fallback to the default pack id.
2. **Given** shows with past and future Berlin dates, **When** `getUpcomingShows()` runs,
   **Then** tests assert only future (inclusive today) shows return, stable-sorted.
3. **Given** existing test suites, **When** `npm test` runs, **Then** total test count
   increases and CI remains green.

---

### User Story 7 - Dead code and stale sync paths removed (Priority: P3)

The codebase contains no orphaned components or exports left from superseded `010`/`004`
lyrics UI. Stage sync code does not reference DOM nodes that never exist.

**Why this priority**: Maintainability; avoids the next developer wiring lyrics twice or
debugging no-op sync loops.

**Independent Test**: Repository search finds no imports of `LyricsPanel.astro`; `syncStageUi`
has no `data-lyrics-for` branch unless lyrics nodes are reintroduced; `getValidReleases` is
removed or used; unused exports in `catalog-tracks.ts` are removed or tested.

**Acceptance Scenarios**:

1. **Given** the built site, **When** searched for `LyricsPanel`, **Then** it is not
   mounted on any route.
2. **Given** `syncStageUi` in `stage-switch.ts`, **When** reviewed, **Then** it only
   toggles selectors that exist in the current V-Flip DOM (`data-track-info-for`, jukebox
   options, stage buttons, playback toggles).
3. **Given** `getValidReleases` and unused `getValidCatalogTracks`, **When** the cleanup
   lands, **Then** each is either deleted or has a single call site and tests.

---

### Edge Cases

- Very long blurb or many credit rows in V-Flip detail → internal scroll inside drawer;
  no horizontal overflow at 320px (usable, not mobile-HUD-polished — IDEA-013).
- Credits with special characters or long role names → render as plain text; no HTML injection
  from markdown frontmatter.
- Crossfade cancel mid-animation → active video element and `data-theme` must match final
  selected jukebox id.
- Tagline rotation during intro (`data-intro-active`) → existing intro gating unchanged;
  rotator must not fight intro overlay.
- Removing `releases` collection → confirm no spec or artist-guide path still requires
  `src/content/releases/` unless reintroduced intentionally.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The V-Flip inline track detail (`TrackInfoPanel` / jukebox drawer) MUST
  render optional `blurb`, `credits`, and `mentions` from jukebox content when present
  (completes `010` FR-009 in the `011` UI model).
- **FR-002**: Omitted blurb, credits, and mentions MUST NOT render empty section chrome.
- **FR-003**: Stage switch logic MUST prevent overlapping crossfades from leaving the stage
  in an inconsistent active-id / theme / video state.
- **FR-004**: Shuffle/loop dwell timing MUST NOT restart from idle atmosphere layer
  `loadedmetadata` events unrelated to the active track.
- **FR-005**: Jukebox stage boot MUST tolerate corrupt `data-stage-catalog` JSON without
  breaking the entire landing script.
- **FR-006**: Tagline presentation MUST satisfy no horizontal scroll at 320px viewport
  width (constitution IV).
- **FR-007**: `docs/artist-guide.md` MUST document `blurb`, `credits`, `mentions`, and
  lyrics-not-shown status; README MUST mark intro replay as dev-only (constitution VII).
- **FR-008**: Artist location copy MUST be consistent between `site.json` and about content
  after operator content edit (no invented addresses in code).
- **FR-009**: Build MUST NOT emit a recurring warning for an orphan `releases` collection
  without a backing directory — remove collection or add empty dir per plan.
- **FR-010**: Dead lyrics UI (`LyricsPanel` mount path, stale `data-lyrics-for` sync,
  `lyricsTitle` / `emptyLyrics` chrome fields) MUST be removed unless lyrics are re-exposed
  (they are not in this feature).
- **FR-011**: Unit tests MUST cover `theme-packs.ts` id/fallback resolution and
  `stage.ts` upcoming-show filtering at minimum.
- **FR-012**: Remaining `011` manual quickstart scenarios MUST be executed and failures
  fixed or filed before this feature is marked done.
- **FR-013**: This feature MUST NOT add third-party scripts, tracking, or cookies
  (constitution V).
- **FR-014**: This feature MUST NOT scope mobile HUD redesign (IDEA-013), legal page
  completion (IDEA-009), SEO launch (IDEA-016), video re-encode (IDEA-015), formatter/linter
  rollout (IDEA-017), or glitch CSS split (IDEA-018).

### Key Entities

- **Jukebox track detail**: Visitor-facing block in the open V-Flip drawer for one track —
  blurb, release date, listen links, credits, mentions (all optional except identity via
  label).
- **Stage handoff**: Async transition between jukebox entries — atmosphere crossfade, theme
  token update, `syncStageUi`, playback timers.
- **Tagline line**: One string from `tagline-pool.json` or `site.json` fallback, rendered
  under the wordmark.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of jukebox entries with credits in content show those credits in the V-Flip
  drawer when selected (verified on at least one configured track).
- **SC-002**: Rapid jukebox switching (five selections in three seconds) leaves exactly one
  active track and matching theme in manual testing — zero stuck crossfade states in ten
  trials.
- **SC-003**: Landing page at 320px width produces no horizontal scrollbar with the longest
  configured tagline pool line active.
- **SC-004**: `npm run check`, `npm test`, and `npm run build` pass with at least **10**
  additional unit test cases across `theme-packs` and `stage` (baseline today: 57 tests).
- **SC-005**: All nine open `011` manual validation tasks are checked off or explicitly
  superseded with documented pass results.
- **SC-006**: `docs/artist-guide.md` lists all jukebox fields that render on the live site;
  operator can add credits to a track without developer help.

## Assumptions

- V-Flip (`011`) remains the canonical now-playing and track-list UI; separate catalog panel
  from `010` US2 is not revived.
- Lyrics stay in jukebox markdown for future work; visitors do not see them in v1.
- Canonical location is **Berlin** (`site.json` updated to match `about/me.md`).
- `releases` collection is removed because discography is jukebox-derived today.
- Lyrics chrome keys are removed now; jukebox markdown bodies may still hold lyrics for a
  future feature.
- Manual `011` QA is performed by the operator locally or on `/pre-release/` — no browser
  automation in CI (workspace rule).

## Out of Scope

- Complete Impressum / privacy policy (IDEA-009)
- Dedicated mobile HUD (IDEA-013)
- Poster WebM/AVIF and video compression (IDEA-015)
- `robots.txt`, sitemap, `seo.indexable` launch (IDEA-016)
- Prettier, ESLint, broad test coverage for `stage-switch.ts` / playback integration
  (IDEA-017 — partial unit tests only in this feature)
- Split `glitch.css` into modules (IDEA-018)
- Re-introducing lyrics panel or in-drawer lyrics (future spec)
- Restoring `NowPlayingControl`, `TrackCatalog.astro`, or separate catalog panel
