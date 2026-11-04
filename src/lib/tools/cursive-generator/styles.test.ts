import { describe, expect, it } from "vitest";
import { SCRIPT, BOLD_SCRIPT } from "@/lib/tools/fancy-text/maps";
import { mapWithDictionary } from "@/lib/tools/fancy-text/transform";
import {
  CURSIVE_SAMPLE_TEXT,
  CURSIVE_STYLE_GROUPS,
  CURSIVE_UNICODE_STYLES,
  generateAllCursiveStyles,
  getCursiveUnicodeStyle,
} from "./styles";

describe("cursive unicode styles", () => {
  it("exposes mathematical script and bold script only once each", () => {
    const math = CURSIVE_UNICODE_STYLES.filter((s) => s.isMathematicalScript);
    expect(math.map((s) => s.id).sort()).toEqual(["bold-script", "script"]);
  });

  it("reuses Fancy Text SCRIPT / BOLD_SCRIPT maps", () => {
    const script = getCursiveUnicodeStyle("script")!;
    const bold = getCursiveUnicodeStyle("bold-script")!;
    expect(script.transform("Hello")).toBe(mapWithDictionary("Hello", SCRIPT));
    expect(bold.transform("Hello")).toBe(
      mapWithDictionary("Hello", BOLD_SCRIPT),
    );
  });

  it("handles known mathematical script letterlike exceptions", () => {
    const script = getCursiveUnicodeStyle("script")!;
    // B, E, e map to letterlike symbols in the Fancy Text SCRIPT map
    expect(script.transform("Bee")).toBe(
      mapWithDictionary("Bee", SCRIPT),
    );
    expect(script.transform("Bee")).not.toBe("Bee");
  });

  it("produces distinct outputs for typical Latin input", () => {
    const outputs = new Set(
      CURSIVE_UNICODE_STYLES.map((s) => s.transform(CURSIVE_SAMPLE_TEXT)),
    );
    expect(outputs.size).toBe(CURSIVE_UNICODE_STYLES.length);
  });

  it("preserves empty text, spaces, newlines, emoji, and unsupported scripts", () => {
    const script = getCursiveUnicodeStyle("script")!;
    expect(script.transform("")).toBe("");
    expect(script.transform("  a  ")).toMatch(/^ {2}.+ {2}$/u);
    expect(script.transform("one\ntwo")).toContain("\n");
    expect(script.transform("hi 🎉")).toContain("🎉");
    expect(script.transform("مرحبا")).toBe("مرحبا");
    expect(script.transform("नमस्ते")).toBe("नमस्ते");
    expect(script.transform("你好")).toBe("你好");
  });

  it("preserves combining marks and ZWJ emoji sequences", () => {
    const script = getCursiveUnicodeStyle("script")!;
    const combining = "e\u0301";
    expect(script.transform(combining)).toContain("\u0301");
    const family = "👨‍👩‍👧‍👦";
    expect(script.transform(family)).toBe(family);
  });

  it("keeps punctuation and tabs", () => {
    const script = getCursiveUnicodeStyle("script")!;
    const input = "Hello, world!\tOK?";
    const out = script.transform(input);
    expect(out).toContain(",");
    expect(out).toContain("!");
    expect(out).toContain("\t");
    expect(out).toContain("?");
  });

  it("groups styles without inventing duplicate alphabets", () => {
    expect(CURSIVE_STYLE_GROUPS.map((g) => g.id)).toEqual([
      "script",
      "decorative",
      "name",
    ]);
    expect(CURSIVE_UNICODE_STYLES.length).toBeLessThanOrEqual(10);
  });

  it("generateAllCursiveStyles returns live transforms", () => {
    const rows = generateAllCursiveStyles("Alex");
    expect(rows).toHaveLength(CURSIVE_UNICODE_STYLES.length);
    for (const row of rows) {
      const style = getCursiveUnicodeStyle(row.id)!;
      expect(row.output).toBe(style.transform("Alex"));
    }
  });

  it("handles long input without throwing", () => {
    const long = "Beautiful ".repeat(400);
    for (const style of CURSIVE_UNICODE_STYLES) {
      expect(() => style.transform(long)).not.toThrow();
      expect(style.transform(long).length).toBeGreaterThan(0);
    }
  });
});
