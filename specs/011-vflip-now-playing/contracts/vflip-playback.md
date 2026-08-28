# Contract: V-Flip playback (shuffle, loop, handoff)

**Date**: 2026-08-28 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

Client-only. No network, no storage. Defaults from chrome (see
[data-model.md](../data-model.md)).

## Mode matrix

| Loop | Shuffle | At dwell / advance point |
| ---- | ------- | ------------------------ |
| On | * | Stay; visual bed may keep looping. **No hop.** |
| Off | On | Hop to a **different** random catalog id. Crossfade. |
| Off | Off | Stay. **No hop.** (No 45s visual hop either.) |

Hop also requires: scripting, ≥2 jukebox entries, intro not showing.

## Intro gate

Do not start or fire the advance timer while `html` has `data-intro-pending` or
`data-intro-active`. When both are absent, start/restart the clock for the current
id if shuffle && !loop.

## Dwell

| Condition | Advance after |
| --------- | ------------- |
| `hasAudio: true` and atmosphere video playing with known duration | **`HTMLMediaElement.duration`** (seconds, from `loadedmetadata`) |
| `hasAudio: true` but poster/fallback only (duration unknown) | **45s** |
| `hasAudio: false` | **45s** |

Restart the clock when:

- Active id changes (manual pick, discography stage button, or hop)
- Shuffle turns on while loop is off
- Loop turns off while shuffle is on
- Atmosphere video `loadedmetadata` for the active id (restart with file duration when shuffle && !loop && hasAudio)

Clear the clock when:

- Shuffle turns off
- Loop turns on
- Intro starts (should not happen mid-session except `?replay-intro` in dev)

## Hop selection

`nextId = random choice from ids.filter(id => id !== activeId)`.

If the filtered list is empty, do not hop.

## Crossfade (motion allowed)

Duration: **700ms**. Easing: `cubic-bezier(0.4, 0, 0.2, 1)`.

| Channel | Behavior |
| ------- | -------- |
| Picture | Incoming video layer opacity 0 → 1 over outgoing |
| Theme tokens | `data-theme` / `data-hud-glitch` update at fade start; `html` color/surface tokens transition 700ms while `data-stage-crossfade` is set |
| Audio | Preserve `muted` + volume from outgoing. Never unmute as a side effect of hop. If unmuted, mute outgoing at fade start so two soundtracks do not overlap |
| Reduced motion | Instant swap; no 700ms fade; no `data-stage-crossfade` motion |

Manual picks that change id use the **same** handoff (smooth, not a hard cut), so
list clicks match shuffle hops.

## Mute / volume

Unchanged rules from `002` / `005` (`hasAudio`, pack `audioEligible`, playing vs
fallback, reduced motion). Control is inside V-Flip (UI contract). Hop does not
reset volume or muted flag.

## Atmosphere `loop` attribute

Stay `loop` for visual beds (research R6). Visitor loop toggle does **not** flip
the HTML `loop` attribute in v1.

## Events

Reuse `bg-state-change` after layer swap. Reuse `stage-select` / existing click
delegation for manual picks. Playback module subscribes; it must not double-bind
clicks.

## No-JS

Timer, toggles, and hops do not run. SSR shows load-time track lyrics/info inside
open V-Flip. Authored `<video loop>` may still loop in the browser’s native player.
