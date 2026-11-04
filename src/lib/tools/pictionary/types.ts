export type PromptDifficulty = "easy" | "medium" | "hard";
export type DifficultyFilter = PromptDifficulty | "mixed";

export type PromptCategoryId =
  | "fruits-vegetables"
  | "plants"
  | "landscapes"
  | "buildings"
  | "rooms-furniture"
  | "vehicles"
  | "household"
  | "stationery"
  | "technology"
  | "shapes-patterns"
  | "weather"
  | "tools";

export interface PictionaryPrompt {
  id: string;
  text: string;
  category: PromptCategoryId;
  difficulty: PromptDifficulty;
  /** Optional short drawing tip — never reveals prohibited subjects */
  hint?: string;
}

export interface PromptFilters {
  difficulty: DifficultyFilter;
  categories: PromptCategoryId[];
  noRepeat: boolean;
}

export interface DrawResult {
  prompt: PictionaryPrompt | null;
  poolSize: number;
  exhausted: boolean;
  message?: string;
}

export const DEFAULT_FILTERS: PromptFilters = {
  difficulty: "mixed",
  categories: [],
  noRepeat: true,
};

export const TIMER_OPTIONS = [30, 60, 90, 120] as const;
export type TimerSeconds = (typeof TIMER_OPTIONS)[number];
