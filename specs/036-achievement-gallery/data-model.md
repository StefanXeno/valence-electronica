# Data Model: Achievement Gallery

**Feature**: `036-achievement-gallery` | **Date**: 2026-10-07

## Achievement (registry entry)

Source: `src/data/achievements.json` → `achievements[]`. Array order = tile order.

| Field | Type | Required | Rules |
| ----- | ---- | -------- | ----- |
| `id` | string | yes | Must be one of `KNOWN_ACHIEVEMENT_IDS`; unique; storage key is `ve-achievement-{id}`. Never renamed (resets progress). Must not hint at a secret title. |
| `title` | string | yes | Trimmed, non-empty. Shown in toast and unlocked tile. |
| `subtitle` | string | yes | Trimmed, non-empty. Shown in toast and unlocked tile. |
| `glyph` | `"vinyl" \| "infinite" \| "demonic" \| "code"` | yes | Rendered on toast and unlocked tile. |
| `secret` | boolean | no (default `false`) | When `true` and locked: tile shows only the secret placeholder. |
| `hint` | string | when not secret | Trimmed, non-empty for non-secret entries; ignored (allowed but unused) when `secret`. |

**Validation** (`validateAchievementRegistry`, runs at build when the gallery renders and in
unit tests; any failure throws with the entry index and id):

1. `achievements` is a non-empty array.
2. Every `id` is known and appears exactly once.
3. Every known id has an entry (no unlockable achievement without copy).
4. `title`, `subtitle` non-empty; `glyph` in the enum.
5. Non-secret entries have a non-empty `hint`.

Initial content:

```json
{
  "achievements": [
    { "id": "rub", "title": "Why are you rubbing?!", "subtitle": "Rub a song in the discography for three times.", "glyph": "vinyl", "secret": true },
    { "id": "infinite-spin", "title": "Infinite", "subtitle": "You tried to spin infinitely on the Infinite track", "glyph": "infinite", "hint": "On one track, going in circles is the whole point." },
    { "id": "player-found", "title": "Found it!", "subtitle": "You discovered V-Flip, the hidden player.", "glyph": "vinyl", "hint": "Knock on the stage and someone might answer." },
    { "id": "demonic-combo", "title": "Demonic Combination", "subtitle": "Unleash the Nightmare by 666", "glyph": "demonic", "hint": "Some numbers wake the Nightmare." },
    { "id": "coder", "title": "Coder", "subtitle": "Take a look at the source code", "glyph": "code", "hint": "Real fans read the fine print." }
  ]
}
```

(`player-found` copy comes from today's `chrome.md` values, which are removed.)

## Client payload (build → browser)

Serialized by `achievements-registry.ts` into `data-achievement-registry` on the toast root.
The JSON file itself never reaches the browser.

```text
ClientAchievement =
  | { id, glyph, secret: false, title, subtitle, hint }          // plain
  | { id, glyph, secret: true, enc: 1, title: <obf>, subtitle: <obf> }  // no hint
<obf> = reverse(base64(utf8(text)))
```

## Legacy key migration

| Legacy key | New key | When |
| ---------- | ------- | ---- |
| `ve-achievement-why-are-you-rubbing` | `ve-achievement-rub` | Once per browser on boot: if legacy is `"1"`, set new to `"1"`, remove legacy. Legacy literal stored obfuscated. Blocked storage → no-op. |

## Unlock state (per browser)

Derived from `localStorage`; never written by the gallery except on reset.

```text
AchievementState =
  | { available: false }                       // storage missing/throws
  | { available: true, unlocked: Set<id> }     // keys with value "1"
```

- Unknown stored keys are ignored (only known ids are read).
- Icon visible ⇔ `available && unlocked.size > 0` (and intro not active).

## Tile view (derived, per achievement)

| Condition | Kind | Shows |
| --------- | ---- | ----- |
| unlocked | `unlocked` | glyph, title, subtitle |
| locked, not secret | `locked` | "???" placeholder (chrome), hint |
| locked, secret | `secret` | secret placeholder (chrome) only; no secret copy in the DOM |

Counter: `achievementsCounter` template with `{found}` and `{total}` replaced
(`total` = registry length; `found` = unlocked ∩ registry).

## Gallery chrome (UI chrome, `src/content/ui/chrome.md`)

| Field | Default | Use |
| ----- | ------- | --- |
| `achievementsLabel` | `Achievements` | Trophy button accessible name + tooltip |
| `achievementsIcon` | *(token `trophy`)* | Optional icon override (token or emoji) |
| `achievementsTitle` | `Achievements` | Panel heading |
| `achievementsCounter` | `{found} / {total} found` | Counter template |
| `achievementLockedTitle` | `???` | Locked tile title |
| `achievementSecretTitle` | `Secret achievement` | Secret locked tile text |
| `achievementUnlockedLabel` | `Achievement unlocked` | Toast eyebrow + SR prefix |
| `achievementsCloseLabel` | `Close` | Panel close control |
| `achievementsResetLabel` | `Reset achievements` | Dev/preview reset button |

Removed: `playerAchievementTitle`, `playerAchievementSub` (moved into the registry).

## State transitions

```text
Icon:    hidden ──first unlock / load with ≥1 unlocked──▶ visible ──reset──▶ hidden
Gallery: closed ──icon / toast──▶ open
         open ──X / Escape / outside click / player full / overlay / phone menu / reset──▶ closed
Toast:   hidden ──unlock──▶ showing ──hover/focus──▶ held ──leave──▶ showing ──timeout──▶ hidden
         showing|held ──activate──▶ hidden + Gallery open
```
