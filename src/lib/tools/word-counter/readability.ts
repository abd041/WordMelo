export interface ReadabilityResult {
  available: boolean;
  reason: string | null;
  fleschEase: number | null;
  fleschGrade: number | null;
  averageSentenceLength: number | null;
  averageWordLength: number | null;
  syllables: number | null;
  label: string | null;
}

const UNAVAILABLE: ReadabilityResult = {
  available: false,
  reason: null,
  fleschEase: null,
  fleschGrade: null,
  averageSentenceLength: null,
  averageWordLength: null,
  syllables: null,
  label: null,
};

/**
 * English syllable estimate. This is a spelling heuristic, not a dictionary.
 * Silent final "e" is dropped, then vowel groups are counted. Digit-only
 * tokens count as one syllable so numbers do not zero out the average.
 */
export function estimateSyllables(word: string): number {
  if (/\d/.test(word) && !/[a-z]/i.test(word)) return 1;

  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  let working = cleaned.replace(/e$/, "");
  if (cleaned.endsWith("le") && cleaned.length > 2 && !/[aeiouy]/.test(cleaned.charAt(cleaned.length - 3))) {
    working = cleaned.slice(0, -2);
  }

  const groups = working.match(/[aeiouy]+/g);
  const count = groups?.length ?? 0;
  const extra =
    cleaned.endsWith("le") &&
    cleaned.length > 2 &&
    !/[aeiouy]/.test(cleaned.charAt(cleaned.length - 3))
      ? 1
      : 0;

  return Math.max(1, count + extra);
}

export function readingEaseLabel(score: number): string {
  if (score >= 70) return "Easier to read";
  if (score >= 50) return "Moderate reading difficulty";
  return "More complex text";
}

function isMostlyLatin(text: string): boolean {
  const letters = text.match(/\p{L}/gu);
  if (!letters || letters.length === 0) return false;
  const latin = letters.filter((letter) => /\p{Script=Latin}/u.test(letter)).length;
  return latin / letters.length >= 0.9;
}

export function scoreReadability(input: {
  text: string;
  words: string[];
  sentences: number;
}): ReadabilityResult {
  const { text, words, sentences } = input;

  if (!text.trim() || words.length === 0 || sentences <= 0) {
    return {
      ...UNAVAILABLE,
      reason: "Add at least one sentence to estimate readability.",
    };
  }

  if (!isMostlyLatin(text)) {
    return {
      ...UNAVAILABLE,
      reason:
        "These formulas are for English. Scores are hidden when the text is mostly another script.",
    };
  }

  const syllables = words.reduce((sum, word) => sum + estimateSyllables(word), 0);
  if (syllables <= 0) {
    return {
      ...UNAVAILABLE,
      reason: "Not enough English words to estimate syllables.",
    };
  }

  const wordsPerSentence = words.length / sentences;
  const syllablesPerWord = syllables / words.length;
  const fleschEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const fleschGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  if (!Number.isFinite(fleschEase) || !Number.isFinite(fleschGrade)) {
    return {
      ...UNAVAILABLE,
      reason: "Readability could not be calculated for this text.",
    };
  }

  const characterLength = words.reduce((sum, word) => sum + word.length, 0);

  return {
    available: true,
    reason: null,
    fleschEase: Math.round(fleschEase * 10) / 10,
    fleschGrade: Math.round(fleschGrade * 10) / 10,
    averageSentenceLength: Math.round(wordsPerSentence * 10) / 10,
    averageWordLength: Math.round((characterLength / words.length) * 10) / 10,
    syllables,
    label: readingEaseLabel(fleschEase),
  };
}
