# Glossary

- **Tool**: an entry in `pzz.json`. A website or product whose documentation an agent should read for one task.
- **Task**: the situation a tool solves, such as "Adding authentication". It is the trigger the tool's skill responds to.
- **Canonical page**: the URL an agent opens for a tool. It is the tool's `llms.txt` when `source` is `llms`, otherwise the page to read.
- **Source**: how an agent reads a tool's documentation. `llms` means the tool publishes an `llms.txt` index. `meta` means there is no index, and the page's meta description is the summary. `docs` means neither, so the page must be scraped with the `chrome-devtools` MCP.
- **Description** (`desc`): the one-sentence summary of a tool. It is copied from the tool's page, never written from memory. `null` is allowed only for the `docs` source.
- **Toolbox**: the generated `toolbox.md`, which lists every tool by task, with its canonical page and source.
- **Skill**: the generated `SKILL.md` for one tool. Its description makes agents load it when the task comes up.
- **Pair**: a tool and its skill, which go together. A tool without a skill is not usable by an agent.
- **Harness**: an agent tool, such as OpenCode, Codex or Cursor, that loads skills.
- **Shared skills directory**: `.agents/skills/`, read by many harnesses at project level.
