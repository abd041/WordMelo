export type PartOfSpeech = "noun" | "verb" | "adjective";
export type WordTypeFilter = "all" | PartOfSpeech;
export type DifficultyFilter = "all" | "easy" | "medium" | "hard";
export type VocabularyFilter = "all" | "common" | "extended";
export type LengthMode = "any" | "exact" | "range";

export interface VocabEntry {
  word: string;
  /** bitflags: noun=1 verb=2 adjective=4 */
  pos: number;
  /** 1-based Google-10k rank; 0 = extended */
  rank: number;
  common: boolean;
  difficulty: 0 | 1 | 2;
}

export interface WordFilters {
  count: number;
  wordType: WordTypeFilter;
  lengthMode: LengthMode;
  exactLength: number;
  minLength: number;
  maxLength: number;
  startsWith: string;
  endsWith: string;
  difficulty: DifficultyFilter;
  vocabulary: VocabularyFilter;
  /**
   * When true, regenerate skips words already used this session.
   * Within a single result list, duplicates are always avoided.
   */
  noRepeat: boolean;
}

export interface GenerateResult {
  words: string[];
  poolSize: number;
  requested: number;
  exhausted: boolean;
  message?: string;
}

export const POS_NOUN = 1;
export const POS_VERB = 2;
export const POS_ADJECTIVE = 4;

export const DEFAULT_FILTERS: WordFilters = {
  count: 5,
  wordType: "all",
  lengthMode: "any",
  exactLength: 5,
  minLength: 3,
  maxLength: 8,
  startsWith: "",
  endsWith: "",
  difficulty: "all",
  vocabulary: "common",
  noRepeat: true,
};

export const MAX_WORD_COUNT = 100;
export const MIN_WORD_COUNT = 1;
export const QUICK_COUNTS = [1, 5, 10, 20, 50, 100] as const;
export const EXACT_LENGTH_HINTS = [3, 4, 5, 6, 7, 8] as const;
export const TXT_FILENAME = "WordMelo-random-words.txt";
