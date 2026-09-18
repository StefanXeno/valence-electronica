# Contract: Stage Artist Polish

**Date**: 2026-09-18 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Authority** for track/stage presentation polish: dual viewport videos,
Show me How audio eligibility, Taking Over brightness, NCS center logo,
sprite absence, shuffle **appearance**, phone tap-sufficient player open.

Does **not** own top nav (`020`) or selection-first / vinyl discovery
(`021`). Partially supersedes `015` where swipe was the only bottom-player
path. Extends atmosphere binding from `002` / `005` / jukebox content.

## Dual atmosphere videos

| Rule | Contract |
|------|----------|
| Scope | Every V-Flip-available stage bed, including Taking Over |
| Mobile (≤1023px) | Plays `sourcesMobile` only |
| Desktop (≥1024px) | Plays `sourcesDesktop` only |
| Schema | Locked field names: `sourcesMobile` / `sourcesDesktop` (no nested atmosphere object) |
| Completeness | Both bindings required or entry not offered as stage bed |
| Forbidden | Silently using the other viewport’s file to “fill in” |
| QA | Distinct asset identity (path/filename) per viewport (SC-007) |

## Show me How audio

| Rule | Contract |
|------|----------|
| Eligibility | Audio-eligible with audible music after unmute |
| Maintainer | Prefer fail-loud if marked eligible but bed missing/broken |

## Taking Over brightness

| Rule | Contract |
|------|----------|
| Perception | Clearly brighter UI/theme vs pre-change Taking Over |
| Cut/trim | **Out of scope** in product — content swap only |
| Contrast | Controls/text remain usable (constitution IV) |

## NCS / center logo

| Rule | Contract |
|------|----------|
| When | Active entry configures center logo |
| Where | Center stage focal element |
| When not | Non-configured entries do not show it |
| Chrome | Must not block primary nav/player targets |

## Sprites

| Rule | Contract |
|------|----------|
| Minecraft-style sprites on live stage | **Zero** (verify absent / do not reintroduce; do not invent deletion of non-existent assets) |

## Shuffle appearance

| Rule | Contract |
|------|----------|
| Look | Recognizably new vs pre-change (silhouette/metaphor) |
| Behavior | Toggle on/off with clear pressed state |

## Phone bottom player (tap)

| Rule | Contract |
|------|----------|
| Open + song change | Completable by **tap alone** |
| Swipe | Optional; not required; hints must not imply swipe-only |
| Coordination | **Requires `021` selection-first** before US6 QA — explicit ordered dependency |

## Non-goals

- `020` IA / circular docks
- `021` vinyl easter-egg redesign (beyond non-conflict)
- In-site cart; permanent sprite file deletion; in-product video editor
