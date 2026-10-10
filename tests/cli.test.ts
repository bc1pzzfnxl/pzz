import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const create = join(import.meta.dir, "../scripts/create.ts");

async function runCreate(
  args: string[],
): Promise<{ code: number; output: string }> {
  const proc = Bun.spawn(["bun", create, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { code: await proc.exited, output: stdout + stderr };
}

describe("create-pzz CLI (offline)", () => {
  test("dry-run prints the Astro steps without touching disk", async () => {
    const r = await runCreate(["pzz-dry-check", "--app", "astro", "--dry-run"]);
    expect(r.code).toBe(0);
    expect(r.output).toContain(
      "[dry] $ bunx github:bc1pzzfnxl/skill-seo-astro#",
    );
    expect(r.output).toContain(
      "[dry] $ bun add -d @astrojs/check@0.9.10 typescript@5.9.3",
    );
  });

  test("dry-run for Next has no SEO step", async () => {
    const r = await runCreate(["pzz-dry-check", "--app", "next", "--dry-run"]);
    expect(r.code).toBe(0);
    expect(r.output).not.toContain("skill-seo-astro");
  });

  test("rejects an invalid project name", async () => {
    const r = await runCreate(["Bad Name", "--app", "next", "--dry-run"]);
    expect(r.code).toBe(1);
    expect(r.output).toContain("invalid project name");
  });

  test("rejects an unknown --app", async () => {
    const r = await runCreate(["pzz-dry-check", "--app", "remix", "--dry-run"]);
    expect(r.code).toBe(1);
  });

  test("rejects an unknown --ui before creating anything", async () => {
    const r = await runCreate([
      "pzz-dry-check",
      "--app",
      "next",
      "--ui",
      "nope",
      "--dry-run",
    ]);
    expect(r.code).toBe(1);
    expect(r.output).toContain('unknown --ui "nope"');
  });
});
