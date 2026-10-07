# Quickstart: Validate the Achievement Gallery

**Feature**: `036-achievement-gallery`

## Automated

```bash
npm test        # achievements.test.ts: registry validation, state, tiles, counter, reset
npm run check   # astro check (types, content schema incl. removed chrome fields)
npm run build   # fails if the registry is invalid or secret copy leaks into dist/
```

Registry failure check: temporarily remove `hint` from `infinite-spin` in
`src/data/achievements.json` → `npm run build` fails naming `infinite-spin`. Revert.

## Manual (operator, browser)

Use `npm run dev` (reset visible) unless noted. Clear site data between runs or use the
reset button.

| # | Steps | Expected | Spec |
| - | ----- | -------- | ---- |
| 1 | Fresh browser, load landing | No trophy icon; Tab never reaches one | US2-1, SC-002 |
| 2 | Type `666` | Toast + Nightmare; trophy appears bottom-right with pulse | US2-2 |
| 3 | Hover the toast for 6 s, then leave | Stays while hovered, then exits | US2-4 |
| 4 | Trigger another egg (3 taps on stage → vinyl peeks) | Icon pulses again | US2-3 |
| 5 | Click the toast | Gallery opens; toast gone | US2-5 |
| 6 | Tab to a visible toast, press Enter | Gallery opens; focus never jumped on toast appear | US2-5/6 |
| 7 | Open gallery | "2 / 5 found"; Demonic + Found it! unlocked; Infinite and Coder show ??? + hint; first tile secret only | US1-3…6 |
| 8 | Close via X, Escape, outside click | Closes each time; focus back on trophy | US1-7 |
| 9 | Open player (full), then open gallery; then open gallery, then open player / Tour / phone menu | Only one surface open at a time | US1-8 |
| 10 | Rub `taking-over` in discography | Secret tile fills with its title and subtitle in place if the gallery is open | US1, FR-018 |
| 11 | Reduced motion on, unlock something | No pulse, no tile glitch, toast still shows | US2-7, FR-014 |
| 12 | Private window with storage blocked, trigger eggs | No icon ever, no toast | Edge, SC-004 |
| 13 | Phone width 320px, gallery open | No horizontal scroll; icon doesn't collide with vinyl/footer/menu | SC-005 |
| 14 | Reset → reload | Newcomer state: no icon, player hidden, toasts fire again | US4-2 |
| 15 | `npm run build`, inspect `dist/index.html` for `data-achievement-reset` | Absent in live build; present under `/pre-release/` build | US4-3, SC-006 |
| 16 | Edit a title, hint, secret flag and order in `achievements.json` | Toast and gallery reflect all after rebuild | US3, SC-003 |
| 17 | Existing visitor: set `ve-achievement-why-are-you-rubbing` = `1` in DevTools before loading the new build | Icon visible; rub tile unlocked; storage now has `ve-achievement-rub` and no legacy key | FR-011, Edge "prior progress" |
| 18 | Before unlocking the secret: View Source and DevTools Elements search for "rubbing"; after `npm run build`, `grep -ri rubbing dist/` | No match anywhere; build log shows the secret check passing | FR-018, SC-007 |
| 19 | View Source of the built landing; find the "coder" comment; type `coder` on the stage (not in a field) | Comment sits mid-body (not in head / top of body) and mentions `#coder`; Coder toast; tile unlocked | US5, FR-019/020 |
| 20 | Phone (or narrow window): open `…/#coder`; then on a fresh state open `…/tour#666` | Coder unlocks; then Nightmare + Demonic toast + wild glitch with the Tour overlay still open; both times the hash vanishes from the URL and Back does not return to it | FR-021 |
| 21 | Type `666`, open the gallery; switch "Ultra glitch" off, then pick another stage and switch it on; reload | Off calms the glitches; on starts Nightmare with wild glitches; after reload the switch is off; locked Demonic tile shows no switch | US6, FR-022 |
