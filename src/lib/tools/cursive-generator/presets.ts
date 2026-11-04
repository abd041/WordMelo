import type {
  HandwritingAlign,
  HandwritingBackgroundId,
  HandwritingLayout,
} from "./render";

export interface HandwritingPreset {
  id: string;
  label: string;
  description: string;
  fontId: string;
  fontSize: number;
  color: string;
  backgroundId: HandwritingBackgroundId;
  align: HandwritingAlign;
  letterSpacing: number;
  lineHeight: number;
  padding: number;
  layout: HandwritingLayout;
}

/** Real setting bundles — not mockups. */
export const HANDWRITING_PRESETS: HandwritingPreset[] = [
  {
    id: "elegant-invitation",
    label: "Elegant Invitation",
    description: "Great Vibes on cream, formal centered lettering",
    fontId: "great-vibes",
    fontSize: 72,
    color: "#1a2b3c",
    backgroundId: "cream",
    align: "center",
    letterSpacing: 0,
    lineHeight: 1.4,
    padding: 64,
    layout: "landscape",
  },
  {
    id: "casual-handwriting",
    label: "Casual Handwriting",
    description: "Dancing Script on mint for everyday notes",
    fontId: "dancing-script",
    fontSize: 56,
    color: "#0f6b66",
    backgroundId: "mint",
    align: "left",
    letterSpacing: 0,
    lineHeight: 1.35,
    padding: 40,
    layout: "auto",
  },
  {
    id: "classic-lettering",
    label: "Classic Lettering",
    description: "Sacramento on white with balanced spacing",
    fontId: "sacramento",
    fontSize: 64,
    color: "#111111",
    backgroundId: "white",
    align: "center",
    letterSpacing: 1,
    lineHeight: 1.3,
    padding: 48,
    layout: "auto",
  },
  {
    id: "modern-script",
    label: "Modern Script",
    description: "Pacifico brush feel with transparent PNG export",
    fontId: "pacifico",
    fontSize: 60,
    color: "#0f6b66",
    backgroundId: "transparent",
    align: "center",
    letterSpacing: 0,
    lineHeight: 1.25,
    padding: 40,
    layout: "auto",
  },
  {
    id: "minimal-name",
    label: "Minimal Name Design",
    description: "Satisfy signature style for short names",
    fontId: "satisfy",
    fontSize: 68,
    color: "#1a2b3c",
    backgroundId: "white",
    align: "center",
    letterSpacing: 0,
    lineHeight: 1.2,
    padding: 56,
    layout: "square",
  },
];

export function getHandwritingPreset(
  id: string,
): HandwritingPreset | undefined {
  return HANDWRITING_PRESETS.find((preset) => preset.id === id);
}
