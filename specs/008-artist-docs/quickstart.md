# Quickstart & Validation: Artist Change Documentation

**Date**: 2026-08-23 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Branch `008-artist-docs` with implementation complete (guide + README updates)
- Contract: [contracts/artist-guide.md](./contracts/artist-guide.md)
- A reviewer who has **not** memorized the repo layout (or simulate by using only the guide)

## No install required for primary validation

Primary path is reading Markdown on GitHub / in the editor. Optional local preview
validation only if checking secondary instructions:

```bash
npm install
npm run dev       # only to confirm documented commands still work
npm run check
```

## Validation scenarios (map to spec)

1. **SC-004 / FR-009 — inventory completeness**: Open `docs/artist-guide.md`. Confirm every
   row in the contract ship-time checklist appears (or is explicitly N/A). Fail if any
   existing content/data/media root is missing from “What you may change.”

2. **SC-001 — find the right file**: Without using README, answer:
   - Change tagline / channels → ?
   - Add a show → ?
   - Change scheduled landing default → ?
   - Add/edit a release → ?
   - Change jukebox lyrics → ?
   Expect 5/5 correct paths from the guide alone.

3. **SC-002 / US2 — refuse developer surfaces**: Ask whether these are safe for the artist:
   - `src/styles/themes.css`
   - `src/lib/theme-packs.ts`
   - `src/components/` (any file)
   Expect “no” / developer-only for each, justified by the guide.

4. **US1 — themeId selection**: Confirm guide lists existing complete `themeId`s and states
   artist may select only those; pack creation is developer-only.

5. **SC-003 / US3 — publish path**: From the guide alone, restate within ~2 minutes:
   - Primary edit: GitHub web
   - Content PR target: `pre-release`
   - Go live: PR `pre-release` → `main` (artist and/or developer)
   - Failed build: last good live site stays up
   - Local preview: optional / secondary

6. **SC-005 / FR-006 / FR-007 — pointers**: Confirm README links to `docs/artist-guide.md`
   and does not retain a full competing inventory. Confirm hub links to
   `docs/stage-schedule.md` without contradictory paths.

7. **FR-005b — no automation scope creep**: Confirm this feature did not add promote
   workflows/bots; only documentation of a normal GitHub PR.

8. **FR-010 — maintainer note**: Confirm the guide ends with a Principle VII same-change-set
   update obligation.

## Done when

All scenarios above pass. Then proceed to `/speckit-tasks` or implement per tasks.
