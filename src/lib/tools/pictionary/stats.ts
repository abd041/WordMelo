import { PROMPT_CATEGORIES } from "./categories";
import { PICTIONARY_PROMPTS } from "./prompts";
import type { PromptCategoryId, PromptDifficulty } from "./types";

export interface CategoryTally {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export interface PromptStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  byCategory: Record<PromptCategoryId, CategoryTally>;
}

function emptyTally(): CategoryTally {
  return { easy: 0, medium: 0, hard: 0, total: 0 };
}

export function tallyPrompts(
  prompts: readonly { category: PromptCategoryId; difficulty: PromptDifficulty }[],
): PromptStats {
  const byCategory = Object.fromEntries(
    PROMPT_CATEGORIES.map((category) => [category.id, emptyTally()]),
  ) as Record<PromptCategoryId, CategoryTally>;

  const stats: PromptStats = {
    total: prompts.length,
    easy: 0,
    medium: 0,
    hard: 0,
    byCategory,
  };

  for (const prompt of prompts) {
    stats[prompt.difficulty] += 1;
    const bucket = stats.byCategory[prompt.category];
    bucket[prompt.difficulty] += 1;
    bucket.total += 1;
  }

  return stats;
}

/** Counts derived from the curated list. Do not hardcode these. */
export const PROMPT_STATS: PromptStats = tallyPrompts(PICTIONARY_PROMPTS);
