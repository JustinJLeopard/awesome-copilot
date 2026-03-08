---
description: 'Document runtime customization boundaries for files under .github used by Copilot and automation.'
applyTo: '.github/**'
---

Treat `.github/` as runtime customization surface for this repository.

Place reusable guidance in `.github/instructions/`, specialist role behavior in `.github/agents/`, and broad policy in `.github/copilot-instructions.md`.

Avoid introducing unrelated policy text into workflow or template files.
