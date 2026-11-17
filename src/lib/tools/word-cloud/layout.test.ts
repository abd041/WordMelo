import { describe, expect, it } from "vitest";
import { analyzeText } from "./analyze";
import { DEFAULT_SETTINGS } from "./defaults";
import {
  boxesOverlap,
  collisionBoxFor,
  fontSizeFor,
  layoutFromSettings,
  layoutWords,
} from "./layout";
import { SAMPLE_TEXT } from "./sample";
import { wordFitsShape } from "./shapes";
import type { RankedWord } from "./types";

function words(text: string): RankedWord[] {
  return analyzeText(text, {
    ignoreCase: true,
    excludeCommon: true,
    minLength: 3,
    minFrequency: 1,
    maxWords: 40,
    excludedWords: "",
    highlightedWords: "",
  }).words;
}

function expectClean(result: ReturnType<typeof layoutWords>, spacing: number, shape: typeof DEFAULT_SETTINGS.shape) {
  for (const word of result.words) {
    expect(
      wordFitsShape(
        shape,
        word.x,
        word.y,
        word.width,
        word.height,
        word.rotation,
        result.width,
        result.height,
      ),
    ).toBe(true);
  }
  for (let i = 0; i < result.words.length; i += 1) {
    for (let j = i + 1; j < result.words.length; j += 1) {
      const a = collisionBoxFor(result.words[i]!, spacing);
      const b = collisionBoxFor(result.words[j]!, spacing);
      expect(boxesOverlap(a, b)).toBe(false);
    }
  }
}

describe("word cloud layout", () => {
  it("gives more frequent words a larger size", () => {
    expect(fontSizeFor(10, 1, 10, 16, 72)).toBeGreaterThan(fontSizeFor(1, 1, 10, 16, 72));
    expect(fontSizeFor(4, 4, 4, 16, 72)).toBe(16);
  });

  it("places short words inside a rectangle without overlap", () => {
    const ranked = words(
      "alpha alpha alpha beta beta gamma delta echo foxtrot hotel india juliet kilo lima mike november oscar",
    );
    const result = layoutFromSettings(
      ranked,
      { ...DEFAULT_SETTINGS, shape: "rectangle", aspect: "square", rotation: "horizontal" },
      7,
    );
    expect(result.words.length).toBe(ranked.length);
    expect(result.omitted).toEqual([]);
    expect(result.words[0]!.fontSize).toBeGreaterThanOrEqual(result.words.at(-1)!.fontSize);
    expectClean(result, DEFAULT_SETTINGS.spacing, "rectangle");
  });

  it("keeps words inside circle, heart, diamond, and oval masks", () => {
    const ranked = words("clarity clarity clarity rhythm rhythm evidence workshop headline");
    for (const shape of ["circle", "heart", "diamond", "oval"] as const) {
      const result = layoutFromSettings(
        ranked,
        { ...DEFAULT_SETTINGS, shape, rotation: "horizontal" },
        3,
      );
      expect(result.words.length).toBeGreaterThan(0);
      expectClean(result, DEFAULT_SETTINGS.spacing, shape);
    }
  });

  it("repeats a layout for the same seed and changes it for another seed", () => {
    const ranked = words(SAMPLE_TEXT);
    const settings = { ...DEFAULT_SETTINGS, shape: "circle" as const };
    const first = layoutFromSettings(ranked, settings, 11);
    const second = layoutFromSettings(ranked, settings, 11);
    const third = layoutFromSettings(ranked, settings, 12);
    expect(first.words.map((word) => [word.text, word.x, word.y, word.rotation])).toEqual(
      second.words.map((word) => [word.text, word.x, word.y, word.rotation]),
    );
    expect(first.words.map((word) => [word.x, word.y])).not.toEqual(
      third.words.map((word) => [word.x, word.y]),
    );
  });

  it("handles empty input and a very long word", () => {
    expect(layoutFromSettings([], DEFAULT_SETTINGS, 1).words).toEqual([]);
    const long = "supercalifragilisticexpialidocious".repeat(3);
    const result = layoutFromSettings(
      [{ text: long, count: 4, highlighted: false }],
      { ...DEFAULT_SETTINGS, shape: "circle", minFont: 12, maxFont: 80 },
      1,
    );
    expect(result.words.length + result.omitted.length).toBe(1);
    if (result.words[0]) {
      expect(result.words[0].fontSize).toBeLessThan(80);
      expectClean(result, DEFAULT_SETTINGS.spacing, "circle");
    } else {
      expect(result.omitted[0]?.text).toBe(long);
    }
  });

  it("reports words that cannot fit a tiny font range in a tight shape", () => {
    const ranked = Array.from({ length: 30 }, (_, index) => ({
      text: `word${index}`,
      count: 30 - index,
      highlighted: false,
    }));
    const result = layoutWords(ranked, {
      shape: "diamond",
      width: 220,
      height: 220,
      font: "sans",
      minFont: 28,
      maxFont: 64,
      fontWeight: 700,
      rotation: "horizontal",
      spacing: 10,
      align: "center",
      seed: 2,
    });
    expect(result.omitted.length).toBeGreaterThan(0);
    expect(result.words.length).toBeGreaterThan(0);
    expectClean(result, 10, "diamond");
  });
});
