import { myersDiff, type ScriptItem } from "./myers";
import {
  characterPieces,
  countComparableWords,
  diffLines,
  graphemes,
  linePieces,
  wordPieces,
} from "./segment";
import type {
  AlignedSegment,
  CompareCoverage,
  CompareDetail,
  CompareResult,
  CompareSettings,
  CompareStats,
  Piece,
} from "./types";

export const MAX_INPUT_CHARS = 80_000;
export const CHARACTER_DIRECT_LIMIT = 1_500;
const MAX_DISTANCE = 800;

export interface PreparedInput {
  text: string;
  truncated: boolean;
  omitted: number;
}

export function prepareInput(text: string): PreparedInput {
  if (text.length <= MAX_INPUT_CHARS) return { text, truncated: false, omitted: 0 };
  let end = MAX_INPUT_CHARS;
  const tail = text.charCodeAt(end - 1);
  if (tail >= 0xd800 && tail <= 0xdbff) end -= 1;
  return { text: text.slice(0, end), truncated: true, omitted: text.length - end };
}

/**
 * Similarity is an alignment score, not a meaning or plagiarism score.
 * similarity = 2 × matching units / (units in A + units in B), as a percentage.
 * Units follow the active comparison after normalization. Swapping the texts
 * does not change the score. Two empty texts score 100 because nothing differs.
 * Incomplete alignments return null instead of a score.
 */
export function similarityPercent(unchanged: number, left: number, right: number): number {
  if (left + right === 0) return 100;
  return Math.round((2000 * unchanged) / (left + right)) / 10;
}

export interface LineDiffFile {
  linesA: string[];
  linesB: string[];
  script: ScriptItem[];
  limited: boolean;
  includedA: string;
  includedB: string;
  excludedLeft: number;
  excludedRight: number;
}

/** Line alignment used by the .diff download. Independent of the on-screen mode. */
export function lineDiffFile(original: string, modified: string): LineDiffFile {
  const left = prepareInput(original);
  const right = prepareInput(modified);
  const linesA = diffLines(left.text);
  const linesB = diffLines(right.text);
  const piecesA = linesA.map((line, index) => ({ display: line, key: line, line: index + 1 }));
  const piecesB = linesB.map((line, index) => ({ display: line, key: line, line: index + 1 }));
  const aligned = alignPieces(piecesA, piecesB);
  return {
    linesA,
    linesB,
    script: aligned.limited ? [] : aligned.script,
    limited: aligned.limited,
    includedA: left.text,
    includedB: right.text,
    excludedLeft: left.omitted,
    excludedRight: right.omitted,
  };
}

export function compareTexts(
  original: string,
  modified: string,
  settings: Pick<
    CompareSettings,
    | "mode"
    | "ignoreCase"
    | "ignoreWhitespace"
    | "ignoreEdgeSpace"
    | "ignoreEmptyLines"
  >,
): CompareResult {
  const leftInput = prepareInput(original);
  const rightInput = prepareInput(modified);
  const warnings: string[] = [];
  const partialNote = truncationWarning(leftInput, rightInput);
  if (partialNote) warnings.push(partialNote);
  const coverage: CompareCoverage = {
    includedLeft: leftInput.text.length,
    includedRight: rightInput.text.length,
    excludedLeft: leftInput.omitted,
    excludedRight: rightInput.omitted,
  };

  if (settings.mode === "line") {
    return finishAlignment(
      alignPieces(linePieces(leftInput.text, settings), linePieces(rightInput.text, settings)),
      "line",
      "lines",
      warnings,
      leftInput.truncated || rightInput.truncated,
      coverage,
      original,
      modified,
    );
  }

  if (settings.mode === "character") {
    const graphA = graphemeCount(leftInput.text);
    const graphB = graphemeCount(rightInput.text);
    if (
      graphA <= CHARACTER_DIRECT_LIMIT &&
      graphB <= CHARACTER_DIRECT_LIMIT &&
      graphA * graphB <= 1_000_000
    ) {
      const aligned = alignPieces(
        characterPieces(leftInput.text, settings),
        characterPieces(rightInput.text, settings),
      );
      if (!aligned.limited) {
        return finishAlignment(
          aligned,
          "character",
          "characters",
          warnings,
          leftInput.truncated || rightInput.truncated,
          coverage,
          original,
          modified,
        );
      }
      warnings.push(
        "Character alignment exceeded the processing limit, so this result uses a coarser comparison.",
      );
    } else {
      warnings.push(
        "Character comparison is only completed for short text. This result uses words, then lines if needed.",
      );
    }
  }

  const wordAligned = alignPieces(
    wordPieces(leftInput.text, settings),
    wordPieces(rightInput.text, settings),
  );
  if (!wordAligned.limited) {
    const refined =
      settings.mode === "character"
        ? {
            ...wordAligned,
            segments: refineReplacements(wordAligned.segments, settings.ignoreCase),
          }
        : wordAligned;
    return finishAlignment(
      refined,
      "word",
      "words",
      warnings,
      leftInput.truncated || rightInput.truncated,
      coverage,
      original,
      modified,
    );
  }

  warnings.push(
    "Word alignment exceeded the processing limit, so this result uses a line comparison instead.",
  );
  const lineAligned = alignPieces(
    linePieces(leftInput.text, settings),
    linePieces(rightInput.text, settings),
  );
  return finishAlignment(
    lineAligned,
    "line",
    "lines",
    warnings,
    leftInput.truncated || rightInput.truncated,
    coverage,
    original,
    modified,
  );
}

function graphemeCount(text: string): number {
  if (text.length > CHARACTER_DIRECT_LIMIT * 8) return text.length;
  return graphemes(text).length;
}

function truncationWarning(left: PreparedInput, right: PreparedInput): string | null {
  if (!left.truncated && !right.truncated) return null;
  const limit = MAX_INPUT_CHARS.toLocaleString("en-US");
  const side = (name: string, input: PreparedInput) =>
    input.truncated
      ? `${name} excluded ${input.omitted.toLocaleString("en-US")} characters after the first ${limit}.`
      : `${name} is within the limit.`;
  return [
    "This comparison is partial.",
    side("Text A", left),
    side("Text B", right),
    "Content past the limit is excluded. A similarity score covers only the included text and does not mean the full documents match.",
  ].join(" ");
}

interface Alignment {
  segments: AlignedSegment[];
  script: ScriptItem[];
  limited: boolean;
  unaligned: { left: number; right: number } | null;
}

function alignPieces(left: Piece[], right: Piece[]): Alignment {
  const start = sharedPrefix(left, right);
  const end = sharedSuffix(left, right, start);
  const prefixA = left.slice(0, start);
  const prefixB = right.slice(0, start);
  const midA = left.slice(start, left.length - end);
  const midB = right.slice(start, right.length - end);
  const suffixA = left.slice(left.length - end);
  const suffixB = right.slice(right.length - end);
  const prefix = equalRun(prefixA, prefixB);
  const suffix = equalRun(suffixA, suffixB);

  if (midA.length === 0 && midB.length === 0) {
    return { segments: prefix, script: equalScript(prefixA.length), limited: false, unaligned: null };
  }

  const product = midA.length * midB.length;
  const distance = product > 2_000_000 ? Math.min(MAX_DISTANCE, 250) : MAX_DISTANCE;
  const myers = myersDiff(
    midA.length,
    midB.length,
    (aIndex, bIndex) => midA[aIndex]!.key === midB[bIndex]!.key,
    distance,
  );
  if (myers.limited) {
    return {
      segments: [...prefix, gapSegment(), ...suffix],
      script: [],
      limited: true,
      unaligned: { left: midA.length, right: midB.length },
    };
  }
  return {
    segments: [...prefix, ...scriptToSegments(myers.script, midA, midB), ...suffix],
    script: [
      ...equalScript(prefixA.length),
      ...myers.script.map((item) => ({
        type: item.type,
        aIndex: item.aIndex + start,
        bIndex: item.bIndex + start,
      })),
      ...equalScript(suffixA.length).map((item) => ({
        type: item.type,
        aIndex: item.aIndex + start + midA.length,
        bIndex: item.bIndex + start + midB.length,
      })),
    ],
    limited: false,
    unaligned: null,
  };
}

function sharedPrefix(left: Piece[], right: Piece[]): number {
  const limit = Math.min(left.length, right.length);
  let index = 0;
  while (index < limit && left[index]!.key === right[index]!.key) index += 1;
  return index;
}

function sharedSuffix(left: Piece[], right: Piece[], prefix: number): number {
  const limit = Math.min(left.length, right.length) - prefix;
  let end = 0;
  while (
    end < limit &&
    left[left.length - 1 - end]!.key === right[right.length - 1 - end]!.key
  ) {
    end += 1;
  }
  return end;
}

function equalScript(length: number): ScriptItem[] {
  return Array.from({ length }, (_, index) => ({ type: "equal" as const, aIndex: index, bIndex: index }));
}

function equalRun(left: Piece[], right: Piece[]): AlignedSegment[] {
  if (left.length === 0 || right.length === 0) return [];
  return [
    {
      type: "equal",
      left: left.map((piece) => piece.display).join(""),
      right: right.map((piece) => piece.display).join(""),
      units: left.length,
      leftLine: left[0]?.line ?? null,
      rightLine: right[0]?.line ?? null,
    },
  ];
}

function gapSegment(): AlignedSegment {
  return { type: "gap", left: "", right: "", units: 0, leftLine: null, rightLine: null };
}

function scriptToSegments(script: ScriptItem[], left: Piece[], right: Piece[]): AlignedSegment[] {
  const raw: AlignedSegment[] = [];
  let index = 0;
  while (index < script.length) {
    const op = script[index]!;
    if (op.type === "equal") {
      const displaysA: string[] = [];
      const displaysB: string[] = [];
      let units = 0;
      const leftLine = left[op.aIndex]?.line ?? null;
      const rightLine = right[op.bIndex]?.line ?? null;
      while (index < script.length && script[index]?.type === "equal") {
        const item = script[index]!;
        displaysA.push(left[item.aIndex]?.display ?? "");
        displaysB.push(right[item.bIndex]?.display ?? "");
        units += 1;
        index += 1;
      }
      raw.push({
        type: "equal",
        left: displaysA.join(""),
        right: displaysB.join(""),
        units,
        leftLine,
        rightLine,
      });
      continue;
    }
    if (op.type === "delete") {
      const deleted: ScriptItem[] = [];
      while (index < script.length && script[index]?.type === "delete") {
        deleted.push(script[index]!);
        index += 1;
      }
      const inserted: ScriptItem[] = [];
      while (index < script.length && script[index]?.type === "insert") {
        inserted.push(script[index]!);
        index += 1;
      }
      const pairs = Math.min(deleted.length, inserted.length);
      for (let pair = 0; pair < pairs; pair += 1) {
        const remove = deleted[pair]!;
        const add = inserted[pair]!;
        raw.push({
          type: "replace",
          left: left[remove.aIndex]?.display ?? "",
          right: right[add.bIndex]?.display ?? "",
          units: 1,
          leftLine: left[remove.aIndex]?.line ?? null,
          rightLine: right[add.bIndex]?.line ?? null,
        });
      }
      for (const remove of deleted.slice(pairs)) {
        raw.push({
          type: "delete",
          left: left[remove.aIndex]?.display ?? "",
          right: "",
          units: 1,
          leftLine: left[remove.aIndex]?.line ?? null,
          rightLine: null,
        });
      }
      for (const add of inserted.slice(pairs)) {
        raw.push({
          type: "insert",
          left: "",
          right: right[add.bIndex]?.display ?? "",
          units: 1,
          leftLine: null,
          rightLine: right[add.bIndex]?.line ?? null,
        });
      }
      continue;
    }
    const inserted: ScriptItem[] = [];
    while (index < script.length && script[index]?.type === "insert") {
      inserted.push(script[index]!);
      index += 1;
    }
    for (const add of inserted) {
      raw.push({
        type: "insert",
        left: "",
        right: right[add.bIndex]?.display ?? "",
        units: 1,
        leftLine: null,
        rightLine: right[add.bIndex]?.line ?? null,
      });
    }
  }
  return raw;
}

function refineReplacements(segments: AlignedSegment[], ignoreCase: boolean): AlignedSegment[] {
  const refined: AlignedSegment[] = [];
  for (const segment of segments) {
    if (segment.type !== "replace") {
      refined.push(segment);
      continue;
    }
    const left = graphemes(segment.left);
    const right = graphemes(segment.right);
    if (left.length === 0 || right.length === 0 || left.length * right.length > 4_000) {
      refined.push(segment);
      continue;
    }
    const leftPieces: Piece[] = left.map((display) => ({
      display,
      key: ignoreCase ? display.toLocaleLowerCase("en-US") : display,
      line: segment.leftLine,
    }));
    const rightPieces: Piece[] = right.map((display) => ({
      display,
      key: ignoreCase ? display.toLocaleLowerCase("en-US") : display,
      line: segment.rightLine,
    }));
    const aligned = alignPieces(leftPieces, rightPieces);
    if (aligned.limited) refined.push(segment);
    else refined.push(...aligned.segments);
  }
  return refined;
}

function finishAlignment(
  aligned: Alignment,
  detail: CompareDetail,
  unitName: string,
  warnings: string[],
  partial: boolean,
  coverage: CompareCoverage,
  original: string,
  modified: string,
): CompareResult {
  if (aligned.limited && aligned.unaligned) {
    warnings.push(
      `This comparison is approximate. ${aligned.unaligned.left.toLocaleString("en-US")} ${unitName} in Text A and ${aligned.unaligned.right.toLocaleString("en-US")} ${unitName} in Text B were not aligned. No similarity score is shown.`,
    );
  }
  return finish(aligned.segments, warnings, aligned.limited, partial, detail, aligned.unaligned, coverage, original, modified);
}

function finish(
  segments: AlignedSegment[],
  warnings: string[],
  limited: boolean,
  partial: boolean,
  detail: CompareDetail,
  unaligned: { left: number; right: number } | null,
  coverage: CompareCoverage,
  original: string,
  modified: string,
): CompareResult {
  let unchanged = 0;
  let added = 0;
  let removed = 0;
  let changed = 0;
  for (const segment of segments) {
    if (segment.type === "gap") continue;
    if (segment.type === "equal") unchanged += segment.units;
    else if (segment.type === "insert") added += segment.units;
    else if (segment.type === "delete") removed += segment.units;
    else changed += segment.units;
  }
  const left = unchanged + removed + changed;
  const right = unchanged + added + changed;
  const approximate = limited;
  const stats: CompareStats = {
    similarity: approximate ? null : similarityPercent(unchanged, left, right),
    added,
    removed,
    changed,
    unchanged,
    originalWords: countComparableWords(original),
    modifiedWords: countComparableWords(modified),
  };
  return {
    segments,
    stats,
    warning: warnings.length > 0 ? warnings.join(" ") : null,
    limited,
    partial,
    approximate,
    detail,
    unaligned,
    coverage,
  };
}
