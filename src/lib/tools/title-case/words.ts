/** Shared lexical sets for English title capitalization (US). */

export const ARTICLES = new Set(["a", "an", "the"]);

/** Coordinating conjunctions commonly lowercased in titles. */
export const COORDINATING_CONJUNCTIONS = new Set([
  "and",
  "but",
  "or",
  "nor",
  "for",
  "so",
  "yet",
]);

/**
 * APA 7 short conjunctions (≤3 letters) listed on apastyle.apa.org.
 * Includes “as” and “if” which APA treats as short conjunctions.
 */
export const APA_SHORT_CONJUNCTIONS = new Set([
  "and",
  "as",
  "but",
  "for",
  "if",
  "nor",
  "or",
  "so",
  "yet",
]);

/**
 * APA 7 short prepositions (≤3 letters) listed on apastyle.apa.org.
 */
export const APA_SHORT_PREPOSITIONS = new Set([
  "as",
  "at",
  "by",
  "for",
  "in",
  "of",
  "off",
  "on",
  "per",
  "to",
  "up",
  "via",
]);

/**
 * Broad English preposition set for MLA (any length) and Chicago length rules.
 * Multiword prepositions are handled token-by-token (“according”, “to”).
 */
export const PREPOSITIONS = new Set([
  "aboard",
  "about",
  "above",
  "across",
  "after",
  "against",
  "along",
  "amid",
  "among",
  "anti",
  "around",
  "as",
  "at",
  "before",
  "behind",
  "below",
  "beneath",
  "beside",
  "besides",
  "between",
  "beyond",
  "but",
  "by",
  "concerning",
  "considering",
  "despite",
  "down",
  "during",
  "except",
  "excluding",
  "following",
  "for",
  "from",
  "in",
  "inside",
  "into",
  "like",
  "minus",
  "near",
  "of",
  "off",
  "on",
  "onto",
  "opposite",
  "outside",
  "over",
  "past",
  "per",
  "plus",
  "regarding",
  "round",
  "save",
  "since",
  "than",
  "through",
  "throughout",
  "to",
  "toward",
  "towards",
  "under",
  "underneath",
  "unlike",
  "until",
  "up",
  "upon",
  "versus",
  "via",
  "with",
  "within",
  "without",
]);

/**
 * Clear subordinating conjunctions capitalized under MLA principal-word rules.
 * Ambiguous prep/subordinator overlaps are documented in RULES_AND_SOURCES.md.
 */
export const MLA_SUBORDINATING_CONJUNCTIONS = new Set([
  "although",
  "because",
  "if",
  "once",
  "than",
  "that",
  "though",
  "unless",
  "whether",
  "while",
  "when",
  "where",
]);

/** WordMelo general title-case small words. */
export const GENERAL_SMALL_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "nor",
  "for",
  "so",
  "yet",
  "as",
  "at",
  "by",
  "in",
  "of",
  "on",
  "to",
  "up",
  "via",
  "per",
  "if",
  "off",
  "with",
]);

/** Common prefixes for Chicago-style hyphenated compounds. */
export const HYPHEN_PREFIXES = new Set([
  "anti",
  "co",
  "ex",
  "inter",
  "mid",
  "non",
  "over",
  "post",
  "pre",
  "pro",
  "re",
  "self",
  "semi",
  "sub",
  "super",
  "trans",
  "un",
  "under",
]);

/** Well-known initialisms preserved when acronym mode is on. */
export const KNOWN_ACRONYMS = new Set([
  "ai",
  "api",
  "css",
  "html",
  "http",
  "https",
  "id",
  "ip",
  "json",
  "nasa",
  "pdf",
  "seo",
  "sql",
  "tv",
  "ui",
  "url",
  "usa",
  "usb",
  "ux",
  "xml",
]);
