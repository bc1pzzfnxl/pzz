import { describe, expect, test } from "bun:test";
import { loadConfig, parseConfig } from "../scripts/lib/config.ts";

const valid = {
  docUrl: "https://example.com/toolbox.md",
  tools: [{ name: "Tool", url: "https://example.com/", task: "Doing things" }],
  ui: { starter: { type: "shadcn", items: ["button"] } },
};

describe("parseConfig", () => {
  test("accepts a valid config", () => {
    const config = parseConfig(valid);
    expect(config.tools[0]?.name).toBe("Tool");
    expect(config.ui.starter).toEqual({ type: "shadcn", items: ["button"] });
  });

  test("rejects a tool without a task", () => {
    const bad = {
      ...valid,
      tools: [{ name: "Tool", url: "https://example.com/" }],
    };
    expect(() => parseConfig(bad)).toThrow("tools[0].task");
  });

  test("rejects an unknown ui type", () => {
    expect(() =>
      parseConfig({ ...valid, ui: { x: { type: "bogus" } } }),
    ).toThrow("ui.x.type");
  });

  test("rejects a malformed url", () => {
    expect(() => parseConfig({ ...valid, docUrl: "not a url" })).toThrow(
      "docUrl",
    );
  });

  test("rejects a missing tools array", () => {
    expect(() => parseConfig({ ...valid, tools: "nope" })).toThrow("tools");
  });
});

test("the repository pzz.json is valid", () => {
  expect(loadConfig().tools.length).toBeGreaterThan(0);
});
