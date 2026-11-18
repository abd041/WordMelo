import type { Piece } from "./types";

const TOKEN =
  /(\s+)|([\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*)|([^\s\p{L}\p{N}]+)/gu;

export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function splitLines(text: string): string[] {
  if (text.length === 0) return [];
  return normalizeNewlines(text).split("\n");
}

export function countLines(text: string): number {
  return splitLines(text).length;
}

/** Lines for a unified diff. A final newline is a terminator, not an extra blank line. */
export function diffLines(text: string): string[] {
  if (text.length === 0) return [];
  const normalized = normalizeNewlines(text);
  const lines = normalized.split("\n");
  if (normalized.endsWith("\n")) lines.pop();
  return lines;
}

export function graphemes(text: string): string[] {
  if (text.length === 0) return [];
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((part) => part.segment);
  }
  return text.match(/\P{M}\p{M}*/gu) ?? [...text];
}

const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

/** Linear word count used by Text Compare. Avoids Intl.Segmenter on long pastes. */
export function countComparableWords(text: string): number {
  if (!text) return 0;
  return text.match(WORD)?.length ?? 0;
}

export function comparisonKey(
  value: string,
  ignoreCase: boolean,
): string {
  return ignoreCase ? value.toLocaleLowerCase("en-US") : value;
}

export function linePieces(
  text: string,
  options: {
    ignoreCase: boolean;
    ignoreWhitespace: boolean;
    ignoreEdgeSpace: boolean;
    ignoreEmptyLines: boolean;
  },
): Piece[] {
  return splitLines(text).flatMap((line, index) => {
    const lineNumber = index + 1;
    if (options.ignoreEmptyLines && line.trim() === "") return [];
    let key = line;
    if (options.ignoreEdgeSpace || options.ignoreWhitespace) key = key.trim();
    if (options.ignoreWhitespace) key = key.replace(/\s+/g, " ");
    key = comparisonKey(key, options.ignoreCase);
    return [{ display: line, key, line: lineNumber }];
  });
}

function edgeSplit(line: string): { lead: string; core: string; trail: string } {
  const lead = /^\s*/u.exec(line)?.[0] ?? "";
  const rest = line.slice(lead.length);
  const trail = /\s*$/u.exec(rest)?.[0] ?? "";
  return { lead, core: rest.slice(0, rest.length - trail.length), trail };
}

export function wordPieces(
  text: string,
  options: {
    ignoreCase: boolean;
    ignoreWhitespace: boolean;
    ignoreEdgeSpace: boolean;
    ignoreEmptyLines: boolean;
  },
): Piece[] {
  const lines = splitLines(text);
  const pieces: Piece[] = [];
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (options.ignoreEmptyLines && line.trim() === "") return;
    const edges = options.ignoreEdgeSpace
      ? edgeSplit(line)
      : { lead: "", core: line, trail: "" };
    const source = edges.core;
    const lead = edges.lead;
    const trail = edges.trail;
    const tokens = tokenizeContent(source);
    if (tokens.length === 0) {
      if (!options.ignoreWhitespace && !options.ignoreEdgeSpace && line.length > 0) {
        pieces.push({ display: line, key: line, line: lineNumber });
      }
      if (index < lines.length - 1 && !options.ignoreWhitespace && !options.ignoreEmptyLines) {
        pieces.push({ display: "\n", key: "\n", line: lineNumber });
      }
      return;
    }
    let pending = "";
    tokens.forEach((token, tokenIndex) => {
      const isSpace = /^\s+$/u.test(token);
      if (isSpace && options.ignoreWhitespace) {
        pending += token;
        return;
      }
      let display = pending + token;
      pending = "";
      if (tokenIndex === 0 && lead) display = lead + display;
      if (tokenIndex === tokens.length - 1 && trail && !isSpace) display += trail;
      const key = isSpace ? token : comparisonKey(token, options.ignoreCase);
      pieces.push({ display, key, line: lineNumber });
    });
    if (pending) {
      const previous = pieces.at(-1);
      if (previous && previous.line === lineNumber) previous.display += pending;
      else pieces.push({ display: pending, key: " ", line: lineNumber });
    }
    if (index < lines.length - 1 && !options.ignoreWhitespace) {
      pieces.push({ display: "\n", key: "\n", line: lineNumber });
    } else if (index < lines.length - 1 && options.ignoreWhitespace) {
      const previous = pieces.at(-1);
      if (previous) previous.display += "\n";
    }
  });
  return pieces;
}

function tokenizeContent(source: string): string[] {
  if (!source) return [];
  return source.match(TOKEN) ?? [source];
}

export function characterPieces(
  text: string,
  options: { ignoreCase: boolean; ignoreWhitespace: boolean },
): Piece[] {
  return graphemes(normalizeNewlines(text)).flatMap((grapheme) => {
    if (options.ignoreWhitespace && /^\s$/u.test(grapheme)) return [];
    return [
      {
        display: grapheme,
        key: comparisonKey(grapheme, options.ignoreCase),
        line: null,
      },
    ];
  });
}
