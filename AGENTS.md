# AGENTS.md

Universal guidance loaded for every project. A repository's own `AGENTS.md` adds
to this file; OpenCode combines both rather than overriding.

## Responses

- Reply in the user's language; keep code, identifiers, and file paths in English.
- Write docs and comments in English.
- Lead with the answer; cut preamble and restatement.
- After a change, state plainly **what you added, changed, and removed**.
- When a command must be run, give it verbatim in a fenced code block.
- Format with Markdown: short headings, tables for comparisons, fenced code for commands.
- For large or irreversible changes, confirm the plan first; otherwise proceed and report the result.

## Documentation

- Update the docs in the same change whenever it alters them; a change is finished only once its docs match.

## Stack & tooling

- Reach for **bun** first: `bun install`, `bun run`, `bunx <pkg>`. Node and npm are not installed.
- Assume **TypeScript** with `strict`; type every public boundary.
- Build UI from **React components** (shadcn/ui).
- Run the repository's formatter and linter before finishing.
- Add a dependency only when the standard library or an existing dependency cannot do the job.

## Frontend toolbox

For any task involving Markdown/MDX, numbers and stats, authentication or login,
text animation, UI wording and components, logos or brand marks, shadcn audits,
local dev favicons, or README badges, read `toolbox.md`
(https://raw.githubusercontent.com/bc1pzzfnxl/pzz/main/toolbox.md) and load the
skill of the matching tool. Each tool has a skill named after it: `mdxcn`,
`numbers`, `voidauth`, `kugiri`, `component-gallery`, `svgl`, `shadscan`,
`env-style`, `shieldcn`.

If the project has an `astro.config.*`, also load `skill-seo-astro`.

## Verification

- Finish a task only after the project's checks pass: typecheck, lint, tests.
- State the exact commands you ran and their outcome.
- A change is done when its tests pass, not when the code is written.

## Git & commits

- Commit messages follow Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Keep each commit focused on one change.
- Keep secrets out of commits and history.
- Branch names: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.

## Architecture

- Keep shared project vocabulary in `GLOSSARY.md`; record hard-to-reverse decisions as ADRs.
- Design **deep modules**: a large surface of behaviour behind a small interface at a clean seam.
- Repository-specific commands, layout, and conventions live in the repository's `CONTRIBUTING.md`. If it exists, read it before changing code.
