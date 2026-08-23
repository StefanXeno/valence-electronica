# Research: Scheduled Stage Default

**Date**: 2026-08-23 | **Plan**: [plan.md](./plan.md)

All Technical Context unknowns for this feature were resolved as follows.

## R1: Schedule file format and location

- **Decision**: JSON at `src/data/stage-schedule.json`, alongside `site.json`. Shape:
  `timezone` (fixed `Europe/Berlin` in v1) + ordered `rules[]` each with a `type` discriminator.
- **Rationale**: Project already uses JSON under `src/data/` for structured non-Markdown
  config. No new parser dependency. Editors can copy/paste rule blocks from the contract.
- **Alternatives considered**: YAML (needs loader or npm dep); rules in jukebox frontmatter
  (splits “when” from “what” across files, violates one-place schedule editing); CMS/cron
  table (violates I/II/VI).

## R2: Rule types and date encoding (v1)

- **Decision**:
  - **`date`** — `on`: `MM-DD` (yearly recurring) or `YYYY-MM-DD` (one-off). `jukeboxId`.
  - **`range`** — inclusive `from` / `to` as `YYYY-MM-DD`. `jukeboxId`.
  - **`weekday`** — `days`: array of ISO weekdays `1` (Mon) … `7` (Sun). `jukeboxId`.
- **Rationale**: Matches spec FR-002/edge cases (yearly Oct 31, inclusive ranges, Friday).
  Full dates for ranges avoid ambiguous year-wrap. ISO weekdays are unambiguous for editors
  with the contract cheat sheet.
- **Alternatives considered**: Cron syntax (too developer-centric); US Sunday=0 (confusing
  for DE artist); week-of-year (out of scope).

## R3: Resolution priority and tie-breaking

- **Decision**: Evaluate tiers in order — **date → range → weekday → static fallback**.
  Within a tier, **first matching rule in file order** wins. Year-specific `YYYY-MM-DD`
  date rules are in the same tier as recurring `MM-DD` (both `type: date`); file order
  breaks ties when both match.
- **Rationale**: Matches spec FR-006 and edge-case table. Simple for editors: put specific
  overrides above general rules.
- **Alternatives considered**: Score-based specificity (over-engineered for tens of rules);
  last-wins (harder to reason about).

## R4: Build-time vs client-time evaluation (hybrid)

- **Decision**:
  - **Build**: Load schedule JSON; validate schema; assert every `jukeboxId` references a
    **usable** jukebox entry id; **fail `astro check`/build** on invalid ids (FR-008).
    Embed normalized schedule JSON in the landing page (e.g. `data-stage-schedule` on
    jukebox root).
  - **Client**: On `initStageSwitch`, call `resolveScheduledDefault(schedule, berlinToday,
    catalogIds, staticFallbackId)`; if result ≠ SSR default, immediately `applyStageEntry`
    + `syncStageUi`.
  - **SSR**: Keep prerendering **static fallback** (`default: true` jukebox entry) for
    `<html data-theme>`, atmosphere video/poster, lyrics visibility, and jukebox
    `aria-current` — satisfies FR-014 and no-JS path.
- **Rationale**: Static host cannot know visitor calendar at build time for all future days
  (FR-004). SSR fallback avoids blank/stale builds. Reusing `applyStageEntry` avoids a
  second theme/video code path.
- **Alternatives considered**:
  - Build-time-only + daily CI cron — fails FR-004 without redeploy semantics spec rejects.
  - SSR “today at build” — stale after midnight Berlin.
  - Inline `<head>` blocking script — marginal flash win vs complexity; defer unless QA
    rejects boot-time apply.

**Flash note**: When scheduled ≠ static fallback and JS runs, visitors may see one frame of
fallback before correction. Acceptable for v1; mitigated by running resolver at the start
of stage boot before user interaction.

## R5: Europe/Berlin “today” without a date library

- **Decision**: Use `Intl.DateTimeFormat` with `timeZone: 'Europe/Berlin'` and `formatToParts`
  to obtain `{ year, month, day, weekday }` for “now”. Compare rule dates as strings/ints in
  Berlin calendar space. Same helper used in build validation smoke tests if needed.
- **Rationale**: Built into modern browsers and Node 22; zero dependency; handles DST because
  `Intl` uses IANA zone rules.
- **Alternatives considered**: `Date.getTimezoneOffset` manual math (DST bugs); luxon/dayjs
  (unnecessary dep); visitor local timezone (spec excludes).

## R6: Missing schedule file and runtime safety

- **Decision**:
  - Missing file or empty `rules` → treat as “no schedule”; behavior identical to today
    (static fallback only).
  - Runtime matched id not in catalog (should not happen post-validation) → skip, fall
    through to next tier / static fallback (FR-009).
  - Invalid calendar dates in JSON → reject at build with explicit error (FR edge case).
- **Rationale**: Never blank the landing; editors get fast feedback on typos.
- **Alternatives considered**: Warn-only on bad ids (spec FR-008 says must not ship silently
  — build failure is clearer than warn).

## R7: Integration with jukebox override (004)

- **Decision**: No change to manual selection path — `initStageSwitch` keeps in-memory
  `activeId`; schedule resolver runs **once** at boot to set initial `activeId`. Reload
  re-runs boot (FR-011). No `sessionStorage`.
- **Rationale**: Spec FR-010/FR-011; matches existing 004 “reload resets to default” with
  “default” now meaning scheduled-or-fallback.
- **Alternatives considered**: Persist override (out of scope); re-apply schedule on
  visibility change (unnecessary).

## R8: Testing strategy

- **Decision**: Manual quickstart scenarios + `astro check`/`build` gates. Optional small
  Node script or vitest later for `resolveScheduledDefault` pure function — not required for
  v1 merge.
- **Rationale**: Same as 004/006; YAGNI.
- **Alternatives considered**: Playwright date mocking (heavy for hobby static site).
