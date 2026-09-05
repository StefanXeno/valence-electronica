# Feature Specification: Mobile Stage HUD

**Feature Branch**: `015-mobile-stage-hud`

**Created**: 2026-09-01

**Status**: As-built (synced to code 2026-09-05)

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

## Design Direction *(as-built 2026-09-05)*

Today’s landing HUD (`009` / `011`) is a **laptop stage**: identity and socials
on the top edge, V-Flip in one boxed cluster, on-demand panels in another. On a
phone those corners collide. This feature ships a **different phone
composition**, not a smaller copy of the laptop layout.

The 2026-09-01 mock (`docs/mockups/mobile-stage-hud.jpg`) was the original
visual annex. Implementation drifted: there is **no detached socials tray**,
**no V-Flip vinyl button** and **no loop** on phone, **five** content-dock
icons (not four), and **legal lives in Info** (the landing footer is hidden).
This spec documents **what the code does**. The mock is historical.

**Composition on small screens** (viewport width **below 1024px**; CSS
`@media (max-width: 1023px)`):

| Layer | Rest state | Interaction |
| ----- | ---------- | ----------- |
| **Player dock — collapsed (closed)** | Floor-pinned pill (`bottom: 0`). **Left** five-line soundwave, **center** the active track / V-Flip list **label**, **right** mute. A **small, wide arrow** sits on the **top edge** and points **up**. | Tap the handle, or **drag** it up, **expands** the same pill (height grows from the floor; the chrome does not translate). Mute on/off only — **no loudness slider**. |
| **Player dock — expanded (opened)** | The pill **grows upward** from `bottom: 0` (capped). Arrow stays on the **top** and now points **down**. Opening the pill **is** opening V-Flip. Header reads **Currently playing** until playlist is on, then **V-Flip aka. Jukebox**. Transport: **shuffle**, **play/pause** (background video), **playlist**. **No vinyl control. No loop.** Collapsed now-playing row stays the floor of the same pill (`wave \| title \| mute`). | Tap the handle, or drag it down, **collapses** the pill (and closes V-Flip). Playlist toggles theme-track cards **inside** this sheet. |
| **Dock handle (arrow)** | Always the same slot: top of the player pill, small but wide. Points **up** when collapsed, **down** when expanded. Drag is capped (rubber-band past the open height, then snap). Tap and drag share the **same** open height. | After the landing is ready (intro dismissed if any), the arrow **smoothly nods 3 times**, then repeats that **every 60 seconds**, **including while expanded**. Reduced motion: no idle bounce; the arrow still toggles the pill. |
| **Content dock** | One **growing pill** with **five** matching circular icons: **About**, **Discography**, **Tour**, **Socials**, **Info** (circled i). Equal pad tokens (`--phone-bar-pad`, `--phone-open-pad`, `--phone-inline-pad`) plus body/tray gaps. Icons stay on the **bottom** of the pill. | Opening a control **morphs the same pill** (~320ms). Exclusive-open among the five. Click-outside closes the content sheet (not while the Legal overlay is open). |
| **Socials** | Hidden at rest. Channels are the **one** existing list, **parked inside** the content sheet (not a second bar floating above the dock). | Socials opens like About: the pill grows and the channel row appears in the sheet. Close returns to the icon bar. No new page. |
| **Identity** | Compact name / mark at the **top** — not in the bottom stack. | Unchanged role: the visitor still knows whose stage this is. |
| **Legal** | Phone landing **footer is hidden**. © sits **top-right** of the Info sheet header. **Imprint** and **Privacy Policy** are English HUD pills that open the existing Legal overlay (fullscreen). | Same overlay as laptop. German legal markdown titles stay on that overlay, not on the pills. |

**Visual language**: dark rounded boxes / pills, circular icon buttons, accent
ring for on/pressed (for example shuffle). Icon-first. Center stage stays
atmosphere. No extra routes. **No phone HUD hover tooltips** and no native
“pick a track” `title` on the now-playing label.

**Desktop / typical laptop** (**1024px and up**): HUD from `009` / `011`
**does not change**, including the volume slider inside the V-Flip box when
unmuted. Visual review target for that HUD remains ~1280×800.

## Clarifications

### Session 2026-09-01 *(historical — superseded where 2026-09-05 differs)*

- Q: When someone swipes down on the player bar, how should the current track
  name show up? → A: **Dedicated now-playing layout on that same bar** (not a
  fourth-icon rest state). **Left:** a small **soundwave** of **five vertical
  lines** (animated when motion is allowed). **Center:** the **track name /
  V-Flip theme name**. **Right:** **mute / unmute** stays in the bottom-right
  of the bar.
- Q: After that now-playing bar is up, how do people get shuffle and loop
  back — including if they cannot swipe? → A *(original)*: handle expands to
  V-Flip, shuffle, and loop. **As-built:** handle expand **is** V-Flip;
  transport is shuffle + play/pause + playlist; **loop is not on phone**.

### Session 2026-09-02 *(breakpoint still current)*

- Q: On how wide a screen should this phone HUD replace the laptop layout?
  → A: **Phone HUD below 1024px. Laptop HUD (`009` / `011`) from 1024px up.**
  No third tablet-only layout.
- Q: When someone taps About, Discography, or Tour on a phone, how should
  that content show up? → A *(original)*: a sheet rises from the content dock.
  **As-built:** the **content pill itself grows** (320ms morph). Socials and
  Info use the same pill. Not a detached sheet floating above a static bar.

### Session 2026-09-05 *(as-built — current)*

- **Content dock** is one growing pill, **five** icons, exclusive-open,
  320ms morph, icons on the floor of the pill. Socials channels live **in**
  the sheet. Click-outside closes the content sheet unless Legal overlay is
  open.
- **Info** is the phone legal home: © top-right; English **Imprint** /
  **Privacy Policy** pills → existing Legal overlay. Phone footer legal is
  **hidden**.
- **Player expand === V-Flip.** Handle tap and handle **drag** share open
  height. Pill is floor-pinned (`bottom: 0`); drag is capped.
- **No vinyl / no loop on phone.** Transport is shuffle + play/pause
  (background video) + playlist.
- **Mute** stays in the floor row even when the current track has
  `hasAudio: false` (as long as the mute control is mounted). Unmuted phone
  volume is **50%**. No slider.
- **Playlist** is theme / stage tracks inside the player (not the full
  discography catalog). Solo = the current card only. Playlist = that card
  stays; other cards add in. The list scrolls when playlist is open.
- **Pause** pauses the background video, flattens the soundwave, and holds
  the shuffle clock (no hop).
- Handle hint **3× / 60s including expanded**.
- No phone HUD hover tooltips / “pick a track” title.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The phone stage feels open and clean (Priority: P1)

A visitor opens the landing on a phone. The atmosphere fills the view. Controls
live in a short stack of boxed bars at the bottom, not in four colliding
corners. The center stays free. Social links are not a permanent top row.
Legal is not a permanent footer strip.

**Why this priority**: The whole feature exists so the phone stage stops looking
cramped. If this composition fails, the rest is decoration.

**Independent Test**: Load the landing on a phone-width viewport (~390×844 or
320×568) with all trays and panels closed. Confirm a free center, a boxed
player dock at the bottom, a boxed five-icon content dock above it, no
permanent socials row, no phone footer legal strip, and no horizontal scroll.
Full collapsed-pill anatomy (handle + now-playing row) is User Story 2; this
story only requires the **stack**.

**Acceptance Scenarios**:

1. **Given** the landing loads on a phone-width viewport with all panels and
   sheets closed, **When** the visitor scans the page, **Then** the center of
   the view is atmosphere only (no persistent panel bodies, socials row, or
   footer legal strip).
2. **Given** that rest state, **When** the visitor looks at the bottom edge,
   **Then** they see a boxed player dock and, above it, one boxed content
   dock with five icon slots (About if content exists, Discography, Tour,
   Socials, Info) — not free-floating icons in the corners. (Collapsed
   now-playing row + upward handle is User Story 2.)
3. **Given** a 320px-wide viewport, **When** the page loads, **Then** there is
   no horizontal scrolling and every control in the two docks remains reachable.
4. **Given** the same page at **1024px** width or wider, **When** the visitor
   looks at the HUD, **Then** the existing `009` / `011` laptop composition is
   still what they get (this story does not restyle desktop).

---

### User Story 2 - Player dock: V-Flip, shuffle, play/pause, playlist, mute (Priority: P1)

A visitor uses the bottom boxed dock like a small player. At rest the pill is
**collapsed**: a five-line soundwave on the left, the **V-Flip list label**
in the middle, **mute** on the right, and a **small wide arrow on top of the
bar pointing up**. They tap that arrow or **drag it up** and the pill
**expands** (grows from `bottom: 0`): the arrow stays on top and now points
**down**, and they are **in V-Flip**. They see the current theme-track card
under **Currently playing**, plus **shuffle**, **play/pause** (the background
video), and **playlist**. They do **not** get a vinyl button, a loop toggle,
or a loudness slider. Playlist adds the other theme-track cards in place;
the current card stays. Pause stops the video, flattens the wave, and holds
shuffle. After the page is ready, the arrow **nods up and down three times
every 60 seconds** (collapsed or expanded) so they notice the handle.

**Why this priority**: Playback and theme change are the stage’s main toy; they
must work on the first visit without hunting corners.

**Independent Test**: On a phone-width viewport, confirm collapsed now-playing
+ up arrow; expand via tap or drag; confirm V-Flip (not a separate vinyl
tap); use shuffle / play-pause / playlist; collapse via tap or drag; toggle
mute without a slider; confirm the 3×/60s arrow hint when motion is allowed
(including expanded); confirm reduced motion still toggles without the hint.

**Acceptance Scenarios**:

1. **Given** the landing on a phone-width viewport, **When** the visitor looks
   at the player dock at rest (collapsed), **Then** they see the now-playing
   row (soundwave, V-Flip list label, mute) and a **small wide arrow on the
   top of the pill pointing up**.
2. **Given** the active track is not audio-eligible (`hasAudio: false`),
   **When** the visitor looks at the collapsed dock, **Then** mute **still
   sits in the floor row** (layout does not collapse to two columns) and the
   soundwave + name still show. Mute remains a toggle; it does not invent a
   slider.
3. **Given** the player dock is collapsed, **When** the visitor activates the
   handle or drags it up, **Then** the pill **grows up** from `bottom: 0`
   (it does not translate away from the floor), the arrow still sits on the
   **top** of the bar and now points **down**, and V-Flip is open. Drag open
   height matches tap open height. Drag past the cap rubber-bands, then
   snaps back.
4. **Given** the player dock is expanded, **When** the visitor looks at the
   sheet, **Then** the header reads the **Currently playing** chrome string
   (not “pick a track”), the current theme-track **card** is visible, and
   the transport shows **shuffle**, **play/pause**, and **playlist**. Vinyl
   and loop are **not** visible.
5. **Given** the player dock is expanded, **When** the visitor activates
   playlist, **Then** the current card **stays**, other theme-track cards
   add in, the header switches to **V-Flip aka. Jukebox**, and the list
   **scrolls** inside the sheet if it is long. Catalog-only discography
   rows are **not** in this list.
6. **Given** the player dock is expanded, **When** the visitor activates the
   handle or drags it down, **Then** the pill **collapses**, the arrow
   points **up** again, and V-Flip is closed (now-playing remains the
   collapsed face).
7. **Given** mute is visible, **When** the visitor activates it, **Then**
   sound toggles between muted and unmuted at **50%** phone volume and **no
   loudness slider** appears — collapsed or expanded.
8. **Given** reduced motion, a keyboard, or a screen reader, **When** the
   visitor cannot or should not drag, **Then** they can still expand and
   collapse via the handle (or equivalent) and still reach playlist /
   shuffle / play-pause when the pill is open.
9. **Given** shuffle is on and the pill is expanded, **When** the visitor
   looks at that control, **Then** its on state is obvious (for example an
   accent ring), matching the existing player meaning from `011`.
10. **Given** motion is allowed and the landing is ready (intro dismissed if
    any), **When** the visitor watches the handle without touching it,
    **Then** the arrow **smoothly moves up and down 3 times**, and that
    hint **repeats every 60 seconds** while collapsed **or** expanded.
    With reduced motion the hint does **not** play.
11. **Given** the background video is playing, **When** the visitor activates
    play/pause, **Then** the video pauses, the soundwave **flattens**, and
    shuffle does **not** hop to the next track until play resumes.

---

### User Story 3 - Content dock is one growing pill (Priority: P1)

A visitor wants About, Discography, Tour, Socials, or Info. Those sit in
**one growing pill** as matching circular icons. Opening one morphs that
same pill — the icons stay on the bottom. The socials button is the same
kind of circular icon as the others — not a giant arrow sitting outside
the box.

**Why this priority**: This is what makes the middle of the HUD feel like
the same stage language as the player pill, not a second UI kit.

**Independent Test**: On a phone-width viewport, confirm one pill with five
equal circular icons; open About, Discography, Tour, and Info as **the same
pill growing**; confirm Discography scrolls inside the sheet; confirm
content still appears without a new page.

**Acceptance Scenarios**:

1. **Given** the landing on a phone-width viewport at rest, **When** the
   visitor looks above the player dock, **Then** About, Discography, Tour,
   Socials, and Info sit together in **one pill**.
2. **Given** that pill, **When** the visitor compares the icons, **Then**
   they share the same circular size and chrome (the socials trigger is not
   a larger standalone chevron; Info is a circled i).
3. **Given** About content exists, **When** the visitor activates About,
   **Then** the pill **grows** (~320ms) with the bio in the sheet above the
   icon row (not a new site page, not a leftover laptop side panel, not a
   detached sheet floating above a static bar).
4. **Given** no About content, **When** the page loads, **Then** the About
   control is hidden (same rule as `004`) and the remaining icons stay in
   the pill.
5. **Given** Discography or Tour, **When** the visitor opens that control,
   **Then** the existing catalog / dates content is reachable in the growing
   pill and **scrolls inside the sheet** if it is long.
6. **Given** a chrome label for a dock control is edited in content, **When**
   the site is rebuilt, **Then** the accessible name / hint matches the new
   text without a layout rewrite.

---

### User Story 4 - Socials open inside the content pill (Priority: P2)

A visitor who wants Bandcamp, Spotify, and the other platforms taps the
socials button. The **same content pill grows** and the existing channel
icons appear **in the sheet** (the one Channels tree, parked there on
phone). They follow a link or close the sheet and the stage is clean
again.

**Why this priority**: Hiding socials until asked is the cleanliness win;
playback and About/Discography/Tour must work even if Socials shipped
later, but the HUD is incomplete without it.

**Independent Test**: Closed at rest; open from the socials button; platforms
in the growing content pill (not a second bar above it); close without
leaving the landing; outbound links still open as they do today.

**Acceptance Scenarios**:

1. **Given** the landing on a phone-width viewport at rest, **When** the
   visitor looks at the HUD, **Then** platform icons are **not** a permanent
   bar.
2. **Given** the content dock is visible, **When** the visitor activates the
   socials trigger, **Then** the pill grows and the existing channels appear
   **inside that sheet** (same exclusive family as About).
3. **Given** the socials sheet is open, **When** the visitor activates a live
   platform, **Then** they follow that outbound link (new tab, as today).
4. **Given** the socials sheet is open, **When** the visitor closes it (same
   button again, click-outside, or another dock icon), **Then** the sheet
   goes away and they are still on the landing.
5. **Given** a channel is marked coming-soon / without a real URL, **When**
   the sheet is open, **Then** that item is not a dead link (hidden or clearly
   not followable — same rule as today’s channels).

---

### User Story 5 - One open surface at a time; the rest of the site still works (Priority: P2)

On a phone, opening About, Discography, Tour, Socials, Info, or V-Flip
**closes the others**. Expanding the player pill **is** opening V-Flip — it
is not a second stacked sheet. Clicking outside the content pill closes the
content sheet (and collapses V-Flip unless the tap is on the player). While
the Legal overlay is open, that click-outside MUST NOT close the Info sheet
behind it. Identity stays at the top. Intro still hides chrome until
dismissed. Shuffle, pause, and track picking keep the meaning they already
have. A laptop visit is unchanged.

**Why this priority**: Small screens cannot copy the laptop habit of V-Flip
open plus About open at once.

**Independent Test**: Open each mobile sheet in turn and confirm the previous
one closes. Check identity, Info → legal overlay, intro hide/show,
discography “play on V-Flip”, click-outside, and a laptop-width screenshot
that still matches `009` / `011`.

**Acceptance Scenarios**:

1. **Given** scripting is available on a phone-width viewport, **When** the
   visitor opens one of: About, Discography, Tour, Socials, Info, or V-Flip,
   **Then** at most that one extra surface stays open. Expanding the player
   pill **is** V-Flip (not a separate extra surface on top of V-Flip).
2. **Given** a content sheet is open, **When** the visitor taps outside the
   content dock (and the Legal overlay is **not** open), **Then** the
   content sheet closes. If V-Flip is open and the tap is not on the player
   pill, V-Flip collapses too.
3. **Given** the Legal overlay is open, **When** the visitor uses Exit or
   the overlay backdrop, **Then** the Info sheet (and V-Flip, if it was
   open) behind it does **not** collapse from that overlay interaction.
4. **Given** the landing on a phone-width viewport, **When** the visitor
   looks at the top, **Then** the artist identity mark is still there (not
   moved into the bottom stack).
5. **Given** the landing on a phone-width viewport, **When** the visitor
   wants Imprint or Privacy Policy, **Then** they open **Info**, tap the
   English HUD pill, and get the existing in-page legal overlay. The phone
   footer legal cluster is **not** visible.
6. **Given** the intro is showing, **When** the visitor has not dismissed it,
   **Then** the mobile docks stay hidden the same way today’s chrome does.
7. **Given** a viewport **1024px** wide or wider, **When** the visitor uses
   V-Flip, **Then** unmute may still reveal a loudness slider inside the
   V-Flip box (`011` unchanged).
8. **Given** a discography row with a stage action, **When** the visitor
   uses it on a phone, **Then** the stage still switches to that track.

---

### Edge Cases

- **320px width / short landscape**: All dock buttons remain tappable; no
  horizontal page scroll; long panel copy scrolls inside the sheet.
- **Very long track names**: Center now-playing text truncates with an ellipsis;
  the full **V-Flip list label** remains available to assistive tech. No
  native `title` tooltip on phone.
- **Soundwave / reduced motion**: Five vertical lines remain visible. When
  motion is allowed they animate as a small soundwave. When reduced motion is
  preferred they stay **static** (no looping bar dance). Pause still flattens
  them when the visitor pauses the video.
- **Handle hint / reduced motion**: The 3-nod / 60-second arrow bounce MUST
  NOT run when reduced motion is preferred. The arrow still expands and
  collapses the pill.
- **Handle hint while expanded**: The idle nod **does** run while expanded
  (same 3× / 60s cadence). It is a discoverability nudge for the handle, not
  only a “swipe up” lesson.
- **Intro still showing**: Handle hint does not run until intro is dismissed
  (chrome is hidden anyway).
- **No audio / fallback**: Mute **stays in the floor row** on phone when the
  current track has no audio (so `wave \| title \| mute` does not reflow).
  If the catalog has **no** audio-eligible entries at all, the mute control
  may be omitted from the DOM (same mount rule as today). Shuffle still
  works once the pill is expanded. Fallback / missing video disables
  play/pause without treating that as a visitor pause (wave + shuffle stay
  live).
- **Single jukebox entry**: V-Flip still opens (solo card). Playlist does
  not invent extra catalog-only rows; shuffle does not invent a second
  track.
- **Missing About**: About button omitted; remaining content-dock controls
  stay boxed.
- **Empty discography or tour**: Control remains; empty-state copy from
  existing chrome still appears inside the sheet.
- **No scripting**: Docks render. The handle is hidden. Expand, drag,
  exclusive-open, handle hint, play/pause wiring, and mute/shuffle visit
  toggles do not run. Content may still be reachable through native
  `<details>` in the markup, but the growing-pill controller will not.
  This is accepted degradation (same family as `011`), not a promise that
  transport stays always-expanded.
- **Reduced motion**: Pill / panel motion does not require travel animation;
  drag is never the only path; handle hint does not play.
- **Legal overlay open**: Overlay is fullscreen (`002`). Click-outside on
  the landing MUST NOT close the Info sheet behind it. Docks are not
  required to stay usable through the overlay.
- **Glitch theme**: Dock buttons keep existing glitch treatments; the full
  control hit area stays clickable (`009`). Phone content-pill morph stays
  the 320ms ease (not desktop `steps()`).
- **Many social channels**: Channel row wraps or clips **inside the sheet**;
  it must not force the page to scroll sideways.
- **Tablet / in-between widths**: Viewport **below 1024px** uses this phone
  HUD (typical tablet portrait). **1024px and up** uses `009` / `011` (typical
  tablet landscape and laptops). No third layout.
- **Visitor muted**: Mute toggle still works; no slider on phone; unmute
  restores **50%**.
- **Hardware volume**: Out of scope for the page; the site does not fight
  the device volume buttons.
- **Phone hover / long-press**: No HUD label floaters. No “pick a track”
  title on the player header or now-playing label.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the viewport width is **below 1024px**, the landing MUST
  use a dedicated bottom-stacked HUD (player dock + content dock). It MUST
  NOT be a scaled-down copy of the laptop corner layout.
- **FR-002**: At rest on those viewports, the **player dock** MUST be one
  boxed pill in the **collapsed** position, floor-pinned (`bottom: 0`):
  now-playing row (soundwave, V-Flip list label, mute) plus a handle arrow
  on the **top** of the bar pointing **up**.
- **FR-003**: On those viewports, mute MUST be a **sound on / sound off**
  control. The page MUST NOT show a loudness slider. Mute MUST stay on the
  **right** of the now-playing floor row, **including** when the current
  track has `hasAudio: false` (if mute is mounted). Unmuted phone volume
  MUST be **50%**. Desktop unmute-to-slider behavior from `011` MUST remain
  on viewports **1024px and up**.
- **FR-004**: Activating the handle, or dragging it up, MUST **expand** the
  pill (height grows from `bottom: 0`; it MUST NOT translate off the
  floor). Expand MUST **open V-Flip** (there is no separate vinyl control
  on phone). The visitor MUST see shuffle, play/pause (background video),
  and playlist. Vinyl and loop MUST NOT be visible. The handle arrow MUST
  remain on the **top** of the bar and MUST point **down**. Tap open height
  and drag open height MUST match. Drag MUST be capped (rubber-band past
  the open height, then settle).
- **FR-005**: In the **collapsed** position the player dock MUST show a
  **now-playing** row with three zones: **left** a compact soundwave of
  **five vertical lines**; **center** the active V-Flip list **label** (the
  same visitor-facing string as that row in the list — never an internal
  theme id); **right** mute. Shuffle, play/pause, and playlist MUST NOT
  appear in the collapsed row. This MUST NOT open a new page.
- **FR-006**: Expand, collapse, and playlist MUST have a non-drag path.
  The **handle** is the primary non-drag control for expand/collapse
  (keyboard and screen reader included). Drag MUST NOT be the only path.
- **FR-006a**: The handle MUST be a **small, wide arrow** on the **top** of
  the player pill in a **fixed slot** on that bar (it does not jump to
  another chrome region). The tappable strip MUST be at least **44px**
  wide and **24px** tall. When the pill expands or collapses, the arrow
  MUST stay on the top edge (the pill grows; the floor stays pinned).
  Collapsed → points **up**. Expanded → points **down**.
- **FR-006b**: After the landing is ready (intro dismissed if any) and
  motion is allowed, the handle arrow MUST **smoothly move up and down 3
  times**, then repeat that hint **every 60 seconds**, whether the pill is
  collapsed **or** expanded. Reduced motion MUST disable this idle hint.
- **FR-007**: At rest on those viewports, the **content dock** MUST be one
  growing pill containing About (if content exists), Discography, Tour,
  Socials, and Info as **matching circular buttons**. Equal pad tokens
  (`--phone-bar-pad` collapsed, `--phone-open-pad` open, `--phone-inline-pad`
  left/right) and body/tray gaps MUST keep top/bottom and left/right air
  even. Icons MUST ride the **bottom** of the pill.
- **FR-008**: The socials trigger MUST use a socials-fitting icon (not an
  up-arrow / chevron). Exact glyph MAY be the `socials` HUD token. Its
  label MUST stay editable in chrome content (existing socials wording).
- **FR-009**: Activating the socials trigger MUST grow the **same content
  pill** and show the existing channel / platform icons **inside the
  sheet**. The sheet MUST be closed at rest and MUST NOT navigate to a new
  site page. Channels MUST be the **one** existing list (parked into the
  sheet on phone) — never a second Channels tree.
- **FR-010**: Socials in the sheet MUST reuse the existing channel list
  (active vs coming-soon). This feature MUST NOT require new platforms
  (IDEA-005 remains separate).
- **FR-011**: When scripting is available and viewport width is **below
  1024px**, at most **one** of these extra surfaces MAY be open: About,
  Discography, Tour, Socials, Info, V-Flip. Opening one MUST close the
  others. Expanding the player pill **is** opening V-Flip. (On **1024px
  and up**, exclusive-open among on-demand panels, and V-Flip staying
  independently open, MUST NOT be changed.)
- **FR-011a**: Click-outside MUST close the content sheet. Click-outside
  MUST also collapse V-Flip unless the tap is on the player pill. While
  the Legal overlay is open, that click-outside MUST NOT close the content
  sheet or V-Flip behind it.
- **FR-012**: Below 1024px, About, Discography, Tour, Socials, and Info
  MUST open as the **content pill growing** (~320ms morph when motion is
  allowed). V-Flip MUST open as the **player pill growing**. Open sheets
  MUST NOT become a new route; long Discography / Tour / playlist content
  MUST scroll inside the sheet; the atmosphere MUST remain the stage; the
  docks MUST stay on screen. This MUST NOT reuse the laptop side-panel
  composition as-is.
- **FR-013**: Artist identity MUST remain a compact mark on the **top**
  edge when viewport width is **below 1024px**. It MUST NOT move into the
  bottom stack.
- **FR-014**: Below 1024px the landing footer legal cluster MUST be
  **hidden**. Copyright MUST appear top-right in the Info sheet header.
  Imprint and Privacy Policy MUST be English HUD pills (`imprintButton` /
  `privacyButton`) that open the existing in-page legal overlay. German
  legal markdown titles remain on that overlay.
- **FR-015**: Viewports **1024px wide and up** MUST keep the `009` / `011`
  HUD (placement, hover labels, V-Flip box with optional volume slider).
- **FR-016**: Shuffle, track picking, intro hide / show, discography stage
  action, and visit-only shuffle/loop defaults MUST keep their existing
  meaning. Phone relocates chrome and **omits loop** from the phone
  transport; it MUST NOT redefine laptop playback rules. Phone play/pause
  MUST pause the background video, flatten the soundwave, and hold the
  shuffle clock.
- **FR-016a**: The player playlist MUST list **theme / stage tracks**
  (jukebox entries), not the full discography catalog. Solo open shows the
  **current** card only. Playlist open keeps that card and adds the others
  in. The list MUST scroll when playlist is open.
- **FR-016b**: Expanded player header MUST show `currentlyPlayingLabel`
  until playlist is open, then `jukeboxPanelTitle` (V-Flip aka. Jukebox).
  It MUST NOT show `jukeboxPanelTooltip` (“pick a track”) on phone.
- **FR-017**: Visitor-facing labels, the socials-trigger name, Info /
  Imprint / Privacy Policy strings, playlist label, and the handle
  arrow’s accessible name (expand / collapse) MUST remain editable in
  chrome / content files without layout code changes (constitution III).
- **FR-018**: If artist-visible HUD surfaces change, artist-facing
  documentation MUST be updated in the same change set (constitution VII).
- **FR-019**: The landing MUST remain usable from 320px width with no
  horizontal scrolling. Visual success for **this** feature **is** the phone
  composition (unlike `004` / `009` / `011`, which deferred that bar).
- **FR-020**: This feature MUST NOT add third-party embeds, analytics,
  cookies, or new site routes.
- **FR-021**: New client-side behavior (handle drag, exclusive sheets,
  handle hint, play/pause, playlist morph) MUST stay justified under
  constitution IV; when scripting is unavailable, the collapsed docks
  still paint and native disclosure in the markup MAY remain, but
  exclusive-open and handle expand are not guaranteed.
- **FR-022**: Reduced motion MUST NOT require drag or travel animation to
  complete expand/collapse, open V-Flip, or open content sheets (FR-004,
  FR-009, FR-012). The 3×/60s handle hint MUST NOT run under reduced
  motion.
- **FR-023**: Below 1024px the landing MUST NOT show HUD hover / focus
  label floaters, and MUST NOT attach a native `title` tooltip on the
  now-playing label or the “pick a track” player title.

### Key Entities

- **Player dock**: Bottom boxed pill, floor-pinned. Two positions —
  **collapsed** (now-playing row + up arrow) and **expanded** (pill grown
  up; V-Flip open; shuffle + play/pause + playlist; down arrow). Handle
  tap and handle drag toggle position. Expand === V-Flip.
- **Dock handle**: Small wide arrow fixed to the **top** of the player pill.
  Points up when collapsed, down when expanded. Idle hint: 3 smooth
  up/down nods every 60 seconds while collapsed **or** expanded (motion
  allowed).
- **Content pill**: On-demand growing pill for About, Discography, Tour,
  Socials, or Info (below 1024px). Icons stay on the bottom. Exclusive-open
  with V-Flip.
- **Socials (in-sheet)**: The one Channels tree, parked inside the content
  sheet on phone. Not a detached tray above the dock.
- **Now-playing row**: Collapsed face of the player dock. Left: five-line
  soundwave. Center: V-Flip list label. Right: mute. Transport is absent
  on this row.
- **Theme-track playlist**: Jukebox / stage entries inside the open player
  (not the full catalog). Solo = current card. Playlist = current card
  plus the others, scrollable.
- **Info sheet**: Phone legal home. © top-right; English Imprint + Privacy
  Policy pills → Legal overlay. Phone footer hidden.
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
  player pill + five-icon content dock; no permanent socials bar, no phone
  footer legal strip, no four-corner laptop HUD).
- **SC-002**: 100% of first-visit playback tasks complete without a laptop:
  expand the pill (V-Flip), toggle mute, toggle shuffle, play/pause the
  video, open playlist, pick another theme track — in under **30 seconds**
  of focused trying.
- **SC-003**: 100% of testers who are asked “what is playing?” can read the
  **V-Flip list label** on the collapsed now-playing row within **10
  seconds** of the landing being ready (no extra expand required).
- **SC-003a**: With motion allowed, a reviewer sees the handle arrow nod
  **3 times** after the landing is ready, and sees that hint again within
  **60 ± 5 seconds** while the pill stays collapsed **or** expanded. With
  reduced motion, **0** idle nods occur.
- **SC-004**: On a 320px-wide viewport, **0** pages exhibit horizontal
  scrolling and **0** dock buttons are clipped off-screen at rest.
- **SC-005**: With Socials closed, **0** platform icons appear as a
  persistent bar; with it open, every **active** channel from the site’s
  channel list is reachable **inside the content pill**.
- **SC-006**: In scripted phone testing, opening a second surface (About,
  Discography, Tour, Socials, Info, or V-Flip) leaves **at most one** of
  those extra surfaces visible.
- **SC-007**: On a 1280×800 laptop viewport, a side-by-side check against
  current `009` / `011` behavior finds **0** intentional layout changes
  (volume slider still available after unmute). At **1023px** width the
  phone HUD is in effect; at **1024px** width the laptop HUD is in effect.
- **SC-008**: Keyboard-only visitors on a narrow viewport can: expand and
  collapse the player pill with the handle, read the current track name,
  toggle mute/shuffle/play-pause/playlist when shown, open About or
  Discography, open and close Socials and Info, and reach Imprint / Privacy
  Policy from Info. No drag required.
- **SC-009**: With reduced motion preferred, all primary tasks in SC-002,
  SC-003, and opening Socials still complete **without** a drag
  requirement.
- **SC-010**: No new third-party embeds, cookies, or tracking are introduced.
- **SC-011**: On a phone viewport, **0** HUD hover floaters and **0**
  “pick a track” native titles appear on the player header or now-playing
  label.

## Assumptions

- Owner mockup `docs/mockups/mobile-stage-hud.jpg` is **historical**. Where
  it conflicts with this as-built spec (detached socials tray, loop in the
  expanded dock, four icons, always-visible footer, V-Flip as a vinyl
  button inside the pill), **the code wins**.
- Loop remains a **laptop** `011` control. Phone transport is shuffle +
  play/pause + playlist.
- Mobile volume is mute/unmute only at **50%** when unmuted; device
  hardware volume is the loudness control.
- Default rest is the **collapsed** pill (now-playing + up arrow).
  Expanding **is** V-Flip. The now-playing row stays the floor of the
  **same** bar.
- v1 center now-playing copy is the **same visitor-facing string as the
  V-Flip list row** (the jukebox entry label). Do not show internal theme
  pack ids. Expanded header uses `currentlyPlayingLabel` vs
  `jukeboxPanelTitle` when playlist is open.
- Handle idle hint: **3** smooth up/down motions, repeating **every 60
  seconds**, after intro (if any), when motion is allowed, **collapsed or
  expanded**.
- “Small / phone viewport” means **width below 1024px**, implemented as CSS
  `@media (max-width: 1023px)`. From **1024px** up, `009` / `011` remains.
- Identity stays a compact top mark; tagline rotation (`012`) MAY remain
  under that mark if it still fits — this feature does not redesign the
  wordmark.
- Phone legal is **Info**, not a footer above the docks.
- Below 1024px, About / Discography / Tour / Socials / Info are **the
  content pill growing**. V-Flip is **the player pill growing**. One
  exclusive family.
- Channel URLs already live in site data; this feature only **re-places**
  them into the sheet. Completing or adding platforms is IDEA-005.
- Hover label-reveal from `009` is a **laptop-only** pattern. Phone MUST
  NOT depend on hover or native `title` tooltips.
- Playback matrix, shuffle pool, loop-wins-over-shuffle (laptop),
  visit-only toggles stay as specified in `011`. Phone pause holds the
  shuffle clock.
- Intro (`006`) continues to hide landing chrome until dismissed.
- Client-side scripting is required for handle drag, exclusive sheets,
  hint, play/pause, and playlist morph. No-JS visitors still get the
  collapsed docks painted; they do not get a guaranteed always-expanded
  transport.

## Dependencies

- `004-landing-content-layout` — stage content, on-demand panels, channels.
- `009-desktop-stage-ui` — icon language, boxed clusters, glitch hit targets;
  remains the laptop HUD.
- `011-vflip-now-playing` — V-Flip toolbar meaning and playback rules
  (laptop still has vinyl + loop + slider).
- `002-themed-background-video` — atmosphere, mute eligibility, legal overlay.
- `006-landing-intro` — chrome hidden during intro.
- `008-artist-docs` — artist guide update if HUD surfaces move.
- `010-track-catalog` / `014-discography-only-tracks` — track names and
  discography content reused; player playlist is stage tracks only.

## Out of Scope

- Desktop / typical laptop HUD redesign (`009` / `011` stay)
- Loudness slider on phone
- Loop control on phone
- Separate vinyl / V-Flip button on phone (handle expand is V-Flip)
- Detached socials tray above a static content bar
- Always-visible phone footer legal strip
- New platforms or channel URLs (IDEA-005)
- Media re-encode / poster pipeline (IDEA-015)
- New site routes or third-party players / embeds
- Changing laptop shuffle/loop playback rules or scheduled default (`007`)
- Landing intro copy or motion (`006`)
- Seravek / primary typeface (IDEA-007)
- Remembering mute/shuffle/loop across visits
- A dedicated tablet-only third layout (below 1024px = this HUD; 1024px+ =
  laptop HUD)
- Treating open-overshoot or playlist-card-jump polish as specified work
  unless a later change set proves they still happen
