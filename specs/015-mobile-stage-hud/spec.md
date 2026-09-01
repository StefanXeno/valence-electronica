# Feature Specification: Mobile Stage HUD

**Feature Branch**: `015-mobile-stage-hud`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "On mobile, put a horizontal bar at the bottom.
Swiping that bar up shows V-Flip (theme selector), shuffle, and a volume
toggle (mute only — hardware volume covers loudness). Above it, another
horizontal bar holds About me, discography, and the other on-demand buttons,
plus a matching button that flips up a second bar of social media links so
the page looks cleaner. Swiping the player bar down shows the current track
name. Box the middle icon cluster like the V-Flip box; box the socials the
same way. The socials trigger must look like the other dock buttons, not a
standalone chevron — replace the arrow with a socials-fitting icon. Owner
mockup: docs/mockups/mobile-stage-hud.jpg. Promote IDEA-013."

## Design Direction *(owner mockup 2026-09-01)*

Today’s landing HUD (`009` / `011`) is a **laptop stage**: identity and socials
on the top edge, V-Flip in one boxed cluster, on-demand panels in another. On a
phone those corners collide. This feature invents a **different phone
composition**, not a smaller copy of the laptop layout.

Visual annex: `docs/mockups/mobile-stage-hud.jpg`.

**Composition on small screens** (viewport width **below 1024px**; CSS
`@media (max-width: 1023px)`):

| Layer | Rest state | Interaction |
| ----- | ---------- | ----------- |
| **Player dock — collapsed (closed)** | Default rest. Same boxed pill: **left** five-line soundwave, **center** the V-Flip list **label**, **right** mute (when eligible). A **small, wide arrow** sits on the **top edge** of the pill and points **up**. | Swipe **up**, or activate the arrow, **expands** the pill (the arrow travels with the bar). Mute on/off only — **no loudness slider**. |
| **Player dock — expanded (opened)** | The pill **moves up**. Arrow stays on the **top** of the bar and now points **down**. Visitor sees **V-Flip**, **shuffle**, and **loop**. Collapsed now-playing row (soundwave / name / mute) MAY remain as the bottom of the same pill. | Swipe **down**, or activate the arrow, **collapses** the pill. Activating **V-Flip** (vinyl) opens the theme / track **list**. |
| **Dock handle (arrow)** | Always the same slot: top of the player pill, small but wide. Points **up** when collapsed, **down** when expanded. Moves with the bar as it expands or collapses. | After the landing is ready (intro dismissed if any), the arrow **smoothly moves up and down 3 times**, then repeats that **every 60 seconds** (hint that the pill can move). Reduced motion: no idle bounce; the arrow still toggles the pill. |
| **Content dock** (above the player dock) | One **box** containing four matching circular buttons: **About me**, **Discography**, **Tour**, and a **socials trigger**. | Opening About / Discography / Tour **raises a sheet from this dock** (same family as the socials tray). The socials button looks like the other three (same size and chrome) — **not** an oversized standalone chevron. |
| **Socials tray** (above the content dock when open) | Hidden at rest. | Activating the socials trigger **flips a boxed row of platform icons** up above the content dock. Closing it returns to the content dock. No new page. |
| **Identity** | Compact name / mark at the **top** — not in the bottom stack. | Unchanged role: the visitor still knows whose stage this is. |
| **Legal** | Copyright, Impressum, and Datenschutzerklärung stay reachable on the landing. | Cluster is placed so it **does not collide** with the bottom docks (above them or a compact row). Same in-page legal overlay as today. |

**Visual language**: dark rounded boxes / pills, circular icon buttons, accent
ring for on/pressed (for example shuffle). Icon-first. Center stage stays
atmosphere. No extra routes.

**Desktop / typical laptop** (**1024px and up**): HUD from `009` / `011`
**does not change**, including the volume slider inside the V-Flip box when
unmuted. Visual review target for that HUD remains ~1280×800.

## Clarifications

### Session 2026-09-01

- Q: When someone swipes down on the player bar, how should the current track
  name show up? → A: **Dedicated now-playing layout on that same bar** (not a
  fourth-icon rest state). **Left:** a small **soundwave** of **five vertical
  lines** (animated when motion is allowed). **Center:** the **track name /
  V-Flip theme name**. **Right:** **mute / unmute** stays in the bottom-right
  of the bar. Shuffle and loop are **not** in this collapsed row; they
  appear when the pill is **expanded** (see next Q).
- Q: After that now-playing bar is up, how do people get shuffle and loop
  back — including if they cannot swipe? → A: **Handle arrow on the top of
  the player pill.** Small but wide; **always** the same slot on the top of
  the bar; travels **with** the bar as it moves. **Collapsed (closed):**
  arrow points **up**; now-playing row is what you see. **Expanded (opened):**
  the pill moves **up**, arrow points **down**, and **V-Flip, shuffle, and
  loop** are visible. Swipe up / tap arrow expands; swipe down / tap arrow
  collapses. After the site is opened (landing ready), the arrow **smoothly
  moves up and down 3 times**, repeating **every 60 seconds**. Activating
  vinyl in the expanded pill still opens the V-Flip **list**.

### Session 2026-09-02

- Q: On how wide a screen should this phone HUD replace the laptop layout?
  → A: **Phone HUD below 1024px. Laptop HUD (`009` / `011`) from 1024px up.**
  No third tablet-only layout.
- Q: When someone taps About, Discography, or Tour on a phone, how should
  that content show up? → A: **A sheet rises from the content dock** (same
  family as the socials tray). Exclusive with the V-Flip list and socials.
  Docks stay. No new page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The phone stage feels open and clean (Priority: P1)

A visitor opens the landing on a phone. The atmosphere fills the view. Controls
live in a short stack of boxed bars at the bottom, not in four colliding
corners. The center stays free. Social links are not a permanent top row.

**Why this priority**: The whole feature exists so the phone stage stops looking
cramped. If this composition fails, the rest is decoration.

**Independent Test**: Load the landing on a phone-width viewport (~390×844 or
320×568) with all trays and panels closed. Confirm a free center, a boxed
player dock at the bottom, a boxed content dock above it, no permanent socials
row, and no horizontal scroll. Full collapsed-pill anatomy (handle +
now-playing row) is User Story 2; this story only requires the **stack**.

**Acceptance Scenarios**:

1. **Given** the landing loads on a phone-width viewport with all panels and
   trays closed, **When** the visitor scans the page, **Then** the center of
   the view is atmosphere only (no persistent panel bodies or socials row).
2. **Given** that rest state, **When** the visitor looks at the bottom edge,
   **Then** they see a boxed player dock and, above it, a boxed content
   dock — not free-floating icons in the corners. (Collapsed now-playing
   row + upward handle is User Story 2.)
3. **Given** a 320px-wide viewport, **When** the page loads, **Then** there is
   no horizontal scrolling and every control in the two docks remains reachable.
4. **Given** the same page at **1024px** width or wider, **When** the visitor
   looks at the HUD, **Then** the existing `009` / `011` laptop composition is
   still what they get (this story does not restyle desktop).

---

### User Story 2 - Player dock: V-Flip, shuffle, loop, mute, swipe (Priority: P1)

A visitor uses the bottom boxed dock like a small player. At rest the pill is
**collapsed**: a five-line soundwave on the left, the **V-Flip list label**
in the middle, **mute** on the right (when the track can play
audio), and a **small wide arrow on top of the bar pointing up**. They swipe
**up** or tap that arrow and the pill **expands** (moves up): the arrow stays
on top of the bar and now points **down**, and they see **V-Flip, shuffle,
and loop**. They tap the vinyl to pick another theme/track. They tap mute to
silence or restore sound. They do **not** get a loudness slider — their phone
volume buttons already do that. After the page is ready, the arrow **nods
up and down three times every 60 seconds** so they notice the pill can move.

**Why this priority**: Playback and theme change are the stage’s main toy; they
must work on the first visit without hunting corners.

**Independent Test**: On a phone-width viewport, confirm collapsed now-playing
+ up arrow; expand via swipe or arrow; use V-Flip / shuffle / loop; collapse
via swipe or arrow; toggle mute without a slider; confirm the 3×/60s arrow
hint when motion is allowed; confirm reduced motion still toggles without
the hint.

**Acceptance Scenarios**:

1. **Given** the landing on a phone-width viewport and an audio-eligible track,
   **When** the visitor looks at the player dock at rest (collapsed), **Then**
   they see the now-playing row (soundwave, V-Flip list label, mute) and a
   **small wide arrow on the top of the pill pointing up**.
2. **Given** the active track is not audio-eligible, **When** the visitor looks
   at the collapsed dock, **Then** mute is hidden (same eligibility idea as
   `011`) and the soundwave + name still show.
3. **Given** the player dock is collapsed, **When** the visitor swipes **up**
   or activates the handle arrow, **Then** the pill **moves up** (expanded),
   the arrow still sits on the **top** of the bar and now points **down**, and
   **V-Flip, shuffle, and loop** are visible.
4. **Given** the player dock is expanded, **When** the visitor activates the
   V-Flip control, **Then** the V-Flip list (theme / track picker) opens and
   they can choose another entry.
5. **Given** the player dock is expanded, **When** the visitor swipes **down**
   or activates the handle arrow, **Then** the pill **collapses**, the arrow
   points **up** again, and shuffle / loop / vinyl are no longer the visible
   row (now-playing remains the collapsed face).
6. **Given** mute is visible, **When** the visitor activates it, **Then** sound
   toggles between muted and unmuted and **no loudness slider** appears —
   collapsed or expanded.
7. **Given** reduced motion, a keyboard, or a screen reader, **When** the
   visitor cannot or should not swipe, **Then** they can still expand and
   collapse via the handle arrow (or equivalent) and still open V-Flip.
8. **Given** shuffle or loop is on and the pill is expanded, **When** the
   visitor looks at that control, **Then** its on state is obvious (for
   example an accent ring), matching the existing player meaning from `011`.
9. **Given** motion is allowed and the landing is ready (intro dismissed if
   any), **When** the visitor watches the collapsed handle without touching
   it, **Then** the arrow **smoothly moves up and down 3 times**, and that
   hint **repeats every 60 seconds**. With reduced motion the hint does
   **not** play.

---

### User Story 3 - Content dock is one boxed cluster (Priority: P1)

A visitor wants About, Discography, or Tour. Those three sit in **one box**
with a fourth matching button for socials. The socials button is the same kind
of circular icon as the others — not a giant arrow sitting outside the box.

**Why this priority**: This is what makes the middle of the mockup feel like
the same stage language as V-Flip, not a second UI kit.

**Independent Test**: On a phone-width viewport, confirm one box with four
equal circular buttons; open About, Discography, and Tour as **sheets from
that dock**; confirm content still appears without a new page.

**Acceptance Scenarios**:

1. **Given** the landing on a phone-width viewport at rest, **When** the
   visitor looks above the player dock, **Then** About, Discography, Tour, and
   the socials trigger sit together in **one box**.
2. **Given** that box, **When** the visitor compares the four buttons, **Then**
   they share the same circular size and chrome (the socials trigger is not a
   larger standalone chevron).
3. **Given** About content exists, **When** the visitor activates About, **Then**
   the bio appears in a dismissible **sheet that rises from the content dock**
   (not a new site page, not a leftover laptop side panel).
4. **Given** no About content, **When** the page loads, **Then** the About
   control is hidden (same rule as `004`) and the remaining buttons stay in
   the box.
5. **Given** Discography or Tour, **When** the visitor opens that control,
   **Then** the existing catalog / dates content is reachable in a sheet from
   the content dock and scrolls inside the sheet if it is long.
6. **Given** a chrome label for a dock control is edited in content, **When**
   the site is rebuilt, **Then** the accessible name / hint matches the new
   text without a layout rewrite.

---

### User Story 4 - Socials tray flips up on demand (Priority: P2)

A visitor who wants Bandcamp, Spotify, and the other platforms taps the
socials button. A **boxed** row of platform icons flips up **above** the
content dock. They follow a link or close the tray and the stage is clean
again.

**Why this priority**: Hiding socials until asked is the cleanliness win;
playback and About/Discography/Tour must work even if this tray shipped later,
but the mockup is incomplete without it.

**Independent Test**: Closed at rest; open from the socials button; platforms
in a box above the content dock; close without leaving the landing; outbound
links still open as they do today.

**Acceptance Scenarios**:

1. **Given** the landing on a phone-width viewport at rest, **When** the
   visitor looks at the HUD, **Then** platform icons are **not** a permanent
   bar.
2. **Given** the content dock is visible, **When** the visitor activates the
   socials trigger, **Then** a boxed row of the existing channels appears
   **above** the content dock.
3. **Given** the socials tray is open, **When** the visitor activates a live
   platform, **Then** they follow that outbound link (new tab, as today).
4. **Given** the socials tray is open, **When** the visitor closes it (same
   button again, or an equivalent dismiss), **Then** the tray goes away and
   they are still on the landing.
5. **Given** a channel is marked coming-soon / without a real URL, **When**
   the tray is open, **Then** that item is not a dead link (hidden or clearly
   not followable — same rule as today’s channels).

---

### User Story 5 - One open sheet at a time; the rest of the site still works (Priority: P2)

On a phone, opening About, Discography, Tour, V-Flip’s list, or the socials
tray **closes the others**. Expanding or collapsing the player pill is **not**
a sheet — now-playing stays the collapsed face of the dock. The visitor is
never buried under stacked sheets. Identity stays at the top. Legal stays
reachable. Intro still hides chrome until dismissed. Shuffle, loop, and track
picking keep the meaning they already have on desktop. A laptop visit is
unchanged.

**Why this priority**: Small screens cannot copy the laptop habit of V-Flip
open plus About open at once.

**Independent Test**: Open each mobile sheet in turn and confirm the previous
one closes. Check identity, legal overlay, intro hide/show, discography
“play on V-Flip”, and a laptop-width screenshot that still matches `009` /
`011`.

**Acceptance Scenarios**:

1. **Given** scripting is available on a phone-width viewport, **When** the
   visitor opens one of: About, Discography, Tour, V-Flip list, or socials
   tray, **Then** at most that one extra surface stays open. Expanding the
   player pill does not count as that extra surface.
2. **Given** the landing on a phone-width viewport, **When** the visitor looks
   at the top, **Then** the artist identity mark is still there (not moved
   into the bottom stack).
3. **Given** the landing on a phone-width viewport, **When** the visitor
   wants Impressum or Datenschutzerklärung, **Then** those links are visible
   without being covered by the docks, and they still open the existing
   in-page legal overlay.
4. **Given** the intro is showing, **When** the visitor has not dismissed it,
   **Then** the mobile docks stay hidden the same way today’s chrome does.
5. **Given** a viewport **1024px** wide or wider, **When** the visitor uses
   V-Flip, **Then** unmute may still reveal a loudness slider inside the
   V-Flip box (`011` unchanged).
6. **Given** a discography row with a stage action, **When** the visitor
   uses it on a phone, **Then** the stage still switches to that track.

---

### Edge Cases

- **320px width / short landscape**: All dock buttons remain tappable; no
  horizontal page scroll; long panel copy scrolls inside the sheet.
- **Very long track names**: Center now-playing text truncates with an ellipsis;
  the full **V-Flip list label** remains available to assistive tech.
- **Soundwave / reduced motion**: Five vertical lines remain visible. When
  motion is allowed they animate as a small soundwave. When reduced motion is
  preferred they stay **static** (no looping bar dance).
- **Handle hint / reduced motion**: The 3-nod / 60-second arrow bounce MUST
  NOT run when reduced motion is preferred. The arrow still expands and
  collapses the pill.
- **Handle hint while expanded**: The idle nod is for the **collapsed** pill
  (it teaches “this moves up”). It MUST NOT keep bouncing while the pill is
  expanded. After collapse, the 60-second cadence may resume.
- **Intro still showing**: Handle hint does not run until intro is dismissed
  (chrome is hidden anyway).
- **No audio / fallback**: Mute stays hidden when ineligible (`011`);
  shuffle and loop still work once the pill is expanded; collapsed now-playing
  still names the active atmosphere entry.
- **Single jukebox entry**: V-Flip still opens; shuffle does not invent a
  second track.
- **Missing About**: About button omitted; three remaining content-dock
  controls stay boxed.
- **Empty discography or tour**: Control remains; empty-state copy from
  existing chrome still appears inside the sheet.
- **No scripting**: Docks and native disclosure still reveal content; swipe
  gestures and the 60-second handle hint do not run; exclusive-open is not
  guaranteed; mute/shuffle/loop visit toggles do not run (same degradation
  family as `011`). The handle arrow SHOULD still expand/collapse if it can
  be implemented as a native control; if not, V-Flip / shuffle / loop MUST
  remain reachable without swipe (visible controls, even if always expanded).
- **Reduced motion**: Tray / panel motion does not require travel animation;
  swipe is never the only path; handle hint does not play.
- **Legal overlay open**: Docks may sit under the overlay; they are not
  required to stay usable through it (same as `011`).
- **Glitch theme**: Dock buttons keep existing glitch treatments; the full
  control hit area stays clickable (`009`).
- **Many social channels**: Tray may wrap or scroll **inside its box**; it
  must not force the page to scroll sideways.
- **Tablet / in-between widths**: Viewport **below 1024px** uses this phone
  HUD (typical tablet portrait). **1024px and up** uses `009` / `011` (typical
  tablet landscape and laptops). No third layout.
- **Visitor muted**: Mute toggle still works; no slider on phone.
- **Hardware volume**: Out of scope for the page; the site does not fight
  the device volume buttons.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the viewport width is **below 1024px**, the landing MUST
  use a dedicated bottom-stacked HUD (player dock + content dock + on-demand
  socials tray). It MUST NOT be a scaled-down copy of the laptop corner
  layout.
- **FR-002**: At rest on those viewports, the **player dock** MUST be one
  boxed pill in the **collapsed** position: now-playing row (soundwave, V-Flip
  list label, mute when eligible) plus a handle arrow on the **top** of the
  bar pointing **up**.
- **FR-003**: On those viewports, mute MUST be a **sound on / sound off**
  control. The page MUST NOT show a loudness slider. Mute MUST stay on the
  **right** of the now-playing row (when eligible). Desktop unmute-to-slider
  behavior from `011` MUST remain on viewports **1024px and up**.
- **FR-004**: Swiping **up** on the collapsed player dock, or activating the
  handle arrow, MUST **expand** the pill (it moves up). In the expanded
  position the visitor MUST see **V-Flip**, **shuffle**, and **loop**. The
  handle arrow MUST remain on the **top** of the bar and MUST point **down**.
  Activating the V-Flip (vinyl) control MUST open the theme / track **list**.
- **FR-005**: In the **collapsed** position the player dock MUST show a
  **now-playing** row with three zones: **left** a compact soundwave of
  **five vertical lines**; **center** the active V-Flip list **label** (the
  same visitor-facing string as that row in the list — never an internal
  theme id); **right** the **mute / unmute** control when audio-eligible.
  Shuffle and loop MUST NOT appear in the collapsed row. This MUST NOT
  open a new page.
- **FR-006**: Expand, collapse, and open-V-Flip MUST have a non-swipe path.
  The **handle arrow** is the primary non-swipe control for expand/collapse
  (keyboard and screen reader included). Activating vinyl still opens the
  V-Flip list. Swipe MUST NOT be the only path.
- **FR-006a**: The handle MUST be a **small, wide arrow** on the **top** of
  the player pill in a **fixed slot** on that bar (it does not jump to
  another chrome region). The tappable strip MUST be at least **44px**
  wide and **24px** tall. When the pill expands or collapses, the arrow
  MUST travel **with** the bar. Collapsed → points **up**. Expanded →
  points **down**.
- **FR-006b**: After the landing is ready (intro dismissed if any) and while
  the pill is **collapsed** and motion is allowed, the handle arrow MUST
  **smoothly move up and down 3 times**, then repeat that hint **every 60
  seconds**. Reduced motion MUST disable this idle hint. Expanding the pill
  MUST stop the hint.
- **FR-007**: At rest on those viewports, the **content dock** MUST be one
  box containing About (if content exists), Discography, Tour, and the
  socials trigger as **matching circular buttons**.
- **FR-008**: The socials trigger MUST use a socials-fitting icon (not an
  up-arrow / chevron). Exact glyph MAY be chosen at plan time. Its label
  MUST stay editable in chrome content (existing socials wording).
- **FR-009**: Activating the socials trigger MUST flip a **boxed** row of
  existing channel / platform icons **up above** the content dock. The tray
  MUST be closed at rest and MUST NOT navigate to a new site page.
- **FR-010**: Socials in the tray MUST reuse the existing channel list
  (active vs coming-soon). This feature MUST NOT require new platforms
  (IDEA-005 remains separate).
- **FR-011**: When scripting is available and viewport width is **below
  1024px**, at most **one** of these extra surfaces MAY be open: About,
  Discography, Tour, V-Flip list, socials tray. Opening one MUST close the
  others. Expanding or collapsing the player pill MUST NOT count as one of
  those surfaces. (On **1024px and up**, exclusive-open among on-demand
  panels, and V-Flip staying independently open, MUST NOT be changed.)
- **FR-012**: Below 1024px, About, Discography, and Tour MUST open as a
  **sheet that rises from the content dock** (same family as the socials
  tray). The V-Flip **list** MUST open as a sheet from the **player dock**.
  Open sheets MUST NOT become a new route; long content MUST scroll inside
  the sheet; the atmosphere MUST remain the stage; the docks MUST stay on
  screen. This MUST NOT reuse the laptop side-panel composition as-is.
- **FR-013**: Artist identity MUST remain a compact mark on the **top**
  edge when viewport width is **below 1024px**. It MUST NOT move into the
  bottom stack.
- **FR-014**: Copyright, Impressum, and Datenschutzerklärung MUST remain
  reachable from the landing when viewport width is **below 1024px** without
  being covered by the docks. Legal link behavior MUST stay compatible with
  the existing in-page overlay.
- **FR-015**: Viewports **1024px wide and up** MUST keep the `009` / `011`
  HUD (placement, hover labels, V-Flip box with optional volume slider).
- **FR-016**: Shuffle, loop, track picking, mute eligibility, intro hide /
  show, discography stage action, and visit-only shuffle/loop defaults MUST
  keep their existing meaning. This feature relocates and restyles those
  controls on viewports below 1024px; it MUST NOT redefine playback rules.
- **FR-017**: Visitor-facing labels, the socials-trigger name, and the handle
  arrow’s accessible name (expand / collapse) MUST remain editable in chrome
  / content files without layout code changes (constitution III).
- **FR-018**: If artist-visible HUD surfaces change, artist-facing
  documentation MUST be updated in the same change set (constitution VII).
- **FR-019**: The landing MUST remain usable from 320px width with no
  horizontal scrolling. Visual success for **this** feature **is** the phone
  composition (unlike `004` / `009` / `011`, which deferred that bar).
- **FR-020**: This feature MUST NOT add third-party embeds, analytics,
  cookies, or new site routes.
- **FR-021**: New client-side behavior (gestures, exclusive sheets, handle
  hint) MUST be justified in the plan under constitution IV; when scripting
  is unavailable, content MUST still be reachable through visible controls.
- **FR-022**: Reduced motion MUST NOT require swipe or travel animation to
  complete expand/collapse, open V-Flip, or open socials (FR-004, FR-005,
  FR-006, FR-009). The 3×/60s handle hint MUST NOT run under reduced motion.

### Key Entities

- **Player dock**: Bottom boxed pill with two positions — **collapsed**
  (now-playing row + up arrow) and **expanded** (pill moved up; V-Flip,
  shuffle, loop visible; down arrow). Swipe and the handle toggle position.
- **Dock handle**: Small wide arrow fixed to the **top** of the player pill.
  Points up when collapsed, down when expanded. Travels with the bar. Idle
  hint: 3 smooth up/down nods every 60 seconds while collapsed (motion
  allowed).
- **Content sheet**: On-demand surface that **rises from the content dock**
  for About, Discography, or Tour (below 1024px). Same exclusive-open family
  as the socials tray and the V-Flip list.
- **Socials tray**: On-demand boxed row of platform icons that appears above
  the content dock.
- **Now-playing row**: Collapsed face of the player dock. Left: five-line
  soundwave. Center: V-Flip list label. Right: mute (when eligible).
  Shuffle and loop are absent on this row.
- **Socials trigger**: Content-dock button that opens and closes the socials
  tray; same visual family as the other dock buttons.
- **Small / phone viewport**: Viewport **width below 1024px** (CSS
  `@media (max-width: 1023px)`). This HUD is the visual target there
  (phones and typical tablet portrait). **1024px and up** keeps the `009` /
  `011` HUD. Phone portrait (~390×844) remains the review target. There is
  no third layout.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a ~390×844 phone viewport with all sheets closed and the
  player pill collapsed, a reviewer can confirm in **one glance** that the
  center is free and chrome is two boxed docks at the bottom (now-playing
  player pill + content dock; no permanent socials bar, no four-corner
  laptop HUD).
- **SC-002**: 100% of first-visit playback tasks complete without a laptop:
  expand the pill, toggle mute (when shown), toggle shuffle, toggle loop,
  open V-Flip, pick another track — in under **30 seconds** of focused
  trying.
- **SC-003**: 100% of testers who are asked “what is playing?” can read the
  **V-Flip list label** on the collapsed now-playing row within **10
  seconds** of the landing being ready (no extra swipe required).
- **SC-003a**: With motion allowed, a reviewer sees the handle arrow nod
  **3 times** after the landing is ready, and sees that hint again within
  **60 ± 5 seconds** while the pill stays collapsed. With reduced motion,
  **0** idle nods occur.
- **SC-004**: On a 320px-wide viewport, **0** pages exhibit horizontal
  scrolling and **0** dock buttons are clipped off-screen at rest.
- **SC-005**: With the socials tray closed, **0** platform icons appear as a
  persistent bar; with it open, every **active** channel from the site’s
  channel list is reachable in that boxed tray.
- **SC-006**: In scripted phone testing, opening a second sheet (About,
  Discography, Tour, V-Flip list, or socials) leaves **at most one** of
  those extra surfaces visible.
- **SC-007**: On a 1280×800 laptop viewport, a side-by-side check against
  current `009` / `011` behavior finds **0** intentional layout changes
  (volume slider still available after unmute). At **1023px** width the
  phone HUD is in effect; at **1024px** width the laptop HUD is in effect.
- **SC-008**: Keyboard-only visitors on a narrow viewport can: expand and
  collapse the player pill with the handle, open V-Flip, read the current
  track name, toggle mute/shuffle/loop when shown, open About or
  Discography, open and close socials, and reach legal links.
- **SC-009**: With reduced motion preferred, all primary tasks in SC-002,
  SC-003, and opening socials still complete **without** a swipe requirement.
- **SC-010**: No new third-party embeds, cookies, or tracking are introduced.

## Assumptions

- Owner mockup `docs/mockups/mobile-stage-hud.jpg` is the visual north star
  for the **expanded** player controls and the boxed content/socials clusters.
  The oversized standalone chevron in that sketch is **explicitly rejected
  as the socials trigger**. The **player handle** is a different control: a
  small wide arrow on the **top of the player pill** (not that mockup
  chevron). Socials trigger still matches the other content-dock buttons
  with a socials-fitting icon (share / connected-nodes or similar).
- Loop stays in the **expanded** player dock because it is already part of
  V-Flip (`011`) and appears in the mockup.
- Mobile volume is mute/unmute only; device hardware volume is the loudness
  control. This is an owner decision, not a platform limitation.
- Default rest is the **collapsed** pill (now-playing + up arrow), not the
  four-icon row. Expanding reveals V-Flip, shuffle, and loop. The now-playing
  row stays the collapsed face of the **same** bar — not a second page and
  not a permanent ticker elsewhere.
- v1 center now-playing copy is the **same visitor-facing string as the
  V-Flip list row** (the jukebox entry label). Do not show internal theme
  pack ids. A future optional theme display name that differs from that
  label MAY be joined as `{label} / {themeDisplayName}`. Until that field
  exists, show the label once.
- Handle idle hint: **3** smooth up/down motions, repeating **every 60
  seconds**, only while collapsed, only after intro (if any), only when
  motion is allowed. It is a discoverability nudge, not required to operate
  the pill.
- “Small / phone viewport” means **width below 1024px**, implemented as CSS
  `@media (max-width: 1023px)`. From **1024px** up, `009` / `011` remains.
  Phone portrait (~390×844) is the visual review target. No third
  tablet-only HUD.
- Identity stays a compact top mark; tagline rotation (`012`) MAY remain
  under that mark if it still fits — this feature does not redesign the
  wordmark.
- Legal footer stays on the landing; plan may tuck it above the docks or
  into a compact row so hit targets do not overlap (FR-014).
- Below 1024px, About / Discography / Tour are **content-dock sheets**, not
  laptop side panels. The V-Flip list is a **player-dock sheet** in the same
  exclusive family.
- Channel URLs already live in site data; this feature only **re-places**
  them into the tray. Completing or adding platforms is IDEA-005.
- Hover label-reveal from `009` is a laptop pattern. On touch, icon +
  accessible name is enough; a short focus/press hint MAY reuse chrome
  strings but MUST NOT depend on hover.
- Playback matrix, shuffle pool, loop-wins-over-shuffle, visit-only
  toggles, and mute eligibility stay as specified in `011`.
- Intro (`006`) continues to hide landing chrome until dismissed.
- Client-side scripting is required for swipe and exclusive sheets; the
  plan MUST justify that under constitution IV. No-JS visitors still get
  visible buttons and native disclosure where those already exist.

## Dependencies

- `004-landing-content-layout` — stage content, on-demand panels, channels.
- `009-desktop-stage-ui` — icon language, boxed clusters, glitch hit targets;
  remains the laptop HUD.
- `011-vflip-now-playing` — V-Flip toolbar meaning (vinyl, shuffle, loop,
  mute) and playback rules.
- `002-themed-background-video` — atmosphere, mute eligibility, legal overlay.
- `006-landing-intro` — chrome hidden during intro.
- `008-artist-docs` — artist guide update if HUD surfaces move.
- `010-track-catalog` / `014-discography-only-tracks` — track names and
  discography content reused, not redesigned.

## Out of Scope

- Desktop / typical laptop HUD redesign (`009` / `011` stay)
- Loudness slider on phone
- New platforms or channel URLs (IDEA-005)
- Media re-encode / poster pipeline (IDEA-015)
- New site routes or third-party players / embeds
- Changing shuffle/loop playback rules or scheduled default (`007`)
- Landing intro copy or motion (`006`)
- Seravek / primary typeface (IDEA-007)
- Remembering mute/shuffle/loop across visits
- A dedicated tablet-only third layout (below 1024px = this HUD; 1024px+ =
  laptop HUD)
