# Specification Analysis Report: 020-site-nav-chrome

**Date**: 2026-09-18  
**Artifacts**: [spec.md](./spec.md) · [plan.md](./plan.md) · [tasks.md](./tasks.md)  
**Command**: `/speckit-analyze` (persisted for operator durability)

## Findings

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| U1 | Underspecification | MEDIUM | data-model.md; plan.md; tasks T004/T015 | Contact storage is dual-option (`site.json` vs `src/content/contact/`) without a single mandatory pick | Pick one edit surface in implement kickoff; document only that path in artist guide (T027) |
| U2 | Underspecification | MEDIUM | spec Assumptions; tasks T023 | Exact secondary placement for About/Discography left “plan-time”; tasks allow several patterns | Decide one pattern (e.g. secondary text under top band) before US4 coding to avoid churn |
| A1 | Ambiguity | MEDIUM | tasks T022 | “Remove or demote” StagePanels circular chrome — two different end states | Prefer remove-from-rest-primary; if demote, define non-circular visual in contract note during implement |
| I1 | Inconsistency | LOW | spec “Links” vs chrome `socialsLabel` | Mobile pattern named Links in prose; content field still Socials | Keep visitor label content-editable; treat “Links” as product nickname in specs |
| C1 | Coverage | LOW | SC-001–SC-004 | Moderated preference / timed findability metrics have no automated tasks | Expected — cover via quickstart manual scenarios; no build gap for MVP |
| D1 | Duplication | LOW | FR-008 vs FR-010 | Both push fan-first / non-circle chrome | Fine as complementary FRs; no merge required |

**CRITICAL issues**: **0**  
**HIGH issues**: **0**

## Coverage Summary Table

| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|
| FR-001 top band four destinations | Yes | T006, T007 | |
| FR-002 Home → stage | Yes | T014 | |
| FR-003 Tour → shows | Yes | T008, T010 | |
| FR-004 Shop URL / Coming soon | Yes | T004, T009 | |
| FR-005 Contact path | Yes | T015, T016 | |
| FR-006 laptop side socials | Yes | T018, T020 | |
| FR-007 phone Links | Yes | T019 | |
| FR-008 no circular primary stack | Yes | T022, T025 | |
| FR-009 text-forward nav | Yes | T007 | |
| FR-010 fan goals over deep IA | Yes | T007–T009 | IA outcome |
| FR-011 legal reachable | Yes | T024 | |
| FR-012 content-editable labels | Yes | T002–T005, T027 | |
| FR-013 cross-link 021/022 | Yes | T029 | |
| SC-005 legal ≤2 actions | Yes | T024, T026 | Manual |
| SC-006 320px no H-scroll | Yes | T031 | Manual |
| US1–US4 acceptance | Yes | T012, T017, T021, T026 | quickstart |

## Constitution Alignment Issues

None. Gates in plan.md PASS for I–VII. Legal reachability and artist-guide update are tasked (T024, T027). No tracking/embeds introduced.

## Unmapped Tasks

| Task | Notes |
|------|-------|
| T001 | Setup review — OK |
| T028 | Supersession callouts on 015/019 — supporting, not an FR |
| T030 | CI + sibling smoke — polish |

## Metrics

| Metric | Value |
|--------|-------|
| Total Requirements (FR) | 13 |
| Total Tasks | 31 (T001–T031) |
| Coverage % (FR with ≥1 task) | **100%** |
| Ambiguity Count | 1 (A1) |
| Duplication Count | 1 (D1, low) |
| Critical Issues Count | **0** |
| High Issues Count | **0** |

## Next Actions

- **Readiness: GO WITH CAVEATS** — safe to `/speckit-implement` after locking Contact storage + About/Discography secondary placement in the first implement session.
- No CRITICAL blockers. Optional: tighten T022 wording and data-model “one storage” before coding US2/US4.
- Suggested follow-ups only if desired: `/speckit-clarify` not required; small manual edits to data-model.md / T022 are enough.

## Remediation offer

Would you like concrete remediation edits for the top issues (U1, U2, A1)? (Not applied unless you approve.)
