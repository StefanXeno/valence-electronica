# Contract: Stage Handoff & Boot Resilience

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Extends [`specs/002-themed-background-video/contracts/background-content.md`](../../002-themed-background-video/contracts/background-content.md)
and [`specs/011-vflip-now-playing/contracts/vflip-playback.md`](../../011-vflip-now-playing/contracts/vflip-playback.md).

## Crossfade serialization (FR-003)

| Rule | Detail |
|------|--------|
| Latest wins | Each `select(id)` increments `handoffGeneration` and sets `activeId` immediately |
| Stale completion | Async crossfade that finishes with `generation !== current` MUST NOT call `restartClock()`, swap videos, or change `data-theme` |
| UI sync | `syncStageUi(activeId)` MAY run at select start and after valid completion |
| Rapid switch | Ten trials of five picks in three seconds → one stable `activeId`, matching `data-theme`, no stacked scrims |

## Video metadata listener (FR-004)

| Rule | Detail |
|------|--------|
| Target | Only the element with `[data-bg-video]` that is **active** (playing, opacity 1) |
| Rebind | After `swapAtmosphereVideos()`, remove listener from old node; attach to new active node |
| `restartClock` | Fires only when active track media changed or shuffle/loop logic explicitly requests it |

## Boot resilience (FR-005)

| Condition | Behavior |
|-----------|----------|
| Valid `data-stage-catalog` | Normal `initStageSwitch` |
| `JSON.parse` throws on catalog or schedule | `console.error` with context; return without throwing; drawer toggle may still work if wired separately |
| Missing catalog attribute | Existing early return (unchanged) |

Visitor MUST still reach legal links and see SSR atmosphere.

## `syncStageUi` selectors (FR-010)

**In scope** (must remain):

- `[data-jukebox-option]`
- `[data-track-info-for]`
- `[data-stage-button]`
- `[data-shuffle-toggle]`
- `[data-loop-toggle]`

**Removed**:

- `[data-lyrics-for]` — no DOM nodes in v1

## Shuffle / loop

Unchanged semantics from `011`; this contract only guarantees timer stability under video
layer swap. Full playback validation via `011` quickstart (FR-012).

## Reduced motion

When `prefers-reduced-motion: reduce`, crossfade path already falls back to `applyStageEntry`
(instant). Hardening MUST NOT add motion.
