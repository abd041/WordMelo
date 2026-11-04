export type LetterCaseMode = "upper" | "lower" | "mixed";

export type PoolMode = "all" | "vowels" | "consonants" | "custom";

export type OutputSeparator = "space" | "comma" | "newline" | "joined";

export type MainTab = "instant" | "multiple" | "wheel";

export interface LetterFilters {
  poolMode: PoolMode;
  /** Custom letters as uppercase A–Z (unique). Used when poolMode === "custom". */
  customLetters: string[];
  /** Uppercase letters to exclude after base pool is built. */
  excluded: string[];
  caseMode: LetterCaseMode;
  /** Treat Y as a vowel when building vowel/consonant pools. Default false. */
  yAsVowel: boolean;
  /**
   * Instant / wheel: exclude base letters already drawn this session.
   * Multiple mode uses uniqueInBatch instead for batch uniqueness.
   */
  noRepeatSession: boolean;
}

export interface MultipleSettings {
  count: number;
  /** Unique base letters within the current batch (no replacement). */
  uniqueInBatch: boolean;
  separator: OutputSeparator;
}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const DEFAULT_VOWELS = ["A", "E", "I", "O", "U"] as const;

export const TXT_FILENAME = "WordMelo-random-letters.txt";

export const MAX_BATCH = 100;
export const MIN_BATCH = 1;

export const DEFAULT_FILTERS: LetterFilters = {
  poolMode: "all",
  customLetters: [],
  excluded: [],
  caseMode: "upper",
  yAsVowel: false,
  noRepeatSession: false,
};

export const DEFAULT_MULTIPLE: MultipleSettings = {
  count: 10,
  uniqueInBatch: false,
  separator: "space",
};

export type LetterPresetId =
  | "quick"
  | "vowels"
  | "consonants"
  | "shuffle"
  | "classroom"
  | "word-games";
