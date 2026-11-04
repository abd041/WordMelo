import { describe, expect, it } from "vitest";
import {
  chicagoPrepositionCapitalized,
  convertBatch,
  convertTitle,
  SAMPLE_TITLE,
  SAMPLE_TITLES,
} from "./convert";
import {
  buildHighlightSegments,
  countChangedTokens,
} from "./highlight";
import { normalizeException, upsertException } from "./exceptions";
import { COMPARE_STYLES } from "./profiles";

describe("APA 7 title case", () => {
  it("capitalizes major words and words of four or more letters", () => {
    expect(convertTitle("train your mind for peak performance", "apa7")).toBe(
      "Train Your Mind for Peak Performance",
    );
  });

  it("capitalizes With From Between (four+ letters) and lowercases of/to/in", () => {
    expect(
      convertTitle("working with data from the field in depth", "apa7"),
    ).toBe("Working With Data From the Field in Depth");
  });

  it("capitalizes first word after a colon", () => {
    expect(
      convertTitle("turning frowns upside down: a multilevel examination", "apa7"),
    ).toBe("Turning Frowns Upside Down: A Multilevel Examination");
  });

  it("capitalizes the second part of hyphenated major words", () => {
    expect(convertTitle("self-report measures", "apa7")).toBe(
      "Self-Report Measures",
    );
  });

  it("lowercases short conjunctions and articles mid-title", () => {
    expect(convertTitle("cats and dogs or birds", "apa7")).toBe(
      "Cats and Dogs or Birds",
    );
  });
});

describe("MLA 9 title case", () => {
  it("capitalizes first and last words", () => {
    expect(convertTitle("the art of living", "mla9")).toBe("The Art of Living");
  });

  it("lowercases prepositions of any length including about and between", () => {
    expect(
      convertTitle("pregnancy symptoms you should not worry about", "mla9"),
    ).toBe("Pregnancy Symptoms You Should Not Worry About"); // last word About capitalized
    expect(
      convertTitle("living between a rock and a hard place today", "mla9"),
    ).toBe("Living between a Rock and a Hard Place Today");
  });

  it("lowercases infinitive to", () => {
    expect(convertTitle("how to cite your sources", "mla9")).toBe(
      "How to Cite Your Sources",
    );
  });

  it("capitalizes both parts of hyphenated compounds", () => {
    expect(
      convertTitle("healthcare provision to a spanish-speaking population", "mla9"),
    ).toBe("Healthcare Provision to a Spanish-Speaking Population");
  });

  it("capitalizes subordinating conjunction if", () => {
    expect(convertTitle("dance as if no one is watching", "mla9")).toBe(
      "Dance as If No One Is Watching",
    );
  });
});

describe("Chicago 18 title case", () => {
  it("capitalizes prepositions of five or more letters", () => {
    expect(chicagoPrepositionCapitalized("about")).toBe(true);
    expect(chicagoPrepositionCapitalized("through")).toBe(true);
    expect(chicagoPrepositionCapitalized("between")).toBe(true);
    expect(chicagoPrepositionCapitalized("with")).toBe(false);
    expect(chicagoPrepositionCapitalized("from")).toBe(false);
    expect(chicagoPrepositionCapitalized("over")).toBe(false);
  });

  it("produces Much Ado About Nothing style About capitalization", () => {
    expect(convertTitle("much ado about nothing", "chicago18")).toBe(
      "Much Ado About Nothing",
    );
  });

  it("keeps short preposition with lowercase: A Room with a View", () => {
    expect(convertTitle("a room with a view", "chicago18")).toBe(
      "A Room with a View",
    );
  });

  it("capitalizes About while keeping with lowercase on the demo title", () => {
    expect(convertTitle("a room with a view about design", "chicago18")).toBe(
      "A Room with a View About Design",
    );
  });

  it("does not reintroduce Chicago 17 all-prepositions-lowercase", () => {
    const out = convertTitle("talking about detective fiction", "chicago18");
    expect(out).toBe("Talking About Detective Fiction");
    expect(out.includes(" about ")).toBe(false);
  });

  it("capitalizes subsequent elements after common prefixes", () => {
    expect(convertTitle("anti-intellectual pursuits", "chicago18")).toBe(
      "Anti-Intellectual Pursuits",
    );
  });
});

describe("AP composition titles", () => {
  it("capitalizes prepositions of four or more letters", () => {
    expect(convertTitle("gone with the wind", "ap-composition")).toBe(
      "Gone With the Wind",
    );
  });

  it("capitalizes infinitive to", () => {
    expect(
      convertTitle("what i want to be when i grow up", "ap-composition"),
    ).toBe("What I Want To Be When I Grow Up");
  });

  it("lowercases short conjunctions mid-title", () => {
    expect(convertTitle("this is us and them", "ap-composition")).toBe(
      "This Is Us and Them",
    );
  });
});

describe("general and sentence modes", () => {
  it("applies WordMelo general small-word list", () => {
    expect(convertTitle(SAMPLE_TITLE, "general")).toBe(
      "The Art of Writing a Great Title: A Guide to Clear Headlines",
    );
  });

  it("sentence case lowercases mid-sentence words", () => {
    expect(convertTitle("THE ART OF Writing", "sentence")).toBe(
      "The art of writing",
    );
  });
});

describe("style differentiation", () => {
  it("shows real differences for about/with on the same title", () => {
    const title = "a room with a view about design";
    const apa = convertTitle(title, "apa7");
    const mla = convertTitle(title, "mla9");
    const chicago = convertTitle(title, "chicago18");
    const ap = convertTitle(title, "ap-composition");

    expect(apa).toContain("With");
    expect(apa).toContain("About");
    expect(mla).toContain("with");
    expect(mla).toContain("about");
    expect(chicago).toContain("with");
    expect(chicago).toContain("About");
    expect(ap).toContain("With");
    expect(ap).toContain("About");

    // Not all identical
    expect(new Set([apa, mla, chicago, ap]).size).toBeGreaterThan(1);
  });

  it("does not re-transform already converted text as if it were a new style pass wrongly", () => {
    const original = "the lord of the rings";
    const once = convertTitle(original, "mla9");
    const twice = convertTitle(original, "mla9");
    expect(once).toBe(twice);
    expect(once).toBe("The Lord of the Rings");
  });
});

describe("acronyms and exceptions", () => {
  it("preserves known acronyms when enabled", () => {
    expect(
      convertTitle("learning html and css for seo", "apa7", {
        preserveAcronyms: true,
      }),
    ).toBe("Learning HTML and CSS for SEO");
  });

  it("applies custom brand spellings", () => {
    expect(
      convertTitle("buying an iphone on ebay", "general", {
        exceptions: [
          { match: "iphone", spelling: "iPhone" },
          { match: "ebay", spelling: "eBay" },
        ],
      }),
    ).toBe("Buying an iPhone on eBay");
  });

  it("does not match exceptions inside longer words", () => {
    expect(
      convertTitle("the sebay project", "general", {
        exceptions: [{ match: "ebay", spelling: "eBay" }],
      }),
    ).toBe("The Sebay Project");
  });
});

describe("unicode and punctuation", () => {
  it("preserves curly apostrophes in contractions", () => {
    const out = convertTitle("a writer\u2019s guide", "mla9");
    expect(out).toContain("\u2019");
    expect(out.startsWith("A ")).toBe(true);
  });

  it("preserves emoji", () => {
    expect(convertTitle("writing tips ✅ today", "general")).toContain("✅");
  });

  it("preserves CJK without forcing Latin title rules onto characters", () => {
    expect(convertTitle("漢字 and design", "general")).toContain("漢字");
  });
});

describe("batch conversion", () => {
  it("converts each line independently and preserves blanks", () => {
    const input = "how to write better headlines\n\na guide to modern web design";
    const lines = convertBatch(input, "mla9");
    expect(lines).toEqual([
      "How to Write Better Headlines",
      "",
      "A Guide to Modern Web Design",
    ]);
  });

  it("preserves original order", () => {
    const lines = convertBatch("zebra\napple\nmango", "general");
    expect(lines[0]).toContain("Zebra");
    expect(lines[1]).toContain("Apple");
    expect(lines[2]).toContain("Mango");
  });
});

describe("highlighting", () => {
  it("marks only changed tokens", () => {
    const segments = buildHighlightSegments(
      "the art of war",
      "The Art of War",
    );
    const changed = segments.filter((s) => s.changed).map((s) => s.text);
    expect(changed).toEqual(["The", "Art", "War"]);
    expect(segments.some((s) => s.text === "of" && !s.changed)).toBe(true);
    expect(countChangedTokens(segments)).toBe(3);
  });

  it("does not treat punctuation-only tokens as capitalization changes", () => {
    const segments = buildHighlightSegments(
      "writing: a guide",
      "Writing: A Guide",
    );
    const colon = segments.find((s) => s.text === ":");
    expect(colon?.changed).toBe(false);
  });

  it("handles repeated words independently", () => {
    const segments = buildHighlightSegments("the the the", "The the The");
    const words = segments.filter((s) => !/^\s+$/u.test(s.text));
    expect(words.map((s) => s.changed)).toEqual([true, false, true]);
  });

  it("leaves identical strings unmarked", () => {
    const segments = buildHighlightSegments("Same Title", "Same Title");
    expect(segments.every((s) => !s.changed)).toBe(true);
  });
});

describe("sample titles", () => {
  it("exports curated samples that produce real style differences", () => {
    expect(SAMPLE_TITLES.length).toBeGreaterThanOrEqual(3);
    const prep = SAMPLE_TITLES.find((s) => s.id === "prepositions");
    expect(prep).toBeTruthy();
    const outputs = COMPARE_STYLES.map((meta) =>
      convertTitle(prep!.text, meta.id),
    );
    expect(new Set(outputs).size).toBeGreaterThan(1);
  });

  it("keeps COMPARE_STYLES as a stable filtered list", () => {
    expect(COMPARE_STYLES.every((s) => s.compare)).toBe(true);
    expect(COMPARE_STYLES.map((s) => s.id)).toEqual([
      "apa7",
      "mla9",
      "chicago18",
      "ap-composition",
    ]);
  });
});

describe("exception helpers", () => {
  it("normalizes and upserts exceptions", () => {
    expect(normalizeException("  ", "x")).toBeNull();
    const list = upsertException([], {
      match: "iphone",
      spelling: "iPhone",
    });
    expect(list).toHaveLength(1);
    const updated = upsertException(list, {
      match: "IPhone",
      spelling: "iPhone",
    });
    expect(updated).toHaveLength(1);
  });
});
