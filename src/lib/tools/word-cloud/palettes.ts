import type { PaletteId } from "./types";

export interface Palette {
  id: PaletteId;
  name: string;
  colors: readonly string[];
}

/** Dark enough to stay readable on a white or paper background. */
export const PALETTES: readonly Palette[] = [
  {
    id: "editorial",
    name: "Editorial Teal",
    colors: ["#0e6b66", "#14532d", "#1e3a5f", "#0f4c5c", "#3f6212", "#134e4a"],
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    colors: ["#0c4a6e", "#075985", "#1d4ed8", "#155e75", "#1e3a8a", "#0f766e"],
  },
  {
    id: "forest",
    name: "Forest Green",
    colors: ["#14532d", "#166534", "#3f6212", "#365314", "#064e3b", "#1a2e05"],
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: ["#9a3412", "#9f1239", "#a16207", "#7c2d12", "#831843", "#b45309"],
  },
  {
    id: "pastel",
    name: "Pastel",
    colors: ["#9d174d", "#6d28d9", "#0369a1", "#0f766e", "#a16207", "#be185d"],
  },
  {
    id: "monochrome",
    name: "Monochrome",
    colors: ["#122033", "#1f2937", "#334155", "#0f172a", "#3f3f46", "#1e293b"],
  },
  {
    id: "vibrant",
    name: "Vibrant",
    colors: ["#0e6b66", "#b45309", "#9f1239", "#1d4ed8", "#6d28d9", "#166534"],
  },
] as const;

export const HIGHLIGHT_COLOR = "#9a3412";

export function paletteById(id: PaletteId): Palette {
  return PALETTES.find((palette) => palette.id === id) ?? PALETTES[0]!;
}

export function parseHexColor(value: string): string | null {
  const trimmed = value.trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(trimmed);
  if (!match?.[1]) return null;
  return `#${match[1].toLowerCase()}`;
}

export function relativeLuminance(hex: string): number | null {
  const parsed = parseHexColor(hex);
  if (!parsed) return null;
  const channels = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(parsed.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

export function contrastRatio(foreground: string, background: string): number | null {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  if (fg === null || bg === null) return null;
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

export function lowContrastColors(
  colors: readonly string[],
  background: string,
): string[] {
  return colors.filter((color) => {
    const ratio = contrastRatio(color, background);
    return ratio !== null && ratio < 3;
  });
}
