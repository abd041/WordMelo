import type { TitleStyleId, TitleStyleMeta } from "./types";

export const TITLE_STYLES: TitleStyleMeta[] = [
  {
    id: "general",
    label: "General Title Case",
    shortLabel: "General",
    edition: "WordMelo",
    blurb: "Everyday headline capitalization with a small-word list.",
    compare: false,
  },
  {
    id: "apa7",
    label: "APA Title Case",
    shortLabel: "APA 7",
    edition: "APA Style 7th edition",
    blurb: "Major words and all words of four or more letters.",
    compare: true,
  },
  {
    id: "mla9",
    label: "MLA Title Case",
    shortLabel: "MLA 9",
    edition: "MLA Handbook 9th edition",
    blurb: "Principal words; lowercase articles, prepositions, and coordinating conjunctions.",
    compare: true,
  },
  {
    id: "chicago18",
    label: "Chicago Title Case",
    shortLabel: "Chicago 18",
    edition: "Chicago Manual of Style 18th edition",
    blurb: "Prepositions of five or more letters are capitalized.",
    compare: true,
  },
  {
    id: "ap-composition",
    label: "AP Composition Titles",
    shortLabel: "AP titles",
    edition: "AP Stylebook — composition titles",
    blurb: "Composition titles only — not AP news-headline sentence case.",
    compare: true,
  },
  {
    id: "sentence",
    label: "Sentence Case",
    shortLabel: "Sentence",
    edition: "Comparison",
    blurb: "Capitalize sentence starts; lowercase the rest.",
    compare: false,
  },
];

export function getTitleStyle(id: TitleStyleId): TitleStyleMeta {
  return TITLE_STYLES.find((s) => s.id === id) ?? TITLE_STYLES[0]!;
}

/** Stable reference for memoized comparison rendering. */
export const COMPARE_STYLES: TitleStyleMeta[] = TITLE_STYLES.filter(
  (s) => s.compare,
);

export function getCompareStyles(): TitleStyleMeta[] {
  return COMPARE_STYLES;
}

export const STYLE_COMPARISON_TABLE: Array<{
  style: string;
  edition: string;
  principle: string;
  prepositions: string;
  bestFor: string;
}> = [
  {
    style: "APA",
    edition: "7th",
    principle: "Major words and all words of four or more letters",
    prepositions: "Lowercase if ≤3 letters; capitalize if ≥4",
    bestFor: "Paper titles, headings, in-text work titles",
  },
  {
    style: "MLA",
    edition: "9th",
    principle: "Principal words; first and last of title/subtitle",
    prepositions: "Lowercase prepositions of any length",
    bestFor: "English titles in humanities citations",
  },
  {
    style: "Chicago",
    edition: "18th",
    principle: "Headline-style; first and last always capitalized",
    prepositions: "Capitalize prepositions of five or more letters",
    bestFor: "Books, journals, and general publishing",
  },
  {
    style: "AP",
    edition: "Composition titles",
    principle: "Composition titles only — not news headline sentence case",
    prepositions: "Lowercase if ≤3 letters; capitalize if ≥4",
    bestFor: "Books, films, songs, and similar works",
  },
  {
    style: "General",
    edition: "WordMelo",
    principle: "Everyday headline capitalization with a small-word list",
    prepositions: "Fixed small-word list (includes with)",
    bestFor: "Quick everyday headlines",
  },
];
