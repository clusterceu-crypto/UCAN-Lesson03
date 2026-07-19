# Release Notes — Lesson 03 Patch 1.3.5

## Release type

Controlled functional patch.

## Changes

### Advanced Final Test

The six-question test was replaced with a ten-question assessment aligned with the UCAN Lesson Creator Standard test pattern. Questions now test understanding, application and municipal governance decisions. Each question has four plausible options and exactly one correct answer.

### Direct PDF Download

The previous print-dialog workflow was removed from the learner-facing button. The Portfolio form is now rendered locally into an A4 PDF and downloaded automatically. No external PDF library or server is required.

## Compatibility

- Existing localStorage keys were preserved.
- Existing saved form data remains compatible.
- Test answer storage uses the same key, but previous six-question attempts are treated as incomplete until all ten questions are answered correctly.
- Page count and navigation remain unchanged.

## Status

- Patch implementation: complete.
- Static QA: passed.
- Functional browser QA: required before release freeze.
