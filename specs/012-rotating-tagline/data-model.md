# Data Model: Rotating Identity Subtext

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md)

## Entity: TaglinePool

File: `src/data/tagline-pool.json`

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `timezone` | string | yes | MUST be `"Europe/Berlin"` in v1 |
| `lines` | TaglineLine[] | no | Ordered list; `[]` → fallback only, no rotation |

Build validation: same as prior model (text, rules, dates, times, weights).

## Entity: TaglineLine

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | yes | Trimmed non-empty hook |
| `weight` | number | no | **Normal lines only**; default `1`; expands steps in rotation cycle |
| `rules` | TaglineRule[] | no* | Non-empty → easter-egg line |

Easter-egg lines: ignore `weight` in v1 (validator MAY warn if present).

## Entity: TaglineRule

Unchanged shapes: `date`, `range`, `weekday`, `time` (see [contracts/tagline-pool.md](./contracts/tagline-pool.md)).

All rules on a line must match (AND) for that line to join the eligible set.

## Eligible set algorithm

Input: pool, `now` (Date).

1. Berlin calendar + clock parts from `now`.
2. Collect every easter-egg line where all rules match → `eggEligible[]` (file order).
3. If `eggEligible.length > 0`, return `eggEligible`.
4. Else build `normalEligible[]` from lines without rules, expanding each to `weight` entries:
   - e.g. `[{text:A,w:2},{text:B,w:1}]` → `[A, A, B]`
5. If `normalEligible` empty, return `[]` (use fallback, stop rotator).

Output: ordered array of `{ text }` entries (expanded for weight).

## Rotation state (runtime, client)

| Field | Description |
|-------|-------------|
| `index` | Current position in eligible sequence |
| `timerId` | 60 s scheduling handle |
| `phase` | `idle` \| `out` \| `in` |
| `currentText` | Last displayed formatted string |

Each **tick** (60 s after previous transition completes):

1. Recompute eligible set for `now`.
2. If empty → show fallback; stop timer.
3. If set length changed or index out of range → clamp index.
4. `index = (index + 1) % eligible.length`
5. If `eligible[index].text === currentText` → skip fade (FR-017); schedule next tick.
6. Else run sequential fade to new text (FR-015) or instant swap if reduced motion.

**Initial load**: compute eligible set; show `eligible[0]` (fade-in from SSR fallback if
different); start 60 s timer to first advance.

## Entity: DefaultTagline

`site.json` → `artist.tagline` — SSR, no-JS, empty eligible set.

## Display formatting

| Concern | Rule |
|---------|------|
| ` for ` | `formatTagline()` → non-breaking space before following word |
| Layout | Single `.tagline`; `nowrap` at desktop; no horizontal scroll @ 320px |
| Motion | CSS opacity on `.tagline`; sequential out then in; duration in `tagline-rotate.css` |
| Reduced motion | `transition: none`; instant text swap |

## Relationship diagram

```text
tagline-pool.json ──► tagline-pool.ts (eligible set, format)
                           │
                           ▼
                     Hero.astro rotator (timer, DOM, phases)
                           │
                     tagline-rotate.css (opacity transitions)

site.json artist.tagline ──► SSR + empty-set fallback
```
