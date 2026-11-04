import {
  DEFAULT_FILTERS,
  DEFAULT_MULTIPLE,
  type LetterFilters,
  type LetterPresetId,
  type MainTab,
  type MultipleSettings,
} from "./types";

export interface LetterPreset {
  id: LetterPresetId;
  label: string;
  blurb: string;
  tab: MainTab;
  filters: LetterFilters;
  multiple?: MultipleSettings;
  focusPreferred?: boolean;
  /** When true, Multiple mode should shuffle all eligible letters once. */
  shuffleAll?: boolean;
}

export const LETTER_PRESETS: readonly LetterPreset[] = [
  {
    id: "quick",
    label: "Quick Random Letter",
    blurb: "One letter from A–Z.",
    tab: "instant",
    filters: { ...DEFAULT_FILTERS },
  },
  {
    id: "vowels",
    label: "Vowels Practice",
    blurb: "A, E, I, O, U.",
    tab: "instant",
    filters: { ...DEFAULT_FILTERS, poolMode: "vowels" },
  },
  {
    id: "consonants",
    label: "Consonants Practice",
    blurb: "21 consonants (Y as consonant).",
    tab: "instant",
    filters: { ...DEFAULT_FILTERS, poolMode: "consonants" },
  },
  {
    id: "shuffle",
    label: "Alphabet Shuffle",
    blurb: "All 26 letters once, randomized.",
    tab: "multiple",
    filters: { ...DEFAULT_FILTERS },
    multiple: { ...DEFAULT_MULTIPLE, count: 26, uniqueInBatch: true },
    shuffleAll: true,
  },
  {
    id: "classroom",
    label: "Classroom Mode",
    blurb: "Large single letter + focus display.",
    tab: "instant",
    filters: { ...DEFAULT_FILTERS },
    focusPreferred: true,
  },
  {
    id: "word-games",
    label: "Word Games",
    blurb: "Starting letters without hard Q, X, Z.",
    tab: "instant",
    filters: {
      ...DEFAULT_FILTERS,
      excluded: ["Q", "X", "Z"],
      noRepeatSession: true,
    },
  },
];

export function getPreset(id: LetterPresetId): LetterPreset | undefined {
  return LETTER_PRESETS.find((p) => p.id === id);
}
