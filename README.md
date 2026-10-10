# pzz

A toolbox for agents: the UI tools that go around my stack, each one paired with
a skill that tells an agent when to use it and where to read about it. Markdown
and skills only, framework agnostic. Runs on **bun**.

## Contents

| Path | Purpose |
| --- | --- |
| `pzz.json` | The tools. The only hand-maintained data. |
| `toolbox.md` | Generated index of every tool. |
| `skills/<tool>/SKILL.md` | Generated. One skill per tool. |
| `scripts/generate.ts` | Renders `toolbox.md` and the skills from `pzz.json`. |
| `scripts/lib/` | Config validation and rendering. |
| `tests/` | Unit tests. |
| `AGENTS.md` | Guidance for working on this repo, including how to add a tool. |

## Install

Install the skills for every harness that reads `.agents/skills`:

```bash
bunx skills add bc1pzzfnxl/pzz -g -s '*' -a universal -y
bunx skills@1.7.2 add https://github.com/bc1pzzfnxl/skill-seo-astro/tree/5ddcb2553de59c8dba6c24ba0eb2eefb068c22e6 -g -a universal -y
```

The second line installs the Astro SEO skill, pinned to a commit. Then add the
toolbox block from [Global AGENTS.md](#global-agentsmd) to your
`~/.config/opencode/AGENTS.md`.

## Global AGENTS.md

Paste this in your global `AGENTS.md`. It applies to every project:

```markdown
## Frontend toolbox

For any task involving Markdown/MDX, numbers and stats, authentication or login,
text animation, UI wording and components, logos or brand marks, shadcn audits,
local dev favicons, or README badges, read `toolbox.md`
(https://raw.githubusercontent.com/bc1pzzfnxl/pzz/main/toolbox.md) and load the
skill of the matching tool. Each tool has a skill named after it: `mdxcn`,
`numbers`, `voidauth`, `kugiri`, `component-gallery`, `svgl`, `shadscan`,
`env-style`, `shieldcn`.

If the project has an `astro.config.*`, also load `skill-seo-astro`.
```

## How a tool is read

Each tool has a `source` that says how an agent reads its docs:

| Source | Meaning | Skill tells the agent to |
| --- | --- | --- |
| `llms` | The tool publishes an `llms.txt` index. | Read the `llms.txt` and follow its links. |
| `meta` | No index. The page's meta description is the summary. | Use the summary, then open the page. |
| `docs` | No index and no usable summary. | Scrape the page with the `chrome-devtools` MCP. |

## Adding a tool

Adding a tool is maintenance, and an agent does it. Ask an agent to add the
tool; it follows the checklist in [AGENTS.md](AGENTS.md) to choose the source,
then:

```bash
bun run generate
bun run lint && bun run typecheck && bun test
```

Commit `pzz.json`, `toolbox.md` and `skills/` together.

## Development

```bash
bun install
bun run generate    # render toolbox.md and the skills (no network)
bun run lint        # Biome
bun run typecheck   # tsc --noEmit
bun test            # unit tests
```
