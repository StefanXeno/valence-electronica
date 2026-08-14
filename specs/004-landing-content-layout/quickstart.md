# Quickstart & Validation: Landing Stage

**Date**: 2026-08-14 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 22+ (LTS) and npm
- Feature branch `004-landing-content-layout` with implementation complete
- Example jukebox Markdown + media paths that resolve under `public/` (see
  [contracts/stage-content.md](./contracts/stage-content.md))

## Local development

```bash
npm install
npm run dev       # http://localhost:4321/valence-electronica/
```

## Quality gates (same as CI)

```bash
npm run check
npm run build
npm run preview
```

## Validation scenarios (map to spec)

1. **US1 — free center**: Laptop and ~320px phone. Expect: atmosphere in the middle; name
   + hook, jukebox, and socials visible as compact chrome; About/lyrics/discography/tour
   **closed**; no stacked document; no horizontal scroll.
2. **US2 — jukebox switch**: With two example entries, pick the non-default. Expect: theme
   + clip identity change, lyrics follow, **no full reload**, audio stays muted until
   unmute; unmute then switch again keeps unmuted if the new entry has audio. Reload:
   default entry again (SC-012). Reduced motion: static fallback + theme still follow the
   pick.
3. **US3 — About + socials**: Open About; read placeholder bio; center stays open. Socials
   visible without opening a panel; active link → new tab. Temporarily empty
   `about/me.md` body → About control hidden; restore after.
4. **US4 — lyrics**: Open lyrics on default (has placeholder lines). Switch jukebox →
   lyrics change (or empty-state string). Long text scrolls **inside** the panel.
5. **US5 — discography**: See Example Single + Example EP. Single has “Play on stage”;
   EP does not. Stage button switches jukebox like (2). Bandcamp (or example) URL → new
   tab, jukebox unchanged. Move both release files aside → control remains with
   “No releases yet” (or chrome copy).
6. **US6 — tour**: No show files (v1). Open tour → “No upcoming dates” (or chrome copy),
   control still there. Add a dated-in-the-past show → not listed. Add a future show →
   listed soonest-first; ticket link → new tab.
7. **US7 — non-programmer edit**: Change `chrome.md` `aboutTitle`, one lyric line, Example
   EP title, and tagline in `site.json` only. Refresh. Expect those strings to update; no
   component edits. Follow README “Editing content”.
8. **FR-020 omit**: Add a show Markdown missing `city`. Expect: build succeeds, that show
   absent, rest of stage present (SC-013).
9. **Legal + mute**: Open Impressum overlay (`002`); Exit works; mute not covered by an
   open panel; new controls are **not** glitched (`003` closed set).
10. **Privacy / weight**: No third-party players or cookies; chrome readable before video
    finishes buffering.

## Reference

- Data shape: [data-model.md](./data-model.md)
- Files: [contracts/stage-content.md](./contracts/stage-content.md)
- HUD behavior: [contracts/stage-ui.md](./contracts/stage-ui.md)
