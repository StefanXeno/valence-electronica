# Contract: Stage Content Files

**Date**: 2026-08-14 | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

Maintainer-facing contract. A non-programmer edits these files the same way as
`src/content/legal/*.md`. Do not rename stable ids (`jukebox` filename, `channels[].id`,
`jukeboxId` bindings) without a developer.

This contract **replaces** `src/data/background.json` from feature `002` as the song/
atmosphere catalog. Atmosphere *behavior* (mute, reduced motion, legal overlay) still
follows `specs/002-themed-background-video/contracts/background-content.md`, except
`data-theme` and media follow the **active** jukebox entry during a visit.

## `src/content/ui/chrome.md`

```markdown
---
aboutTitle: About me
lyricsTitle: Lyrics
discographyTitle: Discography
tourTitle: Tour
stageButtonLabel: Play on stage
emptyLyrics: Lyrics not available
emptyReleases: No releases yet
emptyShows: No upcoming dates
---
```

Rules:

- One file. Change labels here, not in components.
- Empty-state strings are what visitors see when lists/lyrics are empty.

## `src/content/about/me.md`

```markdown
---
---

EXAMPLE PLACEHOLDER — replace with a real short bio.

Valence is an electronic music project from Augsburg, Germany.
```

Rules:

- Empty body or missing file → About control is **hidden**.
- English. A few short paragraphs max.

## `src/content/jukebox/<id>.md`

```markdown
---
label: Example Single
themeId: nightmare-crimson
hasAudio: true
poster: /images/posters/placeholder-loop.jpg
default: true
sources:
  - src: /videos/placeholder-loop.mp4
    type: video/mp4
---

EXAMPLE PLACEHOLDER LYRICS

Verse lines go here.
```

Rules:

- Filename slug is the stable `id` (used by `Release.jukeboxId`).
- Exactly one file SHOULD set `default: true`. Resolver still picks a valid default if
  marking is wrong (warn, do not blank the page).
- Body = lyrics for that entry. Empty body → lyrics panel shows `emptyLyrics`.
- `themeId` must match a pack in `src/styles/themes.css` (unknown → `default` pack).
- Media paths are site-root paths under `public/` (honor Astro `base` when emitting).
- Missing required logical fields → **omit this entry**, build the rest (FR-020).
- Adding a new clip: drop files in `public/videos/` + `public/images/posters/`, then add
  a Markdown file. New `themeId` values still need a CSS pack (developer).

v1 example set:

- `placeholder-loop.md` — existing NIGHTMARE temp media, `default: true`,
  `nightmare-crimson`
- `example-cyan.md` — **same** MP4/poster, `themeId: cyan-pulse`, example lyrics (proves
  switch without a second video file)

## `src/content/releases/<slug>.md`

```markdown
---
title: Example Single
year: 2024
kind: single
jukeboxId: placeholder-loop
url: https://valenceelectronica.bandcamp.com/
---
```

```markdown
---
title: Example EP
year: 2025
kind: ep
---
```

Rules:

- `title` + `year` required or the row is omitted.
- `jukeboxId` optional; stage button only if it matches a **valid** jukebox id.
- `url` optional; if present, open in a new tab; row click does **not** switch the stage.
- Ship at least these two example files (bound + unbound), clearly marked EXAMPLE in
  title or a comment in the file.

## `src/content/shows/<slug>.md`

```markdown
---
date: 2026-12-31
city: Augsburg
venue: Example Venue
ticketUrl: https://example.com/tickets
---
```

Rules:

- `date`, `city`, `venue` required or the show is omitted.
- Timezone for “upcoming”: Europe/Berlin, calendar date.
- Past dates are not listed on the stage. v1 may ship **zero** show files.

## `src/data/site.json`

Unchanged shape from `001` (`artist`, `seo`, `channels`). Stage identity uses
`artist.name` + `artist.tagline`. Channel records stay the socials chrome.

## Deployment contract (unchanged)

- Trigger: push to `main`.
- Gates: `astro check` and `astro build`. Whole-build failure → previous live version
  stays. A single omitted list item MUST NOT fail the build by itself.
- Output: `dist/` on GitHub Pages.

## README

Extend the existing “Editing content” section so a non-programmer can find each file
type, the omit-invalid-item rule, and “do not rename ids”.
