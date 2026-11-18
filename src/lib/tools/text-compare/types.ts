export const COMPARE_MODES = ["word", "line", "character"] as const;
export type CompareMode = (typeof COMPARE_MODES)[number];

export const RESULT_VIEWS = ["side", "unified"] as const;
export type ResultView = (typeof RESULT_VIEWS)[number];

export interface CompareSettings {
  mode: CompareMode;
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  ignoreEdgeSpace: boolean;
  ignoreEmptyLines: boolean;
  showUnchanged: boolean;
  showLineNumbers: boolean;
  wrap: boolean;
  view: ResultView;
}

export interface Piece {
  display: string;
  key: string;
  line: number | null;
}

export type CompareDetail = "word" | "line" | "character";

export interface AlignedSegment {
  type: "equal" | "delete" | "insert" | "replace" | "gap";
  left: string;
  right: string;
  /** How many compared units this row represents. Gap rows represent none. */
  units: number;
  leftLine: number | null;
  rightLine: number | null;
}

export interface CompareStats {
  /** Null when the alignment is incomplete. A number never means the excluded tail was compared. */
  similarity: number | null;
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  originalWords: number;
  modifiedWords: number;
}

export interface CompareCoverage {
  includedLeft: number;
  includedRight: number;
  excludedLeft: number;
  excludedRight: number;
}

export interface CompareResult {
  segments: AlignedSegment[];
  stats: CompareStats;
  warning: string | null;
  /** True when part of the middle could not be aligned. */
  limited: boolean;
  /** True when either side was longer than the character limit. */
  partial: boolean;
  /** True when no reliable similarity score should be shown. */
  approximate: boolean;
  /** Unit actually used for the segments. May be coarser than the selected mode. */
  detail: CompareDetail;
  /** Piece counts skipped in the middle of an approximate comparison. */
  unaligned: { left: number; right: number } | null;
  coverage: CompareCoverage;
}
