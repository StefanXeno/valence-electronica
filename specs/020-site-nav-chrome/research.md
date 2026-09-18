# Research: Site Nav & Fan-First Chrome

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

All Technical Context unknowns for this feature are resolved below.

## R1: Top panel is a new primary chrome band (not Hero-only)

- **Decision**: Introduce a **site top nav band** (near-black panel) that
  owns brand/logo + four text destinations: Home • Shop • Tour • Contact.
  Today’s `Hero.astro` wordmark/tagline becomes (or feeds) the brand slot
  in that band — logo is a **hero-level** identity signal relative to menu
  text weight. Menu items are **text-forward**, no decorative circles.
- **Rationale**: Spec FR-001 / FR-009 / US2; Nasaya-inspired reference is
  inspirational, not a pixel clone. Primary product goal is Shop/Tour
  findability (FR-010).
- **Alternatives considered**:
  - Keep circular content dock as Shop/Tour entry — fails SC-001 / FR-008.
  - Icon-only top bar — fails “readable menu labels” acceptance.
  - Separate marketing homepage route — out of scope; Home = landing stage.

## R2: Shop = external store URL + Coming soon empty state

- **Decision**: Add a content-editable **`shopUrl`** (optional string) on
  site/chrome data. When set, Shop navigates outbound (new tab or same-tab
  per existing channel pattern — prefer `target="_blank"` +
  `rel="noopener noreferrer"` like channels). When unset, Shop opens an
  in-stage soft **Coming soon** panel (reuse `comingSoon` chrome string /
  new `shopComingSoon` body if needed). Shop **always** stays in the nav.
- **Rationale**: FR-004; no in-site cart (out of scope). No dedicated shop
  field exists today — Bandcamp lives in `channels[]`, which must not be
  silently overloaded as “Shop” without an explicit store URL field.
- **Alternatives considered**:
  - Hide Shop until URL exists — violates FR-004.
  - Auto-map Bandcamp channel to Shop — couples socials to merch IA;
    rejected until operator sets `shopUrl`.
  - Full Shopify embed — tracking/runtime risk (constitution V / I).

## R3: Tour opens existing shows path; Contact is content-backed

- **Decision**:
  - **Tour** activates the existing tour/shows surface (`TourDates.astro`
    + `src/content/shows/*.md`) via the new top nav — not via a circular
    side button. Empty shows → existing `emptyShows` honest empty state.
  - **Contact** opens a new or relocated **contact panel** fed by
    content (`contact` fields in `site.json` and/or a small
    `src/content/contact/` / chrome strings). Exact channel mix (email,
    booking, social CTA) is content-editable. Incomplete contact → honest
    empty/incomplete state, never site-wide 404.
  - **Home** scrolls/focuses/returns to the landing stage (same page;
    clear open panels if needed).
- **Rationale**: FR-002 / FR-003 / FR-005; Assumptions — discovery chrome
  change, not show data shape change.
- **Alternatives considered**: Separate `/tour` / `/shop` Astro routes —
  possible later; MVP keeps single-page stage + panels to match current
  architecture and static GH Pages base path.

## R4: Remove circular side / content-dock stacks as primary chrome

- **Decision**: Resting chrome MUST NOT present a vertical (laptop) or
  five-icon circular (phone content dock as *primary nav*) stack for
  Shop/Tour/Socials/About/etc. **StagePanels** circular pills are
  **removed from primary chrome** (not left as an ambiguous soft demote).
  Secondary content (About, Discography, legal/Info) uses a quiet
  **secondary text row under the top band** — satisfies FR-008 and
  constitution V (legal reachable in 1–2 actions).
- **Rationale**: Gosha/Hendrik feedback; FR-008 / SC-003; partially
  supersedes `019` desktop icon bar and `015` phone content dock as the
  *primary* way to reach Shop/Tour/Contact.
- **Alternatives considered**:
  - Restyle circles only — still “dashboard of circles” (rejected).
  - Soft demote StagePanels in place — rejected; end state is remove from
    primary chrome.
  - Delete About/Discography — out of Assumptions (they remain secondary
    under the top band).
  - Keep phone five-icon dock as primary — conflicts with FR-001 phone
    acceptance (four destinations as primary nav).

## R5: Side socials on laptop; keep mobile Links pattern

- **Decision**:
  - **Laptop (≥1024px)**: Platform links along a **side** peripheral zone
    (Nasaya-like). Reuse the single `Channels.astro` tree; relocate from
    today’s top-right cluster to a side edge treatment. Not exclusively
    inside a circular dock.
  - **Phone (≤1023px)**: Retain the liked **Links** pattern (socials
    trigger / parked Channels in a sheet or equivalent). Visitor label =
    chrome `socialsLabel` with default **`Links`** (field name unchanged).
    May restyle to match simplification; must not delete (FR-007 / SC-004).
- **Rationale**: Spec US3; `015` Links retention called out explicitly.
- **Alternatives considered**: Socials only in Contact — buries platforms
  (fails US3). Duplicate channel mounts — rejected (`015` one-tree rule).
  Dual “Links” vs “Socials” visitor strings — rejected; one default.

## R6: Breakpoint stays 1024px; progressive enhancement for primary nav

- **Decision**: Keep `PHONE_MQ = '(max-width: 1023px)'`. Top nav must work
  at 320px (wrap, compact overflow menu, or equivalent) with **no
  horizontal page scroll**. Primary destinations remain reachable with
  **no JS** (static links / in-page anchors / `<a>` + `<details>` as
  applicable). Panel morph / exclusive-open JS stays justified enhancement.
- **Rationale**: Constitution IV; FR edge cases; SC-006.
- **Alternatives considered**: New tablet breakpoint — YAGNI (constitution
  VI). JS-only menu — fails no-script edge case.

## R7: Sibling ownership — do not redesign player or stage polish here

- **Decision**: Floor player / V-Flip / selection-first / vinyl easter egg
  → `021`. Track atmosphere, dual videos, shuffle glyph, tap-vs-swipe →
  `022`. This feature only ensures top nav stays usable when player
  panels open and does not reintroduce circular side docks that `021`
  would then fight.
- **Rationale**: FR-013; Dependencies section; avoid double chrome churn.
- **Alternatives considered**: Bundle all three into one mega-feature —
  rejected (constitution VI / sibling specs already exist).

## R8: Content-code separation for nav labels + artist docs

- **Decision**: Nav labels (`homeTitle`, `shopTitle`, `tourTitle`,
  `contactTitle`), Shop URL, and Contact copy live in `chrome.md` +
  `site.json` only (`contact` object in `site.json` — no contact content
  collection). Update `docs/artist-guide.md` in the same change set
  (constitution VII).
- **Rationale**: FR-012; principles III + VII.
- **Alternatives considered**: Hardcoded English labels in Astro —
  violates III. `src/content/contact/` markdown — rejected; keep one site
  data surface consistent with channels.

## R9: Legal path after Info dock removal

- **Decision**: Impressum / Datenschutzerklärung remain reachable from
  every view via Contact, a quiet Info/legal entry, or equally obvious
  links — **not** only a hidden footer. Prefer keeping an explicit legal
  entry near Contact or secondary chrome rather than relying on a
  permanent footer alone (footer is already hidden on landing today).
- **Rationale**: Constitution V; FR-011; SC-005.
- **Alternatives considered**: Footer-only legal on landing — currently
  footer is hidden; would regress if used as sole path.
