export type LimitMetric = "grapheme" | "codePoint" | "utf16";

export type LimitState = "ok" | "near" | "over" | "invalid" | "unavailable";

export interface CharacterStats {
  /** UTF-16 code units including whitespace (JavaScript string length). */
  charactersWithSpaces: number;
  /** UTF-16 code units after removing Unicode whitespace. */
  charactersWithoutSpaces: number;
  /** Unicode letter code points (`\p{L}`). */
  letters: number;
  /** Word-like tokens (shared Word Counter logic). */
  words: number;
  /** Unicode decimal digit code points (`\p{Nd}`). */
  digits: number;
  /** Unicode whitespace code points (`\s`). */
  whitespace: number;
  /** Line count after CRLF→LF normalization. Empty text = 0. */
  lines: number;
  /** Non-empty blocks separated by blank lines. */
  paragraphs: number;
  /**
   * User-perceived grapheme clusters when Intl.Segmenter is available.
   * Null when grapheme segmentation is unavailable — never a silent code-point stand-in.
   */
  graphemes: number | null;
  graphemesAvailable: boolean;
  /** Unicode code points (`Array.from` / code-point iteration). */
  codePoints: number;
  /** JavaScript UTF-16 code units (`String.length`). */
  utf16Units: number;
  /** UTF-8 byte length via TextEncoder. */
  utf8Bytes: number;
  /** Unicode punctuation (`\p{P}`). */
  punctuation: number;
  /** Unicode symbols (`\p{S}`). */
  symbols: number;
  /** Sentence count (shared Word Counter logic). */
  sentences: number;
}

export interface LimitStatus {
  used: number | null;
  limit: number;
  remaining: number | null;
  over: number | null;
  /** 0–1 clamped ratio of used/limit for progress UI; null when unavailable. */
  ratio: number | null;
  state: LimitState;
  metric: LimitMetric;
  metricUnavailable?: boolean;
}

export interface LimitPreset {
  id: string;
  label: string;
  limit: number;
  /** Short clarification shown in the UI. */
  blurb: string;
  kind: "generic" | "seo-guide";
}

export type UnicodeDemoId = "ascii" | "accent" | "emoji" | "family";

export interface UnicodeDemoExample {
  id: UnicodeDemoId;
  label: string;
  text: string;
  blurb: string;
}
