import { filterVocabulary, describeEmptyPool, clampCount } from "./filter";
import type { RandomIntFn } from "./rng";
import { createCryptoRandomInt } from "./rng";
import type { GenerateResult, VocabEntry, WordFilters } from "./types";

/**
 * Sample `count` unique entries without replacement from `pool`
 * using Fisher–Yates partial shuffle with an unbiased randomInt.
 */
export function sampleWithoutReplacement(
  pool: readonly VocabEntry[],
  count: number,
  randomInt: RandomIntFn = createCryptoRandomInt(),
): VocabEntry[] {
  const n = Math.min(count, pool.length);
  if (n <= 0) return [];
  const copy = pool.slice();
  const picked: VocabEntry[] = [];
  for (let i = 0; i < n; i++) {
    const j = i + randomInt(copy.length - i);
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
    picked.push(copy[i]!);
  }
  return picked;
}

export function generateWords(
  entries: readonly VocabEntry[],
  filters: WordFilters,
  options: {
    usedWords?: ReadonlySet<string>;
    randomInt?: RandomIntFn;
  } = {},
): GenerateResult {
  const requested = clampCount(filters.count);
  const exclude =
    filters.noRepeat && options.usedWords && options.usedWords.size > 0
      ? options.usedWords
      : undefined;

  const fullPool = filterVocabulary(entries, filters);
  const pool = exclude ? filterVocabulary(entries, filters, exclude) : fullPool;

  if (pool.length === 0) {
    return {
      words: [],
      poolSize: fullPool.length,
      requested,
      exhausted: true,
      message: describeEmptyPool(filters, fullPool.length),
    };
  }

  const picked = sampleWithoutReplacement(
    pool,
    requested,
    options.randomInt ?? createCryptoRandomInt(),
  );
  const words = picked.map((e) => e.word);
  const short = words.length < requested;

  return {
    words,
    poolSize: pool.length,
    requested,
    exhausted: short,
    message: short
      ? `Only ${words.length} unique word${words.length === 1 ? "" : "s"} available with these filters (requested ${requested}).`
      : undefined,
  };
}
