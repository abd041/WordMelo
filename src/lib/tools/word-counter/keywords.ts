const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else", "so", "because",
  "as", "of", "at", "by", "for", "with", "about", "into", "onto", "over",
  "after", "before", "between", "from", "to", "in", "on", "out", "up", "down",
  "is", "am", "are", "was", "were", "be", "been", "being", "do", "does", "did",
  "have", "has", "had", "i", "you", "he", "she", "it", "we", "they", "me",
  "him", "her", "us", "them", "my", "your", "his", "its", "our", "their",
  "this", "that", "these", "those", "not", "no", "nor", "too", "very", "just",
  "can", "will", "would", "should", "could", "may", "might", "than", "what",
  "when", "where", "who", "whom", "which", "how", "there", "here",
]);

export interface KeywordRow {
  keyword: string;
  count: number;
  /** Null when the draft has no phrases of this length. */
  density: number | null;
}

export interface KeywordAnalysis {
  rows: KeywordRow[];
  /** Number of unigrams, or adjacent pairs/triples, used as the density base. */
  denominator: number;
  phraseSize: 1 | 2 | 3;
  excludeStopWords: boolean;
}

export function keywordDensityPercent(
  count: number,
  denominator: number,
): number | null {
  if (!Number.isFinite(count) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return Math.round((count / denominator) * 1000) / 10;
}

function normalizeToken(word: string): string {
  return word.toLocaleLowerCase("en-US");
}

export function analyzeKeywords(
  words: string[],
  options: {
    phraseSize?: 1 | 2 | 3;
    limit?: number;
    excludeStopWords?: boolean;
  } = {},
): KeywordAnalysis {
  const phraseSize = options.phraseSize ?? 1;
  const limit = options.limit ?? 10;
  const excludeStopWords = options.excludeStopWords ?? false;
  const tokens = words.map(normalizeToken).filter(Boolean);
  const denominator = Math.max(0, tokens.length - phraseSize + 1);

  if (denominator === 0 || limit <= 0) {
    return { rows: [], denominator, phraseSize, excludeStopWords };
  }

  const counts = new Map<string, number>();

  for (let index = 0; index < denominator; index += 1) {
    const slice = tokens.slice(index, index + phraseSize);
    if (
      excludeStopWords &&
      slice.some((token) => STOP_WORDS.has(token))
    ) {
      continue;
    }
    const key = slice.join(" ");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const rows = Array.from(counts.entries())
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: keywordDensityPercent(count, denominator),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.keyword.localeCompare(b.keyword, "en");
    })
    .slice(0, limit);

  return { rows, denominator, phraseSize, excludeStopWords };
}
