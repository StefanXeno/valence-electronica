# Contract: V-Flip playback (shuffle, loop, handoff)

**Date**: 2026-08-28 (updated 2026-08-28) | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

Client-only. No network, no storage. Defaults from chrome (see
[data-model.md](../data-model.md)).

## Mode matrix

| Loop | Shuffle | At dwell / advance point |
| ---- | ------- | ------------------------ |
| On | * | Stay; visual bed may keep looping. **No hop.** |
| Off | On | Hop to a **different** random catalog id from the **eligible pool**. Crossfade. |
| Off | Off | Stay. **No hop.** (No 45s visual hop either.) |

Hop also requires: scripting, ≥2 entries in eligible pool, intro not showing.

## Eligible pool (shuffle hop target)

| Visitor audio | Pool |
| ------------- | ---- |
| Muted (or volume 0) | All catalog ids |
| Unmuted | Only ids where `packAllowsMute(pack, entry.hasAudio, playsVideo)` is true |

Manual picks are **not** filtered — visitor may select a silent track while unmuted.

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

`nextId = random choice from ids.filter(id => id !== activeId && isAllowed(id))`.

`isAllowed` applies the eligible-pool rules above.

If no candidates, do not hop.

## Crossfade (motion allowed)

Handoff mode from **source and destination theme packs** (`packAllowsHudGlitch`):

| Transition | `data-stage-crossfade` | Picture | Theme tokens | Duration |
| ---------- | ---------------------- | ------- | ------------ | -------- |
| Non-glitch ↔ non-glitch | `smooth` | Opacity ease | Registered `@property` colors ease | **1000ms** `cubic-bezier(0.45, 0, 0.55, 1)` |
| Any glitch pack involved | `glitch` | Opacity **steps(4)** | Color tokens **steps(4)** + atmosphere glitch keyframes | **720ms** |

| Channel | Behavior |
| ------- | -------- |
| Picture | Incoming video layer opacity 0 → 1 over outgoing (duration/easing per mode) |
| Theme tokens | `data-theme` updates at fade start; `data-hud-glitch` updates immediately unless **leaving** glitch (then HUD glitch clears at end of handoff) |
| Atmosphere (glitch mode) | Brief `stage-theme-handoff-glitch` filter/skew on `.atmosphere` |
| Audio | Preserve `muted` + volume from outgoing. Never unmute as side effect of hop. Mute outgoing at fade start when needed |
| Reduced motion | Instant swap; no crossfade flag; no motion |

Manual picks that change id use the **same** handoff (same mode resolution), so list
clicks match shuffle hops.

## Mute / volume

Unchanged rules from `002` / `005` (`hasAudio`, pack `audioEligible`, playing vs
fallback, reduced motion). Control is inside V-Flip (UI contract). Mute **slot**
hides when active track is not audio-eligible. Hop does not reset volume or muted
flag.

## Atmosphere `loop` attribute

Stay `loop` for visual beds (research R6). Visitor loop toggle does **not** flip
the HTML `loop` attribute in v1.

## Events

Reuse `bg-state-change` after layer swap. Reuse `stage-select` / existing click
delegation for manual picks. Playback module subscribes; it must not double-bind
clicks.

## No-JS

Timer, toggles, and hops do not run. SSR shows load-time track list + inline info
inside open V-Flip. Authored `<video loop>` may still loop in the browser’s native
player.
