import type {
  DrawResult,
  PictionaryPrompt,
  PromptFilters,
} from "./types";
import { createCryptoRandomInt, type RandomIntFn } from "./rng";

export function filterPrompts(
  prompts: readonly PictionaryPrompt[],
  filters: PromptFilters,
  exclude?: ReadonlySet<string>,
): PictionaryPrompt[] {
  const categorySet =
    filters.categories.length > 0 ? new Set(filters.categories) : null;

  return prompts.filter((prompt) => {
    if (exclude?.has(prompt.id)) return false;
    if (categorySet && !categorySet.has(prompt.category)) return false;
    if (filters.difficulty !== "mixed" && prompt.difficulty !== filters.difficulty) {
      return false;
    }
    return true;
  });
}

export function drawPrompt(
  prompts: readonly PictionaryPrompt[],
  filters: PromptFilters,
  options: {
    usedIds?: ReadonlySet<string>;
    randomInt?: RandomIntFn;
  } = {},
): DrawResult {
  const exclude =
    filters.noRepeat && options.usedIds && options.usedIds.size > 0
      ? options.usedIds
      : undefined;

  const fullPool = filterPrompts(prompts, filters);
  const pool = exclude ? filterPrompts(prompts, filters, exclude) : fullPool;

  if (pool.length === 0) {
    return {
      prompt: null,
      poolSize: fullPool.length,
      exhausted: true,
      message:
        fullPool.length === 0
          ? "No prompts match these filters. Try more categories or Mixed difficulty."
          : "Every matching prompt was already used this session. Reset the session to continue.",
    };
  }

  const randomInt = options.randomInt ?? createCryptoRandomInt();
  const index = randomInt(pool.length);
  return {
    prompt: pool[index]!,
    poolSize: pool.length,
    exhausted: false,
  };
}
