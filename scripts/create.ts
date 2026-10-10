#!/usr/bin/env bun
// Scaffold a project: bun + (Astro single-page | Next multi-page) + React/shadcn,
// Biome as the quality gate, and a repository AGENTS.md. Astro also gets the
// skill-seo-astro scaffold and agent skill. Next gets no SEO scaffold, by design.
//
// Usage:
//   create-pzz <name> [--app astro|next] [--ui <name>] [--dry-run]
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { loadConfig, repoRoot, type UiEntry } from "./lib/config.ts";
import {
  ASTRO_CONFIG,
  mergeAgents,
  mergeScripts,
  TOOL_VERSIONS,
  validateName,
  withPathAlias,
} from "./lib/project.ts";

type App = "astro" | "next";

const usage = `Usage: create-pzz <name> [--app astro|next] [--ui <name>] [--dry-run]

  --app astro   single-page site (Astro, React, shadcn, SEO scaffold)
  --app next    multi-page app (Next.js, React, shadcn)
  --ui <name>   component set from pzz.json "ui" (optional)
  --dry-run     print the steps without running them`;

function die(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

const argv = process.argv.slice(2);
const positional: string[] = [];
let app: App | null = null;
let ui: string | null = null;
let dry = false;

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === "-h" || arg === "--help") {
    console.log(usage);
    process.exit(0);
  } else if (arg === "--dry-run") {
    dry = true;
  } else if (arg === "--app" || arg === "--ui") {
    const value = argv[++i];
    if (!value) die(`${arg} needs a value`);
    if (arg === "--app") {
      if (value !== "astro" && value !== "next")
        die('--app must be "astro" or "next"');
      app = value;
    } else {
      ui = value;
    }
  } else if (arg?.startsWith("--")) {
    die(`unknown option ${arg}\n\n${usage}`);
  } else if (arg) {
    positional.push(arg);
  }
}

const name = positional[0];
if (!name) {
  console.log(usage);
  process.exit(1);
}
const nameError = validateName(name);
if (nameError) die(nameError);

const config = loadConfig();
if (ui && !config.ui[ui]) {
  die(
    `unknown --ui "${ui}" (available: ${Object.keys(config.ui).join(", ") || "none"})`,
  );
}

async function chooseApp(): Promise<App> {
  if (!process.stdin.isTTY) return "next";
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (
    await rl.question(
      "Framework — astro (single-page) or next (multi-page)? [next] ",
    )
  )
    .trim()
    .toLowerCase();
  rl.close();
  return answer === "astro" ? "astro" : "next";
}

const framework: App = app ?? (await chooseApp());
const target = resolve(process.cwd(), name);
if (existsSync(target)) die(`${target} already exists`);

console.log(
  `\n▶ ${name} — ${framework}${ui ? ` + ${ui}` : ""}${dry ? " (dry-run)" : ""}\n`,
);

function run(cmd: string, cwd = process.cwd()): void {
  if (dry) {
    console.log(`  [dry] $ ${cmd}`);
    return;
  }
  console.log(`  $ ${cmd}`);
  const result = spawnSync(cmd, { cwd, stdio: "inherit", shell: true });
  if (result.status !== 0) die(`command failed: ${cmd}`);
}

function edit(description: string, action: () => void): void {
  if (dry) console.log(`  [dry] ${description}`);
  else action();
}

function setScripts(scripts: Record<string, string>): void {
  edit(`merge package.json scripts: ${Object.keys(scripts).join(", ")}`, () => {
    const path = join(target, "package.json");
    writeFileSync(path, mergeScripts(readFileSync(path, "utf8"), scripts));
  });
}

function applyAlias(): void {
  edit('ensure tsconfig paths { "@/*": ["./src/*"] }', () => {
    const path = join(target, "tsconfig.json");
    try {
      writeFileSync(path, withPathAlias(readFileSync(path, "utf8")));
      console.log("  · tsconfig alias @/* → ./src/*");
    } catch {
      console.warn(
        "  ! tsconfig.json is not plain JSON; add the @/* alias manually before shadcn init",
      );
    }
  });
}

function applyUi(entry: UiEntry): void {
  switch (entry.type) {
    case "shadcn":
      run(
        `bunx ${TOOL_VERSIONS.shadcn} add ${entry.items.join(" ")} --yes`,
        target,
      );
      break;
    case "npm":
      run(`bun add ${entry.packages.join(" ")}`, target);
      break;
    case "manual":
      console.log(`  · manual: ${entry.note}`);
      break;
  }
}

function applySeo(): void {
  console.log("  · Astro SEO (skill-seo-astro)");

  // The SEO scaffold owns the homepage; remove Astro's default one first.
  edit("rm src/pages/index.astro", () =>
    rmSync(join(target, "src/pages/index.astro"), { force: true }),
  );

  run(`bunx ${TOOL_VERSIONS.seoSkill} init`, target);
  run(
    "bun add @astrojs/mdx @astrojs/sitemap @astrojs/rss @astrojs/markdown-remark unist-util-visit sharp",
    target,
  );

  // Agent skill for every harness: .agents/skills is the shared project directory.
  run(
    `bunx ${TOOL_VERSIONS.skills} add ${TOOL_VERSIONS.seoSkillSource} --agent universal --yes`,
    target,
  );

  // The SEO config replaces the default one; it keeps react + tailwind.
  edit(
    "write astro.config.mjs (react + tailwind + mdx + sitemap + seo markdown)",
    () => {
      writeFileSync(join(target, "astro.config.mjs"), ASTRO_CONFIG);
      console.log("  · astro.config.mjs merged (react + tailwind + seo)");
    },
  );
}

function applyAgents(): void {
  const dest = join(target, "AGENTS.md");
  const template = readFileSync(
    join(repoRoot, "templates/repo-AGENTS.md"),
    "utf8",
  );
  edit("write/merge AGENTS.md from templates/repo-AGENTS.md", () => {
    const merged = mergeAgents(
      existsSync(dest) ? readFileSync(dest, "utf8") : null,
      template,
    );
    writeFileSync(dest, merged.content);
    if (merged.action === "kept")
      console.log("  · AGENTS.md already has the project sections, kept");
    if (merged.action === "appended")
      console.log("  · AGENTS.md: appended project sections");
  });
}

// --- 1. framework ----------------------------------------------------------
if (framework === "next") {
  run(
    `bunx ${TOOL_VERSIONS.createNextApp} ${name} --ts --tailwind --app --src-dir --import-alias "@/*" --use-bun --turbopack --no-eslint`,
  );
} else {
  run(
    `bunx ${TOOL_VERSIONS.createAstro} ${name} --template minimal --typescript strict --install --no-git --skip-houston`,
  );
  run("bunx astro add react tailwind --yes", target);
  applyAlias();
}

// --- 2. shadcn/ui ----------------------------------------------------------
run(`bunx ${TOOL_VERSIONS.shadcn} init --defaults --yes`, target);

// --- 3. component set (optional) -------------------------------------------
if (ui) {
  const entry = config.ui[ui];
  if (entry) applyUi(entry);
}

// --- 3b. Astro SEO scaffold ------------------------------------------------
if (framework === "astro") {
  applySeo();
  run(
    `bun add -d ${TOOL_VERSIONS.astroCheck} ${TOOL_VERSIONS.typescript}`,
    target,
  );
}

// --- 4. quality gate: Biome ------------------------------------------------
run(`bun add -d ${TOOL_VERSIONS.biome}`, target);
edit("copy biome.json from the pzz repo", () => {
  copyFileSync(join(repoRoot, "biome.json"), join(target, "biome.json"));
  console.log("  · biome.json copied");
});
setScripts({
  lint: "biome check .",
  "lint:fix": "biome check --write .",
  format: "biome format --write .",
  typecheck: framework === "astro" ? "astro check" : "tsc --noEmit",
});
// Normalize the generated code once (formatting, imports, safe fixes) so lint passes out of the box.
run("bunx biome check --write .", target);

// --- 5. repo AGENTS.md -----------------------------------------------------
applyAgents();

// --- 6. git ----------------------------------------------------------------
if (existsSync(join(target, ".git"))) {
  console.log("  · git already initialized");
} else {
  run("git init -b main", target);
}
run("git add -A", target);
run(
  `git -c commit.gpgsign=false commit -q -m "chore: scaffold ${name} (${framework})"`,
  target,
);

console.log(`\n✓ ${name} ready — cd ${name} && bun run dev`);
