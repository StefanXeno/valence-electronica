# Data Model: Scheduled Stage Default

**Date**: 2026-08-23 | **Plan**: [plan.md](./plan.md)

The schedule references jukebox entries defined in `004-landing-content-layout`; it does
not duplicate media, theme, or lyrics fields.

## Entity: StageSchedule

File: `src/data/stage-schedule.json`

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `timezone` | string | yes | IANA zone; v1 MUST be `"Europe/Berlin"` (other values rejected at build) |
| `rules` | ScheduleRule[] | no | Ordered list; omit or `[]` → scheduling disabled (static fallback only) |

Build validation:

- Parse as JSON; reject malformed files.
- Each rule MUST include valid `type` and `jukeboxId`.
- Every `jukeboxId` MUST match a **usable** jukebox entry id (label + poster present).
- Invalid calendar dates (e.g. `02-30`, bad month) MUST fail build with a clear message.

Runtime: if file missing, treat as `{ "timezone": "Europe/Berlin", "rules": [] }`.

## Entity: ScheduleRule (discriminated union)

Common field:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jukeboxId` | string | yes | Stable jukebox filename slug (e.g. `nightmare`, `example-cyan`) |

### Type `date`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"date"` | yes | Discriminator |
| `on` | string | yes | `MM-DD` yearly recurring **or** `YYYY-MM-DD` one-off |

Matches when Berlin calendar date equals `on` (yearly rules ignore year).

### Type `range`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"range"` | yes | Discriminator |
| `from` | string | yes | Inclusive start `YYYY-MM-DD` |
| `to` | string | yes | Inclusive end `YYYY-MM-DD` |

Matches when Berlin date is `from ≤ today ≤ to`. Reject if `from > to` at build.

### Type `weekday`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"weekday"` | yes | Discriminator |
| `days` | number[] | yes | ISO weekdays `1`=Mon … `7`=Sun; at least one |

Matches when Berlin weekday is in `days`.

## Resolution algorithm

Input: schedule, Berlin `{ year, month, day, weekday }`, set of usable catalog ids,
`staticFallbackId`.

1. Skip any rule whose `jukeboxId` is not in the usable catalog.
2. Evaluate tiers in order; within each tier, scan `rules` in **file order**; first match wins:
   - **Pass 1 — `date`**: yearly `MM-DD` or one-off `YYYY-MM-DD`.
   - **Pass 2 — `range`**: inclusive `from` … `to` (Berlin calendar).
   - **Pass 3 — `weekday`**: ISO weekday in `days`.
3. If no pass matches, return `staticFallbackId`.
4. Return the winning `jukeboxId`.

## Entity: JukeboxEntry (existing, reference)

See `specs/004-landing-content-layout/data-model.md`. Schedule only reads `id` and
validity. `default: true` on one entry defines **static fallback** when no rule matches.

## Entity: ScheduledDefault (runtime, derived)

Not persisted. Computed at landing boot:

| Attribute | Source |
|-----------|--------|
| `jukeboxId` | Resolver output |
| `themeId`, media, lyrics | Inherited from active jukebox entry |

Transitions:

- **Page load** → resolve schedule → set active entry (unless no-JS: stay on SSR fallback).
- **Jukebox pick** → manual id replaces scheduled default until reload.
- **Reload** → resolve again for new Berlin “today”.

## Relationship diagram

```text
stage-schedule.json
  rules[].jukeboxId ──references──► jukebox/<id>.md
                                         │
                                         ├── themeId → theme pack
                                         ├── poster / sources → atmosphere
                                         └── body → lyrics

static fallback ◄── jukebox entry with default: true
```
