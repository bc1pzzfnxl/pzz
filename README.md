# pzz

Agent guidance, a UI toolbox, and a project scaffolder.

## Contents

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Global agent guidance (behaviour rules). |
| `tools.json` | The hand-maintained tool list (`name`, `url`, `use`). |
| `toolbox.md` | Generated toolbox doc (descriptions extracted from each source). |
| `components.json` | Your component-library stock (used by `create --ui`). |
| `scripts/create.mjs` | Project scaffolder (`create-pzz`). |
| `scripts/generate.mjs` | Regenerates `toolbox.md` + the skill. |
| `skills/frontend-toolbox/` | Skill listing the preferred UI/frontend tools. |
| `templates/repo-AGENTS.md` | Starter `AGENTS.md` for a new repository. |

## Create a project

```bash
create-pzz <name> --app astro|next [--ui <library>] [--dry-run]
```

`create-pzz` is this repo linked globally (`bun link`). Without the link, run
`bun run create <name> …` from the repo, or `bunx github:bc1pzzfnxl/pzz …`.

It scaffolds **bun + Astro** (single-page) or **bun + Next** (multi-page) with
**React/shadcn**, **Biome** as the quality gate, and a repository `AGENTS.md`:

1. framework — `create-next-app` or `create-astro` (React/Tailwind)
2. `shadcn init` (plus `--ui` from `components.json`)
3. **Astro only** — [`skill-seo-astro`](https://github.com/bc1pzzfnxl/skill-seo-astro):
   SEO pages (`index`, `[slug]`, RSS, `404`, `robots.txt`, `llms.txt`,
   optimized-images rehype plugin), its dependencies, a merged `astro.config.mjs`
   (React + Tailwind preserved), and the same skill installed for the agent into
   `.agents/skills/` (shared by OpenCode, Codex, Cursor, Gemini CLI, Copilot…)
4. Biome — `biome.json` plus `lint` / `format` / `typecheck` scripts
5. repository `AGENTS.md` (merged with the framework's when it provides one)
6. `git init -b main` and a first commit

| Flag | Meaning |
| --- | --- |
| `--app astro` | single-page site (Astro) |
| `--app next` | multi-page app (Next.js) |
| `--ui <lib>` | component library from `components.json` |
| `--dry-run` | print the commands without running them |

> Scaffold on a large filesystem, not `/tmp` — a `node_modules` tree can exhaust
> a small tmpfs.

## Toolbox

`tools.json` is the only hand-maintained input. To add or change a tool:

```bash
$EDITOR tools.json
bun scripts/generate.mjs
git add -A && git commit -m "chore: toolbox" && git push
bunx skills update frontend-toolbox
```

`bun scripts/generate.mjs` extracts each tool's description from its `llms.txt`
or page metadata (falling back to the GitHub repo description) and regenerates
`toolbox.md` and `skills/frontend-toolbox/SKILL.md`.

Live toolbox: <https://raw.githubusercontent.com/bc1pzzfnxl/pzz/main/toolbox.md>

## Component libraries

`components.json` maps a `--ui <name>` to how it is applied:

| `type` | Effect |
| --- | --- |
| `shadcn` | `bunx shadcn@latest add <items>` |
| `npm` | `bun add <packages>` |
| `manual` | prints the instructions |

## Skills

```bash
bunx skills add bc1pzzfnxl/pzz                 # frontend-toolbox
bunx skills add bc1pzzfnxl/skill-seo-astro     # Astro SEO
```

## Local setup

```bash
bun link                                        # expose the `create-pzz` command
bunx skills add bc1pzzfnxl/pzz -g -a opencode   # install the toolbox skill globally
```
