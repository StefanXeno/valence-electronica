# Data Model: Landing Intro

**Feature**: `006-landing-intro` | **Date**: 2026-08-22

## Content — UI chrome (`src/content/ui/chrome.md`)

| Field | Type | Required | Default / behavior |
|-------|------|----------|-------------------|
| `introLead` | string | no | `"Hi I'm"` — first line above the name |
| `introName` | string | no* | `"Valence"` — second line; transparent; zoom target |

\*Intro sequence runs only when `introName` is non-empty after trim. Empty name → no intro
(FR-015). `introLead` MAY be empty while name is set (name-only intro), but default ships
both lines.

Existing chrome fields unchanged.

## Presentation rules (not content fields)

| Rule | Applies to |
|------|------------|
| Transparent letterforms (see-through to site behind) | `introName` only |
| Primary zoom animation | `introName` only (`.landing-intro__name`) |
| Subtler entrance (fade/slide, no matching zoom scale) | `introLead` (`.landing-intro__lead`) |

## Client state — playback flag

| Key | Storage | Values | Set when |
|-----|---------|--------|----------|
| `valence-intro-seen` | `localStorage` | `"1"` | Intro completes or skipped |

**Read rules**:

- Missing or unreadable → treat as first visit (play intro if motion + name OK).
- `replay-intro` query present → ignore flag for **starting** intro on this load only.

**Write rules**:

- Set on natural completion and on skip.
- Never sent to server; not personal data.

## DOM / document attributes (runtime)

| Attribute / class | Host | Meaning |
|-------------------|------|---------|
| `data-intro-active` | `<html>` | Intro running; stage not yet fully interactive |
| `.landing-intro` | overlay root | Greeting layer; click target for skip |
| `.landing-intro__lead` | first line | Lead text (e.g. “Hi I'm”) |
| `.landing-intro__name` | second line | Transparent name; zoom target |
| `.landing-intro--done` | overlay root | Exit animation / removed |

## State machine (landing, scripting available)

```text
LOAD → check reduce-motion? → yes → IDLE (landing visible)
     → check introName empty? → yes → IDLE
     → check flag + !replay? → seen → IDLE
     → INTRO_PLAYING → (complete | skip) → set flag → IDLE
```

**IDLE**: overlay removed or never mounted; stage fully interactive.

## Validation

- `introLead` / `introName`: plain strings in Zod schema (optional).
- No build failure if fields missing (defaults in loader or component).
