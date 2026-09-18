# Feature Specification: Stage Artist Polish

**Feature Branch**: `022-stage-artist-polish`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Gosha + Hendrik stage polish: NCS logo in
    the center; Show me How needs music; Cut on Taking Over; brighter
    interface on Taking Over; new/different shuffle button; kill
    Minecraft sprites for now; on mobile prefer tap not swipe at the
    bottom; keep liking Links (owned with `020`). Related:
    `020-site-nav-chrome`, `021-jukebox-easter-egg`."

## Related Specs

| Spec | Relationship |
| ---- | ------------ |
| `020-site-nav-chrome` | Sibling. Nav, side socials, Links retention, remove side circular buttons. |
| `021-jukebox-easter-egg` | Sibling. Selection-first player + V-Flip easter egg. This feature does **not** redefine default player surface; it polishes stage/theme presentation and shuffle affordance. |
| `005-theme-packs` | Extended in spirit: Taking Over brightness and any NCS-centered presentation are pack/content presentation changes, not a new pack system. |
| `002-themed-background-video` / atmosphere | Show me How needs real music; Taking Over cut affects what visitors hear/see on that entry. |
| `015-mobile-stage-hud` | **Partially superseded** for requiring swipe to use the bottom player — **tap is preferred**; swipe must not be the only path. |
| `003-ui-glitch` / decorative sprites | Minecraft-style sprites removed from the visitor-facing stage for now. |

## Design Direction *(draft)*

Artist and friend feedback on the **stage itself** (not the top nav):

| Feedback | Intent |
| -------- | ------ |
| NCS logo in the center | When appropriate for the active entry, an NCS mark can occupy the **center stage** as a clear brand/partner signal — not a tiny corner badge. |
| Show me How needs music | That entry must ship with playable music; a silent or missing bed is unacceptable. |
| Cut on Taking Over | Ambiguous artist note — see clarification. |
| Brighter interface on Taking Over | Taking Over’s theme/UI read must be **noticeably brighter** than today’s dark treatment. |
| New / different shuffle button | Shuffle control gets a **new visual** distinct from the current control. |
| Kill Minecraft sprites | Remove Minecraft-like sprite dressing from the live stage for now (too random). |
| Mobile bottom: prefer tap not swipe | Opening/using the bottom player MUST work clearly via **tap**; swipe is optional sugar, not required. |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Show me How actually plays music (Priority: P1)

A visitor selects **Show me How**. They hear music for that entry (unmute
path as with other audio-eligible tracks). The stage no longer feels
broken or silent when this track is chosen.

**Why this priority**: Direct Gosha feedback; broken audio destroys trust.

**Independent Test**: Select Show me How, unmute if needed, confirm
audible music tied to that entry.

**Acceptance Scenarios**:

1. **Given** Show me How is in the selectable catalog, **When** the
   visitor activates it and unmutes (if the site starts muted), **Then**
   they hear music for that entry.
2. **Given** Show me How is active, **When** compared to other
   audio-eligible tracks, **Then** it is treated as audio-eligible (not
   stuck in a no-song dwell-only state unless intentionally instrumental
   — default: it has music).

---

### User Story 2 - Taking Over feels brighter (and correctly “cut”) (Priority: P1)

A visitor selects **Taking Over**. The interface/theme reads **brighter**.
The artist-requested **cut** on Taking Over is applied once clarified.

**Why this priority**: Explicit Gosha notes on this track’s presentation.

**Independent Test**: Side-by-side Taking Over vs Nightmare (or prior
Taking Over): brightness difference is obvious; cut change is verifiable
per clarification answer.

**Acceptance Scenarios**:

1. **Given** Taking Over is active, **When** a reviewer compares HUD /
   theme surfaces to the previous Taking Over treatment, **Then** the
   new treatment is clearly brighter (higher perceived luminance on
   primary chrome/surfaces).
2. **Given** Taking Over is active, **When** the clarified “cut” change
   is reviewed, **Then** it matches the artist’s intended cut
   (see [NEEDS CLARIFICATION]).

---

### User Story 3 - NCS mark can own the center when relevant (Priority: P2)

On the entry (or entries) associated with NCS, visitors can see an **NCS
logo in the center** of the stage as a deliberate focal element, without
covering critical chrome.

**Why this priority**: Gosha request; supports release identity.

**Independent Test**: Activate the NCS-associated entry; confirm centered
NCS logo; other entries do not wrongly show it unless configured.

**Acceptance Scenarios**:

1. **Given** an NCS-associated stage entry is active, **When** the stage
   is visible, **Then** an NCS logo appears as a center-stage element.
2. **Given** a non-NCS entry is active, **When** the stage is visible,
   **Then** the NCS center logo is not shown (unless content explicitly
   configures it).
3. **Given** the NCS logo is shown, **When** the visitor uses primary
   nav/player, **Then** chrome remains usable (logo does not block
   primary controls).

---

### User Story 4 - Stage drops Minecraft sprites; shuffle looks new (Priority: P2)

Visitors no longer see Minecraft-like sprites on the stage. Shuffle still
exists as a control but looks **different** from the current shuffle
button.

**Why this priority**: Hendrik (sprites); Gosha (shuffle).

**Independent Test**: Rest and active themes show no Minecraft sprites;
shuffle control fails a “same as old glyph” comparison.

**Acceptance Scenarios**:

1. **Given** any current theme/entry, **When** the stage is shown,
   **Then** Minecraft-style character/item sprites are absent.
2. **Given** shuffle is available in the player chrome, **When** a
   reviewer compares it to the pre-change shuffle control, **Then** it
   is recognizably a new/different treatment (not a trivial color tweak
   alone — silhouette or metaphor changes).
3. **Given** shuffle’s new look, **When** a visitor uses it, **Then**
   shuffle still toggles on/off with clear pressed/unpressed state.

---

### User Story 5 - Mobile bottom player prefers tap (Priority: P1)

On a phone, a visitor opens and uses the bottom player via **tap**. They
are not forced to discover a swipe gesture. (Hendrik: at the bottom
prefer tap not swipe.)

**Why this priority**: Mobile usability for casual fans.

**Independent Test**: Phone tester with swipe disabled / not instructed
can fully open song selection and change tracks by tapping only.

**Acceptance Scenarios**:

1. **Given** a phone-width landing, **When** the visitor taps the bottom
   player affordance, **Then** the player reaches its useful open /
   selection state without requiring a swipe.
2. **Given** instructional or motion hints exist, **When** they appear,
   **Then** they do not imply swipe is the only way.
3. **Given** swipe still works as an optional gesture, **When** tap and
   swipe are both available, **Then** tap remains sufficient for the
   full primary player flow.

---

### Edge Cases

- Artist has not supplied final NCS logo asset — use approved placeholder
  only with owner approval; do not ship random marks.
- Taking Over brightness vs contrast/accessibility — brighter must still
  meet sufficient contrast for text/controls (constitution IV).
- Show me How music file missing at build — fail loud in maintainer
  workflow (omit entry or warn) rather than silently shipping broken
  audio eligibility.
- Reduced motion — NCS logo and brightness changes still apply; motion
  not required to perceive them.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Show me How stage entry MUST include playable music for
  visitors (audio-eligible with an actual music bed).
- **FR-002**: When Taking Over is active, theme/interface presentation
  MUST read clearly brighter than the pre-change Taking Over treatment.
- **FR-003**: Taking Over MUST apply the artist-requested cut change.
  [NEEDS CLARIFICATION: What does “Cut bei Taking Over” mean — (A) edit
  the audio/video so a specific section is cut/shortened, (B) a hard
  visual cut/transition in the atmosphere, (C) cut/remove a UI element
  that appears on Taking Over, or something else?]
- **FR-004**: NCS-associated entries MUST be able to show an NCS logo as
  a **center-stage** element when configured in content.
- **FR-005**: Minecraft-style sprites MUST be removed from the
  visitor-facing stage presentation for now.
- **FR-006**: The shuffle control MUST use a new/different visual
  treatment from the current shuffle button while keeping toggle
  semantics.
- **FR-007**: On phone-width viewports, the bottom player’s primary open
  and song-change flows MUST be completable by **tap alone**; swipe MUST
  NOT be required.
- **FR-008**: Stage polish MUST NOT reintroduce circular side button
  docks (`020`) or revive Currently-playing-as-default (`021`).
- **FR-009**: Brightness and logo treatments MUST preserve usable
  contrast for controls and text on the affected themes.
- **FR-010**: Artist-editable content MUST remain the place to bind
  which entries show the NCS center logo and which audio file belongs to
  Show me How (constitution III / VII).

### Key Entities

- **Stage Entry Presentation**: Per-track atmosphere, audio eligibility,
  brightness/mood, optional center logo.
- **Shuffle Control Affordance**: Visitor toggle with updated visuals.
- **Decorative Sprite Layer**: Formerly Minecraft-like dressing — removed
  for now.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **100%** of QA runs confirm Show me How produces audible
  music after unmute on a standard device volume.
- **SC-002**: In a side-by-side review, **≥ 8 of 10** reviewers identify
  Taking Over as “brighter” than the previous Taking Over UI without
  being told which is new.
- **SC-003**: Minecraft-style sprites count on the live stage is **zero**.
- **SC-004**: **100%** of phone testers complete open-player → select
  another track using **only taps** (no swipes).
- **SC-005**: **≥ 8 of 10** reviewers say the shuffle control looks
  “new/different” vs a screenshot of the old control.
- **SC-006**: When an NCS-associated entry is active, **100%** of
  reviewers notice a center-stage NCS logo within **3 seconds**.

## Assumptions

- “NCS logo in the center” applies to content-configured NCS-related
  entries (likely including Taking Over if that release is NCS); the
  artist marks which entries qualify in content.
- Removing Minecraft sprites means visitor-facing removal “for now” —
  assets may remain in the repo unused; no requirement to delete files
  forever.
- Shuffle **behavior** (on/off, interaction with loop/hop) stays as in
  current as-built meaning unless `021` changes it; this feature changes
  **appearance** (and may retune hit area for clarity).
- Mobile Links retention is specified under `020`; this feature only
  requires not breaking that pattern while changing bottom tap behavior.
- Gosha’s “remove buttons from the side” is owned by `020`, not
  duplicated here.

## Dependencies

- Theme pack / atmosphere content for Taking Over and Show me How.
- Approved NCS logo artwork and usage permission (owner-approved asset).
- `021` selection-first player so tap targets align with song selection.
- `015` phone player chrome as the baseline being adjusted for tap-first.

## Out of Scope

- Top navigation IA (`020`).
- V-Flip easter egg discovery design (`021`) beyond not conflicting.
- Building a real shopping cart.
- Permanently deleting all sprite source files from the repository.
- Redesigning every theme pack’s full art direction beyond Taking Over
  brightness, NCS center logo, sprite removal, and listed track fixes.
