# Contract: Tagline Pool Data File

**Date**: 2026-08-28 | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

Maintainer-facing contract. Edit **`src/data/tagline-pool.json` only** to change rotating
subtext under the Valence wordmark. Do not edit `Hero.astro` for copy changes.

The default hook when the pool is empty or no line matches remains **`artist.tagline`** in
`src/data/site.json`.

## Timezone

All schedule rules use **Europe/Berlin** calendar dates and clock times, regardless of the
visitor’s local timezone. The file MUST set:

```json
"timezone": "Europe/Berlin"
```

Other values are rejected at build in v1.

## Line types

| Type | How to define | When it shows |
|------|---------------|---------------|
| **Normal** | `{ "text": "…" }` only (optional `weight`) | Rotates every **60 s** when **no** easter egg matches now |
| **Easter egg** | `{ "text": "…", "rules": [ … ] }` | Joins rotation when **every** rule matches; **all** matching eggs rotate together |

**Eligible set**: matching easter eggs (file order) **or**, if none match, the normal pool.
Subtext advances every 60 seconds through that set with a fade-out then fade-in (see
[../plan.md](../plan.md)).

## Example file (starter shape)

```json
{
  "timezone": "Europe/Berlin",
  "lines": [
    { "text": "Something's coming for you." },
    { "text": "Electronic moods from Augsburg." },
    { "text": "Press play on the night." },
    {
      "text": "Something wicked this way loops.",
      "rules": [{ "type": "date", "on": "10-31" }]
    },
    {
      "text": "Unwrap the drop.",
      "rules": [
        {
          "type": "range",
          "from": "2026-12-24",
          "to": "2026-12-26"
        }
      ]
    },
    {
      "text": "Show me how you move.",
      "rules": [{ "type": "weekday", "days": [5] }]
    },
    {
      "text": "Still awake?",
      "rules": [{ "type": "time", "from": "22:00", "to": "04:00" }]
    }
  ]
}
```

Interpretation:

- When no easter egg matches → the three normal lines **rotate every 60 seconds**.
- **31 Oct** (Berlin) → Halloween line in the easter-egg rotation set (normal pool excluded).
- **24–26 Dec 2026** → holiday line eligible each day in range.
- **Fridays** → Friday line eligible on Fridays (with any other matching eggs).
- **22:00–04:00 Berlin** → late-night line eligible inside the window only.

## Rule reference

### `date`

| Field | Required | Format |
|-------|----------|--------|
| `type` | yes | `"date"` |
| `on` | yes | `MM-DD` (every year) or `YYYY-MM-DD` (single year) |

```json
{ "type": "date", "on": "10-31" }
{ "type": "date", "on": "2027-06-01" }
```

### `range`

| Field | Required | Format |
|-------|----------|--------|
| `type` | yes | `"range"` |
| `from` | yes | Inclusive `YYYY-MM-DD` |
| `to` | yes | Inclusive `YYYY-MM-DD` |

```json
{
  "type": "range",
  "from": "2026-12-24",
  "to": "2026-12-26"
}
```

`from` must not be after `to`.

### `weekday`

| Field | Required | Format |
|-------|----------|--------|
| `type` | yes | `"weekday"` |
| `days` | yes | Array of ISO weekdays `1`=Mon … `7`=Sun |

```json
{ "type": "weekday", "days": [5] }
```

Sunday is `7`, not `0`.

### `time`

| Field | Required | Format |
|-------|----------|--------|
| `type` | yes | `"time"` |
| `from` | yes | Inclusive start `HH:MM` (24-hour) |
| `to` | yes | Inclusive end `HH:MM` (24-hour) |

```json
{ "type": "time", "from": "22:00", "to": "04:00" }
```

Cross-midnight windows are allowed. Both endpoints are inclusive.

### Combined rules (AND)

All rules on one line must match:

```json
{
  "text": "Friday night mode.",
  "rules": [
    { "type": "weekday", "days": [5] },
    { "type": "time", "from": "22:00", "to": "04:00" }
  ]
}
```

Shows only on Friday **and** during the late-night window (Berlin).

## Weight (normal lines only)

Optional positive integer; default `1`. Higher weight → **more steps per rotation cycle**
(e.g. weight `3` → that line appears three times before the next normal line’s turn).

```json
{ "text": "Fan favourite.", "weight": 3 }
{ "text": "Rare mood.", "weight": 1 }
```

Do not put `weight` on easter-egg lines in v1 (prefer omitting).

## Validation (build)

`npm run check` / `npm run build` MUST fail when:

- `timezone` is not `Europe/Berlin`
- Any line has empty or whitespace-only `text`
- Any line has `rules: []`
- Any rule has invalid date, range, weekday, or time format
- Any `weight` is missing, non-integer, or `< 1`

Error messages SHOULD name the line index and rule index (e.g. `lines[2].rules[0]`).

## Runtime behavior summary

| Condition | Subtext shown |
|-----------|---------------|
| Scripting off | `site.json` → `artist.tagline` (no rotation) |
| Eligible pool non-empty | Rotates every **60 s** through eligible lines |
| Eligible pool empty | `artist.tagline` fallback; rotation paused |
| Motion allowed | Fade out → swap → fade in on each change |
| `prefers-reduced-motion: reduce` | Same 60 s cadence; **instant** swap, no fade |

Initial HTML includes the fallback tagline; the rotator replaces it when the first eligible
line is applied.

## Related docs

- Stage schedule (jukebox defaults): [../../007-scheduled-stage-default/contracts/stage-schedule.md](../../007-scheduled-stage-default/contracts/stage-schedule.md)
- Identity HUD placement: [../../009-desktop-stage-ui/contracts/desktop-hud-ui.md](../../009-desktop-stage-ui/contracts/desktop-hud-ui.md)
