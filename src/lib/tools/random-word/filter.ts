import {
  POS_ADJECTIVE,
  POS_NOUN,
  POS_VERB,
  type DifficultyFilter,
  type VocabEntry,
  type WordFilters,
  type WordTypeFilter,
} from "./types";

function posMask(type: WordTypeFilter): number | null {
  switch (type) {
    case "noun":
      return POS_NOUN;
    case "verb":
      return POS_VERB;
    case "adjective":
      return POS_ADJECTIVE;
    default:
      return null;
  }
}

function difficultyMatch(d: VocabEntry["difficulty"], filter: DifficultyFilter): boolean {
  if (filter === "all") return true;
  if (filter === "easy") return d === 0;
  if (filter === "medium") return d === 1;
  return d === 2;
}

export function normalizeLetter(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (!t) return "";
  if (!/^[a-z]$/.test(t)) return "";
  return t;
}

export function clampCount(n: number): number {
  if (!Number.isFinite(n)) return 5;
  return Math.min(100, Math.max(1, Math.floor(n)));
}

export function validateLengthFilters(filters: WordFilters): string | null {
  if (filters.lengthMode === "exact") {
    if (filters.exactLength < 3 || filters.exactLength > 14) {
      return "Exact length must be between 3 and 14 letters.";
    }
  }
  if (filters.lengthMode === "range") {
    if (filters.minLength < 3 || filters.maxLength > 14) {
      return "Length range must stay between 3 and 14 letters.";
    }
    if (filters.minLength > filters.maxLength) {
      return "Minimum length cannot be greater than maximum length.";
    }
  }
  if (filters.startsWith && !/^[a-z]$/i.test(filters.startsWith.trim())) {
    return "Starting letter must be a single English letter A–Z.";
  }
  if (filters.endsWith && !/^[a-z]$/i.test(filters.endsWith.trim())) {
    return "Ending letter must be a single English letter A–Z.";
  }
  return null;
}

export function matchesFilters(entry: VocabEntry, filters: WordFilters): boolean {
  const mask = posMask(filters.wordType);
  if (mask !== null && (entry.pos & mask) === 0) return false;

  if (filters.vocabulary === "common" && !entry.common) return false;
  if (filters.vocabulary === "extended" && entry.common) return false;

  if (!difficultyMatch(entry.difficulty, filters.difficulty)) return false;

  const len = entry.word.length;
  if (filters.lengthMode === "exact" && len !== filters.exactLength) return false;
  if (filters.lengthMode === "range") {
    if (len < filters.minLength || len > filters.maxLength) return false;
  }

  const start = normalizeLetter(filters.startsWith);
  if (start && !entry.word.startsWith(start)) return false;

  const end = normalizeLetter(filters.endsWith);
  if (end && !entry.word.endsWith(end)) return false;

  return true;
}

/** Filter the eligible dataset first, then sample. */
export function filterVocabulary(
  entries: readonly VocabEntry[],
  filters: WordFilters,
  exclude?: ReadonlySet<string>,
): VocabEntry[] {
  const out: VocabEntry[] = [];
  for (const entry of entries) {
    if (exclude?.has(entry.word)) continue;
    if (matchesFilters(entry, filters)) out.push(entry);
  }
  return out;
}

export function describeEmptyPool(filters: WordFilters, poolBeforeExclude: number): string {
  if (poolBeforeExclude === 0) {
    return "No words match these filters. Try widening length, letters, difficulty, or vocabulary coverage.";
  }
  return "Every matching word was already used in this no-repeat session. Clear history or turn off no-repeat to continue.";
}
