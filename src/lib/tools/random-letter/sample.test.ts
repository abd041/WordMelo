import { describe, expect, it } from "vitest";
import { createSeededRandomInt, SecureRandomUnavailableError } from "./rng";
import {
  applyCase,
  clampCount,
  drawMany,
  drawOne,
  fisherYatesShuffle,
  runSecureDraw,
  SECURE_RANDOM_MESSAGE,
  shuffleAlphabet,
} from "./sample";
import { DEFAULT_FILTERS, DEFAULT_MULTIPLE } from "./types";

describe("random letter sampling", () => {
  it("clamps batch counts", () => {
    expect(clampCount(0)).toBe(1);
    expect(clampCount(50)).toBe(50);
    expect(clampCount(500)).toBe(100);
  });

  it("applies case modes deterministically with seeded RNG", () => {
    const rng = createSeededRandomInt(7);
    expect(applyCase("M", "upper", rng)).toBe("M");
    expect(applyCase("M", "lower", rng)).toBe("m");
    const mixed = Array.from({ length: 20 }, () =>
      applyCase("M", "mixed", createSeededRandomInt(42)),
    );
    // Same seed each call resets — use advancing seed
    const advancing = createSeededRandomInt(99);
    const both = new Set(
      Array.from({ length: 40 }, () => applyCase("Z", "mixed", advancing)),
    );
    expect(both.has("Z") || both.has("z")).toBe(true);
    expect(mixed.every((c) => c === "M" || c === "m")).toBe(true);
  });

  it("draws one letter from the pool with a seeded source", () => {
    const result = drawOne(DEFAULT_FILTERS, {
      randomInt: createSeededRandomInt(1),
    });
    expect(result.letters).toHaveLength(1);
    expect(result.bases[0]).toMatch(/^[A-Z]$/);
    expect(result.letters[0]!.toUpperCase()).toBe(result.bases[0]);
  });

  it("rejects unique batches larger than the pool", () => {
    const result = drawMany(
      DEFAULT_FILTERS,
      { ...DEFAULT_MULTIPLE, count: 30, uniqueInBatch: true },
      { randomInt: createSeededRandomInt(2) },
    );
    expect(result.letters).toHaveLength(0);
    expect(result.message).toMatch(/Only 26 unique/i);
  });

  it("generates unique letters within a batch", () => {
    const result = drawMany(
      DEFAULT_FILTERS,
      { ...DEFAULT_MULTIPLE, count: 10, uniqueInBatch: true },
      { randomInt: createSeededRandomInt(3) },
    );
    expect(result.bases).toHaveLength(10);
    expect(new Set(result.bases).size).toBe(10);
  });

  it("allows repeats when uniqueInBatch is false", () => {
    const result = drawMany(
      { ...DEFAULT_FILTERS, poolMode: "vowels" },
      { ...DEFAULT_MULTIPLE, count: 20, uniqueInBatch: false },
      { randomInt: createSeededRandomInt(4) },
    );
    expect(result.letters).toHaveLength(20);
  });

  it("shuffles the full alphabet without duplicates", () => {
    const result = shuffleAlphabet(DEFAULT_FILTERS, {
      randomInt: createSeededRandomInt(5),
    });
    expect(result.bases).toHaveLength(26);
    expect(new Set(result.bases).size).toBe(26);
    expect([...result.bases].sort().join("")).toBe(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    );
  });

  it("fisher–yates permutes with a seeded source", () => {
    const a = fisherYatesShuffle(
      ["A", "B", "C", "D"],
      createSeededRandomInt(11),
    );
    const b = fisherYatesShuffle(
      ["A", "B", "C", "D"],
      createSeededRandomInt(11),
    );
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(["A", "B", "C", "D"]);
  });

  it("respects no-repeat session used letters", () => {
    const used = new Set(["A", "E", "I", "O"]);
    const result = drawOne(
      { ...DEFAULT_FILTERS, poolMode: "vowels", noRepeatSession: true },
      { usedBase: used, randomInt: createSeededRandomInt(8) },
    );
    expect(result.bases).toEqual(["U"]);
  });

  it("reports exhaustion when the session pool is empty", () => {
    const used = new Set(["A", "E", "I", "O", "U"]);
    const result = drawOne(
      { ...DEFAULT_FILTERS, poolMode: "vowels", noRepeatSession: true },
      { usedBase: used, randomInt: createSeededRandomInt(9) },
    );
    expect(result.exhausted).toBe(true);
    expect(result.letters).toHaveLength(0);
  });

  it("draws from a single-letter pool without hanging", () => {
    const result = drawOne(
      {
        ...DEFAULT_FILTERS,
        poolMode: "custom",
        customLetters: ["Q"],
      },
      { randomInt: createSeededRandomInt(12) },
    );
    expect(result.bases).toEqual(["Q"]);
  });

  it("treats mixed case as display-only for uniqueness", () => {
    const result = drawMany(
      { ...DEFAULT_FILTERS, caseMode: "mixed" },
      { ...DEFAULT_MULTIPLE, count: 26, uniqueInBatch: true },
      { randomInt: createSeededRandomInt(13) },
    );
    expect(result.bases).toHaveLength(26);
    expect(new Set(result.bases).size).toBe(26);
  });

  it("refuses to draw when a secure random source is missing", () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: undefined,
    });
    try {
      const result = runSecureDraw(() => drawOne(DEFAULT_FILTERS));
      expect(result.letters).toEqual([]);
      expect(result.message).toBe(SECURE_RANDOM_MESSAGE);
      expect(() => drawOne(DEFAULT_FILTERS)).toThrow(SecureRandomUnavailableError);
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, "crypto", descriptor);
      }
    }
  });
});
