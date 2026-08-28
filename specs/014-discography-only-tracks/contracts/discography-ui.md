# Contract: Discography Panel UI

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Merge contract**: [discography-merge.md](./discography-merge.md)

Visitor-facing contract for the on-demand **Discography** panel after `014` as-built UI.

## Panel chrome

| Source | Fields |
|--------|--------|
| `src/content/ui/chrome.md` | `discographyTitle`, `discographyIcon`, `stageButtonLabel`, `listenOnLabel`, `currentlyPlayingLabel`, `emptyReleases` |

## Layout

- On-demand panel uses `stage-panel--discography` — open width **`min(22rem × --hud-scale, viewport)`**.
- Each release is a **card row** (border, padding, rounded corners) in a vertical list sorted
  by merge rules in [discography-merge.md](./discography-merge.md).

## Row anatomy

```text
┌─ discog__item [data-discog-active when playing] ─────────────┐
│  title (plain text)                    Play on V-Flip  OR     │
│  year · kind                           Currently playing ⟳      │
│  ─────────────────────────────────────────────────────────── │
│  Listen On   [icon] [icon] [icon]                            │
└──────────────────────────────────────────────────────────────┘
```

| Region | Rule |
|--------|------|
| Title | Always plain text (`label`); not a single primary URL link |
| Year · kind | Year from `sortDate`; optional `kind` after middle dot |
| Stage affordance | **Only** when `jukeboxId` set |
| Play on V-Flip | Shown when stage-bound and **not** the active track; `data-stage-button` |
| Currently playing | Shown when stage-bound and **is** the active track; `data-discog-playing`; small EQ bars unless `prefers-reduced-motion: reduce` |
| Listen On | Shown when `listenLinks.length > 0` for **any** row type; platform icons via `ChannelIcon`; `target="_blank"` + `rel="noopener noreferrer"` |

## Client sync

`syncStageUi(activeId)` (in `src/lib/stage-switch.ts`) on every stage change:

- Hides `[data-stage-button]` and shows `[data-discog-playing]` for matching id
- Sets `[data-discog-active]` on the active card row
- Updates jukebox option `aria-pressed` (unchanged)

No new client module — reuses existing stage-switch sync.

## Accessibility

- Currently playing uses `role="status"`
- Platform links use `aria-label` with platform name
- Optional `data-hud-label` on listen icons for HUD label reveal

## Out of scope

- In-panel credits, blurb, or mentions (remain V-Flip track detail or future work)
- Third-party embeds or autoplay
