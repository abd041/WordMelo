import { describe, expect, it } from "vitest";
import { assertDatasetPolicy, violatesContentPolicy } from "./policy";
import { PICTIONARY_PROMPTS } from "./prompts";
import { PROMPT_STATS } from "./stats";
import { PROMPT_CATEGORIES } from "./categories";
import { drawPrompt, filterPrompts } from "./sample";
import { createSeededRandomInt } from "./rng";
import { DEFAULT_FILTERS } from "./types";

describe("pictionary content policy", () => {
  it("flags prohibited subjects", () => {
    expect(violatesContentPolicy("happy dog")).toBeTruthy();
    expect(violatesContentPolicy("guitar solo")).toBeTruthy();
    expect(violatesContentPolicy("casino chip")).toBeTruthy();
    expect(violatesContentPolicy("Apple")).toBeNull();
    expect(violatesContentPolicy("Suspension bridge")).toBeNull();
  });

  it("validates the curated dataset against the policy", () => {
    const result = assertDatasetPolicy(PICTIONARY_PROMPTS);
    expect(result.ok).toBe(true);
  });

  it("has substantial curated prompts with unique ids", () => {
    expect(PICTIONARY_PROMPTS.length).toBeGreaterThanOrEqual(300);
    expect(PICTIONARY_PROMPTS.length).toBe(PROMPT_STATS.total);
    const ids = new Set(PICTIONARY_PROMPTS.map((p) => p.id));
    expect(ids.size).toBe(PICTIONARY_PROMPTS.length);
    const texts = new Set(PICTIONARY_PROMPTS.map((p) => p.text.toLowerCase()));
    expect(texts.size).toBe(PICTIONARY_PROMPTS.length);
  });

  it("contains documented example prompts used on the SEO page", () => {
    const texts = new Set(PICTIONARY_PROMPTS.map((p) => p.text.toLowerCase()));
    for (const sample of [
      "apple",
      "house",
      "laptop",
      "mountain",
      "bell pepper",
      "lighthouse",
      "projector",
      "waterfall",
      "romanesco broccoli",
      "suspension bridge",
      "solar panel system",
      "terraced rice fields",
    ]) {
      expect(texts.has(sample)).toBe(true);
    }
  });

  it("normalizes whitespace and rejects empty prompts", () => {
    for (const prompt of PICTIONARY_PROMPTS) {
      expect(prompt.text.trim()).toBe(prompt.text);
      expect(prompt.text.length).toBeGreaterThan(1);
      expect(["easy", "medium", "hard"]).toContain(prompt.difficulty);
    }
  });

  it("covers every declared category with derived counts", () => {
    let easy = 0;
    let medium = 0;
    let hard = 0;
    for (const cat of PROMPT_CATEGORIES) {
      const tally = PROMPT_STATS.byCategory[cat.id];
      const prompts = PICTIONARY_PROMPTS.filter((prompt) => prompt.category === cat.id);
      expect(prompts.length).toBeGreaterThan(0);
      expect(tally.total).toBe(prompts.length);
      expect(tally.easy + tally.medium + tally.hard).toBe(tally.total);
      easy += tally.easy;
      medium += tally.medium;
      hard += tally.hard;
    }
    expect(easy).toBe(PROMPT_STATS.easy);
    expect(medium).toBe(PROMPT_STATS.medium);
    expect(hard).toBe(PROMPT_STATS.hard);
    expect(PROMPT_STATS.easy + PROMPT_STATS.medium + PROMPT_STATS.hard).toBe(PROMPT_STATS.total);
  });

  it("does not keep unclear or animal-reef prompts that were rewritten", () => {
    const texts = PICTIONARY_PROMPTS.map((prompt) => prompt.text.toLowerCase());
    expect(texts).not.toContain("coral reef");
    expect(texts).not.toContain("barrier reef");
    expect(texts).not.toContain("suspension of mist over canyon");
    expect(texts).toContain("mist over a canyon");
    expect(texts).toContain("sea stack");
  });
});

describe("pictionary sampling", () => {
  it("respects difficulty and category filters", () => {
    const pool = filterPrompts(PICTIONARY_PROMPTS, {
      ...DEFAULT_FILTERS,
      difficulty: "easy",
      categories: ["fruits-vegetables"],
    });
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((p) => p.difficulty === "easy")).toBe(true);
    expect(pool.every((p) => p.category === "fruits-vegetables")).toBe(true);
  });

  it("draws without repeats across a session", () => {
    const filters = {
      ...DEFAULT_FILTERS,
      difficulty: "easy" as const,
      categories: ["shapes-patterns" as const],
      noRepeat: true,
    };
    const used = new Set<string>();
    const first = drawPrompt(PICTIONARY_PROMPTS, filters, {
      randomInt: createSeededRandomInt(3),
    });
    expect(first.prompt).not.toBeNull();
    used.add(first.prompt!.id);
    const second = drawPrompt(PICTIONARY_PROMPTS, filters, {
      usedIds: used,
      randomInt: createSeededRandomInt(4),
    });
    expect(second.prompt).not.toBeNull();
    expect(second.prompt!.id).not.toBe(first.prompt!.id);
  });

  it("reports exhaustion when the pool is used up", () => {
    const pool = filterPrompts(PICTIONARY_PROMPTS, {
      ...DEFAULT_FILTERS,
      difficulty: "hard",
      categories: ["shapes-patterns"],
    });
    const used = new Set(pool.map((p) => p.id));
    const result = drawPrompt(
      PICTIONARY_PROMPTS,
      {
        ...DEFAULT_FILTERS,
        difficulty: "hard",
        categories: ["shapes-patterns"],
        noRepeat: true,
      },
      { usedIds: used, randomInt: createSeededRandomInt(1) },
    );
    expect(result.prompt).toBeNull();
    expect(result.exhausted).toBe(true);
  });

  it("never returns prompts outside selected filters", () => {
    for (let i = 0; i < 20; i++) {
      const result = drawPrompt(
        PICTIONARY_PROMPTS,
        {
          difficulty: "medium",
          categories: ["vehicles"],
          noRepeat: false,
        },
        { randomInt: createSeededRandomInt(100 + i) },
      );
      expect(result.prompt?.difficulty).toBe("medium");
      expect(result.prompt?.category).toBe("vehicles");
    }
  });
});
