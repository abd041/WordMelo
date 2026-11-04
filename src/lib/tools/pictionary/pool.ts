import { filterPrompts } from "./sample";
import { PICTIONARY_PROMPTS } from "./prompts";
import type { PromptFilters } from "./types";

export function countEligible(
  filters: PromptFilters,
  usedIds?: ReadonlySet<string>,
): number {
  return filterPrompts(PICTIONARY_PROMPTS, filters, usedIds).length;
}

export function countByDifficulty(filters: PromptFilters): {
  easy: number;
  medium: number;
  hard: number;
  total: number;
} {
  const base = { ...filters, difficulty: "mixed" as const };
  return {
    easy: filterPrompts(PICTIONARY_PROMPTS, { ...base, difficulty: "easy" }).length,
    medium: filterPrompts(PICTIONARY_PROMPTS, { ...base, difficulty: "medium" }).length,
    hard: filterPrompts(PICTIONARY_PROMPTS, { ...base, difficulty: "hard" }).length,
    total: filterPrompts(PICTIONARY_PROMPTS, base).length,
  };
}
