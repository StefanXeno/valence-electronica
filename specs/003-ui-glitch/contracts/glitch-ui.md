# Contract: Glitch UI Behavior

**Date**: 2026-08-12 | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

Visitor- and maintainer-facing behavior contract for UI glitch interactions. Stable so
acceptance tests and implementation refinements share one checklist. There is **no** new
content JSON for this feature.

## Closed hit-target set

MUST glitch (when motion allowed):

1. Active channel links (real URLs only)
2. Legal footer links
3. Legal panel Exit
4. Mute button (hover/focus/morph rules below)

MUST NOT glitch:

- Volume range/slider
- “Coming soon” placeholder channel chips
- Any other element unless `spec.md` is amended

## Trigger matrix

| Target | Pointer hover | Keyboard-visible focus | Press / click | Notes |
|--------|---------------|------------------------|---------------|-------|
| Channel / legal / exit | One-shot | One-shot | One-shot | Idle hover does not loop |
| Mute button | Continuous while pointer over button **and muted** | One-shot | Morph only (no stacked press) | Continuous ends on pointer-out or when audio plays |
| Volume slider | None | None | None | Out of set |
| Placeholder chip | None | None | None | Out of set |

## Stacking & hit-testing

- At most **one** active glitch treatment per control.
- Press supersedes in-flight hover/focus one-shots.
- Mouse-click focus MUST NOT fire a focus glitch.
- Mute/unmute click: **morph wins** over continuous mute hover for that click. Continuous
  hover may resume only if the pointer is still over the mute button, audio is muted, and
  morph has ended.
- During any glitch (including continuous mute hover and morph), the control MUST remain
  activatable; the effect MUST NOT remove or meaningfully shrink the hit target.
- At ~320px width, glitch displacement MUST NOT push critical controls permanently
  off-screen or cover primary content.

## Reduced motion

When `prefers-reduced-motion: reduce`:

- No one-shot, continuous, or morph glitch plays.
- Mute may still expand/collapse for clarity without glitch language.
- Focus/activation remain clear without relying on glitch cues.

## Theme tint

- Glitch colors MUST reuse existing theme tokens (e.g. accent / text) from feature `002`.
- MUST NOT introduce per-video deep motion packs or a visitor motion picker (FR-008).

## Privacy & weight

- First-party CSS/JS only.
- MUST NOT add tracking, cookies, persistent visitor storage, or third-party motion
  libraries.

## Intensity gate

- Soft bar: roughly ≤3 distinct visual flashes per second; no large full-viewport flashes.
- One-shots complete in under 1 second.
- Final intensity within the bar is **owner-approved by eye** (not automated
  certification).

## Markup convention (implementation hint for maintainers)

In-scope controls are marked consistently (today: class `glitch-hit` on the closed set).
Do not sprinkle that marker onto slider, placeholders, or unrelated chrome.
