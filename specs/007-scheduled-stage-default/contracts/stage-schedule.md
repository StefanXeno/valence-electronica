# Contract: Stage Schedule Data File

**Date**: 2026-08-23 | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

Maintainer-facing contract. Edit **`src/data/stage-schedule.json` only** to change which
jukebox entry is the landing default on given calendar days. Do not rename jukebox ids
(`src/content/jukebox/<id>.md` filename) without updating every rule that references them.

Atmosphere, theme, lyrics, and mute behavior follow the **active jukebox entry** (see
`specs/004-landing-content-layout/contracts/stage-content.md`). The schedule only picks
**which entry is default** before the visitor uses the jukebox.

## Timezone

All rules use **Europe/Berlin** calendar dates, regardless of the visitor’s local clock.
The file MUST set:

```json
"timezone": "Europe/Berlin"
```

Other values are rejected at build in v1.

## Example file (starter / shipped shape)

```json
{
  "timezone": "Europe/Berlin",
  "rules": [
    {
      "type": "date",
      "on": "10-31",
      "jukeboxId": "nightmare"
    },
    {
      "type": "date",
      "on": "2027-06-01",
      "jukeboxId": "example-cyan"
    },
    {
      "type": "range",
      "from": "2026-12-24",
      "to": "2026-12-26",
      "jukeboxId": "example-cyan"
    },
    {
      "type": "weekday",
      "days": [5],
      "jukeboxId": "example-cyan"
    }
  ]
}
```

Interpretation:

- **Every 31 October** → `nightmare` (yearly).
- **1 June 2027 only** → `example-cyan` (one-off date rule).
- **24–26 Dec 2026 inclusive** → `example-cyan`.
- **Every Friday** → `example-cyan` (only if no date/range rule matched that day).

When no rule matches, the site uses the jukebox entry marked `default: true` in its
Markdown frontmatter (today: `nightmare`).

## Rule reference

### `date`

| Field | Required | Format |
|-------|----------|--------|
| `type` | yes | `"date"` |
| `on` | yes | `MM-DD` (every year) or `YYYY-MM-DD` (single year) |
| `jukeboxId` | yes | Existing usable jukebox slug |

Examples:

```json
{ "type": "date", "on": "10-31", "jukeboxId": "nightmare" }
{ "type": "date", "on": "2026-06-01", "jukeboxId": "example-cyan" }
```

### `range`

| Field | Required | Format |
|-------|----------|--------|
| `type` | yes | `"range"` |
| `from` | yes | `YYYY-MM-DD` inclusive |
| `to` | yes | `YYYY-MM-DD` inclusive |
| `jukeboxId` | yes | Existing usable jukebox slug |

Example:

```json
{
  "type": "range",
  "from": "2026-07-01",
  "to": "2026-07-07",
  "jukeboxId": "example-cyan"
}
```

Build fails if `from` is after `to`.

### `weekday`

| Field | Required | Format |
|-------|----------|--------|
| `type` | yes | `"weekday"` |
| `days` | yes | Array of ISO weekday numbers |

| Number | Day |
|--------|-----|
| 1 | Monday |
| 2 | Tuesday |
| 3 | Wednesday |
| 4 | Thursday |
| 5 | Friday |
| 6 | Saturday |
| 7 | Sunday |

Example (Saturday + Sunday):

```json
{ "type": "weekday", "days": [6, 7], "jukeboxId": "nightmare" }
```

## Priority (which rule wins)

1. **Date** rules — first matching rule in file order.
2. Else **range** rules — first matching rule in file order.
3. Else **weekday** rules — first matching rule in file order.
4. Else **static fallback** — jukebox entry with `default: true`.

Put more specific rules **above** broader ones within the same type when order matters.

## Validation at publish

| Condition | Result |
|-----------|--------|
| Invalid JSON | Build fails |
| Unknown `jukeboxId` | Build fails with id named |
| Invalid date (`02-30`, bad month) | Build fails |
| `range.from` > `range.to` | Build fails |
| Empty `rules` or missing file | Allowed — static fallback only |
| Duplicate/conflicting rules | Allowed — priority table decides |

## Operator checklist

1. Confirm the target song exists under `src/content/jukebox/<id>.md` with label + poster.
2. Add or edit a rule in `stage-schedule.json`.
3. Run `npm run check` locally — fix any id/date errors.
4. Merge and publish; on the matching Berlin calendar day, reload the landing (hard refresh)
   to verify the default atmosphere and theme.

## Disabling scheduling

Remove all rules or delete `stage-schedule.json`. Behavior reverts to the jukebox
`default: true` entry only.
