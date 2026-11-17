import { describe, expect, it } from "vitest";
import { buildLoremSearch, parseLoremSearch } from "./settings";

describe("parseLoremSearch", () => {
  it("returns null for an empty or unrelated query", () => {
    expect(parseLoremSearch("")).toBeNull();
    expect(parseLoremSearch("?utm_source=ad")).toBeNull();
  });

  it("rejects an unknown mode or an unsafe seed", () => {
    expect(parseLoremSearch("?mode=javascript")).toBeNull();
    expect(parseLoremSearch("?seed=-1")).toBeNull();
    expect(parseLoremSearch("?seed=1.5")).toBeNull();
  });

  it("clamps the amount and keeps list settings", () => {
    const parsed = parseLoremSearch(
      "?mode=lists&amount=999&length=short&list=ol&classic=0&seed=12",
    );
    expect(parsed).toMatchObject({
      mode: "lists",
      quantity: 50,
      listStyle: "ordered",
      listItemLength: "short",
      classicOpening: false,
      seed: 12,
    });
  });

  it("round-trips a settings link without the generated text", () => {
    const query = buildLoremSearch({
      mode: "words",
      quantity: 100,
      paragraphLength: "medium",
      listStyle: "unordered",
      listItemLength: "medium",
      classicOpening: true,
      preferCompleteWords: false,
      textKind: "lorem",
      format: "markdown",
      seed: 9,
    });
    expect(query).not.toContain("lorem");
    expect(parseLoremSearch(query)).toMatchObject({
      mode: "words",
      quantity: 100,
      format: "markdown",
      seed: 9,
    });
  });
});
