import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// How an agent reads a tool's documentation:
// llms = the tool publishes an llms.txt index at `url`;
// meta = no index, `desc` is the summary and `url` the page to read;
// docs = neither, the page must be scraped with the chrome-devtools MCP.
export type Source = "llms" | "meta" | "docs";

export type Tool = {
  name: string;
  url: string;
  task: string;
  source: Source;
  desc: string | null;
  // Words a user says when the tool is needed; they make the skill trigger.
  keywords: string[];
};

export type PzzConfig = {
  docUrl: string;
  tools: Tool[];
};

export const repoRoot = resolve(import.meta.dir, "../..");

function fail(path: string, message: string): never {
  throw new Error(`pzz.json: ${path} ${message}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    fail(path, "must be an object");
  return value as Record<string, unknown>;
}

function text(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "")
    fail(path, "must be a non-empty string");
  return value;
}

function httpUrl(value: unknown, path: string): string {
  const url = text(value, path);
  try {
    new URL(url);
  } catch {
    fail(path, "must be a valid URL");
  }
  return url;
}

function source(value: unknown, path: string): Source {
  if (value === "llms" || value === "meta" || value === "docs") return value;
  return fail(path, 'must be "llms", "meta" or "docs"');
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTool(value: unknown, index: number): Tool {
  const path = `tools[${index}]`;
  const tool = record(value, path);
  const kind = source(tool.source, `${path}.source`);
  const desc =
    tool.desc === undefined || tool.desc === null
      ? null
      : text(tool.desc, `${path}.desc`);
  if (kind !== "docs" && desc === null)
    fail(`${path}.desc`, `is required when source is "${kind}"`);
  const keywords =
    tool.keywords === undefined
      ? []
      : textArray(tool.keywords, `${path}.keywords`);
  return {
    name: text(tool.name, `${path}.name`),
    url: httpUrl(tool.url, `${path}.url`),
    task: text(tool.task, `${path}.task`),
    source: kind,
    desc,
    keywords,
  };
}

function textArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) fail(path, "must be an array of strings");
  return value.map((item, i) => text(item, `${path}[${i}]`));
}

export function parseConfig(raw: unknown): PzzConfig {
  const root = record(raw, "root");
  const tools = root.tools;
  if (!Array.isArray(tools)) fail("tools", "must be an array");
  const parsed = tools.map(parseTool);

  const seen = new Set<string>();
  for (const tool of parsed) {
    const slug = slugify(tool.name);
    if (!slug) fail("tools", `"${tool.name}" has no usable skill name`);
    if (seen.has(slug))
      fail(
        "tools",
        `"${tool.name}" collides with another tool named "${slug}"`,
      );
    seen.add(slug);
  }

  return {
    docUrl: httpUrl(root.docUrl, "docUrl"),
    tools: parsed,
  };
}

export function loadConfig(path = join(repoRoot, "pzz.json")): PzzConfig {
  return parseConfig(JSON.parse(readFileSync(path, "utf8")));
}
