import { describe, expect, it } from "vitest";
import {
  analyzeCharacters,
  analyzeSelection,
  analyzeUnicodeDemo,
  countCodePoints,
  countDigits,
  countForMetric,
  countLetters,
  countLines,
  countPunctuation,
  countSymbols,
  countUtf8Bytes,
  countUtf16Units,
  countWhitespace,
  UNICODE_DEMOS,
} from "./count";
import { computeLimitStatus, parseLimitInput } from "./limits";
import { SAMPLE_TEXT } from "./rules";
import { countWords } from "@/lib/tools/word-counter/count";

describe("character counter basics", () => {
  it("returns zeros for empty input", () => {
    const stats = analyzeCharacters("");
    expect(stats.charactersWithSpaces).toBe(0);
    expect(stats.graphemes).toBe(0);
    expect(stats.graphemesAvailable).toBe(true);
    expect(stats.words).toBe(0);
    expect(stats.lines).toBe(0);
    expect(stats.paragraphs).toBe(0);
  });

  it("counts Hello World with and without whitespace", () => {
    const stats = analyzeCharacters("Hello World");
    expect(stats.charactersWithSpaces).toBe(11);
    expect(stats.charactersWithoutSpaces).toBe(10);
    expect(stats.letters).toBe(10);
    expect(stats.words).toBe(2);
  });

  it("keeps punctuation when whitespace is removed", () => {
    const stats = analyzeCharacters("Hello, world!");
    expect(stats.charactersWithSpaces).toBe(13);
    expect(stats.charactersWithoutSpaces).toBe(12);
    expect(stats.letters).toBe(10);
  });

  it("counts ASCII with spaces", () => {
    const stats = analyzeCharacters("Hi there");
    expect(stats.charactersWithSpaces).toBe(8);
    expect(stats.charactersWithoutSpaces).toBe(7);
    expect(stats.letters).toBe(7);
    expect(stats.whitespace).toBe(1);
    expect(stats.words).toBe(2);
  });

  it("counts tabs and newlines as whitespace and lines", () => {
    expect(countWhitespace("a\tb\nc")).toBe(2);
    expect(countLines("a\nb\nc")).toBe(3);
    expect(countLines("a\n")).toBe(2);
    expect(countLines("")).toBe(0);
  });

  it("normalizes CRLF for line counting", () => {
    expect(countLines("one\r\ntwo\r\nthree")).toBe(3);
  });

  it("counts digits and punctuation", () => {
    const stats = analyzeCharacters("A1!");
    expect(stats.letters).toBe(1);
    expect(stats.digits).toBe(1);
    expect(stats.punctuation).toBe(1);
  });

  it("counts Unicode decimal digits", () => {
    expect(countDigits("١٢٣")).toBe(3); // Arabic-Indic
  });

  it("keeps word count consistent with Word Counter", () => {
    const sample = "Hello world — café 42.";
    expect(analyzeCharacters(sample).words).toBe(countWords(sample));
  });

  it("produces consistent sample-text stats across surfaces", () => {
    const stats = analyzeCharacters(SAMPLE_TEXT);
    expect(stats.utf16Units).toBe(stats.charactersWithSpaces);
    expect(stats.codePoints).toBe(countCodePoints(SAMPLE_TEXT));
    expect(stats.letters).toBeGreaterThan(0);
    expect(stats.digits).toBeGreaterThan(0);
    expect(stats.punctuation).toBeGreaterThan(0);
    expect(stats.symbols).toBeGreaterThan(0);
    expect(stats.lines).toBeGreaterThan(1);
  });
});

describe("unicode metrics", () => {
  it("distinguishes graphemes, code points, and utf-16 for emoji", () => {
    const family = "👨‍👩‍👧‍👦";
    const graphemes = countForMetric(family, "grapheme");
    const codePoints = countCodePoints(family);
    const utf16 = countUtf16Units(family);
    expect(graphemes).toBe(1);
    expect(codePoints).toBeGreaterThan(1);
    expect(utf16).toBeGreaterThan(codePoints);
  });

  it("counts combining accents as separate code points but one grapheme when segmenter works", () => {
    const eAcute = "e\u0301"; // e + combining acute
    expect(countCodePoints(eAcute)).toBe(2);
    expect(countUtf16Units(eAcute)).toBe(2);
    expect(countUtf8Bytes(eAcute)).toBe(3);
    expect(countLetters(eAcute)).toBe(1);
    const graphemes = countForMetric(eAcute, "grapheme");
    expect(graphemes).toBe(1);
  });

  it("counts a skin-tone wave and a flag as one grapheme with extra bytes", () => {
    const wave = "👋🏽";
    const flag = "🇵🇰";
    for (const sample of [wave, flag]) {
      expect(countForMetric(sample, "grapheme")).toBe(1);
      expect(countCodePoints(sample)).toBe(2);
      expect(countUtf16Units(sample)).toBe(4);
      expect(countUtf8Bytes(sample)).toBe(8);
    }
  });

  it("counts precomposed accented letters as one of each basic metric", () => {
    const cafe = "é";
    expect(countCodePoints(cafe)).toBe(1);
    expect(countUtf16Units(cafe)).toBe(1);
    expect(countForMetric(cafe, "grapheme")).toBe(1);
    expect(countUtf8Bytes(cafe)).toBe(2);
  });

  it("counts surrogate-pair emoji as two utf-16 units", () => {
    expect(countUtf16Units("😀")).toBe(2);
    expect(countCodePoints("😀")).toBe(1);
  });

  it("counts skin-tone modifiers without collapsing incorrectly", () => {
    const waved = "👋🏻";
    expect(countCodePoints(waved)).toBe(2);
    expect(countForMetric(waved, "grapheme")).toBe(1);
  });

  it("counts flag emoji sequences as one grapheme", () => {
    const flag = "🇯🇵";
    expect(countCodePoints(flag)).toBe(2);
    expect(countForMetric(flag, "grapheme")).toBe(1);
  });

  it("includes variation selectors in code-point totals", () => {
    const vs = "☺️"; // smiling face + VS16
    expect(countCodePoints(vs)).toBe(2);
    expect(countForMetric(vs, "grapheme")).toBe(1);
  });

  it("counts zero-width characters as code points", () => {
    const zwsp = "a\u200Bb";
    expect(countCodePoints(zwsp)).toBe(3);
    expect(countLetters(zwsp)).toBe(2);
  });

  it("reports utf-8 bytes separately from character counts", () => {
    expect(countUtf8Bytes("a")).toBe(1);
    expect(countUtf8Bytes("é")).toBe(2);
    expect(countUtf8Bytes("🙂")).toBe(4);
  });

  it("handles CJK and Devanagari letter counts", () => {
    expect(countLetters("漢字")).toBe(2);
    expect(countLetters("नमस्ते")).toBeGreaterThan(0);
  });

  it("handles Arabic text without throwing", () => {
    const stats = analyzeCharacters("مرحبا");
    expect(stats.codePoints).toBe(5);
    expect(stats.letters).toBe(5);
  });

  it("handles nonbreaking spaces as whitespace", () => {
    expect(countWhitespace("A\u00A0B")).toBe(1);
    expect(analyzeCharacters("A\u00A0B").charactersWithoutSpaces).toBe(2);
  });

  it("handles mixed RTL and LTR without throwing", () => {
    const stats = analyzeCharacters("Hello مرحبا world");
    expect(stats.words).toBeGreaterThanOrEqual(3);
    expect(stats.letters).toBeGreaterThan(10);
  });

  it("computes unicode demos with the shared analyzer", () => {
    for (const demo of UNICODE_DEMOS) {
      const fromHelper = analyzeUnicodeDemo(demo.id);
      const direct = analyzeCharacters(demo.text);
      expect(fromHelper).toEqual(direct);
    }
  });

  it("does not require category totals to equal grapheme count", () => {
    const family = "👨‍👩‍👧‍👦";
    const stats = analyzeCharacters(family);
    const categories =
      stats.letters +
      stats.digits +
      stats.punctuation +
      stats.symbols +
      stats.whitespace;
    expect(stats.graphemes).toBe(1);
    expect(categories).not.toBe(stats.graphemes);
  });
});

describe("grapheme precision policy (no silent code-point substitute)", () => {
  it("keeps grapheme counts exact for large combining-mark pastes", () => {
    const unit = "e\u0301";
    const large = unit.repeat(8_000); // 16_000 UTF-16 units — above any old threshold
    const stats = analyzeCharacters(large);
    expect(stats.graphemesAvailable).toBe(true);
    expect(stats.graphemes).toBe(8_000);
    expect(stats.codePoints).toBe(16_000);
    expect(stats.graphemes).not.toBe(stats.codePoints);
    expect(countForMetric(large, "grapheme")).toBe(8_000);
  });

  it("keeps grapheme limit metric exact for large pasted text", () => {
    const large = "🙂".repeat(5_000);
    const status = computeLimitStatus(large, 5_000, "grapheme");
    expect(status.state).not.toBe("unavailable");
    expect(status.used).toBe(5_000);
    expect(status.remaining).toBe(0);
    expect(status.over).toBe(0);
    // UTF-16 would be 10_000 — proving we did not silently use string length
    expect(countUtf16Units(large)).toBe(10_000);
    expect(status.used).not.toBe(countUtf16Units(large));
  });

  it("surfaces unavailable for grapheme metric when Segmenter is missing", () => {
    const intlMutable = Intl as unknown as { Segmenter?: unknown };
    const original = intlMutable.Segmenter;
    delete intlMutable.Segmenter;
    try {
      const stats = analyzeCharacters("ab");
      expect(stats.graphemesAvailable).toBe(false);
      expect(stats.graphemes).toBeNull();
      expect(stats.codePoints).toBe(2);
      expect(stats.utf16Units).toBe(2);
      expect(countForMetric("ab", "grapheme")).toBeNull();
      const status = computeLimitStatus("ab", 10, "grapheme");
      expect(status.state).toBe("unavailable");
      expect(status.used).toBeNull();
      expect(status.remaining).toBeNull();
    } finally {
      intlMutable.Segmenter = original;
    }
  });
});

describe("selected text", () => {
  it("counts only the highlighted slice", () => {
    const stats = analyzeSelection("Hello World", 0, 5);
    expect(stats?.charactersWithSpaces).toBe(5);
    expect(stats?.words).toBe(1);
    expect(stats?.letters).toBe(5);
  });

  it("returns null when the selection is empty or reversed into nothing", () => {
    expect(analyzeSelection("Hello", 2, 2)).toBeNull();
    expect(analyzeSelection("Hello", 5, 5)).toBeNull();
    expect(analyzeSelection("", 0, 0)).toBeNull();
  });

  it("accepts a backwards range and clamps to the text", () => {
    const stats = analyzeSelection("Hello", 8, 3);
    expect(stats?.charactersWithSpaces).toBe(2);
    expect(stats?.charactersWithoutSpaces).toBe(2);
  });
});

describe("limit checker", () => {
  it("parses and clamps limit input", () => {
    expect(parseLimitInput("160")).toBe(160);
    expect(parseLimitInput("0")).toBeNull();
    expect(parseLimitInput("")).toBeNull();
    expect(parseLimitInput("999999")).toBe(100_000);
  });

  it("reports remaining below the limit", () => {
    const status = computeLimitStatus("hello", 10, "utf16");
    expect(status.used).toBe(5);
    expect(status.remaining).toBe(5);
    expect(status.over).toBe(0);
    expect(status.state).toBe("ok");
  });

  it("reports exact boundary without over", () => {
    const status = computeLimitStatus("abcd", 4, "utf16");
    expect(status.remaining).toBe(0);
    expect(status.over).toBe(0);
    expect(status.state).toBe("near");
  });

  it("reports over-limit without negative remaining", () => {
    const status = computeLimitStatus("abcdefghij", 6, "utf16");
    expect(status.used).toBe(10);
    expect(status.remaining).toBe(0);
    expect(status.over).toBe(4);
    expect(status.state).toBe("over");
  });

  it("switches metrics for the same text", () => {
    const emoji = "👨‍👩‍👧";
    const asGrapheme = computeLimitStatus(emoji, 1, "grapheme");
    const asCodePoint = computeLimitStatus(emoji, 1, "codePoint");
    expect(asGrapheme.used).toBe(1);
    expect(asCodePoint.used).toBeGreaterThan(1);
    expect(asCodePoint.state).toBe("over");
  });

  it("recalculates when metric changes on unicode text", () => {
    const text = "café ✅";
    const g = computeLimitStatus(text, 10, "grapheme");
    const c = computeLimitStatus(text, 10, "codePoint");
    const u = computeLimitStatus(text, 10, "utf16");
    expect(g.used).toBeTruthy();
    expect(c.used).toBeTruthy();
    expect(u.used).toBeTruthy();
    expect(u.used).toBeGreaterThanOrEqual(c.used!);
  });
});

describe("category helpers", () => {
  it("counts punctuation and symbols separately", () => {
    expect(countPunctuation("Hello!")).toBe(1);
    expect(countSymbols("A + B")).toBe(1);
  });
});
