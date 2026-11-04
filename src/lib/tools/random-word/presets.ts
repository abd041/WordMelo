import { DEFAULT_FILTERS, type WordFilters } from "./types";

export interface WordPreset {
  id: string;
  label: string;
  description: string;
  filters: Partial<WordFilters>;
}

export const WORD_PRESETS: WordPreset[] = [
  {
    id: "creative-writing",
    label: "Creative Writing",
    description: "Interesting common vocabulary for stories and brainstorming.",
    filters: {
      count: 10,
      wordType: "all",
      lengthMode: "range",
      minLength: 4,
      maxLength: 10,
      difficulty: "medium",
      vocabulary: "common",
      startsWith: "",
      endsWith: "",
      noRepeat: true,
    },
  },
  {
    id: "vocabulary-practice",
    label: "Vocabulary Practice",
    description:
      "Common English words for general learning and language practice.",
    filters: {
      count: 10,
      wordType: "all",
      lengthMode: "range",
      minLength: 4,
      maxLength: 9,
      difficulty: "medium",
      vocabulary: "common",
      startsWith: "",
      endsWith: "",
      noRepeat: true,
    },
  },
  {
    id: "five-letter",
    label: "Five-Letter Words",
    description: "Exact five-letter English words.",
    filters: {
      count: 10,
      wordType: "all",
      lengthMode: "exact",
      exactLength: 5,
      difficulty: "all",
      vocabulary: "common",
      startsWith: "",
      endsWith: "",
      noRepeat: true,
    },
  },
  {
    id: "easy-words",
    label: "Easy Words",
    description: "Shorter, higher-frequency vocabulary (documented heuristic).",
    filters: {
      count: 10,
      wordType: "all",
      lengthMode: "any",
      difficulty: "easy",
      vocabulary: "common",
      startsWith: "",
      endsWith: "",
      noRepeat: true,
    },
  },
  {
    id: "word-games",
    label: "Word Games",
    description:
      "General noun prompts for informal word activities — not a full Pictionary or Charades tool.",
    filters: {
      count: 12,
      wordType: "noun",
      lengthMode: "range",
      minLength: 4,
      maxLength: 8,
      difficulty: "easy",
      vocabulary: "common",
      startsWith: "",
      endsWith: "",
      noRepeat: true,
    },
  },
];

export function applyPreset(presetId: string, current: WordFilters): WordFilters {
  const preset = WORD_PRESETS.find((p) => p.id === presetId);
  if (!preset) return current;
  return { ...DEFAULT_FILTERS, ...current, ...preset.filters };
}
