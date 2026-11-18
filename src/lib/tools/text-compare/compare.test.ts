import { describe, expect, it } from "vitest";
import { compareTexts, prepareInput, similarityPercent, MAX_INPUT_CHARS } from "./compare";
import {
  DIFF_FILENAME,
  HTML_FILENAME,
  TXT_FILENAME,
  clipboardFeedback,
  clipRows,
  comparisonHtml,
  comparisonReport,
  unifiedDiff,
} from "./format";
import { graphemes } from "./segment";
import type { CompareSettings } from "./types";

const base: Pick<
  CompareSettings,
  "mode" | "ignoreCase" | "ignoreWhitespace" | "ignoreEdgeSpace" | "ignoreEmptyLines"
> = {
  mode: "word",
  ignoreCase: false,
  ignoreWhitespace: false,
  ignoreEdgeSpace: false,
  ignoreEmptyLines: false,
};

const reportSettings: CompareSettings = {
  ...base,
  showUnchanged: true,
  showLineNumbers: true,
  wrap: true,
  view: "side",
};

describe("text comparison", () => {
  it("treats two empty texts as identical", () => {
    const result = compareTexts("", "", base);
    expect(result.stats.similarity).toBe(100);
    expect(result.stats.added).toBe(0);
    expect(result.stats.removed).toBe(0);
    expect(result.stats.originalWords).toBe(0);
  });

  it("compares empty text with text", () => {
    const result = compareTexts("", "Hello", base);
    expect(result.stats.similarity).toBe(0);
    expect(result.stats.added).toBeGreaterThan(0);
    expect(result.stats.removed).toBe(0);
    expect(result.segments.some((segment) => segment.type === "insert")).toBe(true);
  });

  it("scores identical text at 100", () => {
    const result = compareTexts("Same line.\nSame line.", "Same line.\nSame line.", base);
    expect(result.stats.similarity).toBe(100);
    expect(result.stats.changed).toBe(0);
    expect(result.stats.added).toBe(0);
  });

  it("finds one replaced word and keeps punctuation", () => {
    const result = compareTexts("The quick fox.", "The slow fox.", base);
    expect(result.stats.changed).toBe(1);
    expect(result.segments.some((segment) => segment.type === "replace" && segment.left === "quick" && segment.right === "slow")).toBe(true);
    expect(result.segments.some((segment) => segment.left.includes(".") || segment.right.includes("."))).toBe(true);
    expect(result.stats.similarity).toBeLessThan(100);
    expect(result.stats.similarity).toBeGreaterThan(0);
  });

  it("marks added and deleted words", () => {
    const added = compareTexts("alpha gamma", "alpha beta gamma", base);
    expect(added.segments.some((segment) => segment.type === "insert" && segment.right === "beta")).toBe(true);
    const removed = compareTexts("alpha beta gamma", "alpha gamma", base);
    expect(removed.segments.some((segment) => segment.type === "delete" && segment.left === "beta")).toBe(true);
  });

  it("compares lines, including repeated lines", () => {
    const result = compareTexts("a\na\nb", "a\nb\na", { ...base, mode: "line" });
    expect(result.stats.unchanged).toBeGreaterThan(0);
    expect(result.segments.filter((segment) => segment.type === "equal").length).toBeGreaterThan(0);
    const changed = compareTexts("keep\nremove", "keep\nadd", { ...base, mode: "line" });
    expect(changed.segments.some((segment) => segment.type === "replace" && segment.left === "remove")).toBe(true);
    expect(changed.stats.added + changed.stats.removed + changed.stats.changed).toBeGreaterThan(0);
  });

  it("keeps emoji and combining marks intact", () => {
    expect(graphemes("e\u0301")).toEqual(["e\u0301"]);
    expect(graphemes("👍")).toEqual(["👍"]);
    const same = compareTexts("e\u0301 👍", "e\u0301 👍", { ...base, mode: "character" });
    expect(same.stats.similarity).toBe(100);
    const mark = compareTexts("e\u0301", "e", { ...base, mode: "character" });
    expect(mark.stats.similarity).toBeLessThan(100);
    expect(mark.segments.some((segment) => segment.left === "e\u0301" || segment.right === "e\u0301")).toBe(true);
    const different = compareTexts("👍", "😀", { ...base, mode: "character" });
    expect(different.stats.similarity).toBe(0);
    expect(different.segments.some((segment) => segment.left === "👍" || segment.right === "😀")).toBe(true);
  });

  it("ignores capitalization and whitespace only for matching", () => {
    const folded = compareTexts("Hello World", "hello   world", {
      ...base,
      ignoreCase: true,
      ignoreWhitespace: true,
    });
    expect(folded.stats.similarity).toBe(100);
    expect(folded.segments.some((segment) => segment.left.includes("Hello"))).toBe(true);
    expect(folded.segments.some((segment) => segment.right.includes("hello"))).toBe(true);
    expect(folded.segments.some((segment) => segment.right.includes("   "))).toBe(true);
  });

  it("ignores empty lines and edge spaces in line mode", () => {
    const result = compareTexts("alpha\n\nbeta", "alpha\nbeta", {
      ...base,
      mode: "line",
      ignoreEmptyLines: true,
    });
    expect(result.stats.similarity).toBe(100);
    const edges = compareTexts("  alpha  ", "alpha", {
      ...base,
      mode: "line",
      ignoreEdgeSpace: true,
    });
    expect(edges.stats.similarity).toBe(100);
    expect(edges.segments.some((segment) => segment.left.includes("  alpha"))).toBe(true);
  });

  it("is symmetric and deterministic", () => {
    expect(similarityPercent(0, 0, 0)).toBe(100);
    expect(similarityPercent(2, 2, 3)).toBe(80);
    const left = compareTexts("one two", "two three", base);
    const right = compareTexts("two three", "one two", base);
    expect(left.stats.similarity).toBe(right.stats.similarity);
    expect(left.stats.unchanged).toBe(right.stats.unchanged);
    expect(left.stats.added + left.stats.changed).toBe(right.stats.removed + right.stats.changed);
    expect(left.stats.removed + left.stats.changed).toBe(right.stats.added + right.stats.changed);
  });

  it("falls back from character comparison when the text is long", () => {
    const result = compareTexts("a".repeat(2_000), "b".repeat(2_000), {
      ...base,
      mode: "character",
    });
    expect(result.warning).toMatch(/Character comparison/i);
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it("limits oversized input and labels the result partial", () => {
    const huge = "word ".repeat(MAX_INPUT_CHARS);
    const result = compareTexts(huge, `${huge}tail`, base);
    expect(result.partial).toBe(true);
    expect(result.approximate).toBe(false);
    expect(result.warning).toMatch(/partial/i);
    expect(result.warning).toMatch(/excluded/i);
    expect(result.warning).toMatch(/does not mean the full documents match/i);
    expect(result.stats.similarity).toBe(100);
    expect(result.coverage.excludedRight).toBeGreaterThan(result.coverage.excludedLeft);
  });

  it("does not split a surrogate pair at the character limit", () => {
    const text = `${"a".repeat(MAX_INPUT_CHARS - 1)}🙂`;
    const prepared = prepareInput(text);
    expect(prepared.truncated).toBe(true);
    expect(prepared.text.charCodeAt(prepared.text.length - 1)).toBeLessThan(0xd800);
    expect(prepared.omitted).toBeGreaterThan(0);
  });

  it("withholds a score when line alignment exceeds the budget", () => {
    const left = Array.from({ length: 900 }, (_, index) => `left-${index}`).join("\n");
    const right = Array.from({ length: 900 }, (_, index) => `right-${index}`).join("\n");
    const started = Date.now();
    const result = compareTexts(left, right, base);
    expect(Date.now() - started).toBeLessThan(2000);
    expect(result.approximate).toBe(true);
    expect(result.stats.similarity).toBeNull();
    expect(result.warning).toMatch(/approximate/i);
    expect(result.segments.some((segment) => segment.type === "gap")).toBe(true);
  });

  it("finds a change after a long shared prefix", () => {
    const prefix = Array.from({ length: 400 }, (_, index) => `same-${index}`).join(" ");
    const result = compareTexts(`${prefix} alpha`, `${prefix} beta`, base);
    expect(result.approximate).toBe(false);
    expect(result.stats.similarity).not.toBe(100);
    expect(result.segments.some((segment) => segment.type === "replace" && segment.left === "alpha" && segment.right === "beta")).toBe(true);
  });

  it("keeps a repeated word and reports a moved paragraph as removed plus added", () => {
    const repeated = compareTexts("a a a", "a a", base);
    expect(repeated.stats.unchanged).toBeGreaterThan(0);
    expect(repeated.stats.removed).toBeGreaterThan(0);
    const moved = compareTexts("one\ntwo\nthree", "two\nthree\none", { ...base, mode: "line" });
    expect(moved.stats.similarity).toBeLessThan(100);
    expect(moved.stats.similarity).toBeGreaterThan(0);
    expect(moved.segments.some((segment) => segment.type === "equal" && segment.left.includes("two"))).toBe(true);
  });

  it("treats CRLF and LF as the same line break", () => {
    const result = compareTexts("alpha\r\nbeta", "alpha\nbeta", base);
    expect(result.stats.similarity).toBe(100);
  });

  it("exports escaped reports with stable filenames", () => {
    const result = compareTexts("a <b> &", "a <b> & more", base);
    const html = comparisonHtml(result, reportSettings);
    expect(html).toContain("&lt;b&gt;");
    expect(html).toContain("&amp;");
    expect(html).not.toContain("<b>");
    expect(html).not.toContain("<script");
    expect(html).toContain("script-src 'none'");
    const report = comparisonReport(result, reportSettings);
    expect(report).toContain("Similarity:");
    expect(report).toContain("Ignore capitalization: off");
    expect(report).not.toContain("plagiarism score");
    const diff = unifiedDiff("a <b> &", "a <b> & more");
    expect(diff.startsWith("--- Text A\n+++ Text B")).toBe(true);
    expect(TXT_FILENAME).toBe("wordmelo-text-comparison.txt");
    expect(DIFF_FILENAME).toBe("wordmelo-text-comparison.diff");
    expect(HTML_FILENAME).toBe("wordmelo-text-comparison.html");
  });

  it("builds a line unified diff and keeps HTML payloads inert", () => {
    expect(unifiedDiff("one\ntwo\nthree\n", "one\ntwo\nfour\n")).toBe(
      ["--- Text A", "+++ Text B", "@@ -1,3 +1,3 @@", " one", " two", "-three", "+four", ""].join("\n"),
    );
    expect(unifiedDiff("one\nthree\n", "one\ntwo\nthree\n")).toContain("+two");
    expect(unifiedDiff("alpha\r\nbeta\r\n", "alpha\nbeta\n")).toBe("--- Text A\n+++ Text B\n");
    const hostile = compareTexts(
      "<script>alert(1)</script>",
      "<img src=x onerror=alert(1)>\n<svg onload=alert(1)>",
      base,
    );
    const html = comparisonHtml(hostile, reportSettings);
    expect(html).not.toMatch(/<(script|img|svg)[\s>/]/i);
    expect(html).toContain("&lt;");
    expect(html).toContain("onerror");
    expect(html).toContain("onload");
    const clipped = clipRows(Array.from({ length: 2_501 }, (_, index) => index));
    expect(clipped.shown).toBe(2_500);
    expect(clipped.hidden).toBe(1);
    expect(clipped.total).toBe(2_501);
  });

  it("does not describe a failed copy as success", () => {
    expect(clipboardFeedback(false).failed).toBe(true);
    expect(clipboardFeedback(false).message.toLowerCase()).not.toContain("copied.");
    expect(clipboardFeedback(true)).toEqual({ message: "Comparison copied.", failed: false });
  });
});
