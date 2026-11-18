import type { ScriptItem } from "./myers";
import { lineDiffFile } from "./compare";
import { normalizeNewlines } from "./segment";
import type { AlignedSegment, CompareResult, CompareSettings } from "./types";

export const TXT_FILENAME = "wordmelo-text-comparison.txt";
export const DIFF_FILENAME = "wordmelo-text-comparison.diff";
export const HTML_FILENAME = "wordmelo-text-comparison.html";
export const MAX_RENDER_ROWS = 2_500;

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function visibleSegments(
  segments: AlignedSegment[],
  showUnchanged: boolean,
): AlignedSegment[] {
  return segments.filter(
    (segment) => segment.type === "gap" || showUnchanged || segment.type !== "equal",
  );
}

export function clipRows<T>(rows: T[], limit = MAX_RENDER_ROWS): {
  shownRows: T[];
  shown: number;
  total: number;
  hidden: number;
} {
  const total = rows.length;
  const shown = Math.min(total, limit);
  return { shownRows: rows.slice(0, limit), shown, total, hidden: total - shown };
}

export function comparisonReport(result: CompareResult, settings: CompareSettings): string {
  const lines = [
    "WordMelo text comparison",
    statusLine(result),
    `Selected mode: ${settings.mode}`,
    `Displayed detail: ${result.detail}`,
    `Ignore capitalization: ${onOff(settings.ignoreCase)}`,
    `Ignore whitespace differences: ${onOff(settings.ignoreWhitespace)}`,
    `Ignore leading and trailing spaces: ${onOff(settings.ignoreEdgeSpace)}`,
    `Ignore empty lines: ${onOff(settings.ignoreEmptyLines)}`,
    `Similarity: ${similarityLabel(result)}`,
    `Added: ${result.stats.added}`,
    `Removed: ${result.stats.removed}`,
    `Replaced: ${result.stats.changed}`,
    `Unchanged: ${result.stats.unchanged}`,
    `Words in Text A: ${result.stats.originalWords}`,
    `Words in Text B: ${result.stats.modifiedWords}`,
    coverageLine(result),
    "",
    "Similarity measures aligned units after the selected normalization. It is not a measure of meaning or plagiarism. A partial score covers only the included characters.",
    "",
  ];
  if (result.warning) lines.push(`Note: ${result.warning}`, "");
  for (const segment of visibleSegments(result.segments, settings.showUnchanged)) {
    if (segment.type === "gap") {
      lines.push("[Not aligned] The middle of the texts was not compared in detail.");
      continue;
    }
    const label =
      segment.type === "equal"
        ? "Unchanged"
        : segment.type === "insert"
          ? "Added"
          : segment.type === "delete"
            ? "Removed"
            : "Replaced";
    if (segment.type === "replace") {
      lines.push(`[${label}] - ${oneLine(segment.left)}`);
      lines.push(`[${label}] + ${oneLine(segment.right)}`);
    } else if (segment.type === "delete") {
      lines.push(`[${label}] - ${oneLine(segment.left)}`);
    } else if (segment.type === "insert") {
      lines.push(`[${label}] + ${oneLine(segment.right)}`);
    } else {
      lines.push(`[${label}] ${oneLine(segment.left)}`);
    }
  }
  return lines.join("\n");
}

/**
 * Unified diff of the included text, built from lines rather than the on-screen mode.
 * A partial or incomplete file says so and is not presented as a finished patch.
 */
export function unifiedDiff(original: string, modified: string): string {
  const file = lineDiffFile(original, modified);
  const notes = coverageNotes(file.excludedLeft, file.excludedRight);
  if (file.limited) {
    return [
      "# WordMelo could not produce a unified diff.",
      "# The texts differ in too many places to align within the processing limit.",
      ...notes,
      "",
    ].join("\n");
  }
  const body = formatUnified(file);
  if (notes.length === 0) return body;
  return [...notes, body].join("\n");
}

export function comparisonHtml(result: CompareResult, settings: CompareSettings): string {
  const rows = visibleSegments(result.segments, settings.showUnchanged)
    .map((segment) => {
      if (segment.type === "gap") {
        return `<p class="gap">Not aligned: the middle of the texts was not compared in detail.</p>`;
      }
      const kind = segment.type;
      const body =
        kind === "replace"
          ? `${escapeHtml(segment.left)} → ${escapeHtml(segment.right)}`
          : escapeHtml(kind === "insert" ? segment.right : segment.left);
      return `<pre class="${kind}">${escapeHtml(labelFor(kind))}: ${body}</pre>`;
    })
    .join("");
  const status = escapeHtml(statusLine(result));
  const score = escapeHtml(similarityLabel(result));
  const note = result.warning ? `<p>${escapeHtml(result.warning)}</p>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; sandbox" />
<title>WordMelo text comparison</title>
<style>
  body { font: 16px/1.5 Georgia, serif; color: #122033; background: #fff; }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; margin: 0 0 0.4rem; padding: 0.25rem 0.4rem; }
  .insert { background: #e5f6ec; }
  .delete { background: #fde8e6; }
  .replace { background: #fff4d6; }
  .gap { background: #fff4d6; }
</style>
</head>
<body>
<h1>WordMelo text comparison</h1>
<p>${status}</p>
<p>Similarity: ${score}</p>
<p>${escapeHtml(coverageLine(result))}</p>
${note}
${rows}
</body>
</html>`;
}

export function clipboardFeedback(copied: boolean): { message: string; failed: boolean } {
  if (copied) return { message: "Comparison copied.", failed: false };
  return {
    message: "Copy failed. The report is selected below so you can copy it manually.",
    failed: true,
  };
}

function statusLine(result: CompareResult): string {
  if (result.approximate && result.partial) return "Status: Partial and approximate";
  if (result.approximate) return "Status: Approximate — similarity is not shown";
  if (result.partial) return "Status: Partial — characters past the limit were excluded";
  return "Status: Complete";
}

function similarityLabel(result: CompareResult): string {
  if (result.stats.similarity === null) return "not available";
  return result.partial ? `${result.stats.similarity}% of the included text` : `${result.stats.similarity}%`;
}

function coverageLine(result: CompareResult): string {
  return `Included characters: Text A ${result.coverage.includedLeft.toLocaleString("en-US")}, Text B ${result.coverage.includedRight.toLocaleString("en-US")}. Excluded characters: Text A ${result.coverage.excludedLeft.toLocaleString("en-US")}, Text B ${result.coverage.excludedRight.toLocaleString("en-US")}.`;
}

function coverageNotes(excludedLeft: number, excludedRight: number): string[] {
  if (excludedLeft === 0 && excludedRight === 0) return [];
  return [
    "# Partial comparison. Characters past the limit were excluded.",
    `# Text A excluded ${excludedLeft} characters. Text B excluded ${excludedRight} characters.`,
    "# The patch below covers only the included text.",
  ];
}

function labelFor(type: AlignedSegment["type"]): string {
  if (type === "insert") return "Added";
  if (type === "delete") return "Removed";
  if (type === "replace") return "Replaced";
  if (type === "gap") return "Not aligned";
  return "Unchanged";
}

function oneLine(value: string): string {
  return value.replace(/\r?\n/g, "↵");
}

function onOff(value: boolean): string {
  return value ? "on" : "off";
}

interface DiffRow {
  sign: " " | "-" | "+";
  text: string;
  oldNum?: number;
  newNum?: number;
  noNewline: boolean;
}

function formatUnified(file: ReturnType<typeof lineDiffFile>): string {
  const rows = rowsFromScript(file);
  const hunks = groupHunks(rows, 3);
  const body = hunks.map((hunk) => formatHunk(hunk)).join("\n");
  const header = "--- Text A\n+++ Text B";
  return body ? `${header}\n${body}\n` : `${header}\n`;
}

function rowsFromScript(file: ReturnType<typeof lineDiffFile>): DiffRow[] {
  const rows: DiffRow[] = [];
  let oldNum = 1;
  let newNum = 1;
  const aMissingNewline =
    file.linesA.length > 0 && !normalizeNewlines(file.includedA).endsWith("\n");
  const bMissingNewline =
    file.linesB.length > 0 && !normalizeNewlines(file.includedB).endsWith("\n");
  for (const item of file.script as ScriptItem[]) {
    if (item.type === "equal") {
      rows.push({
        sign: " ",
        text: file.linesA[item.aIndex] ?? "",
        oldNum,
        newNum,
        noNewline:
          (oldNum === file.linesA.length && aMissingNewline) ||
          (newNum === file.linesB.length && bMissingNewline),
      });
      oldNum += 1;
      newNum += 1;
    } else if (item.type === "delete") {
      rows.push({
        sign: "-",
        text: file.linesA[item.aIndex] ?? "",
        oldNum,
        noNewline: oldNum === file.linesA.length && aMissingNewline,
      });
      oldNum += 1;
    } else {
      rows.push({
        sign: "+",
        text: file.linesB[item.bIndex] ?? "",
        newNum,
        noNewline: newNum === file.linesB.length && bMissingNewline,
      });
      newNum += 1;
    }
  }
  return rows;
}

function groupHunks(rows: DiffRow[], context: number): DiffRow[][] {
  const changes = rows.flatMap((row, index) => (row.sign === " " ? [] : [index]));
  const hunks: DiffRow[][] = [];
  let cursor = 0;
  while (cursor < changes.length) {
    const start = Math.max(0, changes[cursor]! - context);
    let end = Math.min(rows.length, changes[cursor]! + context + 1);
    let next = cursor + 1;
    while (next < changes.length && changes[next]! - context <= end) {
      end = Math.min(rows.length, changes[next]! + context + 1);
      next += 1;
    }
    hunks.push(rows.slice(start, end));
    cursor = next;
  }
  return hunks;
}

function formatHunk(hunk: DiffRow[]): string {
  const oldLines = hunk.filter((row) => row.sign !== "+");
  const newLines = hunk.filter((row) => row.sign !== "-");
  const oldStart = oldLines[0]?.oldNum ?? 0;
  const newStart = newLines[0]?.newNum ?? 0;
  const header = `@@ -${oldStart},${oldLines.length} +${newStart},${newLines.length} @@`;
  const body = hunk.flatMap((row) => {
    const line = `${row.sign}${row.text}`;
    return row.noNewline ? [line, "\\ No newline at end of file"] : [line];
  });
  return [header, ...body].join("\n");
}
