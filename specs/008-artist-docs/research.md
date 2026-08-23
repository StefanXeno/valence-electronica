# Research: Artist Change Documentation

**Date**: 2026-08-23 | **Plan**: [plan.md](./plan.md)

All Technical Context unknowns for this feature were resolved as follows.

## R1: Primary guide location and filename

- **Decision**: `docs/artist-guide.md` as the single primary artist-facing guide.
- **Rationale**: Matches existing `docs/stage-schedule.md` pattern; lives outside `specs/`
  (artist audience, not Spec Kit workflow); easy deep-link from README and GitHub web UI.
- **Alternatives considered**: Expand README only (fails FR-006 dual-inventory risk and
  Principle VII “dedicated” maintenance); `docs/ARTIST.md` shouty name (inconsistent with
  kebab-case docs); in-site `/docs` route (out of scope, adds pages/JS).

## R2: README vs hub authority

- **Decision**: Artist guide is **authoritative** for allowed/forbidden surfaces and
  publish flow. README keeps a short “Editing content” section that **links** to the
  guide and optionally lists 1–2 sentence pointers, but MUST NOT retain a full parallel
  inventory that can drift.
- **Rationale**: Spec edge case + FR-006/SC-005. Dual full inventories always rot.
- **Alternatives considered**: Delete all content hints from README (worse discoverability
  on repo home); keep README as full source and guide as summary (inverts Principle VII).

## R3: Inventory completeness at ship time

- **Decision**: Hub inventory MUST include every artist-editable surface present when 008
  ships, mapped from current tree:
  - `src/data/site.json`
  - `src/data/stage-schedule.json` (+ link to `docs/stage-schedule.md`)
  - `src/content/jukebox/` (incl. lyrics body, media refs, `themeId` to **existing** packs)
  - `src/content/about/`
  - `src/content/releases/`
  - `src/content/shows/`
  - `src/content/ui/chrome.md`
  - `src/content/legal/`
  - `public/images/`, `public/videos/` (placement + path references)
- **Rationale**: FR-009 / SC-004. Source of truth for “what exists” is the repo tree at
  implement time; contract checklist gates completeness.
- **Alternatives considered**: Auto-generate from glob (out of scope v1); invent surfaces
  not yet in repo (YAGNI).

## R4: Theme pack boundary in the guide

- **Decision**: Document a **table or list of current complete `themeId` values** the
  artist may select on jukebox entries. Explicitly forbid editing `src/lib/theme-packs.ts`
  and `src/styles/themes.css`. Unknown/incomplete ids fall back per existing theme-pack
  behavior — guide warns to use only listed ids.
- **Rationale**: Clarification session Option A; aligns with README today.
- **Alternatives considered**: Hide `themeId` entirely (too restrictive); document how to
  author new packs in the artist guide (developer work belongs in theme-pack contracts).

## R5: Publish flow documentation shape

- **Decision**: Two-stage prose in the guide:
  1. **Primary**: GitHub web edit → branch/commit → PR → merge into **`pre-release`**
  2. **Secondary**: Open/merge PR **`pre-release` → `main`** (artist and/or developer)
  3. **Optional**: Local clone + `npm install` / `npm run dev` / `npm run check`
  State failed CI leaves last good **live** site up. No new workflows/bots.
- **Rationale**: Spec clarifications; FR-004/005/005a/005b.
- **Alternatives considered**: Document merge-to-`main` only (wrong for this repo);
  promote automation (explicitly out of scope).

## R6: Topic-specific guides

- **Decision**: Hub links to `docs/stage-schedule.md` for schedule deep how-to; hub owns
  “which file / when to use it” one-liner. Do not fork schedule instructions into the hub.
- **Rationale**: FR-007 / User Story 4.3.
- **Alternatives considered**: Merge schedule guide into hub (harder maintenance, longer
  hub); leave schedule guide unlinked (discoverability fail).

## R7: Validation strategy (no doc test framework)

- **Decision**: Validate with [quickstart.md](./quickstart.md) human checklist mapped to
  SC-001–SC-005. Optional: developer skim for broken relative links.
- **Rationale**: YAGNI — one Markdown file does not justify a doc-lint toolchain in v1.
- **Alternatives considered**: markdown-link-check in CI (can be a later chore); Playwright
  “can the artist find X” (nonsense for repo Markdown).

## R8: Maintenance note for future features

- **Decision**: End of guide includes a short **Maintainer note**: any feature that adds,
  removes, or moves an artist-editable surface MUST update this guide in the same change
  set (Principle VII / FR-010).
- **Rationale**: Makes the constitutional obligation visible to implementers reading the
  artist doc path.
- **Alternatives considered**: Only mention in constitution (already there — still need
  pointer at the artifact that drifts).
