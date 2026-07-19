# UCAN Lesson 03 — QA Summary 1.3.4

## Static QA

- 12 sequential learner-facing pages: PASS.
- Learning Transition Layer remains page 7: PASS.
- Test page remains resolved by `data-page-role="test"` on page 11: PASS.
- Concrete city disclosures: 3/3.
- Default-open state: Lviv open; Rotterdam and Amsterdam closed.
- Visible management-value takeaways: 3/3.
- Evidence/application field separation: 3/3.
- Case-to-community bridge block: 1/1.
- Deepening-resource disclosures: 4/4.
- CE course video disclosures: 2/2.
- Optional-video marker: 1/1.
- Volatile learner-facing 11-second refresh statement: removed.
- Duplicate HTML IDs: none.
- Missing `aria-labelledby` / `aria-describedby` targets: none.
- Form controls without labels: none.
- External links with `target="_blank"` include `noopener noreferrer`: PASS.
- Cache-busting values: `v=1.3.4` for CSS and both JavaScript files.
- JavaScript syntax: PASS.
- AI prompt JavaScript syntax: PASS.
- AI prompt source remains unchanged from Patch 1.3.3.
- Main JavaScript change is limited to learner guidance before the browser print-to-PDF dialog.
- PDF action label: «Завантажити PDF»; explicit «Зберегти як PDF» guidance: PASS.
- Final test: 6 applied questions, 18 labelled options, original answer-key mapping preserved.

## Headless browser functional smoke test

Test environment: Chromium, mobile viewport 390 × 844 px, in-memory page with controlled localStorage mock.

- Initial progress: 8%.
- Initial active page: 1.
- Navigation to page 7: PASS.
- City disclosure states `[open, closed, closed]`: PASS.
- Horizontal overflow at initial page: none.
- Horizontal overflow at transition page: none.
- Transition reflection persistence: PASS.
- Reflection transferred to AI prompt context: PASS.
- Navigation to Portfolio page 10: PASS.
- Test Gate disabled before successful test completion: PASS.
- Six correct answers unlock the Test Gate: PASS.
- Updated scenario-based questions remain compatible with stored radio values and answer key: PASS.
- Navigation to completion page 12: PASS.
- JavaScript page errors: none.

## Evidence boundary

Learner-facing case wording now distinguishes:

1. the fact confirmed by the official source;
2. the data made available by the city;
3. the possible management application;
4. the transferable step for a Ukrainian community.

The patch does not claim measured impact where the cited municipal source does not establish it.

## Remaining publication check

After deployment to GitHub Pages, manually open the three city sources, four C40 resources and two YouTube videos in a normal HTTPS browser session. Also verify the «Завантажити PDF» flow in Chrome/Edge and confirm that the generated PDF contains only the completed Portfolio page.

## Status

**Ready for Functional QA / publication preview.**
