/**
 * Grapheme-aware helpers for Unicode fancy-text transforms.
 * Prefer Intl.Segmenter; fall back to code-point iteration.
 */

const ZWJ = "\u200D";
const VS16 = "\uFE0F";
const COMBINING_MARK = /\p{M}/u;
const EXTENDED_PICTOGRAPHIC = /\p{Extended_Pictographic}/u;

let segmenter: Intl.Segmenter | null | undefined;

function getSegmenter(): Intl.Segmenter | null {
  if (segmenter !== undefined) return segmenter;
  try {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return segmenter;
    }
  } catch {
    // Unsupported environment
  }
  segmenter = null;
  return null;
}

/** Split text into user-perceived grapheme clusters. */
export function splitGraphemes(text: string): string[] {
  if (!text) return [];
  const seg = getSegmenter();
  if (seg) {
    return Array.from(seg.segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

/** True when a cluster looks like emoji / ZWJ sequence (leave untouched). */
export function isEmojiLikeCluster(cluster: string): boolean {
  if (!cluster) return false;
  if (cluster.includes(ZWJ) || cluster.includes(VS16)) return true;
  if (EXTENDED_PICTOGRAPHIC.test(cluster)) return true;
  // Keycap sequences: digit/symbol + U+FE0F? + U+20E3
  if (cluster.includes("\u20E3")) return true;
  return false;
}

/**
 * True when the cluster is a single base character we may remap,
 * optionally followed only by combining marks we should preserve as-is
 * by leaving the whole cluster unchanged for letter maps.
 */
export function getBaseCodePoint(cluster: string): number | null {
  if (!cluster || isEmojiLikeCluster(cluster)) return null;
  const points = Array.from(cluster);
  if (points.length === 0) return null;
  const first = points[0]!.codePointAt(0);
  if (first === undefined) return null;
  // Multi-codepoint clusters with non-mark extras: do not remap
  if (points.length > 1) {
    const restAreMarks = points.slice(1).every((ch) => COMBINING_MARK.test(ch));
    if (!restAreMarks) return null;
    // Combining marks on a letter: leave whole cluster alone to avoid corruption
    return null;
  }
  return first;
}

export function codePointToString(cp: number): string {
  return String.fromCodePoint(cp);
}

export function isAsciiLetter(cp: number): boolean {
  return (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a);
}

export function isAsciiDigit(cp: number): boolean {
  return cp >= 0x30 && cp <= 0x39;
}

export function isWhitespaceCluster(cluster: string): boolean {
  return /^\s+$/u.test(cluster);
}
