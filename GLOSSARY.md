# Glossary

- **Tool**: an entry in `pzz.json` (`tools`). A website whose canonical page the agent should use for one task.
- **Task**: the situation a tool solves, such as "Adding authentication". It is the first column of the toolbox.
- **Canonical page**: the URL the toolbox points to. It is the tool's `llms.txt` when one exists, otherwise its homepage or docs page.
- **Toolbox**: the generated `toolbox.md` and skill that list every tool by task.
- **Component set**: a named entry in `pzz.json` (`ui`) that `create-pzz --ui <name>` applies. Types: `shadcn` (adds components), `npm` (installs packages), `manual` (prints a note).
- **Scaffold**: the project `create-pzz` produces: framework, shadcn, Biome, repo `AGENTS.md`, and a first commit.
- **SEO scaffold**: the Astro-only pages, config and agent skill from `skill-seo-astro`.
- **Harness**: an agent tool (OpenCode, Codex, Cursor, and so on) that reads skills.
- **Shared skills directory**: `.agents/skills/`, read by many harnesses at project level.
- **Pin**: a fixed version or commit that a scaffold tool is run with, so that a scaffold is reproducible.
- **Smoke test**: the end-to-end check that scaffolds each framework, then lints, typechecks and builds it.
