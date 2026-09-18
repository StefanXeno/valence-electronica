# Feature Specification: Site Nav & Fan-First Chrome

**Feature Branch**: `020-site-nav-chrome`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Massive site overhaul from Gosha + Hendrik
    feedback — Nasaya-inspired top chrome (Home • Shop • Tour • Contact),
    side socials, remove corporate circular side buttons, simplify design;
    primary goal is fan infrastructure (merch + tickets), secondary is a
    calling-card stage. Related specs: `021-jukebox-easter-egg`,
    `022-stage-artist-polish`."

## Related Specs

| Spec | Relationship |
| ---- | ------------ |
| `021-jukebox-easter-egg` | Sibling. Player / song-select UX and V-Flip easter egg. This feature owns **site nav and primary chrome**, not jukebox transport. |
| `022-stage-artist-polish` | Sibling. Track-specific stage polish, sprites, shuffle glyph, mobile tap preference. |
| `019-desktop-chrome-polish` | **Partially superseded** for desktop top/floor chrome language: circular icon docks and “corporate” boxed chrome give way to Nasaya-like top panel + side socials. Floor player ownership moves toward `021`. |
| `015-mobile-stage-hud` | **Partially superseded** for phone top identity / content-dock circular icon bar as the *primary* way to reach Shop/Tour/Contact. Mobile **Links** pattern is retained (see Assumptions). Floor player → `021` / `022`. |
| `009-desktop-stage-ui` / `004-landing-content-layout` | Historical HUD composition. Identity + socials + peripheral content remain in spirit; **placement and visual language** follow this feature. |
| `010-track-catalog` | Unchanged. Catalog remains a content concern; not part of primary nav. |

## Design Direction *(draft)*

Today’s site reads as a dense interactive HUD: circular icon clusters, boxed
docks, and peripheral panels. Hendrik’s reference
([itsnasaya.com](https://www.itsnasaya.com/)) and feedback call for a
**simpler, less corporate** first impression:

| Zone | Target treatment |
| ---- | ---------------- |
| **Top** | Black (or near-black) panel with **logo** and four text menu items: **Home • Shop • Tour • Contact**. Logo is a primary brand signal, not a tiny nav mark. Prefer **no circles** around menu items. |
| **Sides** | **Social media links** along a side edge (Nasaya-like), not buried only in a circular dock. |
| **Sides (controls)** | **Remove** the circular / corporate **side button** clusters as the primary chrome. On-demand content that survives (About, Discography, Info/legal) must not reintroduce a tall circular icon stack as the default look. |
| **Center stage** | Remains the atmosphere / stage. Nav and socials must not own the center. |
| **Goals** | **Primary:** help fans and casual listeners **buy merch** and **get tickets** for shows. **Secondary:** calling card for people discovering Valence — stage interactivity stays part of the brand but must not bury Shop/Tour. |

Visual simplification is a product requirement: fewer competing chrome
objects, clearer hierarchy, no “dashboard of circles.”

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fan finds Shop and Tour in one glance (Priority: P1)

A returning fan or casual listener lands on the site (phone or laptop).
Without hunting icon docks, they see a clear top menu with **Shop** and
**Tour**. They can open Shop to buy merch and Tour to find shows/tickets
in a small number of obvious steps.

**Why this priority**: Primary product goal from Hendrik — infrastructure
for fans to buy merch and tickets.

**Independent Test**: On a cold load at phone and laptop widths, a tester
who has never used the site can point to Shop and Tour within 5 seconds
and reach each destination without opening a jukebox or circular dock.

**Acceptance Scenarios**:

1. **Given** a visitor on a laptop-width viewport, **When** the landing
   loads, **Then** a top panel shows logo plus Home, Shop, Tour, and
   Contact as readable menu labels (not icon-only circles).
2. **Given** a visitor on a phone-width viewport, **When** the landing
   loads, **Then** the same four destinations remain reachable as
   primary navigation (labels or an equivalent clear menu), not only
   via a circular content dock.
3. **Given** Shop has a configured external store URL, **When** the
   visitor activates Shop, **Then** they reach the merch buying path
   (outbound store) without opening About, Discography, or the jukebox
   first.
4. **Given** Shop has no store URL configured yet, **When** the visitor
   activates Shop, **Then** they see a soft “Coming soon” empty state
   (or equivalent honest panel) — Shop remains visible in the nav; the
   site does not 404.
5. **Given** Tour has show content, **When** the visitor activates Tour,
   **Then** they see upcoming shows and can reach ticket purchase links
   where those links exist in content.

---

### User Story 2 - New visitor understands whose stage this is (Priority: P1)

Someone who never heard of Valence arrives from a social link. The first
viewport communicates the brand (logo / name) and offers an obvious path
into the stage (Home) plus Contact, without feeling like a SaaS product
chrome kit.

**Why this priority**: Secondary goal — calling card for discovery.

**Independent Test**: With brand mark covered, the top panel still reads
as an artist site menu; with menu covered, the logo/name still identifies
the artist.

**Acceptance Scenarios**:

1. **Given** a first-time visitor, **When** the page loads, **Then** the
   brand/logo in the top panel is a hero-level identity signal relative
   to menu text weight.
2. **Given** the visitor chooses Home, **When** they are already on the
   landing stage, **Then** they remain on (or return to) the stage
   without a dead end.
3. **Given** Contact is available, **When** the visitor activates it,
   **Then** they reach a clear contact path (see Assumptions).

---

### User Story 3 - Socials stay findable without circular side docks (Priority: P2)

A visitor wants Instagram / streaming / etc. They find social links on a
**side** placement similar to the Nasaya reference, without needing a
circular “Socials” dock as the only path on desktop. On mobile, the
existing **Links** pattern Hendrik likes remains available.

**Why this priority**: Explicit feedback — side socials like Nasaya;
mobile Links kept.

**Independent Test**: Desktop: socials visible or one reveal away on a
side edge without opening About. Phone: Links still works as a
liked pattern.

**Acceptance Scenarios**:

1. **Given** a laptop-width viewport, **When** the landing is at rest,
   **Then** platform social links appear along a side edge (or an
   equally peripheral side treatment), not only inside a circular dock.
2. **Given** a phone-width viewport, **When** the visitor looks for
   outbound platform links, **Then** the mobile Links pattern remains
   available and usable.
3. **Given** any viewport, **When** comparing rest chrome to today’s
   circular side/content dock stacks, **Then** those stacks are no
   longer the primary navigation metaphor.

---

### User Story 4 - Side circular button chrome is gone (Priority: P2)

Gosha asked to try removing **all buttons from the side**. After this
feature, the resting stage does not present a vertical stack of circular
control buttons along the side as primary chrome. Surviving secondary
content (About, Discography, legal/Info) uses quieter entry points that
fit the simplified top-nav model.

**Why this priority**: Direct artist feedback; unblocks the “less
corporate” look.

**Independent Test**: Screenshot rest state at laptop width — no circular
side icon column as the main secondary chrome.

**Acceptance Scenarios**:

1. **Given** the landing at rest on laptop width, **When** a reviewer
   inspects left/right edges, **Then** there is no primary column of
   circular on-demand buttons.
2. **Given** About or Discography still exist as content, **When** a
   visitor needs them, **Then** they remain reachable without restoring
   the old circular side dock as the default IA.
3. **Given** legal obligations (Impressum / privacy), **When** a visitor
   seeks them, **Then** they remain reachable from every page/view
   without relying on a hidden-only footer that violates constitution V.

---

### Edge Cases

- Shop with no external store URL yet — nav still shows Shop; activating
  it opens a soft “Coming soon” (or equivalent) empty state. Must not
  404 the whole site or hide the menu item.
- Contact destination missing or incomplete — must not 404 the whole
  site; show an honest incomplete/empty contact path.
- Tour with zero upcoming shows — show an honest empty state, still
  reachable from the menu.
- Very narrow phones — top menu must remain usable (wrap, overflow menu,
  or equivalent) without horizontal page scroll.
- Scripting unavailable — primary destinations still reachable with
  progressive enhancement (static links / in-page anchors as applicable).
- Open jukebox or stage panels — top nav remains usable; center stage
  stays the visual focus when panels close.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST present a top chrome band with brand/logo and
  four primary destinations labeled **Home**, **Shop**, **Tour**, and
  **Contact**.
- **FR-002**: **Home** MUST return the visitor to the main landing stage
  (or keep them there if already on it).
- **FR-003**: **Tour** MUST open the show/ticket discovery path using
  existing tour content (dates, venues, ticket links where present).
- **FR-004**: **Shop** MUST always appear in primary nav. When an
  external store URL (Bandcamp, Shopify, or similar) is configured in
  content, activating Shop MUST take the visitor to that merch buying
  path. When no store URL is configured, activating Shop MUST show a
  soft “Coming soon” empty state (or equivalent honest panel) — do not
  hide Shop and do not require an in-site storefront.
- **FR-005**: **Contact** MUST open a clear contact path for fans
  (content-editable). Exact channel mix follows Assumptions.
- **FR-006**: Laptop-width layouts MUST place social platform links along
  a **side** peripheral zone (Nasaya-like), not exclusively inside a
  circular dock.
- **FR-007**: Phone-width layouts MUST keep a usable **Links** pattern for
  platform outbound links (Hendrik: keep the Links thing on mobile).
- **FR-008**: Resting chrome MUST NOT use a vertical stack of circular
  side buttons as the primary way to reach About, Discography, Tour,
  Socials, or Info.
- **FR-009**: Visual language for primary nav MUST prefer text (or
  text-forward) controls over circled icon buttons; no decorative
  circles required around menu items.
- **FR-010**: Primary chrome MUST prioritize fan goals (Shop, Tour) over
  deep interactive discovery; stage interactivity remains available but
  secondary in the information architecture.
- **FR-011**: Impressum and Datenschutzerklärung MUST remain reachable
  from every view (constitution V), via Contact, Info, or an equally
  obvious legal path — not removed in the simplification.
- **FR-012**: All new or relocated visitor-facing labels for this chrome
  MUST remain editable in content files without touching layout code
  (constitution III).
- **FR-013**: This feature MUST document cross-links to `021` and `022`
  so player UX and stage polish are not re-specified here.

### Key Entities

- **Primary Nav Item**: One of Home, Shop, Tour, Contact — label,
  destination kind (stage / shows / merch / contact), optional external
  URL. Shop stays visible even when its store URL is unset (Coming soon
  empty state).
- **Side Social Link**: Platform identity + outbound URL from existing
  socials content.
- **Secondary Content Entry**: About, Discography, legal — still
  content-backed, no longer primary circular side chrome.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In moderated first-use tests (phone and laptop), at least
  **9 of 10** participants locate Shop and Tour within **5 seconds** of
  load without facilitator hints.
- **SC-002**: Participants can start a merch or ticket path in **under
  30 seconds** from load: reach the external Shop store when configured,
  or the Shop “Coming soon” empty state when not; or a Tour ticket link
  when configured.
- **SC-003**: Rest-state laptop review: **zero** primary circular side
  button columns; reviewers rate the chrome as “simpler / less
  corporate” vs current HUD in a preference check (**≥ 80%** prefer new).
- **SC-004**: Mobile Links remains usable; **100%** of test participants
  who are asked to open a social/platform link on phone succeed on the
  first attempt via the Links pattern or side-equivalent.
- **SC-005**: Legal pages remain reachable in **one or two** obvious
  actions from any landing state on both phone and laptop.
- **SC-006**: Page remains usable from **320px** width up with no
  horizontal scrolling caused by the new top nav.

## Assumptions

- Reference look is inspirational (Nasaya), not a pixel clone; Valence
  keeps its own brand voice and stage atmosphere.
- **About** and **Discography** remain part of the site as secondary
  content, reachable without restoring circular side docks (e.g. quieter
  text entry, Contact area, or stage-adjacent secondary links). Exact
  placement is plan-time within FR-008.
- **Home** is the existing landing stage, not a new marketing homepage
  separate from the stage.
- Tour content continues to live in structured content (existing shows
  model); this feature changes **discovery chrome**, not show data shape.
- **Shop** destination is an **external store URL** when the operator is
  ready (Bandcamp/Shopify/etc.). Until that URL is configured, Shop
  remains in the nav and opens a soft “Coming soon” empty state — not a
  built-in e-commerce cart and not a hidden menu item.
- Mobile Links retention means the liked phone pattern for platform
  links stays; it may be restyled to match simplification but must not
  be deleted.
- Interactivity (jukebox, themes, glitch) remains brand-secondary and is
  specified in `021` / `022`, not removed by this feature.
- Constitution constraints apply: static-first, content-code separation,
  English UI copy, German legal texts only where required.
- “No circles” targets corporate circular **control** chrome; circular
  avatars or logos are not banned if they are brand assets.

## Dependencies

- Existing tour / shows content and ticket outbound links.
- Existing socials content list.
- Sibling specs `021-jukebox-easter-egg` and `022-stage-artist-polish`
  for player and stage polish; implementers should sequence chrome IA
  before or with player default changes to avoid double chrome churn.
- Supersedes conflicting rest-chrome placement rules in `019` / `015`
  for primary nav and side circular docks (see Related Specs).

## Out of Scope

- Implementing or redesigning the jukebox / V-Flip easter egg (`021`).
- Track-specific atmosphere fixes (Show me How audio, Taking Over cut /
  brightness, NCS logo, Minecraft sprites, shuffle glyph) (`022`).
- Building a full e-commerce storefront inside the static site.
- New tracking/analytics (constitution V).
- Renaming the artist or replacing the whole visual identity system
  beyond chrome simplification described here.
