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
<https://frontend-toolbox.bc1pzzfnxl.workers.dev/llms.txt>.
