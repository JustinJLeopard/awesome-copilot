---
description: 'Define build and validation expectations for repository automation scripts and generated outputs.'
applyTo: 'eng/**/*.mjs, scripts/**/*.mjs, package.json'
---

Prefer deterministic scripts and explicit task names in `package.json`.

Before finalizing changes that affect generation logic, run `npm run build` and validate related outputs.

Keep script behavior cross-platform where practical and avoid unnecessary external dependencies.
