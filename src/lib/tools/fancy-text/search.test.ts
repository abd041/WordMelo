import { describe, expect, it } from "vitest";
import { FANCY_STYLES, generateAllFancyStyles } from "./styles";
import { filterFancyResults, styleMatchesQuery } from "./search";

function idsFor(query: string): string[] {
  return FANCY_STYLES.filter((style) => styleMatchesQuery(style, query)).map(
    (style) => style.id,
  );
}

describe("styleMatchesQuery", () => {
  it("matches bold, cursive, gothic, and bubble by name or alias", () => {
    expect(idsFor("bold")).toContain("bold-sans");
    expect(idsFor("cursive")).toEqual(["script", "bold-script"]);
    expect(idsFor("gothic")).toEqual(["fraktur", "bold-fraktur"]);
    expect(idsFor("bubble")).toEqual(expect.arrayContaining(["bubble", "circled"]));
  });

  it("maps intent queries to a curated subset", () => {
    const fancy = idsFor("fancy");
    expect(fancy).toContain("script");
    expect(fancy).not.toContain("strikethrough");
    expect(fancy.length).toBeLessThan(FANCY_STYLES.length);

    expect(idsFor("instagram")).toContain("script");
    expect(idsFor("instagram")).not.toContain("strikethrough");
    expect(idsFor("gaming")).toContain("fraktur");
    expect(idsFor("gaming")).toContain("monospace");
    expect(idsFor("cute")).toContain("frame-hearts");
    expect(idsFor("aesthetic")).toContain("vaporwave");
    expect(idsFor("small")).toContain("small-caps");
  });

  it("ignores generic words so 'cool text' still matches", () => {
    expect(idsFor("cool text")).toContain("vaporwave");
  });

  it("returns nothing for an unknown query", () => {
    expect(idsFor("zzzz-not-a-style")).toEqual([]);
  });

  it("combines category and search", () => {
    const results = filterFancyResults(generateAllFancyStyles("Alex"), {
      query: "bold",
      category: "script",
      favoriteIds: [],
      recentIds: [],
    });
    expect(results.map((result) => result.style.id)).toContain("bold-script");
    expect(results.every((result) => result.style.category === "script")).toBe(
      true,
    );
  });

  it("limits favorites and recent to saved ids", () => {
    const results = filterFancyResults(generateAllFancyStyles("Alex"), {
      query: "",
      category: "favorites",
      favoriteIds: ["script"],
      recentIds: [],
    });
    expect(results.map((result) => result.style.id)).toEqual(["script"]);
  });
});
