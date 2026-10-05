# Specs

This folder holds **living capability specs**: one spec per product area, describing what
the site does **today**. They replaced 22 incremental feature specs (`001`–`022`) on
2026-10-05; the originals are in git history at commit `5336b73`
(`git show 5336b73:specs/<dir>/spec.md`).

## Index

| Spec | Area | Status |
| ---- | ---- | ------ |
| [`023-site-foundation`](023-site-foundation/spec.md) | Hosting, live + preview publishing, SEO, legal reachability, privacy, content validation | As-built |
| [`024-artist-content-editing`](024-artist-content-editing/spec.md) | Artist edit surfaces, artist guide, pre-release → main publishing | As-built |
| [`025-stage-atmosphere`](025-stage-atmosphere/spec.md) | Background video/poster, audio opt-in, theme packs, scheduled default | As-built |
| [`026-stage-player`](026-stage-player/spec.md) | Stage entries (jukebox), switching, shuffle, player chrome | As-built, open gaps |
| [`027-site-navigation`](027-site-navigation/spec.md) | Top nav, content overlays + routes, phone menu, socials | As-built |
| [`028-music-catalog`](028-music-catalog/spec.md) | Discography: merge, year/EP grouping, covers, listen links | As-built |
| [`029-tour-dates`](029-tour-dates/spec.md) | Shows, ticket window, year groups | As-built |
| [`030-brand-identity`](030-brand-identity/spec.md) | Wordmark, rotating tagline + eggs, landing intro | As-built |
| [`031-glitch-motion`](031-glitch-motion/spec.md) | Glitch language, reduced motion, hover labels | As-built |
| [`032-easter-eggs`](032-easter-eggs/spec.md) | Rub reveal, Infinite spin, achievements | As-built |
| [`033-dev-tooling`](033-dev-tooling/spec.md) | mise toolchain, CI, unit tests, HUD verify | As-built |
| [`034-stage-artist-polish`](034-stage-artist-polish/spec.md) | Show Me How audio, brighter Taking Over, dual videos, NCS logo, shuffle look | Draft |

Each as-built spec has a `spec.md` (what and why, incl. a **Known Gaps** section) and a
short `plan.md` (where it lives in the code). As-built specs have no `tasks.md`.

## Working with these specs

1. **New feature or change**: run the spec-kit flow (`/speckit-specify` → `/speckit-clarify`
   → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`). It creates the next numbered
   folder (`035-…`). Reference the capability specs it touches.
2. **When it ships**: fold the essential behavior back into the affected capability
   spec(s) (update FRs, Known Gaps, and `plan.md` source map), then delete the feature
   folder in the same PR. Capability specs stay the single source of truth.
3. **Keep specs about behavior**: pixel values, timings tuned by eye, and visual history
   belong in code comments or commit messages, not in specs.

## Old → new mapping

Code comments still reference old spec numbers (e.g. `(015)`, `020`). Use this table to
find where that behavior is specified now.

| Old spec | Now in |
| -------- | ------ |
| `001-website-skeleton` | `023`, `024`, `027` |
| `002-themed-background-video` | `025` (atmosphere, audio), `027` (legal overlay) |
| `003-ui-glitch` | `031` |
| `004-landing-content-layout` | `026` (jukebox), `027` (layout, socials), `028`, `029`, `024` |
| `005-theme-packs` | `025` |
| `006-landing-intro` | `030` |
| `007-scheduled-stage-default` | `025` |
| `008-artist-docs` | `024` |
| `009-desktop-stage-ui` | `027`, `031` (labels, hit targets) |
| `010-track-catalog` | `028` |
| `011-vflip-now-playing` | `026` (shuffle, loop, timing), `025` (mute/volume) |
| `012-rotating-tagline` | `030` (+ `docs/tagline-pool.md`) |
| `013-codebase-hardening` | `026`, `028`, `033` |
| `014-discography-only-tracks` | `028` |
| `015-mobile-stage-hud` | `026` (dormant phone player), `027` (phone menu) |
| `016-agent-self-testing` | `033` |
| `017-mise-toolchain` | `033` |
| `018-player-animation-polish` | `026` (dormant phone player) |
| `019-desktop-chrome-polish` | `026` (laptop player), `027` |
| `020-site-nav-chrome` | `027` |
| `021-jukebox-easter-egg` | `026` (vinyl is decorative; V-Flip egg retired), `032` |
| `022-stage-artist-polish` | `034` (draft) |
