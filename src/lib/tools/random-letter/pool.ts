import {
  ALPHABET,
  DEFAULT_VOWELS,
  type LetterFilters,
  type PoolMode,
} from "./types";

const LETTER_RE = /^[A-Za-z]$/;

export function normalizeLetter(ch: string): string | null {
  const t = ch.trim();
  if (!LETTER_RE.test(t)) return null;
  return t.toUpperCase();
}

/** Parse custom pool text: no delimiter, spaces, commas, or newlines. */
export function parseCustomLetters(raw: string): {
  letters: string[];
  rejected: string[];
} {
  const rejected: string[] = [];
  const seen = new Set<string>();
  const letters: string[] = [];

  const tokens = raw
    .split(/[\s,]+/)
    .flatMap((part) => (part.length > 1 && !/^[A-Za-z]$/.test(part) ? part.split("") : [part]))
    .map((t) => t.trim())
    .filter(Boolean);

  // Also accept contiguous ABCD without separators
  if (tokens.length === 1 && /^[A-Za-z]+$/.test(tokens[0]!)) {
    for (const ch of tokens[0]!) {
      const n = normalizeLetter(ch);
      if (!n) {
        rejected.push(ch);
        continue;
      }
      if (!seen.has(n)) {
        seen.add(n);
        letters.push(n);
      }
    }
    return { letters, rejected };
  }

  for (const token of tokens) {
    if (token.length === 1) {
      const n = normalizeLetter(token);
      if (!n) {
        rejected.push(token);
        continue;
      }
      if (!seen.has(n)) {
        seen.add(n);
        letters.push(n);
      }
    } else if (/^[A-Za-z]+$/.test(token)) {
      for (const ch of token) {
        const n = normalizeLetter(ch);
        if (!n) continue;
        if (!seen.has(n)) {
          seen.add(n);
          letters.push(n);
        }
      }
    } else {
      rejected.push(token);
    }
  }

  return { letters, rejected };
}

export function vowelsFor(yAsVowel: boolean): string[] {
  return yAsVowel ? [...DEFAULT_VOWELS, "Y"] : [...DEFAULT_VOWELS];
}

export function consonantsFor(yAsVowel: boolean): string[] {
  const vowels = new Set(vowelsFor(yAsVowel));
  return ALPHABET.filter((l) => !vowels.has(l));
}

export function basePool(
  mode: PoolMode,
  customLetters: readonly string[],
  yAsVowel: boolean,
): string[] {
  switch (mode) {
    case "all":
      return [...ALPHABET];
    case "vowels":
      return vowelsFor(yAsVowel);
    case "consonants":
      return consonantsFor(yAsVowel);
    case "custom":
      return customLetters
        .map((c) => normalizeLetter(c))
        .filter((c): c is string => Boolean(c))
        .filter((c, i, arr) => arr.indexOf(c) === i);
    default:
      return [...ALPHABET];
  }
}

/**
 * Eligible uppercase base letters after exclusions.
 * Exclusions apply after the base pool is selected.
 */
export function eligiblePool(
  filters: Pick<
    LetterFilters,
    "poolMode" | "customLetters" | "excluded" | "yAsVowel"
  >,
  usedBase?: ReadonlySet<string>,
): string[] {
  const base = basePool(
    filters.poolMode,
    filters.customLetters,
    filters.yAsVowel,
  );
  const excluded = new Set(
    filters.excluded
      .map((c) => normalizeLetter(c))
      .filter((c): c is string => Boolean(c)),
  );
  let pool = base.filter((l) => !excluded.has(l));
  if (usedBase && usedBase.size > 0) {
    pool = pool.filter((l) => !usedBase.has(l));
  }
  return pool;
}

export function describeEmptyPool(
  filters: LetterFilters,
  baseSize: number,
): string {
  if (filters.poolMode === "custom" && filters.customLetters.length === 0) {
    return "Enter at least one A–Z letter for a custom pool.";
  }
  if (baseSize === 0) {
    return "No letters in the current pool. Adjust the pool or exclusions.";
  }
  if (filters.excluded.length > 0) {
    return "Every letter in this pool is excluded. Clear some exclusions.";
  }
  if (filters.noRepeatSession) {
    return "All eligible letters were used this session. Reset the session to continue.";
  }
  return "No eligible letters with the current settings.";
}

export function poolLabel(filters: LetterFilters): string {
  const size = eligiblePool(filters).length;
  const mode =
    filters.poolMode === "all"
      ? "A–Z"
      : filters.poolMode === "vowels"
        ? filters.yAsVowel
          ? "Vowels (incl. Y)"
          : "Vowels"
        : filters.poolMode === "consonants"
          ? filters.yAsVowel
            ? "Consonants (Y as vowel)"
            : "Consonants"
          : "Custom";
  return `${mode} · ${size} eligible`;
}
