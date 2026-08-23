# Editing the stage schedule

Use this guide to change which jukebox entry (atmosphere + theme) is the **landing
default** on a given day — without touching components or code.

**File to edit:** [`src/data/stage-schedule.json`](../src/data/stage-schedule.json)

**After edits:** run `npm run check` (invalid ids or dates fail the build).

For the formal maintainer contract, see
[`specs/007-scheduled-stage-default/contracts/stage-schedule.md`](../specs/007-scheduled-stage-default/contracts/stage-schedule.md).

---

## Quick rules

1. Edit **only** `src/data/stage-schedule.json` to retime defaults.
2. Every `jukeboxId` must match a usable file under `src/content/jukebox/`
   (filename slug, e.g. `nightmare`, `example-cyan`).
3. All calendar math uses **Europe/Berlin**, not the visitor’s local clock.
4. When no rule matches, the site uses the jukebox entry with `default: true`
   (today: Nightmare).
5. To turn scheduling off temporarily, set `"rules": []`.

---

## Priority (which rule wins)

1. **`date`** rules — first matching rule in file order  
2. Else **`range`** rules — first match  
3. Else **`weekday`** rules — first match  
4. Else **static fallback** — jukebox `default: true`

Put more specific rules **above** broader ones when order matters within the same type.

---

## Rule types

### One day every year (`MM-DD`)

```json
{
  "type": "date",
  "on": "10-31",
  "jukeboxId": "nightmare"
}
```

Halloween every year → Nightmare.

### One specific day (`YYYY-MM-DD`)

```json
{
  "type": "date",
  "on": "2027-06-01",
  "jukeboxId": "example-cyan"
}
```

Only 1 June 2027 → Example Cyan.

### Inclusive date range

```json
{
  "type": "range",
  "from": "2026-12-24",
  "to": "2026-12-26",
  "jukeboxId": "example-cyan"
}
```

24–26 Dec 2026 (both ends included) → Example Cyan.

### Recurring weekday

```json
{
  "type": "weekday",
  "days": [5],
  "jukeboxId": "example-cyan"
}
```

Every Friday → Example Cyan.

| Number | Day       |
|--------|-----------|
| 1      | Monday    |
| 2      | Tuesday   |
| 3      | Wednesday |
| 4      | Thursday  |
| 5      | Friday    |
| 6      | Saturday  |
| 7      | Sunday    |

Weekend example: `"days": [6, 7]`.

---

## How to test “today”

1. Look up today’s Berlin calendar date (or use a `YYYY-MM-DD` you know).
2. Add a `date` rule at the **top** of `rules` pointing at the entry you want.
3. Hard-reload the landing (with JS on). Atmosphere + theme should match that entry.
4. Remove or change the rule when you’re done — don’t leave a one-off test date forever
   unless you mean it.

Example (replace the date with today):

```json
{
  "type": "date",
  "on": "2026-08-23",
  "jukeboxId": "example-cyan"
}
```

---

## Checklist before publishing

- [ ] `jukeboxId` exists under `src/content/jukebox/` and has `label` + `poster`
- [ ] Dates are valid (no `02-30`; ranges have `from` ≤ `to`)
- [ ] `"timezone": "Europe/Berlin"` is unchanged
- [ ] `npm run check` passes
- [ ] Hard-reload on a matching day confirms the expected stage default

---

## Related

- Jukebox entries (media, theme, lyrics): `src/content/jukebox/`
- Theme packs: [README — Theme packs](../README.md#theme-packs)
- Spec: [`specs/007-scheduled-stage-default/`](../specs/007-scheduled-stage-default/)
