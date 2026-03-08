---
description: 'Apply manifest hygiene rules to plugin metadata and generated marketplace entries.'
applyTo: 'plugins/**/.github/plugin/plugin.json, plugins/external.json, .github/plugin/marketplace.json'
---

Keep plugin metadata declarative, valid JSON, and aligned with folder naming conventions.

When manifest source files change, regenerate marketplace output instead of hand-editing generated entries.

Ensure referenced resources exist and use stable relative paths.
