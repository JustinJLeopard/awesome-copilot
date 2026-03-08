---
description: 'Define how repository-level generated artifacts should be maintained and updated.'
applyTo: 'README.md, .github/plugin/marketplace.json'
---

When changes add or modify resources, regenerate repository artifacts with `npm run build`.

Prefer generated outputs over hand edits for files that are build-managed.

If generated artifacts change unexpectedly, inspect source metadata before manually adjusting output files.
