/**
 * Traditional Lorem Ipsum opening used in typesetting since the mid-20th century.
 * Derived from the public-domain Latin of Cicero, De Finibus Bonorum et Malorum
 * (45 BC), as rearranged in common printer’s dummy text. See DATA_SOURCES.md.
 */
export const CLASSIC_LOREM_PASSAGE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export const CLASSIC_LOREM_WORDS = CLASSIC_LOREM_PASSAGE.replace(
  /[.,]/g,
  "",
)
  .split(/\s+/)
  .filter(Boolean);

/** First words of the familiar opening, for short-output abbreviation checks. */
export const CLASSIC_OPENING_PHRASE = "Lorem ipsum dolor sit amet";
