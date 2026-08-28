# Implementation Plan: Codebase Hardening & Quality Pass

**Branch**: `013-codebase-hardening` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-codebase-hardening/spec.md`

## Summary

Post-`012` quality pass: complete **V-Flip track detail** (blurb, credits, mentions),
**harden stage switching** (crossfade generation token, active-video metadata binding, safe
catalog JSON parse), fix **tagline ellipsis at 320px**, **remove dead lyrics/releases code**,
add **unit tests** for `theme-packs` and `stage`, update **artist guide + README**, and
**close out `011` manual QA**. No new visitor routes, no legal/SEO/mobile/media scope.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static output); existing `stage-switch.ts`, `playback.ts`,
`catalog-tracks.ts`, `TrackInfoPanel.astro`, `Hero.astro`, `Jukebox.astro`; vitest for pure
libs

**Storage**: Existing jukebox markdown + `site.json`; no new data files

**Testing**: `astro check` + `astro build`; `vitest` (+10 cases min); manual `013` +
`011` quickstarts (no browser CI)

**Target Platform**: Static hosting on GitHub Pages

**Project Type**: Static website (single Astro project at repository root)

**Performance Goals**: No new network requests or bundles beyond minimal stage-switch logic;
tagline CSS-only fix

**Constraints**: No new npm deps; no third-party scripts (V); YAGNI — no Prettier, no media
re-encode, no mobile HUD (VI); artist-guide updates in same change set (VII)

**Scale/Scope**: ~10 source files touched; delete 1 component; 2 new test files; doc edits

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Bug fixes + SSR detail fields; handoff logic client-only (existing pattern) | PASS |
| II. Zero-Cost, Zero-Ops Publishing | `npm run check` / build gates unchanged | PASS |
| III. Content-Code Separation | Credits/blurb/mentions already in jukebox frontmatter; render only | PASS |
| IV. Lightweight by Default | No new client features; tagline ellipsis; stage mutex is small addition to existing JS | PASS |
| V. Privacy & Legal Compliance | No tracking/cookies; legal placeholders unchanged (IDEA-009 out of scope) | PASS |
| VI. Simplicity & Spec-Driven Change | Targeted fixes; no catalog panel revival; no lyrics UI | PASS |
| VII. Artist-Facing Change Documentation | `docs/artist-guide.md` + README in implementation | PASS |

**Post-design re-check**: PASS — contracts bound to existing V-Flip and stage-switch surfaces;
no new artist-editable files beyond documenting existing fields.

## Project Structure

### Documentation (this feature)

```text
specs/013-codebase-hardening/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── track-detail-ui.md
│   └── stage-handoff.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── TrackInfoPanel.astro       # UPDATE — blurb, credits, mentions
│   ├── Hero.astro                 # UPDATE — tagline ellipsis CSS
│   ├── Jukebox.astro              # UPDATE — try/catch catalog parse
│   └── LyricsPanel.astro          # DELETE
├── content/
│   ├── jukebox/nightmare.md       # UPDATE — sample credits/blurb (SC-001)
│   ├── about/me.md                # UPDATE — location (operator)
├── content.config.ts              # UPDATE — remove releases collection
├── data/site.json                 # UPDATE — location align (operator)
├── lib/
│   ├── stage-switch.ts            # UPDATE — generation token, metadata rebind, lyrics sync removal
│   ├── stage.ts                   # UPDATE — remove getValidReleases
│   ├── catalog-tracks.ts          # UPDATE — remove unused getValidCatalogTracks if applicable
│   ├── theme-packs.test.ts        # NEW
│   └── stage.test.ts              # NEW
docs/
├── artist-guide.md                # UPDATE
README.md                          # UPDATE — dev-only intro replay

specs/011-vflip-now-playing/tasks.md   # UPDATE — check off manual QA when pass recorded
```

**Structure Decision**: Single-project Astro layout unchanged. Hardening concentrates in
`TrackInfoPanel` + `stage-switch` + tests/docs; no new components.

## Implementation Phases (for tasks.md)

### Phase A — P1 visitor fixes

1. Extend `TrackInfoPanel.astro` with `blurb`, `parseCredits`, `mentions`; styles for credits
   list and long-content scroll per [contracts/track-detail-ui.md](./contracts/track-detail-ui.md).
2. Add sample metadata to `nightmare.md` (or one track) for verification.
3. `stage-switch.ts`: `handoffGeneration` stale guard in `select` / `crossfadeStageEntry`.
4. Rebind `loadedmetadata` → `restartClock` on active video only after swap.
5. `Jukebox.astro` `bootStageSwitch`: try/catch around `JSON.parse`.

### Phase B — P2 polish & docs

6. `Hero.astro` tagline two-line wrap (research R4 — operator choice).
7. Remove `releases` collection + `getValidReleases`; confirm build warning gone.
8. Update `docs/artist-guide.md`, README, location content.
9. Run `011` quickstart; fix failures; update `011` task checkboxes.

### Phase C — P3 cleanup & tests

10. Delete `LyricsPanel.astro`; remove `data-lyrics-for` from `syncStageUi`.
11. Remove dead `getValidCatalogTracks` if unused.
12. Add `theme-packs.test.ts` and `stage.test.ts` (≥10 cases).
13. Run full `013` quickstart + quality gates.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Stage handoff generation token (IV) | FR-003/SC-002 — prevent overlapping crossfade corruption | Ignoring clicks while busy fails UX |
| Active-video metadata rebind (IV) | FR-004 — shuffle timer spurious reset | Debounce masks wrong-element listener |
| Client try/catch on catalog parse (IV) | FR-005 — one corrupt attribute must not brick landing | Build-only validation insufficient |

**Next command**: `/speckit-tasks` then `/speckit-implement`.
