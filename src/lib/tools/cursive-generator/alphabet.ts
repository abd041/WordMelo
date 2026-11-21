import { BOLD_SCRIPT, SCRIPT } from "@/lib/tools/fancy-text/maps";

export const ALPHABET_STYLES = ["script", "bold-script"] as const;
export type AlphabetStyleId = (typeof ALPHABET_STYLES)[number];

export interface CursiveLetter {
  plain: string;
  cursive: string;
}

const MAPS: Record<AlphabetStyleId, Record<string, string>> = {
  script: SCRIPT,
  "bold-script": BOLD_SCRIPT,
};

function letters(start: number, style: AlphabetStyleId): CursiveLetter[] {
  const map = MAPS[style];
  return Array.from({ length: 26 }, (_, index) => {
    const plain = String.fromCharCode(start + index);
    return { plain, cursive: map[plain] ?? plain };
  });
}

export function cursiveLetters(
  style: AlphabetStyleId,
  letterCase: "upper" | "lower",
): CursiveLetter[] {
  return letters(letterCase === "upper" ? 65 : 97, style);
}

export function cursiveAlphabetLine(
  style: AlphabetStyleId,
  letterCase: "upper" | "lower",
): string {
  return cursiveLetters(style, letterCase)
    .map((letter) => letter.cursive)
    .join(" ");
}

export const SCRIPT_LETTERLIKE = ["B", "E", "F", "H", "I", "L", "M", "R", "e", "g", "o"] as const;
