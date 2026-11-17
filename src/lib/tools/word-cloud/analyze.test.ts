import { describe, expect, it } from "vitest";
import { analyzeText, textStats } from "./analyze";
import { SAMPLE_TEXT } from "./sample";

const base = {
  ignoreCase: true,
  excludeCommon: true,
  minLength: 3,
  minFrequency: 1,
  maxWords: 50,
  excludedWords: "",
  highlightedWords: "",
};

describe("word cloud text processing", () => {
  it("handles empty input", () => {
    const result = analyzeText("", base);
    expect(result.words).toEqual([]);
    expect(result.words).toHaveLength(0);
    expect(result.characters).toBe(0);
    expect(result.uniqueWords).toBe(0);
    expect(textStats("   ", true).words).toBe(0);
  });

  it("counts a single word once", () => {
    const result = analyzeText("Clarity", base);
    expect(result.words).toEqual([
      { text: "Clarity", count: 1, highlighted: false },
    ]);
    expect(result.uniqueWords).toBe(1);
  });

  it("merges repeated and mixed-case words", () => {
    const result = analyzeText("Hello hello HELLO hello", base);
    expect(result.words).toHaveLength(1);
    expect(result.words[0]?.count).toBe(4);
    expect(result.words[0]?.text.toLocaleLowerCase("en-US")).toBe("hello");
    const sensitive = analyzeText("Hello hello", { ...base, ignoreCase: false });
    expect(sensitive.words).toHaveLength(2);
    expect(sensitive.uniqueWords).toBe(2);
  });

  it("drops punctuation-only tokens and keeps words beside punctuation", () => {
    expect(analyzeText("... !!! ???", base).words).toEqual([]);
    const result = analyzeText("Hello, world! Hello.", {
      ...base,
      excludeCommon: false,
      minLength: 1,
    });
    expect(result.words.map((word) => word.text.toLocaleLowerCase("en-US"))).toEqual([
      "hello",
      "world",
    ]);
    expect(result.words[0]?.count).toBe(2);
  });

  it("keeps numbers, unicode, apostrophes, and hyphenated words", () => {
    const result = analyzeText("Don't skip café or well-known room 12.", {
      ...base,
      excludeCommon: false,
      minLength: 1,
    });
    const keys = result.words.map((word) => word.text.toLocaleLowerCase("en-US"));
    expect(keys).toContain("don't");
    expect(keys).toContain("café");
    expect(keys).toContain("well-known");
    expect(keys).toContain("12");
    expect(keys.some((word) => word === "." || word === ",")).toBe(false);
  });

  it("filters stopwords unless the filter is off or the word is highlighted", () => {
    const filtered = analyzeText("The cat and the dog", base);
    expect(filtered.words.map((word) => word.text)).toEqual(["cat", "dog"]);
    const kept = analyzeText("The cat and the dog", {
      ...base,
      excludeCommon: false,
      minLength: 1,
    });
    expect(kept.words.map((word) => word.text.toLocaleLowerCase("en-US"))).toContain(
      "the",
    );
    const highlighted = analyzeText("The cat and the dog", {
      ...base,
      highlightedWords: "the",
    });
    expect(highlighted.words[0]).toMatchObject({
      text: "The",
      count: 2,
      highlighted: true,
    });
  });

  it("applies custom exclusions, minimum frequency, maximum words, and count order", () => {
    const text = "alpha alpha alpha beta beta gamma delta";
    const excluded = analyzeText(text, { ...base, excludedWords: "alpha, beta" });
    expect(excluded.words.map((word) => word.text)).toEqual(["delta", "gamma"]);

    const frequent = analyzeText(text, { ...base, minFrequency: 2 });
    expect(frequent.words.map((word) => word.text)).toEqual(["alpha", "beta"]);

    const capped = analyzeText(text, { ...base, maxWords: 10, minFrequency: 1 });
    expect(capped.words.map((word) => word.text)).toEqual([
      "alpha",
      "beta",
      "delta",
      "gamma",
    ]);
    expect(capped.words[0]!.count).toBeGreaterThanOrEqual(capped.words[1]!.count);

    const limited = analyzeText(
      "one one one two two three four five six seven eight nine ten eleven",
      { ...base, maxWords: 10 },
    );
    expect(limited.words).toHaveLength(10);
    expect(limited.words[0]?.text).toBe("one");
  });

  it("builds a usable sample cloud", () => {
    const result = analyzeText(SAMPLE_TEXT, base);
    expect(result.words.length).toBeGreaterThan(8);
    expect(result.words[0]!.count).toBeGreaterThan(1);
    expect(result.truncated).toBe(false);
  });
});
