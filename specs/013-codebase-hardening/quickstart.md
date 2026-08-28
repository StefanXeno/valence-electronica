# Quickstart & Validation: Codebase Hardening

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 22+ and npm
- Branch `013-codebase-hardening` with implementation complete
- [contracts/track-detail-ui.md](./contracts/track-detail-ui.md)
- [contracts/stage-handoff.md](./contracts/stage-handoff.md)

## Local development

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run check
npm test    # expect ≥67 tests (57 baseline + ≥10 new)
npm run build   # no recurring releases-directory warning
npm run preview
```

## Validation scenarios (013)

### US1 — Track detail metadata

1. Open jukebox drawer; select a track with `credits` in content (e.g. Nightmare after
   sample data added).
2. Confirm blurb (if set), release date, listen links, credits list, mentions (if set).
3. Select a track without credits → no credits/mentions blocks.
4. Switch tracks → detail panel follows active id.

### US2 — Stage handoff stress

5. Rapid-click five different tracks within three seconds → one stable theme and active row.
6. Enable shuffle; let a short clip play to end → single advance (no double-hop).
7. (DevTools) During crossfade, confirm only active `[data-bg-video]` has metadata listener.

### US3 — Tagline at 320px

8. DevTools → 320px width; force longest pool line. Confirm **no horizontal scrollbar** and
   tagline wraps to at most **two lines** (not ellipsis-only).

### US4 — Docs & build hygiene

10. Read `docs/artist-guide.md` jukebox section → blurb, credits, mentions, lyrics-not-shown.
11. Read README intro → replay marked dev-only.
12. Confirm `site.json` location matches about bio (operator edit).
13. `npm run build` → no releases-folder warning.

### US5 — Dead code audit

14. `rg LyricsPanel src/` → no imports on pages.
15. `rg 'data-lyrics-for' src/lib/stage-switch.ts` → no matches.
16. `rg getValidReleases src/` → no matches.

### US6 — Unit tests

17. `npm test` → new `theme-packs` and `stage` cases pass.

## Validation scenarios (011 close-out — FR-012)

Execute [`specs/011-vflip-now-playing/quickstart.md`](../011-vflip-now-playing/quickstart.md)
scenarios **1–13** and **6b**. Record pass/fail below; failures become fix tasks before
merging `013`.

| Scenario | Pass? | Notes |
|----------|-------|-------|
| 1 V-Flip open / close | | |
| 2 Shuffle / loop / mute | | |
| 3 Shuffle hop timing | | |
| 4 Loop on/off | | |
| 5 Track pick | | |
| 6 Toggles survive pick | | |
| 6b Toolbar layout | | |
| 7 Hop at clip end | | |
| 8 Reduced motion | | |
| 9 Keyboard | | |
| 10 Content-only labels | | |
| 11 Regression (009 HUD) | | |
| 12 Docs | | |
| 13 Build | | |

When all pass, check off `011` tasks T017, T021, T026, T033, T037, T040, T042, T043, T048.

## Reference

- [data-model.md](./data-model.md)
- [research.md](./research.md)
