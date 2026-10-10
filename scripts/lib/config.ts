import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export type Tool = {
  name: string;
  url: string;
  task: string;
  repo?: string;
};

export type UiEntry =
  | { type: "shadcn"; items: string[] }
  | { type: "npm"; packages: string[] }
  | { type: "manual"; note: string };

export type PzzConfig = {
  docUrl: string;
  tools: Tool[];
  ui: Record<string, UiEntry>;
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

function textArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) fail(path, "must be an array");
  return value.map((item, i) => text(item, `${path}[${i}]`));
}

function parseTool(value: unknown, index: number): Tool {
  const path = `tools[${index}]`;
  const tool = record(value, path);
  return {
    name: text(tool.name, `${path}.name`),
    url: httpUrl(tool.url, `${path}.url`),
    task: text(tool.task, `${path}.task`),
    repo: tool.repo === undefined ? undefined : text(tool.repo, `${path}.repo`),
  };
}

function parseUi(value: unknown, path: string): UiEntry {
  const entry = record(value, path);
  switch (entry.type) {
    case "shadcn":
      return { type: "shadcn", items: textArray(entry.items, `${path}.items`) };
    case "npm":
      return {
        type: "npm",
        packages: textArray(entry.packages, `${path}.packages`),
      };
    case "manual":
      return { type: "manual", note: text(entry.note, `${path}.note`) };
    default:
      return fail(`${path}.type`, 'must be "shadcn", "npm" or "manual"');
  }
}

export function parseConfig(raw: unknown): PzzConfig {
  const root = record(raw, "root");
  const tools = root.tools;
  if (!Array.isArray(tools)) fail("tools", "must be an array");
  const ui = record(root.ui, "ui");
  return {
    docUrl: httpUrl(root.docUrl, "docUrl"),
    tools: tools.map(parseTool),
    ui: Object.fromEntries(
      Object.entries(ui).map(([key, entry]) => [
        key,
        parseUi(entry, `ui.${key}`),
      ]),
    ),
  };
}

export function loadConfig(path = join(repoRoot, "pzz.json")): PzzConfig {
  return parseConfig(JSON.parse(readFileSync(path, "utf8")));
}
