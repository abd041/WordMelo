export type TitleStyleId =
  | "general"
  | "apa7"
  | "mla9"
  | "chicago18"
  | "ap-composition"
  | "sentence";

export interface TitleException {
  /** Case-insensitive whole-token match. */
  match: string;
  /** Exact preferred spelling written into the output. */
  spelling: string;
}

export interface ConvertOptions {
  preserveAcronyms?: boolean;
  exceptions?: TitleException[];
}

export interface TitleStyleMeta {
  id: TitleStyleId;
  label: string;
  shortLabel: string;
  edition: string;
  blurb: string;
  /** Included in side-by-side editorial comparison. */
  compare: boolean;
}

export interface HighlightSegment {
  text: string;
  changed: boolean;
}

export interface StyleConvertResult {
  styleId: TitleStyleId;
  output: string;
}
