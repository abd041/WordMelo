import { siteConfig } from "@/lib/site";

export interface TextStats {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  graphemes: number;
  sentences: number;
  paragraphs: number;
  readingSeconds: number;
  speakingSeconds: number;
  estimatedPages: number;
}

export interface WordFrequencyItem {
  word: string;
  count: number;
}

export interface WordCounterResult extends TextStats {
  frequencies: WordFrequencyItem[];
}

type SegmenterGranularity = "grapheme" | "word" | "sentence";

interface SegmentLike {
  segment: string;
  isWordLike?: boolean;
}

interface SegmenterLike {
  segment(input: string): Iterable<SegmentLike>;
}

function getSegmenter(
  locale: string,
  granularity: SegmenterGranularity,
): SegmenterLike | null {
  try {
    const SegmenterCtor = (
      Intl as unknown as {
        Segmenter?: new (
          locales?: string | string[],
          options?: { granularity?: SegmenterGranularity },
        ) => SegmenterLike;
      }
    ).Segmenter;

    if (!SegmenterCtor) {
      return null;
    }

    return new SegmenterCtor(locale, { granularity });
  } catch {
    return null;
  }
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

export type GraphemeCountResult =
  | { available: true; count: number }
  | { available: false; count: null };

/**
 * Count user-perceived characters (grapheme clusters) via Intl.Segmenter.
 * Never silently substitutes code-point counts for graphemes on large inputs.
 * When Segmenter is unavailable, returns `{ available: false, count: null }`.
 */
export function tryCountGraphemes(text: string): GraphemeCountResult {
  if (!text) return { available: true, count: 0 };

  const segmenter = getSegmenter("en", "grapheme");
  if (!segmenter) {
    return { available: false, count: null };
  }

  // Iterate without materializing an array — large pastes must stay accurate
  // and must not OOM from allocating every segment object at once.
  let count = 0;
  for (const segment of segmenter.segment(text)) {
    void segment;
    count += 1;
  }
  return { available: true, count };
}

/**
 * Grapheme count for callers that need a number.
 * Uses Intl.Segmenter when available. If Segmenter is missing, falls back to
 * Unicode code-point count — callers that must not mix metrics should use
 * `tryCountGraphemes` instead and handle unavailability explicitly.
 */
export function countGraphemes(text: string): number {
  const result = tryCountGraphemes(text);
  if (result.available) return result.count;
  return Array.from(text).length;
}

function stripEdgePunctuation(token: string): string {
  return token.replace(
    /^[^\p{L}\p{N}\p{M}]+|[^\p{L}\p{N}\p{M}]+$/gu,
    "",
  );
}

/**
 * Extract word-like tokens for counting and frequency analysis.
 */
export function extractWords(text: string): string[] {
  if (!text.trim()) return [];

  const segmenter = getSegmenter("en", "word");
  if (segmenter) {
    const words: string[] = [];
    for (const part of segmenter.segment(text)) {
      if (part.isWordLike) {
        words.push(part.segment);
      }
    }
    return words;
  }

  return normalizeNewlines(text)
    .split(/\s+/u)
    .map(stripEdgePunctuation)
    .filter(Boolean);
}

export function countWords(text: string): number {
  return extractWords(text).length;
}

export function countCharactersWithSpaces(text: string): number {
  return text.length;
}

export function countCharactersWithoutSpaces(text: string): number {
  return text.replace(/\s/gu, "").length;
}

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const segmenter = getSegmenter("en", "sentence");
  if (segmenter) {
    let count = 0;
    for (const part of segmenter.segment(trimmed)) {
      if (part.segment.trim()) {
        count += 1;
      }
    }
    return count;
  }

  const parts = trimmed
    .split(/(?<=[.!?…])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.length : 1;
}

export function countParagraphs(text: string): number {
  const normalized = normalizeNewlines(text).trim();
  if (!normalized) return 0;

  return normalized
    .split(/\n\s*\n/u)
    .map((block) => block.trim())
    .filter(Boolean).length;
}

export function estimateDurationSeconds(
  wordCount: number,
  wordsPerMinute: number,
): number {
  if (wordCount <= 0 || wordsPerMinute <= 0) return 0;
  return Math.ceil((wordCount / wordsPerMinute) * 60);
}

export function estimatePages(
  wordCount: number,
  wordsPerPage: number = siteConfig.wordsPerPageEstimate,
): number {
  if (wordCount <= 0 || wordsPerPage <= 0) return 0;
  return Math.round((wordCount / wordsPerPage) * 100) / 100;
}

export function computeTextStats(
  text: string,
  options?: {
    readingWpm?: number;
    speakingWpm?: number;
    wordsPerPage?: number;
  },
): TextStats {
  const words = countWords(text);
  const readingWpm = options?.readingWpm ?? siteConfig.readingWordsPerMinute;
  const speakingWpm = options?.speakingWpm ?? siteConfig.speakingWordsPerMinute;
  const wordsPerPage = options?.wordsPerPage ?? siteConfig.wordsPerPageEstimate;

  return {
    words,
    charactersWithSpaces: countCharactersWithSpaces(text),
    charactersWithoutSpaces: countCharactersWithoutSpaces(text),
    graphemes: countGraphemes(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingSeconds: estimateDurationSeconds(words, readingWpm),
    speakingSeconds: estimateDurationSeconds(words, speakingWpm),
    estimatedPages: estimatePages(words, wordsPerPage),
  };
}

/**
 * Frequency analysis is relatively expensive for large inputs.
 * Call separately (and optionally deferred) from live core stats.
 */
export function computeWordFrequencies(
  text: string,
  limit = 50,
): WordFrequencyItem[] {
  const words = extractWords(text);
  if (words.length === 0) return [];

  const counts = new Map<string, { display: string; count: number }>();

  for (const word of words) {
    const key = word.toLocaleLowerCase("en-US");
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { display: word, count: 1 });
    }
  }

  return Array.from(counts.values())
    .map((entry) => ({ word: entry.display, count: entry.count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.word.localeCompare(b.word, "en", { sensitivity: "base" });
    })
    .slice(0, limit);
}

export function analyzeText(
  text: string,
  options?: {
    readingWpm?: number;
    speakingWpm?: number;
    wordsPerPage?: number;
    frequencyLimit?: number;
    includeFrequencies?: boolean;
  },
): WordCounterResult {
  const stats = computeTextStats(text, options);
  const frequencies =
    options?.includeFrequencies === false
      ? []
      : computeWordFrequencies(text, options?.frequencyLimit ?? 50);

  return {
    ...stats,
    frequencies,
  };
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0 sec";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds} sec`);

  return parts.join(" ") || "0 sec";
}
