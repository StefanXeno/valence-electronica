# Implementation Plan: Glitch & Motion Language

**Branch**: `031-glitch-motion` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Source Map

| Concern | Files |
| ------- | ----- |
| Presets, one-shots, continuous, transition flavor | `src/lib/glitch.ts` |
| Ambient field scheduling | `src/lib/glitch-ambient.ts` (+ tests) |
| Press glitch wiring | `src/components/GlitchPress.astro` |
| Keyframes and families | `src/styles/glitch.css` |
| Hover/focus labels | `src/lib/label-reveal.ts` (+ tests), `#hud-label-reveal` in `Base.astro` |
| Panel motion constants | `src/lib/panel-motion.ts` (contains unused exports) |
| Site scale | `--site-scale` in `src/styles/global.css` |
