# Research: V-Flip Now Playing

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

All Technical Context items for this feature were resolved as follows.

## R1: Collapsed V-Flip is one shell (vinyl + mute)

- **Decision**: Mount mute/volume **inside** `[data-jukebox]`, not as a `StageDock` sibling.
  Collapsed chrome is one bordered shell: vinyl `<summary>` plus mute control in a
  horizontal cluster. Unmute expands the **same** shell (existing pill + slider). Open
  header keeps the same mute instance (one DOM control, not a copy).
- **Rationale**: Spec FR-004 forbids a second dock circle. Reusing `MuteControl.astro`
  (logic unchanged) avoids duplicating volume/glitch/sync code.
- **Alternatives considered**:
  - Keep sibling mute, fake “same box” with CSS gap: 0 — still two hit shells / two
    borders (rejected; fails FR-004).
  - Merge mute into the vinyl button — cannot unmute without opening V-Flip (rejected;
    SC-003).

## R2: Open player layout (single scroll column)

- **Decision**: Open V-Flip is a **now-playing column**, not tabs:

  1. **Header** — vinyl (fixed anchor cell) + **active track name** (not chrome
     `jukeboxLabel`) + mute/volume.
  2. **Transport** — shuffle toggle + loop toggle (icon buttons, `aria-pressed`).
  3. **Body** (one scroll): track info (active entry) → lyrics (active entry) → song
     list.

  Open width: `min(22rem × --hud-scale, viewport − dock insets)` so lyrics/info are
  readable; still peripheral. Section headings use existing `trackInfoTitle` /
  `lyricsTitle` chrome strings.
- **Rationale**: Spec left stacking to plan. One column is YAGNI, keyboard-simple, and
  reuses `[data-lyrics-for]` / `[data-track-info-for]` hide/show from `stage-switch.ts`.
- **Alternatives considered**:
  - Tabs (Info / Lyrics / List) — extra click to reach lyrics (rejected for P1).
  - Keep 13rem list width — too tight for lyrics (rejected).

## R3: Remove Lyrics and Track info HUD icons

- **Decision**: Delete those two `<details>` from `StagePanels.astro`. Right dock:
  About (if any), Discography, Tour. Move `LyricsPanel` + `TrackInfoPanel` bodies into
  `Jukebox.astro`. Keep chrome keys `lyricsTitle` / `trackInfoTitle` as **section
  headings** inside V-Flip (not dock labels). Optional `lyricsIcon` / `trackInfoIcon`
  unused on the dock; may remain in chrome for heading decoration (YAGNI: headings are
  text-only unless polish wants icons).
- **Rationale**: FR-005. `010` now-playing **popover** / Tracks panel (if present) is
  not restyled here; only the **Track info dock icon** is removed. Discography stays.
- **Alternatives considered**: Keep dock icons as duplicates (rejected; spec).

## R4: Shuffle / loop state (visit-only)

- **Decision**: Module state in new `src/lib/playback.ts` (or extend `stage-switch.ts`
  with a dedicated playback helper). Defaults from chrome booleans
  `shuffleDefault` / `loopDefault` (ship **true** / **false**). No `localStorage`, no
  cookies. Reload resets. Manual jukebox/discography pick does **not** reset toggles
  (FR-023).
- **Rationale**: Spec FR-026 + constitution V. Intro already uses storage; do not pile
  more visit prefs without a privacy feature.
- **Alternatives considered**: Persist toggles in `localStorage` (rejected; out of
  scope). Always-on shuffle (rejected by owner).

## R5: Advance clock (45s vs video.duration)

- **Decision**: Do **not** rely on `video.ended` for today’s catalog (clips are short
  seamless **loops**; `ended` would fire in seconds). Classify dwell as:

  | Condition | Advance after |
  | --------- | ------------- |
  | `hasAudio: true` and atmosphere video playing with known duration | **`HTMLMediaElement.duration`** (from `loadedmetadata`) |
  | `hasAudio: true` but poster/fallback only (duration unknown) | **45s** |
  | `hasAudio: false` (no song / no audio) | **45s** |

  Timer starts when the entry becomes active **and** intro is not pending/active
  (`html` has neither `data-intro-pending` nor `data-intro-active`). For audio
  entries, restart the clock when video metadata arrives if shuffle is on and loop
  is off. Clear/restart on manual pick or hop. Shuffle hop only if shuffle on,
  loop off, ≥2 entries.
- **Rationale**: Owner Q2:A — song length follows the **stage video file**; today's short loop beds hop on file length until full-length videos ship (accepted).
- **Alternatives considered**:
  - `ended` on `loop=false` — chops 8–20s loop files (rejected).
  - Optional content `durationSeconds` — rejected; no artist-maintained duration field.
  - Fixed 150s default for songs — rejected (owner Q2:A).

## R6: Loop toggle vs `<video loop>`

- **Decision**: Visitor **loop** is a **playback mode**, not the HTML `loop` attribute
  of the atmosphere bed. Atmosphere video **keeps looping** as a visual bed (today’s
  `002` behavior) unless a later finite-file feature says otherwise. Visitor loop-on
  means: **cancel shuffle timer**, stay on this id. Visitor loop-off + shuffle-off:
  stay on this id, no hop (timer not started). Visitor loop-off + shuffle-on: timer
  may hop even while the short video file visually loops.
- **Rationale**: Spec loop = pin track/theme, not “play the mp4 once.” Changing
  `video.loop` would make short beds freeze after one pass.
- **Alternatives considered**: Set `video.loop = false` when visitor loop is off —
  breaks atmosphere for current assets (rejected).

## R7: Smooth handoff (crossfade)

- **Decision**: Stack a second `<video data-bg-video-next>` in
  `BackgroundAtmosphere.astro`. On allowed hop / manual pick that changes id:
  1. Load next sources on the incoming layer; start playback (respect `keepMuted`).
  2. Crossfade opacity **700ms** (`cubic-bezier(0.4, 0, 0.2, 1)` — same ease as `009`
     panels). Outgoing muted immediately if incoming will play with sound, to avoid
     double-audio.
  3. Swap roles; `html[data-theme]` updates at fade **start** so chrome colors ease
     with the picture. Add `color` / `background-color` / `border-color` /
     `text-shadow` transitions on `html` (~700ms) **only when**
     `data-stage-crossfade="true"` (set for the hop, then cleared).
  4. `prefers-reduced-motion: reduce`: skip video crossfade; instant source swap +
     instant theme (existing fallback path).
  5. Glitch HUD stays for controls; hop itself is this smooth fade (spec: not a
     glitch smash).
- **Rationale**: Single-element `src` swap is a hard cut (fails FR-022). Dual layer is
  first-party, no extra deps. 700ms reads as a player change without feeling sluggish.
- **Alternatives considered**:
  - CSS-only theme fade, hard video cut — still a picture cut (rejected).
  - Web Audio gain ramps — extra complexity; video.volume is enough (rejected).
  - 300ms cut — too snappy for “music player” (rejected).

## R8: Shuffle pick

- **Decision**: Uniform random among catalog ids **except** the current id. No
  shuffle-bag in v1 (spec allows it later). Seed: `Math.random()` (not crypto; not a
  security context).
- **Rationale**: FR-019 no immediate repeat. Bag is extra state (YAGNI).
- **Alternatives considered**: Fisher–Yates bag (deferred). Sequential next (rejected;
  owner asked random).

## R9: Icon tokens and chrome

- **Decision**: Add HUD tokens `shuffle` and `loop` in `hud-icons.ts` / `HudIcon.astro`.
  Chrome fields: `shuffleLabel`, `loopLabel`, `shuffleIcon`, `loopIcon`,
  `shuffleDefault` (boolean, default true), `loopDefault` (boolean, default false).
  Label reveal on closed transport buttons when V-Flip is open still uses
  `data-hud-label` **or** skip floater (open panel already suppresses floating labels
  on the vinyl summary). Transport buttons live in the open body — use `aria-label` +
  `aria-pressed`; optional `data-hud-label` above if they sit in the header.
- **Rationale**: Constitution III + existing icon pipeline. No new npm.
- **Alternatives considered**: Unicode-only 🔀🔁 (inconsistent OS; fallback only).

## R10: Client JS budget (constitution IV)

- **Decision**: Justified new/extended JS:
  1. `playback.ts` — shuffle/loop flags, dwell timer, intro-gated start, random next.
  2. Crossfade orchestration in atmosphere/stage-switch (opacity + theme flag).
  3. Existing mute, stage-switch, panel-motion, label-reveal **reused**.
- **Rationale**: Impossible in CSS: timers, random pick, dual-video fade, intro gate.
- **Alternatives considered**: Full page reload per hop (rejected; loses unmute and
  feels like a document).

## R11: Tests

- **Decision**: Vitest for `dwellSeconds()` (with mocked video duration), `pickOtherId()`,
  and chrome default coercion. Manual [quickstart.md](./quickstart.md) for HUD +
  hop timing (use a **short known-length mp4** already in catalog — do not wait 45s
  in CI). For SC-008 (45s no-song), quickstart may temporarily set `hasAudio: false`
  on one entry in a **local-only** edit, wait 45s+, confirm hop, then revert.
- **Rationale**: CI cannot wait 45s or arbitrary video lengths. Unit-test the classifier
  with injected durations; manual for HUD and real file-length hops.

## R12: Contract supersession

- **Decision**: `009/contracts/desktop-hud-ui.md` left cluster and on-demand row are
  **amended by** this feature’s UI contract. `010` Track info **dock icon** /
  now-playing popover placement is superseded for desktop: info lives in V-Flip.
  `004` jukebox switch semantics stay; mute **position** moves.
- **Rationale**: Constitution VI — layout authority must be explicit.

## R13: Mute / volume tooltips

- **Decision**: Use the existing **HUD label-reveal** floater for:
  1. Mute/volume **button** — `data-hud-label` swaps between chrome `unmuteTooltip`
     and `muteTooltip` with mute state (same strings may back `aria-label`).
  2. Volume **slider** — `data-hud-label` = chrome `volumeSliderTooltip` (default
     “Drag to adjust volume”) while the slider is visible.
  Anchor `above`. Do **not** suppress these when V-Flip is open (unlike vinyl
  summary floating label). Reduced motion: show hint without travel animation.
- **Rationale**: Matches dock discoverability; chrome-editable (constitution III);
  avoids relying on native `title` alone (slow/inconsistent).
- **Alternatives considered**: Native `title` only (rejected for UX consistency);
  always-visible caption text (rejected; clutters collapsed box).
