import type { InputFormat } from "./types";

export const MAX_INPUT_CHARS = 80_000;

export interface PreparedInput {
  text: string;
  truncated: boolean;
  omitted: number;
  droppedIncompleteItem: boolean;
  totalCharacters: number;
  processedCharacters: number;
}

export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function prepareInput(text: string, format: InputFormat = "lines"): PreparedInput {
  const totalCharacters = text.length;
  if (totalCharacters <= MAX_INPUT_CHARS) {
    return {
      text,
      truncated: false,
      omitted: 0,
      droppedIncompleteItem: false,
      totalCharacters,
      processedCharacters: totalCharacters,
    };
  }

  const end = snapToSafeLimit(text, MAX_INPUT_CHARS);
  const sliced = text.slice(0, end);
  const { text: complete, droppedIncompleteItem } = dropIncompleteTail(sliced, text, end, format);
  return {
    text: complete,
    truncated: true,
    omitted: totalCharacters - complete.length,
    droppedIncompleteItem,
    totalCharacters,
    processedCharacters: complete.length,
  };
}

function snapToSafeLimit(text: string, limit: number): number {
  let end = Math.min(limit, text.length);
  if (end <= 0) return 0;
  const tail = text.charCodeAt(end - 1);
  if (tail >= 0xd800 && tail <= 0xdbff) end -= 1;
  return snapToGraphemeBoundary(text, end);
}

function snapToGraphemeBoundary(text: string, end: number): number {
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function" || end <= 0) return end;
  const start = Math.max(0, end - 24);
  const chunk = text.slice(start, end);
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  let safe = start;
  for (const part of segmenter.segment(chunk)) {
    const next = start + part.index + part.segment.length;
    if (next > end) break;
    safe = next;
  }
  return safe > 0 ? safe : end;
}

function dropIncompleteTail(
  sliced: string,
  original: string,
  end: number,
  format: InputFormat,
): { text: string; droppedIncompleteItem: boolean } {
  const next = original.slice(end);
  if (endsOnCompleteItem(sliced, next, format)) {
    return { text: sliced, droppedIncompleteItem: false };
  }
  const cut = lastItemBoundary(sliced, format);
  if (cut < 0) return { text: "", droppedIncompleteItem: true };
  return { text: sliced.slice(0, cut), droppedIncompleteItem: true };
}

function itemTerminators(format: InputFormat): string[] {
  if (format === "comma") return [",", "\n", "\r"];
  if (format === "semicolon") return [";", "\n", "\r"];
  return ["\n", "\r"];
}

function endsOnCompleteItem(sliced: string, omitted: string, format: InputFormat): boolean {
  const terminators = itemTerminators(format);
  if (sliced.length === 0) return true;
  if (terminators.includes(sliced[sliced.length - 1] ?? "")) return true;
  const next = omitted[0];
  return next !== undefined && terminators.includes(next);
}

function lastItemBoundary(text: string, format: InputFormat): number {
  const terminators = itemTerminators(format);
  for (let index = text.length - 1; index >= 0; index -= 1) {
    if (terminators.includes(text[index] ?? "")) return index;
  }
  return -1;
}

export function splitItems(text: string, format: InputFormat): string[] {
  const normalized = normalizeNewlines(text);
  if (format === "comma") return splitDelimiter(normalized, ",");
  if (format === "semicolon") return splitDelimiter(normalized, ";");
  if (normalized.length === 0) return [];
  return normalized.split("\n");
}

function splitDelimiter(text: string, delimiter: "," | ";"): string[] {
  if (text.length === 0) return [];
  return text.split(delimiter).flatMap((chunk) => {
    const parts = chunk.split("\n");
    return parts.length === 1 ? parts : parts.map((part) => part.trimEnd());
  });
}

export function countLines(text: string): number {
  if (text.length === 0) return 0;
  return normalizeNewlines(text).split("\n").length;
}

export function graphemeLength(text: string): number {
  if (!text) return 0;
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    let count = 0;
    for (const part of segmenter.segment(text)) {
      void part;
      count += 1;
    }
    return count;
  }
  return Array.from(text).length;
}
