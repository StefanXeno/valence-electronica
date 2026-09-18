# Research: Jukebox Easter Egg & Song-Select First

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

All Technical Context unknowns for this feature are resolved below.

## R1: Default player surface = song selection (both breakpoints)

- **Decision**: At rest, laptop (≥1024px) and phone useful-open state show
  **song selection** (theme-track / catalog list), **not** the solo
  “Currently playing” card. Flip today’s default: boot with selection
  visible (`is-theme-tracks` true or inverted semantics). Choosing a
  track is **one** primary action from the visible list (FR-002).
- **Rationale**: US1 / FR-001; Hendrik feedback; supersedes `019`
  currently-playing-first and `015`/`018` phone expanded-header default.
- **Alternatives considered**:
  - Keep solo default + bigger playlist button — still extra obligatory
    step (rejected).
  - Full-screen song picker — kills center stage (fails FR-008).

## R2: Optional now-playing is secondary, not home state

- **Decision**: Preserve a way to see active track detail (title/card
  context) via an explicit opt-in control (repurpose today’s playlist
  toggle as “now playing” / detail, or a quiet secondary control). Reload
  and default return land on **selection** again (FR-006 / US3).
- **Rationale**: Useful feedback without fighting selection-first.
- **Alternatives considered**: Delete now-playing entirely — loses
  identity feedback (rejected). Keep currently-playing as default —
  fails SC-005.

## R3: Vinyl is the V-Flip easter-egg entry (quiet brand object)

- **Decision**: Reintroduce a **visible vinyl** control visitors can
  click/tap to open the V-Flip easter egg (historical `011` compact vinyl
  → open jukebox). Vinyl is **not** in `020` top menu, **not** the default
  player tab label, **not** required for song changes. Forbidden discovery:
  unmarked corners, konami, long-press-only.
- **Placement**: Prefer a quiet **stage-adjacent / player-peripheral**
  vinyl brand object (not a labeled primary CTA). Today’s toolbar vinyl is
  CSS-hidden on phone and desktop — unhide and/or relocate so it is
  discoverable but not primary chrome. Must remain clickable under `020`
  top nav (no overlap bury).
- **Rationale**: FR-003–FR-005; operator clarification.
- **Alternatives considered**: Handle-only phone expand as sole V-Flip —
  fails explicit vinyl discovery. Labeled “V-Flip” menu item — fails
  FR-004.

## R4: What “V-Flip easter egg” means in the as-built DOM

- **Decision (locked)**: Vinyl click/tap **MUST** open the richer
  **TrackInfoPanel** / legacy list+detail drawer
  (`.jukebox__section--list`). The **default** player body remains
  Discography theme-track selection cards. Casual path never requires
  opening that drawer. Not optional / not “prefer another target.”
- **Rationale**: Selection already lives in Discography cards; V-Flip
  lore/detail stays behind vinyl without blocking song changes; historical
  `011` vinyl path.
- **Alternatives considered**: Vinyl only toggles `is-open` with same
  selection list — weak “easter egg” differentiation (rejected). Rebuild
  separate mini-app — YAGNI. Alternate unmarked DOM target — rejected.

## R5: Preserve playback meanings; shuffle look deferred

- **Decision**: Keep shuffle on/off, mute eligibility, hop timing for
  audio vs no-audio entries as in as-built `011` meaning unless a sibling
  overrides. Loop stays absent on phone/desktop chrome. **Shuffle visual**
  redesign is owned by `022` — this feature may keep current glyph.
- **Rationale**: FR-007; Assumptions.
- **Alternatives considered**: Redesign shuffle here — scope bleed into
  `022` (rejected).

## R6: Phone open lands on selection; tap path coordination with 022

- **Decision**: When the phone player reaches its useful open state,
  default body is song selection. Collapse may reset optional
  now-playing. **Tap-vs-swipe** sufficiency is owned by `022` (FR-007
  there); `021` must not require swipe to see selection once open.
- **Rationale**: US1 phone acceptance; dependency on `022` for gesture.
- **Alternatives considered**: Require swipe to reveal list — conflicts
  with `022` and casual UX.

## R7: Do not assume single shared video per track

- **Decision**: Player/jukebox UX and catalog JSON consumption MUST treat
  atmosphere media as opaque / viewport-resolvable. Do not hardcode
  “one file per track” in selection UI. Dual mobile/desktop videos are
  specified in `022` (FR-011 here).
- **Rationale**: FR-011; avoid blocking `022`.
- **Alternatives considered**: Bake `sources[0]` into player components —
  creates dual-video debt (rejected).

## R8: Depend on 020 chrome; do not reintroduce circular docks

- **Decision**: Implement against simplified top nav / no circular side
  docks from `020`. Player chrome stays peripheral; no V-Flip in top menu
  (FR-004 / FR-010).
- **Rationale**: Sibling ownership; FR-010.
- **Alternatives considered**: Ship 021 before 020 — risks double chrome
  churn (spec Dependencies prefer 020 first).

## R9: Content-editable player strings

- **Decision (locked)**: New chrome fields `songsTitle`,
  `nowPlayingOpenLabel`, `vinylLabel` (Title/Label style aligned with
  `020`). Do not dual-option retarget `jukeboxPanelTitle` /
  `playlistLabel` / `jukeboxLabel` as the primary names — those remain
  legacy/fallback or easter-egg drawer title only.
- **Rationale**: FR-009; constitution III / VII; matches `020` field style.
- **Alternatives considered**: Retarget existing names only — rejected
  (ambiguous for artists + dual-option analyze caveat).
