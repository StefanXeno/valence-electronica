# Contract: Site Nav Chrome UI (visitor-facing)

**Date**: 2026-09-18 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Authority** for primary site navigation and resting chrome placement
after this feature. Partially **supersedes** conflicting rest-chrome rules
in:

- [`019/contracts/desktop-chrome-polish.md`](../../019-desktop-chrome-polish/contracts/desktop-chrome-polish.md)
  — circular / boxed content icon bar as primary secondary chrome
- [`015/contracts/mobile-hud-ui.md`](../../015-mobile-stage-hud/contracts/mobile-hud-ui.md)
  — five-icon content dock as the *primary* path to Shop/Tour/Contact

Floor **player** behavior remains `021` / `015` / `019` until those
siblings ship. This contract MUST NOT redefine selection-first player or
vinyl → V-Flip (`021`) or dual stage videos (`022`).

**Visual review targets**: ~390×844 (phone), ~1280×800 (laptop), and
**320px** width (no horizontal page scroll from top nav).

## Layout — all viewports

| Zone | Contract |
|------|----------|
| **Top band** | Near-black (or brand-near-black) panel with **logo/brand** + four **text** destinations: Home, Shop, Tour, Contact. Logo weight > menu text (hero-level brand signal). **No** decorative circles required around menu items. |
| **Center** | Stage / atmosphere remains visual focus. Top nav and socials MUST NOT own the center. |
| **Floor player** | Owned by `021` / existing docks — out of scope except: top nav stays usable when player panels are open. |
| **Circular side stacks** | **Forbidden** as primary resting chrome for About / Discography / Tour / Socials / Info. |

## Primary destinations

| Item | Behavior |
|------|----------|
| **Home** | Returns to / stays on landing stage. Clears or does not trap visitor in a dead-end panel. |
| **Shop** | If `shopUrl` configured → outbound merch path. If unset → soft Coming soon panel. Item always visible. |
| **Tour** | Opens show/ticket discovery (`TourDates` + shows content). Empty shows → honest empty state. |
| **Contact** | Opens clear contact path (content-editable). Incomplete → honest empty/incomplete, never site 404. |

Progressive enhancement: destinations remain reachable without scripting
(static links / in-page anchors / native disclosure as applicable).

## Laptop (≥ 1024px)

| Zone | Contract |
|------|----------|
| Top band | Full four-label menu + brand (see above). |
| Side socials | Active platform links along a **side** peripheral edge (Nasaya-like). Exactly one `Channels` tree — relocate, do not duplicate. |
| Secondary content | About / Discography via **secondary text links under the top band** (not primary menu items); legal reachable without restoring circular icon column. |
| Legal | Impressum + privacy reachable in ≤2 obvious actions (Contact, Info, or explicit legal entry near secondary row). |

## Phone (≤ 1023px)

| Zone | Contract |
|------|----------|
| Top band | Same four destinations as primary nav (labels or clear equivalent menu). Not only via circular content dock. |
| Links | Retain usable **Links** pattern for platform outbound links (chrome `socialsLabel`, default **Links**; may restyle; must not delete). One Channels tree; park/reuse per `015` spirit. |
| Narrow width | Wrap / overflow menu OK; **no** horizontal page scroll caused by nav (SC-006). |
| Legal | Same reachability rule as laptop. |

## Accessibility

- Menu items are real controls (`<a>` / `<button>`) with visible text or
  accessible names matching chrome labels.
- Focus order: brand → primary nav → main stage → peripheral chrome.
- Contrast on near-black band meets constitution IV basics.
- Keyboard: all four destinations operable without pointer.

## Non-goals (explicit)

- Jukebox / vinyl / V-Flip discovery (`021`)
- Shuffle glyph, dual videos, NCS center logo, sprite removal (`022`)
- In-site e-commerce cart
- Tracking / analytics
