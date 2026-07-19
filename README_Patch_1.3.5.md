# UCAN Lesson 03 — Patch 1.3.5

## Scope

Functional patch for the current Lesson 03 release candidate.

Implemented:

1. Advanced final test:
   - 10 questions;
   - 4 plausible answer options per question;
   - one correct answer;
   - stronger application and municipal decision scenarios;
   - unlimited attempts;
   - completion gate remains active until all answers are correct.

2. Direct PDF download:
   - the button now generates and downloads a PDF in the browser;
   - no print dialog is opened;
   - Ukrainian text is rendered into the PDF;
   - all Portfolio fields and data status are included;
   - empty fields are shown as an em dash;
   - the community name is added to the filename when available;
   - form data remains local and is not sent to a server.

## Files changed

- `index.html`
- `js/script.js`
- `css/style.css`

## Files unchanged

- `js/lesson03-ai-prompts.js`
- approved visual assets L03-A01–L03-A03
- Learning Transition Layer content
- practical assignment fields
- AI Assistant behavior
- navigation and page architecture

## QA completed

- JavaScript syntax check passed.
- HTML structure parsed successfully.
- 10 test questions detected.
- 4 options detected for each question.
- 10 answer keys detected.
- Duplicate HTML IDs: none.
- Asset paths verified.
- Direct PDF implementation does not call `window.print()`.

## Browser QA still required

Run the package in Chrome, Edge and Firefox and verify:

- PDF file downloads after one click;
- Ukrainian text is readable;
- long answers continue onto additional PDF pages;
- filename is correct with and without a community name;
- repeated clicks are blocked while PDF is being generated;
- final test gate opens only after all 10 answers are correct;
- state restoration works after reload.


## Controlled refinement
Після browser review тест скорочено до 5 питань. Кожне питання має 4 правдоподібні варіанти й вимагає вибору найкращого управлінського рішення, а не впізнавання очевидної правильної відповіді.
