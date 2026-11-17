export {
  FANCY_STYLES,
  FANCY_STYLE_CATEGORIES,
  FEATURED_STYLE_IDS,
  findDuplicateStyleOutputs,
  generateAllFancyStyles,
  getFancyStyleById,
  getFancyStyleCount,
  getFeaturedStyleRank,
  sortFancyResults,
  type FancySortMode,
  type FancyStyle,
  type FancyStyleCategory,
  type FancyStyleResult,
} from "./styles";

export {
  applyCombiningMark,
  frameTransform,
  intersperse,
  mapWithDictionary,
  reverseGraphemes,
  upsideDownTransform,
} from "./transform";

export { fancyTextToPlain, getReverseLookupSize } from "./reverse";

export {
  DECORATION_CATEGORIES,
  FANCY_DECORATIONS,
  type FancyDecoration,
} from "./decorations";

export { splitGraphemes, isEmojiLikeCluster } from "./graphemes";

export {
  STYLE_SEARCH_ALIASES,
  filterFancyResults,
  styleMatchesQuery,
  type FancyCategoryFilter,
} from "./search";

export {
  NAME_FRAMES,
  PLATFORM_PREVIEWS,
  buildStyledName,
  nameSourceLine,
  renderPlatformPreview,
} from "./preview";
