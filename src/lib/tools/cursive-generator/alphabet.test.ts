import { describe, expect, it } from "vitest";
import {
  cursiveAlphabetLine,
  cursiveLetters,
  SCRIPT_LETTERLIKE,
} from "./alphabet";

describe("cursive alphabet", () => {
  it("maps every uppercase and lowercase Latin letter in both script styles", () => {
    for (const style of ["script", "bold-script"] as const) {
      for (const letterCase of ["upper", "lower"] as const) {
        const letters = cursiveLetters(style, letterCase);
        expect(letters).toHaveLength(26);
        expect(letters.every((letter) => letter.cursive !== letter.plain)).toBe(true);
        expect(new Set(letters.map((letter) => letter.cursive)).size).toBe(26);
      }
    }
  });

  it("joins a copyable A–Z line with spaces", () => {
    const line = cursiveAlphabetLine("script", "upper");
    expect(line.split(" ")).toHaveLength(26);
    expect(line.startsWith(cursiveLetters("script", "upper")[0]!.cursive)).toBe(true);
  });

  it("documents the mathematical script letters that use letterlike symbols", () => {
    const upper = cursiveLetters("script", "upper");
    const lower = cursiveLetters("script", "lower");
    for (const plain of SCRIPT_LETTERLIKE) {
      const found = [...upper, ...lower].find((letter) => letter.plain === plain);
      expect(found?.cursive).toBeTruthy();
      expect(found?.cursive).not.toBe(plain);
    }
  });
});
