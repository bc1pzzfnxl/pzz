# pzz

Agent guidance plus a UI toolbox, published for reuse across projects.

## What's here

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Global agent guidance (behaviour rules). |
| `skills/frontend-toolbox/` | Skill listing the preferred UI/frontend tools. |
| `templates/repo-AGENTS.md` | Starter `AGENTS.md` for a new repository. |
| `worker/` | Cloudflare Worker serving the toolbox as `llms.txt`. |

## Install the skill

```bash
bunx skills add bc1pzzfnxl/pzz
```

## Toolbox as llms.txt

The live toolbox is served at
<https://pzz.bc1pzzfnxl.com/llms.txt>.

## Develop & deploy

```bash
bun scripts/generate.mjs                              # regenerate worker/llms.txt + the skill from tools.json
bunx wrangler deploy --config worker/wrangler.jsonc   # deploy the Worker
```

`tools.json` is the only hand-maintained input. Everything else is generated,
extracting each tool's description from its `llms.txt` or page metadata.

Deploys are manual on purpose — no CI.
