import {
  createCryptoRandomInt,
  SecureRandomUnavailableError,
  type RandomIntFn,
} from "./rng";
import {
  describeEmptyPool,
  eligiblePool,
  basePool,
} from "./pool";
import {
  MAX_BATCH,
  MIN_BATCH,
  type LetterCaseMode,
  type LetterFilters,
  type MultipleSettings,
} from "./types";

export function clampCount(n: number): number {
  if (!Number.isFinite(n)) return MIN_BATCH;
  return Math.min(MAX_BATCH, Math.max(MIN_BATCH, Math.floor(n)));
}

export function applyCase(
  baseUpper: string,
  caseMode: LetterCaseMode,
  randomInt: RandomIntFn = createCryptoRandomInt(),
): string {
  if (caseMode === "upper") return baseUpper.toUpperCase();
  if (caseMode === "lower") return baseUpper.toLowerCase();
  return randomInt(2) === 0 ? baseUpper.toUpperCase() : baseUpper.toLowerCase();
}

export function sampleWithoutReplacement(
  pool: readonly string[],
  count: number,
  randomInt: RandomIntFn = createCryptoRandomInt(),
): string[] {
  const n = Math.min(count, pool.length);
  if (n <= 0) return [];
  const copy = pool.slice();
  const picked: string[] = [];
  for (let i = 0; i < n; i++) {
    const j = i + randomInt(copy.length - i);
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
    picked.push(copy[i]!);
  }
  return picked;
}

export function fisherYatesShuffle(
  items: readonly string[],
  randomInt: RandomIntFn = createCryptoRandomInt(),
): string[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

export const SECURE_RANDOM_MESSAGE =
  "This browser could not provide a secure random source, so no letter was generated.";

export function runSecureDraw(run: () => DrawResult): DrawResult {
  try {
    return run();
  } catch (error) {
    if (error instanceof SecureRandomUnavailableError) {
      return {
        letters: [],
        bases: [],
        poolSize: 0,
        requested: 0,
        exhausted: true,
        message: SECURE_RANDOM_MESSAGE,
      };
    }
    throw error;
  }
}

export interface DrawResult {
  /** Displayed letters (case applied). */
  letters: string[];
  /** Uppercase base letters corresponding 1:1. */
  bases: string[];
  poolSize: number;
  requested: number;
  exhausted: boolean;
  message?: string;
}

export function drawOne(
  filters: LetterFilters,
  options: {
    usedBase?: ReadonlySet<string>;
    randomInt?: RandomIntFn;
  } = {},
): DrawResult {
  const randomInt = options.randomInt ?? createCryptoRandomInt();
  const used =
    filters.noRepeatSession && options.usedBase
      ? options.usedBase
      : undefined;
  const pool = eligiblePool(filters, used);
  const baseSize = eligiblePool({
    poolMode: filters.poolMode,
    customLetters: filters.customLetters,
    excluded: filters.excluded,
    yAsVowel: filters.yAsVowel,
  }).length;

  if (pool.length === 0) {
    return {
      letters: [],
      bases: [],
      poolSize: baseSize,
      requested: 1,
      exhausted: true,
      message: describeEmptyPool(filters, baseSize),
    };
  }

  const base = pool[randomInt(pool.length)]!;
  return {
    letters: [applyCase(base, filters.caseMode, randomInt)],
    bases: [base],
    poolSize: pool.length,
    requested: 1,
    exhausted: false,
  };
}

export function drawMany(
  filters: LetterFilters,
  settings: MultipleSettings,
  options: {
    usedBase?: ReadonlySet<string>;
    randomInt?: RandomIntFn;
  } = {},
): DrawResult {
  const randomInt = options.randomInt ?? createCryptoRandomInt();
  const requested = clampCount(settings.count);
  const sessionUsed =
    filters.noRepeatSession && options.usedBase
      ? options.usedBase
      : undefined;
  const pool = eligiblePool(filters, sessionUsed);
  const fullEligible = eligiblePool({
    poolMode: filters.poolMode,
    customLetters: filters.customLetters,
    excluded: filters.excluded,
    yAsVowel: filters.yAsVowel,
  });

  if (pool.length === 0) {
    return {
      letters: [],
      bases: [],
      poolSize: fullEligible.length,
      requested,
      exhausted: true,
      message: describeEmptyPool(filters, fullEligible.length),
    };
  }

  if (settings.uniqueInBatch && requested > pool.length) {
    return {
      letters: [],
      bases: [],
      poolSize: pool.length,
      requested,
      exhausted: true,
      message: `Only ${pool.length} unique letter${pool.length === 1 ? "" : "s"} available. Lower the count or allow repeats.`,
    };
  }

  let bases: string[];
  if (settings.uniqueInBatch) {
    bases = sampleWithoutReplacement(pool, requested, randomInt);
  } else {
    bases = [];
    for (let i = 0; i < requested; i++) {
      bases.push(pool[randomInt(pool.length)]!);
    }
  }

  const letters = bases.map((b) => applyCase(b, filters.caseMode, randomInt));
  return {
    letters,
    bases,
    poolSize: pool.length,
    requested,
    exhausted: letters.length < requested,
  };
}

/** Full A–Z (or current eligible pool) shuffled once without duplicates. */
export function shuffleAlphabet(
  filters: LetterFilters,
  options: { randomInt?: RandomIntFn } = {},
): DrawResult {
  const randomInt = options.randomInt ?? createCryptoRandomInt();
  const pool = eligiblePool({
    poolMode: filters.poolMode === "custom" ? "custom" : "all",
    customLetters:
      filters.poolMode === "custom" ? filters.customLetters : [],
    excluded: filters.excluded,
    yAsVowel: filters.yAsVowel,
  });

  // Alphabet shuffle preset always wants the full eligible A–Z after exclusions
  // when not custom; use all/vowels/consonants via eligible pool of current filters.
  const working = eligiblePool(filters);
  if (working.length === 0) {
    const baseSize = basePool(
      filters.poolMode,
      filters.customLetters,
      filters.yAsVowel,
    ).length;
    return {
      letters: [],
      bases: [],
      poolSize: 0,
      requested: pool.length,
      exhausted: true,
      message: describeEmptyPool(filters, baseSize),
    };
  }

  const bases = fisherYatesShuffle(working, randomInt);
  return {
    letters: bases.map((b) => applyCase(b, filters.caseMode, randomInt)),
    bases,
    poolSize: working.length,
    requested: working.length,
    exhausted: false,
  };
}
