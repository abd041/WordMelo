import { isEnglishStopword } from "./stopwords";
import { tokenize, wordKey } from "./tokenize";
import type { RankedWord } from "./types";

export const MAX_INPUT_CHARS = 80_000;
export const MIN_DISPLAY_WORDS = 10;
export const MAX_DISPLAY_WORDS = 200;

export interface TextStats {
  characters: number;
  words: number;
  uniqueWords: number;
  truncated: boolean;
}

export interface AnalyzeOptions {
  ignoreCase: boolean;
  excludeCommon: boolean;
  minLength: number;
  minFrequency: number;
  maxWords: number;
  excludedWords: string;
  highlightedWords: string;
}

export interface AnalyzeResult {
  characters: number;
  tokenCount: number;
  uniqueWords: number;
  truncated: boolean;
  words: RankedWord[];
}

interface Bucket {
  key: string;
  count: number;
  first: string;
  forms: Map<string, number>;
}

export function parseListedWords(value: string, ignoreCase: boolean): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const part of value.split(/[\s,]+/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = wordKey(trimmed, ignoreCase);
    if (seen.has(key)) continue;
    seen.add(key);
    words.push(key);
  }
  return words;
}

export function textStats(text: string, ignoreCase: boolean): TextStats {
  const truncated = text.length > MAX_INPUT_CHARS;
  const source = truncated ? text.slice(0, MAX_INPUT_CHARS) : text;
  const tokens = tokenize(source);
  const unique = new Set(tokens.map((token) => wordKey(token, ignoreCase)));
  return {
    characters: text.length,
    words: tokens.length,
    uniqueWords: unique.size,
    truncated,
  };
}

function displayForm(bucket: Bucket): string {
  let best = bucket.first;
  let bestCount = -1;
  for (const [form, count] of bucket.forms) {
    if (count > bestCount) {
      best = form;
      bestCount = count;
    }
  }
  return best;
}

export function analyzeText(text: string, options: AnalyzeOptions): AnalyzeResult {
  const stats = textStats(text, options.ignoreCase);
  const source =
    text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) : text;
  const tokens = tokenize(source);
  const excluded = new Set(parseListedWords(options.excludedWords, options.ignoreCase));
  const highlighted = new Set(
    parseListedWords(options.highlightedWords, options.ignoreCase),
  );
  const buckets = new Map<string, Bucket>();

  for (const token of tokens) {
    const key = wordKey(token, options.ignoreCase);
    if (!key) continue;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.forms.set(token, (existing.forms.get(token) ?? 0) + 1);
    } else {
      buckets.set(key, {
        key,
        count: 1,
        first: token,
        forms: new Map([[token, 1]]),
      });
    }
  }

  const minLength = clampInt(options.minLength, 1, 20);
  const minFrequency = clampInt(options.minFrequency, 1, 50);
  const maxWords = clampInt(options.maxWords, MIN_DISPLAY_WORDS, MAX_DISPLAY_WORDS);

  const ranked: RankedWord[] = [];
  for (const bucket of buckets.values()) {
    if (bucket.key.length < minLength) continue;
    if (excluded.has(bucket.key)) continue;
    const isHighlight = highlighted.has(bucket.key);
    if (options.excludeCommon && isEnglishStopword(bucket.key) && !isHighlight) {
      continue;
    }
    if (bucket.count < minFrequency && !isHighlight) continue;
    ranked.push({
      text: displayForm(bucket),
      count: bucket.count,
      highlighted: isHighlight,
    });
  }

  ranked.sort((a, b) => {
    if (a.highlighted !== b.highlighted) return a.highlighted ? -1 : 1;
    if (b.count !== a.count) return b.count - a.count;
    return a.text.localeCompare(b.text, "en-US");
  });

  return {
    characters: stats.characters,
    tokenCount: stats.words,
    uniqueWords: stats.uniqueWords,
    truncated: stats.truncated,
    words: ranked.slice(0, maxWords),
  };
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}
