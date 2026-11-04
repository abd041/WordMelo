import * as maps from "./maps";
import {
  combiningDotBelow,
  combiningDoubleUnderline,
  combiningOverline,
  combiningSlash,
  combiningStrikethrough,
  combiningUnderline,
  frameTransform,
  intersperse,
  mapWithDictionary,
  reverseGraphemes,
  upsideDownTransform,
  vaporwaveTransform,
} from "./transform";

export type FancyStyleCategory =
  | "math"
  | "script"
  | "symbols"
  | "combining"
  | "classic"
  | "flip"
  | "frames";

export interface FancyStyle {
  id: string;
  name: string;
  category: FancyStyleCategory;
  description: string;
  /** Keywords for in-tool search */
  keywords: string[];
  transform: (text: string) => string;
}

export const FANCY_STYLE_CATEGORIES: {
  id: FancyStyleCategory;
  label: string;
}[] = [
  { id: "math", label: "Math & bold" },
  { id: "script", label: "Script & gothic" },
  { id: "symbols", label: "Circled & squares" },
  { id: "combining", label: "Lines & marks" },
  { id: "classic", label: "Classic Unicode" },
  { id: "flip", label: "Flip & mirror" },
  { id: "frames", label: "Frames" },
];

/**
 * Canonical fancy text styles. Each must produce a genuinely distinct
 * transformation for typical Latin input where mappings exist.
 */
export const FANCY_STYLES: FancyStyle[] = [
  {
    id: "bold-serif",
    name: "Bold serif",
    category: "math",
    description: "Mathematical bold serif letters and digits",
    keywords: ["bold", "serif", "heavy"],
    transform: (t) => mapWithDictionary(t, maps.BOLD_SERIF),
  },
  {
    id: "bold-sans",
    name: "Bold sans-serif",
    category: "math",
    description: "Mathematical bold sans-serif letters and digits",
    keywords: ["bold", "sans", "sans-serif"],
    transform: (t) => mapWithDictionary(t, maps.BOLD_SANS),
  },
  {
    id: "italic",
    name: "Italic",
    category: "math",
    description: "Mathematical italic letters",
    keywords: ["italic", "oblique", "slanted"],
    transform: (t) => mapWithDictionary(t, maps.ITALIC),
  },
  {
    id: "bold-italic",
    name: "Bold italic",
    category: "math",
    description: "Mathematical bold italic letters",
    keywords: ["bold", "italic"],
    transform: (t) => mapWithDictionary(t, maps.BOLD_ITALIC),
  },
  {
    id: "sans",
    name: "Sans-serif",
    category: "math",
    description: "Mathematical sans-serif letters",
    keywords: ["sans", "clean"],
    transform: (t) => mapWithDictionary(t, maps.SANS),
  },
  {
    id: "sans-italic",
    name: "Sans italic",
    category: "math",
    description: "Mathematical sans-serif italic letters",
    keywords: ["sans", "italic"],
    transform: (t) => mapWithDictionary(t, maps.SANS_ITALIC),
  },
  {
    id: "sans-bold-italic",
    name: "Sans bold italic",
    category: "math",
    description: "Mathematical sans-serif bold italic letters",
    keywords: ["sans", "bold", "italic"],
    transform: (t) => mapWithDictionary(t, maps.SANS_BOLD_ITALIC),
  },
  {
    id: "script",
    name: "Script",
    category: "script",
    description: "Cursive-style mathematical script letters",
    keywords: ["script", "cursive", "handwriting"],
    transform: (t) => mapWithDictionary(t, maps.SCRIPT),
  },
  {
    id: "bold-script",
    name: "Bold script",
    category: "script",
    description: "Bold cursive-style mathematical script",
    keywords: ["script", "cursive", "bold"],
    transform: (t) => mapWithDictionary(t, maps.BOLD_SCRIPT),
  },
  {
    id: "fraktur",
    name: "Gothic / Fraktur",
    category: "script",
    description: "Fraktur (blackletter) mathematical letters",
    keywords: ["gothic", "fraktur", "medieval", "blackletter"],
    transform: (t) => mapWithDictionary(t, maps.FRAKTUR),
  },
  {
    id: "bold-fraktur",
    name: "Bold Fraktur",
    category: "script",
    description: "Bold Fraktur mathematical letters",
    keywords: ["gothic", "fraktur", "bold"],
    transform: (t) => mapWithDictionary(t, maps.BOLD_FRAKTUR),
  },
  {
    id: "double-struck",
    name: "Double-struck",
    category: "math",
    description: "Double-struck (blackboard bold) letters and digits",
    keywords: ["double", "blackboard", "outline"],
    transform: (t) => mapWithDictionary(t, maps.DOUBLE_STRUCK),
  },
  {
    id: "monospace",
    name: "Monospace",
    category: "classic",
    description: "Mathematical monospace letters and digits",
    keywords: ["mono", "code", "typewriter"],
    transform: (t) => mapWithDictionary(t, maps.MONOSPACE),
  },
  {
    id: "fullwidth",
    name: "Fullwidth",
    category: "classic",
    description: "Fullwidth Latin letters, digits, and punctuation",
    keywords: ["wide", "fullwidth", "aesthetic", "vaporwave"],
    transform: (t) => mapWithDictionary(t, maps.FULLWIDTH),
  },
  {
    id: "small-caps",
    name: "Small caps",
    category: "classic",
    description: "Small-capital phonetic letter forms",
    keywords: ["small caps", "petite", "tiny"],
    transform: (t) => mapWithDictionary(t, maps.SMALL_CAPS),
  },
  {
    id: "circled",
    name: "Circled",
    category: "symbols",
    description: "Circled Latin letters and digits",
    keywords: ["circle", "bubble", "round"],
    transform: (t) => mapWithDictionary(t, maps.CIRCLED),
  },
  {
    id: "bubble",
    name: "Bubble (negative circled)",
    category: "symbols",
    description: "Filled circled (bubble) letter forms",
    keywords: ["bubble", "filled", "negative circled"],
    transform: (t) => mapWithDictionary(t, maps.NEGATIVE_CIRCLED),
  },
  {
    id: "squared",
    name: "Squared",
    category: "symbols",
    description: "Squared Latin letter forms",
    keywords: ["square", "box"],
    transform: (t) => mapWithDictionary(t, maps.SQUARED),
  },
  {
    id: "negative-squared",
    name: "Negative squared",
    category: "symbols",
    description: "Filled squared Latin letter forms",
    keywords: ["square", "filled", "negative"],
    transform: (t) => mapWithDictionary(t, maps.NEGATIVE_SQUARED),
  },
  {
    id: "parenthesized",
    name: "Parenthesized",
    category: "symbols",
    description: "Parenthesized Latin letters and digits",
    keywords: ["parentheses", "brackets"],
    transform: (t) => mapWithDictionary(t, maps.PARENTHESIZED),
  },
  {
    id: "underlined",
    name: "Underlined",
    category: "combining",
    description: "Combining underline beneath each character",
    keywords: ["underline", "underscore"],
    transform: combiningUnderline,
  },
  {
    id: "double-underlined",
    name: "Double underlined",
    category: "combining",
    description: "Combining double underline",
    keywords: ["underline", "double"],
    transform: combiningDoubleUnderline,
  },
  {
    id: "strikethrough",
    name: "Strikethrough",
    category: "combining",
    description: "Combining long stroke through each character",
    keywords: ["strike", "cross out"],
    transform: combiningStrikethrough,
  },
  {
    id: "overlined",
    name: "Overlined",
    category: "combining",
    description: "Combining overline above each character",
    keywords: ["overline", "bar"],
    transform: combiningOverline,
  },
  {
    id: "slash-through",
    name: "Slash-through",
    category: "combining",
    description: "Combining short solidus overlay",
    keywords: ["slash", "stroke"],
    transform: combiningSlash,
  },
  {
    id: "dotted",
    name: "Dotted below",
    category: "combining",
    description: "Combining dot below each character",
    keywords: ["dot", "dotted"],
    transform: combiningDotBelow,
  },
  {
    id: "superscript",
    name: "Superscript",
    category: "classic",
    description: "Superscript letter and digit forms where available",
    keywords: ["super", "raised", "tiny"],
    transform: (t) => mapWithDictionary(t, maps.SUPERSCRIPT),
  },
  {
    id: "subscript",
    name: "Subscript",
    category: "classic",
    description: "Subscript letter and digit forms where available",
    keywords: ["sub", "lower"],
    transform: (t) => mapWithDictionary(t, maps.SUBSCRIPT),
  },
  {
    id: "upside-down",
    name: "Upside-down",
    category: "flip",
    description: "Flipped characters in reversed order",
    keywords: ["flip", "upside", "invert"],
    transform: (t) => upsideDownTransform(t, maps.UPSIDE_DOWN),
  },
  {
    id: "reversed",
    name: "Reversed",
    category: "flip",
    description: "Grapheme order reversed without flipping glyphs",
    keywords: ["reverse", "mirror", "backwards"],
    transform: reverseGraphemes,
  },
  {
    id: "vaporwave",
    name: "Vaporwave",
    category: "classic",
    description: "Fullwidth characters with thin spacing",
    keywords: ["vaporwave", "aesthetic", "wide", "cool"],
    transform: (t) => vaporwaveTransform(t, maps.FULLWIDTH),
  },
  {
    id: "spaced",
    name: "Aesthetic spaced",
    category: "classic",
    description: "Extra space between letters",
    keywords: ["spaced", "aesthetic", "air"],
    transform: (t) => intersperse(t, " "),
  },
  {
    id: "dotted-sep",
    name: "Dot separated",
    category: "classic",
    description: "Middle dots between letters",
    keywords: ["dot", "separator", "cool"],
    transform: (t) => intersperse(t, "·"),
  },
  {
    id: "frame-lenticular",
    name: "Lenticular frame",
    category: "frames",
    description: "Wrapped with 【 】 brackets",
    keywords: ["frame", "brackets", "decorative"],
    transform: (t) => frameTransform(t, "【", "】"),
  },
  {
    id: "frame-corner",
    name: "Corner frame",
    category: "frames",
    description: "Wrapped with 「 」 brackets",
    keywords: ["frame", "corner", "quote"],
    transform: (t) => frameTransform(t, "「", "」"),
  },
  {
    id: "frame-white",
    name: "White corner frame",
    category: "frames",
    description: "Wrapped with 『 』 brackets",
    keywords: ["frame", "double", "quote"],
    transform: (t) => frameTransform(t, "『", "』"),
  },
  {
    id: "frame-stars",
    name: "Star frame",
    category: "frames",
    description: "Wrapped with ★ markers",
    keywords: ["frame", "star", "decorative"],
    transform: (t) => frameTransform(t, "★ ", " ★"),
  },
  {
    id: "frame-hearts",
    name: "Heart frame",
    category: "frames",
    description: "Wrapped with ♥ markers",
    keywords: ["frame", "heart", "cute"],
    transform: (t) => frameTransform(t, "♥ ", " ♥"),
  },
  {
    id: "frame-waves",
    name: "Wave frame",
    category: "frames",
    description: "Wrapped with ～ markers",
    keywords: ["frame", "wave", "tilde"],
    transform: (t) => frameTransform(t, "～ ", " ～"),
  },
  {
    id: "frame-double-bracket",
    name: "Double bracket frame",
    category: "frames",
    description: "Wrapped with ⟦ ⟧ brackets",
    keywords: ["frame", "math", "brackets"],
    transform: (t) => frameTransform(t, "⟦", "⟧"),
  },
  {
    id: "frame-sparkle",
    name: "Sparkle frame",
    category: "frames",
    description: "Wrapped with ✦ markers",
    keywords: ["frame", "sparkle", "decorative"],
    transform: (t) => frameTransform(t, "✦ ", " ✦"),
  },
  {
    id: "frame-flowers",
    name: "Flower frame",
    category: "frames",
    description: "Wrapped with ✿ markers",
    keywords: ["frame", "flower", "decorative"],
    transform: (t) => frameTransform(t, "✿ ", " ✿"),
  },
];

export function getFancyStyleById(id: string): FancyStyle | undefined {
  return FANCY_STYLES.find((style) => style.id === id);
}

export function getFancyStyleCount(): number {
  return FANCY_STYLES.length;
}

/** Curated first-paint order — genuinely distinct showcase styles. */
export const FEATURED_STYLE_IDS: readonly string[] = [
  "bold-serif",
  "bold-sans",
  "italic",
  "script",
  "fraktur",
  "double-struck",
  "monospace",
  "circled",
  "fullwidth",
  "small-caps",
  "frame-stars",
] as const;

export type FancySortMode = "featured" | "alphabetical" | "recent";

export function getFeaturedStyleRank(styleId: string): number {
  const index = FEATURED_STYLE_IDS.indexOf(styleId);
  return index === -1 ? FEATURED_STYLE_IDS.length + 1 : index;
}

export function sortFancyResults(
  results: FancyStyleResult[],
  mode: FancySortMode,
  recentIds: string[] = [],
): FancyStyleResult[] {
  const copy = [...results];
  if (mode === "alphabetical") {
    copy.sort((a, b) => a.style.name.localeCompare(b.style.name, "en"));
    return copy;
  }
  if (mode === "recent") {
    const rank = new Map(recentIds.map((id, index) => [id, index]));
    copy.sort((a, b) => {
      const ar = rank.has(a.style.id)
        ? rank.get(a.style.id)!
        : Number.MAX_SAFE_INTEGER;
      const br = rank.has(b.style.id)
        ? rank.get(b.style.id)!
        : Number.MAX_SAFE_INTEGER;
      if (ar !== br) return ar - br;
      return getFeaturedStyleRank(a.style.id) - getFeaturedStyleRank(b.style.id);
    });
    return copy;
  }
  // featured default
  copy.sort(
    (a, b) =>
      getFeaturedStyleRank(a.style.id) - getFeaturedStyleRank(b.style.id),
  );
  return copy;
}

export interface FancyStyleResult {
  style: FancyStyle;
  output: string;
}

/** Apply every style to input text (pure, deterministic). */
export function generateAllFancyStyles(text: string): FancyStyleResult[] {
  return FANCY_STYLES.map((style) => ({
    style,
    output: style.transform(text),
  }));
}

/**
 * Detect styles that produce identical output for a given sample.
 * Used in tests to prevent duplicate “fake” styles.
 */
export function findDuplicateStyleOutputs(
  sample: string,
): Array<{ ids: string[]; output: string }> {
  const groups = new Map<string, string[]>();
  for (const style of FANCY_STYLES) {
    const output = style.transform(sample);
    const list = groups.get(output) ?? [];
    list.push(style.id);
    groups.set(output, list);
  }
  return Array.from(groups.entries())
    .filter(([, ids]) => ids.length > 1)
    .map(([output, ids]) => ({ ids, output }));
}
