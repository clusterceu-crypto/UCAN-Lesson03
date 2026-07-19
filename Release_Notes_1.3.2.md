# UCAN Lesson 03 — Release Notes 1.3.2

## Release type

Controlled Evidence Boundary and UX Patch — Learning Transition Layer.

## Removed

- Generic Ukrainian-community cards that did not identify a verified place and official source.
- Generic international-practice cards that were not concrete city cases.

## Changed

- The transition page now moves directly from its introduction to **«Де взяти перевірені поради»**.
- Four official resource cards are presented as compact native disclosure blocks.
- Two learner-facing video cards are presented as compact native disclosure blocks.
- The lesson map no longer promises community examples on this page.
- Initial 12-page progress fallback changed from 9% to 8%.
- Page 1 heading can receive programmatic focus.
- Reflection save status now reports localStorage failure honestly.
- Reset confirmation now states that both Portfolio data and the transition note remain saved.
- CSS and main JavaScript cache-busting updated to `v=1.3.2`.

## Preserved

- 12-page architecture and page order.
- Learning Transition Layer position between theory and self-check.
- Existing localStorage keys and stored Portfolio data.
- Portfolio fields, AI context enrichment and print behaviour.
- AI prompt source file and prompt texts.
- Test questions, answers and completion gate.
- Visual assets and theory content.
- Four official resources and two approved learner-facing videos.

## Evidence decision

Concrete Ukrainian or international city examples are not shown until the evidence package provides an official source that confirms the place, action and result. The page therefore offers verified guidance resources rather than illustrative pseudo-cases.

## QA result

- 12 sequential learner-facing pages: PASS.
- Learning Transition Layer between theory and self-check: PASS.
- Generic unsupported case cards removed: PASS.
- Native disclosure structure keyboard-accessible: PASS.
- Duplicate HTML IDs: none.
- JavaScript syntax: PASS.
- AI prompt JavaScript syntax and byte identity: PASS.
- Resources retained: 4/4.
- Videos retained: 2/2.
- External links include safe new-tab attributes: PASS.

## Handoff status

🟢 Evidence Boundary Corrected

🟢 Compact Transition Page Implemented

🟢 Ready for Functional QA
