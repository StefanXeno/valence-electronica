# Feature Specification: Agent Self-Testing

**Feature Branch**: `016-agent-self-testing`

**Created**: 2026-09-05

**Updated**: 2026-09-05

**Status**: Draft

**Input**: User description: "The coding agent cannot reliably verify phone HUD /
site UI. The operator has been recording videos for every animation. We need a
justified, operator-approved way for the agent to test the running site
themselves after code changes. A fitting agent-facing package is OK — Playwright
is the expected default (selectors, screenshots, traces, phone viewport,
tap/drag, labeled artifacts). Install that tool mise-first (project toolchain
file in 017). Operator approval for Playwright is granted; keep a gate only for
additional undeclared tools. Static-first / zero-ops / no tracking. Phone HUD is
max-width 1023px; laptop 009/011 from 1024px must stay testable if cheap. Cover
the as-built 015 flows that kept failing. Agent runs a documented command and
gets pass/fail or artifacts they can read without the operator filming."

## Context

The coding agent can change CSS and HUD behavior, but cannot see the running
site the way a visitor does. The operator has been filming every animation so
the agent can guess what broke. That loop is slow and still misses regressions.

This feature does **not** change the visitor-facing site. It gives the agent a
**justified, operator-approved** way to exercise the **running** landing after
a change and to read a pass/fail result or artifacts — without asking the
operator to record another video.

Coverage MUST match the **as-built** phone HUD in `015-mobile-stage-hud`
(synced 2026-09-05), not the historical four-icon / detached-sheet mock.

The default verification path is an **agent-fit browser-automation package**
(Playwright), installed **mise-first**. Playwright itself is **already
approved**. Extra undeclared tools stay gated.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agent verifies the phone HUD without a filmed recap (Priority: P1)

After a HUD or landing-layout change, the coding agent needs to know whether
the **phone** stage still matches the as-built `015` composition — without the
operator recording a video.

Phone means viewport width **below 1024px** (`max-width: 1023px`). Review
target remains ~390×844.

The agent must be able to check the flows that kept failing:

1. **Player tap-open vs drag-open**: expand === V-Flip; the pill grows from
   the floor (`bottom: 0`); tap open and drag open share the **same** open
   height; the full theme-track card is visible; drag past the cap
   rubber-bands then settles (no leftover overshoot).
2. **Playlist open/close**: current card **stays**; other theme-track cards
   add in; header switches to V-Flip aka. Jukebox; the list **scrolls**
   inside the sheet; closing playlist does not jump the layout.
3. **Drag-down (or handle tap) collapse**: transport (shuffle, play/pause,
   playlist) **hides**; now-playing row remains the collapsed face; arrow
   points up again.
4. **Mute**: stays in the floor row (`wave | title | mute`), **vertically
   centered** with that row, even when the current track has no audio (if
   mute is mounted). No loudness slider on phone.
5. **Content dock**: one **growing pill**, **five** matching icons (About,
   Discography, Tour, Socials, Info). Opening a control morphs **that same
   pill** — not a detached sheet. Discography / Tour / Socials scroll or
   wrap **inside** the sheet. **Info** is the phone legal home: © top-right;
   English Imprint / Privacy Policy pills open the existing legal overlay;
   the phone footer legal strip stays hidden.
6. **Pause**: play/pause stops the background video, **flattens** the
   five-line soundwave, and does not hop shuffle to the next track.

**Why this priority**: This is why the feature exists. If the agent still
needs a filmed recap for these flows, nothing else matters.

**Independent Test**: On a phone-width running landing (intro dismissed if
any), run the documented verification for the six flows above and confirm
each has a pass/fail or a readable artifact. Do this without asking the
operator to film.

**Acceptance Scenarios**:

1. **Given** a phone-width running landing with sheets closed and the player
   pill collapsed, **When** the agent checks rest state, **Then** they can
   confirm two boxed docks at the bottom (player + five-icon content pill),
   a free center, no permanent socials bar, and no phone footer legal strip.
2. **Given** that collapsed player, **When** the agent opens it by **tap**
   and again by **drag**, **Then** both opens reach the same height, show
   the full current theme-track card under Currently playing, show shuffle +
   play/pause + playlist (no vinyl, no loop), and do not leave the pill
   overshot past the cap.
3. **Given** the player is expanded, **When** the agent opens playlist,
   **Then** the current card stays, other theme-track cards add in, the list
   scrolls inside the sheet if long, and closing playlist does not jump the
   card or the pill.
4. **Given** the player is expanded, **When** the agent drags the handle
   down or taps it closed, **Then** transport is hidden and the collapsed
   now-playing row is what remains.
5. **Given** mute is mounted, **When** the agent inspects the floor row,
   **Then** mute sits on the right and is vertically centered with the
   soundwave and title — collapsed or expanded — and no slider appears.
6. **Given** the content dock, **When** the agent opens About, Discography,
   Tour, Socials, and Info in turn, **Then** each grows the **same** pill
   (icons stay on the bottom), exclusive-open holds, Discography scrolls
   inside the sheet, and Info reaches Imprint / Privacy Policy through the
   existing overlay.
7. **Given** the background video is playing, **When** the agent activates
   pause, **Then** the video pauses and the soundwave flattens.

---

### User Story 2 - One documented command the agent can run and read (Priority: P1)

The agent (or operator) runs **one documented verification command** from the
repo. The run either **passes**, **fails**, or writes **artifacts** the agent
can read (pictures, traces, or a short report) without the operator narrating
what happened.

Existing project checks (`npm test`, type/build check) remain available and
MAY be part of that command. They are **not** enough by themselves: they do
not see the running HUD.

The command MUST assume **mise-provided** project tools (Node and the
approved agent browser package). How those tools are pinned lives in the
project toolchain feature (`017`). This feature documents and runs the
verify command on top of that.

**Why this priority**: A checklist the agent cannot execute is the status
quo. The command is the deliverable.

**Independent Test**: Follow the documented command on a clean checkout with
the site previewable and the project toolchain installed. Confirm a clear
pass, fail, or artifact folder appears, and that a person (or agent) can
tell which named flow failed from that output alone.

**Acceptance Scenarios**:

1. **Given** the repo docs for this feature, **When** the agent looks up how
   to verify the landing HUD, **Then** they find **one** primary command (or
   a short documented sequence) — not a “film this and send it back” step.
2. **Given** that command, **When** it finishes successfully, **Then** the
   output states pass for each covered flow, or points to artifacts that
   show the expected rest / open / closed states.
3. **Given** a covered flow is broken, **When** the command finishes,
   **Then** the agent can name the failed flow from the output or artifacts
   without asking the operator to record a video.
4. **Given** the preview server is not running and the command needs it,
   **When** the agent starts from the docs, **Then** the docs say how to
   start the existing preview (or the command starts it) using tools already
   in the project toolchain.
5. **Given** a run that includes interaction (tap, drag, pause), **When**
   artifacts are written, **Then** screenshots and optional traces are
   labeled by flow name so the agent can open the right file first.

---

### User Story 3 - Laptop HUD stays cheaply testable (Priority: P2)

Phone is the painful surface, but a HUD change must not silently wreck the
laptop stage (`019`) from **1024px** up. If a second viewport pass
is cheap, the same command (or a documented flag) covers ~1280×800: identity
and socials on the top edge, **always-open** player (no vinyl / V-Flip
toggle), unmute may show a loudness slider in reserved space, Info in the
bar, no phone growing-pill docks.

**Why this priority**: Phone-only verification would trade one blind spot
for another. Laptop is in scope only when it stays cheap.

**Independent Test**: Run the documented verification at laptop width
(≥1024px, review ~1280×800) and confirm the laptop composition is still
what the artifacts show — without a new filmed recap.

**Acceptance Scenarios**:

1. **Given** a running landing at **1024px** or wider, **When** the
   verification runs, **Then** artifacts or checks show the `019`
   laptop HUD, not the phone docks.
2. **Given** a run that already covers phone, **When** laptop is included,
   **Then** it uses the **same** approved agent browser package — not a
   second tool family.
3. **Given** unmute on laptop, **When** the agent inspects V-Flip,
   **Then** a loudness slider MAY appear (phone MUST still have none).

---

### User Story 4 - Declared agent tools only; extra packages stay gated (Priority: P2)

The operator **approved Playwright** as the agent-fit verification package.
Installation is **mise-first** (project toolchain file owned by `017`).
This feature MUST NOT silently add **other** undeclared packages or browser
runtimes.

The workspace rule still forbids surprise `npm install` of unrelated tools.
A gate remains only for **additional** undeclared tools beyond the approved
Playwright path.

**Why this priority**: A green test suite that pulled random extra packages
is a failed feature. Playwright itself is no longer the gate.

**Independent Test**: Read the plan and the installed project dependencies
after implementation. Confirm Playwright is the declared agent browser
package, it was installed via the documented mise-first path, and no other
new package or browser runtime was added unless a written operator approval
for that exact extra tool exists.

**Acceptance Scenarios**:

1. **Given** implementation finishes, **When** someone inspects declared
   tools, **Then** Playwright is present as the approved agent package and
   the published site has no new production runtime.
2. **Given** the agent needs a tool that is **not** Playwright and **not**
   already in the project, **When** they reach that gap, **Then** they stop
   and ask the operator — they do not install it on their own.
3. **Given** Playwright or its browser binary is missing, **When** the
   command runs, **Then** it fails closed with a message that names the
   mise-first install / browser-download step — it MUST NOT download a
   different undeclared browser package.
4. **Given** the constitution (static-first, no tracking), **When** this
   feature lands, **Then** the visitor bundle, cookies, and analytics
   surface are unchanged.

---

### Edge Cases

- **Intro still showing**: Verification MUST dismiss or skip past the intro
  so docks are visible (same hide rule as `006` / `015`). Docs MUST say so.
- **Reduced motion**: Pause still flattens the wave; handle idle nod is
  not required for a pass. Drag MUST NOT be the only expand/collapse path
  the harness uses if a tap path exists.
- **Preview not running / port busy**: The command fails with a clear
  message (or starts the existing preview). It MUST NOT hang with no output.
- **Playwright or browser binary missing**: The command MUST fail closed
  with a message that names the mise-first install path (and the remaining
  browser-download command if browsers are not part of `mise install`).
  It MUST NOT install an undeclared substitute.
- **No audio / mute omitted**: If mute is not mounted (catalog has no
  audio-eligible tracks), the mute-centering case is skipped or marked
  inapplicable — not a hard fail.
- **Single jukebox entry**: Playlist must not invent catalog-only rows;
  “current card stays” still applies (solo card).
- **Legal overlay open**: Closing the overlay MUST NOT be scored as
  “Info sheet collapsed” (as-built `015` click-outside rule).
- **CI / no display**: If the environment cannot show a page, the command
  MUST say so. This feature does not require a new paid CI service
  (constitution II). Local agent use is the primary target.
- **Operator filming**: Still allowed as a fallback the agent **asks for**,
  never as the documented happy path.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repo MUST document one primary verification command (or
  short sequence) that an agent can run after landing / HUD changes.
- **FR-002**: That command MUST produce a pass, a fail, or artifacts the
  agent can read without a filmed operator recap.
- **FR-003**: Phone verification MUST use a viewport **width of 1023px or
  less** (review target ~390×844). Laptop verification, when included,
  MUST use **1024px or more** (review target ~1280×800).
- **FR-004**: Phone coverage MUST include the six failing-flow families in
  User Story 1 (tap vs drag open, playlist open/close, collapse hides
  transport, mute vertical centering, five-icon growing content pill +
  Info/legal, pause flattens the soundwave), against the as-built `015`
  HUD — not the historical four-icon / detached-sheet mock.
- **FR-005**: Phone checks MUST treat **expand === V-Flip**, **five**
  content-dock icons, **no vinyl / no loop / no phone slider**, and
  **theme-track playlist** (not the full discography catalog) as the
  expected design.
- **FR-006**: Laptop coverage MUST be available when cheap and MUST confirm
  the `019` composition is still in effect at 1024px and up.
- **FR-007**: Implementation MUST use the **operator-approved Playwright**
  package as the default agent verification tool, installed **mise-first**
  (toolchain owned by `017`). Implementation MUST NOT add other undeclared
  npm packages, Puppeteer, or extra browser runtimes unless the operator
  has explicitly approved that named extra tool.
- **FR-008**: The default method is local preview + Playwright-driven
  interaction and artifacts (screenshots, optional traces, short report).
  Existing `npm test` / type / build checks MAY be composed in. They MUST
  NOT be the only HUD evidence.
- **FR-009**: The feature MUST NOT add production JavaScript, routes,
  tracking, cookies, analytics, or a runtime backend. Dev-only scripts are
  allowed if they stay off the published site.
- **FR-010**: When a covered flow fails, output MUST identify which named
  flow failed (or which artifact to open).
- **FR-011**: Docs MUST state how to start the existing preview if the
  command does not start it, and what to do when Playwright or its browser
  binary is missing (mise-first install / remaining browser command).
- **FR-012**: Artist-facing content files MUST NOT become the place this
  harness is documented. If any developer README mention is added, it MUST
  not instruct the artist to run the harness (constitution VII).
- **FR-013**: Verification MUST be able to reach a landing with chrome
  visible (intro dismissed or equivalent).
- **FR-014**: The harness MUST drive **both** tap and drag where those are
  the regressions — using the same visitor-facing controls, not a hidden
  test-only hook. Prefer the tap/handle path a visitor without drag would
  use, plus a real drag for tap-vs-drag height.
- **FR-015**: Artifacts MUST include labeled screenshots per covered visual
  flow and MAY include traces. Filenames or captions MUST include the flow
  id.

### Key Entities

- **Verification command**: The documented entry point the agent runs.
- **Flow case**: One named HUD behavior (e.g. tap-open, playlist, mute
  center, Info legal, pause flatten, laptop rest).
- **Artifact**: A screenshot, trace, or short report the agent can read.
- **Approved agent package**: Playwright — already approved; installed
  mise-first.
- **Extra-tool gate**: Any undeclared package or browser runtime beyond
  Playwright that MUST NOT be installed until the operator says yes.
- **Phone viewport**: Width **≤1023px**. **Laptop viewport**: width
  **≥1024px**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After a typical HUD/CSS change, the agent can finish one
  verification pass for the six phone flows in User Story 1 **without** the
  operator recording a video.
- **SC-002**: A successful run reports a result for **100%** of the flows
  the current approved tool path claims to cover (each flow: pass, fail, or
  explicit “skipped / not applicable”).
- **SC-003**: When a covered flow fails, the agent can name that flow from
  the run output or artifacts in **under 2 minutes**, without a new video.
- **SC-004**: A full local verification pass (including preview start if
  needed) completes in **under 10 minutes** on a normal developer machine.
- **SC-005**: **0** new production files, cookies, or tracking appear on
  the published site because of this feature.
- **SC-006**: **0** undeclared extra packages or browser runtimes are added
  beyond the approved Playwright path.
- **SC-007**: A laptop-width check, when the cheap path is enabled, is
  available in the **same** verification sitting as phone (not a second
  filmed session).
- **SC-008**: Tap-open and drag-open are both **actually driven** (not
  marked “not covered”) on a machine where the approved package and its
  browser are installed.

## Assumptions

- Actors are the **coding agent** and the **operator**. Visitors never see
  this feature.
- Source of truth for expected phone HUD behavior is
  `specs/015-mobile-stage-hud/spec.md` **as-built 2026-09-05** (five-icon
  growing content pill, expand === V-Flip, Info legal, theme-track
  playlist, pause flattens the wave). The 2026-09-01 mock is historical.
- `015` marks leftover open-overshoot / playlist-jump **polish as unspecified
  work**. This feature still treats “no leftover overshoot” and “no playlist
  jump” as **regression cases to detect**, because those are the failures
  that forced filming. Detection is in scope; fixing the HUD is not.
- **Approved default method** (operator granted 2026-09-05):
  1. Playwright as the agent-fit package (selectors, screenshots, traces,
     phone viewport, tap/drag, labeled artifacts).
  2. Install Playwright **mise-first** via the project toolchain file
     (`017`). `016` verify assumes those tools are on PATH / importable.
  3. Existing site preview (`astro` dev or preview already in the project).
  4. Existing `npm test` and `npm run check` / build for logic and types.
  5. A small **dev-only** harness that drives the running page and writes
     artifacts.
- **Extra-tool gate** (still in force): Puppeteer, jsdom, extra browsers
  (Firefox/WebKit), or any other new package that is not Playwright and
  not already in the repo. Same workspace rule: no silent extras.
- Alternatives considered and **not** chosen as default: PATH Chromium +
  zero packages (cannot reliably tap/drag/trace for an agent); curl-only;
  existing `npm test` alone; operator video as the happy path.
- Local agent use is enough for v1. Paid or extra CI browsers are out of
  scope unless the operator later asks.
- Constitution IV: any new published JS is forbidden; a Node script the
  visitor never downloads is acceptable.
- Constitution VII: artist guide does not need a new “run the HUD harness”
  section. Developer README MAY mention the command in one short note.

## Dependencies

- `015-mobile-stage-hud` — as-built phone HUD (expected outcomes).
- `019-desktop-chrome-polish` — laptop HUD when the cheap second
  viewport is included (`009` / `011` meaning still applies under that
  chrome).
- `006-landing-intro` — chrome hidden until intro is dismissed.
- `017-mise-toolchain` — committed mise config that pins Node and
  Playwright; `016` verify assumes those tools. `017` may land as a spec
  after this feature’s implementation; implementers still follow the
  mise-first install path documented in research.
- Existing project scripts: `npm test`, `npm run check`, `npm run build`,
  `npm run dev` / `npm run preview`.

## Out of Scope

- Changing visitor-facing HUD, motion, or copy
- Installing undeclared extra packages (Puppeteer, jsdom, extra browsers)
  without operator approval
- Operator-filmed video as the documented primary path
- New site routes, embeds, analytics, or cookies
- Paid CI, new hosting, or a second visitor-facing test framework
- A full visual-diff / golden screenshot platform (v1 is labeled shots +
  measurable checks + optional traces)
- Fixing `015` leftover polish (overshoot / playlist jump) — only detecting
  them if they still happen
- Overwriting `specs/015-mobile-stage-hud/`
- Implementing the committed `mise.toml` as the `017` feature (this feature
  consumes that toolchain; it does not own the formal toolchain spec)
