import { describe, expect, it } from "vitest";
import {
  clipboardFeedback,
  CSV_FILENAME,
  CSV_PARTIAL_FILENAME,
  escapeCsvField,
  exportFilename,
  markedListText,
  PARTIAL_EXPORT_NOTE,
  startsWithCsvFormula,
  toCsv,
  TXT_FILENAME,
  TXT_PARTIAL_FILENAME,
} from "./format";
import { graphemeLength, MAX_INPUT_CHARS, prepareInput, splitItems } from "./parse";
import { lastName, parseNumber, sortList } from "./sort";
import type { SortSettings } from "./types";

const base: SortSettings = {
  mode: "az",
  format: "lines",
  ignoreCase: false,
  ignorePunctuation: false,
  ignoreArticles: false,
  trimOutput: false,
  removeEmpty: false,
  removeDuplicates: false,
  numberOutput: false,
};

describe("alphabetizer", () => {
  it("returns empty output for empty input", () => {
    const result = sortList("", base);
    expect(result.items).toEqual([]);
    expect(result.stats.inputItems).toBe(0);
    expect(result.stats.outputItems).toBe(0);
  });

  it("keeps a single item", () => {
    expect(sortList("Apple", base).items).toEqual(["Apple"]);
  });

  it("sorts A–Z and Z–A without reversing the original order for Z–A", () => {
    const input = "banana\nApple\ncherry";
    expect(sortList(input, base).items).toEqual(["Apple", "banana", "cherry"]);
    expect(sortList(input, { ...base, mode: "za" }).items).toEqual(["cherry", "banana", "Apple"]);
  });

  it("treats mixed capitalization as distinct unless ignore-case is on", () => {
    const input = "apple\nBanana\napple";
    const sensitive = sortList(input, base);
    expect(sensitive.items).toEqual(["apple", "apple", "Banana"]);
    const folded = sortList("Banana\napple", { ...base, ignoreCase: true });
    expect(folded.items).toEqual(["apple", "Banana"]);
  });

  it("keeps accented letters distinct by default", () => {
    const result = sortList("cafe\ncafé\ncafes", base);
    expect(result.items).toContain("café");
    expect(result.items.indexOf("cafe")).toBeLessThan(result.items.indexOf("cafes"));
  });

  it("sorts numbers, including negatives and decimals, and never treats invalid text as zero", () => {
    const input = "10\n-3\n2.5\nnot-a-number\n0";
    expect(sortList(input, { ...base, mode: "numeric-asc" }).items).toEqual([
      "-3",
      "0",
      "2.5",
      "10",
      "not-a-number",
    ]);
    expect(sortList(input, { ...base, mode: "numeric-desc" }).items).toEqual([
      "10",
      "2.5",
      "0",
      "-3",
      "not-a-number",
    ]);
    expect(parseNumber("not-a-number")).toBeNull();
    expect(parseNumber("  -12.5  ")).toBe(-12.5);
  });

  it("uses natural order for numbered file names", () => {
    const input = "file1\nfile10\nfile2";
    expect(sortList(input, { ...base, mode: "natural-az" }).items).toEqual([
      "file1",
      "file2",
      "file10",
    ]);
    expect(sortList(input, { ...base, mode: "natural-za" }).items).toEqual([
      "file10",
      "file2",
      "file1",
    ]);
  });

  it("sorts by grapheme length", () => {
    expect(graphemeLength("👍")).toBe(1);
    const input = "aa\na\naaa";
    expect(sortList(input, { ...base, mode: "length-asc" }).items).toEqual(["a", "aa", "aaa"]);
    expect(sortList(input, { ...base, mode: "length-desc" }).items).toEqual(["aaa", "aa", "a"]);
  });

  it("sorts by last whitespace-separated name", () => {
    const input = "John Smith\nAlice Brown\nDavid Wilson";
    expect(sortList(input, { ...base, mode: "last-name" }).items).toEqual([
      "Alice Brown",
      "John Smith",
      "David Wilson",
    ]);
    expect(lastName("Mary Ann")).toBe("Ann");
    expect(lastName("Wilson,")).toBe("Wilson");
  });

  it("reverses the current line sequence", () => {
    expect(sortList("a\nb\nc", { ...base, mode: "reverse" }).items).toEqual(["c", "b", "a"]);
  });

  it("shuffles with Fisher–Yates using the injected random source", () => {
    const shuffled = sortList("a\nb\nc", { ...base, mode: "shuffle" }, () => 0);
    expect(shuffled.items).toEqual(["b", "c", "a"]);
  });

  it("keeps equal keys in their original order", () => {
    const result = sortList("b-one\na\nb-two", {
      ...base,
      ignorePunctuation: true,
    });
    const bees = result.items.filter((item) => item.startsWith("b"));
    expect(bees).toEqual(["b-one", "b-two"]);
  });

  it("removes duplicates according to case", () => {
    const input = "Apple\napple\nbanana\nApple";
    const sensitive = sortList(input, { ...base, removeDuplicates: true });
    expect(sensitive.items).toEqual(["apple", "Apple", "banana"]);
    const folded = sortList(input, { ...base, ignoreCase: true, removeDuplicates: true });
    expect(folded.items).toEqual(["Apple", "banana"]);
    expect(folded.stats.duplicatesRemoved).toBe(2);
  });

  it("removes empty lines, trims output, and numbers the sorted list", () => {
    const input = "  cherry  \n\nApple\n";
    const result = sortList(input, {
      ...base,
      removeEmpty: true,
      trimOutput: true,
      numberOutput: true,
    });
    expect(result.items).toEqual(["1. Apple", "2. cherry"]);
    expect(result.stats.emptyRemoved).toBe(2);
  });

  it("keeps original spacing unless trim is on", () => {
    const result = sortList("  banana  \nApple", base);
    expect(result.items).toContain("  banana  ");
  });

  it("ignores leading articles only for the sort key", () => {
    const result = sortList("The Zebra\nAn Apple\nBanana", { ...base, ignoreArticles: true });
    expect(result.items).toEqual(["An Apple", "Banana", "The Zebra"]);
  });

  it("preserves emoji and combining marks", () => {
    const input = "e\u0301\n👍\napple";
    const result = sortList(input, base);
    expect(result.items).toContain("👍");
    expect(result.items).toContain("e\u0301");
  });

  it("treats CRLF as line breaks", () => {
    expect(sortList("b\r\na", base).items).toEqual(["a", "b"]);
  });

  it("splits comma lists only when that format is selected", () => {
    const lines = sortList("Smith, John\nBrown, Alice", base);
    expect(lines.items).toHaveLength(2);
    const comma = sortList("banana, Apple, cherry", { ...base, format: "comma" });
    expect(comma.items).toEqual([" Apple", "banana", " cherry"]);
  });

  it("warns on oversized input, drops an incomplete final line, and separates total vs processed counts", () => {
    const input = `alpha\nbeta\n${"c".repeat(MAX_INPUT_CHARS)}`;
    const result = sortList(input, base);
    expect(result.truncated).toBe(true);
    expect(result.warning).toMatch(/partial/i);
    expect(result.warning).toMatch(/incomplete/i);
    expect(result.items).toEqual(["alpha", "beta"]);
    expect(result.stats.totalInputItems).toBe(3);
    expect(result.stats.inputItems).toBe(2);
    expect(result.stats.droppedIncompleteItem).toBe(true);
    expect(result.stats.totalCharacters).toBe(input.length);
    expect(result.stats.processedCharacters).toBeLessThan(input.length);
    expect(result.text).not.toContain("c".repeat(20));
    expect(markedListText(result).startsWith(PARTIAL_EXPORT_NOTE)).toBe(true);
    expect(exportFilename("txt", true)).toBe(TXT_PARTIAL_FILENAME);
    expect(exportFilename("csv", true)).toBe(CSV_PARTIAL_FILENAME);
  });

  it("keeps a complete last line when the cut lands on a newline", () => {
    const chunk = "abc\n";
    const repeats = Math.floor(MAX_INPUT_CHARS / chunk.length);
    const input = `${chunk.repeat(repeats)}overflow`;
    const prepared = prepareInput(input, "lines");
    expect(prepared.truncated).toBe(true);
    expect(prepared.droppedIncompleteItem).toBe(false);
    expect(prepared.text.endsWith("\n")).toBe(true);
    const result = sortList(input, base);
    expect(result.items.every((item) => item === "abc" || item === "")).toBe(true);
    expect(result.stats.inputItems).toBeGreaterThan(1);
  });

  it("does not split a surrogate pair at the 80,000-character limit", () => {
    const prepared = prepareInput(`${"a".repeat(MAX_INPUT_CHARS - 2)}\n🙂`, "lines");
    expect(prepared.truncated).toBe(true);
    expect(prepared.droppedIncompleteItem).toBe(false);
    expect(prepared.text.endsWith("\n")).toBe(true);
    expect(prepared.text.includes("\uD83D")).toBe(false);
    expect(prepared.text.charCodeAt(prepared.text.length - 1)).toBeLessThan(0xd800);
  });

  it("drops an incomplete comma-separated field after the character limit", () => {
    const input = `alpha,beta,${"c".repeat(MAX_INPUT_CHARS)}`;
    const prepared = prepareInput(input, "comma");
    expect(prepared.truncated).toBe(true);
    expect(prepared.droppedIncompleteItem).toBe(true);
    expect(splitItems(prepared.text, "comma")).toEqual(["alpha", "beta"]);
  });

  it("sorts a few thousand lines", () => {
    const input = Array.from({ length: 3000 }, (_, index) => `item-${3000 - index}`).join("\n");
    const result = sortList(input, { ...base, mode: "natural-az" });
    expect(result.items[0]).toBe("item-1");
    expect(result.items.at(-1)).toBe("item-3000");
    expect(result.stats.outputItems).toBe(3000);
  });

  it("exports escaped CSV, guards formula injection, and leaves TXT and on-screen text unchanged", () => {
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    expect(toCsv(["a,b", "c"])).toBe('"a,b"\nc\n');
    expect(toCsv(["café"])).toBe("café\n");
    expect(toCsv(["line\nbreak"])).toBe('"line\nbreak"\n');
    expect(startsWithCsvFormula("=1+1")).toBe(true);
    expect(startsWithCsvFormula("  \t-3")).toBe(true);
    expect(startsWithCsvFormula("\u0000+cmd")).toBe(true);
    expect(startsWithCsvFormula("\u200b=HYPERLINK(\"x\")")).toBe(true);
    expect(startsWithCsvFormula("\u00a0@SUM(1)")).toBe(true);
    expect(startsWithCsvFormula("@SUM(1)")).toBe(true);
    expect(startsWithCsvFormula("apple")).toBe(false);
    expect(escapeCsvField("=1+1")).toBe(`"'=1+1"`);
    expect(escapeCsvField("  +HYPERLINK(\"x\")")).toBe(`"'  +HYPERLINK(""x"")"`);
    expect(escapeCsvField("-3")).toBe(`"'-3"`);
    expect(escapeCsvField("@cmd")).toBe(`"'@cmd"`);
    expect(toCsv(["=CMD|'/c calc'!A0"])).toBe(`"'=CMD|'/c calc'!A0"\n`);
    expect(toCsv(["=1+1"], { partial: true })).toContain(PARTIAL_EXPORT_NOTE);
    expect(TXT_FILENAME).toBe("wordmelo-alphabetized-list.txt");
    expect(CSV_FILENAME).toBe("wordmelo-alphabetized-list.csv");
    const formulas = sortList("=1+1\napple\n-3", base);
    expect(formulas.text).toContain("=1+1");
    expect(formulas.text).toContain("-3");
    expect(formulas.text).not.toContain("'=1+1");
    expect(toCsv(formulas.items)).toContain(`"'=1+1"`);
    expect(toCsv(formulas.items)).toContain(`"'-3"`);
    const htmlish = sortList("<script>alert(1)</script>\n<img>", base);
    expect(htmlish.text).toContain("<script>alert(1)</script>");
  });

  it("ignores punctuation only for ordering and keeps the original glyphs", () => {
    const result = sortList("zebra!\napple.", { ...base, ignorePunctuation: true });
    expect(result.items).toEqual(["apple.", "zebra!"]);
  });

  it("splits simple semicolon lists without treating them as quoted CSV", () => {
    const result = sortList("cherry; Apple; banana", { ...base, format: "semicolon" });
    expect(result.items).toEqual([" Apple", " banana", "cherry"]);
    expect(result.warning).toMatch(/simple delimiter/i);
  });

  it("returns a new ordered list when the same function is called again with new settings", () => {
    const input = "banana\nApple\ncherry";
    const first = sortList(input, base);
    const second = sortList(input, { ...base, mode: "za" });
    expect(first.items).toEqual(["Apple", "banana", "cherry"]);
    expect(second.items).toEqual(["cherry", "banana", "Apple"]);
    expect(first.items).not.toEqual(second.items);
  });

  it("does not describe a failed copy as success", () => {
    expect(clipboardFeedback(false).failed).toBe(true);
    expect(clipboardFeedback(false).message.toLowerCase()).not.toContain("copied.");
    expect(clipboardFeedback(true).failed).toBe(false);
    expect(clipboardFeedback(true, true).message.toLowerCase()).toContain("partial");
    expect(clipboardFeedback(false, true).failed).toBe(true);
  });
});
