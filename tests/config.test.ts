import { describe, expect, test } from "bun:test";
import { loadConfig, parseConfig, slugify } from "../scripts/lib/config.ts";

const valid = {
  docUrl: "https://example.com/toolbox.md",
  tools: [
    {
      name: "Tool",
      url: "https://example.com/",
      task: "Doing things",
      source: "meta",
      desc: "Does things.",
    },
  ],
};

describe("parseConfig", () => {
  test("accepts a valid config", () => {
    const config = parseConfig(valid);
    expect(config.tools[0]?.name).toBe("Tool");
    expect(config.tools[0]?.source).toBe("meta");
  });

  test("rejects a tool without a task", () => {
    const bad = {
      ...valid,
      tools: [
        {
          name: "Tool",
          url: "https://example.com/",
          source: "meta",
          desc: "x.",
        },
      ],
    };
    expect(() => parseConfig(bad)).toThrow("tools[0].task");
  });

  test("rejects an unknown source", () => {
    const bad = { ...valid, tools: [{ ...valid.tools[0], source: "scrape" }] };
    expect(() => parseConfig(bad)).toThrow("tools[0].source");
  });

  test("requires a description for llms and meta sources", () => {
    const bad = { ...valid, tools: [{ ...valid.tools[0], desc: null }] };
    expect(() => parseConfig(bad)).toThrow("tools[0].desc");
  });

  test("allows a missing description for the docs source", () => {
    const ok = {
      ...valid,
      tools: [{ ...valid.tools[0], source: "docs", desc: null }],
    };
    expect(parseConfig(ok).tools[0]?.desc).toBeNull();
  });

  test("rejects two tools that map to the same skill name", () => {
    const dup = {
      ...valid,
      tools: [valid.tools[0], { ...valid.tools[0], name: "tool" }],
    };
    expect(() => parseConfig(dup)).toThrow("collides");
  });

  test("rejects keywords that are not strings", () => {
    const bad = { ...valid, tools: [{ ...valid.tools[0], keywords: "login" }] };
    expect(() => parseConfig(bad)).toThrow("tools[0].keywords");
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

describe("slugify", () => {
  test("turns tool names into skill names", () => {
    expect(slugify("Component Gallery")).toBe("component-gallery");
    expect(slugify("env.style")).toBe("env-style");
    expect(slugify("ShadScan")).toBe("shadscan");
  });
});

test("the repository pzz.json is valid", () => {
  expect(loadConfig().tools.length).toBeGreaterThan(0);
});
