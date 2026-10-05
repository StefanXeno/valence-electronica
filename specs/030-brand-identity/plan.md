# Implementation Plan: Brand Identity, Rotating Tagline & Landing Intro

**Branch**: `030-brand-identity` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Source Map

| Concern | Files |
| ------- | ----- |
| Wordmark | `src/components/SiteNav.astro`, `src/assets/images/brand/valence-wordmark.*` |
| Subtext mount | `src/components/Hero.astro` (`variant="tagline"`) |
| Pool data | `src/data/tagline-pool.json` |
| Pool parsing, validation, eligibility | `src/lib/tagline-pool.ts` (+ tests) |
| Rotation, fades, rub pin | `src/lib/tagline-rotator.ts`, `src/styles/tagline-rotate.css` |
| Intro component | `src/components/LandingIntro.astro`, `src/styles/intro.css` |
| Intro flag + gating | `src/lib/intro.ts` |
| Viewport timing config | `src/lib/intro-config.ts` (+ tests) |
| Dev replay route | `src/pages/dev/intro.astro` (dev builds only) |
