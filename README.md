# pzz

Agent guidance, a UI toolbox, and a project scaffolder. Runs on **bun only**.

## Contents

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Guidance for working on this repo. |
| `pzz.json` | Tools and component sets. The only hand-maintained data. |
| `toolbox.md` | Generated toolbox (canonical pages and descriptions). |
| `skills/frontend-toolbox/` | Generated skill that lists the same tools. |
| `biome.json` | Lint and format config, shared with every scaffold. |
| `templates/repo-AGENTS.md` | `AGENTS.md` written into each new project. |
| `scripts/create.ts` | Scaffolder, exposed as `create-pzz`. |
| `scripts/generate.ts` | Regenerates `toolbox.md` and the skill from `pzz.json`. |
| `scripts/lib/` | Config validation, description cleanup, rendering, scaffold helpers. |
| `tests/` | Unit tests, a dry-run CLI test, and the smoke test. |
| `.github/workflows/ci.yml` | CI: lint, typecheck, tests, then smoke. |

## Setup

```bash
bun install
bun link        # exposes the create-pzz command
```

## Create a project

```bash
create-pzz <name> [--app astro|next] [--ui <name>] [--dry-run]
```

| Flag | Meaning |
| --- | --- |
| `--app astro` | Single-page site: Astro, React, Tailwind, shadcn, SEO scaffold. |
| `--app next` | Multi-page app: Next.js, React, Tailwind, shadcn. |
| `--ui <name>` | Component set from `pzz.json` (`ui`). Unknown names fail before anything is created. |
| `--dry-run` | Print the steps without running them. |

Without `--app`, the command asks in a terminal and defaults to `next`.

Steps, in order:

1. Framework: `create-next-app` or `create-astro` with React and Tailwind.
2. `shadcn init`, then the `--ui` component set if one is given.
3. **Astro only**: the [`skill-seo-astro`](https://github.com/bc1pzzfnxl/skill-seo-astro) SEO pages, its dependencies, a merged `astro.config.mjs` (React and Tailwind kept), and the same skill installed into `.agents/skills/` for every harness. Next gets no SEO scaffold.
4. Biome: `biome.json` copied from this repo, `lint`, `lint:fix`, `format` and `typecheck` scripts, and one normalizing pass so `lint` passes from the first commit.
5. Repo `AGENTS.md` from the template. An existing file is kept if it already has project sections, and the template sections are appended otherwise.
6. `git init -b main` and a first commit.

Tool versions are pinned in `scripts/lib/project.ts` (`TOOL_VERSIONS`). The Astro SEO scaffold is pinned to a commit of `skill-seo-astro`.

> Scaffold on a large filesystem. `/tmp` is a small tmpfs and fills up with `node_modules`.

## Toolbox

`pzz.json` is the only input. Each entry has a `name`, a `url`, and a `task`. Descriptions are fetched, not written by hand: the tool's `llms.txt` when it exists, otherwise the page's meta description, otherwise the GitHub repository description.

To add or change a tool:

```bash
$EDITOR pzz.json
bun run generate
git add -A && git commit -m "chore: update toolbox" && git push
bunx skills update frontend-toolbox
```

Live toolbox: <https://raw.githubusercontent.com/bc1pzzfnxl/pzz/main/toolbox.md>

## Component sets

Each entry in `pzz.json` under `ui` is selected with `--ui <name>`:

| `type` | Effect |
| --- | --- |
| `shadcn` | `bunx shadcn add <items>` |
| `npm` | `bun add <packages>` |
| `manual` | Prints a note with where to copy the components from. |

## Tests and CI

```bash
bun run lint        # Biome
bun run typecheck   # tsc --noEmit
bun test            # unit tests and CLI dry-run, offline
bun run smoke       # real scaffold of Astro and Next, then lint, typecheck and build
```

CI runs lint, typecheck and tests on every push. The smoke test runs after them.

## Skills

```bash
bunx skills add bc1pzzfnxl/pzz                 # frontend-toolbox
bunx skills add bc1pzzfnxl/skill-seo-astro     # Astro SEO
```

## Changing the scaffold

- Bump a pinned tool in `TOOL_VERSIONS`, then run `bun run smoke`.
- Change the shared lint rules in `biome.json`. It is also the file copied into every new project.
- The SEO scaffold is for Astro only.
