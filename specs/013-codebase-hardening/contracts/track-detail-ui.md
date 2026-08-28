# Contract: V-Flip Track Detail (visitor-facing)

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Extends [`specs/011-vflip-now-playing/contracts/vflip-player-ui.md`](../../011-vflip-now-playing/contracts/vflip-player-ui.md).
Completes [`specs/010-track-catalog/contracts/track-catalog-content.md`](../../010-track-catalog/contracts/track-catalog-content.md)
field rendering in the `011` inline detail model (not the superseded dock popover).

## Surface

| Property | Rule |
|----------|------|
| Location | Open jukebox drawer → track list → per-row detail block `[data-track-info-for]` |
| Visibility | Only the row matching **active** jukebox id is visible (`hidden` on others) |
| Sync | `syncStageUi(activeId)` on every stage select / hop |
| Scroll | Long blurb / many credits scroll inside drawer body; no horizontal overflow at 320px |

## Content order (top → bottom)

1. **Blurb** — optional paragraph; omitted when empty
2. **Released** — `sortDate` formatted (existing `chrome.releasedLabel` + `<time>`)
3. **Listen links** — existing platform icons row, or `chrome.emptyTrackLinks`
4. **Credits** — optional `<ul>`; each item `role` + `name` as plain text
5. **Mentions** — optional paragraph below credits

Sections 1, 4, 5 omitted entirely when absent (no headings, no “empty” placeholders).

## Credits markup (accessibility)

```html
<ul class="track-info__credits">
  <li><span class="track-info__credit-role">Producer</span> — <span class="track-info__credit-name">Valence</span></li>
</ul>
```

Screen readers hear role and name; visual separator is an em dash or equivalent.

## Mentions

Plain text from frontmatter; single `<p class="track-info__mentions">`. No markdown render in
v1 (frontmatter string only).

## Lyrics

**Out of scope** — jukebox markdown body not shown. Artist guide MUST state this.

## Glitch / reduced motion

Unchanged from `011` — detail is static text inside drawer; no new animations.

## Sample content (implementation)

At least one jukebox file (recommend `nightmare.md`) MUST ship with example `credits` (and
optionally `blurb` / `mentions`) so SC-001 is verifiable without operator-only edits.
