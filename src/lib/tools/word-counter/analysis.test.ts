import { describe, expect, it } from "vitest";
import {
  averageCharactersPerWord,
  averageWordsPerSentence,
} from "./count";
import {
  WORD_COUNTER_AUTOSAVE_KEY,
  WORD_COUNTER_DRAFT_KEY,
  clearStoredDraft,
  loadDraftPreference,
  persistDraft,
} from "./draft";
import { wordGoalProgress } from "./goal";
import { analyzeKeywords, keywordDensityPercent } from "./keywords";
import { estimateSyllables, scoreReadability } from "./readability";

describe("averages", () => {
  it("returns null instead of dividing by zero", () => {
    expect(averageWordsPerSentence(0, 0)).toBeNull();
    expect(averageWordsPerSentence(10, 0)).toBeNull();
    expect(averageCharactersPerWord(10, 0)).toBeNull();
  });

  it("rounds to one decimal", () => {
    expect(averageWordsPerSentence(10, 3)).toBe(3.3);
    expect(averageCharactersPerWord(11, 2)).toBe(5.5);
  });
});

describe("word goal", () => {
  it("reports remaining words and percent", () => {
    const progress = wordGoalProgress(742, 1000);
    expect(progress).toMatchObject({
      percent: 74.2,
      remaining: 258,
      excess: 0,
      status: "in-progress",
    });
    expect(progress?.barPercent).toBeCloseTo(74.2);
  });

  it("caps the bar and reports excess past the goal", () => {
    const progress = wordGoalProgress(1200, 1000);
    expect(progress?.barPercent).toBe(100);
    expect(progress?.excess).toBe(200);
    expect(progress?.percent).toBe(120);
    expect(progress?.status).toBe("over");
  });

  it("rejects a non-positive target", () => {
    expect(wordGoalProgress(10, 0)).toBeNull();
    expect(wordGoalProgress(10, Number.NaN)).toBeNull();
  });
});

describe("keyword density", () => {
  it("calculates share of all words and avoids NaN", () => {
    expect(keywordDensityPercent(0, 0)).toBeNull();
    const analysis = analyzeKeywords(["Writing", "and", "writing", "content"], {
      phraseSize: 1,
      limit: 10,
      excludeStopWords: true,
    });
    expect(analysis.denominator).toBe(4);
    expect(analysis.rows[0]).toMatchObject({ keyword: "writing", count: 2, density: 50 });
    expect(analysis.rows.some((row) => row.keyword === "and")).toBe(false);
  });

  it("counts two-word phrases from the original sequence", () => {
    const analysis = analyzeKeywords(["content", "writing", "content", "writing"], {
      phraseSize: 2,
      limit: 10,
      excludeStopWords: false,
    });
    expect(analysis.denominator).toBe(3);
    expect(analysis.rows[0]).toMatchObject({
      keyword: "content writing",
      count: 2,
    });
  });

  it("returns no rows for an empty draft", () => {
    expect(analyzeKeywords([]).rows).toEqual([]);
  });
});

describe("readability", () => {
  it("estimates common syllable counts", () => {
    expect(estimateSyllables("cat")).toBe(1);
    expect(estimateSyllables("apple")).toBe(2);
    expect(estimateSyllables("beautiful")).toBe(3);
    expect(estimateSyllables("2024")).toBe(1);
  });

  it("uses the Flesch formulas for a short English sentence", () => {
    const result = scoreReadability({
      text: "Cats sit.",
      words: ["Cats", "sit"],
      sentences: 1,
    });
    expect(result.available).toBe(true);
    expect(result.fleschEase).toBe(120.2);
    expect(result.syllables).toBe(2);
    expect(result.label).toBe("Easier to read");
    expect(Number.isFinite(result.fleschGrade)).toBe(true);
  });

  it("hides scores for mostly non-Latin text", () => {
    const result = scoreReadability({
      text: "مرحبا بالعالم",
      words: ["مرحبا", "بالعالم"],
      sentences: 1,
    });
    expect(result.available).toBe(false);
    expect(result.fleschEase).toBeNull();
  });
});

describe("draft storage", () => {
  it("loads a draft only when autosave was enabled", () => {
    const storage = memoryStorage({
      [WORD_COUNTER_AUTOSAVE_KEY]: "1",
      [WORD_COUNTER_DRAFT_KEY]: "saved draft",
    });
    expect(loadDraftPreference(storage)).toEqual({
      enabled: true,
      draft: "saved draft",
      error: false,
    });
  });

  it("does not read a leftover draft when autosave is off", () => {
    const storage = memoryStorage({
      [WORD_COUNTER_DRAFT_KEY]: "saved draft",
    });
    expect(loadDraftPreference(storage).draft).toBeNull();
  });

  it("reports storage failures without throwing", () => {
    const broken: Parameters<typeof persistDraft>[0] = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
      removeItem() {
        throw new Error("blocked");
      },
    };
    expect(loadDraftPreference(broken).error).toBe(true);
    expect(persistDraft(broken, "text")).toBe("error");
    expect(clearStoredDraft(broken)).toBe("error");
  });

  it("clears both keys", () => {
    const storage = memoryStorage({});
    expect(persistDraft(storage, "hello")).toBe("saved");
    expect(clearStoredDraft(storage)).toBe("cleared");
    expect(storage.getItem(WORD_COUNTER_DRAFT_KEY)).toBeNull();
    expect(storage.getItem(WORD_COUNTER_AUTOSAVE_KEY)).toBeNull();
  });
});

function memoryStorage(initial: Record<string, string>) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
  };
}
