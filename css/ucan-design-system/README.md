# UCAN Shared CSS Library v1.0

Production CSS realization of **UCAN Design System Standard v1.0**.

## Scope

This package contains design tokens, layout rules, canonical component presentation, utilities and accessibility protection. It contains no lesson content, HTML, JavaScript, runtime state, storage logic, PDF logic or lesson adapter.

## Canonical entry point

Import `ucan.css`. The entry point preserves the controlled layer order:

1. tokens;
2. layout;
3. components;
4. utilities;
5. accessibility protection;
6. lesson overrides supplied outside this package.

Direct module imports are permitted only for controlled build tooling that preserves the same order.

## Naming

- custom properties: `--ucan-<domain>-<role>-<scale>`;
- components: `.ucan-<component>`;
- elements: `.ucan-<component>__<element>`;
- variants: `.ucan-<component>--<variant>`;
- states: `.is-<state>` or `[data-state="<state>"]`;
- utilities: `.ucan-<utility>`.

Lesson numbers, raw color names and implementation-specific runtime keys are prohibited in the shared API.

## Dependencies

CSS modules do not import each other. `tokens/tokens.css` aggregates token files; `ucan.css` is the only full-library entry point. This prevents cyclic imports and makes dependency order auditable.

## Runtime boundary

The library styles declared states. UCAN Shared UI Runtime owns navigation, state, storage, dialogs, clipboard, PDF, completion, recovery and shared behavior. Lesson configuration owns content, page inventory, form schema, routes, assessment semantics and approved assets.

## Status

- Version: 1.0.0
- Package status: Sprint 003 production candidate; structurally ready for Lesson 03 pilot integration.
- Next gate: Sprint 004 — Lesson 03 Pilot Migration.
