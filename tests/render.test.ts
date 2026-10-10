import { describe, expect, test } from "bun:test";
import type { PzzConfig, Tool } from "../scripts/lib/config.ts";
import { renderSkill, renderToolbox } from "../scripts/lib/render.ts";

const llms: Tool = {
  name: "Tool",
  url: "https://x.dev/llms.txt",
  task: "Adding authentication",
  source: "llms",
  desc: "Auth for you.",
  keywords: ["login", "SSO"],
};

const docs: Tool = {
  name: "Docs Only",
  url: "https://docs.example.com/",
  task: "Reading the docs",
  source: "docs",
  desc: null,
  keywords: [],
};

const config: PzzConfig = {
  docUrl: "https://x.dev/toolbox.md",
  tools: [llms, docs],
};

describe("renderToolbox", () => {
  test("renders the task table with the source column", () => {
    const md = renderToolbox(config);
    expect(md).toContain(
      "| Adding authentication | Tool | https://x.dev/llms.txt | llms |",
    );
    expect(md).toContain(
      "| Reading the docs | Docs Only | https://docs.example.com/ | docs |",
    );
  });

  test("renders details and only adds a description when one exists", () => {
    const md = renderToolbox(config);
    expect(md).toContain(
      "- **[Tool](https://x.dev/llms.txt)** — Adding authentication. Auth for you.",
    );
    expect(md).toContain(
      "- **[Docs Only](https://docs.example.com/)** — Reading the docs",
    );
  });
});

describe("renderSkill", () => {
  test("names the skill after the tool and triggers on its task", () => {
    const skill = renderSkill(llms, config.docUrl);
    expect(skill).toContain("name: tool\n");
    expect(skill).toContain(
      "description: Use for adding authentication, with Tool, and when the request mentions login, SSO.\n",
    );
  });

  test("lists keywords as triggers in the description", () => {
    expect(renderSkill(llms, config.docUrl)).toContain(
      "description: Use for adding authentication, with Tool, and when the request mentions login, SSO.",
    );
  });

  test("keeps acronyms capitalized in the trigger", () => {
    const badge: Tool = { ...docs, name: "shieldcn", task: "README badges" };
    expect(renderSkill(badge, config.docUrl)).toContain(
      "description: Use for README badges, with shieldcn.",
    );
  });

  test("keeps the description free of YAML-breaking colons", () => {
    for (const tool of [llms, docs]) {
      const line =
        renderSkill(tool, config.docUrl)
          .split("\n")
          .find((l) => l.startsWith("description:")) ?? "";
      expect(line.slice("description:".length)).not.toContain(":");
    }
  });

  test("llms source points at the llms.txt index", () => {
    expect(renderSkill(llms, config.docUrl)).toContain(
      "is the tool's `llms.txt` index",
    );
  });

  test("docs source sends the agent to the chrome-devtools MCP", () => {
    const skill = renderSkill(docs, config.docUrl);
    expect(skill).toContain("`chrome-devtools` MCP");
    expect(skill).not.toContain("undefined");
  });

  test("points at the full toolbox document", () => {
    expect(renderSkill(llms, config.docUrl)).toContain(
      "`https://x.dev/toolbox.md`",
    );
  });
});
