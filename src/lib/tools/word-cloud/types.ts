export const CLOUD_SHAPES = [
  "rectangle",
  "circle",
  "heart",
  "diamond",
  "oval",
] as const;

export type CloudShape = (typeof CLOUD_SHAPES)[number];

export const CLOUD_ASPECTS = [
  "square",
  "landscape",
  "presentation",
  "portrait",
  "pinterest",
] as const;

export type CloudAspect = (typeof CLOUD_ASPECTS)[number];

export const CLOUD_FONTS = ["sans", "display", "serif"] as const;

export type CloudFont = (typeof CLOUD_FONTS)[number];

export const CLOUD_ROTATIONS = ["horizontal", "mixed", "slight"] as const;

export type CloudRotation = (typeof CLOUD_ROTATIONS)[number];

export const CLOUD_ALIGNS = ["center", "top", "left"] as const;

export type CloudAlign = (typeof CLOUD_ALIGNS)[number];

export const PALETTE_IDS = [
  "editorial",
  "ocean",
  "forest",
  "sunset",
  "pastel",
  "monochrome",
  "vibrant",
] as const;

export type PaletteId = (typeof PALETTE_IDS)[number];

export interface RankedWord {
  text: string;
  count: number;
  highlighted: boolean;
}

export interface CloudSettings {
  ignoreCase: boolean;
  excludeCommon: boolean;
  minLength: number;
  minFrequency: number;
  maxWords: number;
  excludedWords: string;
  highlightedWords: string;
  shape: CloudShape;
  aspect: CloudAspect;
  font: CloudFont;
  minFont: number;
  maxFont: number;
  fontWeight: 400 | 600 | 700;
  rotation: CloudRotation;
  spacing: number;
  align: CloudAlign;
  palette: PaletteId;
  randomizeColors: boolean;
  background: string;
  transparent: boolean;
  /** When set, every non-highlighted word uses this color. */
  customColor: string | null;
}

export interface PlacedWord {
  text: string;
  count: number;
  highlighted: boolean;
  /** Center x in layout coordinates. */
  x: number;
  /** Center y in layout coordinates. */
  y: number;
  fontSize: number;
  rotation: number;
  /** Unrotated glyph width. */
  width: number;
  /** Unrotated glyph height. */
  height: number;
  colorIndex: number;
}

export interface OmittedWord {
  text: string;
  count: number;
}

export interface LayoutResult {
  width: number;
  height: number;
  words: PlacedWord[];
  omitted: OmittedWord[];
  scaled: boolean;
  seed: number;
}
