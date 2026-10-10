// Scaffold tools are pinned so a given `create-pzz` run is reproducible.
// Bump them deliberately, then re-run `bun run smoke`.
export const TOOL_VERSIONS = {
  createNextApp: "create-next-app@16.4.0",
  createAstro: "create-astro@5.2.6",
  shadcn: "shadcn@4.21.4",
  skills: "skills@1.7.2",
  biome: "@biomejs/biome@2.5.15",
  typescript: "typescript@5.9.3",
  astroCheck: "@astrojs/check@0.9.10",
  seoSkill:
    "github:bc1pzzfnxl/skill-seo-astro#5ddcb2553de59c8dba6c24ba0eb2eefb068c22e6",
  seoSkillSource:
    "https://github.com/bc1pzzfnxl/skill-seo-astro/tree/5ddcb2553de59c8dba6c24ba0eb2eefb068c22e6",
} as const;

const NAME = /^[a-z0-9][a-z0-9-]*$/;

export function validateName(name: string): string | null {
  return NAME.test(name)
    ? null
    : `invalid project name "${name}": use lowercase letters, digits and hyphens, starting with a letter or digit`;
}

export const ASTRO_CONFIG = `import { defineConfig } from "astro/config";
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

export type AgentsMerge = {
  content: string;
  action: "created" | "kept" | "appended";
};

// Repo AGENTS.md: create it from the template, keep an existing one that already has
// project sections, otherwise append the template's sections below the existing text.
export function mergeAgents(
  existing: string | null,
  template: string,
): AgentsMerge {
  if (existing === null) return { content: template, action: "created" };
  if (existing.includes("## Conventions"))
    return { content: existing, action: "kept" };
  const body = template.slice(template.indexOf("\n## ") + 1);
  return { content: `${existing.trimEnd()}\n\n${body}`, action: "appended" };
}

// Merges scripts into a package.json, keeping every other field and its order.
export function mergeScripts(
  packageJson: string,
  scripts: Record<string, string>,
): string {
  const pkg = JSON.parse(packageJson) as {
    scripts?: Record<string, string>;
  } & Record<string, unknown>;
  pkg.scripts = { ...pkg.scripts, ...scripts };
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

// Adds the @/* alias to a tsconfig, preserving existing paths.
export function withPathAlias(tsconfig: string): string {
  const ts = JSON.parse(tsconfig) as {
    compilerOptions?: Record<string, unknown>;
  } & Record<string, unknown>;
  const options = ts.compilerOptions ?? {};
  const paths = (options.paths ?? {}) as Record<string, string[]>;
  ts.compilerOptions = {
    ...options,
    baseUrl: options.baseUrl ?? ".",
    paths: { "@/*": ["./src/*"], ...paths },
  };
  return `${JSON.stringify(ts, null, 2)}\n`;
}
