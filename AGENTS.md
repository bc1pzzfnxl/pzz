# AGENTS.md

Guidance for working on the `pzz` repository itself. The global
`~/.config/opencode/AGENTS.md` still applies.

## Commands

- Install: `bun install`
- Lint: `bun run lint` (auto-fix: `bun run lint:fix`)
- Typecheck: `bun run typecheck`
- Unit tests (offline): `bun test`
- Smoke test (network, several minutes): `bun run smoke`. Scaffolds Astro and Next under `~/.cache/pzz-smoke`, then lints, typechecks and builds each one.
- Regenerate the toolbox (network): `bun run generate`. Uses `GITHUB_TOKEN`, or the `gh` login locally.
- Scaffold a project: `bun run create <name> --app astro|next [--ui <name>] [--dry-run]`
- Expose the global command after moving files: `bun link` (provides `create-pzz`)

## Layout

- `pzz.json`: tools and component sets. The only hand-maintained data.
- `scripts/create.ts`: `create-pzz` entry point.
- `scripts/generate.ts`: builds `toolbox.md` and `skills/frontend-toolbox/SKILL.md` from `pzz.json`.
- `scripts/lib/`: pure logic (config validation, description cleanup, rendering, scaffold helpers).
- `templates/repo-AGENTS.md`: copied into every scaffolded project.
- `biome.json`: lint and format config for this repo. Also copied into every scaffold.
- `tests/`: unit tests, a CLI dry-run test, and the smoke test (gated by `PZZ_SMOKE=1`).
- `.github/workflows/ci.yml`: lint, typecheck and tests on every push; smoke test after them.

## Conventions

- Runtime is **bun only**. No Node, no npm. Every script starts with `#!/usr/bin/env bun`.
- TypeScript `strict` with `noUncheckedIndexedAccess`. JSON input is validated in `scripts/lib/config.ts`; keep that boundary typed.
- Scaffold tools are pinned in `TOOL_VERSIONS` (`scripts/lib/project.ts`). Never use `@latest`. Bump a pin deliberately, then run `bun run smoke`.
- The SEO scaffold is **Astro only**. Do not add it to the Next path.
- After editing `pzz.json`, run `bun run generate` and commit the regenerated files. Never hand-edit `toolbox.md` or `SKILL.md`.
- Biome excludes `.agents`, `public` and `src/components/ui` in scaffolds. Keep `biome.json` as the single source for both.
- Use scratch directories under `~` or `~/.cache`, not `/tmp`, which is a small tmpfs.
- Verify a change by running `bun run lint`, `bun run typecheck` and `bun test`. Run `bun run smoke` when the scaffold output changes.
