import { describe, expect, test } from "bun:test";
import {
  mergeAgents,
  mergeScripts,
  validateName,
  withPathAlias,
} from "../scripts/lib/project.ts";

describe("validateName", () => {
  test("accepts lowercase slugs", () => {
    expect(validateName("my-app2")).toBeNull();
  });

  test("rejects spaces, uppercase, dots and shell metacharacters", () => {
    for (const bad of ["My App", "UPPER", ".", "a;rm", "-leading", ""]) {
      expect(validateName(bad)).not.toBeNull();
    }
  });
});

describe("mergeAgents", () => {
  const template =
    "# AGENTS.md\n\nIntro.\n\n## Commands\n\n- Test\n\n## Conventions\n\n- rule\n";

  test("creates the file when absent", () => {
    expect(mergeAgents(null, template)).toEqual({
      content: template,
      action: "created",
    });
  });

  test("keeps an existing file that already has project sections", () => {
    const existing = "# mine\n\n## Conventions\n\n- kept\n";
    expect(mergeAgents(existing, template)).toEqual({
      content: existing,
      action: "kept",
    });
  });

  test("appends the template sections below an existing file", () => {
    const merged = mergeAgents("# framework\n", template);
    expect(merged.action).toBe("appended");
    expect(merged.content.startsWith("# framework\n\n## Commands")).toBe(true);
    expect(merged.content).toContain("## Conventions");
  });
});

describe("mergeScripts", () => {
  test("adds scripts and keeps the other fields", () => {
    const pkg = JSON.stringify({ name: "app", scripts: { dev: "astro dev" } });
    const merged = JSON.parse(
      mergeScripts(pkg, { lint: "biome check ." }),
    ) as Record<string, unknown>;
    expect(merged.name).toBe("app");
    expect(merged.scripts).toEqual({ dev: "astro dev", lint: "biome check ." });
  });
});

describe("withPathAlias", () => {
  test("adds @/* and preserves existing paths", () => {
    const ts = JSON.stringify({
      compilerOptions: { paths: { "~/*": ["./lib/*"] } },
    });
    const out = JSON.parse(withPathAlias(ts)) as {
      compilerOptions: { paths: Record<string, string[]>; baseUrl: string };
    };
    expect(out.compilerOptions.baseUrl).toBe(".");
    expect(out.compilerOptions.paths).toEqual({
      "@/*": ["./src/*"],
      "~/*": ["./lib/*"],
    });
  });

  test("throws on non-JSON input so the caller can warn", () => {
    expect(() => withPathAlias("{ // comment\n}")).toThrow();
  });
});
