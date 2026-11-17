import { describe, expect, it } from "vitest";
import { drawPromptList, formatPromptList } from "./bulk";
import { PICTIONARY_PROMPTS } from "./prompts";
import { createSeededRandomInt } from "./rng";
import { DEFAULT_FILTERS } from "./types";

describe("pictionary word lists", () => {
  it("builds a unique list for each supported size", () => {
    for (const size of [5, 10, 25, 50, 100]) {
      const result = drawPromptList(
        PICTIONARY_PROMPTS,
        DEFAULT_FILTERS,
        size,
        createSeededRandomInt(size),
      );
      expect(result.prompts).toHaveLength(size);
      expect(result.limited).toBe(false);
      expect(new Set(result.prompts.map((prompt) => prompt.id)).size).toBe(size);
    }
  });

  it("respects difficulty and category filters", () => {
    const result = drawPromptList(
      PICTIONARY_PROMPTS,
      { difficulty: "easy", categories: ["vehicles"], noRepeat: true },
      10,
      createSeededRandomInt(2),
    );
    expect(result.prompts.length).toBeGreaterThan(0);
    expect(result.prompts.every((prompt) => prompt.difficulty === "easy")).toBe(true);
    expect(result.prompts.every((prompt) => prompt.category === "vehicles")).toBe(true);
  });

  it("explains when fewer unique prompts exist than requested", () => {
    const result = drawPromptList(
      PICTIONARY_PROMPTS,
      { difficulty: "hard", categories: ["shapes-patterns"], noRepeat: true },
      50,
      createSeededRandomInt(9),
    );
    expect(result.limited).toBe(true);
    expect(result.prompts.length).toBe(result.available);
    expect(result.prompts.length).toBeLessThan(50);
    expect(result.message).toMatch(/instead of 50/);
    expect(new Set(result.prompts.map((prompt) => prompt.text.toLowerCase())).size).toBe(
      result.prompts.length,
    );
  });

  it("returns an empty list with guidance when nothing matches", () => {
    const result = drawPromptList(
      [],
      DEFAULT_FILTERS,
      10,
      createSeededRandomInt(1),
    );
    expect(result.prompts).toEqual([]);
    expect(result.message).toMatch(/No prompts match/);
  });

  it("formats a numbered copy and download list", () => {
    const result = drawPromptList(
      PICTIONARY_PROMPTS,
      { difficulty: "easy", categories: ["household"], noRepeat: false },
      2,
      createSeededRandomInt(4),
    );
    const text = formatPromptList(result.prompts);
    const lines = text.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^1\. .+ — Easy — Kitchen & household$/);
    expect(lines[1]).toMatch(/^2\. /);
    expect(text).not.toMatch(/undefined|null/);
  });
});
