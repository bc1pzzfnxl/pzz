# AGENTS.md

Guidance for working on the `pzz` repository. The global
`~/.config/opencode/AGENTS.md` still applies.

## Commands

- Install: `bun install`
- Regenerate `toolbox.md` and the skills: `bun run generate` (no network)
- Lint: `bun run lint` (auto-fix: `bun run lint:fix`)
- Typecheck: `bun run typecheck`
- Tests: `bun test`

## Layout

- `pzz.json`: the tools. The only hand-maintained data.
- `scripts/generate.ts`: renders `toolbox.md` and `skills/<tool>/SKILL.md` from `pzz.json`.
- `scripts/lib/config.ts`: loads and validates `pzz.json`, and defines `slugify`.
- `scripts/lib/render.ts`: pure rendering of the toolbox and of each skill.
- `skills/<tool>/SKILL.md`: generated. One skill per tool.
- `tests/`: unit tests for config validation and rendering.

## Add or change a tool

Adding a tool is the maintenance task, and it is done by an agent. For each tool:

1. Check whether `<origin>/llms.txt` exists.
   - Yes: `source` is `llms`, `url` is that `llms.txt`, and `desc` is a one-sentence summary of what the tool does, taken from the page's meta description.
2. Otherwise, if the page has a meta description: `source` is `meta`, `url` is the page to read, and `desc` is that meta description, trimmed to one sentence.
3. Otherwise: `source` is `docs`, `url` is the docs page, and `desc` is `null`. The skill will tell agents to scrape the page with the `chrome-devtools` MCP.

Never write a `desc` from memory. Copy it from the page, or use `docs`.

Then:

```bash
bun run generate
bun run lint && bun run typecheck && bun test
```

Commit `pzz.json`, `toolbox.md` and `skills/` together.

## Conventions

- Runtime is **bun only**. No Node, no npm. Every script starts with `#!/usr/bin/env bun`.
- TypeScript `strict` with `noUncheckedIndexedAccess`. `pzz.json` is validated in `scripts/lib/config.ts`; keep that boundary typed.
- `generate` makes no network calls. Keep it that way: source checks happen when a tool is added.
- Generated files carry a "do not edit by hand" marker. Change `pzz.json` or the renderer, then regenerate.
- Skill names come from `slugify(name)`. Keep them unique; `parseConfig` rejects collisions.
- Scratch directories go under `~`, not `/tmp`, which is a small tmpfs.
