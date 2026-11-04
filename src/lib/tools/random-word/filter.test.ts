import { describe, expect, it } from "vitest";
import {
  clampCount,
  filterVocabulary,
  matchesFilters,
  normalizeLetter,
  validateLengthFilters,
} from "./filter";
import { DEFAULT_FILTERS, POS_ADJECTIVE, POS_NOUN, POS_VERB, type VocabEntry } from "./types";

const sample: VocabEntry[] = [
  { word: "apple", pos: POS_NOUN, rank: 100, common: true, difficulty: 0 },
  { word: "brave", pos: POS_ADJECTIVE, rank: 800, common: true, difficulty: 0 },
  { word: "create", pos: POS_VERB, rank: 200, common: true, difficulty: 0 },
  { word: "happy", pos: POS_ADJECTIVE, rank: 300, common: true, difficulty: 0 },
  { word: "river", pos: POS_NOUN, rank: 900, common: true, difficulty: 1 },
  { word: "sparkle", pos: POS_VERB | POS_NOUN, rank: 0, common: false, difficulty: 2 },
  { word: "xylophone", pos: POS_NOUN, rank: 0, common: false, difficulty: 2 },
];

describe("normalizeLetter / clampCount", () => {
  it("normalizes single letters", () => {
    expect(normalizeLetter("B")).toBe("b");
    expect(normalizeLetter("  y ")).toBe("y");
    expect(normalizeLetter("ab")).toBe("");
    expect(normalizeLetter("1")).toBe("");
  });

  it("clamps word counts", () => {
    expect(clampCount(5)).toBe(5);
    expect(clampCount(0)).toBe(1);
    expect(clampCount(101)).toBe(100);
    expect(clampCount(3.9)).toBe(3);
    expect(clampCount(Number.NaN)).toBe(5);
  });
});

describe("validateLengthFilters", () => {
  it("rejects inverted ranges", () => {
    expect(
      validateLengthFilters({
        ...DEFAULT_FILTERS,
        lengthMode: "range",
        minLength: 8,
        maxLength: 3,
      }),
    ).toMatch(/Minimum length/);
  });

  it("accepts valid exact length", () => {
    expect(
      validateLengthFilters({
        ...DEFAULT_FILTERS,
        lengthMode: "exact",
        exactLength: 5,
      }),
    ).toBeNull();
  });
});

describe("matchesFilters / filterVocabulary", () => {
  it("filters exact length", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      lengthMode: "exact" as const,
      exactLength: 5,
      vocabulary: "all" as const,
      difficulty: "all" as const,
    };
    const words = filterVocabulary(sample, filters).map((e) => e.word);
    expect(words).toEqual(["apple", "brave", "happy", "river"]);
  });

  it("filters length range", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      lengthMode: "range" as const,
      minLength: 6,
      maxLength: 7,
      vocabulary: "all" as const,
      difficulty: "all" as const,
    };
    expect(filterVocabulary(sample, filters).map((e) => e.word)).toEqual([
      "create",
      "sparkle",
    ]);
  });

  it("filters starts with / ends with", () => {
    expect(
      matchesFilters(sample[0]!, {
        ...DEFAULT_FILTERS,
        startsWith: "A",
        vocabulary: "all",
        difficulty: "all",
      }),
    ).toBe(true);
    expect(
      matchesFilters(sample[4]!, {
        ...DEFAULT_FILTERS,
        endsWith: "r",
        vocabulary: "all",
        difficulty: "all",
      }),
    ).toBe(true);
    expect(
      matchesFilters(sample[0]!, {
        ...DEFAULT_FILTERS,
        startsWith: "z",
        vocabulary: "all",
        difficulty: "all",
      }),
    ).toBe(false);
  });

  it("filters nouns, verbs, adjectives", () => {
    expect(
      filterVocabulary(sample, {
        ...DEFAULT_FILTERS,
        wordType: "noun",
        vocabulary: "all",
        difficulty: "all",
      }).map((e) => e.word),
    ).toEqual(["apple", "river", "sparkle", "xylophone"]);
    expect(
      filterVocabulary(sample, {
        ...DEFAULT_FILTERS,
        wordType: "verb",
        vocabulary: "all",
        difficulty: "all",
      }).map((e) => e.word),
    ).toEqual(["create", "sparkle"]);
    expect(
      filterVocabulary(sample, {
        ...DEFAULT_FILTERS,
        wordType: "adjective",
        vocabulary: "all",
        difficulty: "all",
      }).map((e) => e.word),
    ).toEqual(["brave", "happy"]);
  });

  it("filters difficulty and common/extended", () => {
    expect(
      filterVocabulary(sample, {
        ...DEFAULT_FILTERS,
        difficulty: "easy",
        vocabulary: "all",
      }).map((e) => e.word),
    ).toEqual(["apple", "brave", "create", "happy"]);
    expect(
      filterVocabulary(sample, {
        ...DEFAULT_FILTERS,
        vocabulary: "extended",
        difficulty: "all",
      }).map((e) => e.word),
    ).toEqual(["sparkle", "xylophone"]);
  });

  it("combines filters and supports empty pools", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      wordType: "noun" as const,
      lengthMode: "exact" as const,
      exactLength: 5,
      startsWith: "x",
      vocabulary: "all" as const,
      difficulty: "all" as const,
    };
    expect(filterVocabulary(sample, filters)).toEqual([]);
  });

  it("excludes used words when provided", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      vocabulary: "all" as const,
      difficulty: "all" as const,
    };
    const pool = filterVocabulary(sample, filters, new Set(["apple", "brave"]));
    expect(pool.map((e) => e.word)).not.toContain("apple");
    expect(pool.map((e) => e.word)).not.toContain("brave");
  });
});
