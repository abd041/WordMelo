export type GenerationMode = "paragraphs" | "sentences" | "words" | "characters";

export type ParagraphLength = "short" | "medium" | "long" | "variable";

export type OutputFormat = "plain" | "html" | "markdown";

export type HtmlExportMode = "clean" | "styled";

/** Canonical content: format serializers read this without regenerating. */
export interface GeneratedDocument {
  /** One string per paragraph (sentence/word/char modes usually use a single entry). */
  paragraphs: string[];
  mode: GenerationMode;
  requestedQuantity: number;
  classicOpening: boolean;
  classicOpeningAbbreviated: boolean;
  textKind: "lorem" | "ui-english";
  /** Character mode: whether output meets exact UTF-16 target. */
  exactUtf16: boolean;
  /** Character mode: Prefer-complete-words was used. */
  preferCompleteWords: boolean;
  /** Actual UTF-16 length of plain serialization for character mode. */
  actualUtf16Length: number | null;
}

export interface GenerateOptions {
  mode: GenerationMode;
  quantity: number;
  paragraphLength?: ParagraphLength;
  classicOpening?: boolean;
  textKind?: "lorem" | "ui-english";
  /**
   * Character mode only. When true, stop on a whole-word boundary and may
   * undershoot the target. Never labeled exact when short of the target.
   */
  preferCompleteWords?: boolean;
  /** Injected RNG for tests: returns integer in [0, maxExclusive). */
  randomInt?: (maxExclusive: number) => number;
}

export interface QuantityLimits {
  min: number;
  max: number;
  default: number;
}

export const QUANTITY_LIMITS: Record<GenerationMode, QuantityLimits> = {
  paragraphs: { min: 1, max: 100, default: 3 },
  sentences: { min: 1, max: 250, default: 5 },
  words: { min: 1, max: 5000, default: 100 },
  characters: { min: 1, max: 20000, default: 280 },
};

export const PARAGRAPH_WORD_RANGES: Record<
  Exclude<ParagraphLength, "variable">,
  { min: number; max: number }
> = {
  short: { min: 25, max: 45 },
  medium: { min: 50, max: 90 },
  long: { min: 100, max: 160 },
};

export const TXT_FILENAME = "WordMelo-lorem-ipsum.txt";
export const HTML_FILENAME = "WordMelo-lorem-ipsum.html";
export const MD_FILENAME = "WordMelo-lorem-ipsum.md";

/** Character-mode metric label shown in the UI. */
export const CHARACTER_METRIC_LABEL =
  "Exact characters (UTF-16 units)";
