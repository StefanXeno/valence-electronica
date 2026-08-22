# Research: Theme Pack System

**Date**: 2026-08-22 | **Plan**: [plan.md](./plan.md)

All Technical Context items were resolved without external NEEDS CLARIFICATION markers.

## R1: Where to store pack capabilities vs presentation tokens

- **Decision**: Split responsibilities:
  - **`src/lib/theme-packs.ts`** — canonical registry: pack `id`, `capabilities`
    (`loopingVideo`, `audioEligible`, `hudGlitch`), and `resolveThemeId()` fallback.
  - **`src/styles/themes.css`** — presentation tokens only: `[data-theme='…']` color/surface
    variables (`--color-*`, `--bg-scrim`). Optional typography variables may inherit from
    `:root` in v1 without new font files.
- **Rationale**: Capabilities drive runtime decisions in `stage-switch.ts`, `glitch.ts`, and
  SSR in `BackgroundAtmosphere.astro`. CSS cannot express “should we attach `<source>` nodes?”
  or “should `play()` run?”. Color tokens belong in CSS (existing pattern from `002`).
- **Alternatives considered**:
  - **JSON under `src/data/theme-packs.json`** — rejected: duplicates typing/validation already
    done in TS; capabilities still need importing in client bundles.
  - **All-in-CSS custom properties** (e.g. `--cap-looping-video: 1`) — rejected: JS would parse
    computed styles (fragile, harder to audit than a typed registry).
  - **One file per pack** (`themes/nightmare.css` + `themes/nightmare.ts`) — rejected for v1
    (YAGNI); three packs fit one registry + one CSS file.

## R2: Eliminating scattered `nightmare-crimson` checks (SC-006)

- **Decision**: Centralize capability queries in `theme-packs.ts`:
  - `getThemePack(id)` → resolved pack (fallback to `default`)
  - `packSupportsLoopingVideo(pack, entryHasSources)` → boolean
  - `packShowsMuteWhenPlaying(pack, entryHasAudio, videoPlaying)` → boolean (existing rules)
  - `packAllowsHudGlitch(pack)` → boolean
  On theme apply (SSR + `applyStageEntry`), set on `<html>`:
  - `data-theme="{pack.id}"` (unchanged)
  - `data-hud-glitch="true"|"false"` from `packAllowsHudGlitch`
  Update `glitch.css` guards from `html:not([data-theme='nightmare-crimson'])` to
  `html:not([data-hud-glitch='true'])`. Remove `GLITCH_THEME_ID`, `VIDEO_THEME_ID`, and
  inline `'nightmare-crimson'` compares outside `theme-packs.ts`.
- **Rationale**: Spec FR-008 allows only Nightmare to glitch in v1, but future packs must
  enable glitch via registry flag — not by editing four files. Capability attribute keeps
  CSS decoupled from pack id strings.
- **Alternatives considered**:
  - Keep CSS keyed by theme id — rejected: fails SC-006 and FR-016 (new pack with glitch
    would require CSS selector edits).
  - Runtime-only JS glitch gate — rejected: CSS animations could still flash without the
    attribute gate.

## R3: Build-time validation for unknown or incomplete `themeId`

- **Decision**: Single resolver `resolveThemePack(rawThemeId)` in `theme-packs.ts`:
  - **Complete pack** (registry row + matching CSS block; `default` uses `:root` /
    `[data-theme='default']`) → use that pack; set `data-theme` to pack `id`
  - Unknown id → log `[theme] unknown themeId "…"; using default`; return full **`default`**
    pack (capabilities + colors + `data-theme="default"`)
  - Registry id without CSS → log `[theme] pack "…" incomplete (missing CSS); using default`;
    return full **`default`** pack (Option A — no split fallback; preserves FR-005)
  - Maintain a `PACK_CSS_THEME_IDS` list (or equivalent) in `theme-packs.ts` kept in sync
    with `themes.css` blocks
  Do **not** fail the whole build for unknown/incomplete ids (matches FR-006 / omit-invalid
  spirit from `004`).
- **Rationale**: Operator typo or half-finished pack must not blank the site or publish a
  mixed theme; maintainer sees warning in CI logs.
- **Alternatives considered**:
  - Fail build on unknown/incomplete id — rejected for v1: too brittle for content edits.
  - Split fallback (capabilities from registry, colors from default) — rejected: violates
    FR-005.
  - Silent fallback — rejected: hides misconfiguration.

## R4: Typography and motion optional layers (v1)

- **Decision**: Document optional token slots in the contract (`--font-display`, link hover
  tokens, ambient motion classes) but **do not ship** new values beyond current Unbounded stack.
  Nightmare glitch remains the only motion enabled via `hudGlitch: true`.
- **Rationale**: Spec FR-014 / Assumptions defer Seravek; FR-004 asks for extensibility, not
  new art direction in this feature.
- **Alternatives considered**:
  - Ship distinct fonts per pack now — rejected (IDEA-007, licensing).
  - Omit typography from contract entirely — rejected: FR-004 requires optional layers documented.

## R5: Maintainer documentation (FR-012)

- **Decision**: Dual docs:
  1. **`specs/005-theme-packs/contracts/theme-packs.md`** — normative contract (fields, checklist).
  2. **`README.md` § Theme packs** — short operational summary linking to the contract.
  Cross-link updates in `002`/`004` contracts where they mention “add CSS block only”.
- **Rationale**: SC-001 targets a 5-minute maintainer path; README is the entry point developers
  already use (`004` added content editing guide there).
- **Alternatives considered**:
  - Contract-only in specs — rejected: discoverability for routine edits.

## R6: Nightmare parity verification

- **Decision**: Treat `pre-release` behavior as golden reference for SC-003:
  - `nightmare-crimson`: same CSS token values (copy verbatim during migration)
  - `hudGlitch: true`, `loopingVideo: true`, `audioEligible: true`
  - `cyan-pulse` / `default`: `hudGlitch: false`, `loopingVideo: false`; cyan keeps poster-only
- **Rationale**: User explicitly asked to preserve Nightmare while structuring for future packs.
- **Alternatives considered**:
  - Retune Nightmare tokens during refactor — rejected: out of scope, risks SC-003.

## R7: Relationship to prior specs

- **Decision**: `005` **extends** `002` theme packs and **supersedes** scattered capability
  notes in `004` research (Nightmare-only video/glitch) with registry flags. Jukebox content
  contract (`004` stage-content) unchanged except cross-link: “new themeId needs registry +
  CSS, not component edits”.
- **Rationale**: Avoid duplicate content models; jukebox `themeId` remains the binding point.
