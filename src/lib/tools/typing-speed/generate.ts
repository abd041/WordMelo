import { sentencesFor, wordsFor } from "./corpus";
import type { Difficulty, RandomInt, TestSettings, TypingMode } from "./types";

export const DEFAULT_PASSAGE_CHARS = 2_400;
export const TOP_UP_CHARS = 900;
export const TOP_UP_THRESHOLD = 160;

export function defaultRandomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function shuffleCopy<T>(items: readonly T[], randomInt: RandomInt): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = randomInt(index + 1);
    const current = next[index]!;
    next[index] = next[swap]!;
    next[swap] = current;
  }
  return next;
}

export function generatePassage(
  settings: Pick<TestSettings, "difficulty" | "mode">,
  minChars = DEFAULT_PASSAGE_CHARS,
  randomInt: RandomInt = defaultRandomInt,
): string {
  const chunks =
    settings.mode === "sentences"
      ? [...sentencesFor(settings.difficulty)]
      : wordsFor(settings.difficulty).map((word) => word.toLowerCase());
  if (chunks.length === 0) return "";

  const parts: string[] = [];
  let length = 0;
  let bag = shuffleCopy(chunks, randomInt);
  let cursor = 0;

  while (length < minChars) {
    if (cursor >= bag.length) {
      bag = shuffleCopy(chunks, randomInt);
      cursor = 0;
    }
    const piece = bag[cursor]!;
    cursor += 1;
    if (parts.length > 0) {
      parts.push(" ");
      length += 1;
    }
    parts.push(piece);
    length += piece.length;
  }

  return parts.join("");
}

export function extendPassage(
  passage: string,
  typedLength: number,
  settings: Pick<TestSettings, "difficulty" | "mode">,
  randomInt: RandomInt = defaultRandomInt,
): string {
  const remaining = passage.length - typedLength;
  if (remaining > TOP_UP_THRESHOLD) return passage;
  const extra = generatePassage(settings, TOP_UP_CHARS, randomInt);
  if (!extra) return passage;
  if (passage.endsWith(" ") || extra.startsWith(" ")) return `${passage}${extra}`;
  return `${passage} ${extra}`;
}

export function averageTokenLength(mode: TypingMode, difficulty: Difficulty): number {
  const list = mode === "sentences" ? sentencesFor(difficulty) : wordsFor(difficulty);
  const total = list.reduce((sum, item) => sum + item.length, 0);
  return list.length === 0 ? 0 : total / list.length;
}
