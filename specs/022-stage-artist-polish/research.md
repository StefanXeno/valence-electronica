# Research: Stage Artist Polish

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

All Technical Context unknowns for this feature are resolved below.

## R1: Dual atmosphere videos — schema + viewport pick

- **Decision**: Extend jukebox (stage bed) content so every V-Flip-available
  entry provides **two** atmosphere video bindings: **mobile** and
  **desktop**. Phone viewports (≤1023px) MUST use mobile; laptop (≥1024px)
  MUST use desktop. Missing either → treat bed as incomplete (omit from
  selectable stage and/or fail loud in maintainer checks) — **never**
  silently reuse the other viewport’s file as if dual-video were satisfied.
- **Shape (locked)**: Explicit top-level fields `sourcesMobile[]` +
  `sourcesDesktop[]` on each jukebox entry. **Do not** use a nested
  `atmosphere: { mobile, desktop }` shape. Migrate existing single
  `sources[]` during implement with a one-time content update — both
  slots required before entry stays selectable.
- **Runtime**: `background.ts` / `stage-switch.ts` resolve sources via
  `matchMedia('(max-width: 1023px)')` (and resize re-resolve). Crossfade
  buffers remain two `<video>` elements for transition — not “mobile vs
  desktop” roles.
- **Rationale**: FR-003 / US3 / SC-007; extends `002`/`005` without
  rewriting full `010` catalog membership.
- **Alternatives considered**:
  - Single file + CSS crop — fails distinct asset identity (SC-007).
  - Silent fallback to the other viewport — explicitly forbidden.
  - Third “tablet” asset — YAGNI (edge case: pick exactly one of two).

## R2: Show me How must be audio-eligible with real music

- **Decision**: Content ops: set `hasAudio: true` and ship an MP4 (or
  approved bed) that **contains** audible music for Show me How. Today
  `show-me-how.md` has `hasAudio: false`. Build/maintainer checks should
  fail loud if marked audio-eligible without sources (existing rule) —
  extend checks if useful so silent broken beds do not ship.
- **Rationale**: FR-001 / US1; audio is embedded in video today (no
  separate mp3 pipeline) — keep that pattern unless artist supplies a
  different approved approach.
- **Alternatives considered**: Separate audio element — larger change,
  not required by spec. Leave `hasAudio: false` — fails US1.

## R3: Taking Over brighter theme; “cut” is content ops only

- **Decision**: Brighten Taking Over’s presentation via theme tokens
  (`acid-lime` in `themes.css` and/or a dedicated brighter pack) so HUD/
  surfaces read clearly brighter vs pre-change, while preserving contrast
  (FR-009 / constitution IV). **Do not** build in-product trim/cut tooling
  (FR-011). Operator may swap media files outside this feature.
- **Rationale**: US2; Clarifications ignore “cut” as product scope.
- **Alternatives considered**: Per-track brightness CSS variable only on
  overlays — may be enough; full new theme pack if acid-lime shared by
  others (check usage before mutating shared tokens).

## R4: NCS center-stage logo via content flag

- **Decision**: Add content-configurable center-stage logo (NCS mark)
  shown only when the active entry opts in (e.g. `centerLogo: /images/…`
  or `centerLogoId: ncs`). New lightweight overlay component in stage
  center; must not block primary nav/player hit targets. Owner-approved
  asset only — no random marks.
- **Rationale**: FR-004 / FR-010; no hook exists today.
- **Alternatives considered**: Hardcode NCS on Taking Over only — fights
  constitution III. Corner badge — fails “center” requirement.

## R5: Minecraft sprites — verify absent; keep absent

- **Decision**: Codebase recon finds **no** visitor-facing Minecraft
  sprite layer today. Tasks: verify zero sprites in stage presentation;
  do not reintroduce. Tagline pool string mentioning Minecraft is
  unrelated copy — out of scope unless operator asks. Assets may remain
  unused in repo (spec assumption).
- **Rationale**: FR-005 / SC-003; avoid false “removal” churn.
- **Alternatives considered**: Delete tagline easter-egg string — not
  required by FR-005.

## R6: New shuffle visual; behavior unchanged

- **Decision**: Replace shuffle glyph/treatment in `HudIcon` /
  `shuffleIcon` chrome so reviewers see a recognizably new silhouette or
  metaphor (not a trivial recolor). Keep on/off `aria-pressed` semantics
  (`021`/`011` meanings).
- **Rationale**: FR-006 / US5; appearance owned here, behavior not.
- **Alternatives considered**: Color-only tweak — fails acceptance
  “not a trivial color tweak alone.”

## R7: Phone bottom player — tap sufficient (swipe optional)

- **Decision**: Ensure open-player → song-change completes via **tap
  alone**. As-built already has click/pointer tap paths; verify after
  `021` selection-first that no flow requires swipe. Swipe/drag may
  remain sugar. Hints must not imply swipe-only. Partially supersedes
  `015` swipe-required reading.
- **Rationale**: FR-007 / US6; depends on `021` selection surface.
- **Alternatives considered**: Remove swipe entirely — unnecessary if tap
  is sufficient.

## R8: Sibling boundaries

- **Decision**: Do not reintroduce circular side docks (`020`) or
  currently-playing-as-default (`021`). Dual-video resolver must be what
  `021` treats as opaque. Links retention stays `020`.
- **Rationale**: FR-008; Dependencies.
- **Alternatives considered**: Bundle dual-video into `021` — rejected;
  `022` owns media binding extension.

## R9: Artist docs for dual video + logo + audio

- **Decision**: Update `docs/artist-guide.md` for mobile/desktop video
  pairing, NCS/center logo field, Show me How audio expectation, and
  theme brightness ownership (content vs developer theme CSS).
- **Rationale**: Constitution VII / FR-010.
