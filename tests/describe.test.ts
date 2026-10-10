import { describe, expect, test } from "bun:test";
import { summarize } from "../scripts/lib/describe.ts";

describe("summarize", () => {
  test("keeps the first sentence and capitalizes it", () => {
    expect(summarize("numbers that move. A React component.")).toBe(
      "Numbers that move.",
    );
  });

  test("adds a final period when missing", () => {
    expect(summarize("Single Sign-On for your universe")).toBe(
      "Single Sign-On for your universe.",
    );
  });

  test("drops emoji and zero-width joiners", () => {
    expect(summarize("Self-hosted universe 🐈‍⬛🔒")).toBe(
      "Self-hosted universe.",
    );
  });

  test("decodes common HTML entities", () => {
    expect(summarize("Tom &amp; Jerry &#39;s tools.")).toBe(
      "Tom & Jerry 's tools.",
    );
  });

  test("collapses whitespace and returns empty for blank input", () => {
    expect(summarize("  a \n\n  b.  ")).toBe("A b.");
    expect(summarize("   ")).toBe("");
  });
});
