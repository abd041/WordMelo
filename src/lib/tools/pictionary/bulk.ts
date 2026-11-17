import { getCategoryLabel } from "./categories";
import { filterPrompts } from "./sample";
import type { RandomIntFn } from "./rng";
import { createCryptoRandomInt } from "./rng";
import type { PictionaryPrompt, PromptFilters } from "./types";

export const WORD_LIST_SIZES = [5, 10, 25, 50, 100] as const;
export type WordListSize = (typeof WORD_LIST_SIZES)[number];

export interface BulkDrawResult {
  prompts: PictionaryPrompt[];
  requested: number;
  available: number;
  limited: boolean;
  message?: string;
}

function shuffle<T>(items: readonly T[], randomInt: RandomIntFn): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const current = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = current;
  }
  return copy;
}

export function drawPromptList(
  prompts: readonly PictionaryPrompt[],
  filters: PromptFilters,
  count: number,
  randomInt: RandomIntFn = createCryptoRandomInt(),
): BulkDrawResult {
  const requested = Math.max(0, Math.floor(count));
  const pool = filterPrompts(prompts, { ...filters, noRepeat: false });
  const available = pool.length;

  if (requested === 0) {
    return {
      prompts: [],
      requested: 0,
      available,
      limited: false,
      message: "Choose how many words to generate.",
    };
  }

  if (available === 0) {
    return {
      prompts: [],
      requested,
      available: 0,
      limited: true,
      message:
        "No prompts match these filters. Try All categories or Mixed difficulty.",
    };
  }

  const take = Math.min(requested, available);
  const picked = shuffle(pool, randomInt).slice(0, take);
  const limited = available < requested;

  return {
    prompts: picked,
    requested,
    available,
    limited,
    message: limited
      ? `Only ${available} unique prompts match these filters, so this list has ${take} ${take === 1 ? "word" : "words"} instead of ${requested}. Widen the filters for a longer list.`
      : undefined,
  };
}

const DIFFICULTY_LABEL: Record<PictionaryPrompt["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function formatPromptList(prompts: readonly PictionaryPrompt[]): string {
  return prompts
    .map(
      (prompt, index) =>
        `${index + 1}. ${prompt.text} — ${DIFFICULTY_LABEL[prompt.difficulty]} — ${getCategoryLabel(prompt.category)}`,
    )
    .join("\n");
}
