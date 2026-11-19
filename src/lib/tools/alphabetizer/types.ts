export const SORT_MODES = [
  "az",
  "za",
  "numeric-asc",
  "numeric-desc",
  "natural-az",
  "natural-za",
  "length-asc",
  "length-desc",
  "last-name",
  "reverse",
  "shuffle",
] as const;

export type SortMode = (typeof SORT_MODES)[number];

export const INPUT_FORMATS = ["lines", "comma", "semicolon"] as const;
export type InputFormat = (typeof INPUT_FORMATS)[number];

export interface SortSettings {
  mode: SortMode;
  format: InputFormat;
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  ignoreArticles: boolean;
  trimOutput: boolean;
  removeEmpty: boolean;
  removeDuplicates: boolean;
  numberOutput: boolean;
}

export interface SortStats {
  inputItems: number;
  outputItems: number;
  duplicatesRemoved: number;
  emptyRemoved: number;
  mode: SortMode;
  totalCharacters: number;
  processedCharacters: number;
  totalInputItems: number;
  droppedIncompleteItem: boolean;
}

export interface SortResult {
  items: string[];
  text: string;
  stats: SortStats;
  warning: string | null;
  truncated: boolean;
}

export type RandomInt = (maxExclusive: number) => number;
