import { describe, expect, it } from "vitest";
import * as maps from "./maps";
import { fancyTextToPlain, getReverseLookupSize } from "./reverse";
import { mapWithDictionary } from "./transform";

describe("fancyTextToPlain", () => {
  it("returns empty for empty input", () => {
    expect(fancyTextToPlain("")).toBe("");
  });

  it("reverses bold serif Latin letters", () => {
    const fancy = mapWithDictionary("Hello", maps.BOLD_SERIF);
    expect(fancyTextToPlain(fancy)).toBe("Hello");
  });

  it("reverses bold sans and script samples", () => {
    expect(fancyTextToPlain(mapWithDictionary("World", maps.BOLD_SANS))).toBe(
      "World",
    );
    expect(fancyTextToPlain(mapWithDictionary("Script", maps.SCRIPT))).toBe(
      "Script",
    );
  });

  it("reverses fullwidth letters", () => {
    const fancy = mapWithDictionary("ABC", maps.FULLWIDTH);
    expect(fancyTextToPlain(fancy)).toBe("ABC");
  });

  it("preserves emoji and unsupported scripts", () => {
    const input = "こんにちは 🚀 العربية";
    expect(fancyTextToPlain(input)).toBe(input);
  });

  it("preserves plain Latin when already plain", () => {
    expect(fancyTextToPlain("Already plain 123")).toBe("Already plain 123");
  });

  it("strips known combining underline marks after reversing base", () => {
    const withMark = `H\u0332i\u0332`;
    expect(fancyTextToPlain(withMark)).toBe("Hi");
  });

  it("builds a non-trivial reverse lookup", () => {
    expect(getReverseLookupSize()).toBeGreaterThan(200);
  });
});
