import {
  countCharactersWithoutSpaces,
  countCharactersWithSpaces,
  countParagraphs,
  countSentences,
  countWords,
  tryCountGraphemes,
} from "@/lib/tools/word-counter/count";
import type {
  CharacterStats,
  LimitMetric,
  UnicodeDemoExample,
} from "./types";

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

function countCodePointsMatching(text: string, pattern: RegExp): number {
  if (!text) return 0;
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Lines: empty → 0; otherwise number of LF-separated rows after CRLF/CR → LF.
 * A trailing newline creates an extra (possibly empty) line, matching common editors.
 */
export function countLines(text: string): number {
  if (!text) return 0;
  const normalized = normalizeNewlines(text);
  return normalized.split("\n").length;
}

export function countCodePoints(text: string): number {
  if (!text) return 0;
  return Array.from(text).length;
}

export function countUtf16Units(text: string): number {
  return text.length;
}

export function countUtf8Bytes(text: string): number {
  if (!text) return 0;
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(text).length;
  }
  const Buf = (globalThis as { Buffer?: { byteLength: (s: string, enc: string) => number } })
    .Buffer;
  if (Buf) return Buf.byteLength(text, "utf8");
  let bytes = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/** Unicode letters (`\p{L}`), not combining marks. */
export function countLetters(text: string): number {
  return countCodePointsMatching(text, /\p{L}/gu);
}

/** Unicode decimal digits (`\p{Nd}`). */
export function countDigits(text: string): number {
  return countCodePointsMatching(text, /\p{Nd}/gu);
}

/** Whitespace code points matching JS `\s` with the Unicode flag. */
export function countWhitespace(text: string): number {
  return countCodePointsMatching(text, /\s/gu);
}

export function countPunctuation(text: string): number {
  return countCodePointsMatching(text, /\p{P}/gu);
}

export function countSymbols(text: string): number {
  return countCodePointsMatching(text, /\p{S}/gu);
}

/**
 * Count for a limit metric. Returns null when grapheme segmentation is unavailable
 * so callers never treat code points as graphemes.
 */
export function countForMetric(
  text: string,
  metric: LimitMetric,
): number | null {
  switch (metric) {
    case "grapheme": {
      const result = tryCountGraphemes(text);
      return result.available ? result.count : null;
    }
    case "codePoint":
      return countCodePoints(text);
    case "utf16":
      return countUtf16Units(text);
    default: {
      const _exhaustive: never = metric;
      return _exhaustive;
    }
  }
}

export function analyzeCharacters(text: string): CharacterStats {
  const graphemeResult = tryCountGraphemes(text);

  return {
    charactersWithSpaces: countCharactersWithSpaces(text),
    charactersWithoutSpaces: countCharactersWithoutSpaces(text),
    letters: countLetters(text),
    words: countWords(text),
    digits: countDigits(text),
    whitespace: countWhitespace(text),
    lines: countLines(text),
    paragraphs: countParagraphs(text),
    graphemes: graphemeResult.available ? graphemeResult.count : null,
    graphemesAvailable: graphemeResult.available,
    codePoints: countCodePoints(text),
    utf16Units: countUtf16Units(text),
    utf8Bytes: countUtf8Bytes(text),
    punctuation: countPunctuation(text),
    symbols: countSymbols(text),
    sentences: countSentences(text),
  };
}

export const EMPTY_CHARACTER_STATS: CharacterStats = {
  charactersWithSpaces: 0,
  charactersWithoutSpaces: 0,
  letters: 0,
  words: 0,
  digits: 0,
  whitespace: 0,
  lines: 0,
  paragraphs: 0,
  graphemes: 0,
  graphemesAvailable: true,
  codePoints: 0,
  utf16Units: 0,
  utf8Bytes: 0,
  punctuation: 0,
  symbols: 0,
  sentences: 0,
};

/** Built-in Unicode demos — values always computed via shared analyzers. */
export const UNICODE_DEMOS: UnicodeDemoExample[] = [
  {
    id: "ascii",
    label: "Plain letter",
    text: "A",
    blurb: "One letter is one grapheme, code point, UTF-16 unit, and UTF-8 byte.",
  },
  {
    id: "accent",
    label: "Combining accent",
    text: "e\u0301",
    blurb: "e + combining acute: usually one grapheme, two code points.",
  },
  {
    id: "emoji",
    label: "Emoji",
    text: "✅",
    blurb: "Many emoji are one grapheme but two UTF-16 units.",
  },
  {
    id: "family",
    label: "ZWJ emoji",
    text: "👨‍👩‍👧‍👦",
    blurb: "A family emoji can be one grapheme with many code points.",
  },
];

export function analyzeUnicodeDemo(id: UnicodeDemoExample["id"]): CharacterStats {
  const demo = UNICODE_DEMOS.find((d) => d.id === id) ?? UNICODE_DEMOS[0]!;
  return analyzeCharacters(demo.text);
}

/**
 * Stats for a highlighted slice. Offsets are UTF-16 indexes, matching
 * textarea selectionStart/selectionEnd. Returns null when nothing is selected.
 */
export function analyzeSelection(
  text: string,
  start: number,
  end: number,
): CharacterStats | null {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  const length = text.length;
  const from = Math.max(0, Math.min(length, Math.trunc(Math.min(start, end))));
  const to = Math.max(0, Math.min(length, Math.trunc(Math.max(start, end))));
  if (to <= from) return null;
  return analyzeCharacters(text.slice(from, to));
}
