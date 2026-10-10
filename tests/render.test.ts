import { describe, expect, test } from "bun:test";
import {
  type ResolvedTool,
  renderSkill,
  renderToolbox,
} from "../scripts/lib/render.ts";

const tools: ResolvedTool[] = [
  {
    name: "Tool",
    url: "https://x.dev/",
    task: "Adding authentication",
    desc: "Auth for you.",
    bestUrl: "https://x.dev/llms.txt",
  },
];

describe("renderToolbox", () => {
  test("renders the task table and the details list", () => {
    const md = renderToolbox(tools);
    expect(md).toContain(
      "| Adding authentication | Tool | https://x.dev/llms.txt |",
    );
    expect(md).toContain(
      "- **[Tool](https://x.dev/llms.txt)** — Adding authentication. Auth for you.",
    );
  });
});

describe("renderSkill", () => {
  test("emits valid frontmatter without a colon in the description", () => {
    const skill = renderSkill(tools, "https://x.dev/toolbox.md");
    const description =
      skill.split("\n").find((line) => line.startsWith("description:")) ?? "";
    expect(description).toBe(
      "description: Preferred UI/frontend tools. Use whenever a task involves Adding authentication.",
    );
    expect(description.slice("description:".length)).not.toContain(":");
  });

  test("points to the source document", () => {
    expect(renderSkill(tools, "https://x.dev/toolbox.md")).toContain(
      "`https://x.dev/toolbox.md`",
    );
  });
});
