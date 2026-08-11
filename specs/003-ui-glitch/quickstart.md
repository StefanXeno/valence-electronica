# Quickstart & Validation: UI Glitch Interactions

**Date**: 2026-08-12 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 22+ (LTS) and npm
- Feature branch `003-ui-glitch` with implementation refined against this plan
- Background/mute from `002` available so the mute control can appear (`hasAudio: true`,
  motion allowed, video playing)

## Local development

```bash
npm install
npm run dev       # http://localhost:4321/valence-electronica/
```

## Quality gates (same as CI)

```bash
npm run check
npm run build
npm run preview
```

## Validation scenarios (map to spec)

1. **US1 — one-shot hover/press**: With motion allowed, hover then press an active channel
   link and a legal footer link. Expect: short glitch each time; text stays readable;
   navigation/action still works; no continuous idle loop on those links.
2. **US1 — keyboard-visible focus**: Tab to an in-scope link/button. Expect: one-shot
   glitch on keyboard-visible focus. Click the same control with a mouse so it focuses.
   Expect: **no** focus glitch from that mouse-click focus (hover/press rules still apply).
3. **US1 — hit target survival**: Trigger a glitch and click/tap during it. Expect: first
   deliberate activation registers (no dead frames).
4. **US2 — mute morph**: With mute visible, unmute then mute. Expect: expand/collapse uses
   glitch-styled morph; **no** extra press glitch stacked on the click; control stays
   operable mid-morph.
5. **US2 — continuous mute hover only**: Hover the mute button and keep the pointer there.
   Expect: continuous glitch while hovering; stops when pointer leaves. Hover channel/legal
   links. Expect: one-shot only — never continuous.
6. **Out of set**: Hover/drag the volume slider (after unmute) and hover a “coming soon”
   placeholder. Expect: **no** glitch treatment.
7. **US3 — reduced motion**: Enable OS/browser reduce motion, reload. Expect: 0 glitch
   treatments on hover, keyboard focus, press, mute hover (including sustained hover on
   mute after continuous hover exists), and mute morph; mute may still change layout for
   clarity; actions still work.
7b. **Viewport**: At ~320px width with motion allowed, trigger glitches on channel/legal/
    mute. Expect: controls stay on-screen and usable; no permanent cover of primary content.
8. **Legal exit**: Open a legal page, hover/press Exit. Expect: one-shot glitch; Exit still
   returns home; reduced motion skips glitch.
9. **Intensity / owner taste**: Owner reviews one-shots and continuous mute hover. Expect:
   calm, on-brand, roughly ≤3 distinct flashes/sec, no full-viewport flashes (SC-005 /
   SC-006).
10. **Privacy / weight**: Network panel. Expect: no third-party motion libraries or
    tracking; only first-party assets.

## Reference

- Behavior contract: [contracts/glitch-ui.md](./contracts/glitch-ui.md)
- Behavioral model: [data-model.md](./data-model.md)
- Research decisions: [research.md](./research.md)
- Acceptance source: [spec.md](./spec.md)
