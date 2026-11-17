import type { CloudFont } from "./types";

export interface FontPreset {
  id: CloudFont;
  label: string;
  /** Used in the on-page SVG so next/font variables apply. */
  previewFamily: string;
  /** Downloaded SVG stack. The webfont is not embedded. */
  exportFamily: string;
  widthFactor: number;
}

export const FONT_PRESETS: Record<CloudFont, FontPreset> = {
  sans: {
    id: "sans",
    label: "DM Sans",
    previewFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    exportFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif",
    widthFactor: 0.56,
  },
  display: {
    id: "display",
    label: "Fraunces",
    previewFamily: "var(--font-display), Georgia, serif",
    exportFamily: "Fraunces, Georgia, serif",
    widthFactor: 0.54,
  },
  serif: {
    id: "serif",
    label: "Source Serif",
    previewFamily: "var(--font-serif), Georgia, serif",
    exportFamily: "Source Serif 4, Georgia, serif",
    widthFactor: 0.5,
  },
};

export function weightWidthScale(weight: number): number {
  if (weight >= 700) return 1.06;
  if (weight >= 600) return 1.03;
  return 1;
}

/** Fraunces is loaded at 600 and 700 only. */
export function effectiveFontWeight(font: CloudFont, weight: 400 | 600 | 700): 400 | 600 | 700 {
  if (font === "display" && weight < 600) return 600;
  return weight;
}
