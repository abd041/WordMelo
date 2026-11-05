import { describe, expect, it } from "vitest";
import {
  getPublishedTools,
  searchPublishedTools,
  toolCategories,
} from "./registry";

describe("published tool registry", () => {
  it("publishes ten distinct routes", () => {
    const tools = getPublishedTools();
    const hrefs = tools.map((tool) => tool.href);
    expect(tools).toHaveLength(10);
    expect(new Set(hrefs).size).toBe(10);
    expect(hrefs.every((href) => href.startsWith("/"))).toBe(true);
  });

  it("assigns every tool to a known category", () => {
    const ids = new Set(toolCategories.map((category) => category.id));
    for (const tool of getPublishedTools()) {
      expect(ids.has(tool.categoryId)).toBe(true);
    }
  });

  it("search matches names and ignores empty queries", () => {
    expect(searchPublishedTools("   ")).toHaveLength(10);
    const matches = searchPublishedTools("lorem");
    expect(matches.some((tool) => tool.id === "lorem-ipsum-generator")).toBe(
      true,
    );
    expect(searchPublishedTools("zzzz-not-a-tool")).toHaveLength(0);
  });
});
