import { describe, expect, it } from "vitest";
import {
  analyzeText,
  computeTextStats,
  computeWordFrequencies,
  countCharactersWithoutSpaces,
  countCharactersWithSpaces,
  countGraphemes,
  tryCountGraphemes,
  countParagraphs,
  countSentences,
  countWords,
  estimateDurationSeconds,
  estimatePages,
  extractWords,
  formatDuration,
} from "./count";

describe("countWords", () => {
  it("returns 0 for empty and whitespace-only strings", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \t\n  ")).toBe(0);
  });

  it("counts simple English words", () => {
    expect(countWords("hello world")).toBe(2);
  });

  it("handles multiple spaces, tabs, and newlines", () => {
    expect(countWords("one \t  two\n\nthree")).toBe(3);
  });

  it("handles Windows and Unix line endings", () => {
    expect(countWords("one\r\ntwo\nthree")).toBe(3);
  });

  it("counts contractions as words", () => {
    expect(countWords("don't can't won't")).toBe(3);
  });

  it("counts hyphenated compounds", () => {
    const words = extractWords("state-of-the-art design");
    expect(words.length).toBeGreaterThanOrEqual(2);
    expect(countWords("well-known author")).toBeGreaterThanOrEqual(2);
  });

  it("counts numbers as words", () => {
    expect(countWords("Chapter 12 has 3 sections")).toBe(5);
  });

  it("handles punctuation without inventing extra words", () => {
    expect(countWords("Hello, world!")).toBe(2);
  });

  it("supports non-Latin scripts", () => {
    expect(countWords("こんにちは 世界")).toBeGreaterThanOrEqual(1);
    expect(countWords("Привет мир")).toBe(2);
    expect(countWords("العربية جميلة")).toBeGreaterThanOrEqual(2);
  });

  it("does not count bare punctuation as words", () => {
    expect(countWords("... !!! ???")).toBe(0);
    expect(countWords("word — another")).toBe(2);
  });

  it("handles emoji adjacent to words", () => {
    const words = extractWords("hello 👋 world 🌍");
    expect(words.length).toBeGreaterThanOrEqual(2);
    expect(countWords("hello 👋 world")).toBeGreaterThanOrEqual(2);
  });

  it("handles mixed whitespace unicode characters", () => {
    expect(countWords("one\u00A0two\u2003three")).toBe(3);
  });
});

describe("character counts", () => {
  it("counts characters with and without spaces", () => {
    expect(countCharactersWithSpaces("a b")).toBe(3);
    expect(countCharactersWithoutSpaces("a b")).toBe(2);
  });

  it("ignores tabs and newlines in without-spaces count", () => {
    expect(countCharactersWithoutSpaces("a\tb\nc")).toBe(3);
  });

  it("distinguishes code units from graphemes for emoji", () => {
    const family = "👨‍👩‍👧‍👦";
    expect(countCharactersWithSpaces(family)).toBeGreaterThan(
      countGraphemes(family),
    );
    expect(countGraphemes(family)).toBeGreaterThanOrEqual(1);
  });

  it("counts combining marks as part of grapheme clusters", () => {
    const cafe = "cafe\u0301"; // café via combining acute
    expect(countGraphemes(cafe)).toBe(4);
    expect(countCharactersWithSpaces(cafe)).toBe(5);
  });

  it("counts zero-width joiners in family emoji as one grapheme", () => {
    expect(countGraphemes("👨‍👩‍👧‍👦")).toBe(1);
  });
});

describe("tryCountGraphemes precision policy", () => {
  it("never returns a code-point stand-in labeled as graphemes for large text", () => {
    // Combining mark sequence: code points = 2n, graphemes = n when Segmenter works.
    const unit = "e\u0301";
    const large = unit.repeat(8_000); // 16_000 UTF-16 units — above the old 12k threshold
    const result = tryCountGraphemes(large);
    expect(result.available).toBe(true);
    expect(result.count).toBe(8_000);
    expect(result.count).not.toBe(Array.from(large).length);
  });
});

describe("sentences and paragraphs", () => {
  it("returns 0 sentences and paragraphs for empty text", () => {
    expect(countSentences("")).toBe(0);
    expect(countParagraphs("")).toBe(0);
  });

  it("counts basic sentences", () => {
    expect(countSentences("Hello. How are you? Fine!")).toBe(3);
  });

  it("treats ellipsis-terminated clauses carefully", () => {
    expect(countSentences("Wait… Really?")).toBeGreaterThanOrEqual(1);
  });

  it("counts paragraphs separated by blank lines", () => {
    const text = "First paragraph.\n\nSecond paragraph.\n\n\nThird.";
    expect(countParagraphs(text)).toBe(3);
  });

  it("treats a single block as one paragraph", () => {
    expect(countParagraphs("Line one\nLine two still same paragraph")).toBe(1);
  });
});

describe("timing and pages", () => {
  it("estimates reading and speaking durations", () => {
    expect(estimateDurationSeconds(238, 238)).toBe(60);
    expect(estimateDurationSeconds(150, 150)).toBe(60);
    expect(estimateDurationSeconds(0, 238)).toBe(0);
  });

  it("formats durations clearly", () => {
    expect(formatDuration(0)).toBe("0 sec");
    expect(formatDuration(65)).toBe("1 min 5 sec");
    expect(formatDuration(3600)).toBe("1 hr");
  });

  it("estimates pages with documented assumption", () => {
    expect(estimatePages(250, 250)).toBe(1);
    expect(estimatePages(125, 250)).toBe(0.5);
    expect(estimatePages(0)).toBe(0);
  });
});

describe("frequency and analyzeText", () => {
  it("computes case-insensitive frequencies", () => {
    const freq = computeWordFrequencies("Apple banana apple Banana apple");
    expect(freq[0]).toMatchObject({ count: 3 });
    expect(freq.find((item) => item.count === 2)?.count).toBe(2);
  });

  it("returns combined analysis", () => {
    const result = analyzeText("Hello world. Hello again.\n\nNew paragraph.");
    expect(result.words).toBeGreaterThan(0);
    expect(result.sentences).toBeGreaterThanOrEqual(2);
    expect(result.paragraphs).toBe(2);
    expect(result.frequencies.length).toBeGreaterThan(0);
  });

  it(
    "handles very large inputs without throwing",
    () => {
      const large = "word ".repeat(5_000);
      const stats = computeTextStats(large);
      expect(stats.words).toBe(5_000);
      expect(stats.charactersWithSpaces).toBe(large.length);
    },
    15_000,
  );

  it("can skip frequencies when requested", () => {
    const result = analyzeText("one two two", { includeFrequencies: false });
    expect(result.frequencies).toEqual([]);
  });
});
