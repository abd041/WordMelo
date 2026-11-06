/**
 * WordMelo Word Counter — counting rules
 *
 * These rules prioritize practical English writing workflows while remaining
 * transparent about linguistic ambiguity. Results are approximate for mixed
 * scripts, informal punctuation, and edge cases.
 *
 * Words
 * - Prefer Intl.Segmenter({ granularity: "word" }) when available.
 * - A segment counts as a word when isWordLike is true (letters/numbers).
 * - Contractions (don't) and hyphenated compounds (state-of-the-art) are
 *   typically one word when the segmenter treats them as word-like.
 * - Fallback: split on Unicode whitespace and strip surrounding punctuation.
 *
 * Characters
 * - charactersWithSpaces: UTF-16 string length of the full input (JS .length).
 * - charactersWithoutSpaces: code units remaining after removing whitespace.
 * - graphemeCount: user-perceived characters via Intl.Segmenter("grapheme")
 *   when available (including large inputs — no silent code-point substitution).
 *   Without Segmenter, countGraphemes falls back to code points; prefer
 *   tryCountGraphemes when the metric label must stay exact.
 *
 * Sentences
 * - Prefer Intl.Segmenter({ granularity: "sentence" }) when available.
 * - Fallback: split on ., !, ? followed by whitespace or end of string.
 * - Abbreviations (Dr., U.S.) may inflate sentence counts.
 *
 * Paragraphs
 * - Non-empty blocks separated by one or more blank lines (after normalizing
 *   CRLF/CR to LF). Leading/trailing empty lines are ignored.
 *
 * Reading / speaking time
 * - Reading: siteConfig.readingWordsPerMinute (default 238 WPM).
 * - Speaking: siteConfig.speakingWordsPerMinute (default 150 WPM).
 * - The editor can override those rates for the current session.
 * - Times round up to the nearest second. Short drafts stay in seconds.
 *
 * Keyword density
 * - Case-insensitive tokens from the same word list as the word count.
 * - Density = phrase count / number of unigrams, adjacent pairs, or triples.
 * - Optional stop-word exclusion hides function words but does not change
 *   the denominator, so percentages stay shares of the whole draft.
 *
 * Readability
 * - Flesch Reading Ease and Flesch–Kincaid Grade use estimated English syllables.
 * - Scores are withheld when the text is mostly non-Latin.
 *
 * Autosave
 * - Off until the user turns it on.
 * - The draft is stored only in localStorage on this browser.
 *
 * Page estimate
 * - words / wordsPerPageEstimate (default 250). Common double-spaced
 *   manuscript approximation — not a printer or page-layout guarantee.
 */

export const WORD_COUNTER_RULES_SUMMARY = [
  "Words use Intl.Segmenter when available, with a whitespace fallback.",
  "Character counts report JavaScript string length; grapheme count uses perceived characters.",
  "Sentence and word boundaries are approximate for mixed languages and abbreviations.",
  "Reading time assumes about 238 words per minute; speaking time assumes about 150. Both can be changed in the editor.",
  "Keyword density is a share of the words in this draft, not a ranking recommendation.",
  "Readability scores use English syllable estimates and are hidden for mostly non-Latin text.",
  "Autosave is off until you enable it. A saved draft stays in this browser only.",
  "Page estimates assume about 250 words per page and are optional guidance only.",
] as const;
