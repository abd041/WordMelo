import type { GenerateOptions, GenerationMode, ParagraphLength } from "./types";

export type PresetGroup = "lorem" | "ui";

export interface LoremPreset {
  id: string;
  label: string;
  description: string;
  group: PresetGroup;
  options: GenerateOptions;
}

export const LOREM_PRESETS: LoremPreset[] = [
  {
    id: "classic",
    label: "Classic Lorem Ipsum",
    description: "Three medium paragraphs with the traditional opening.",
    group: "lorem",
    options: {
      mode: "paragraphs",
      quantity: 3,
      paragraphLength: "medium",
      classicOpening: true,
      textKind: "lorem",
    },
  },
  {
    id: "short",
    label: "Short Placeholder",
    description: "Forty words for compact layout blocks.",
    group: "lorem",
    options: {
      mode: "words",
      quantity: 40,
      classicOpening: true,
      textKind: "lorem",
    },
  },
  {
    id: "website",
    label: "Website Paragraphs",
    description: "Five medium paragraphs for page mockups.",
    group: "lorem",
    options: {
      mode: "paragraphs",
      quantity: 5,
      paragraphLength: "medium",
      classicOpening: true,
      textKind: "lorem",
    },
  },
  {
    id: "article",
    label: "Article Layout",
    description: "Eight longer paragraphs for editorial prototypes.",
    group: "lorem",
    options: {
      mode: "paragraphs",
      quantity: 8,
      paragraphLength: "long",
      classicOpening: true,
      textKind: "lorem",
    },
  },
  {
    id: "landing-hero",
    label: "Landing Hero",
    description: "Two short paragraphs for hero supporting copy.",
    group: "lorem",
    options: {
      mode: "paragraphs",
      quantity: 2,
      paragraphLength: "short",
      classicOpening: true,
      textKind: "lorem",
    },
  },
  {
    id: "ui-card",
    label: "Product Card",
    description: "Twenty-five Lorem words for card bodies.",
    group: "lorem",
    options: {
      mode: "words",
      quantity: 25,
      classicOpening: false,
      textKind: "lorem",
    },
  },
  {
    id: "button-labels",
    label: "Button Labels",
    description: "Plain English UI labels — not Lorem Ipsum.",
    group: "ui",
    options: {
      mode: "words",
      quantity: 12,
      classicOpening: false,
      textKind: "ui-english",
    },
  },
  {
    id: "form-descriptions",
    label: "Form Descriptions",
    description: "English helper sentences for prototype forms.",
    group: "ui",
    options: {
      mode: "sentences",
      quantity: 4,
      classicOpening: false,
      textKind: "ui-english",
    },
  },
  {
    id: "ui-short",
    label: "Short UI Placeholder",
    description: "Two English form phrases for compact UI copy.",
    group: "ui",
    options: {
      mode: "sentences",
      quantity: 2,
      classicOpening: false,
      textKind: "ui-english",
    },
  },
];

export function getPreset(id: string): LoremPreset | undefined {
  return LOREM_PRESETS.find((p) => p.id === id);
}

export function presetsByGroup(group: PresetGroup): LoremPreset[] {
  return LOREM_PRESETS.filter((p) => p.group === group);
}

export type { GenerationMode, ParagraphLength };
