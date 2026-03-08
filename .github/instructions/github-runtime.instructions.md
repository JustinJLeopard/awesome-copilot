---
description: 'Rules for runtime GitHub Copilot customization files used by this repository.'
applyTo: '.github/copilot-instructions.md,.github/instructions/**/*.instructions.md,.github/agents/**/*.agent.md'
---

These files are the runtime customization layer for GitHub Copilot in this repository.
- Keep repo-wide instructions general and always-on.
- Keep path-specific instructions narrowly scoped to matching files.
- Keep custom agents specialized and non-overlapping.
- Prefer composition across files instead of putting all behavior into one file.
- Make the separation of concerns obvious: repo constitution, scoped rules, specialist agents.
