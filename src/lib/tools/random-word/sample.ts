import { filterVocabulary, describeEmptyPool, clampCount } from "./filter";
import {
  createCryptoRandomInt,
  SecureRandomUnavailableError,
  type RandomIntFn,
} from "./rng";
import type { GenerateResult, VocabEntry, WordFilters } from "./types";

export const SECURE_RANDOM_MESSAGE =
  "This browser could not provide a secure random source, so no words were generated.";

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
  try {
    return generateWordsUnsafe(entries, filters, options);
  } catch (error) {
    if (error instanceof SecureRandomUnavailableError) {
      return {
        words: [],
        poolSize: 0,
        requested: clampCount(filters.count),
        exhausted: true,
        message: SECURE_RANDOM_MESSAGE,
      };
    }
    throw error;
  }
}

function generateWordsUnsafe(
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
