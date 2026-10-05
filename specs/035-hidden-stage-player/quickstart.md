# Quickstart: Hidden Stage Player — Validation Guide

**Feature**: `035-hidden-stage-player`

## Prerequisites

```bash
npm run check && npm test && npm run build   # agent + CI
npm run dev                                   # operator: http://localhost:4321/valence-electronica/
```

Viewports: 390×844 (phone), 1280×800 (laptop), 320px width (overflow check). Clear site
data (or use a fresh profile) before Scenario 1. Browser checks are done by the operator.

## Scenarios

1. **Clean first visit** — Fresh browser, intro skipped. No player chrome visible on
   phone or laptop. (FR-002, SC-001)
2. **Hint** — Tap/click empty stage 3× within ~1.5 s → vinyl peeks bottom-left with a
   nudge; wait 4 s → it slides away. Taps on nav, wordmark, or socials do not count.
   (FR-003, FR-004)
3. **Reveal + achievement** — Trigger the hint, tap the vinyl → full player opens with
   song list first; achievement toast shows once. Repeat after reload → no toast.
   (FR-004, FR-005, FR-012)
4. **Pick a song** — In the full player tap another song → stage, theme, title, and
   current marker change; shuffle state unchanged. Only the four stage songs are listed.
   (FR-005, FR-006, SC-003, SC-005)
5. **Minimal** — Close via X, Escape, and outside tap → vinyl only, bottom-left; vinyl
   reopens the player. Vinyl spins while music plays, not when paused. (FR-007, FR-008)
6. **Persistence** — Reload → starts in minimal. Private window → starts hidden.
   (FR-011)
7. **Sound** — Full player: unmute, (laptop) drag volume, pause/resume, toggle shuffle.
   Phone has mute only. (FR-005, FR-009)
8. **Discography play** — Open Discography (laptop overlay and phone menu): play buttons
   only on Nightmare, Taking Over, Infinite, and Show Me How (inside the EP card); press
   one → song changes and overlay/menu closes; player state is not forced open.
   (FR-010, US4)
9. **Keyboard** — Fresh browser, Tab from top → "Show player" appears, Enter opens full
   player; operate all controls; Escape → minimal, focus on vinyl. (FR-013, SC-004)
10. **Reduced motion** — No peek slide, nudge, spin, or open animation; all states still
    reachable. (FR-015)
11. **No conflicts** — Rub a rubbable card and spin on Infinite → no hint triggered;
    3 taps never start a rub. (Edge cases)
12. **Regression** — Shuffle auto-advance still runs with the player hidden; intro,
    tagline, nav overlays, and legal pages unchanged; no horizontal scroll at 320px.
