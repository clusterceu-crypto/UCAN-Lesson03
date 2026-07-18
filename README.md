# UCAN Заняття 03 — Controlled Release v1.0

## 1. Package name and version

- Package: `UCAN_Заняття_03_Controlled_Release_Patch_v1.1`
- Version: `1.1`
- Status: Controlled Release v1.0; not Published.

## 2. Canonical source list

Learner-facing content source:

1. `UCAN_Заняття_03_Фінальна_Редакція_v2.0.docx`

Production sources:

2. `UCAN_Заняття_03_Дизайнерський_Пакет_v1.0.docx`
3. `UCAN_Заняття_03_AI_Visual_Generation_Pack_v1.0.docx`

Normative sources:

4. `UCAN_HTML_LMS_Standard_v1.1.docx`
5. `UCAN_Editorial_Style_Guide_v0.2.1.docx`
6. `UCAN_Lesson_Website_Publishing_Template_v1.0.docx`
7. `UCAN_Designer_Standard_v1.2.docx`
8. `UCAN_AI_Visual_Generator_Standard_v1.0.docx`
9. `06_Брендбук_UCAN_v1.1.docx`

## 3. File structure

```text
UCAN_Заняття_03_Controlled_Release_Patch_v1.1/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   ├── L03-A01_Від_кліматичної_дії_до_першого_цифрового_кроку_v1.0.png
│   ├── L03-A02_Технологія_чи_управлінське_рішення_v1.0.png
│   └── L03-A03_Twin_Transition_v1.0.png
└── README.md
```

## 4. How to run locally

Open `index.html` in a modern browser. No server, build step, external JavaScript library, CSS library, remote font, cookie, analytics service, or API is required.

## 5. Browser assumptions

The package targets current desktop and mobile versions of Chromium-based browsers, Firefox, and Safari. JavaScript and local storage should be enabled for progress restoration and form autosave. The lesson remains readable if local storage is unavailable, but persistence is then disabled.

## 6. localStorage keys

- `ucan_l03_rc_v1_current_page` — current page.
- `ucan_l03_rc_v1_progress` — visited pages.
- `ucan_l03_rc_v1_portfolio_form` — practical form data and data status.
- `ucan_l03_rc_v1_self_check` — six interactive self-check answers.
- `ucan_l03_rc_v1_test_answers` — current final-test answers.
- `ucan_l03_rc_v1_test_completed` — `true` only after all six test answers are correct.

No stored data is transmitted outside the browser.

## 7. Print / PDF instructions

1. Open the practical form page.
2. Complete or review the fields.
3. Select **Друк / PDF**.
4. In the browser print dialog choose A4 portrait and either a printer or **Save as PDF**.

The print stylesheet hides navigation and nonessential controls, preserves all learner-entered text, and avoids splitting individual form cards where possible.

## 8. Generated asset inventory

- `L03-A01_Від_кліматичної_дії_до_першого_цифрового_кроку_v1.0.png` — opening hero and repeated reference before the practical task.
- `L03-A02_Технологія_чи_управлінське_рішення_v1.0.png` — Smart City / decision-first comparison.
- `L03-A03_Twin_Transition_v1.0.png` — Twin Transition explanation.

Assets are displayed as ordinary `<img>` elements, are not cropped, are not stretched, and are not used as backgrounds.

## 9. HTML-first component inventory

- L03-A04 — semantic comparison table/cards: general impression versus management data.
- L03-A05 — semantic climate-action/data matrix.
- L03-A06 — semantic digital-solution/indicator examples.
- L03-A07 — responsive portfolio form with autosave and A4 print output.
- L03-A08 — keyboard-accessible six-question soft self-check.
- Final test — six questions from the canonical Final Lesson, unlimited attempts, no percentage score, and completion stored only after all answers are correct.

## 10. Known limitations

- Browser print rendering can differ slightly by browser and operating system.
- The supplied files with `.png` names are encoded as JPEG and have source dimensions 1229 × 1536 px. They are included without alteration because they are the approved supplied assets.
- No AI assistant block is included because it is not present in the canonical Final Lesson or Designer Package.
- No core evidence case is included because none is approved for this lesson.

## 11. Open verification flags

- Covenant of Mayors, TAPAS, data.gov.ua, and videos 3-1 / 3-2 / 3-3 require lesson-specific source verification before learner-facing publication. Therefore, the unverified resource block remains outside Patch v1.1 and is reserved for a later controlled patch.
- A core evidence case may be added only after approval in the Evidence Library / SVS.
- The final test uses the six questions preserved in Final Lesson v2.0, as required by the HTML Builder instruction.
- Visual scale and the supplied asset encoding/dimensions require confirmation in HTML Conformance / Visual QA.

## 12. QA handoff

The package is prepared for:

- HTML Conformance Gate;
- keyboard-only and screen-reader review;
- browser functional testing;
- print/PDF verification;
- visual scale verification at target breakpoints;
- confirmation of external resources before publication.

## 13. GitHub Pages

GitHub Pages may be used only as a QA Preview environment. Uploading this package there does not change its status to Controlled Release or Published.

## 14. Release boundary

This package is Controlled Release Patch v1.1. It changes only the learner-facing numbering, technical labels, and section navigation defined for Patch 1.1.
