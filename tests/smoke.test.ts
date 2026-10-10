// Real end-to-end check: scaffolds each framework, then lints, typechecks and builds it.
// Needs network. Skipped unless PZZ_SMOKE=1 (run with `bun run smoke`).
import { expect, test } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const enabled = process.env.PZZ_SMOKE === "1";
const create = join(import.meta.dir, "../scripts/create.ts");
// Keep the scratch directory on the home filesystem: /tmp is a small tmpfs.
const workdir = join(homedir(), ".cache", "pzz-smoke");
const TIMEOUT_MS = 20 * 60_000;

function sh(cmd: string[], cwd: string): number {
  return Bun.spawnSync(cmd, { cwd, stdout: "inherit", stderr: "inherit" })
    .exitCode;
}

for (const app of ["astro", "next"] as const) {
  test.skipIf(!enabled)(
    `scaffolds a ${app} project that lints, typechecks and builds`,
    () => {
      mkdirSync(workdir, { recursive: true });
      const name = `smoke-${app}`;
      const dir = join(workdir, name);
      rmSync(dir, { recursive: true, force: true });
      try {
        expect(sh(["bun", create, name, "--app", app], workdir)).toBe(0);
        expect(sh(["bun", "run", "lint"], dir)).toBe(0);
        expect(sh(["bun", "run", "typecheck"], dir)).toBe(0);
        expect(sh(["bun", "run", "build"], dir)).toBe(0);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
    TIMEOUT_MS,
  );
}
