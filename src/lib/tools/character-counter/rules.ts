/**
 * WordMelo Character Counter — counting definitions
 *
 * Characters with spaces
 * - UTF-16 code units of the full string (JavaScript `String.length`).
 * - Matches the Word Counter “characters” metric for consistency.
 *
 * Characters without spaces / whitespace
 * - Removes all Unicode whitespace matching `\s` (spaces, tabs, newlines, etc.),
 *   not only U+0020, then counts remaining UTF-16 units.
 *
 * Letters
 * - Unicode letter code points matching `\p{L}`.
 * - Combining marks (`\p{M}`) are not counted as letters.
 *
 * Digits
 * - Unicode decimal digits matching `\p{Nd}` (includes non-ASCII digits).
 *
 * Words / sentences / paragraphs
 * - Shared with Word Counter (`Intl.Segmenter` when available).
 *
 * Lines
 * - CRLF/CR normalized to LF, then `split("\n").length`.
 * - Empty input → 0. A trailing newline adds an extra line.
 *
 * Visible characters (grapheme clusters)
 * - Always `Intl.Segmenter({ granularity: "grapheme" })` when available,
 *   including large pastes — never silently replaced with code-point counts.
 * - If Segmenter is unavailable, grapheme stats report unavailable (null),
 *   while code-point and UTF-16 metrics remain available.
 *
 * Code points
 * - Number of Unicode scalar values (`Array.from(text).length`).
 *
 * UTF-16 code units
 * - JavaScript string length (surrogate pairs = 2 units).
 *
 * UTF-8 bytes
 * - `TextEncoder` byte length of the UTF-8 encoding.
 *
 * Punctuation / symbols
 * - `\p{P}` and `\p{S}` respectively. Categories do not necessarily sum to
 *   grapheme or code-point totals.
 *
 * Limit checker
 * - Users choose graphemes, code points, or UTF-16 as the limit metric.
 * - Remaining never displays as a negative number; overflow uses “over limit”.
 * - Generic presets only — not platform publishing guarantees.
 */

export const CHARACTER_COUNTER_RULES_SUMMARY = [
  "Characters with/without spaces use UTF-16 units; without spaces removes all Unicode whitespace.",
  "Letters use Unicode letter properties; digits use Unicode decimal digits.",
  "Visible graphemes always use Intl.Segmenter when available — never a silent code-point substitute.",
  "UTF-8 bytes use TextEncoder and are not the same as character counts.",
  "Limit presets are generic drafting lengths — not platform publishing guarantees.",
] as const;

export const TXT_FILENAME = "WordMelo-character-counter.txt";

/** Sample demonstrates letters, digits, punctuation, spaces, breaks, emoji, combining mark. */
export const SAMPLE_TEXT =
  "Draft locally with WordMelo.\n\nLetters, digits (42), punctuation — and emoji ✅.\nCafé via combining: cafe\u0301";
