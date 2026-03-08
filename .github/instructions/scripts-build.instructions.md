---
description: 'Rules for Node build scripts and repository automation.'
applyTo: 'eng/**/*.mjs,scripts/**/*.mjs,package.json'
---

When editing build or automation code:
- Preserve existing Node ES module conventions.
- Minimize behavioral drift in generated outputs.
- Prefer small, reversible changes and explicit error paths.
- If behavior changes, verify with the repository validation/build commands documented in AGENTS.md.
