# UCAN Lesson 03 — Release Notes 1.3.4

## Release type

Controlled Evidence Wording and Case UX Patch.

## Changed

- City section renamed to **«Як міста використовують дані для управлінських рішень»**.
- Each city disclosure now separates:
  - official-source fact;
  - available data;
  - possible management application;
  - transferable step for a Ukrainian community.
- Removed the volatile learner-facing statement about an approximately 11-second data refresh interval.
- Lviv disclosure is open by default; Rotterdam and Amsterdam remain collapsed.
- Added a concise management-value line to every city summary.
- Added a bridge question connecting city cases with the learner’s own management decision.
- Lecture 1-5 is explicitly marked as optional / additional.
- CSS and JavaScript cache-busting updated to `v=1.3.4`.
- Portfolio action renamed from **«Друк / PDF»** to **«Завантажити PDF»** with explicit browser guidance to choose **«Зберегти як PDF»**.
- Final test rewritten into more applied management scenarios with stronger distractors while preserving six questions, the answer key and Test Gate logic.

## Added production rule

Across the current 26-lesson UCAN course, future lessons should select the best verified city cases for their own topic. Reuse of Lviv, Rotterdam or Amsterdam is not required and should not be automatic. Case diversity across cities, countries, scales and solution types is encouraged.

## Preserved

- Three concrete city cases and their official links.
- Four C40 deepening resources.
- Two CE course videos.
- 12-page architecture and page order.
- Learning Transition Layer position between theory and self-check.
- Optional local reflection and AI context enrichment.
- Existing localStorage keys and stored Portfolio data.
- AI prompt source file and prompt texts.
- Six-question structure, answer key and completion gate.
- Browser print-to-PDF behaviour and approved visual assets.

## QA result

- 12 sequential learner-facing pages: PASS.
- Three concrete city disclosures: 3/3.
- Default-open city disclosures: Lviv only.
- Four deepening-resource disclosures: 4/4.
- CE course videos: 2/2.
- Evidence/application field separation: PASS.
- Volatile 11-second statement removed: PASS.
- Duplicate HTML IDs: none.
- ARIA references: valid.
- JavaScript syntax: PASS.
- AI prompt JavaScript syntax and byte identity: PASS.
- PDF button label and guidance: PASS.
- Applied test scenarios: 6/6; answer-key compatibility: PASS.
- External links include safe new-tab attributes: PASS.

## Handoff status

🟢 Evidence Boundary Strengthened

🟢 Case UX Refined

🟢 Ready for Functional QA
