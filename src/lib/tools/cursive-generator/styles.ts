import { SCRIPT, BOLD_SCRIPT } from "@/lib/tools/fancy-text/maps";
import {
  frameTransform,
  intersperse,
  mapWithDictionary,
} from "@/lib/tools/fancy-text/transform";

export type CursiveStyleGroup = "script" | "decorative" | "name";

export interface CursiveUnicodeStyle {
  id: string;
  name: string;
  group: CursiveStyleGroup;
  description: string;
  /** True only for genuine mathematical script alphabets */
  isMathematicalScript: boolean;
  transform: (text: string) => string;
}

function heartsWrap(text: string): string {
  return frameTransform(mapWithDictionary(text, SCRIPT), "♡ ", " ♡");
}

function starsWrap(text: string): string {
  return frameTransform(mapWithDictionary(text, SCRIPT), "✦ ", " ✦");
}

function underlineFlourish(text: string): string {
  const scripted = mapWithDictionary(text, SCRIPT);
  if (!scripted.trim()) return scripted;
  return scripted
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      return `${line}\n${"─".repeat(Math.min(24, Math.max(4, line.trim().length)))}`;
    })
    .join("\n");
}

function spacedScript(text: string): string {
  return intersperse(mapWithDictionary(text, SCRIPT), "\u2009");
}

/**
 * Focused cursive Unicode styles for the Cursive Generator.
 * Mathematical script maps are reused from Fancy Text — do not invent
 * duplicate alphabets by renaming identical outputs.
 */
export const CURSIVE_UNICODE_STYLES: CursiveUnicodeStyle[] = [
  {
    id: "script",
    name: "Mathematical Script",
    group: "script",
    description: "Unicode mathematical script (cursive letterforms)",
    isMathematicalScript: true,
    transform: (t) => mapWithDictionary(t, SCRIPT),
  },
  {
    id: "bold-script",
    name: "Bold Mathematical Script",
    group: "script",
    description: "Unicode mathematical bold script letters",
    isMathematicalScript: true,
    transform: (t) => mapWithDictionary(t, BOLD_SCRIPT),
  },
  {
    id: "script-spaced",
    name: "Airy Script",
    group: "decorative",
    description: "Script letters with light spacing between characters",
    isMathematicalScript: false,
    transform: spacedScript,
  },
  {
    id: "script-hearts",
    name: "Script with Hearts",
    group: "decorative",
    description: "Mathematical script wrapped with heart flourishes",
    isMathematicalScript: false,
    transform: heartsWrap,
  },
  {
    id: "script-stars",
    name: "Script with Stars",
    group: "decorative",
    description: "Mathematical script wrapped with star flourishes",
    isMathematicalScript: false,
    transform: starsWrap,
  },
  {
    id: "script-underline",
    name: "Script Underline",
    group: "name",
    description: "Script text with a simple underline flourish",
    isMathematicalScript: false,
    transform: underlineFlourish,
  },
  {
    id: "bold-script-hearts",
    name: "Bold Script Hearts",
    group: "name",
    description: "Bold script wrapped for name-style presentation",
    isMathematicalScript: false,
    transform: (t) => frameTransform(mapWithDictionary(t, BOLD_SCRIPT), "♡ ", " ♡"),
  },
];

export const CURSIVE_STYLE_GROUPS: {
  id: CursiveStyleGroup;
  label: string;
  blurb: string;
}[] = [
  {
    id: "script",
    label: "Unicode Cursive Alphabets",
    blurb: "Genuine mathematical script character maps",
  },
  {
    id: "decorative",
    label: "Decorative Cursive Designs",
    blurb: "Script plus flourishes — not separate fonts",
  },
  {
    id: "name",
    label: "Name Designs",
    blurb: "Layouts suited to short names",
  },
];

export const CURSIVE_SAMPLE_TEXT = "Make Your Words Beautiful";
export const CURSIVE_SAMPLE_NAME = "Alex Rivera";

export function getCursiveUnicodeStyle(
  id: string,
): CursiveUnicodeStyle | undefined {
  return CURSIVE_UNICODE_STYLES.find((style) => style.id === id);
}

export function getCursiveStylesByGroup(
  group: CursiveStyleGroup,
): CursiveUnicodeStyle[] {
  return CURSIVE_UNICODE_STYLES.filter((style) => style.group === group);
}

export function generateAllCursiveStyles(
  text: string,
): { id: string; name: string; group: CursiveStyleGroup; output: string }[] {
  return CURSIVE_UNICODE_STYLES.map((style) => ({
    id: style.id,
    name: style.name,
    group: style.group,
    output: style.transform(text),
  }));
}
