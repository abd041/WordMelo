import { PICTIONARY_PROMPTS } from "./prompts";
import type { PictionaryPrompt, PromptDifficulty } from "./types";

/** Stable, category-spread samples for server-rendered copy. */
export function diverseSample(
  difficulty: PromptDifficulty,
  count: number,
): PictionaryPrompt[] {
  const grouped = new Map<string, PictionaryPrompt[]>();
  for (const prompt of PICTIONARY_PROMPTS) {
    if (prompt.difficulty !== difficulty) continue;
    const list = grouped.get(prompt.category) ?? [];
    list.push(prompt);
    grouped.set(prompt.category, list);
  }

  const categories = [...grouped.keys()];
  const out: PictionaryPrompt[] = [];
  let row = 0;
  while (out.length < count) {
    let added = false;
    for (const category of categories) {
      const prompt = grouped.get(category)?.[row];
      if (!prompt) continue;
      out.push(prompt);
      added = true;
      if (out.length >= count) break;
    }
    if (!added) break;
    row += 1;
  }
  return out;
}
