#!/usr/bin/env bun
// Scaffold a new project: bun + (Astro single-page | Next multi-page) + React/shadcn,
// Biome as the quality gate, and a repository AGENTS.md.
//
// Usage:
//   bun scripts/create.mjs <name> [--app astro|next] [--ui <library>] [--dry-run]
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);

const opts = { app: null, ui: null, dry: false };
const positional = [];

function usage() {
  console.log(`Usage: create <name> [--app astro|next] [--ui <library>] [--dry-run]

  astro   single-page site
  next    multi-page app
  --ui    component library from components.json (optional)`);
}

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--app") opts.app = argv[++i];
  else if (a === "--ui") opts.ui = argv[++i];
  else if (a === "--dry-run") opts.dry = true;
  else if (a === "-h" || a === "--help") { usage(); process.exit(0); }
  else positional.push(a);
}

const name = positional[0];
if (!name) { usage(); process.exit(1); }

function run(cmd, cwd = process.cwd()) {
  if (opts.dry) { console.log(`  [dry] $ ${cmd}`); return; }
  console.log(`  $ ${cmd}`);
  const r = spawnSync(cmd, { cwd, stdio: "inherit", shell: true });
  if (r.status !== 0) { console.error(`\n✗ command failed: ${cmd}`); process.exit(1); }
}

function setScripts(target, scripts) {
  if (opts.dry) { console.log(`  [dry] merge package.json scripts: ${Object.keys(scripts).join(", ")}`); return; }
  const pkgPath = join(target, "package.json");
  if (!existsSync(pkgPath)) return;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.scripts = { ...pkg.scripts, ...scripts };
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function ensureAlias(target) {
  const tsPath = join(target, "tsconfig.json");
  if (opts.dry) { console.log('  [dry] ensure tsconfig paths { "@/*": ["./src/*"] }'); return; }
  if (!existsSync(tsPath)) return;
  let ts;
  try {
    ts = JSON.parse(readFileSync(tsPath, "utf8"));
  } catch {
    console.warn("  ! tsconfig.json is not plain JSON; add the @/* alias manually before shadcn init");
    return;
  }
  ts.compilerOptions = ts.compilerOptions ?? {};
  ts.compilerOptions.baseUrl = ts.compilerOptions.baseUrl ?? ".";
  ts.compilerOptions.paths = { "@/*": ["./src/*"], ...(ts.compilerOptions.paths ?? {}) };
  writeFileSync(tsPath, `${JSON.stringify(ts, null, 2)}\n`);
  console.log('  · tsconfig alias @/* → ./src/*');
}

const ASTRO_CONFIG = `import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { rehypeOptimizedImages } from "./src/lib/rehype-optimized-images.ts";

export default defineConfig({
  site: "https://example.com",
  trailingSlash: "always",
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeOptimizedImages],
    }),
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
`;

function applySeo(target) {
  console.log("  · Astro SEO (skill-seo-astro)");

  // Let the SEO skill own the homepage instead of Astro's default one.
  const index = join(target, "src/pages/index.astro");
  if (opts.dry) console.log("  [dry] rm src/pages/index.astro");
  else if (existsSync(index)) rmSync(index);

  run("bunx github:bc1pzzfnxl/skill-seo-astro init", target);
  run("bun add @astrojs/mdx @astrojs/sitemap @astrojs/rss @astrojs/markdown-remark unist-util-visit sharp", target);

  // Merge: keep react + tailwind, add SEO (mdx, sitemap, markdown processor).
  if (opts.dry) console.log("  [dry] write astro.config.mjs (react + tailwind + mdx + sitemap + seo markdown)");
  else {
    writeFileSync(join(target, "astro.config.mjs"), ASTRO_CONFIG);
    console.log("  · astro.config.mjs merged (react + tailwind + seo)");
  }
}

function copyAgents(target) {
  const dest = join(target, "AGENTS.md");
  const template = readFileSync(join(repoRoot, "templates/repo-AGENTS.md"), "utf8");
  if (opts.dry) { console.log("  [dry] write/merge AGENTS.md from templates/repo-AGENTS.md"); return; }
  if (!existsSync(dest)) { writeFileSync(dest, template); return; }
  if (readFileSync(dest, "utf8").includes("## Conventions")) {
    console.log("  · AGENTS.md already has the project sections, kept");
    return;
  }
  const body = template.slice(template.indexOf("\n## ") + 1);
  writeFileSync(dest, `${readFileSync(dest, "utf8").trimEnd()}\n\n${body}`);
  console.log("  · AGENTS.md: appended project sections");
}

function applyUi(library, target) {
  const registryPath = join(repoRoot, "components.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf8")).libraries ?? {};
  const entry = registry[library];
  if (!entry) {
    console.warn(`  ! unknown --ui "${library}" (available: ${Object.keys(registry).join(", ") || "none"})`);
    return;
  }
  if (entry.type === "shadcn") {
    const items = (entry.items ?? []).join(" ");
    run(`bunx shadcn@latest add ${items}${items ? " " : ""}--yes`, target);
  } else if (entry.type === "npm") {
    run(`bun add ${(entry.packages ?? []).join(" ")}`, target);
  } else if (entry.type === "manual") {
    console.log(`  · manual: ${entry.note ?? "see the library docs"}`);
  }
}

// --- resolve framework -----------------------------------------------------
if (opts.app && !["astro", "next"].includes(opts.app)) {
  console.error('--app must be "astro" or "next"');
  process.exit(1);
}
if (!opts.app) {
  if (process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question("Framework — astro (single-page) or next (multi-page)? [next] ")).trim().toLowerCase();
    rl.close();
    opts.app = answer === "astro" ? "astro" : "next";
  } else {
    opts.app = "next";
  }
}

const target = resolve(process.cwd(), name);
if (existsSync(target) && name !== ".") {
  console.error(`✗ ${target} already exists`);
  process.exit(1);
}

console.log(`\n▶ ${name} — ${opts.app}${opts.ui ? ` + ${opts.ui}` : ""}${opts.dry ? " (dry-run)" : ""}\n`);

// --- 1. framework ----------------------------------------------------------
if (opts.app === "next") {
  run(
    `bunx create-next-app@latest ${JSON.stringify(name)} --ts --tailwind --app --src-dir --import-alias "@/*" --use-bun --turbopack --no-eslint`,
  );
} else {
  run(`bunx create-astro@latest ${JSON.stringify(name)} --template minimal --typescript strict --install --no-git --skip-houston`);
  run("bunx astro add react tailwind --yes", target);
  ensureAlias(target);
}

// --- 2. shadcn/ui ----------------------------------------------------------
run("bunx shadcn@latest init --defaults --yes", target);

// --- 3. component library (optional) --------------------------------------
if (opts.ui) applyUi(opts.ui, target);

// --- 3b. Astro SEO scaffold ------------------------------------------------
if (opts.app === "astro") applySeo(target);

// --- 4. quality gate: Biome -----------------------------------------------
run("bun add -d @biomejs/biome", target);
run("bunx biome init", target);
setScripts(target, {
  lint: "biome check .",
  "lint:fix": "biome check --write .",
  format: "biome format --write .",
  typecheck: "tsc --noEmit",
});

// --- 5. repo AGENTS.md -----------------------------------------------------
copyAgents(target);

// --- 6. git ----------------------------------------------------------------
if (existsSync(join(target, ".git"))) {
  console.log("  · git already initialized");
} else {
  run("git init -b main", target);
}
run("git add -A", target);
run(`git -c commit.gpgsign=false commit -q -m "chore: scaffold ${name} (${opts.app})"`, target);

console.log(`\n✓ ${name} ready — cd ${name} && bun run dev`);
