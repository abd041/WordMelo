import type { SortResult, SortSettings } from "./types";
import { MODE_LABELS } from "./sort";

export const TXT_FILENAME = "wordmelo-alphabetized-list.txt";
export const CSV_FILENAME = "wordmelo-alphabetized-list.csv";
export const TXT_PARTIAL_FILENAME = "wordmelo-alphabetized-list-partial.txt";
export const CSV_PARTIAL_FILENAME = "wordmelo-alphabetized-list-partial.csv";

export const PARTIAL_EXPORT_NOTE =
  "WordMelo note: this is a partial sorted list. Only the first 80,000 characters were processed, and any incomplete final item was omitted.";

const FORMULA_STARTERS = new Set(["=", "+", "-", "@"]);

const LEADING_IGNORABLE =
  /[\s\u0000-\u001F\u007F\u0080-\u009F\u00A0\u1680\u2000-\u200D\u2028\u2029\u202F\u205F\u3000\uFEFF]/u;

export function startsWithCsvFormula(value: string): boolean {
  let index = 0;
  while (index < value.length && LEADING_IGNORABLE.test(value[index] ?? "")) {
    index += 1;
  }
  const starter = value[index];
  return starter !== undefined && FORMULA_STARTERS.has(starter);
}

export function escapeCsvField(value: string): string {
  const needsFormulaGuard = startsWithCsvFormula(value);
  const safe = needsFormulaGuard ? `'${value}` : value;
  if (needsFormulaGuard || /[",\n\r]/.test(safe)) return `"${safe.replaceAll('"', '""')}"`;
  return safe;
}

export function toCsv(items: string[], options?: { partial?: boolean }): string {
  const rows = items.map(escapeCsvField);
  if (options?.partial) return `${escapeCsvField(PARTIAL_EXPORT_NOTE)}\n${rows.join("\n")}\n`;
  return `${rows.join("\n")}\n`;
}

export function markedListText(result: SortResult): string {
  if (!result.truncated) return result.text;
  if (!result.text) return PARTIAL_EXPORT_NOTE;
  return `${PARTIAL_EXPORT_NOTE}\n${result.text}`;
}

export function exportFilename(kind: "txt" | "csv", truncated: boolean): string {
  if (kind === "txt") return truncated ? TXT_PARTIAL_FILENAME : TXT_FILENAME;
  return truncated ? CSV_PARTIAL_FILENAME : CSV_FILENAME;
}

export function clipboardFeedback(
  copied: boolean,
  truncated = false,
): { message: string; failed: boolean } {
  if (copied && truncated) {
    return {
      message: "Copied a partial sorted list. The original paste exceeded the character limit.",
      failed: false,
    };
  }
  if (copied) return { message: "Sorted list copied.", failed: false };
  return {
    message: truncated
      ? "Copy failed. The partial list is selected below so you can copy it manually."
      : "Copy failed. The list is selected below so you can copy it manually.",
    failed: true,
  };
}

export function resultReport(result: SortResult, settings: SortSettings): string {
  const header = [
    "WordMelo alphabetized list",
    `Sort: ${MODE_LABELS[result.stats.mode]}`,
    `Input items: ${result.stats.inputItems}`,
    `Output items: ${result.stats.outputItems}`,
    `Duplicates removed: ${result.stats.duplicatesRemoved}`,
    `Empty items removed: ${result.stats.emptyRemoved}`,
    `Ignore capitalization: ${settings.ignoreCase ? "on" : "off"}`,
    `Ignore punctuation: ${settings.ignorePunctuation ? "on" : "off"}`,
    `Ignore leading A/An/The: ${settings.ignoreArticles ? "on" : "off"}`,
    "",
  ];
  if (result.warning) header.push(`Note: ${result.warning}`, "");
  return `${header.join("\n")}${result.text}`;
}
