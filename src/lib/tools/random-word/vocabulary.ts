import {
  POS_ADJECTIVE,
  POS_NOUN,
  POS_VERB,
  type VocabEntry,
} from "./types";

export interface VocabularyPayload {
  version: number;
  generatedAt: string;
  encoding: Record<string, string>;
  stats: {
    total: number;
    nouns: number;
    verbs: number;
    adjectives: number;
    common: number;
    extended: number;
    easy: number;
    medium: number;
    hard: number;
  };
  words: Array<[string, number, number, number, number]>;
}

export const VOCABULARY_URL = "/data/random-words/vocabulary.json";

let cached: VocabEntry[] | null = null;
let inflight: Promise<VocabEntry[]> | null = null;

export function parseVocabularyPayload(payload: VocabularyPayload): VocabEntry[] {
  const entries: VocabEntry[] = [];
  for (const row of payload.words) {
    const [word, pos, rank, common, difficulty] = row;
    if (typeof word !== "string" || !/^[a-z]+$/.test(word)) continue;
    if (typeof pos !== "number" || pos <= 0) continue;
    entries.push({
      word,
      pos,
      rank: typeof rank === "number" ? rank : 0,
      common: common === 1,
      difficulty: (difficulty === 0 || difficulty === 1 || difficulty === 2
        ? difficulty
        : 2) as 0 | 1 | 2,
    });
  }
  return entries;
}

export async function loadVocabulary(
  fetchImpl: typeof fetch = fetch,
): Promise<VocabEntry[]> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const res = await fetchImpl(VOCABULARY_URL);
    if (!res.ok) {
      throw new Error(`Failed to load vocabulary (${res.status})`);
    }
    const payload = (await res.json()) as VocabularyPayload;
    cached = parseVocabularyPayload(payload);
    return cached;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/** Test helper — inject parsed entries without network. */
export function setVocabularyCacheForTests(entries: VocabEntry[] | null): void {
  cached = entries;
}

export function hasPos(entry: VocabEntry, flag: number): boolean {
  return (entry.pos & flag) !== 0;
}

export function posLabels(pos: number): string[] {
  const labels: string[] = [];
  if (pos & POS_NOUN) labels.push("noun");
  if (pos & POS_VERB) labels.push("verb");
  if (pos & POS_ADJECTIVE) labels.push("adjective");
  return labels;
}
