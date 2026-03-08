---
description: 'Rules for plugin metadata and plugin-facing documentation.'
applyTo: 'plugins/**/.github/plugin/plugin.json,plugins/**/README.md'
---

When editing plugin manifests or plugin docs:
- Preserve schema correctness and relative path integrity.
- Keep descriptions install-oriented and user-facing.
- Do not reference files that do not exist.
- Validate plugin changes with the repository plugin validation command before finalizing.
