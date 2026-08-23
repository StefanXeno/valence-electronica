# Contract: Artist-facing guide

**Feature**: `008-artist-docs` | **Artifact**: `docs/artist-guide.md`

This contract defines the required structure and content obligations of the primary
artist-facing guide. Implementation is Markdown prose; validators are human review via
[quickstart.md](../quickstart.md).

## Authority

| Document | Role |
|----------|------|
| `docs/artist-guide.md` | Authoritative inventory + forbidden surfaces + edit/publish flow |
| `README.md` | Entry point; MUST link to the guide; MUST NOT keep a full duplicate inventory |
| `docs/stage-schedule.md` (and future topic guides) | Deep how-to for one surface; MUST be linked from the hub |

## Required sections (in order)

The guide MUST include the following sections (headings may be worded for readability but
MUST cover each obligation):

1. **Purpose** — Who this is for; that it is the safe-edit map for the site.
2. **What you may change** — Inventory of editable surfaces. Each entry MUST include:
   - Plain-language name
   - Path(s) to edit
   - What it controls on the site
   - Critical do-not-break rules for that surface (if any)
3. **Theme packs (selection only)** — List of **complete** `themeId` values the artist may
   set on jukebox entries; explicit statement that creating/editing packs (registry/CSS)
   is developer-only.
4. **What you must not change** — Developer-owned surfaces with short reasons (at least:
   layouts/components, styles, theme-pack registry/CSS, build config, CI workflows).
5. **Stable ids** — Do not rename jukebox filename slugs, `themeId`s, legal slugs, or other
   referenced ids without a developer updating matching references.
6. **How to edit (primary)** — GitHub web editor steps for allowed files.
7. **How to publish (primary)** — Open/merge PR into **`pre-release`** (self-serve).
8. **How to go live (secondary)** — Open/merge PR **`pre-release` → `main`** (artist and/or
   developer); note failed build leaves last good live site up.
9. **Optional: local preview** — Clone + `npm install` / `npm run dev` / `npm run check`
   (secondary; not required for primary path).
10. **When to ask the developer** — Escalation (stuck on git/PR, build failures, new theme
    packs, layout/visual work).
11. **Topic guides** — Links to existing operator guides (at least stage schedule).
12. **Maintainer note** — Future features that add/remove/move artist-editable surfaces
    MUST update this guide in the same change set (constitution Principle VII).

## Inventory completeness (ship-time checklist)

At feature completion, section “What you may change” MUST cover:

| Surface | Expected path |
|---------|----------------|
| Site identity & channels | `src/data/site.json` |
| Stage schedule | `src/data/stage-schedule.json` → link `docs/stage-schedule.md` |
| Jukebox entries / lyrics / media refs | `src/content/jukebox/` |
| About | `src/content/about/` |
| Releases | `src/content/releases/` |
| Shows | `src/content/shows/` |
| UI chrome copy | `src/content/ui/chrome.md` |
| Legal (Impressum / privacy) | `src/content/legal/` |
| Media assets | `public/images/`, `public/videos/` |

If a path does not exist at implement time, omit it and note why; do not invent surfaces.

## Forbidden content

- Steps that make merging content PRs **directly into `main`** the normal primary path
- Instructions to create or edit theme-pack TypeScript/CSS as an artist task
- Promote automation, bots, or one-click pipelines
- Legal advice beyond “replace placeholders before public promotion”
- Full Git curriculum beyond minimal happy-path GitHub UI / optional local commands

## Language & tone

- English
- Plain language; assume no component/CSS architecture knowledge
- Prefer “you” addressed to the artist

## Acceptance mapping

| Spec | Contract obligation |
|------|---------------------|
| FR-001 | Single primary guide at `docs/artist-guide.md` |
| FR-002 / FR-009 | Inventory section + completeness table |
| FR-003 | Forbidden section |
| FR-004 | Primary GitHub edit + optional local preview |
| FR-005 / 005a / 005b | Two-stage publish; docs-only promote |
| FR-006 | README authority rules |
| FR-007 | Topic guides section |
| FR-008 | Language & tone |
| FR-010 | Maintainer note |
| SC-001–SC-005 | Validated via quickstart review |
