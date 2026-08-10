# Feature Specification: Themed Background Video

**Feature Branch**: `002-themed-background-video`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "Full-bleed background video on the artist landing page that
plays muted by default with a visitor-controlled unmute. The active clip drives a matching
visual theme. Short seamless loops, mobile-friendly file size, reduced-motion fallback.
Theme depth beyond basic color/surface mood is deferred (IDEA-002). Video switching,
scheduling, and per-video track info are out of scope."

## Clarifications

### Session 2026-08-10

- Q: When the landing page is not playing background video (reduced motion, load failure,
  or autoplay blocked), should the mute/unmute control still be available? → A: Hide or
  disable mute/unmute whenever background video is not playing.
- Q: Should the basic color/surface theme follow the configured default video’s identity
  even when only a static fallback is shown (reduced motion or playback failure)? → A:
  Theme always follows the configured default video identity (play or static fallback).
- Q: Should Impressum and privacy pages show the themed background video experience, or
  stay plain readable pages without background video? → A: Both open as a near-fullscreen
  panel (margins on all sides) over the landing atmosphere, with a smooth open animation
  and an exit control at the top.
- Q: If the playing background clip has no audio track, should the mute/unmute control
  still be shown? → A: Hide mute/unmute when the configured clip has no audio.
- Q: Should this feature keep the git branch name `ideas/themed-background-video`, or
  rename it to `002-themed-background-video` to match the constitution and spec folder? → A:
  Rename branch (and spec Feature Branch field) to `002-themed-background-video` now.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor experiences atmosphere through background motion (Priority: P1)

A visitor opens the Valence landing page and sees a full-bleed background video behind the
existing artist identity content. The clip loops quietly (muted) so the page feels like an
electronic-music world without surprising people with sound. Core content (name, tagline,
channels, legal links) remains readable over the video.

**Why this priority**: Atmosphere is the core value of this feature. Without a working
muted background experience there is nothing to build mute control or themes on.

**Independent Test**: Open the landing page on desktop and phone with motion allowed;
confirm a looping background video plays muted, content stays readable, and the page does
not require sound to be useful.

**Acceptance Scenarios**:

1. **Given** the site is published and the visitor's device allows motion, **When** they
   open the landing page, **Then** a full-bleed background video plays in a loop without
   audible sound.
2. **Given** the background video is playing, **When** the visitor reads the artist name,
   tagline, and channel section, **Then** all of that content remains readable against the
   video (contrast/overlays are sufficient).
3. **Given** a visitor is on a typical smartphone, **When** they open the landing page,
   **Then** the background experience does not block page use (layout remains usable;
   content is not covered by unusable controls).

---

### User Story 2 - Visitor can unmute and mute the background audio (Priority: P1)

When background video with audio is playing, a visitor who wants the full sensory
experience can turn sound on with an obvious control, and turn it off again. Sound never
starts without their action. After they unmute, they can mute again without reloading the
page. When background video is not playing, or the configured clip has no audio, the
mute/unmute control is hidden or disabled.

**Why this priority**: Autoplaying sound is hostile and often blocked by browsers; explicit
control is required for a respectful music-artist site.

**Independent Test**: Load the page (audio off), use the control to unmute and hear audio
if the clip has a soundtrack, then mute again; verify state is reflected in the control.

**Acceptance Scenarios**:

1. **Given** a first visit with no prior interaction, **When** the page loads, **Then**
   background audio is off.
2. **Given** a configured clip with audio is playing and muted, **When** the visitor
   activates the unmute control, **Then** background audio plays and the control indicates
   that sound is on.
3. **Given** a configured clip with audio is playing and sound is on, **When** the visitor
   activates the mute control, **Then** audio stops and the control indicates that sound is
   off.
4. **Given** a configured clip with audio is playing, **When** a keyboard or assistive-
   technology user focuses the mute/unmute control, **Then** it is reachable and its
   purpose is clear from its accessible name.

---

### User Story 3 - Default video sets a matching visual theme (Priority: P2)

The landing page's visual mood (colors and surface treatment) matches the configured
default background video's theme identity so video (or its static fallback) and UI feel
like one composition. Theme choice comes from content configuration tied to that video
identity, not from hard-coded one-off styling in the layout. The same theme applies when
the clip plays and when only the static/solid fallback is shown.

**Why this priority**: Theme binding is part of the product intent of IDEA-001, but a
muted looping video alone already delivers value; basic theme packs the atmosphere.

**Independent Test**: Configure (or inspect the shipped sample) a default video with a
bound theme and confirm the landing page's color/surface mood matches that theme both with
playback and with reduced-motion/static fallback.

**Acceptance Scenarios**:

1. **Given** the default video entry is configured with a theme identity, **When** a
   visitor opens the landing page (video playing or static fallback), **Then** the page
   presents the matching color/surface theme.
2. **Given** the operator changes which theme is bound to the default video in content
   data, **When** the site is rebuilt/published, **Then** the new theme appears without
   editing page structure.

---

### User Story 4 - Reduced-motion visitors get a calm static fallback (Priority: P2)

A visitor who prefers reduced motion does not get a forced looping video. They see a
still fallback (poster/static image equivalent) that preserves atmosphere without
continuous motion, and the rest of the page remains fully usable.

**Why this priority**: Accessibility and constitution require respecting reduced motion;
this must not be an afterthought.

**Independent Test**: Enable the OS/browser reduced-motion preference, reload the landing
page, and confirm no looping background video runs; a static visual fallback appears
instead.

**Acceptance Scenarios**:

1. **Given** the visitor has reduced motion preferred, **When** they open the landing
   page, **Then** no looping background video plays.
2. **Given** reduced motion is preferred, **When** the page is shown, **Then** a static
   visual tied to the configured background still conveys atmosphere and content remains
   readable.
3. **Given** reduced motion is preferred, **When** the visitor looks for mute/unmute,
   **Then** the control is hidden or disabled (not offered as an active control).

---

### User Story 5 - Visitor opens legal content in a dismissible panel (Priority: P2)

A visitor opens Impressum or the privacy policy and sees the legal content in a large panel
that covers nearly the whole viewport, with visible margin on all sides so the landing
atmosphere (themed background video or its static fallback) remains visible around the
panel. The panel appears with a smooth animation. An exit control at the top closes the
panel and returns the visitor to the landing content. Legal text inside the panel stays
readable and scrollable if long.

**Why this priority**: German sites must expose Impressum and privacy; presenting them as
an overlay keeps the atmospheric landing experience while making exit obvious.

**Independent Test**: From the landing page, open Impressum and privacy, confirm the
near-fullscreen panel with margins, top exit control, readable content, and successful
dismiss back to the landing page.

**Acceptance Scenarios**:

1. **Given** the landing page is open, **When** the visitor opens Impressum or privacy,
   **Then** a panel covers nearly the full viewport with space visible on all sides.
2. **Given** the legal panel is open, **When** motion is allowed, **Then** the panel
   appears with a smooth open animation.
3. **Given** the legal panel is open, **When** the visitor activates the top exit control,
   **Then** the panel closes and the landing page content is available again.
4. **Given** the legal panel is open, **When** the visitor reads the legal text, **Then**
   the text remains readable (and scrollable if it exceeds the panel height).

---

### Edge Cases

- Video asset missing or fails to load → page still shows artist content with a static
  fallback (or solid themed background); never a blank/broken hero; mute/unmute is hidden
  or disabled.
- Clip has no audio track → mute/unmute control is hidden or disabled; no error state.
- Very slow mobile connection → page content remains usable quickly; heavy video must not
  make the site feel broken if the clip is still buffering (content first).
- Autoplay blocked by the browser even when muted → show the static fallback; page remains
  usable; mute/unmute is hidden or disabled while video is not playing.
- Multiple videos exist in content data but this feature has no switcher → only the
  configured default video is shown.
- Legal panel open while video with audio plays → landing atmosphere may remain visible in
  the margins; legal content MUST NOT depend on video playback to be readable; focus MUST
  not be trapped in an unclosable state (exit always works); mute/unmute may sit under the
  panel and need not stay visible while the panel is open.
- Reduced motion preferred for the legal panel → skip or minimize the open/close
  animation; panel still opens and the exit control still works.
- Direct visit or refresh on a legal URL → visitor still reaches the same legal content and
  can exit back to the landing experience (no dead-end without exit).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST present a full-bleed background video behind the primary
  artist content when motion is allowed and the video can play.
- **FR-002**: Background video MUST loop seamlessly for short atmospheric clips and MUST
  start without audible sound.
- **FR-003**: While background video with audio is playing, visitors MUST be able to turn
  background audio on and off via an explicit control; audio MUST NOT start without that
  visitor action. When background video is not playing (reduced motion, load failure, or
  autoplay blocked), or when the configured clip has no audio, the mute/unmute control
  MUST be hidden or disabled.
- **FR-004**: When the mute/unmute control is available, it MUST be keyboard-accessible and
  MUST expose a clear accessible name reflecting the current action or state.
- **FR-005**: The configured default background video MUST be associated with a visual
  theme identity that adjusts the page's color and surface mood whenever that video is the
  default — including when its clip is playing and when only a static or solid fallback is
  shown.
- **FR-006**: Video identity, media references (including a still/poster fallback), theme
  binding, and which clip is the default MUST be maintainable in structured content/data —
  not hard-coded inside page layout.
- **FR-007**: When the visitor prefers reduced motion, the site MUST NOT play looping
  background video and MUST show a static visual fallback instead.
- **FR-008**: If the video cannot play (missing asset, load failure, or autoplay blocked),
  the site MUST fall back to a non-video presentation that keeps content readable.
- **FR-009**: Background video and its controls MUST NOT obscure or block access to
  primary content, channel links, or legal links on common phone and desktop widths.
- **FR-010**: Background media MUST be sized and delivered so an average mobile visit
  remains usable; clips SHOULD stay short (about 8–20 seconds) and lightweight rather than
  long-form files.
- **FR-011**: This feature MUST NOT require a visitor-facing video picker, schedule rules,
  deep per-theme typography/motion packs, or per-video track-info panels (those are
  separate future features).
- **FR-012**: Impressum and privacy MUST each open in a near-fullscreen content panel with
  visible margin on all sides over the landing atmosphere, MUST appear with a smooth
  animation when motion is allowed, and MUST provide an exit control at the top that
  dismisses the panel and returns the visitor to the landing experience.
- **FR-013**: Legal panel content MUST remain readable and scrollable independently of
  background video playback; when reduced motion is preferred, open/close animation MUST
  be skipped or minimized without removing exit.

### Key Entities

- **Background video**: A short looping atmospheric clip with identity (stable id), media
  references for playback, a still/poster fallback, optional audio (presence determines
  whether mute/unmute is offered), and a bound theme identity. One entry is the site
  default for this feature.
- **Visual theme (basic)**: A named mood bound to a background video identity and applied
  whenever that video is the configured default (playback or fallback); for this feature it
  covers color and surface treatment only (not full type/motion packs).
- **Legal panel**: Near-fullscreen overlay presentation for Impressum or privacy content,
  with margins revealing the landing atmosphere, top exit control, and motion-sensitive
  open/close behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a device with motion allowed and a working sample/configured clip, 100% of
  fresh landing-page loads start with background audio off.
- **SC-002**: When the configured clip includes audio, a first-time visitor can unmute and
  mute again within 10 seconds of noticing the control, without reloading the page.
- **SC-003**: With reduced motion preferred, 0 looping background videos play on the
  landing page; a static fallback is visible instead.
- **SC-004**: With video failing or blocked, visitors can still identify the artist and
  reach channel and legal links without a broken blank background.
- **SC-005**: On an average mobile connection, primary landing content remains usable
  within 2 seconds even if the background video is still loading.
- **SC-006**: Changing the default video or its bound basic theme requires editing content
  data in exactly one maintainable place (plus asset files), with no structural page rewrite.
- **SC-007**: At least 90% of testers agree the basic theme bound to the default video
  feels consistent with that clip's mood, including when only the static fallback is shown
  (small informal review is enough).
- **SC-008**: From the landing page, a visitor can open Impressum or privacy into the
  near-fullscreen panel and dismiss it via the top exit control in under 15 seconds on the
  first try.

## Assumptions

- This feature extends the existing published landing page from the website skeleton; it
  does not replace artist identity, channels, or legal content.
- Real final artist video assets may not be ready; shipping with a clearly temporary
  sample/placeholder clip and poster is acceptable until real media is provided.
- “Basic theme” in this feature means color and surface mood only. Richer per-video packs
  (typography, motion language, hover treatments) are a separate feature (IDEA-002).
- A visitor-facing switcher for multiple clips, calendar-based defaults, and per-video
  track info panels are separate features (IDEA-003, IDEA-004, IDEA-006) even if the data
  model can already name more than one video.
- Impressum and privacy remain reachable legal destinations; this feature changes their
  presentation to a dismissible near-fullscreen panel over the landing atmosphere rather
  than a separate plain full-page layout without that overlay pattern.
- Any client-side behavior required for playback/mute or the legal panel will be justified
  in the feature plan against the constitution's lightweight-by-default principle; the
  specification only requires the visitor-facing outcomes above.
- No new tracking, cookies, or third-party video embeds are introduced; media is first-party
  static assets for this feature.
