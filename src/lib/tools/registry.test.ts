import { describe, expect, it } from "vitest";
import {
  getPublishedTools,
  searchPublishedTools,
  toolCategories,
} from "./registry";

describe("published tool registry", () => {
  it("publishes fourteen distinct routes", () => {
    const tools = getPublishedTools();
    const hrefs = tools.map((tool) => tool.href);
    expect(tools).toHaveLength(14);
    expect(new Set(hrefs).size).toBe(14);
    expect(hrefs.every((href) => href.startsWith("/"))).toBe(true);
  });

  it("assigns every tool to a known category", () => {
    const ids = new Set(toolCategories.map((category) => category.id));
    for (const tool of getPublishedTools()) {
      expect(ids.has(tool.categoryId)).toBe(true);
    }
  });

  it("search matches names and ignores empty queries", () => {
    expect(searchPublishedTools("   ")).toHaveLength(14);
    expect(
      searchPublishedTools("typing speed").some((tool) => tool.id === "typing-speed-test"),
    ).toBe(true);
    expect(
      searchPublishedTools("alphabetizer").some((tool) => tool.id === "alphabetizer"),
    ).toBe(true);
    expect(
      searchPublishedTools("text compare").some((tool) => tool.id === "text-compare"),
    ).toBe(true);
    expect(
      searchPublishedTools("word cloud").some(
        (tool) => tool.id === "word-cloud-generator",
      ),
    ).toBe(true);
    const matches = searchPublishedTools("lorem");
    expect(matches.some((tool) => tool.id === "lorem-ipsum-generator")).toBe(
      true,
    );
    expect(searchPublishedTools("zzzz-not-a-tool")).toHaveLength(0);
  });
});
