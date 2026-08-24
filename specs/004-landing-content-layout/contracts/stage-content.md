# Contract: Stage Content Files

**Date**: 2026-08-14 (as-built sync 2026-08-24) | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

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
jukeboxLabel: V-Flip
socialsLabel: Socials
comingSoon: coming soon
ticketLabel: Tickets
introLead: "Hi I'm"
introName: Valence
---
```

Rules:

- One file. Change labels here, not in components.
- Empty-state strings are what visitors see when lists/lyrics are empty.
- `introLead` / `introName` are owned by feature `006` (landing portal). Empty
  `introName` disables the intro.

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
poster: /images/posters/nightmare.jpg
default: true
sources:
  - src: /videos/nightmare.mp4
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
- `themeId` must match a **complete** theme pack (`src/lib/theme-packs.ts` registry entry
  **and** `[data-theme='…']` block in `src/styles/themes.css`; see
  `specs/005-theme-packs/contracts/theme-packs.md`). Unknown or incomplete → full
  `default` pack at runtime (build warns).
- Media paths are site-root paths under `public/` (honor Astro `base` when emitting).
- `sources` optional. Looping video + unmute audio follow the bound pack’s capabilities
  (`loopingVideo`, `audioEligible`) when sources exist. Poster-only entries use
  `hasAudio: false`; mute stays hidden while they are active.
- Missing required logical fields (`label`, `poster`) → **omit this entry**, build
  the rest (FR-020).
- Adding a new clip: drop poster (and optional video) in `public/`, then add a
  Markdown file. New `themeId` values need a complete pack (registry + CSS — developer).

v1 example set:

- `nightmare.md` — NIGHTMARE temp media, `default: true`,
  `nightmare-crimson`, MP4 + poster, `hasAudio: true`
- `example-cyan.md` — **poster only** (`/images/posters/placeholder-cyan.svg`),
  `themeId: cyan-pulse`, no `sources`, `hasAudio: false` (static still, no mute)

## `src/content/releases/<slug>.md`

```markdown
---
title: Example Single
year: 2024
kind: single
jukeboxId: nightmare
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
date: 2026-12-05
city: Augsburg
venue: Example Venue
ticketUrl: https://valenceelectronica.bandcamp.com/
---

EXAMPLE PLACEHOLDER SHOW — replace with a real date.
```

Rules:

- `date`, `city`, `venue` required or the show is omitted.
- Timezone for “upcoming”: Europe/Berlin, calendar date.
- Past dates are not listed on the stage.
- v1 ships `example-augsburg.md` (clearly marked EXAMPLE). Zero `.md` files in
  the folder is still a valid empty state after that file is removed. The
  collection loader MUST keep `shows` addressable when empty (do not rely on
  Astro’s default glob, which omits empty folders and makes `getCollection`
  warn).

## `src/data/site.json`

Unchanged shape from `001` (`artist`, `seo`, `channels`). Stage identity uses
`artist.name` + `artist.tagline`. Channel records stay the socials chrome.

## Deployment contract (unchanged)

- Trigger: push to `main`.
- Gates: `astro check` and `astro build`. Whole-build failure → previous live version
  stays. A single omitted list item MUST NOT fail the build by itself.
- Output: `dist/` on GitHub Pages.

## README

Point operators at [`docs/artist-guide.md`](../../../docs/artist-guide.md) (feature
`008`) for the full inventory, omit-invalid-item rule, and “do not rename ids”.
README is an entry link, not a second full guide.
