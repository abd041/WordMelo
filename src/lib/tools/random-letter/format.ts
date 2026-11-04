import type { OutputSeparator } from "./types";

export function formatLetters(
  letters: readonly string[],
  separator: OutputSeparator,
): string {
  switch (separator) {
    case "comma":
      return letters.join(", ");
    case "newline":
      return letters.join("\n");
    case "joined":
      return letters.join("");
    case "space":
    default:
      return letters.join(" ");
  }
}

export function separatorLabel(separator: OutputSeparator): string {
  switch (separator) {
    case "comma":
      return "Comma-separated";
    case "newline":
      return "One per line";
    case "joined":
      return "Joined sequence";
    case "space":
    default:
      return "Space-separated";
  }
}
