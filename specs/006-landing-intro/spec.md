# Feature Specification: Landing Intro — “Hi, I’m Valence”

**Feature Branch**: `006-landing-intro`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "Add a one-time landing intro: text like ‘Hi, I’m Valence’
zooms in, then the rest of the page reveals smoothly. After that, the intro should not
replay on every load. Honor reduced motion, keep the site usable without scripting, and
keep greeting copy editable in content files."

## Clarifications

### Session 2026-08-22

- Q: How long should “once-only” last? → A: **Forever per browser** until the visitor
  clears site data or a maintainer demo override is used. A first-party playback flag in
  browser storage records that the intro has completed; it is not analytics or tracking.
- Q: Can the visitor skip the intro? → A: **Yes.** Any click/tap or the Escape key ends
  the intro immediately, reveals the landing stage, and records the playback flag so it
  does not replay on the next visit.
- Q: Which pages show the intro? → A: **Landing only** (`/`). Legal overlay routes and
  direct legal URLs MUST NOT play the intro. Returning to `/` after the flag is set MUST
  NOT replay it.
- Q: What happens under `prefers-reduced-motion`? → A: **No intro animation.** The
  landing stage appears immediately, same as a return visit.
- Q: How can the artist preview the intro again? → A: Load the landing with a documented
  demo query (e.g. `?replay-intro`) that bypasses the playback flag for that page load
  only; the flag is not cleared permanently.

### Session 2026-08-22 (visual design)

- Q: How is the greeting laid out? → A: Two lines — lead text on the first line (default
  **“Hi I'm”**), artist name on its **own second line** (default **“Valence”**). Reads as
  “Hi I'm Valence” but the name is always visually separated.
- Q: How should the name line look? → A: **Transparent letterforms** — the live landing
  (atmosphere and stage behind) MUST remain visible **through** the name text during the
  intro, not hidden behind an opaque fill.
- Q: What does the zoom animate? → A: The **zoom targets the name line only** (e.g.
  “Valence”), as if the camera moves into that word; the lead line uses a subtler entrance
  and does not share the same zoom scale.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-time visitor gets a short branded greeting (Priority: P1)

A first-time visitor opens the landing URL. Before the stage HUD is fully interactive, they
see a short, centered two-line greeting: **“Hi I'm”** on the first line and **“Valence”**
on the second. The name is rendered as transparent letterforms so the atmosphere and landing
stage remain visible through the word. A zoom motion moves **into the name line**, then the
greeting eases away while the normal landing chrome (identity, socials, jukebox, panels,
mute, legal footer) becomes fully interactive. The hand-off feels intentional — not a hard
cut or a blank flash.

**Why this priority**: The greeting is the entire product intent of this feature. Without
the zoom-and-reveal moment, there is nothing distinct to ship.

**Independent Test**: Open the landing in a fresh browser profile with motion allowed;
confirm the greeting plays once, then the stage is fully usable.

**Acceptance Scenarios**:

1. **Given** a first visit with motion allowed and no playback flag set, **When** the
   landing loads, **Then** the two-line greeting appears with the name on its own line,
   transparent so the site behind shows through, and the **name line** zooms before the
   stage chrome is fully interactive.
2. **Given** the intro is playing, **When** the visitor looks at the name line, **Then**
   they can see the atmosphere/stage through the transparent “Valence” letterforms (not an
   opaque text block).
3. **Given** the intro animation is running, **When** it completes without user skip,
   **Then** the landing stage matches the normal post-intro layout (same HUD regions as
   today) and all in-scope controls are usable.
4. **Given** the intro has completed, **When** the visitor uses jukebox, panels, socials,
   mute, or legal links, **Then** existing feature behavior is unchanged (004/002/003
   rules still apply).
5. **Given** the intro is playing, **When** the visitor waits for the auto sequence,
   **Then** total intro duration stays short (target roughly 2–4 seconds excluding any
   optional fade overlap with the reveal).

---

### User Story 2 - Return visitors and skippers are not blocked (Priority: P1)

A returning visitor (or anyone who skips) should reach the usable landing quickly. The
intro MUST NOT replay on every load. Skip MUST be available during the intro so impatient
visitors are never trapped.

**Why this priority**: A replay-every-time intro would harm repeat fans and violates the
project’s lightweight, usable-by-default bar.

**Independent Test**: Complete or skip the intro once, reload `/`, confirm no replay; during
a fresh intro, press Escape and confirm immediate reveal.

**Acceptance Scenarios**:

1. **Given** the intro has completed or been skipped once in this browser, **When** the
   visitor reloads `/`, **Then** the landing appears immediately with no intro overlay.
2. **Given** the intro is playing, **When** the visitor presses Escape or clicks/taps
   anywhere on the intro layer, **Then** the intro ends immediately, the stage is revealed,
   and a later reload does not replay the intro.
3. **Given** scripting is unavailable or fails, **When** the landing loads, **Then** the
   visitor sees the normal landing content with no broken overlay and can use legal links
   and primary navigation patterns that work without scripting today.
4. **Given** the visitor opens a legal URL directly (not via the landing first), **When**
   the page loads, **Then** no landing intro runs on that route.

---

### User Story 3 - Reduced motion and demo replay (Priority: P2)

Visitors who prefer reduced motion, and maintainers who need to demo the intro, get
predictable behavior without changing production copy.

**Why this priority**: Accessibility and demo-ability are required for a motion feature on
a public artist site, but the core greeting still delivers value without these paths.

**Independent Test**: Enable reduced motion → no intro; clear storage → load with demo
query → intro plays once for that load.

**Acceptance Scenarios**:

1. **Given** `prefers-reduced-motion: reduce` is active, **When** a first-time visitor
   loads `/`, **Then** no intro animation plays and the landing stage is shown immediately.
2. **Given** a playback flag is already set, **When** the visitor loads `/` with the
   documented demo replay query, **Then** the intro plays for that load only and the
   playback flag behavior after completion/skip matches a normal first visit (flag set
   again unless already set — demo query only bypasses read, not write semantics: after
   demo intro completes, flag remains set).
3. **Given** reduced motion is active, **When** the visitor loads `/` with the demo replay
   query, **Then** reduced motion still wins (no forced animation).

---

### User Story 4 - Greeting copy is content-editable (Priority: P2)

The artist or editor can change the lead line and name line separately in the same
content-editing workflow as other visitor-facing strings, without editing layout or program
files.

**Why this priority**: Constitution Principle III requires one-place content updates for
all visitor-facing copy.

**Independent Test**: Change greeting strings in the UI chrome content file, rebuild or
refresh dev preview, confirm new text appears in the intro.

**Acceptance Scenarios**:

1. **Given** the intro lead or name fields are updated in the designated content file,
   **When** the site is published, **Then** the intro shows the new two-line greeting.
2. **Given** the name field is empty, **When** the landing loads for a first visit,
   **Then** the intro is skipped gracefully (landing shows immediately; no blank overlay).

---

### Edge Cases

- Playback flag storage is blocked (private mode quirks, quota): intro MAY replay on later
  visits but MUST still be skippable; site MUST remain usable.
- Very slow devices: intro MUST still be skippable; auto sequence MUST NOT block legal
  reachability indefinitely (cap duration; skip always works).
- Intro playing while background video loads: poster/atmosphere fallback MUST remain visible
  behind and **through** the transparent name line; no white flash.
- Very long name or lead strings: layout MUST wrap or scale without horizontal scroll from
  320px; transparent name treatment MUST still read clearly.
- Visitor navigates away mid-intro and returns to `/` in the same session before flag write:
  behavior MUST be safe (either replay once or respect partial completion — implementation
  chooses, but MUST NOT leave a permanent blocking overlay).
- Demo replay query combined with skip: skip still sets playback flag; subsequent load
  without query does not replay.
- Landing with `seo.indexable` or pre-release placeholders: intro behavior is unchanged;
  intro is not a substitute for real content or legal pages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST play a short intro sequence on first visit per browser
  when motion is allowed and scripting is available.
- **FR-002**: Default greeting MUST be two content lines — lead **“Hi I'm”** and name
  **“Valence”** on its own line — until changed in content.
- **FR-003**: Intro lead and name copy MUST live in structured content (the existing UI
  chrome content collection), not hard-coded in components.
- **FR-003a**: The name line MUST render as **transparent letterforms** so the landing
  atmosphere and stage content behind remain visible through the text during the intro
  (outline, stroke, or cut-out treatment — not an opaque fill blocking the view).
- **FR-003b**: The primary **zoom** motion MUST apply to the **name line only**; the lead
  line MUST NOT receive the same zoom scale (it MAY use a separate, subtler entrance).
- **FR-004**: After the intro completes or is skipped, the site MUST record a first-party
  playback flag in browser storage so `/` does not replay the intro on later visits.
- **FR-005**: The playback flag MUST NOT collect personal data, MUST NOT be used for
  analytics, and MUST NOT use cookies; privacy policy updates for storage use are deferred
  to IDEA-009 but the flag MUST be documentable as a UX preference only.
- **FR-006**: During the intro, the visitor MUST be able to skip immediately via Escape or
  click/tap on the intro layer.
- **FR-007**: Skip and natural completion MUST both set the playback flag.
- **FR-008**: Under `prefers-reduced-motion: reduce`, the intro MUST NOT run; the landing
  MUST appear immediately.
- **FR-009**: Without scripting, the landing MUST render as it does today with no intro
  overlay blocking content or legal footer links.
- **FR-010**: The intro MUST run only on the landing route, not on legal pages or overlays
  loaded directly.
- **FR-011**: A documented demo replay query parameter MUST allow maintainers to force one
  intro playback for a single load when testing (bypass read of playback flag only).
- **FR-012**: The reveal MUST expose the existing stage HUD layout unchanged in structure
  (identity, socials, jukebox, panels, mute, footer/legal).
- **FR-013**: Intro motion MUST NOT trap keyboard focus away from an eventual skip path;
  Escape MUST work during the intro when scripting is available.
- **FR-014**: Intro duration (auto path) MUST stay within roughly 2–4 seconds before the
  stage is fully revealed, excluding optional cross-fade overlap.
- **FR-015**: If the name line is missing or empty after trim, the intro MUST be omitted
  and the landing MUST load normally.
- **FR-016**: This feature MUST NOT add third-party scripts, embeds, or tracking pixels.
- **FR-017**: This feature MUST NOT play intro audio; background atmosphere audio rules
  from 002 remain unchanged (muted until user unmutes after reveal).

### Key Entities

- **Intro lead line**: First-line greeting text (e.g. “Hi I'm”) from UI chrome content.
- **Intro name line**: Second-line artist name (e.g. “Valence”); transparent treatment;
  zoom target; empty → no intro.
- **Playback flag**: First-party browser-storage marker meaning “intro already seen/skipped
  in this browser”; boolean or equivalent; not shared across devices.
- **Demo replay override**: Ephemeral URL signal that ignores the playback flag for one
  landing load; documented for maintainers in README/quickstart.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a fresh browser profile with motion allowed, 100% of first `/` loads show
  the two-line greeting with transparent name and name-only zoom before full HUD interaction
  (unless the name line is empty).
- **SC-001a**: During the intro, 100% of testers can confirm the site/atmosphere is visible
  through the transparent name letterforms.
- **SC-002**: After intro completion or skip, 100% of subsequent `/` reloads in the same
  browser skip the intro (when storage is available).
- **SC-003**: Skip via Escape or click/tap ends the intro in under 300 ms perceived delay.
- **SC-004**: With `prefers-reduced-motion: reduce`, 100% of `/` loads show no intro
  animation.
- **SC-005**: With scripting disabled, the landing remains usable and legal links remain
  reachable without an blocking overlay (same as pre-feature baseline).
- **SC-006**: A non-programmer can change lead and name text in one content file and see the
  update on the next publish without touching components.
- **SC-007**: Auto intro path completes and reveals the stage within 4 seconds on a typical
  mobile connection after first paint (excluding background video buffer).

## Assumptions

- The landing stage from `004-landing-content-layout` remains the post-intro target; intro
  is an overlay/sequence on top, not a layout redesign.
- Typography uses the existing site fonts (Unbounded / system stack); Seravek (IDEA-007) is
  out of scope.
- The atmospheric background (video or poster) and stage behind the greeting remain visible
  **through** the transparent name line; the name zoom is the focal motion.
- `localStorage` (or equivalent first-party persistent storage) is acceptable for the
  playback flag per IDEA-011 notes and constitution V (UX preference, not tracking).
- Jukebox selection is still not persisted across reloads (004 rule unchanged); only intro
  playback uses storage.
- Logo-based loader (IDEA-008) remains separate; this intro is not a asset-loading progress
  bar.

## Dependencies

- **001-website-skeleton** — base layout, footer, legal routes.
- **002-themed-background-video** — atmosphere layer visible during intro.
- **004-landing-content-layout** — stage HUD revealed after intro.
- **003-ui-glitch** — unchanged; glitch applies only after reveal when Nightmare is active.

## Out of Scope

- Intro on legal routes or site-wide on every page.
- Seravek or primary typeface change (IDEA-007).
- Logo-as-progress loader while assets fetch (IDEA-008).
- Dedicated mobile HUD redesign (IDEA-013).
- Intro sound effects or voice-over.
- Visitor accounts, cross-device sync of “seen intro”, or analytics on completion rates.
- Permanent “reset intro” UI for visitors (maintainers use demo query or clear storage).
- Changing jukebox default-on-reload behavior (004).
