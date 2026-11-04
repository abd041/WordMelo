import { describe, expect, it } from "vitest";
import {
  basePool,
  consonantsFor,
  eligiblePool,
  parseCustomLetters,
  vowelsFor,
} from "./pool";
import { DEFAULT_FILTERS } from "./types";

describe("letter pools", () => {
  it("builds full alphabet, vowels, and consonants", () => {
    expect(basePool("all", [], false)).toHaveLength(26);
    expect(vowelsFor(false)).toEqual(["A", "E", "I", "O", "U"]);
    expect(consonantsFor(false)).toHaveLength(21);
    expect(consonantsFor(false)).toContain("Y");
    expect(vowelsFor(true)).toContain("Y");
    expect(consonantsFor(true)).not.toContain("Y");
    expect(consonantsFor(true)).toHaveLength(20);
  });

  it("parses custom pools and rejects unsupported tokens", () => {
    expect(parseCustomLetters("ABCDE").letters).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
    ]);
    expect(parseCustomLetters("a, e, i").letters).toEqual(["A", "E", "I"]);
    expect(parseCustomLetters("AAABC").letters).toEqual(["A", "B", "C"]);
    const mixed = parseCustomLetters("A 1 B!");
    expect(mixed.letters).toEqual(["A", "B"]);
    expect(mixed.rejected.length).toBeGreaterThan(0);
  });

  it("applies exclusions after the base pool", () => {
    const pool = eligiblePool({
      ...DEFAULT_FILTERS,
      poolMode: "vowels",
      excluded: ["A"],
    });
    expect(pool).toEqual(["E", "I", "O", "U"]);
  });

  it("returns empty when all letters are excluded", () => {
    const pool = eligiblePool({
      ...DEFAULT_FILTERS,
      poolMode: "vowels",
      excluded: ["A", "E", "I", "O", "U"],
    });
    expect(pool).toHaveLength(0);
  });

  it("excludes session-used letters when provided", () => {
    const pool = eligiblePool(DEFAULT_FILTERS, new Set(["A", "B"]));
    expect(pool).toHaveLength(24);
    expect(pool).not.toContain("A");
  });
});
