# Quickstart: Discography-Only Tracks

**Feature**: `014-discography-only-tracks`

**Contracts**: [tracks-content.md](./contracts/tracks-content.md),
[discography-merge.md](./contracts/discography-merge.md)

## Prerequisites

- Branch `014-discography-only-tracks` (or feature worktree)
- Node 22+, dependencies installed
- Local dev: `npm run dev`

## Scenario 1 — Catalog-only track in Discography (US1)

1. Add `src/content/tracks/example-back-catalog.md`:

   ```yaml
   ---
   label: EXAMPLE — Back Catalog Single
   sortDate: 2015-01-01
   kind: single
   ---
   ```

2. `npm run build` (or reload dev server).
3. Open landing → Discography panel.
4. **Expect**: New row with title, `2015 · single`, no stage/play button.
5. Open V-Flip jukebox drawer.
6. **Expect**: Title **not** in selectable track list.

## Scenario 2 — Listen link on catalog-only row (US1)

1. Add to the same file:

   ```yaml
   listenLinks:
     - platform: spotify
       url: https://open.spotify.com/track/example
   ```

2. Rebuild / reload.
3. **Expect**: **Listen On** row with platform icon(s); title is plain text (not a link).

## Scenario 2b — Listen links on V-Flip track (US2)

1. Open a jukebox-backed discography row that has `listenLinks` in content.
2. **Expect**: Same **Listen On** icon row as catalog-only entries.

## Scenario 2c — Currently playing (US2)

1. Open Discography; note the active V-Flip track row.
2. **Expect**: **Currently playing** badge with subtle EQ animation (or static bars under
   reduced motion); **Play on V-Flip** hidden on that row.
3. Switch to another track in V-Flip.
4. **Expect**: Previous row shows **Play on V-Flip** again; new active row shows **Currently playing**.

## Scenario 3 — Jukebox rows unchanged (US2)

1. With example track from Scenario 1 loaded, open Discography.
2. **Expect**: All existing jukebox releases with `sortDate` still present.
3. **Expect**: Stage button on rows that had it before (e.g. entries with valid stage assets).
4. Pick a stage-backed release via Discography stage button.
5. **Expect**: V-Flip/atmosphere switches as before.

## Scenario 4 — Id collision: jukebox wins (US2)

1. Create `src/content/tracks/nightmare.md` mirroring a different `label` / `sortDate` than
   the jukebox `nightmare` entry.
2. Rebuild.
3. **Expect**: Exactly **one** Nightmare row in Discography — data from **jukebox** file.
4. **Expect**: No duplicate row from tracks file.

## Scenario 5 — `inDiscography: false` (US2)

1. On a jukebox file, set `inDiscography: false` (revert after test).
2. **Expect**: That entry hidden from Discography regardless of tracks folder content.
3. **Same-id note**: If a `src/content/tracks/<same-id>.md` exists for that jukebox slug,
   it is **also skipped** — no Discography row for that id (see spec edge case).

## Scenario 6 — Sort order (US2)

1. Ensure at least two entries share the same year but different `sortDate` months, or same
   date with different titles.
2. **Expect**: Newer `sortDate` first; same-day tie-break by title A→Z.

## Scenario 7 — Invalid track omitted (edge)

1. Add `src/content/tracks/broken.md` with `label` only (no `sortDate`).
2. `npm run build`.
3. **Expect**: Build succeeds; row absent; console warning names `broken`.

## Scenario 8 — Stage schedule unaffected (edge)

1. Confirm `src/data/stage-schedule.json` references only jukebox ids.
2. Add catalog-only tracks.
3. `npm run build`.
4. **Expect**: No schedule validation errors from track ids.

## Scenario 9 — Unit tests

```bash
npm test
```

**Expect**: `catalog-tracks.test.ts` includes merge/dedup/sort cases; all pass.

## Scenario 10 — CI

```bash
npm run check
npm run build
npm test
```

**Expect**: clean check, build, tests.

## Scenario 11 — Artist guide (US3)

1. Open `docs/artist-guide.md`.
2. **Expect**: `src/content/tracks/` documented; jukebox vs. tracks decision tree; promotion
   steps; poster-only jukebox workaround deprecated for new catalog-only releases.
3. **Self-check (SC-003)**: Reader can pick jukebox vs. tracks for: (a) stage single,
   (b) back-catalog single, (c) hidden WIP on stage only.

## Scenario 12 — 320px Discography layout (SC-004)

1. Open Discography with jukebox-backed **and** catalog-only rows loaded.
2. Set viewport to **320px** width (dev tools).
3. **Expect**: List readable; **no horizontal scrolling** (usable per IDEA-013 deferral; not
   mobile-polished).

## Cleanup

Remove temporary test files (`broken.md`, duplicate `nightmare` tracks file) before merge
unless retained as documented examples.
