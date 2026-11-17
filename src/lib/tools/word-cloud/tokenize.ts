const FALLBACK_TOKEN =
  /[\p{L}\p{M}\p{N}]+(?:['’-][\p{L}\p{M}\p{N}]+)*/gu;

const EDGE_PUNCT = /^['’\-–]+|['’\-–]+$/gu;

interface RawPart {
  segment: string;
  isWordLike: boolean;
}

function hasLetterOrNumber(token: string): boolean {
  return /[\p{L}\p{N}]/u.test(token);
}

function cleanToken(token: string): string {
  return token.replace(EDGE_PUNCT, "");
}

function joinCompounds(parts: RawPart[]): string[] {
  const tokens: string[] = [];
  let index = 0;
  while (index < parts.length) {
    const part = parts[index];
    if (!part || !part.isWordLike) {
      index += 1;
      continue;
    }
    let token = part.segment;
    while (index + 2 < parts.length) {
      const middle = parts[index + 1]?.segment ?? "";
      const next = parts[index + 2];
      const joiner = middle === "-" || middle === "–" || middle === "'" || middle === "’";
      if (!joiner || !next?.isWordLike) break;
      token += middle + next.segment;
      index += 2;
    }
    const cleaned = cleanToken(token);
    if (cleaned && hasLetterOrNumber(cleaned)) tokens.push(cleaned);
    index += 1;
  }
  return tokens;
}

function segmentWithIntl(text: string): string[] | null {
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") {
    return null;
  }
  try {
    const segmenter = new Intl.Segmenter("en", { granularity: "word" });
    const parts: RawPart[] = [];
    for (const part of segmenter.segment(text)) {
      parts.push({
        segment: part.segment,
        isWordLike: Boolean(part.isWordLike),
      });
    }
    return joinCompounds(parts);
  } catch {
    return null;
  }
}

function segmentWithRegex(text: string): string[] {
  const matched = text.match(FALLBACK_TOKEN) ?? [];
  return matched
    .map((token) => cleanToken(token))
    .filter((token) => token.length > 0 && hasLetterOrNumber(token));
}

/** Word-like tokens only. Punctuation-only pieces are never returned. */
export function tokenize(text: string): string[] {
  return segmentWithIntl(text) ?? segmentWithRegex(text);
}

export function wordKey(token: string, ignoreCase: boolean): string {
  return ignoreCase ? token.toLocaleLowerCase("en-US") : token;
}
