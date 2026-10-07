# Contract: Gallery UI (markup and accessibility)

> **Revised after operator review (2026-10-07):** the gallery is a V-Flip-style dock, not a
> centered dialog. `[data-achievement-gallery]` is the fixed bottom-right dock root with
> `data-gallery-state="open|closed"`; inside it, `[data-achievement-panel]`
> (`role="dialog"`, non-modal, `inert` while closed) grows out of the trophy corner, and the
> trophy toggle sits in the panel's footer row next to the counter. Header: eyebrow title,
> icon reset (dev/preview), icon close. Outside pointerdown anywhere (except the dock and
> the toast) closes. Markup below shows the original centered version for the parts that
> did not change (tiles, templates, toast).

**Feature**: `036-achievement-gallery`

## Trophy toggle

```html
<button type="button" class="achievement-toggle glitch-hit"
        data-achievement-toggle
        aria-label="{achievementsLabel}" aria-haspopup="dialog"
        aria-controls="achievement-gallery" aria-expanded="false"
        hidden>
  <!-- HudIcon trophy (or emoji override) -->
</button>
```

- Rendered at build time with `hidden`; script removes `hidden` only when
  `readAchievementState()` is available with ≥1 unlock.
- Fixed bottom-right, mirrored from the vinyl's offsets; z-index equal to the player.
- Not visible while `html[data-intro-pending]` or `html[data-intro-active]`.
- `.is-pulse` class (one-shot) on unlock when glitch motion is allowed.

## Gallery dialog

```html
<div id="achievement-gallery" class="achievement-gallery" data-achievement-gallery
     role="dialog" aria-modal="true" aria-labelledby="achievement-gallery-title" hidden>
  <div class="achievement-gallery__frame">
    <header>
      <button type="button" data-achievement-gallery-close aria-label="{achievementsCloseLabel}">×</button>
      <h1 id="achievement-gallery-title">{achievementsTitle}</h1>
      <p data-achievement-counter aria-live="polite">{counter}</p>
    </header>
    <ol class="achievement-gallery__tiles">
      <li data-achievement-tile="{id}" data-tile-kind="unlocked|locked|secret">…</li>
    </ol>
    <!-- dev/preview builds only -->
    <button type="button" data-achievement-reset>{achievementsResetLabel}</button>
  </div>
</div>
```

- **Non-secret tiles** are rendered at build time with both variants (unlocked: glyph +
  title + subtitle; locked: `achievementLockedTitle` + hint); script sets `data-tile-kind`
  and CSS shows the matching variant; the inactive variant is `hidden`.
- **Secret tiles** are rendered with the secret placeholder only. On unlock the script
  clones `<template data-achievement-unlocked-template>` and fills title/subtitle from the
  decoded payload and the glyph from `<template data-achievement-glyph="{token}">`. Before
  unlock, no secret copy exists anywhere in the DOM (FR-018).
- The counter is the only other client-assembled text.
- Open: focus moves to the close button; closing restores focus to the opener (toggle,
  or the previously focused element when opened from the toast).
- Close triggers: close button, Escape, pointerdown outside the frame.
- Scrolls internally; no horizontal scroll at 320px.

## Toast (changes to existing shell in `TrackRubOverlay.astro`)

```html
<div class="ve-achievement" data-ve-achievement hidden
     data-achievement-registry="{toClientPayload(...)}"
     data-achievement-unlocked-label="{achievementUnlockedLabel}">
  <button type="button" class="ve-achievement__card" data-ve-achievement-open>
    <AchievementGlyph … /> <p class="ve-achievement__eyebrow">{achievementUnlockedLabel}</p> …
  </button>
  <span class="ve-achievement__sr" role="status" aria-live="polite" aria-atomic="true"
        data-ve-achievement-announce></span>
</div>
```

- Root keeps `pointer-events: none`; the card button sets `pointer-events: auto`.
- `pointerenter` / `focusin` pause hide timers; `pointerleave` / `focusout` restart the
  hold. Activation hides the toast and dispatches `achievement-gallery-open`.
- The toast never calls `focus()`.
- The shell ships with empty title/subtitle; no default copy in the HTML.
