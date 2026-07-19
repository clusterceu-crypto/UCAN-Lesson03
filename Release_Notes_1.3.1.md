# UCAN Lesson 03 — Release Notes 1.3.1

## Release type

Controlled Release Patch — Learning Transition Layer pilot.

## Added

- New learner-facing page: **🌍 Перед тим як перейти до практики**.
- Three concise Ukrainian-community application cards.
- Two international practice cards without internal source labels.
- Four official deepening-resource cards from Patch 1.3.
- Two learner-facing video cards from Patch 1.3.
- Optional locally saved reflection field.
- AI Assistant context enrichment from the reflection field.

## Changed

- Lesson architecture increased from 11 to 12 pages.
- Progress percentage and total page count now derive from 12 DOM pages.
- Pages after theory shifted by one position.
- Test Gate now resolves the test page through `data-page-role="test"` instead of a hard-coded page number.
- Opening lesson map includes the transition layer.
- Resource and video blocks were moved from theory/practice pages to the transition page.
- JavaScript cache-busting updated to `v=1.3.1`.

## Preserved

- Existing localStorage keys and stored Portfolio data.
- Portfolio fields and print behaviour.
- AI prompt source file and prompt texts.
- Test questions, answers and completion gate.
- Visual assets and theory content.

## QA result

- 12 sequential learner-facing pages: PASS.
- Learning Transition Layer between theory and self-check: PASS.
- Duplicate HTML IDs: none.
- JavaScript syntax: PASS.
- AI prompt JavaScript syntax: PASS.
- Resources moved: 4/4.
- Videos moved: 2/2.
- External links include safe new-tab attributes: PASS.
- Keyboard navigation logic preserved.
- Print rules for Portfolio preserved; transition styles are print-safe.
- Local reflection persistence and AI context integration: implemented.

## Handoff status

🟢 Learning Transition Layer Implemented

🟢 Lesson 03 Updated to 12-page Architecture

🟢 Ready for Functional QA
