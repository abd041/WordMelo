/** Documented policies shown on the Case Converter page. */
export const CASE_CONVERTER_RULES = [
  "Casing uses the en-US locale (US English) via JavaScript locale string methods.",
  "Ordinary text modes (upper, lower, sentence, title, capitalize, alternating, inverse) preserve spaces, tabs, and line breaks.",
  "Programming modes (camelCase, PascalCase, snake_case, kebab-case) intentionally rewrite whitespace and separators into identifier tokens.",
  "Sentence case lowercases the input first, then capitalizes letters after `!`, `?`, newlines, or periods that are not in a short abbreviation list (Mr., Dr., etc.). Unusual abbreviations can still create false sentence starts.",
  "Title Case follows a WordMelo general policy: capitalize major words and hyphen segments; keep a short list of small words lowercase unless first or last. It is not AP, APA, or Chicago Style.",
  "Alternating case toggles only on letters, starting with lowercase; punctuation and digits do not shift the alternation.",
  "Caseless scripts (for example many Arabic or Devanagari letters) are left unchanged by inverse/alternating where no upper/lower pair exists.",
  "Emoji, ZWJ sequences, and combining marks are preserved as written; conversion never strips them.",
] as const;
