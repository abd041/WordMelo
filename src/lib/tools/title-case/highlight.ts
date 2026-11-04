import type { HighlightSegment } from "./types";

/**
 * Build safe highlight segments by aligning word / punctuation / whitespace tokens.
 * Marks tokens whose text changed (typically letter case). Separators and
 * unchanged punctuation stay unmarked. Does not emit HTML — React-safe spans.
 */
export function buildHighlightSegments(
  original: string,
  converted: string,
): HighlightSegment[] {
  if (!original && !converted) return [];
  if (original === converted) {
    return [{ text: converted, changed: false }];
  }

  const origParts = splitKeepSeparators(original);
  const convParts = splitKeepSeparators(converted);

  // Fallback when tokenization diverges (rare Unicode edge cases)
  if (origParts.length !== convParts.length) {
    return [{ text: converted, changed: original !== converted }];
  }

  return convParts.map((part, i) => {
    const prev = origParts[i] ?? "";
    if (/^\s+$/u.test(part)) {
      return { text: part, changed: false };
    }
    // Punctuation-only tokens: never treat as capitalization changes
    if (!/\p{L}/u.test(part) && !/\p{L}/u.test(prev)) {
      return { text: part, changed: false };
    }
    return { text: part, changed: part !== prev };
  });
}

/** Count of tokens whose capitalization (or spelling) changed. */
export function countChangedTokens(segments: HighlightSegment[]): number {
  return segments.filter((s) => s.changed).length;
}

/**
 * Split into whitespace, word cores (letters/digits + internal ’/'/-),
 * and punctuation runs so colons/quotes are not glued to words.
 */
function splitKeepSeparators(text: string): string[] {
  const parts: string[] = [];
  const re =
    /(\s+)|([\p{L}\p{N}]+(?:['\u2019\-][\p{L}\p{N}]+)*)|([^\s\p{L}\p{N}]+)/gu;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    parts.push(match[0]);
  }
  return parts;
}
