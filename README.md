# UCAN Lesson 03 — Integration Patch 1.3

Це контрольований overlay-патч для поточної опублікованої версії Lesson 03.

## Production Policy

- **Production Source of Truth:** `develop`
- **Official Release Branch:** `main`
- Усі Production-зміни, виправлення та Hotfix виконуються лише в `develop`.
- Merge до `main` дозволений лише після проходження Release QA та підтвердження Release Package.
- Governance standard: [UCAN Version Control & Repository Governance Standard v1.0](https://docs.google.com/document/d/1nfAxkvelQCMGhL5x3B_zrZ4fZpbyn5DJ/edit)

## Замінити файли

- `index.html`
- `css/style.css`
- `js/script.js`
- `js/lesson03-ai-prompts.js`

Папку `assets/` та інші файли чинного релізу не видаляти.

## Додано

- дві відеолекції, офіційно зіставлені з Розділом 3 у документі інтеграції курсу «Циркулярна економіка»;
- чотири практичні інструменти з `CNSC Toolkit-Collection.xlsx`;
- рекомендації щодо вибору одного релевантного інструмента;
- обмеження AI Assistant: рекомендувати лише офіційні ресурси заняття;
- cache-busting версію `v=1.3` для JavaScript.

## Не змінено

- структуру 11 сторінок;
- практичну форму та localStorage;
- логіку самоперевірки;
- підсумковий тест;
- навігацію та посилання на Lesson 04;
- графічні активи.
