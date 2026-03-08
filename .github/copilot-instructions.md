# Repository-wide Copilot Instructions

This repository is both:
1. a customization library with top-level resource folders like agents/, instructions/, skills/, hooks/, workflows/, and plugins/; and
2. a real working repository whose runtime Copilot customizations live under .github/.

When working in this repository:
- Preserve and follow the root AGENTS.md for setup, validation, and contribution rules.
- Prefer small, composable customization artifacts over large monolithic instructions.
- Keep repo-wide guidance in this file, path-specific guidance in .github/instructions/*.instructions.md, and specialist behavior in .github/agents/*.agent.md.
- Do not create new hooks, workflows, plugins, or skills unless explicitly requested.
- Favor edits that improve cross-surface reuse across GitHub Copilot, Copilot CLI, Codex Web, Codex CLI, and IDE usage.
- Keep instructions concise, durable, and repository-specific.
- Avoid duplicating rules that already live in AGENTS.md; reference and complement them.
