import { describe, expect, it } from "vitest";
import { applyPreset, WORD_PRESETS } from "./presets";
import { DEFAULT_FILTERS } from "./types";

describe("WORD_PRESETS", () => {
  it("applies visible real filter values", () => {
    expect(WORD_PRESETS.length).toBe(5);
    const five = applyPreset("five-letter", DEFAULT_FILTERS);
    expect(five.lengthMode).toBe("exact");
    expect(five.exactLength).toBe(5);
    const easy = applyPreset("easy-words", DEFAULT_FILTERS);
    expect(easy.difficulty).toBe("easy");
    const games = applyPreset("word-games", DEFAULT_FILTERS);
    expect(games.wordType).toBe("noun");
    const vocab = applyPreset("vocabulary-practice", DEFAULT_FILTERS);
    expect(vocab.vocabulary).toBe("common");
    expect(vocab.difficulty).toBe("medium");
  });

  it("does not publish songwriting or music product presets", () => {
    const ids = WORD_PRESETS.map((p) => p.id);
    const labels = WORD_PRESETS.map((p) => p.label.toLowerCase());
    const descriptions = WORD_PRESETS.map((p) => p.description.toLowerCase()).join(" ");
    expect(ids).not.toContain("songwriting");
    expect(labels.some((l) => l.includes("song"))).toBe(false);
    expect(descriptions).not.toMatch(/song|lyric|music|rhyme/);
    expect(ids).toContain("vocabulary-practice");
  });
});
