# Quickstart: Track Catalog & Song Identity

**Feature**: `010-track-catalog` | **Contracts**: [track-catalog-content.md](./contracts/track-catalog-content.md), [track-catalog-ui.md](./contracts/track-catalog-ui.md)

## Prerequisites

- Node 22+, `npm install`
- Branch `010-track-catalog`
- Intro skipped or completed (`localStorage` / Escape)

## Setup

```bash
npm run dev
# open http://localhost:4321/valence-electronica
```

## Scenario 1 — Catalog lists all tracks (P1)

1. Load landing on laptop width (~1280px).
2. Open the **Tracks** icon in the dock (right segment).
3. **Expect**: Four rows (Nightmare, Taking Over, Show ME How, Example Cyan).
4. **Expect**: Newest `sortDate` first; each row shows title + year.
5. Open Lyrics, then open Tracks — **Expect**: Lyrics closes (exclusive open).

## Scenario 2 — Content-only update (P1)

1. Edit `src/content/jukebox/taking-over.md` — change `blurb` or `sortDate`.
2. Reload dev server / refresh.
3. **Expect**: Catalog row updates without component edits.

## Scenario 3 — Now-playing + listen links (P2)

1. Configure at least one `listenLinks` entry on Taking Over.
2. Select Taking Over in jukebox.
3. Click **Track info** icon (left cluster, beside jukebox).
4. **Expect**: Title matches catalog; platform link visible.
5. Click link — **Expect**: new tab, correct URL, no audio autoplay.
6. Switch to Nightmare — **Expect**: popover closes or updates to Nightmare metadata.

## Scenario 4 — Credits and mentions (P3)

1. Add `credits` and `mentions` to one jukebox file only.
2. Open Track info for that entry.
3. **Expect**: Credits list and mentions text appear.
4. Open Track info for a track without credits — **Expect**: no empty “Credits” heading.

## Scenario 5 — Regression guard

1. Jukebox switch still updates atmosphere, theme, lyrics, mute visibility.
2. Discography still lists releases (not replaced by Tracks panel).
3. Keyboard: Tab to Tracks panel, open with Enter, close with Escape.

## Scenario 6 — Build validation

```bash
npm run check
npm run build
npm test
```

**Expect**: clean check/build; vitest covers catalog sort helpers.

## Scenario 7 — Reduced motion

1. Enable `prefers-reduced-motion: reduce`.
2. Open Tracks panel and Track info popover.
3. **Expect**: content usable; no required motion to read links.

## Scenario 8 — Artist guide

After implementation, confirm `docs/artist-guide.md` documents new jukebox fields and chrome
keys (`catalogTitle`, `nowPlayingLabel`, etc.).
