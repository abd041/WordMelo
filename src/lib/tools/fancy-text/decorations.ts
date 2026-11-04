/**
 * Optional decorative symbols and frames.
 * These are not counted as Unicode alphabet “font” styles.
 */

export type DecorationCategory =
  | "hearts"
  | "stars"
  | "arrows"
  | "dividers"
  | "brackets"
  | "frames";

export interface FancyDecoration {
  id: string;
  label: string;
  category: DecorationCategory;
  /** Apply around current text; use {text} placeholder */
  wrap: (text: string) => string;
  /** Standalone snippet when input is empty */
  sample: string;
}

function wrapEnds(left: string, right: string) {
  return (text: string) => {
    const core = text.trim().length > 0 ? text : "text";
    return `${left}${core}${right}`;
  };
}

export const FANCY_DECORATIONS: FancyDecoration[] = [
  {
    id: "hearts-pair",
    label: "Hearts",
    category: "hearts",
    wrap: wrapEnds("♥ ", " ♥"),
    sample: "♥ ♥ ♥",
  },
  {
    id: "hearts-line",
    label: "Heart divider",
    category: "hearts",
    wrap: () => "♡ ‧₊˚ ♡ ‧₊˚ ♡",
    sample: "♡ ‧₊˚ ♡ ‧₊˚ ♡",
  },
  {
    id: "stars-pair",
    label: "Stars",
    category: "stars",
    wrap: wrapEnds("★ ", " ★"),
    sample: "★ ★ ★",
  },
  {
    id: "sparkles-pair",
    label: "Sparkles",
    category: "stars",
    wrap: wrapEnds("✦ ", " ✦"),
    sample: "✦ · ✦ · ✦",
  },
  {
    id: "arrows-pair",
    label: "Arrows",
    category: "arrows",
    wrap: wrapEnds("⟶ ", " ⟵"),
    sample: "→ ← ↔ ⇒",
  },
  {
    id: "arrow-bullet",
    label: "Arrow lead-in",
    category: "arrows",
    wrap: (text) => `➜ ${text.trim() || "text"}`,
    sample: "➜",
  },
  {
    id: "divider-minimal",
    label: "Minimal divider",
    category: "dividers",
    wrap: () => "— · — · —",
    sample: "— · — · —",
  },
  {
    id: "divider-wave",
    label: "Wave divider",
    category: "dividers",
    wrap: () => "〜 〜 〜",
    sample: "〜 〜 〜",
  },
  {
    id: "brackets-square",
    label: "Square brackets",
    category: "brackets",
    wrap: wrapEnds("【", "】"),
    sample: "【 】",
  },
  {
    id: "brackets-corner",
    label: "Corner brackets",
    category: "brackets",
    wrap: wrapEnds("「", "」"),
    sample: "「 」",
  },
  {
    id: "frame-double",
    label: "Double frame",
    category: "frames",
    wrap: wrapEnds("『", "』"),
    sample: "『 』",
  },
  {
    id: "frame-math",
    label: "Math brackets",
    category: "frames",
    wrap: wrapEnds("⟦", "⟧"),
    sample: "⟦ ⟧",
  },
];

export const DECORATION_CATEGORIES: {
  id: DecorationCategory;
  label: string;
}[] = [
  { id: "hearts", label: "Hearts" },
  { id: "stars", label: "Stars" },
  { id: "arrows", label: "Arrows" },
  { id: "dividers", label: "Dividers" },
  { id: "brackets", label: "Brackets" },
  { id: "frames", label: "Frames" },
];
