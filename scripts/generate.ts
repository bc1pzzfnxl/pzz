#!/usr/bin/env bun
// Generates toolbox.md and skills/frontend-toolbox/SKILL.md from pzz.json.
//
// pzz.json is the only hand-maintained input. Descriptions are fetched from each
// tool: its llms.txt when present, otherwise the page's meta description, otherwise
// the GitHub repository description. Nothing is written by hand.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadConfig, repoRoot, type Tool } from "./lib/config.ts";
import { summarize } from "./lib/describe.ts";
import { type ResolvedTool, renderSkill, renderToolbox } from "./lib/render.ts";

const UA = {
  "user-agent": "Mozilla/5.0 (compatible; frontend-toolbox-builder/1.0)",
};

// Prefer an explicit token (CI). Locally, fall back to the authenticated GitHub CLI
// so no secret has to be stored or pasted anywhere.
function githubToken(): string | null {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (fromEnv) return fromEnv.trim();
  try {
    const out = Bun.spawnSync(["gh", "auth", "token"], {
      stdout: "pipe",
      stderr: "ignore",
    });
    const token = new TextDecoder().decode(out.stdout).trim();
    return out.exitCode === 0 && token ? token : null;
  } catch {
    return null;
  }
}

const GITHUB_TOKEN = githubToken();

async function fetchText(
  url: string,
  headers: Record<string, string> = UA,
): Promise<string | null> {
  try {
    const res = await fetch(url, { redirect: "follow", headers });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

const META_PATTERNS = [
  /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i,
  /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
  /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)/i,
];

function metaDescription(html: string): string | null {
  for (const re of META_PATTERNS) {
    const match = html.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function githubDescription(repo: string): Promise<string | null> {
  const headers: Record<string, string> = {
    ...UA,
    accept: "application/vnd.github+json",
  };
  if (GITHUB_TOKEN) headers.authorization = `Bearer ${GITHUB_TOKEN}`;
  const body = await fetchText(`https://api.github.com/repos/${repo}`, headers);
  if (!body) return null;
  const data = JSON.parse(body) as { description?: unknown };
  return typeof data.description === "string" && data.description
    ? data.description
    : null;
}

async function resolveTool(tool: Tool): Promise<ResolvedTool> {
  const origin = new URL(tool.url).origin;
  const html = await fetchText(tool.url);
  if (html === null) console.warn(`! could not fetch ${tool.url}`);

  const raw =
    (html && metaDescription(html)) ||
    (tool.repo ? await githubDescription(tool.repo) : null);
  const llmsUrl =
    (await fetchText(`${origin}/llms.txt`)) !== null
      ? `${origin}/llms.txt`
      : null;

  return {
    ...tool,
    desc: raw ? summarize(raw) || null : null,
    bestUrl: llmsUrl ?? tool.url,
  };
}

const config = loadConfig();
const tools = await Promise.all(config.tools.map(resolveTool));

const toolboxPath = join(repoRoot, "toolbox.md");
const skillPath = join(repoRoot, "skills/frontend-toolbox/SKILL.md");
mkdirSync(dirname(skillPath), { recursive: true });
writeFileSync(toolboxPath, renderToolbox(tools));
writeFileSync(skillPath, renderSkill(tools, config.docUrl));

console.log(`generated ${tools.length} tools:`);
for (const t of tools) {
  const source = t.bestUrl.endsWith("/llms.txt") ? "llms.txt" : "meta    ";
  console.log(
    `  ${t.name.padEnd(18)} ${source}${t.desc ? "" : "  (no description)"}`,
  );
}
