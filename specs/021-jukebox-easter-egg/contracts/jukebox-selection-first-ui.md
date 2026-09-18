# Contract: Jukebox Selection-First & Vinyl Easter Egg

**Date**: 2026-09-18 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Authority** for default **player surface** and **vinyl → V-Flip**
discovery after this feature. **Supersedes**:

- `011` — V-Flip as primary visible jukebox chrome / vinyl-as-main song UI
- `019` — desktop default always-open **Currently playing** as primary look
- `015` / `018` — phone default expanded **Currently playing** as first
  player body

Playback meanings (shuffle on/off, mute eligibility, hop timing) remain
as-built unless explicitly replaced. **Shuffle appearance** → `022`.
**Top nav / side socials / circular docks** → `020` (do not reintroduce).
**Dual atmosphere videos** → `022` (do not assume one shared file).

## Default player surface (phone + laptop)

| State | Contract |
|------|----------|
| Rest / default useful-open | **Song selection** list/cards of selectable tracks |
| Currently playing detail | Optional; **not** default |
| Song change | One primary activation from visible selection (no obligatory “open playlist / leave currently playing” step) |
| Casual path | Selection + transport (play/pause, mute, shuffle as present) sufficient without V-Flip |
| Stage | Center atmosphere stays dominant; selection grows from player periphery |

## Vinyl → V-Flip easter egg

| Rule | Contract |
|------|----------|
| Entry | Visible **vinyl** brand object; **click/tap** opens V-Flip easter egg by enabling `.jukebox__section--list` / TrackInfoPanel drawer (**locked** DOM target) |
| Not allowed | Unmarked corner only, konami sequence, long-press-only |
| Not primary | Not in `020` top menu; not default player tab/title |
| Not required | Song changes work if vinyl never used |
| Overlap | Vinyl remains clickable/tappable; not covered by primary `020` nav |
| Trap | Opening easter egg must not block return to selection |

## Transport (unchanged meanings)

| Control | Contract |
|---------|----------|
| Shuffle | Visitor on/off toggle; **visual** may stay current until `022` |
| Play/pause | As present |
| Mute | Eligibility / hop timing as as-built `011` |
| Loop | Absent on phone/desktop chrome unless a future spec revives it |

## Breakpoints

| Width | Notes |
|------|------|
| ≤1023px | Default useful-open body = selection; coordinate with `022` tap-first open |
| ≥1024px | Selection-first body; player may remain always-open chrome while body defaults to list |

## Content strings

All visitor-facing player labels for this feature remain chrome-editable
(constitution III). Locked fields: `songsTitle` (default surface),
`nowPlayingOpenLabel`, `vinylLabel`. “V-Flip” may stay easter-egg /
internal copy.

## Non-goals

- `020` Home/Shop/Tour/Contact
- NCS logo, sprites, Taking Over brightness, Show me How audio completeness,
  dual video assets (`022`)
- Full `010` catalog panel redesign
- Re-adding Loop as primary control
