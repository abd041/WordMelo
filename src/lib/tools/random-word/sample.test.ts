import { describe, expect, it } from "vitest";
import {
  generateWords,
  sampleWithoutReplacement,
  SECURE_RANDOM_MESSAGE,
} from "./sample";
import { createSeededRandomInt, SecureRandomUnavailableError } from "./rng";
import { DEFAULT_FILTERS, POS_NOUN, type VocabEntry } from "./types";

const pool: VocabEntry[] = Array.from({ length: 20 }, (_, i) => ({
  word: `word${String(i).padStart(2, "0")}`,
  pos: POS_NOUN,
  rank: i + 1,
  common: true,
  difficulty: 0 as const,
}));

describe("sampleWithoutReplacement", () => {
  it("returns unique words up to requested count", () => {
    const rng = createSeededRandomInt(42);
    const picked = sampleWithoutReplacement(pool, 10, rng);
    expect(picked).toHaveLength(10);
    expect(new Set(picked.map((p) => p.word)).size).toBe(10);
  });

  it("caps at pool size", () => {
    const rng = createSeededRandomInt(7);
    const picked = sampleWithoutReplacement(pool.slice(0, 3), 10, rng);
    expect(picked).toHaveLength(3);
  });

  it("handles empty and single-item pools", () => {
    expect(sampleWithoutReplacement([], 5, createSeededRandomInt(1))).toEqual([]);
    const one = sampleWithoutReplacement(pool.slice(0, 1), 5, createSeededRandomInt(2));
    expect(one).toHaveLength(1);
    expect(one[0]?.word).toBe("word00");
  });

  it("is deterministic with a seeded RNG", () => {
    const a = sampleWithoutReplacement(pool, 5, createSeededRandomInt(99)).map(
      (e) => e.word,
    );
    const b = sampleWithoutReplacement(pool, 5, createSeededRandomInt(99)).map(
      (e) => e.word,
    );
    expect(a).toEqual(b);
  });
});

describe("generateWords", () => {
  it("returns the requested unique count", () => {
    const result = generateWords(
      pool,
      { ...DEFAULT_FILTERS, count: 8, vocabulary: "all", difficulty: "all" },
      { randomInt: createSeededRandomInt(11) },
    );
    expect(result.words).toHaveLength(8);
    expect(new Set(result.words).size).toBe(8);
    expect(result.exhausted).toBe(false);
  });

  it("reports exhaustion when pool is smaller than requested", () => {
    const result = generateWords(
      pool.slice(0, 3),
      { ...DEFAULT_FILTERS, count: 10, vocabulary: "all", difficulty: "all" },
      { randomInt: createSeededRandomInt(3) },
    );
    expect(result.words).toHaveLength(3);
    expect(result.exhausted).toBe(true);
    expect(result.message).toMatch(/Only 3/);
  });

  it("respects no-repeat across rounds via usedWords", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      count: 5,
      vocabulary: "all" as const,
      difficulty: "all" as const,
      noRepeat: true,
    };
    const first = generateWords(pool, filters, {
      randomInt: createSeededRandomInt(5),
    });
    const second = generateWords(pool, filters, {
      usedWords: new Set(first.words),
      randomInt: createSeededRandomInt(6),
    });
    for (const w of second.words) {
      expect(first.words).not.toContain(w);
    }
  });

  it("returns empty-state message for impossible filters", () => {
    const result = generateWords(pool, {
      ...DEFAULT_FILTERS,
      startsWith: "z",
      vocabulary: "all",
      difficulty: "all",
    });
    expect(result.words).toEqual([]);
    expect(result.exhausted).toBe(true);
    expect(result.message).toMatch(/No words match/);
  });

  it("does not fall back to Math.random when secure random is missing", () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: undefined,
    });
    try {
      const result = generateWords(pool, {
        ...DEFAULT_FILTERS,
        count: 2,
        vocabulary: "all",
        difficulty: "all",
      });
      expect(result.words).toEqual([]);
      expect(result.message).toBe(SECURE_RANDOM_MESSAGE);
      expect(() =>
        sampleWithoutReplacement(pool, 2),
      ).toThrow(SecureRandomUnavailableError);
    } finally {
      if (descriptor) Object.defineProperty(globalThis, "crypto", descriptor);
    }
  });
});
